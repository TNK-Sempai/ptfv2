// lib/studio/jarvis-client.ts — Consommateur client du flux Jarvis.
//
// ⚠️ Côté client uniquement : ne touche JAMAIS Ollama en direct (règle 5).
//    Parle à l'API route /api/studio/jarvis/chat, qui relaie le NDJSON brut
//    d'Ollama (lignes { message: { content }, done }). On en extrait les tokens.

import { STUDIO_ROUTES } from './constants'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/** Extrait le fragment de texte d'une ligne NDJSON Ollama (tolérant aux lignes vides). */
function parseToken(line: string): string {
  const trimmed = line.trim()
  if (!trimmed) return ''
  try {
    const data = JSON.parse(trimmed) as { message?: { content?: string }; error?: string }
    if (data.error) throw new Error(data.error)
    return data.message?.content ?? ''
  } catch {
    return ''
  }
}

/**
 * POST le message + l'historique récent à l'API route et restitue la réponse
 * token par token (async generator). `signal` permet l'annulation (unmount/abort).
 */
export async function* streamJarvisChat(
  message: string,
  history: ChatTurn[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(STUDIO_ROUTES.API_JARVIS_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    credentials: 'include', // joint le cookie studio-session (route protégée → sinon 401)
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`Jarvis indisponible (${res.status}).`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const token = parseToken(line)
      if (token) yield token
    }
  }

  const tail = parseToken(buffer)
  if (tail) yield tail
}
