'use client'

import { useMemo, useState } from 'react'
import { DemoSlot } from '@/components/widgets/DemoSlot'

// ─── Variables exposées ───────────────────────────────────────────────────────
// Injectées sur le wrapper du DemoSlot ; les widgets les consomment via
// var(--widget-*, <fallback DA>). Source de vérité du textarea.

const DEFAULT_CSS = `--widget-accent: #c8f060;
--widget-bg: #13131c;
--widget-text: #ede8df;
--widget-radius: 4px;
--widget-font-size: 16px;`

/**
 * parseCustomProperties — transforme le texte du textarea en map de custom
 * properties CSS. Ne retient que les lignes `--nom: valeur;`.
 */
function parseCustomProperties(css: string): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const line of css.split('\n')) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);?\s*$/)
    if (match) vars[match[1]] = match[2].trim()
  }
  return vars
}

/**
 * CssPlayground — éditeur de custom properties appliquées au VRAI widget.
 *
 * Le textarea est la source de vérité ; à chaque frappe les variables sont
 * parsées et injectées en inline style sur le wrapper qui entoure le DemoSlot.
 * Le widget rendu (CounterWidget, CalculatorWidget, PaletteWidget) lit ces
 * variables via var(--widget-*, …) → la preview est le composant réel, pas un
 * bouton générique.
 */
export default function CssPlayground({ demoComponent }: { demoComponent?: string | null }) {
  const [css, setCss] = useState(DEFAULT_CSS)

  const vars = useMemo(() => parseCustomProperties(css), [css])

  // Les custom properties ne sont pas typées dans CSSProperties → cast contrôlé.
  const wrapperStyle = vars as React.CSSProperties

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Éditeur */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">Variables du widget</span>
          <button
            type="button"
            onClick={() => setCss(DEFAULT_CSS)}
            className="rounded border border-border px-3 py-1 font-mono text-xs text-muted2 transition-colors hover:border-text/30 hover:text-text"
          >
            Reset
          </button>
        </div>
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          spellCheck={false}
          rows={6}
          aria-label="Éditeur de variables CSS du widget"
          className="resize-y rounded-lg border border-border bg-surface p-4 font-mono text-sm text-text outline-none focus:border-accent/40"
        />
      </div>

      {/* Preview — variables injectées sur le wrapper du vrai widget */}
      <div
        style={wrapperStyle}
        className="flex min-h-72 items-center justify-center rounded-lg border border-border bg-surface2 p-6"
      >
        {demoComponent ? (
          <DemoSlot name={demoComponent} />
        ) : (
          <span className="font-mono text-xs text-muted">Demo non disponible</span>
        )}
      </div>
    </div>
  )
}
