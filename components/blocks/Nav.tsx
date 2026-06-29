'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'

type ProjectKey = 'chessbot' | 'opti_troc' | 'yummr' | 'big_factory' | 'time_event'

const PROJECTS: Array<{ key: ProjectKey; slug: string }> = [
  { key: 'chessbot',    slug: 'tanukichessbot' },
  { key: 'opti_troc',   slug: 'opti-troc'      },
  { key: 'yummr',       slug: 'yummr'          },
  { key: 'big_factory', slug: 'big-factory'    },
  { key: 'time_event',  slug: 'time-event'     },
]

function toLocalePath(pathname: string, targetLocale: string): string {
  const stripped = pathname.startsWith('/en') ? pathname.slice(3) || '/' : pathname
  if (targetLocale === 'en') return stripped === '/' ? '/en' : `/en${stripped}`
  return stripped
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === '/en'
  return pathname === href || pathname === `/en${href}`
}

export default function Nav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Préfixe locale — fr (défaut) sans préfixe, autres locales préfixées.
  const lp = (path: string) => (locale === 'fr' ? path : `/${locale}${path}`)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href={lp('/')} className="font-display text-2xl tracking-widest text-accent">
          TANUKI
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8 text-sm text-muted2">
          <li>
            <Link href={lp('/about')} aria-current={isActive(pathname, '/about') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('about')}
            </Link>
          </li>

          {/* Projets — Link cliquable + dropdown hover */}
          <li className="group relative">
            <Link
              href={lp('/projects')}
              aria-current={isActive(pathname, '/projects') ? 'page' : undefined}
              className="flex select-none items-center gap-1 transition-colors group-hover:text-text"
            >
              {t('projects')}
              <svg
                width="10" height="6" viewBox="0 0 10 6"
                className="mt-px fill-current opacity-60 transition-transform duration-200 group-hover:rotate-180"
                aria-hidden="true"
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </Link>

            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <ul className="min-w-[200px] rounded-lg border border-border bg-surface2 p-2 shadow-2xl">
                {PROJECTS.map(({ key, slug }) => (
                  <li key={key}>
                    <Link
                      href={lp(`/projects/${slug}`)}
                      aria-current={isActive(pathname, `/projects/${slug}`) ? 'page' : undefined}
                      className="block rounded px-3 py-2 text-sm text-muted2 transition-colors hover:bg-surface hover:text-text"
                    >
                      {t(`projects_list.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <Link href={lp('/skills')} aria-current={isActive(pathname, '/skills') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('skills')}
            </Link>
          </li>
          <li>
            <Link href={lp('/widgets')} aria-current={isActive(pathname, '/widgets') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('widgets')}
            </Link>
          </li>
          <li>
            <Link href={lp('/contact')} aria-current={isActive(pathname, '/contact') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('contact')}
            </Link>
          </li>
        </ul>

        {/* Right: locale switcher + hamburger */}
        <div className="flex items-center gap-5">

          {/* Locale switcher */}
          <div className="flex items-center gap-2 font-mono text-xs uppercase">
            <Link
              href={toLocalePath(pathname, 'fr')}
              className={locale === 'fr' ? 'text-accent' : 'text-muted2 transition-colors hover:text-text'}
            >
              FR
            </Link>
            <span className="text-muted" aria-hidden="true">/</span>
            <Link
              href={toLocalePath(pathname, 'en')}
              className={locale === 'en' ? 'text-accent' : 'text-muted2 transition-colors hover:text-text'}
            >
              EN
            </Link>
          </div>

          {/* Hamburger — mobile only : 2 lignes asymétriques → croix */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className="group relative h-6 w-6 lg:hidden"
          >
            {/* Ligne 1 — 24px, pivote en \ à l'ouverture */}
            <span
              className={`absolute left-0 block h-[1.5px] w-6 rounded-xs bg-text transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-2.25'
              }`}
            />
            {/* Ligne 2 — 16px décalée à droite ; s'étend à 24px au hover, pivote en / à l'ouverture */}
            <span
              className={`absolute right-0 block h-[1.5px] rounded-xs bg-text transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                menuOpen ? 'top-1/2 w-6 -translate-y-1/2 -rotate-45' : 'top-3.75 w-4 group-hover:w-6'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          menuOpen ? 'max-h-screen border-t border-border' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col gap-1 bg-surface px-6 py-4 text-sm text-muted2">
          <li>
            <Link href={lp('/about')} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/about') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('about')}
            </Link>
          </li>
          <li className="py-2">
            <Link
              href={lp('/projects')}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(pathname, '/projects') ? 'page' : undefined}
              className="block pb-2 text-xs uppercase tracking-widest text-muted hover:text-text"
            >
              {t('projects')}
            </Link>
            <ul className="ml-4 flex flex-col gap-1">
              {PROJECTS.map(({ key, slug }) => (
                <li key={key}>
                  <Link
                    href={lp(`/projects/${slug}`)}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(pathname, `/projects/${slug}`) ? 'page' : undefined}
                    className="block py-1 hover:text-text"
                  >
                    {t(`projects_list.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link href={lp('/skills')} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/skills') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('skills')}
            </Link>
          </li>
          <li>
            <Link href={lp('/widgets')} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/widgets') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('widgets')}
            </Link>
          </li>
          <li>
            <Link href={lp('/contact')} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/contact') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('contact')}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
