'use client'

import { useRef, useEffect, createElement, type JSX } from 'react'
import gsap from 'gsap'
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrambleTextPlugin)

interface ScrambleTextProps {
  text: string
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * ScrambleText — Scramble animation on mount via GSAP ScrambleTextPlugin.
 * Respecte prefers-reduced-motion : affiche le texte directement si activé.
 * Guard touch : inactif (scramble visuel uniquement, pas de pointeur).
 * Cleanup obligatoire via gsap.context + ctx.revert().
 */
export default function ScrambleText({
  text,
  delay = 0,
  className,
  as = 'span',
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respecte prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.textContent = text
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(el, {
        duration: 1.2,
        scrambleText: {
          text,
          chars: 'upperCase',
          revealDelay: 0.3,
          speed: 0.8,
        } satisfies ScrambleTextPlugin.Vars,
        ease: 'none',
        delay,
      })
    }, ref)

    return () => ctx.revert()
  }, [text, delay])

  return createElement(
    as,
    { ref, className, 'aria-label': text },
    // Texte initial vide — GSAP le remplit via scrambleText
    '',
  )
}
