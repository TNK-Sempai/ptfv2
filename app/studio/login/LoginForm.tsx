'use client'

// app/studio/login/LoginForm.tsx — Formulaire PIN (client) du studio.
// POST { pin, slug } → /api/studio/auth ; succès → /studio.

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  STUDIO_PIN_LENGTH,
  STUDIO_ROUTES,
} from '@/lib/studio/constants'

export function LoginForm({ slug }: { slug: string }) {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(STUDIO_ROUTES.API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, slug }),
      })

      if (res.ok) {
        router.replace(STUDIO_ROUTES.ROOT)
        router.refresh()
        return
      }

      const data: { error?: string } | null = await res.json().catch(() => null)
      setError(data?.error ?? 'Accès refusé.')
    } catch {
      setError('Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
    >
      <p className="eyebrow-label font-mono text-xs uppercase text-accent">
        Tanuki Control Center
      </p>
      <h1 className="mt-3 font-display text-3xl uppercase tracking-wide">
        Accès studio
      </h1>

      <label htmlFor="studio-pin" className="mt-8 block font-mono text-xs text-muted2">
        Code PIN
      </label>
      <input
        id="studio-pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={STUDIO_PIN_LENGTH}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        className="mt-2 w-full rounded-lg border border-border bg-surface2 px-4 py-3 font-mono text-lg tracking-[0.3em] text-text outline-none focus:border-accent/40"
        aria-invalid={error !== null}
      />

      {/* Pas de token "danger" dans la DA → muted2 + marqueur. À revoir si NOVA ajoute --danger. */}
      {error && (
        <p role="alert" className="mt-4 font-mono text-xs text-muted2">
          ⚠ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || pin.length !== STUDIO_PIN_LENGTH}
        data-cursor="hover"
        className="mt-6 w-full rounded-full bg-accent px-5 py-3 font-mono text-sm font-medium uppercase tracking-wide text-bg transition-opacity disabled:opacity-40"
      >
        {loading ? 'Vérification…' : 'Entrer'}
      </button>
    </form>
  )
}
