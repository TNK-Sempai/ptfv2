import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getWidgetBySlug } from '@/lib/notion'
import { buildMetadata } from '@/lib/metadata'
import type { WidgetDifficulty } from '@/lib/types'
import { DemoSlot } from '@/components/widgets/DemoSlot'
import CssPlayground from './CssPlayground'
import WidgetComments from './WidgetComments'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const widget = await getWidgetBySlug(slug)

  if (!widget) {
    return buildMetadata({ title: 'Widget introuvable — Tanuki Sempaï', locale: loc, path: '/widgets' })
  }

  return buildMetadata({
    title: `${widget.title} — 1001 Widgets`,
    description: widget.description,
    locale: loc,
    path: `/widgets/${widget.slug}`,
  })
}

// ─── Difficulté ───────────────────────────────────────────────────────────────

const DIFFICULTY_CLASS: Record<WidgetDifficulty, string> = {
  Débutant: 'text-accent border-accent/40',
  Intermédiaire: 'text-text border-text/30',
  Avancé: 'text-muted2 border-muted2/40',
}

// ─── Parsing pédagogique ───────────────────────────────────────────────────────

/** Découpe un texte en paragraphes sur les sauts de ligne doubles. */
function splitParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

type Step = { comment: string; code: string }

/**
 * Découpe le code source en étapes : chaque bloc de commentaires `//` suivi de
 * son code forme une étape. Les lignes `//` consécutives sont fusionnées dans le
 * commentaire ; le code court jusqu'au prochain commentaire.
 */
function parseSteps(code: string): Step[] {
  const steps: Step[] = []
  let current: Step | null = null
  let inHeader = false

  for (const line of code.split('\n')) {
    const isComment = line.trim().startsWith('//')

    if (isComment) {
      const text = line.trim().replace(/^\/\/\s?/, '')
      if (!current || !inHeader) {
        current = { comment: text, code: '' }
        steps.push(current)
      } else {
        current.comment += current.comment ? ` ${text}` : text
      }
      inHeader = true
    } else {
      if (!current) {
        current = { comment: '', code: line }
        steps.push(current)
      } else {
        current.code += current.code ? `\n${line}` : line
      }
      inHeader = false
    }
  }

  return steps
    .map((s) => ({ comment: s.comment.trim(), code: s.code.replace(/^\n+|\n+$/g, '') }))
    .filter((s) => s.comment || s.code.trim())
}

type Block = { kind: 'piege' | 'fix' | 'optim' | 'react' | 'text'; text: string }

/**
 * Classe chaque paragraphe de `upgrade` selon son préfixe :
 * ❌ → piège, ✅ → fix, OPTIMISATION → optim, VERS REACT → callout React, sinon texte.
 */
function parseUpgrade(raw: string): Block[] {
  return splitParagraphs(raw).map((p) => {
    if (p.startsWith('❌')) return { kind: 'piege', text: p.replace(/^❌\s*/, '') }
    if (p.startsWith('✅')) return { kind: 'fix', text: p.replace(/^✅\s*/, '') }
    if (p.startsWith('OPTIMISATION')) return { kind: 'optim', text: p.replace(/^OPTIMISATION\s*:?\s*/, '') }
    if (p.startsWith('VERS REACT')) return { kind: 'react', text: p.replace(/^VERS REACT\s*:?\s*/, '') }
    return { kind: 'text', text: p }
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WidgetPage({ params }: Props) {
  const { slug } = await params
  const widget = await getWidgetBySlug(slug)

  if (!widget) notFound()

  const whyParagraphs = widget.longDescription ? splitParagraphs(widget.longDescription) : []
  const steps = widget.code ? parseSteps(widget.code) : []
  const upgradeBlocks = widget.upgrade ? parseUpgrade(widget.upgrade) : []

  // Numérotation continue des blocs OPTIMISATION (les autres kinds n'ont pas de numéro).
  let optimSeq = 0
  const numberedUpgrade = upgradeBlocks.map((block) => ({
    block,
    n: block.kind === 'optim' ? ++optimSeq : 0,
  }))

  return (
    <article className="flex flex-col gap-24 py-12">
      {/* Retour */}
      <Link
        href="/widgets"
        className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-muted2 transition-colors hover:text-text"
      >
        <span aria-hidden className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Retour aux widgets
      </Link>

      {/* 1 — HERO : demo live / méta */}
      <header className="grid items-center gap-10 lg:grid-cols-2">
        {/* Colonne gauche : slot demo live */}
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-border bg-surface2 p-6">
          {widget.demoComponent ? (
            <DemoSlot name={widget.demoComponent} />
          ) : (
            <span className="font-mono text-xs text-muted">Demo non disponible</span>
          )}
        </div>

        {/* Colonne droite : titre, description, tags, difficulté */}
        <div className="flex flex-col gap-5">
          <span
            className={`w-fit rounded-full border px-3 py-1 font-mono text-xs ${DIFFICULTY_CLASS[widget.difficulty]}`}
          >
            {widget.difficulty}
          </span>
          <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-text md:text-7xl">
            {widget.title}
          </h1>
          <p className="max-w-md font-body text-base leading-relaxed text-muted2">
            {widget.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {widget.languages.map((lang) => (
              <span
                key={lang}
                className="rounded bg-surface2 px-3 py-1 font-mono text-xs text-muted2"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 2 — POURQUOI CE LANGAGE */}
      {whyParagraphs.length > 0 && (
        <section className="border-l-2 border-accent bg-surface px-8 py-10">
          <h2 className="mb-6 font-display text-4xl text-text">Pourquoi ce langage</h2>
          <div className="flex max-w-2xl flex-col gap-4">
            {whyParagraphs.map((para, i) => (
              <p key={i} className="font-body text-base leading-relaxed text-muted2">
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 3 — COMMENT ÇA MARCHE : étapes numérotées */}
      {steps.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="mb-4 font-display text-4xl text-text">Comment ça marche</h2>
          {steps.map((step, i) => (
            <div key={i} className="step">
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="step-content">
                {step.comment && <p className="step-comment">// {step.comment}</p>}
                {step.code.trim() && <pre className="step-code">{step.code}</pre>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 4 — PIÈGES & OPTIMISATIONS */}
      {numberedUpgrade.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-4xl text-text">Pièges &amp; optimisations</h2>
          <div className="flex max-w-2xl flex-col gap-5">
            {numberedUpgrade.map(({ block, n }, i) => {
              switch (block.kind) {
                case 'piege':
                  return (
                    <div key={i} className="flex flex-wrap items-baseline gap-3">
                      <span className="badge-piege">Piège</span>
                      <p className="flex-1 font-body text-base leading-relaxed text-muted2">{block.text}</p>
                    </div>
                  )
                case 'fix':
                  return (
                    <div key={i} className="flex flex-wrap items-baseline gap-3">
                      <span className="badge-fix">Fix</span>
                      <p className="flex-1 font-body text-base leading-relaxed text-muted2">{block.text}</p>
                    </div>
                  )
                case 'optim':
                  return (
                    <div key={i} className="flex flex-wrap items-baseline gap-3">
                      <span className="badge-optim">Optimisation {n}</span>
                      <p className="flex-1 font-body text-base leading-relaxed text-muted2">{block.text}</p>
                    </div>
                  )
                case 'react':
                  return (
                    <div key={i} className="react-callout">
                      <span className="badge-fix">→ React</span>
                      <p className="mt-3 font-body text-base leading-relaxed text-muted2">{block.text}</p>
                    </div>
                  )
                default:
                  return (
                    <p key={i} className="font-body text-base leading-relaxed text-muted2">
                      {block.text}
                    </p>
                  )
              }
            })}
          </div>
        </section>
      )}

      {/* 5 — CSS Playground */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-4xl text-text">CSS Playground</h2>
        <p className="max-w-2xl font-body text-base text-muted2">
          Édite les variables CSS et observe le résultat en temps réel.
        </p>
        <CssPlayground demoComponent={widget.demoComponent} />
      </section>

      {/* 6 — Commentaires */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-4xl text-text">Commentaires</h2>
        <WidgetComments widgetSlug={widget.slug} />
      </section>
    </article>
  )
}
