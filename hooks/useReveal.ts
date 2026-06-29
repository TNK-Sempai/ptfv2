'use client'

import { useInView, type UseInViewOptions } from 'framer-motion'
import { useRef, useEffect } from 'react'

export interface UseRevealOptions {
  /** Déclenche une seule fois au premier passage (recommandé). Défaut : true */
  once?: boolean
  /** Fraction de visibilité requise pour déclencher (0–1 | 'some' | 'all'). Défaut : 0.1 */
  amount?: UseInViewOptions['amount']
  /** Délai avant le déclenchement de l'animation (ms). Défaut : 0 */
  delay?: number
  /** Amplitude du translateY initial (px). Défaut : 25 */
  y?: number
}

/**
 * useReveal — Reveal fade-up unifié basé sur Framer Motion `useInView`.
 *
 * Remplace les IntersectionObserver natifs (cassés sous Lenis) par le détecteur
 * de visibilité de Framer Motion. À l'entrée en viewport, l'élément passe de
 * {opacity:0, translateY(y)} à {opacity:1, none} via une transition CSS inline.
 *
 * Règles motion-system :
 * - Respect prefers-reduced-motion : révèle immédiatement sans animation.
 * - `once:true` par défaut : ne ré-anime pas au re-scroll.
 *
 * @returns ref à placer sur l'élément HTML à animer.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: UseRevealOptions = {}
) {
  const { once = true, amount = 0.1, delay = 0, y = 25 } = options
  const ref = useRef<T>(null)
  const isInView = useInView(ref, { once, amount })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    el.style.transition = `opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`
    el.style.opacity = isInView ? '1' : '0'
    el.style.transform = isInView ? 'none' : `translateY(${y}px)`
  }, [isInView, delay, y])

  return ref
}