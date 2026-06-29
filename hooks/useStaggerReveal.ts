'use client'

import { useInView, type UseInViewOptions } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface UseStaggerRevealOptions {
  /** Délai entre chaque enfant (ms). Défaut : 80 */
  stagger?: number
  /** Amplitude du translateY initial (px). Défaut : 20 */
  y?: number
  /**
   * Sélecteur CSS pour cibler des sous-éléments spécifiques.
   * Si omis, cible les enfants directs du conteneur.
   */
  selector?: string
  /** Déclenche une seule fois au premier passage. Défaut : true */
  once?: boolean
  /** Fraction de visibilité requise (0–1 | 'some' | 'all'). Défaut : 0.1 */
  amount?: UseInViewOptions['amount']
}

/**
 * useStaggerReveal — Reveal en cascade des enfants, basé sur Framer Motion `useInView`.
 *
 * Remplace l'IntersectionObserver natif (cassé sous Lenis). À l'entrée en viewport
 * du conteneur, ses enfants directs (ou les éléments ciblés par `selector`)
 * s'animent en cascade avec un délai incrémental.
 *
 * Règles motion-system :
 * - Respect prefers-reduced-motion : révèle tous les enfants immédiatement.
 * - `once:true` par défaut.
 * - Le stagger naturel répartit les animations (≤ 4 simultanées).
 *
 * @returns ref à placer sur le conteneur (pas sur les enfants).
 */
export function useStaggerReveal<T extends HTMLElement = HTMLElement>(
  options: UseStaggerRevealOptions = {}
) {
  const { stagger = 80, y = 20, selector, once = true, amount = 0.1 } = options
  const ref = useRef<T>(null)
  const isInView = useInView(ref, { once, amount })

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const children = selector
      ? Array.from(container.querySelectorAll<HTMLElement>(selector))
      : Array.from(container.children).filter(
          (c): c is HTMLElement => c instanceof HTMLElement
        )

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      for (const child of children) {
        child.style.opacity = '1'
        child.style.transform = 'none'
      }
      return
    }

    children.forEach((child, index) => {
      const delayMs = index * stagger
      child.style.transition = [
        `opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delayMs}ms`,
        `transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delayMs}ms`,
      ].join(', ')
      child.style.opacity = isInView ? '1' : '0'
      child.style.transform = isInView ? 'none' : `translateY(${y}px)`
    })
  }, [isInView, stagger, y, selector])

  return ref
}