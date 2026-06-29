'use client'

// components/studio/jarvis/JarvisTerminal.tsx — Terminal de dialogue Jarvis.
// Style Stark/FRIDAY : historique scrollable + saisie + streaming token/token
// depuis /api/studio/jarvis/chat. Remonte l'état (thinking/streaming) au parent
// via onStateChange pour synchroniser l'avatar (JarvisFace). Tokens DA + bleu holo.

import { useEffect, useRef, useState } from 'react'
import { streamJarvisChat, type ChatTurn } from '@/lib/studio/jarvis-client'
import { JARVIS_HOLO_BLUE, JARVIS_LIMITS } from '@/lib/studio/constants'
import type { JarvisState } from './JarvisFace'

interface JarvisTerminalProps {
  onStateChange?: (state: JarvisState) => void
  className?: string
}

const GREETING: ChatTurn = {
  role: 'assistant',
  content: 'Cockpit en ligne. Je surveille les onze projets. Que veux-tu savoir ?',
}

export default function JarvisTerminal({ onStateChange, className }: JarvisTerminalProps) {
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<JarvisState>('idle')
  const [error, setError] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => onStateChange?.(status), [status, onStateChange])
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, status])
  useEffect(() => () => abortRef.current?.abort(), [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const message = input.trim()
    if (!message || status !== 'idle') return

    setError(null)
    setInput('')
    setStatus('thinking')
    const history = turns.filter((t) => t !== GREETING).slice(-JARVIS_LIMITS.MAX_HISTORY * 2)
    setTurns((prev) => [...prev, { role: 'user', content: message }, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      let first = true
      for await (const token of streamJarvisChat(message, history, controller.signal)) {
        if (first) {
          setStatus('speaking')
          first = false
        }
        setTurns((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + token,
          }
          return next
        })
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Erreur Jarvis.')
        setTurns((prev) => prev.slice(0, -1)) // retire la bulle vide
      }
    } finally {
      setStatus('idle')
      abortRef.current = null
    }
  }

  const busy = status !== 'idle'

  return (
    <div className={['flex min-h-0 flex-col rounded-lg border border-border bg-surface', className].filter(Boolean).join(' ')}>
      {/* Barre de titre */}
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: JARVIS_HOLO_BLUE, boxShadow: `0 0 6px ${JARVIS_HOLO_BLUE}` }} aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text">Jarvis · terminal</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted">
          {status === 'thinking' ? 'analyse…' : status === 'speaking' ? 'réponse…' : 'prêt'}
        </span>
      </header>

      {/* Historique */}
      <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {turns.map((turn, i) => (
          <div key={i} className={turn.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-muted">
              {turn.role === 'user' ? 'Lass' : 'Jarvis'}
            </span>
            <p
              className={[
                'inline-block max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed',
                turn.role === 'user' ? 'bg-surface2 text-text' : 'text-text',
              ].join(' ')}
              style={turn.role === 'assistant' ? { borderLeft: `2px solid ${JARVIS_HOLO_BLUE}`, background: `${JARVIS_HOLO_BLUE}0d` } : undefined}
            >
              {turn.content}
              {turn.role === 'assistant' && i === turns.length - 1 && busy && (
                <span className="ml-0.5 inline-block animate-pulse" style={{ color: JARVIS_HOLO_BLUE }}>▋</span>
              )}
            </p>
          </div>
        ))}
        {error && <p className="font-mono text-xs text-red">{error}</p>}
      </div>

      {/* Saisie */}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border px-3 py-3">
        <span className="font-mono text-sm" style={{ color: JARVIS_HOLO_BLUE }} aria-hidden>›</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder={busy ? 'Jarvis répond…' : 'Parle à Jarvis…'}
          aria-label="Message pour Jarvis"
          data-cursor="hover"
          className="flex-1 bg-transparent font-mono text-sm text-text placeholder:text-muted focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          data-cursor="hover"
          className="rounded px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-bg transition-opacity disabled:opacity-30"
          style={{ backgroundColor: JARVIS_HOLO_BLUE }}
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
