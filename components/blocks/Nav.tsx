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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="font-display text-2xl tracking-widest text-accent">
          TANUKI
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8 text-sm text-muted2">
          <li>
            <Link href="/about" aria-current={isActive(pathname, '/about') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('about')}
            </Link>
          </li>

          {/* Projets — dropdown hover */}
          <li className="group relative">
            <span aria-haspopup="true" className="flex cursor-default select-none items-center gap-1 transition-colors group-hover:text-text">
              {t('projects')}
              <svg
                width="10" height="6" viewBox="0 0 10 6"
                className="mt-px fill-current opacity-60 transition-transform duration-200 group-hover:rotate-180"
                aria-hidden="true"
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </span>

            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <ul className="min-w-[200px] rounded-lg border border-border bg-surface2 p-2 shadow-2xl">
                {PROJECTS.map(({ key, slug }) => (
                  <li key={key}>
                    <Link
                      href={`/projects/${slug}`}
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
            <Link href="/skills" aria-current={isActive(pathname, '/skills') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('skills')}
            </Link>
          </li>
          <li>
            <Link href="/widgets" aria-current={isActive(pathname, '/widgets') ? 'page' : undefined} className="transition-colors hover:text-text">
              {t('widgets')}
            </Link>
          </li>
          <li>
            <Link href="/contact" aria-current={isActive(pathname, '/contact') ? 'page' : undefined} className="transition-colors hover:text-text">
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

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={`block h-px w-6 origin-center bg-text transition-transform duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-text transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 origin-center bg-text transition-transform duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
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
            <Link href="/about" onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/about') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('about')}
            </Link>
          </li>
          <li className="py-2">
            <span className="block pb-2 text-xs uppercase tracking-widest text-muted">{t('projects')}</span>
            <ul className="ml-4 flex flex-col gap-1">
              {PROJECTS.map(({ key, slug }) => (
                <li key={key}>
                  <Link
                    href={`/projects/${slug}`}
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
            <Link href="/skills" onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/skills') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('skills')}
            </Link>
          </li>
          <li>
            <Link href="/widgets" onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/widgets') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('widgets')}
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, '/contact') ? 'page' : undefined} className="block py-2 hover:text-text">
              {t('contact')}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
