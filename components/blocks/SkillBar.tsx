'use client'

import { useEffect, useRef, useState } from 'react'

export type SkillColor = 'accent' | 'blue' | 'purple'

export interface SkillBarProps {
  skill: string
  sublabel?: string
  /** 0 – 100 */
  level: number
  color?: SkillColor
}

const BAR_COLOR: Record<SkillColor, string> = {
  accent: 'bg-accent',
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
}

const LEVEL_COLOR: Record<SkillColor, string> = {
  accent: 'text-accent',
  blue:   'text-blue-400',
  purple: 'text-purple-400',
}

const DURATION = 1200

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function SkillBar({ skill, sublabel, level, color = 'accent' }: SkillBarProps) {
  const [barWidth, setBarWidth] = useState(0)
  const [count, setCount] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    // Guard touch — état final immédiat, sans animation
    if ('ontouchstart' in window && window.innerWidth < 1024) {
      setBarWidth(level)
      setCount(level)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting || hasRun.current) return

        hasRun.current = true
        observer.disconnect()

        // Déclenche la CSS transition élastique sur la barre
        setBarWidth(level)

        // CountUp synchronisé (easeOutCubic = pas d'overshoot sur le chiffre)
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1)
          setCount(Math.round(level * easeOutCubic(progress)))
          if (progress < 1) rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [level])

  return (
    <div ref={wrapperRef} className="flex flex-col gap-2">

      {/* Header : nom + sous-label + valeur */}
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-body text-sm font-semibold text-text">{skill}</span>
          {sublabel && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {sublabel}
            </span>
          )}
        </div>
        <span className={`shrink-0 font-mono text-sm tabular-nums ${LEVEL_COLOR[color]}`}>
          {count}<span className="text-xs text-muted">%</span>
        </span>
      </div>

      {/* Track — overflow-hidden clip l'overshoot de l'easing élastique */}
      <div
        role="progressbar"
        aria-label={`${skill} — ${level}%`}
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface2"
      >
        <div
          className={`h-full rounded-full ${BAR_COLOR[color]}`}
          style={{
            width: `${barWidth}%`,
            transition: `width ${DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          }}
        />
      </div>

    </div>
  )
}
