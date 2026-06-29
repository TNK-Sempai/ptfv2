'use client'

import { useRef, useState, type ReactNode, type CSSProperties } from 'react'

/**
 * CalculatorWidget — démo live « Calculatrice Monique ».
 * Grille 4×5, opérations + − × ÷ =, display expression + résultat,
 * ripple au clic. Vanilla React, évaluation maison (pas d'eval()).
 */

// ─── Évaluation (sans eval) ─────────────────────────────────────────────────────

/** Tokenise puis évalue + − × ÷ avec priorité × ÷. Renvoie null si invalide. */
function evaluate(expr: string): number | null {
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  const matches = normalized.match(/(\d+\.?\d*)|([+\-*/])/g)
  if (!matches || matches.length === 0) return null

  const tokens: (number | string)[] = matches.map((t) =>
    /[+\-*/]/.test(t) && t.length === 1 ? t : Number(t),
  )

  // Passe 1 — × ÷
  const pass1: (number | string)[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === '*' || t === '/') {
      const prev = pass1.pop()
      const next = tokens[++i]
      if (typeof prev !== 'number' || typeof next !== 'number') return null
      pass1.push(t === '*' ? prev * next : prev / next)
    } else {
      pass1.push(t)
    }
  }

  // Passe 2 — + −
  let result = pass1[0]
  if (typeof result !== 'number') return null
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i]
    const val = pass1[i + 1]
    if (typeof val !== 'number') return null
    result = op === '+' ? result + val : result - val
  }

  return Number.isFinite(result) ? result : null
}

/** Arrondit proprement pour éviter les flottants à rallonge. */
function format(n: number): string {
  return parseFloat(n.toPrecision(12)).toString()
}

const OPERATORS = new Set(['+', '−', '×', '÷'])

// ─── Ripple button ──────────────────────────────────────────────────────────────

interface Ripple {
  id: number
  x: number
  y: number
}

function RippleButton({
  children,
  onPress,
  variant,
}: {
  children: ReactNode
  onPress: () => void
  variant: 'num' | 'op' | 'fn' | 'eq'
}) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const idRef = useRef(0)

  const style: Record<typeof variant, string> = {
    num: 'bg-surface2 text-text hover:bg-surface2/70',
    op: 'bg-surface2 hover:bg-accent/10',
    fn: 'bg-surface text-muted2 hover:text-text',
    eq: 'hover:opacity-90',
  }

  // Accent piloté par le playground (var --widget-accent) avec fallback DA.
  const accentStyle: CSSProperties | undefined =
    variant === 'eq'
      ? { background: 'var(--widget-accent, var(--accent))', color: 'var(--widget-bg, var(--bg))' }
      : variant === 'op'
        ? { color: 'var(--widget-accent, var(--accent))' }
        : undefined

  return (
    <button
      type="button"
      data-cursor="hover"
      style={accentStyle}
      onPointerDown={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const rect = e.currentTarget.getBoundingClientRect()
        const id = idRef.current++
        setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      }}
      onClick={onPress}
      className={`relative aspect-square overflow-hidden rounded-xl border border-border font-mono text-lg transition-colors duration-150 ${style[variant]}`}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          onAnimationEnd={() => setRipples((list) => list.filter((x) => x.id !== r.id))}
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-30 animate-[widget-ripple_0.5s_ease-out_forwards]"
        />
      ))}
    </button>
  )
}

// ─── Clavier ─────────────────────────────────────────────────────────────────────

const KEYS: { label: string; variant: 'num' | 'op' | 'fn' | 'eq' }[] = [
  { label: 'AC', variant: 'fn' }, { label: '⌫', variant: 'fn' }, { label: '%', variant: 'fn' }, { label: '÷', variant: 'op' },
  { label: '7', variant: 'num' }, { label: '8', variant: 'num' }, { label: '9', variant: 'num' }, { label: '×', variant: 'op' },
  { label: '4', variant: 'num' }, { label: '5', variant: 'num' }, { label: '6', variant: 'num' }, { label: '−', variant: 'op' },
  { label: '1', variant: 'num' }, { label: '2', variant: 'num' }, { label: '3', variant: 'num' }, { label: '+', variant: 'op' },
  { label: '0', variant: 'num' }, { label: '00', variant: 'num' }, { label: '.', variant: 'num' }, { label: '=', variant: 'eq' },
]

// ─── Widget ──────────────────────────────────────────────────────────────────────

export default function CalculatorWidget() {
  const [expr, setExpr] = useState('')
  const [done, setDone] = useState(false)

  const preview = (() => {
    const trimmed = expr.replace(/[+\-×÷−]$/, '')
    const r = evaluate(trimmed)
    return r === null ? '' : format(r)
  })()

  function press(key: string) {
    switch (key) {
      case 'AC':
        setExpr('')
        setDone(false)
        return
      case '⌫':
        setExpr((e) => e.slice(0, -1))
        setDone(false)
        return
      case '=': {
        const r = evaluate(expr)
        setExpr(r === null ? '' : format(r))
        setDone(true)
        return
      }
      case '%': {
        const m = expr.match(/(\d+\.?\d*)$/)
        if (!m) return
        const pct = format(Number(m[1]) / 100)
        setExpr((e) => e.slice(0, e.length - m[1].length) + pct)
        return
      }
      default: {
        const isOp = OPERATORS.has(key)
        setExpr((e) => {
          let base = done && !isOp ? '' : e
          if (done) setDone(false)
          // Remplace un opérateur final par le nouveau
          if (isOp && /[+\-×÷−]$/.test(base)) base = base.slice(0, -1)
          if (isOp && base === '') return base // pas d'opérateur en tête
          return base + key
        })
      }
    }
  }

  return (
    <div
      className="flex w-full max-w-xs flex-col gap-4 border border-border p-5"
      style={{
        background: 'var(--widget-bg, var(--surface))',
        color: 'var(--widget-text, var(--text))',
        borderRadius: 'var(--widget-radius, 1rem)',
        fontSize: 'var(--widget-font-size, 16px)',
      }}
    >
      {/* Keyframe ripple — scopé au widget (précédent : MarqueeStrip) */}
      <style>{`@keyframes widget-ripple { to { transform: translate(-50%,-50%) scale(18); opacity: 0; } }`}</style>

      {/* Display */}
      <div className="flex min-h-20 flex-col items-end justify-end gap-1 rounded-xl bg-surface2 px-4 py-3">
        <span className="max-w-full truncate font-mono text-sm text-muted">
          {expr || '0'}
        </span>
        <span className="max-w-full truncate font-display text-4xl leading-none text-text">
          {done ? expr || '0' : preview || (expr ? '' : '0')}
        </span>
      </div>

      {/* Clavier 4×5 */}
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <RippleButton key={k.label} variant={k.variant} onPress={() => press(k.label)}>
            {k.label}
          </RippleButton>
        ))}
      </div>
    </div>
  )
}
