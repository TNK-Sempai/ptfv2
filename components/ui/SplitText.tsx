'use client'
import { useEffect, useRef, ElementType } from 'react'
import gsap from 'gsap'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(GSAPSplitText, ScrollTrigger)

interface SplitTextProps {
  text: string
  by?: 'chars' | 'words' | 'lines'
  /** Délai initial avant le début de l'animation (secondes) */
  delay?: number
  /** Écart entre chaque élément animé (secondes) */
  stagger?: number
  className?: string
  /** Tag HTML rendu — défaut "div" */
  as?: ElementType
  /** Déclenchement au scroll ou immédiat — défaut "scroll" */
  trigger?: 'scroll' | 'immediate'
}

/**
 * Wrapper GSAP SplitText.
 * Guard touch : sur mobile/tablette (ontouchstart + innerWidth < 1024),
 * le texte est rendu sans animation.
 * aria-label sur le parent pour les lecteurs d'écran.
 * Cleanup : ctx.revert() + split.revert() dans useEffect.
 */
export function SplitText({
  text,
  by = 'lines',
  delay = 0,
  stagger,
  className,
  as: Tag = 'div',
  trigger = 'scroll',
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  const defaultStagger = by === 'chars' ? 0.03 : by === 'words' ? 0.05 : 0.08

  useEffect(() => {
    if (!ref.current) return

    // Guard touch obligatoire
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    const el = ref.current
    const split = new GSAPSplitText(el, { type: by })

    const targets =
      by === 'chars' ? split.chars
      : by === 'words' ? split.words
      : split.lines

    const from: gsap.TweenVars = {
      opacity: 0,
      y: by === 'chars' ? 20 : 40,
    }

    const to: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay,
      stagger: stagger ?? defaultStagger,
    }

    const ctx = gsap.context(() => {
      if (trigger === 'scroll') {
        gsap.from(targets, {
          ...from,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          ...to,
        })
      } else {
        gsap.from(targets, { ...from, ...to })
      }
    }, el)

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [by, delay, stagger, trigger, defaultStagger])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text}
    </Tag>
  )
}
