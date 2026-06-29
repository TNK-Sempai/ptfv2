'use client'

import { useEffect, useState } from 'react'
import { COMMENT_PRENOM_MAX, SUGGESTION_VOTE_THRESHOLD } from '@/lib/constants'
import type { Suggestion } from '@/lib/types'

// Limites propres au formulaire de suggestion.
// NB : à centraliser dans lib/constants.ts (ZARA) — magic numbers évités ici.
const TITLE_MAX = 100
const DESCRIPTION_MAX = 500

type DisplaySuggestion = Pick<Suggestion, 'id' | 'title' | 'description' | 'votes'>
type VoteFeedback = 'voted' | 'already' | 'error'
type FormState = 'idle' | 'sending' | 'sent' | 'error'

/**
 * SuggestContent — partie interactive de la page "Suggérer un widget".
 *
 * Formulaire (POST /api/suggestions) + liste votable (GET /api/votes,
 * POST /api/votes). Routes à créer par ZARA (app/api/).
 */
export default function SuggestContent() {
  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <SuggestForm />
      <SuggestionList />
    </div>
  )
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

function SuggestForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prenom, setPrenom] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (!title.trim()) return 'Le titre est requis.'
    if (title.length > TITLE_MAX) return `Titre : ${TITLE_MAX} caractères max.`
    if (!description.trim()) return 'La description est requise.'
    if (description.length > DESCRIPTION_MAX) return `Description : ${DESCRIPTION_MAX} caractères max.`
    if (prenom.length > COMMENT_PRENOM_MAX) return `Prénom : ${COMMENT_PRENOM_MAX} caractères max.`
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
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, prenom, honeypot }),
      })
      if (!res.ok) throw new Error('request failed')
      setState('sent')
      setTitle('')
      setDescription('')
      setPrenom('')
    } catch {
      setError("L'envoi a échoué. Réessaie dans un instant.")
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-lg border border-accent/40 bg-surface p-6">
        <p className="font-display text-xl text-accent">Proposition envoyée !</p>
        <p className="mt-2 font-body text-sm text-muted2">
          Si {SUGGESTION_VOTE_THRESHOLD} devs votent pour, je la construis.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 font-mono text-xs text-muted underline-offset-4 hover:text-text hover:underline"
        >
          Proposer un autre widget
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Titre" htmlFor="title">
        <input
          id="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm text-text outline-none focus:border-accent/40"
        />
      </Field>

      <Field label="Description" htmlFor="description" counter={`${description.length}/${DESCRIPTION_MAX}`}>
        <textarea
          id="description"
          value={description}
          maxLength={DESCRIPTION_MAX}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-y rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm text-text outline-none focus:border-accent/40"
        />
      </Field>

      <Field label="Prénom" htmlFor="prenom">
        <input
          id="prenom"
          type="text"
          value={prenom}
          maxLength={COMMENT_PRENOM_MAX}
          onChange={(e) => setPrenom(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm text-text outline-none focus:border-accent/40"
        />
      </Field>

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
        {state === 'sending' ? 'Envoi…' : 'Proposer le widget'}
      </button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  counter,
  children,
}: {
  label: string
  htmlFor: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="font-mono text-xs text-muted">
        {label}
      </label>
      {children}
      {counter && <span className="self-end font-mono text-xs text-muted">{counter}</span>}
    </div>
  )
}

// ─── Liste votable ────────────────────────────────────────────────────────────

function SuggestionList() {
  const [suggestions, setSuggestions] = useState<DisplaySuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Record<string, VoteFeedback>>({})
  const [votingId, setVotingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/votes')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: DisplaySuggestion[] | { suggestions: DisplaySuggestion[] }) => {
        if (!active) return
        setSuggestions(Array.isArray(data) ? data : (data.suggestions ?? []))
      })
      .catch(() => active && setSuggestions([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  async function vote(id: string) {
    if (votingId || feedback[id]) return
    setVotingId(id)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId: id }),
      })
      if (res.status === 409) {
        setFeedback((f) => ({ ...f, [id]: 'already' }))
        return
      }
      if (!res.ok) throw new Error('vote failed')
      setSuggestions((list) =>
        list.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s)),
      )
      setFeedback((f) => ({ ...f, [id]: 'voted' }))
    } catch {
      setFeedback((f) => ({ ...f, [id]: 'error' }))
    } finally {
      setVotingId(null)
    }
  }

  if (loading) {
    return <p className="font-mono text-sm text-muted">Chargement des suggestions…</p>
  }

  if (suggestions.length === 0) {
    return <p className="font-mono text-sm text-muted">Aucune suggestion pour le moment. Sois le premier !</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {suggestions.map((s) => {
        const fb = feedback[s.id]
        const disabled = votingId === s.id || fb === 'voted' || fb === 'already'
        return (
          <li key={s.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg text-text">{s.title}</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted2">{s.description}</p>
              </div>
              <button
                type="button"
                onClick={() => vote(s.id)}
                disabled={disabled}
                className="flex shrink-0 flex-col items-center rounded-lg border border-border px-3 py-2 font-mono text-xs text-text transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              >
                <span aria-hidden>▲</span>
                <span>{s.votes}</span>
              </button>
            </div>

            {/* Progression vers le seuil de construction */}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface2">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.min(100, (s.votes / SUGGESTION_VOTE_THRESHOLD) * 100)}%` }}
              />
            </div>

            {fb === 'already' && (
              <p className="mt-2 font-mono text-xs text-muted2">Déjà voté</p>
            )}
            {fb === 'voted' && <p className="mt-2 font-mono text-xs text-accent">Merci pour ton vote !</p>}
            {fb === 'error' && <p className="mt-2 font-mono text-xs text-red-400">Vote impossible.</p>}
          </li>
        )
      })}
    </ul>
  )
}
