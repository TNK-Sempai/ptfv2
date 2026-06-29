'use client'

// components/studio/StudioHeader.tsx — Barre supérieure du cockpit (dense, war-room)
// Dérive le titre de la vue active depuis STUDIO_NAV. Chips KPI en placeholder
// (branchés sur Supabase à une étape ultérieure).

import { usePathname } from 'next/navigation'
import { STUDIO_PROJECTS } from '@/lib/studio/constants'
import { STUDIO_NAV, isNavActive } from './StudioSidebar'

interface StatChip {
  label: string
  value: string
}

// Placeholders — câblés temps réel plus tard (alertes, MTD, décisions).
const STAT_CHIPS: readonly StatChip[] = [
  { label: 'Projets',   value: String(STUDIO_PROJECTS.length) },
  { label: 'Alertes',   value: '—' },
  { label: 'MTD',       value: '— €' },
  { label: 'Décisions', value: '—' },
] as const

export default function StudioHeader() {
  const pathname = usePathname()
  const current = STUDIO_NAV.find((item) => isNavActive(item.href, pathname))
  const title = current?.label ?? 'Studio'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg/80 px-6 backdrop-blur-sm">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-xl uppercase tracking-wide text-text">
          {title}
        </h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          / Situation room
        </span>
      </div>

      <div className="flex items-center gap-5">
        {STAT_CHIPS.map((chip) => (
          <div key={chip.label} className="flex flex-col items-end leading-none">
            <span className="font-mono text-sm tabular-nums text-text">
              {chip.value}
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">
              {chip.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 border-l border-border pl-5">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted2">
            En ligne
          </span>
        </div>
      </div>
    </header>
  )
}
