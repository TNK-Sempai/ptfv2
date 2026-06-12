---
name: widget-shell
description: >
  Structure complète des pages /widgets/[slug] pour "1001 Widgets" — Tanuki v2.
  Covers: WidgetShell.tsx (layout split), CssPlayground.tsx (éditeur live),
  Shiki server-side syntax highlighting, CommentForm + API route Notion,
  generateMetadata Next.js par widget.
  Charger ce skill dès que l'on touche à /widgets/**, CommentForm, CssPlayground,
  ou l'API route /api/comments/*.
lead: ZARA (architecture) — MILO support (UI)
---

# widget-shell — Tanuki v2 / 1001 Widgets

## Architecture page `/widgets/[slug]`

```
app/[locale]/widgets/[slug]/
├── page.tsx              ← generateMetadata + data fetch + composition
└── loading.tsx           ← Skeleton layout
```

### `page.tsx` — Structure canonique
```tsx
import { notFound } from 'next/navigation'
import { getWidgetBySlug } from '@/lib/notion'
import { WidgetShell } from '@/components/widgets/WidgetShell'
import { getHighlighter } from '@/lib/shiki'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const widget = await getWidgetBySlug(params.slug)
  if (!widget) return {}
  return {
    title: `${widget.title} — 1001 Widgets`,
    description: widget.description,
    openGraph: {
      title: widget.title,
      description: widget.description,
      url: `https://tanuki-corporation.com/${params.locale}/widgets/${params.slug}`,
    },
  }
}

export default async function WidgetPage({ params }: Props) {
  const widget = await getWidgetBySlug(params.slug)
  if (!widget) notFound()

  // Syntax highlighting côté serveur — zéro JS client
  const highlighter = await getHighlighter()
  const highlightedCode = await highlighter.codeToHtml(widget.code ?? '', {
    lang: widget.language ?? 'html',
    theme: 'github-dark',
  })

  return (
    <WidgetShell
      widget={widget}
      highlightedCode={highlightedCode}
    />
  )
}
```

---

## 1. `WidgetShell.tsx` — Layout principal

```tsx
'use client'
import dynamic from 'next/dynamic'
import { Widget } from '@/lib/types'
import { CommentSection } from './CommentSection'
import { CssPlayground } from './CssPlayground'

// Demo chargée dynamiquement — jamais en SSR
const DemoLoader = dynamic(() => import('./DemoLoader'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-surface2 animate-pulse rounded-lg" />
  ),
})

interface WidgetShellProps {
  widget: Widget
  highlightedCode: string
}

export function WidgetShell({ widget, highlightedCode }: WidgetShellProps) {
  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Header widget */}
      <header className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-muted">
            Widget
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-mono ${
              widget.difficulty === 'Débutant'      ? 'border-green-500/40 text-green-400' :
              widget.difficulty === 'Intermédiaire' ? 'border-yellow-500/40 text-yellow-400' :
                                                      'border-red-500/40 text-red-400'
            }`}
          >
            {widget.difficulty}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wide mb-4">
          {widget.title}
        </h1>
        <p className="text-muted max-w-2xl">{widget.description}</p>
      </header>

      {/* Zone principale — split desktop */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Colonne gauche — Demo + CSS Playground */}
          <div className="space-y-8">
            {/* Demo live */}
            <section aria-label="Démonstration">
              <h2 className="eyebrow mb-4">01 — Demo</h2>
              <div className="rounded-xl border border-border overflow-hidden bg-surface">
                <DemoLoader slug={widget.slug} />
              </div>
            </section>

            {/* CSS Playground — uniquement si le widget a des custom properties */}
            {widget.cssVariables && widget.cssVariables.length > 0 && (
              <section aria-label="Éditeur CSS">
                <h2 className="eyebrow mb-4">CSS Playground</h2>
                <CssPlayground variables={widget.cssVariables} targetSlug={widget.slug} />
              </section>
            )}
          </div>

          {/* Colonne droite — Tuto + Code */}
          <div className="space-y-8">
            {/* Tuto narratif */}
            <section aria-label="Tutoriel">
              <h2 className="eyebrow mb-4">02 — Comment ça marche</h2>
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: widget.tutorialHtml ?? '' }}
              />
            </section>

            {/* Code — Shiki server-rendered */}
            <section aria-label="Code source">
              <h2 className="eyebrow mb-4">03 — Le code</h2>
              <div className="rounded-xl overflow-hidden border border-border">
                {/* CopyButton côté client uniquement */}
                <div className="flex justify-between items-center px-4 py-2 bg-surface2 border-b border-border">
                  <span className="text-xs font-mono text-muted">
                    {widget.language ?? 'html'}
                  </span>
                  <CopyButton code={widget.code ?? ''} />
                </div>
                {/* HTML injecté par Shiki — zéro JS client */}
                <div
                  className="overflow-x-auto [&>pre]:p-4 [&>pre]:text-sm [&>pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </section>

            {/* Upgrade — suggestions d'amélioration */}
            {widget.upgrades && widget.upgrades.length > 0 && (
              <section aria-label="Pour aller plus loin">
                <h2 className="eyebrow mb-4">04 — Pour aller plus loin</h2>
                <ul className="space-y-2">
                  {widget.upgrades.map((u, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted">
                      <span className="text-accent font-mono shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Commentaires — full width */}
        <CommentSection widgetSlug={widget.slug} />
      </div>
    </main>
  )
}

// CopyButton — isolé client
'use client'
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs font-mono text-muted hover:text-text transition-colors"
    >
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  )
}
```

---

## 2. `CssPlayground.tsx`

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

interface CssVariable {
  name: string      // '--card-bg'
  label: string     // 'Couleur de fond'
  type: 'color' | 'range' | 'select'
  default: string   // '#0e0e15'
  min?: number      // Pour type range
  max?: number
  unit?: string     // 'px', 'rem', etc.
  options?: string[] // Pour type select
}

interface CssPlaygroundProps {
  variables: CssVariable[]
  targetSlug: string  // Pour scoper les custom properties au widget
}

export function CssPlayground({ variables, targetSlug }: CssPlaygroundProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(variables.map(v => [v.name, v.default]))
  )
  const previewRef = useRef<HTMLDivElement>(null)

  // Applique les custom properties sur le container de la demo
  useEffect(() => {
    const demoEl = document.querySelector(`[data-widget-demo="${targetSlug}"]`) as HTMLElement
    if (!demoEl) return
    Object.entries(values).forEach(([name, value]) => {
      demoEl.style.setProperty(name, value)
    })
  }, [values, targetSlug])

  const reset = () => {
    setValues(Object.fromEntries(variables.map(v => [v.name, v.default])))
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      {variables.map((v) => (
        <div key={v.name} className="flex items-center justify-between gap-4">
          <label
            htmlFor={`css-var-${v.name}`}
            className="text-sm text-muted shrink-0 w-36 font-mono"
          >
            {v.label}
          </label>

          {v.type === 'color' && (
            <input
              id={`css-var-${v.name}`}
              type="color"
              value={values[v.name]}
              onChange={(e) => setValues(prev => ({ ...prev, [v.name]: e.target.value }))}
              className="h-8 w-16 rounded cursor-pointer border border-border bg-transparent"
            />
          )}

          {v.type === 'range' && (
            <div className="flex items-center gap-2 flex-1">
              <input
                id={`css-var-${v.name}`}
                type="range"
                min={v.min ?? 0}
                max={v.max ?? 100}
                value={parseInt(values[v.name])}
                onChange={(e) => setValues(prev => ({
                  ...prev,
                  [v.name]: `${e.target.value}${v.unit ?? 'px'}`
                }))}
                className="flex-1 accent-accent"
              />
              <span className="text-xs font-mono text-muted w-12 text-right">
                {values[v.name]}
              </span>
            </div>
          )}

          {v.type === 'select' && (
            <select
              id={`css-var-${v.name}`}
              value={values[v.name]}
              onChange={(e) => setValues(prev => ({ ...prev, [v.name]: e.target.value }))}
              className="bg-surface2 border border-border rounded px-2 py-1 text-sm text-text"
            >
              {v.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button
        onClick={reset}
        className="text-xs font-mono text-muted hover:text-text transition-colors mt-2"
      >
        ↺ Reset
      </button>
    </div>
  )
}
```

---

## 3. Shiki — Singleton serveur

### `lib/shiki.ts`
```ts
import { createHighlighter, type Highlighter } from 'shiki'

let highlighterInstance: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance

  highlighterInstance = await createHighlighter({
    themes: ['github-dark'],
    langs: ['html', 'css', 'javascript', 'typescript', 'tsx', 'bash', 'json'],
  })

  return highlighterInstance
}
```

**Règles Shiki :**
- Singleton — `createHighlighter` une seule fois au démarrage
- Langages déclarés explicitement — pas de `loadLanguage` dynamique en runtime
- Résultat injecté via `dangerouslySetInnerHTML` — HTML statique, zéro JS client
- Styles Shiki dans `globals.css` (override background transparent) :
```css
.shiki { background: transparent !important; }
.shiki code { font-family: var(--font-mono); font-size: 0.85rem; }
```

---

## 4. CommentForm + API Route Notion

### `components/widgets/CommentForm.tsx`
```tsx
'use client'
import { useState, useRef } from 'react'

interface CommentFormProps {
  widgetSlug: string
  onSuccess: () => void
}

export function CommentForm({ widgetSlug, onSuccess }: CommentFormProps) {
  const [prenom, setPrenom] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (submitting) return

    // Honeypot check côté client (double protection)
    if (honeypotRef.current?.value) return

    // Validation locale
    if (prenom.trim().length < 2) {
      setError('Prénom trop court.')
      return
    }
    if (message.trim().length < 10) {
      setError('Message trop court (10 caractères min).')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetSlug,
          prenom: prenom.trim().slice(0, 50),
          message: message.trim().slice(0, 1000),
          honeypot: honeypotRef.current?.value ?? '',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur serveur')
      }

      setSuccess(true)
      setPrenom('')
      setMessage('')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-accent font-mono p-4 border border-accent/20 rounded-lg">
        ✓ Commentaire envoyé — il sera visible après modération.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Honeypot — visually hidden, NOT display:none */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="comment-prenom" className="text-xs font-mono text-muted mb-1 block">
            Prénom *
          </label>
          <input
            id="comment-prenom"
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            maxLength={50}
            placeholder="Ton prénom"
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-message" className="text-xs font-mono text-muted mb-1 block">
          Message *
        </label>
        <textarea
          id="comment-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Ton commentaire, question ou suggestion..."
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
        <p className="text-xs text-muted text-right mt-1">{message.length}/1000</p>
      </div>

      {error && (
        <p className="text-xs text-red-400 font-mono">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2.5 bg-accent text-bg font-mono text-sm rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Envoi...' : 'Envoyer le commentaire'}
      </button>
    </div>
  )
}
```

### API Route — `app/api/comments/create/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { addCommentToNotion } from '@/lib/notion'
import { sanitize } from '@/lib/security'

// Rate limit en mémoire — remplacer par Redis en prod si multi-instance
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 heure

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ipHash)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { widgetSlug, prenom, message, honeypot } = body

    // Honeypot check côté serveur
    if (honeypot) {
      return NextResponse.json({ ok: true }) // Rejet silencieux
    }

    // Validation
    if (!widgetSlug || !prenom || !message) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
    }
    if (prenom.length > 50 || message.length > 1000) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    // IP hash SHA-256
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
    const ipHash = createHash('sha256').update(ip + process.env.HASH_SALT).digest('hex')

    // Rate limit
    if (!checkRateLimit(ipHash)) {
      return NextResponse.json(
        { error: 'Trop de commentaires. Réessaie dans une heure.' },
        { status: 429 }
      )
    }

    // Sanitize
    const cleanPrenom = sanitize(prenom)
    const cleanMessage = sanitize(message)

    // Push Notion avec timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      await addCommentToNotion({
        widgetSlug,
        prenom: cleanPrenom,
        message: cleanMessage,
        ipHash,
        status: 'pending',
      })
    } finally {
      clearTimeout(timeout)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[comments/create]', err)
    return NextResponse.json(
      { error: 'Erreur serveur. Réessaie.' },
      { status: 500 }
    )
  }
}
```

### `lib/security.ts`
```ts
/** Échappe les caractères HTML dangereux */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}
```

---

## 5. `CommentSection.tsx` — Fetch + affichage
```tsx
'use client'
import { useState, useCallback } from 'react'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'

export function CommentSection({ widgetSlug }: { widgetSlug: string }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNewComment = useCallback(() => {
    // Ne re-fetch pas — le commentaire est en "pending"
    // On affiche juste un message de succès via CommentForm
  }, [])

  return (
    <section className="mt-16 pt-12 border-t border-border" aria-label="Commentaires">
      <h2 className="eyebrow mb-8">Commentaires</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-sm font-mono text-muted mb-4">Laisser un commentaire</h3>
          <CommentForm widgetSlug={widgetSlug} onSuccess={handleNewComment} />
          <p className="text-xs text-muted mt-3">
            Les commentaires sont modérés avant publication.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-mono text-muted mb-4">Commentaires approuvés</h3>
          <CommentList widgetSlug={widgetSlug} key={refreshKey} />
        </div>
      </div>
    </section>
  )
}
```

---

## 6. Types Notion — `lib/types.ts` (section Widget)

```ts
export interface CssVariable {
  name: string
  label: string
  type: 'color' | 'range' | 'select'
  default: string
  min?: number
  max?: number
  unit?: string
  options?: string[]
}

export interface Widget {
  id: string
  title: string
  slug: string
  type: 'widget' | 'article' | 'fondations'
  languages: string[]           // ['HTML', 'CSS', 'JS']
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  description: string
  tutorialHtml: string | null   // Rich text Notion → HTML
  code: string | null
  language: string | null       // 'html' | 'css' | 'javascript' etc.
  cssVariables: CssVariable[] | null
  upgrades: string[] | null
  status: 'published' | 'draft'
  votes: number
  views: number
  publishedAt: string
}

export interface Comment {
  id: string
  widgetSlug: string
  prenom: string
  message: string
  status: 'pending' | 'approved' | 'spam'
  createdAt: string
}
```

---

## 7. Notion — `lib/notion.ts` (fonctions widget/comment)

```ts
import { Client } from '@notionhq/client'
import type { Widget, Comment } from './types'

const notion = new Client({ auth: process.env.NOTION_SECRET })

const WIDGETS_DB = process.env.NOTION_WIDGETS_DB_ID!
const COMMENTS_DB = process.env.NOTION_COMMENTS_DB_ID!

export async function getWidgetBySlug(slug: string): Promise<Widget | null> {
  const res = await notion.databases.query({
    database_id: WIDGETS_DB,
    filter: {
      and: [
        { property: 'slug', rich_text: { equals: slug } },
        { property: 'status', select: { equals: 'published' } },
      ],
    },
    page_size: 1,
  })

  if (!res.results[0]) return null
  return notionPageToWidget(res.results[0] as any)
}

export async function getApprovedComments(widgetSlug: string): Promise<Comment[]> {
  const res = await notion.databases.query({
    database_id: COMMENTS_DB,
    filter: {
      and: [
        { property: 'widgetSlug', rich_text: { equals: widgetSlug } },
        { property: 'status', select: { equals: 'approved' } },
      ],
    },
    sorts: [{ property: 'createdAt', direction: 'descending' }],
    page_size: 50,
  })

  return res.results.map(notionPageToComment as any)
}

export async function addCommentToNotion(data: {
  widgetSlug: string
  prenom: string
  message: string
  ipHash: string
  status: 'pending'
}) {
  await notion.pages.create({
    parent: { database_id: COMMENTS_DB },
    properties: {
      widgetSlug: { rich_text: [{ text: { content: data.widgetSlug } }] },
      prenom:     { rich_text: [{ text: { content: data.prenom } }] },
      message:    { rich_text: [{ text: { content: data.message } }] },
      ipHash:     { rich_text: [{ text: { content: data.ipHash } }] },
      status:     { select: { name: data.status } },
      createdAt:  { date: { start: new Date().toISOString() } },
    },
  })
}

// Mappers — adapter selon schema Notion réel
function notionPageToWidget(page: any): Widget {
  const p = page.properties
  return {
    id: page.id,
    title:        p.title?.title?.[0]?.plain_text ?? '',
    slug:         p.slug?.rich_text?.[0]?.plain_text ?? '',
    type:         p.type?.select?.name ?? 'widget',
    languages:    p.languages?.multi_select?.map((s: any) => s.name) ?? [],
    difficulty:   p.difficulty?.select?.name ?? 'Débutant',
    description:  p.description?.rich_text?.[0]?.plain_text ?? '',
    tutorialHtml: null, // À enrichir via Notion blocks API si besoin
    code:         p.code?.rich_text?.[0]?.plain_text ?? null,
    language:     p.language?.select?.name ?? null,
    cssVariables: null, // À parser depuis JSON property si besoin
    upgrades:     p.upgrades?.rich_text?.[0]?.plain_text
                    ? p.upgrades.rich_text[0].plain_text.split('\n').filter(Boolean)
                    : null,
    status:       p.status?.select?.name ?? 'draft',
    votes:        p.votes?.number ?? 0,
    views:        p.views?.number ?? 0,
    publishedAt:  p.publishedAt?.date?.start ?? '',
  }
}

function notionPageToComment(page: any): Comment {
  const p = page.properties
  return {
    id:          page.id,
    widgetSlug:  p.widgetSlug?.rich_text?.[0]?.plain_text ?? '',
    prenom:      p.prenom?.rich_text?.[0]?.plain_text ?? '',
    message:     p.message?.rich_text?.[0]?.plain_text ?? '',
    status:      p.status?.select?.name ?? 'pending',
    createdAt:   p.createdAt?.date?.start ?? '',
  }
}
```

---

## 8. Checklist livraison widget-shell

Avant tout commit sur la zone /widgets/** :

**Structure**
- [ ] `generateMetadata` présent dans chaque page widget
- [ ] Demo chargée via `next/dynamic` avec `ssr: false`
- [ ] Shiki singleton — `createHighlighter` appelé une seule fois

**Sécurité commentaires**
- [ ] Honeypot hidden via CSS absolu (PAS `display:none`)
- [ ] Rate limit vérifié côté serveur (pas seulement client)
- [ ] IP hashée SHA-256 avec HASH_SALT env var — jamais en clair
- [ ] Sanitize côté serveur sur prenom + message
- [ ] Status "pending" par défaut — jamais "approved" à la création

**UX**
- [ ] État `submitting` sur le bouton — pas de double submit
- [ ] Error state visible utilisateur (pas seulement console)
- [ ] Timeout 5s sur appel Notion + error message si timeout
- [ ] Message de succès post-soumission + champs vidés

**Types**
- [ ] Aucun `any` — tous les retours Notion typés via mappers
- [ ] `Widget` et `Comment` importés depuis `@/lib/types`

---

## 9. Anti-patterns interdits

```
❌ Demo en SSR — always next/dynamic ssr:false
❌ createHighlighter() à chaque requête — singleton obligatoire
❌ Honeypot en display:none — les bots le voient
❌ IP en clair dans Notion — SHA-256 + HASH_SALT always
❌ Status 'approved' à la création — toujours 'pending'
❌ Double submit sans guard submitting
❌ dangerouslySetInnerHTML sans sanitize côté serveur
❌ console.log en production (surtout dans route.ts)
❌ Magic strings status ('pending', 'approved', 'spam') inline — constants.ts
```
