// app/api/votes/route.ts — Votes sur suggestions 1001 Widgets
// GET  ?suggestionId=xxx → suggestion ciblée, sinon toutes (Notion)
// POST { suggestionId } → vote (1 par IP hashée), retourne le nouveau total
//
// Anti-doublon : voteForSuggestion() vérifie l'IP hashée dans le tableau voters
// côté Notion (source de vérité). Logique métier déléguée à lib/.

import { NextResponse } from 'next/server'

import { getSuggestions, voteForSuggestion } from '@/lib/notion'
import { extractIp, hashIp } from '@/lib/security'
import type { Suggestion, ApiResponse } from '@/lib/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── GET — suggestions (toutes, ou une seule si ?suggestionId) ──────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const suggestionId = new URL(request.url).searchParams.get('suggestionId')?.trim() ?? ''

  try {
    const suggestions = await getSuggestions()

    if (suggestionId) {
      const found = suggestions.find((s) => s.id === suggestionId)
      if (!found) {
        return json<Suggestion>({ data: null, error: 'not_found' }, 404)
      }
      return json<Suggestion>({ data: found, error: null }, 200)
    }

    return json<Suggestion[]>({ data: suggestions, error: null }, 200)
  } catch {
    return json<Suggestion[]>({ data: null, error: 'Erreur de récupération des suggestions.' }, 502)
  }
}

// ─── POST — vote pour une suggestion ────────────────────────────────────────────

interface VoteResult {
  votes: number
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonObject(request)
  const suggestionId = asString(body['suggestionId']).trim()

  if (!suggestionId) {
    return json<VoteResult>({ data: null, error: 'suggestionId requis.' }, 400)
  }

  const ipHash = await hashIp(extractIp(request))

  try {
    const result = await voteForSuggestion(suggestionId, ipHash)

    if (result.alreadyVoted) {
      return json<VoteResult>({ data: null, error: 'already_voted' }, 409)
    }

    if (!result.success) {
      return json<VoteResult>({ data: null, error: 'not_found' }, 404)
    }

    // Total exact renvoyé par voteForSuggestion (lecture fraîche Notion + 1).
    return json<VoteResult>({ data: { votes: result.newTotal }, error: null }, 200)
  } catch {
    return json<VoteResult>({ data: null, error: 'Erreur lors de l’enregistrement du vote.' }, 502)
  }
}
