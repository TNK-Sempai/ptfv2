'use client'
import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ScrollTrigger doit être enregistré avant de piloter .update()/.refresh().
// registerPlugin est idempotent — sûr même si SplitText l'enregistre aussi.
gsap.registerPlugin(ScrollTrigger)

// Singleton module-level — une seule instance Lenis dans toute l'app.
// Accessible aux composants GSAP sans passer par React Context.
let _lenis: Lenis | null = null

/**
 * Provider global smooth-scroll.
 * Monter une seule fois dans app/[locale]/layout.tsx.
 * Cleanup : cancelAnimationFrame + lenis.destroy() au unmount.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    _lenis = instance

    // Synchronise ScrollTrigger sur le scroll lissé de Lenis : sans ça,
    // ScrollTrigger (et le calcul de viewport) ignore la position réelle et
    // les déclencheurs au scroll (whileInView GSAP, ScrollTrigger) ne partent pas.
    instance.on('scroll', ScrollTrigger.update)
    // Recalcule les positions des triggers après l'init de Lenis.
    ScrollTrigger.refresh()

    // RAF loop — rafId mis à jour à chaque frame pour un cancel propre
    let rafId: number
    const raf = (time: number) => {
      instance.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      instance.destroy()
      _lenis = null
    }
  }, [])

  return <>{children}</>
}

/**
 * Retourne l'instance Lenis courante.
 * Usage GSAP : getLenis()?.on('scroll', ScrollTrigger.update)
 */
export function getLenis(): Lenis | null {
  return _lenis
}
