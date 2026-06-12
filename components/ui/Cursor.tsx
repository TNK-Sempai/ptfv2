'use client'
import { useEffect, useRef, useState } from 'react'

type CursorState = 'default' | 'hover' | 'text' | 'drag'

/**
 * Curseur custom : dot (position exacte) + ring (interpolation 0.12).
 * Guard touch obligatoire — inactif si ontouchstart + innerWidth < 1024.
 * Monter une seule fois dans app/[locale]/layout.tsx.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    setVisible(true)

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let rafId: number

    const moveDot = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      rafId = requestAnimationFrame(animateRing)
    }

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor="hover"]')) {
        setState('hover')
      } else if (target.closest('p, h1, h2, h3, h4, h5, h6, span, [data-cursor="text"]')) {
        setState('text')
      } else if (target.closest('[data-cursor="drag"]')) {
        setState('drag')
      } else {
        setState('default')
      }
    }

    const handleLeave = () => setState('default')

    document.addEventListener('mousemove', moveDot)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleLeave)
    rafId = requestAnimationFrame(animateRing)

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
      {/* Dot — position exacte */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={[
            'rounded-full bg-[var(--accent)] transition-all duration-150',
            state === 'default' ? 'h-2 w-2' : '',
            state === 'hover'   ? 'h-1 w-1 opacity-0' : '',
            state === 'text'    ? 'h-4 w-0.5 rounded-none' : '',
            state === 'drag'    ? 'h-2 w-2' : '',
          ].join(' ')}
        />
      </div>

      {/* Ring — interpolé */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={[
            'rounded-full border border-[var(--accent)]/40 transition-all duration-200',
            state === 'default' ? 'h-8 w-8' : '',
            state === 'hover'   ? 'h-12 w-12 bg-[var(--accent)]/10' : '',
            state === 'text'    ? 'h-6 w-6 opacity-40' : '',
            state === 'drag'    ? 'h-16 w-16 bg-[var(--accent)]/5' : '',
          ].join(' ')}
        />
      </div>
    </>
  )
}
