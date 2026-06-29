// app/api/suggestions/route.ts — Soumission de suggestions 1001 Widgets
// POST { title, description, prenom, honeypot } → création status="pending"
//
// Sécurité : honeypot, validation longueurs (constants), sanitize htmlspecialchars,
// rate limit 3/IP/heure (IP hashée SHA-256). Création déléguée à lib/notion.

import { NextResponse } from 'next/server'

import { createSuggestion } from '@/lib/notion'
import { extractIp, hashIp, sanitizeString } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  SUGGESTION_TITLE_MAX,
  SUGGESTION_DESCRIPTION_MAX,
  COMMENT_PRENOM_MAX,
} from '@/lib/constants'
import type { Suggestion, ApiResponse } from '@/lib/types'

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

// ─── POST — soumission d'une suggestion (status pending) ────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonObject(request)

  const honeypot    = asString(body['honeypot'])
  const titleRaw    = asString(body['title']).trim()
  const descRaw     = asString(body['description']).trim()
  const prenomRaw   = asString(body['prenom']).trim()

  // Honeypot rempli → rejet silencieux : le bot croit avoir réussi.
  if (honeypot.length > 0) {
    return json<Suggestion>({ data: null, error: null }, 201)
  }

  // Validation longueurs / présence
  if (!titleRaw) {
    return json<Suggestion>({ data: null, error: 'Titre requis.' }, 400)
  }
  if (titleRaw.length > SUGGESTION_TITLE_MAX) {
    return json<Suggestion>(
      { data: null, error: `Titre trop long (max ${SUGGESTION_TITLE_MAX} caractères).` },
      400,
    )
  }
  if (descRaw.length > SUGGESTION_DESCRIPTION_MAX) {
    return json<Suggestion>(
      { data: null, error: `Description trop longue (max ${SUGGESTION_DESCRIPTION_MAX} caractères).` },
      400,
    )
  }

  // Rate limit — 3 / IP hashée / heure
  const ipHash = await hashIp(extractIp(request))
  const rate = checkRateLimit(ipHash)
  if (!rate.allowed) {
    const res = json<Suggestion>(
      { data: null, error: 'Trop de suggestions. Réessayez plus tard.' },
      429,
    )
    res.headers.set('Retry-After', String(Math.max(0, Math.ceil((rate.resetAt - Date.now()) / 1000))))
    return res
  }

  // Sanitisation htmlspecialchars (< > & " ' /)
  const title       = sanitizeString(titleRaw, SUGGESTION_TITLE_MAX)
  const description = sanitizeString(descRaw, SUGGESTION_DESCRIPTION_MAX)
  const suggestedBy = sanitizeString(prenomRaw, COMMENT_PRENOM_MAX)

  try {
    const suggestion = await createSuggestion({ title, description, suggestedBy })
    return json<Suggestion>({ data: suggestion, error: null }, 201)
  } catch {
    return json<Suggestion>({ data: null, error: 'Erreur lors de l’enregistrement de la suggestion.' }, 502)
  }
}
