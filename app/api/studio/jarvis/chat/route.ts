// app/api/studio/jarvis/chat/route.ts — Chat Jarvis (streaming Ollama)
//
// POST { message, history } → relaie le flux NDJSON d'Ollama token par token.
// Auth studio obligatoire avant tout. Runtime Node (crypto + fetch streaming).
//
// ⚠️ Le client ne parle JAMAIS à Ollama directement (PROJECT LOG V3 — règle 5).

import { NextResponse } from 'next/server'
import { verifyStudioCookie } from '@/lib/studio/studio-auth'
import {
  buildMessages,
  jarvisStream,
  JarvisInputTooLargeError,
  JARVIS_SYSTEM_PROMPT,
  type JarvisMessage,
} from '@/lib/studio/jarvis'
import { STUDIO_PROJECTS, type ProjectStatus } from '@/lib/studio/constants'

export const runtime = 'nodejs'

const MESSAGE_MAX_CHARS = 4000

interface ChatBody {
  message?: unknown
  history?: unknown
}

// ─── Coercition sûre de l'historique entrant ─────────────────────────────────
// On n'accepte que user/assistant ; le rôle system reste contrôlé serveur.

function toHistory(raw: unknown): JarvisMessage[] {
  if (!Array.isArray(raw)) return []
  const out: JarvisMessage[] = []
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const role = (item as Record<string, unknown>).role
      const content = (item as Record<string, unknown>).content
      if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
        out.push({ role, content })
      }
    }
  }
  return out
}

// ─── Contexte injecté (≤ 800 tokens — règle de décomposition 7B) ─────────────

const STATUS_LABELS: Record<ProjectStatus, string> = {
  healthy:  'sain',
  warning:  'à surveiller',
  critical: 'critique',
  paused:   'en pause',
  building: 'en construction',
  unknown:  'à évaluer',
}

function buildContextBlock(): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Statuts par défaut connus en Phase 1 (live Supabase plus tard).
  const counts: Partial<Record<ProjectStatus, number>> = {}
  for (const project of STUDIO_PROJECTS) {
    const status: ProjectStatus =
      'status_default' in project ? project.status_default : 'healthy'
    counts[status] = (counts[status] ?? 0) + 1
  }

  const summary = (Object.entries(counts) as [ProjectStatus, number][])
    .map(([status, n]) => `${n} ${STATUS_LABELS[status]}`)
    .join(', ')

  return [
    'CONTEXTE ACTUEL',
    `Date : ${dateStr}, ${timeStr}`,
    `Projets suivis : ${STUDIO_PROJECTS.length}`,
    `Statut général : ${summary}`,
  ].join('\n')
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // 1. Auth studio avant tout.
  const { valid } = await verifyStudioCookie()
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  // 2. Parsing + validation.
  let body: ChatBody
  try {
    body = (await request.json()) as ChatBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ ok: false, error: 'Message requis.' }, { status: 400 })
  }
  if (message.length > MESSAGE_MAX_CHARS) {
    return NextResponse.json(
      { ok: false, error: `Message trop long (max ${MESSAGE_MAX_CHARS} caractères).` },
      { status: 413 },
    )
  }

  // 3. System prompt + contexte injecté.
  const systemPrompt = `${JARVIS_SYSTEM_PROMPT}\n\n${buildContextBlock()}`
  const messages = buildMessages(message, toHistory(body.history), systemPrompt)

  // 4. Stream Ollama relayé tel quel (NDJSON).
  try {
    const stream = await jarvisStream(messages, { signal: request.signal })
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    if (err instanceof JarvisInputTooLargeError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 413 })
    }
    // Ollama injoignable / erreur réseau.
    return NextResponse.json(
      { ok: false, error: 'Jarvis est injoignable (Ollama hors-ligne ?).' },
      { status: 502 },
    )
  }
}
