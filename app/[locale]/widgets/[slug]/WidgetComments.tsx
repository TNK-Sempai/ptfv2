'use client'

import { useEffect, useState } from 'react'
import { COMMENT_PRENOM_MAX, COMMENT_MESSAGE_MAX } from '@/lib/constants'
import type { Comment } from '@/lib/types'

// Sous-ensemble affichable d'un commentaire approuvé renvoyé par l'API.
type DisplayComment = Pick<Comment, 'id' | 'prenom' | 'message' | 'createdAt'>

type FormState = 'idle' | 'sending' | 'sent' | 'error'

interface WidgetCommentsProps {
  widgetSlug: string
}

/**
 * WidgetComments — section commentaires d'un widget.
 *
 * CommentList : GET /api/comments?widgetSlug=… (commentaires approuvés).
 * CommentForm : POST /api/comments (prénom + message + honeypot), validation
 * client avant envoi, message de confirmation après soumission.
 *
 * NB : les routes /api/comments relèvent de ZARA (app/api/) — ce composant
 * consomme le contrat décrit dans CLAUDE.md.
 */
export default function WidgetComments({ widgetSlug }: WidgetCommentsProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <CommentForm widgetSlug={widgetSlug} />
      <CommentList widgetSlug={widgetSlug} />
    </div>
  )
}

// ─── Liste ────────────────────────────────────────────────────────────────────

function CommentList({ widgetSlug }: WidgetCommentsProps) {
  const [comments, setComments] = useState<DisplayComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`/api/comments?widgetSlug=${encodeURIComponent(widgetSlug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: DisplayComment[] | { comments: DisplayComment[] }) => {
        if (!active) return
        setComments(Array.isArray(data) ? data : (data.comments ?? []))
      })
      .catch(() => active && setComments([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [widgetSlug])

  if (loading) {
    return <p className="font-mono text-sm text-muted">Chargement des commentaires…</p>
  }

  if (comments.length === 0) {
    return <p className="font-mono text-sm text-muted">Aucun commentaire pour le moment.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((c) => (
        <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
          <p className="font-display text-lg text-text">{c.prenom}</p>
          <p className="mt-1 font-body text-sm leading-relaxed text-muted2">{c.message}</p>
        </li>
      ))}
    </ul>
  )
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

function CommentForm({ widgetSlug }: WidgetCommentsProps) {
  const [prenom, setPrenom] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (!prenom.trim()) return 'Le prénom est requis.'
    if (prenom.length > COMMENT_PRENOM_MAX) return `Prénom : ${COMMENT_PRENOM_MAX} caractères max.`
    if (!message.trim()) return 'Le message est requis.'
    if (message.length > COMMENT_MESSAGE_MAX) return `Message : ${COMMENT_MESSAGE_MAX} caractères max.`
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return // bot piégé — rejet silencieux

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setState('error')
      return
    }

    setState('sending')
    setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetSlug, prenom, message, honeypot }),
      })
      if (!res.ok) throw new Error('request failed')
      setState('sent')
      setPrenom('')
      setMessage('')
    } catch {
      setError("L'envoi a échoué. Réessaie dans un instant.")
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-lg border border-accent/40 bg-surface p-6">
        <p className="font-display text-xl text-accent">Merci !</p>
        <p className="mt-2 font-body text-sm text-muted2">
          Ton commentaire est en attente de modération.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 font-mono text-xs text-muted underline-offset-4 hover:text-text hover:underline"
        >
          Écrire un autre commentaire
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="prenom" className="font-mono text-xs text-muted">
          Prénom
        </label>
        <input
          id="prenom"
          type="text"
          value={prenom}
          maxLength={COMMENT_PRENOM_MAX}
          onChange={(e) => setPrenom(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm text-text outline-none focus:border-accent/40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="font-mono text-xs text-muted">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          maxLength={COMMENT_MESSAGE_MAX}
          rows={4}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-y rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm text-text outline-none focus:border-accent/40"
        />
        <span className="self-end font-mono text-xs text-muted">
          {message.length}/{COMMENT_MESSAGE_MAX}
        </span>
      </div>

      {/* Honeypot invisible — jamais rempli par un humain */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex w-fit items-center gap-2 rounded border border-accent/40 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-50"
      >
        {state === 'sending' ? 'Envoi…' : 'Publier le commentaire'}
      </button>
    </form>
  )
}
