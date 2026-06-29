// app/studio/(dashboard)/decisions/page.tsx — Vue Décisions (placeholder Phase 1)
// Données live (table studio_decisions) branchées en Phase 2.

const FEATURES: readonly string[] = [
  'File des recommandations préparées par Jarvis (pending / approved / rejected)',
  'Contexte, recommandation et impact pour chaque décision',
  'Validation ENSEMBLE avec Lass — jamais à sa place',
  'Historique horodaté des décisions tranchées',
] as const

export default function StudioDecisionsPage() {
  return (
    <div className="bg-grid min-h-full p-6">
      <section className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl leading-none text-accent" aria-hidden>
            ⚖
          </span>
          <div>
            <p className="eyebrow-label font-mono text-xs uppercase tracking-wider text-muted2">
              Cockpit
            </p>
            <h1 className="font-display text-3xl uppercase tracking-wide text-text">
              Décisions
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted2">
          Centre de validation des arbitrages stratégiques. Jarvis prépare, Lass
          décide — chaque décision passe ici avant d’être tranchée.
        </p>

        <ul className="mt-6 flex flex-col gap-2">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex gap-3 font-mono text-xs leading-relaxed text-muted"
            >
              <span className="text-accent" aria-hidden>
                ▹
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-wider text-muted">
          Phase 2 — données live à venir
        </p>
      </section>
    </div>
  )
}
