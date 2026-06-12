'use client'
import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** Valeur cible */
  to: number
  /** Valeur de départ — défaut 0 */
  from?: number
  /** Durée en ms — défaut 1200 */
  duration?: number
  /** Décimales à afficher — défaut 0 */
  decimals?: number
  /** Suffixe affiché après le nombre (ex: "%", "+", "k") */
  suffix?: string
  /** Préfixe affiché avant le nombre */
  prefix?: string
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Chiffre animé déclenché à l'entrée dans le viewport (IntersectionObserver).
 * Une seule fois — pas de re-trigger. Cleanup observer obligatoire.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1200,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: CountUpProps) {
  const [value, setValue] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting || hasRun.current) return

        hasRun.current = true
        observer.disconnect()

        const startTime = performance.now()
        const range = to - from

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const current = from + range * easeOutCubic(progress)
          setValue(current)
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [from, to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
