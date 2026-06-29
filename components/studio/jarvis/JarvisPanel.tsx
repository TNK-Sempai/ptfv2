'use client'

// components/studio/jarvis/JarvisPanel.tsx — Assemble l'avatar Jarvis et son
// terminal. L'état (idle/thinking/speaking) est remonté par le terminal et pilote
// l'animation de la face. Layout : raton à gauche, terminal à droite (≥lg).

import { useState } from 'react'
import JarvisFace, { type JarvisState } from './JarvisFace'
import JarvisTerminal from './JarvisTerminal'

interface JarvisPanelProps {
  className?: string
}

export default function JarvisPanel({ className }: JarvisPanelProps) {
  const [state, setState] = useState<JarvisState>('idle')

  return (
    <section
      className={[
        'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-stretch',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Jarvis — assistant du cockpit"
    >
      {/* Face — raton hologramme */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-surface py-8">
        <JarvisFace state={state} />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {state === 'thinking' ? 'Analyse en cours' : state === 'speaking' ? 'En réponse' : 'En veille'}
        </p>
      </div>

      {/* Terminal de dialogue (hauteur bornée pour scroll interne) */}
      <JarvisTerminal onStateChange={setState} className="h-[420px]" />
    </section>
  )
}
