'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// registerPlugin est idempotent — sûr même si LenisProvider/SplitText l'enregistrent aussi.
gsap.registerPlugin(ScrollTrigger)

/**
 * useDepthGallery — Effet « Depth Gallery » au scroll (CSS multi-layers + GSAP ScrollTrigger).
 *
 * Pour chaque section passée dans `sectionsRef`, applique 4 effets pilotés au scroll,
 * en ciblant des éléments enfants par classe (à poser dans le JSX par KAEL) :
 *
 * - `.depth-image`        → parallax (lag ≈ 60 % de la vitesse de scroll) + scale 1 → 1.15
 *                           pendant l'entrée en viewport. `scrub: 1`.
 * - `.depth-title-inner`  → reveal masqué `translateY(100%) → 0`. `scrub: false`, `once: true`.
 * - `.depth-watermark`    → scale 1 → 1.3 + opacity 0.03 → 0.15. `scrub: 1`.
 *
 * Règles motion-system :
 * - Guard touch : inactif si `'ontouchstart' in window && innerWidth < 1024`
 *   → les éléments restent dans leur état CSS de repos (visibles).
 * - Respect `prefers-reduced-motion` : aucun effet, état de repos conservé.
 * - Cleanup obligatoire : `ctx.revert()` (purge tweens + ScrollTriggers).
 *
 * @param sectionsRef ref vers le tableau d'éléments `<section>` (rempli par ref-callbacks).
 */
export function useDepthGallery(sectionsRef: RefObject<HTMLElement[]>) {
  useEffect(() => {
    const sections = sectionsRef.current
    if (!sections || sections.length === 0) return

    // Guard touch — jamais de pointer:coarse (non fiable).
    const isTouch = 'ontouchstart' in window && window.innerWidth < 1024
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    const ctx = gsap.context(() => {
      for (const section of sections) {
        const image = section.querySelector<HTMLElement>('.depth-image')
        const titleInner = section.querySelector<HTMLElement>('.depth-title-inner')
        const watermark = section.querySelector<HTMLElement>('.depth-watermark')

        // 1. Parallax image — lag ≈ 60 % de la vitesse de scroll (travel sur toute la section).
        if (image) {
          gsap.fromTo(
            image,
            { yPercent: -10 },
            {
              yPercent: 10,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          )

          // 2. Scale image 1 → 1.15 pendant l'entrée en viewport.
          gsap.fromTo(
            image,
            { scale: 1 },
            {
              scale: 1.15,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
              },
            }
          )
        }

        // 3. Titre masqué — translateY(100%) → 0, une seule fois, sans scrub.
        if (titleInner) {
          gsap.fromTo(
            titleInner,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                once: true,
              },
            }
          )
        }

        // 4. Watermark — scale 1 → 1.3, opacity 0.03 → 0.15, scrubbé sur la section.
        if (watermark) {
          gsap.fromTo(
            watermark,
            { scale: 1, opacity: 0.03 },
            {
              scale: 1.3,
              opacity: 0.15,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          )
        }
      }

      // Recalage des positions une fois les triggers créés (cohérent avec Lenis).
      ScrollTrigger.refresh()
    })

    return () => {
      ctx.revert()
    }
  }, [sectionsRef])
}