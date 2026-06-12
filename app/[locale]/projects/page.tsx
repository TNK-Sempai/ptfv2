import Link from 'next/link'
import { PROJECTS_CONFIG } from '@/lib/constants'
import type { ProjectStatus } from '@/lib/types'

type Stat = { label: string; value: string }
type ProjectMeta = { slug: string; description: string; stats: Stat[] }

const META: ProjectMeta[] = [
  {
    slug: 'tanukichessbot',
    description: "Bot d'échecs autonome jouant 24 h/24 sur Twitch et Lichess, propulsé par un moteur IA maison capable de s'adapter à tout niveau.",
    stats: [{ label: 'Parties jouées', value: '+2 000' }, { label: 'Disponibilité', value: '24 h/24' }, { label: 'Plateforme', value: 'Lichess' }],
  },
  {
    slug: 'opti-troc',
    description: "Marketplace B2B permettant aux professionnels d'optimiser leurs échanges de matériel et services, avec matching intelligent.",
    stats: [{ label: 'Cible', value: 'B2B' }, { label: 'Stack', value: 'Next.js' }, { label: 'Statut', value: 'Live' }],
  },
  {
    slug: 'yummr',
    description: 'Application mobile de découverte culinaire géolocalisée — trouvez les meilleures adresses autour de vous en temps réel.',
    stats: [{ label: 'Plateformes', value: 'iOS + Android' }, { label: 'Stack', value: 'React Native' }, { label: 'Statut', value: 'En dev' }],
  },
  {
    slug: 'big-factory',
    description: 'Site vitrine haut de gamme pour agence créative, design system robuste avec shadcn/ui et animations avancées.',
    stats: [{ label: 'Type', value: 'Vitrine' }, { label: 'UI', value: 'shadcn/ui' }, { label: 'Statut', value: 'Live' }],
  },
  {
    slug: 'time-event',
    description: 'Plateforme suisse de billetterie en ligne avec gestion de campagnes Google Ads intégrée et suivi des conversions.',
    stats: [{ label: 'Marché', value: 'Suisse' }, { label: 'Trafic', value: 'Google Ads' }, { label: 'Statut', value: 'Live' }],
  },
]

const STATUS_LABEL: Record<ProjectStatus, string> = { live: 'Live', wip: 'En dev', soon: 'Bientôt' }
const STATUS_CLASS: Record<ProjectStatus, string> = {
  live: 'text-accent border-accent/40',
  wip: 'text-muted2 border-muted2/40',
  soon: 'text-muted border-muted/40',
}

const TOTAL = String(PROJECTS_CONFIG.length).padStart(2, '0')

export default function ProjectsPage() {
  const projects = PROJECTS_CONFIG.map((p, i) => ({ ...p, ...META[i] }))

  return (
    <div>
      {projects.map((project, i) => {
        const isEven = i % 2 === 0
        return (
          <section
            key={project.slug}
            className="relative flex min-h-dvh flex-col border-b border-border md:flex-row"
          >
            {/* Hero image — MILO: remplacer par <Image src={…} fill alt={project.title} /> */}
            <div
              className={`relative h-56 w-full shrink-0 bg-surface2 md:h-auto md:w-1/2 ${
                isEven ? 'md:order-last' : ''
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs text-muted/40">
                  /images/projects/{project.slug}.jpg
                </span>
              </div>
            </div>

            {/* Contenu */}
            <div
              className={`flex w-full flex-col justify-center gap-6 px-6 py-16 md:w-1/2 md:px-16 lg:px-24 ${
                isEven ? 'md:order-first' : ''
              }`}
            >
              {/* Index + badge statut */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, '0')}/{TOTAL}
                </span>
                <span className={`rounded border px-2 py-0.5 font-mono text-xs ${STATUS_CLASS[project.status]}`}>
                  {STATUS_LABEL[project.status]}
                </span>
              </div>

              {/* Titre */}
              <h2 className="font-display text-5xl leading-none tracking-tight text-text md:text-6xl">
                {project.title}
              </h2>

              {/* Tags stack */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string) => (
                  <span key={tag} className="rounded bg-surface2 px-3 py-1 font-mono text-xs text-muted2">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Résumé court */}
              <p className="font-body max-w-md text-base leading-relaxed text-muted2">
                {project.description}
              </p>

              {/* Stats clés */}
              <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                {project.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="font-display text-2xl text-text">{stat.value}</span>
                    <span className="font-mono text-xs text-muted">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={`/projects/${project.slug}`}
                className="group inline-flex w-fit items-center gap-2 rounded border border-accent/40 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
              >
                Voir le projet
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </section>
        )
      })}
    </div>
  )
}
