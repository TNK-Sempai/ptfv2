'use client'

import { useState, type CSSProperties } from 'react'

/**
 * CounterWidget — démo live « Compteur JS ».
 * Compteur incrémental vanilla React, zéro dépendance.
 * Couleur de la valeur : positive = accent, négative = red, zéro = muted.
 *
 * Note DA : le système de tokens n'expose pas de couleur d'état « négatif ».
 * On consomme `var(--negative, …)` avec fallback — adopté automatiquement
 * si NOVA ajoute le token plus tard.
 */

const STEPS = [100, 10, 1, -1, -10, -100] as const

export default function CounterWidget() {
  const [count, setCount] = useState(0)

  const valueStyle: CSSProperties =
    count > 0
      ? { color: 'var(--widget-accent, var(--accent))' }
      : count < 0
        ? { color: 'var(--negative, #f0606e)' }
        : { color: 'var(--muted)' }

  return (
    <div
      className="flex w-full flex-col items-center gap-8 border border-border p-8"
      style={{
        background: 'var(--widget-bg, var(--surface))',
        color: 'var(--widget-text, var(--text))',
        borderRadius: 'var(--widget-radius, 1rem)',
        fontSize: 'var(--widget-font-size, 16px)',
      }}
    >
      {/* Valeur */}
      <output
        aria-live="polite"
        style={valueStyle}
        className="font-display text-[clamp(3.5rem,14vw,7rem)] leading-none tabular-nums transition-colors duration-300"
      >
        {count}
      </output>

      {/* Steps */}
      <div className="grid w-full max-w-xs grid-cols-3 gap-2">
        {STEPS.map((step) => {
          const positive = step > 0
          return (
            <button
              key={step}
              type="button"
              data-cursor="hover"
              onClick={() => setCount((c) => c + step)}
              className={`rounded-lg border bg-surface2 py-3 font-mono text-sm tabular-nums transition-colors duration-200 ${
                positive
                  ? 'border-border text-text hover:border-accent/40 hover:text-accent'
                  : 'border-border text-muted2 hover:border-[#f0606e] hover:text-[#f0606e]'
              }`}
            >
              {positive ? `+${step}` : step}
            </button>
          )
        })}
      </div>

      {/* Reset */}
      <button
        type="button"
        data-cursor="hover"
        onClick={() => setCount(0)}
        disabled={count === 0}
        style={{ color: 'var(--widget-accent, var(--accent))' }}
        className="w-full max-w-xs rounded-lg border border-accent/20 bg-accent/5 py-3 font-mono text-xs uppercase tracking-widest transition-colors duration-200 hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Reset
      </button>
    </div>
  )
}
