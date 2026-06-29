'use client'

import { useEffect, useState } from 'react'

/**
 * PaletteWidget — démo live « Générateur de palettes ».
 * 5 couleurs harmonieuses, hover = hex, click = copie, bouton Générer.
 * Vanilla React. Génération aléatoire au montage (évite le mismatch d'hydratation).
 */

const SWATCH_COUNT = 5

// Palette par défaut déterministe (SSR + premier rendu client identiques)
const DEFAULT_PALETTE = ['#1c1c26', '#2e2e3d', '#c8f060', '#9c9590', '#ede8df']

function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Palette analogue : teinte de base + décalages, luminosité croissante. */
function randomPalette(): string[] {
  const baseHue = Math.floor(Math.random() * 360)
  return Array.from({ length: SWATCH_COUNT }, (_, i) => {
    const hue = (baseHue + i * (12 + Math.random() * 16)) % 360
    const sat = 50 + Math.random() * 30
    const light = Math.min(38 + i * 8 + Math.random() * 6, 82)
    return hslToHex(hue, sat, light)
  })
}

export default function PaletteWidget() {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE)
  const [copied, setCopied] = useState<number | null>(null)
  // `seed` re-clé le conteneur → rejoue l'animation d'entrée des barres
  const [seed, setSeed] = useState(0)

  // Première génération aléatoire après montage (pas de mismatch SSR).
  // Différée en rAF : pas de setState synchrone dans le corps de l'effet.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPalette(randomPalette())
      setSeed((s) => s + 1)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  function regenerate() {
    setPalette(randomPalette())
    setCopied(null)
    setSeed((s) => s + 1)
  }

  async function copy(hex: string, index: number) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(index)
      window.setTimeout(() => setCopied((c) => (c === index ? null : c)), 1200)
    } catch {
      /* clipboard indisponible — silencieux */
    }
  }

  return (
    <div
      className="flex w-full flex-col gap-5 border border-border p-5"
      style={{
        background: 'var(--widget-bg, var(--surface))',
        color: 'var(--widget-text, var(--text))',
        borderRadius: 'var(--widget-radius, 1rem)',
        fontSize: 'var(--widget-font-size, 16px)',
      }}
    >
      <style>{`
        @keyframes widget-bar-in { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .wgt-bar { animation: none !important; } }
      `}</style>

      {/* Barres */}
      <div key={seed} className="flex h-56 gap-2">
        {palette.map((hex, i) => (
          <button
            key={`${hex}-${i}`}
            type="button"
            data-cursor="hover"
            onClick={() => copy(hex, i)}
            style={{ backgroundColor: hex, animationDelay: `${i * 80}ms` }}
            className="wgt-bar group relative flex-1 origin-bottom overflow-hidden rounded-xl animate-[widget-bar-in_0.6s_cubic-bezier(0.22,1,0.36,1)_both]"
            aria-label={`Copier ${hex}`}
          >
            {/* Hex au hover */}
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-bg/70 py-2 text-center font-mono text-[11px] uppercase tracking-wide text-text opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              {copied === i ? 'Copié !' : hex}
            </span>
          </button>
        ))}
      </div>

      {/* Générer */}
      <button
        type="button"
        data-cursor="hover"
        onClick={regenerate}
        style={{ color: 'var(--widget-accent, var(--accent))' }}
        className="w-full rounded-lg border border-accent/20 bg-accent/5 py-3 font-mono text-xs uppercase tracking-widest transition-colors duration-200 hover:bg-accent/10"
      >
        Générer une palette
      </button>
    </div>
  )
}
