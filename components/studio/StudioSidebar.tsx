'use client'

// components/studio/StudioSidebar.tsx — Rail de navigation du cockpit (220px)
// War-room dense — tokens DA uniquement. Exporte STUDIO_NAV (source unique,
// réutilisée par StudioHeader pour dériver le titre de la vue active).

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { JARVIS_MODEL, STUDIO_ROUTES } from '@/lib/studio/constants'

export interface StudioNavItem {
  label: string
  href: string
  icon: string
}

export const STUDIO_NAV: readonly StudioNavItem[] = [
  { label: 'Situation',    href: STUDIO_ROUTES.ROOT,        icon: '◎' },
  { label: 'Décisions',    href: '/studio/decisions',       icon: '⚖' },
  { label: 'Finance',      href: '/studio/finance',         icon: '€' },
  { label: 'Production',   href: '/studio/production',       icon: '⚙' },
  { label: 'Opportunités', href: '/studio/opportunites',    icon: '✶' },
] as const

export function isNavActive(href: string, pathname: string): boolean {
  return href === STUDIO_ROUTES.ROOT
    ? pathname === STUDIO_ROUTES.ROOT
    : pathname.startsWith(href)
}

export default function StudioSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="border-b border-border px-5 py-4">
        <p className="font-display text-2xl leading-none tracking-widest text-accent">
          TANUKI
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Control Center
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {STUDIO_NAV.map((item) => {
            const active = isNavActive(item.href, pathname)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-cursor="hover"
                  className={[
                    'flex items-center gap-3 rounded px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors',
                    active
                      ? 'bg-surface2 text-accent'
                      : 'text-muted2 hover:bg-surface2 hover:text-text',
                  ].join(' ')}
                >
                  <span aria-hidden className="w-4 text-center text-sm">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Statut Jarvis */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-wide text-text">
            Jarvis
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted">{JARVIS_MODEL}</p>
      </div>
    </aside>
  )
}
