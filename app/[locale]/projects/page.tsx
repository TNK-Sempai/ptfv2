'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { PROJECTS } from '@/lib/constants'
import type { ProjectStatus } from '@/lib/types'
import { useImageReveal } from '@/hooks/useImageReveal'
import { useDepthGallery } from '@/hooks/useDepthGallery'
import {
  staggerContainer,
  staggerContainerFast,
  popIn,
  slideUp,
} from '@/components/motion/variants'

// ─── Stats clés par projet (3 chiffres chacun) ───────────────────────────────
// Données éditoriales propres à cette page — enrichissent PROJECTS (constants).

type Stat = { value: string; label: string }

const STATS: Record<string, [Stat, Stat, Stat]> = {
  tanukichessbot: [
    { value: '+2 000', label: 'Parties' },
    { value: '24/7', label: 'Uptime' },
    { value: '2023', label: 'Année' },
  ],
  'opti-troc': [
    { value: '120+', label: 'Entreprises' },
    { value: '85%', label: 'Match rate' },
    { value: '2024', label: 'Année' },
  ],
  yummr: [
    { value: 'iOS+And', label: 'Plateformes' },
    { value: '3k', label: 'Plats' },
    { value: '2024', label: 'Année' },
  ],
  'big-factory': [
    { value: 'Temps réel', label: 'Dashboard' },
    { value: '40+', label: 'Modules' },
    { value: '2024', label: 'Année' },
  ],
  'time-event': [
    { value: '15k+', label: 'Billets' },
    { value: 'x3', label: 'ROI Ads' },
    { value: '2023', label: 'Année' },
  ],
}

// ─── Badge statut ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'Live',
  wip: 'En dev',
  soon: 'Bientôt',
}

const STATUS_CLASS: Record<ProjectStatus, string> = {
  live: 'text-accent border-accent/40 before:bg-accent',
  wip: 'text-muted2 border-muted2/40 before:bg-muted2',
  soon: 'text-muted border-muted/40 before:bg-muted',
}

const TOTAL = String(PROJECTS.length).padStart(2, '0')

// ─── Section projet ───────────────────────────────────────────────────────────
// Une section par projet : layout alterné image/contenu.
// Les hooks reveal sont appelés ici (par section) — jamais dans une boucle.

type ProjectSectionProps = {
  project: (typeof PROJECTS)[number]
  index: number
  /** Enregistre l'élément <section> dans le tableau de refs du parent (depth gallery). */
  registerSection: (el: HTMLElement | null) => void
}

function ProjectSection({ project, index, registerSection }: ProjectSectionProps) {
  const isEven = index % 2 === 0
  const num = String(index + 1).padStart(2, '0')
  const stats = STATS[project.slug]

  const imageRef = useImageReveal<HTMLDivElement>()

  return (
    <section
      ref={registerSection}
      className="relative flex min-h-dvh flex-col overflow-hidden border-b border-border md:flex-row"
    >
      {/* Watermark numéro */}
      <span
        aria-hidden
        className={`depth-watermark pointer-events-none absolute top-6 z-10 select-none font-display text-[18vw] leading-none text-text/3 md:text-[12vw] ${
          isEven ? 'left-6 md:left-12' : 'right-6 md:right-12'
        }`}
      >
        {num}
      </span>

      {/* Image cover — reveal clip-path */}
      <div
        className={`relative h-64 w-full shrink-0 md:h-auto md:w-1/2 ${
          isEven ? 'md:order-last' : ''
        }`}
      >
        <div ref={imageRef} className="depth-image-wrap absolute inset-0 overflow-hidden bg-surface2">
          <div className="depth-image absolute inset-0">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-bg/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div
        className={`relative z-10 flex w-full flex-col justify-center gap-6 px-6 py-16 md:w-1/2 md:px-16 lg:px-24 ${
          isEven ? 'md:order-first' : ''
        }`}
      >
        {/* Index + badge statut */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted">
            {num}/{TOTAL}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${STATUS_CLASS[project.status]}`}
          >
            {STATUS_LABEL[project.status]}
          </span>
        </div>

        {/* Tags stack */}
        <motion.div
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {project.tags.map((tag) => (
            <motion.span
              key={tag}
              variants={popIn}
              className="rounded bg-surface2 px-3 py-1 font-mono text-xs text-muted2"
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        {/* Titre — reveal masqué (depth gallery) */}
        <div className="depth-title-wrap overflow-hidden">
          <h2
            className="depth-title-inner font-display text-6xl leading-[0.9] tracking-tight text-text md:text-7xl"
          >
            {project.title}
          </h2>
        </div>

        {/* Description courte */}
        <p className="max-w-md font-body text-base leading-relaxed text-muted2">
          {project.description}
        </p>

        {/* Stats clés */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-3 gap-4 border-t border-border pt-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={slideUp} className="flex flex-col gap-1">
              <span className="font-display text-2xl leading-none text-text">{stat.value}</span>
              <span className="font-mono text-xs text-muted">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <Link
            href={`/projects/${project.slug}`}
            className="group inline-flex w-fit items-center gap-2 rounded border border-accent/40 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            Voir le projet
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          {project.externalUrl && (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 rounded border border-border px-6 py-3 font-mono text-sm text-muted2 transition-colors hover:border-text/30 hover:text-text"
            >
              Site live
              <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Galerie WebGL — chargée client-only (Three.js, jamais au SSR).
const DepthGallery = dynamic(() => import('@/components/webgl/DepthGallery'), {
  ssr: false,
})

/**
 * Fallback — liste de cards (effets depth GSAP, auto-désactivés au touch).
 * Servi au SSR/pré-décision et sur mobile (pas de WebGL).
 */
function ProjectsFallback() {
  const sectionsRef = useRef<HTMLElement[]>([])
  useDepthGallery(sectionsRef)

  return (
    <div>
      {PROJECTS.map((project, index) => (
        <ProjectSection
          key={project.slug}
          project={project}
          index={index}
          registerSection={(el) => {
            if (el) sectionsRef.current[index] = el
          }}
        />
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  // null = avant décision (SSR + 1er render client) → fallback cards, pas de WebGL au SSR.
  const [isTouch, setIsTouch] = useState<boolean | null>(null)
  useEffect(() => {
    setIsTouch('ontouchstart' in window && window.innerWidth < 1024)
  }, [])

  if (isTouch === null || isTouch) return <ProjectsFallback />
  return <DepthGallery />
}