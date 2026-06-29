'use client'

// components/studio/StudioCursor.tsx — Curseur custom AUTO-CONTENU du studio.
//
// Indépendant des providers portfolio (pas de CursorContext, pas de Lenis).
// Inspiré de components/ui/Cursor.tsx mais adapté war-room : dot plus petit,
// toujours visible (point de visée), ring plus serré, interpolation plus rapide
// (0.2 → plus précis). Tokens DA uniquement (bg-accent / border-accent).
//
// ⚠️ Guard touch obligatoire + cleanup rAF/listeners. À monter une seule fois
//    dans app/studio/layout.tsx.

import { useEffect, useRef, useState } from 'react'

type StudioCursorState = 'default' | 'hover' | 'text'

const RING_LERP = 0.2 // plus élevé que le portfolio (0.12) → suit de plus près

export default function StudioCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<StudioCursorState>('default')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Guard touch — jamais de pointer:coarse (non fiable). Aucun listener si tactile.
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    setVisible(true)

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let rafId = 0

    const moveDot = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Boucle rAF unique : dot exact + ring interpolé dans la même frame.
    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
      ringX += (mouseX - ringX) * RING_LERP
      ringY += (mouseY - ringY) * RING_LERP
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      rafId = requestAnimationFrame(animate)
    }

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor="hover"]')) {
        setState('hover')
      } else if (
        target.closest('input, textarea, [data-cursor="text"]')
      ) {
        setState('text')
      } else {
        setState('default')
      }
    }

    const handleLeave = () => setState('default')

    document.addEventListener('mousemove', moveDot)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleLeave)
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', moveDot)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Dot — point de visée, position exacte, toujours visible */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={[
            'rounded-full bg-accent transition-all duration-150',
            state === 'default' ? 'h-1.5 w-1.5' : '',
            state === 'hover'   ? 'h-1 w-1' : '',
            state === 'text'    ? 'h-4 w-px rounded-none' : '',
          ].join(' ')}
        />
      </div>

      {/* Ring — interpolé, serré */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={[
            'border border-accent/40 transition-all duration-200',
            state === 'default' ? 'h-6 w-6 rounded-full' : '',
            state === 'hover'   ? 'h-9 w-9 rounded-full bg-accent/10' : '',
            state === 'text'    ? 'h-5 w-5 rounded-full opacity-40' : '',
          ].join(' ')}
        />
      </div>
    </>
  )
}
