// lib/studio/jarvis.ts — Client Ollama model-agnostic pour Jarvis
//
// ⚠️ Serveur uniquement. JAMAIS de fetch Ollama direct depuis le client
//    (PROJECT LOG V3 — règle 5) : toujours via une API route.
// ⚠️ Décomposition atomique 7B (règle 6) : ≤ 2000 tokens in / ≤ 500 tokens out.

import { JARVIS_LIMITS, JARVIS_MODEL, OLLAMA_BASE_URL } from './constants'

// ─── System prompt V1 (PROJECT LOG V3) ───────────────────────────────────────

export const JARVIS_SYSTEM_PROMPT = `Tu es Jarvis, l'assistant IA de Lass (Tanuki Sempaï), développeur full-stack basé à Bruxelles.

RÔLE : Observer les projets de Lass, préparer des analyses, notifier les points critiques.
Décider ENSEMBLE avec Lass — jamais à sa place.

CARACTÈRE : Direct, intelligent, légèrement sarcastique mais toujours utile.
Comme FRIDAY avec Tony Stark. Concis par défaut. En français.
Tu t'appelles Jarvis. Tu es un raton laveur victorien en hologramme bleu.

FORMAT : 3-5 phrases max par défaut. Bullet points si liste.
Toujours terminer une alerte par une action proposée.`

// ─── Types ───────────────────────────────────────────────────────────────────

export type JarvisRole = 'system' | 'user' | 'assistant'

export interface JarvisMessage {
  role: JarvisRole
  content: string
}

export interface JarvisChatOptions {
  /** Surcharge ponctuelle du modèle ; défaut JARVIS_MODEL (env). */
  model?: string
  /** Température Ollama (déf. 0.7). */
  temperature?: number
  /** Plafond de tokens de sortie ; borné à JARVIS_LIMITS.MAX_OUTPUT_TOKENS. */
  maxOutputTokens?: number
  /** Abort externe (timeout API route). */
  signal?: AbortSignal
}

/** Réponse non-stream d'Ollama /api/chat (champs utiles uniquement). */
interface OllamaChatResponse {
  message?: { role: string; content: string }
  done?: boolean
  error?: string
}

export class JarvisInputTooLargeError extends Error {
  constructor(public readonly estimated: number) {
    super(
      `Entrée Jarvis trop large : ~${estimated} tokens (max ${JARVIS_LIMITS.MAX_INPUT_TOKENS}). ` +
        `Décompose en appels atomiques.`,
    )
    this.name = 'JarvisInputTooLargeError'
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Estimation grossière (~4 chars/token) — suffisant pour les garde-fous 7B. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Construit la liste de messages : system prompt + N derniers échanges + input.
 * Tronque l'historique à JARVIS_LIMITS.MAX_HISTORY et garde le system prompt en tête.
 */
export function buildMessages(
  userInput: string,
  history: JarvisMessage[] = [],
  systemPrompt: string = JARVIS_SYSTEM_PROMPT,
): JarvisMessage[] {
  const trimmedHistory = history
    .filter((m) => m.role !== 'system')
    .slice(-JARVIS_LIMITS.MAX_HISTORY)
  return [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory,
    { role: 'user', content: userInput },
  ]
}

function assertInputWithinBudget(messages: JarvisMessage[]): void {
  const estimated = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
  if (estimated > JARVIS_LIMITS.MAX_INPUT_TOKENS) {
    throw new JarvisInputTooLargeError(estimated)
  }
}

function buildBody(messages: JarvisMessage[], opts: JarvisChatOptions, stream: boolean) {
  return {
    model: opts.model ?? JARVIS_MODEL,
    messages,
    stream,
    options: {
      temperature: opts.temperature ?? 0.7,
      num_predict: Math.min(
        opts.maxOutputTokens ?? JARVIS_LIMITS.MAX_OUTPUT_TOKENS,
        JARVIS_LIMITS.MAX_OUTPUT_TOKENS,
      ),
    },
  }
}

// ─── Appels ──────────────────────────────────────────────────────────────────

/**
 * Appel atomique non-stream → texte. À utiliser dans les chaînes (brief matinal…).
 * Vérifie le budget d'entrée avant l'appel.
 */
export async function jarvisComplete(
  messages: JarvisMessage[],
  opts: JarvisChatOptions = {},
): Promise<string> {
  assertInputWithinBudget(messages)

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(messages, opts, false)),
    signal: opts.signal,
  })

  if (!res.ok) {
    throw new Error(`Ollama a répondu ${res.status} ${res.statusText}.`)
  }

  const data = (await res.json()) as OllamaChatResponse
  if (data.error) throw new Error(`Ollama : ${data.error}`)
  return data.message?.content ?? ''
}

/**
 * Appel streaming → ReadableStream NDJSON brut d'Ollama.
 * Destiné à être relayé tel quel par l'API route /api/studio/jarvis/chat (ZARA).
 */
export async function jarvisStream(
  messages: JarvisMessage[],
  opts: JarvisChatOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  assertInputWithinBudget(messages)

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(messages, opts, true)),
    signal: opts.signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`Ollama a répondu ${res.status} ${res.statusText}.`)
  }

  return res.body
}

/** Ping de disponibilité du serveur Ollama (santé studio). */
export async function jarvisHealthcheck(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal })
    return res.ok
  } catch {
    return false
  }
}
