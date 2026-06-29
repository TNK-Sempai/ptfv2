// app/studio/(dashboard)/finance/page.tsx — Vue Finance (placeholder Phase 1)
// Données live (table studio_finances) branchées en Phase 2.

const FEATURES: readonly string[] = [
  'Revenus, dépenses et factures à prévoir par projet',
  'Revenue MTD consolidé + projections (confirmed / projected / pending)',
  'Suivi TVA et échéances à anticiper',
  'Flux income / expense / invoice_pending horodatés',
] as const

export default function StudioFinancePage() {
  return (
    <div className="bg-grid min-h-full p-6">
      <section className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl leading-none text-accent" aria-hidden>
            €
          </span>
          <div>
            <p className="eyebrow-label font-mono text-xs uppercase tracking-wider text-muted2">
              Cockpit
            </p>
            <h1 className="font-display text-3xl uppercase tracking-wide text-text">
              Finance
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted2">
          Vue d’ensemble du nerf de la guerre : ce qui rentre, ce qui sort, ce qui
          est à facturer — agrégé par projet et dans le temps.
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
