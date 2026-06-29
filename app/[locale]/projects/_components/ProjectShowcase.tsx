'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PROJECTS } from '@/lib/constants'
import { useTextReveal } from '@/hooks/useTextReveal'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProjectShowcaseStatus = 'live' | 'wip' | 'soon'

export interface ProjectShowcaseProps {
  /** Index numéroté du projet, ex. "02" */
  index: string
  /** Nombre total de projets, ex. "05" */
  total: string
  /** Titre hero (affiché en display, déjà en casse voulue) */
  title: string
  /** Accroche courte sous le titre */
  tagline: string
  /** Paragraphe descriptif */
  description: string
  /** Tags de stack technique */
  tags: readonly string[]
  /** Statut + libellé déjà traduit */
  status: ProjectShowcaseStatus
  statusLabel: string
  /** CTA externe — null si le projet n'a pas de lien public */
  cta: { href: string; label: string } | null
  /** Libellé du retour vers /projects (traduit) */
  backLabel: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<ProjectShowcaseStatus, string> = {
  live: 'text-accent border-accent/40',
  wip:  'text-muted2 border-muted2/40',
  soon: 'text-muted border-muted/40',
}

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * ProjectShowcase — hero animé partagé des pages détail projet.
 *
 * Composant client colocalisé : il porte les hooks reveal (useTextReveal +
 * useStaggerReveal), ce qui permet aux Server Components `page.tsx` de conserver
 * leur export `generateMetadata`. Les contenus (FR/EN) sont injectés en props
 * depuis chaque page serveur.
 */
export default function ProjectShowcase({
  index,
  total,
  title,
  tagline,
  description,
  tags,
  status,
  statusLabel,
  cta,
  backLabel,
}: ProjectShowcaseProps) {
  // Reveals texte — cascade de délais croissants
  const eyebrowRef = useTextReveal<HTMLDivElement>({ y: 12, delay: 0 })
  const titleRef   = useTextReveal<HTMLHeadingElement>({ y: 36, delay: 80 })
  const taglineRef = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 180 })
  const descRef    = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 260 })
  // Tags — stagger
  const tagsRef = useStaggerReveal<HTMLUListElement>({ stagger: 50, y: 14 })
  // Footer actions — stagger
  const actionsRef = useStaggerReveal<HTMLDivElement>({ stagger: 80, y: 16 })

  // Cover dérivée de PROJECTS (source de vérité constants.ts) via le titre —
  // les pages serveur n'injectent pas le slug, on matche donc sur le title.
  const coverImage = PROJECTS.find(
    (p) => p.title.toUpperCase() === title.toUpperCase(),
  )?.coverImage

  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-6 pb-24 pt-32 md:px-16 lg:px-24">
      <div className="mx-auto w-full max-w-5xl">

        {/* Cover hero */}
        {coverImage && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-sm border border-border">
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Eyebrow — index + statut */}
        <div
          ref={eyebrowRef}
          className="mb-8 flex items-center gap-3"
        >
          <span className="font-mono text-xs tracking-widest text-accent">
            {index}/{total}
          </span>
          <span className="h-px flex-1 max-w-24 bg-border" aria-hidden="true" />
          <span className={`rounded border px-2 py-0.5 font-mono text-xs ${STATUS_CLASS[status]}`}>
            {statusLabel}
          </span>
        </div>

        {/* Titre hero */}
        <h1
          ref={titleRef}
          className="font-display text-[clamp(3rem,9vw,9rem)] uppercase leading-none tracking-tight text-text"
        >
          {title}
        </h1>

        {/* Accroche */}
        <p
          ref={taglineRef}
          className="mt-5 font-serif text-xl italic text-muted2 md:text-2xl"
        >
          {tagline}
        </p>

        {/* Séparateur */}
        <div className="my-10 h-px w-16 bg-border" aria-hidden="true" />

        {/* Description */}
        <p
          ref={descRef}
          className="max-w-2xl font-body text-base leading-relaxed text-muted2 md:text-lg"
        >
          {description}
        </p>

        {/* Tags stack */}
        <ul
          ref={tagsRef}
          aria-label="Stack technique"
          className="mt-10 flex flex-wrap gap-2"
        >
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-muted2"
            >
              {tag}
            </li>
          ))}
        </ul>

        {/* Actions — CTA externe + retour */}
        <div
          ref={actionsRef}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          {cta && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 rounded border border-accent/40 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              {cta.label}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
            </a>
          )}
          <Link
            href="/projects"
            className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-text"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
            {backLabel}
          </Link>
        </div>

      </div>
    </main>
  )
}
