'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import WidgetCard, { type Difficulty } from '@/components/blocks/WidgetCard'
import { CountUp } from '@/components/ui/CountUp'
import { useTextReveal } from '@/hooks/useTextReveal'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import type { Widget, WidgetType, WidgetDifficulty } from '@/lib/types'

// ─── Fallback statique (Notion vide / indisponible) ─────────────────────────────

const FALLBACK_WIDGETS: Widget[] = [
  {
    id: 'fallback-compteur-js',
    title: 'Compteur JS',
    slug: 'compteur-js',
    type: 'widget',
    languages: ['HTML', 'JS'],
    difficulty: 'Débutant',
    description:
      'Un compteur cliquable — increment, decrement, reset. Le premier pas pour comprendre l’état et les écouteurs d’événements.',
    longDescription: '',
    code: null,
    demoComponent: null,
    status: 'published',
    votes: 0,
    views: 0,
    publishedAt: null,
  },
  {
    id: 'fallback-calculatrice-monique',
    title: 'Calculatrice Monique',
    slug: 'calculatrice-monique',
    type: 'widget',
    languages: ['HTML', 'CSS', 'JS'],
    difficulty: 'Intermédiaire',
    description:
      'Une calculatrice complète : parsing des opérations, gestion du clavier, et une grille de boutons stylée au pixel près.',
    longDescription: '',
    code: null,
    demoComponent: null,
    status: 'published',
    votes: 0,
    views: 0,
    publishedAt: null,
  },
  {
    id: 'fallback-palette',
    title: 'Palette',
    slug: 'palette',
    type: 'widget',
    languages: ['CSS', 'JS'],
    difficulty: 'Débutant',
    description:
      'Un générateur de palette de couleurs avec copie au clic. Pour apprivoiser le HSL et l’API Clipboard.',
    longDescription: '',
    code: null,
    demoComponent: null,
    status: 'published',
    votes: 0,
    views: 0,
    publishedAt: null,
  },
]

// ─── Mappings & options de filtres ──────────────────────────────────────────────

const DIFFICULTY_TO_CARD: Record<WidgetDifficulty, Difficulty> = {
  Débutant: 'beginner',
  Intermédiaire: 'intermediate',
  Avancé: 'advanced',
}

type TypeFilter = 'all' | WidgetType
type DifficultyFilter = 'all' | WidgetDifficulty
type LanguageFilter = 'all' | 'HTML' | 'CSS' | 'JS' | 'React' | 'PHP' | 'Python'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'widget', label: 'Widget' },
  { value: 'article', label: 'Article' },
  { value: 'fondations', label: 'Fondations' },
]

const LANGUAGE_OPTIONS: { value: LanguageFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'HTML', label: 'HTML' },
  { value: 'CSS', label: 'CSS' },
  { value: 'JS', label: 'JS' },
  { value: 'React', label: 'React' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Python', label: 'Python' },
]

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'Débutant', label: 'Débutant' },
  { value: 'Intermédiaire', label: 'Intermédiaire' },
  { value: 'Avancé', label: 'Avancé' },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────

interface FilterRowProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  active: T
  onSelect: (value: T) => void
}

function FilterRow<T extends string>({ label, options, active, onSelect }: FilterRowProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 min-w-[5.5rem] font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={opt.value}
            type="button"
            data-cursor="hover"
            aria-pressed={isActive}
            onClick={() => onSelect(opt.value)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors duration-200 ${
              isActive
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border text-muted2 hover:border-accent/20 hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Client Component ───────────────────────────────────────────────────────────

/**
 * WidgetsContent — annuaire 1001 Widgets.
 * Filtres temps réel (type / langage / difficulté) côté client,
 * compteur animé du total, grille de WidgetCard avec reveal en cascade.
 */
export default function WidgetsContent({ widgets }: { widgets: Widget[] }) {
  const locale = useLocale()
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)

  // Fallback statique si Notion est vide / indisponible
  const source = widgets.length > 0 ? widgets : FALLBACK_WIDGETS

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [langFilter, setLangFilter] = useState<LanguageFilter>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')

  const filtered = useMemo(() => {
    return source.filter((w) => {
      if (typeFilter !== 'all' && w.type !== typeFilter) return false
      if (difficultyFilter !== 'all' && w.difficulty !== difficultyFilter) return false
      if (
        langFilter !== 'all' &&
        !w.languages.some((l) => l.toLowerCase() === langFilter.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [source, typeFilter, difficultyFilter, langFilter])

  // Reveals
  const labelRef = useTextReveal<HTMLParagraphElement>({ y: 12, delay: 0 })
  const titleRef = useTextReveal<HTMLHeadingElement>({ y: 28, delay: 80 })
  const subtitleRef = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 160 })
  // re-keyé sur les filtres pour relancer le stagger à chaque changement de liste
  const gridRef = useStaggerReveal<HTMLDivElement>({ stagger: 60, y: 22 })
  const suggestRef = useTextReveal<HTMLDivElement>({ y: 24 })

  return (
    <main className="flex flex-col gap-16 py-12 md:py-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-6">
        <p
          ref={labelRef}
          className="font-mono text-[11px] uppercase tracking-widest text-accent"
        >
          1001 Widgets
        </p>

        <h1
          ref={titleRef}
          className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[0.95] tracking-tight text-text"
        >
          Apprends en construisant.
        </h1>

        <p
          ref={subtitleRef}
          className="max-w-2xl font-body text-base leading-relaxed text-muted2 md:text-lg"
        >
          Des composants à reproduire, comprendre et personnaliser. Pour les devs
          juniors qui veulent progresser vraiment.
        </p>

        {/* Compteur total */}
        <div className="mt-2 flex items-baseline gap-3">
          <CountUp
            to={source.length}
            duration={1400}
            className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none text-accent"
          />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            widgets disponibles
          </span>
        </div>
      </header>

      {/* ── Filtres ──────────────────────────────────────────────────────── */}
      <section aria-label="Filtres" className="flex flex-col gap-4 border-y border-border py-6">
        <FilterRow label="Type" options={TYPE_OPTIONS} active={typeFilter} onSelect={setTypeFilter} />
        <FilterRow label="Langage" options={LANGUAGE_OPTIONS} active={langFilter} onSelect={setLangFilter} />
        <FilterRow
          label="Niveau"
          options={DIFFICULTY_OPTIONS}
          active={difficultyFilter}
          onSelect={setDifficultyFilter}
        />
      </section>

      {/* ── Grille ───────────────────────────────────────────────────────── */}
      <section aria-label="Annuaire des widgets">
        {filtered.length === 0 ? (
          <p className="py-16 text-center font-body text-sm text-muted">
            Aucun widget ne correspond à ces filtres.
          </p>
        ) : (
          <div
            key={`${typeFilter}-${langFilter}-${difficultyFilter}`}
            ref={gridRef}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((w) => (
              <WidgetCard
                key={w.id}
                title={w.title}
                description={w.description}
                languages={w.languages}
                difficulty={DIFFICULTY_TO_CARD[w.difficulty]}
                href={lp(`/widgets/${w.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Suggérer un widget ───────────────────────────────────────────── */}
      <section
        ref={suggestRef}
        className="card-shine flex flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-8 md:flex-row md:items-center md:justify-between md:p-10"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl uppercase tracking-tight text-text md:text-3xl">
            Suggérer un widget
          </h2>
          <p className="max-w-xl font-body text-sm leading-relaxed text-muted2">
            Tu veux coder quelque chose de précis&nbsp;? Propose-le à la communauté.
          </p>
        </div>
        <Link
          href={lp('/widgets/suggest')}
          data-cursor="hover"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
        >
          Proposer un widget&nbsp;→
        </Link>
      </section>

    </main>
  )
}
