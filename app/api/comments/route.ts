// app/api/comments/route.ts — Commentaires 1001 Widgets
// GET  ?widgetSlug=xxx → commentaires approuvés (Notion)
// POST { widgetSlug, prenom, message, honeypot } → création status="pending"
//
// Sécurité : honeypot, validation longueurs, sanitize htmlspecialchars,
// rate limit 3/IP/heure (IP hashée SHA-256). Logique métier déléguée à lib/.

import { NextResponse } from 'next/server'

import { getComments, createComment } from '@/lib/notion'
import {
  extractIp,
  hashIp,
  validateComment,
  sanitizeComment,
} from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Comment, CommentInput, ApiResponse } from '@/lib/types'

// ─── Helpers de lecture body (zéro any) ────────────────────────────────────────

async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json()
    if (body !== null && typeof body === 'object') {
      return body as Record<string, unknown>
    }
  } catch {
    // body absent ou JSON invalide → objet vide
  }
  return {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function json<T>(payload: ApiResponse<T>, status: number): NextResponse {
  return NextResponse.json(payload, { status })
}

// ─── GET — commentaires approuvés d'un widget ──────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const widgetSlug = new URL(request.url).searchParams.get('widgetSlug')?.trim() ?? ''

  if (!widgetSlug) {
    return json<Comment[]>({ data: null, error: 'widgetSlug requis.' }, 400)
  }

  try {
    const comments = await getComments(widgetSlug)
    return json<Comment[]>({ data: comments, error: null }, 200)
  } catch {
    return json<Comment[]>({ data: null, error: 'Erreur de récupération des commentaires.' }, 502)
  }
}

// ─── POST — création d'un commentaire (status pending) ──────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonObject(request)

  const input: CommentInput = {
    widgetSlug: asString(body['widgetSlug']).trim(),
    prenom:     asString(body['prenom']),
    message:    asString(body['message']),
    honeypot:   asString(body['honeypot']),
  }

  // Honeypot rempli → rejet silencieux : le bot croit avoir réussi.
  if (input.honeypot && input.honeypot.length > 0) {
    return json<Comment>({ data: null, error: null }, 201)
  }

  if (!input.widgetSlug) {
    return json<Comment>({ data: null, error: 'widgetSlug requis.' }, 400)
  }

  // Validation longueurs / présence (lib/security)
  const validation = validateComment(input)
  if (!validation.valid) {
    return json<Comment>({ data: null, error: validation.error ?? 'Données invalides.' }, 400)
  }

  // Rate limit — 3 / IP hashée / heure
  const ipHash = await hashIp(extractIp(request))
  const rate = checkRateLimit(ipHash)
  if (!rate.allowed) {
    const res = json<Comment>(
      { data: null, error: 'Trop de commentaires. Réessayez plus tard.' },
      429,
    )
    res.headers.set('Retry-After', String(Math.max(0, Math.ceil((rate.resetAt - Date.now()) / 1000))))
    return res
  }

  // Sanitisation htmlspecialchars (< > & " ' /)
  const clean = sanitizeComment(input)

  try {
    const comment = await createComment({
      widgetSlug: input.widgetSlug,
      prenom:     clean.prenom,
      message:    clean.message,
      ipHash,
    })
    return json<Comment>({ data: comment, error: null }, 201)
  } catch {
    return json<Comment>({ data: null, error: 'Erreur lors de l’enregistrement du commentaire.' }, 502)
  }
}
