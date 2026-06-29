'use client'

import { useReveal, type UseRevealOptions } from './useReveal'

/**
 * useImageReveal — Alias rétro-compatible de {@link useReveal}.
 *
 * Conserve la signature historique (delay). L'IntersectionObserver natif est
 * remplacé en interne par Framer Motion `useInView` (fiable sous Lenis).
 *
 * @returns ref à placer sur le conteneur de l'image.
 */
export function useImageReveal<T extends HTMLElement = HTMLElement>(
  options: UseRevealOptions = {}
) {
  return useReveal<T>(options)
}