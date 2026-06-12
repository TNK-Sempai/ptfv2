'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export type ProjectStatus = 'live' | 'soon' | 'wip'

export interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  /** Texte du badge — vient directement de Notion */
  badge: string
  year: number
  href: string
  image: string
  status: ProjectStatus
}

const STATUS_STYLE: Record<ProjectStatus, string> = {
  live: 'bg-accent/10 text-accent border-accent/20',
  soon: 'bg-muted/10 text-muted2 border-muted/20',
  wip:  'bg-muted/10 text-muted  border-muted/20',
}

// ─── Hook tilt 3D ────────────────────────────────────────────────────────────
// Guard touch obligatoire : inactif si ontouchstart + innerWidth < 1024.
// willChange activé uniquement pendant l'interaction (règle CLAUDE.md).
function useTilt(strength = 12) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    const onEnter = () => {
      el.style.willChange = 'transform'
      el.style.transition = 'none'
    }
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const nx = (e.clientX - left) / width - 0.5
      const ny = (e.clientY - top) / height - 0.5
      el.style.transform = `perspective(900px) rotateX(${-ny * strength}deg) rotateY(${nx * strength}deg)`
    }
    const onLeave = () => {
      el.style.willChange = 'auto'
      el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectCard({
  title, description, tags, badge, year, href, image, status,
}: ProjectCardProps) {
  const t = useTranslations('projects')
  const tiltRef = useTilt()

  return (
    <article
      ref={tiltRef}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden bg-surface2">
        <Image
          src={image}
          alt={title}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded border border-border bg-bg/70 px-2 py-0.5 font-mono text-[10px] text-muted2 backdrop-blur-sm">
          {year}
        </span>
        <span
          aria-label={`Statut : ${badge}`}
          className={`absolute right-3 top-3 rounded-full border px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${STATUS_STYLE[status]}`}
        >
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl uppercase tracking-wide text-text">
          {title}
        </h3>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technologies">
          {tags.map((tag) => (
            <li key={tag} className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted2">
              {tag}
            </li>
          ))}
        </ul>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {description}
        </p>

        <Link
          href={href}
          data-cursor="hover"
          aria-label={`${t('cta')} ${title}`}
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2 font-body text-sm text-muted2 transition-colors duration-200 hover:border-accent/40 hover:text-accent"
        >
          {t('cta')}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
