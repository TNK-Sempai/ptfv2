'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface WidgetCardProps {
  title: string
  description: string
  languages: string[]
  difficulty: Difficulty
  href: string
  /** Slot de prévisualisation libre — rendu dans l'encart 16:9 */
  preview?: ReactNode
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  beginner:     'bg-accent/10  text-accent  border-accent/20',
  intermediate: 'bg-muted2/10  text-muted2  border-muted2/20',
  advanced:     'bg-text/10    text-text    border-text/20',
}

const DIFFICULTY_KEY: Record<Difficulty, 'badge_beginner' | 'badge_intermediate' | 'badge_advanced'> = {
  beginner:     'badge_beginner',
  intermediate: 'badge_intermediate',
  advanced:     'badge_advanced',
}

export default function WidgetCard({
  title, description, languages, difficulty, href, preview,
}: WidgetCardProps) {
  const t = useTranslations('widgets')

  return (
    <Link
      href={href}
      data-cursor="hover"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-accent/20"
    >
      {/* Preview slot — 16:9, fond surface2 */}
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-surface2">
        {preview ?? (
          <span className="font-mono text-xs text-muted">{title}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Difficulty badge */}
        <span className={`w-fit rounded-full border px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider ${DIFFICULTY_STYLE[difficulty]}`}>
          {t(DIFFICULTY_KEY[difficulty])}
        </span>

        <h3 className="font-body text-base font-semibold text-text transition-colors duration-200 group-hover:text-accent">
          {title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {description}
        </p>

        {/* Language tags */}
        <ul className="flex flex-wrap gap-2" aria-label="Languages">
          {languages.map((lang) => (
            <li key={lang} className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted2">
              {lang}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
