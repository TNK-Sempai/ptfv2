'use client'

import { useReveal, type UseRevealOptions } from './useReveal'

/**
 * useTextReveal — Alias rétro-compatible de {@link useReveal}.
 *
 * Conserve la signature historique (delay / y / once). L'IntersectionObserver
 * natif est remplacé en interne par Framer Motion `useInView` (fiable sous Lenis).
 *
 * @returns ref à placer sur l'élément HTML à animer.
 */
export function useTextReveal<T extends HTMLElement = HTMLElement>(
  options: UseRevealOptions = {}
) {
  return useReveal<T>(options)
}