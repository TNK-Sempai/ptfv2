// app/studio/(dashboard)/page.tsx — Vue Situation (placeholder Phase 1)
// Grille d'état des 11 projets + KPIs. Données réelles (statuts/finances/alertes)
// branchées sur Supabase à une étape ultérieure — ici tout est statique.

import JarvisPanel from '@/components/studio/jarvis/JarvisPanel'
import {
  STATUS_COLORS,
  STUDIO_PROJECTS,
  type ProjectStatus,
} from '@/lib/studio/constants'

interface Kpi {
  label: string
  value: string
}

const KPIS: readonly Kpi[] = [
  { label: 'Revenue MTD',        value: '— €' },
  { label: 'Alertes actives',    value: '—' },
  { label: 'Décisions à valider', value: '—' },
  { label: 'File production',     value: '—' },
] as const

function projectStatus(project: (typeof STUDIO_PROJECTS)[number]): ProjectStatus {
  return 'status_default' in project ? project.status_default : 'unknown'
}

export default function StudioSituationPage() {
  return (
    <div className="bg-grid min-h-full p-6">
      {/* Jarvis — assistant du cockpit (en tête de la Vue Situation) */}
      <JarvisPanel className="mb-8" />

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl text-text">{kpi.value}</p>
          </div>
        ))}
      </section>

      {/* État des projets */}
      <section className="mt-8">
        <p className="eyebrow-label font-mono text-xs uppercase tracking-wider text-muted2">
          État des projets · {STUDIO_PROJECTS.length}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {STUDIO_PROJECTS.map((project) => {
            const status = projectStatus(project)
            return (
              <article
                key={project.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/20"
              >
                {/* Liseré couleur projet (data-driven, source: constants) */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex items-start justify-between">
                  <span className="text-xl leading-none" aria-hidden>
                    {project.icon}
                  </span>
                  <span
                    className="mt-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                    title={status}
                    aria-label={`Statut : ${status}`}
                  />
                </div>
                <h2 className="mt-3 font-display text-lg uppercase leading-tight tracking-wide text-text">
                  {project.name}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {project.category}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-wider text-muted">
        Placeholder — Phase 1 · données live à venir
      </p>
    </div>
  )
}
