// app/studio/(dashboard)/production/page.tsx — Vue Production (placeholder Phase 1)
// Données live (table studio_production_queue) branchées en Phase 2.

const FEATURES: readonly string[] = [
  'File de production : ComfyUI / n8n / buffer / manuel',
  'Statut temps réel queued / running / done / failed + progression',
  'Pipeline print-on-demand Tanuki Merch (n8n → ComfyUI → Gelato)',
  'Planification et historique des jobs (scheduled / started / completed)',
] as const

export default function StudioProductionPage() {
  return (
    <div className="bg-grid min-h-full p-6">
      <section className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl leading-none text-accent" aria-hidden>
            ⚙
          </span>
          <div>
            <p className="eyebrow-label font-mono text-xs uppercase tracking-wider text-muted2">
              Cockpit
            </p>
            <h1 className="font-display text-3xl uppercase tracking-wide text-text">
              Production
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted2">
          Tour de contrôle des chaînes automatisées : ce qui tourne, ce qui attend,
          ce qui a échoué — sur tous les pipelines de génération.
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
