'use client'

import { useEffect, useRef, useState } from 'react'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { IMG } from '@/lib/constants'
import ScrambleText from '@/components/blocks/ScrambleText'
import { useTextReveal } from '@/hooks/useTextReveal'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import { useImageReveal } from '@/hooks/useImageReveal'

// ─── model-viewer (web component Google) — typage du custom element pour JSX ────

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string
  alt?: string
  poster?: string
  'camera-controls'?: boolean
  'auto-rotate'?: boolean
  'disable-zoom'?: boolean
  'rotation-per-second'?: string
  'shadow-intensity'?: string
  'camera-orbit'?: string
  exposure?: string
  reveal?: string
  loading?: 'auto' | 'lazy' | 'eager'
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps
    }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TWITCH_URL = 'https://twitch.tv/tanukicorporation'
const LICHESS_USER = 'tanukichessbot'
const LICHESS_API = `https://lichess.org/api/user/${LICHESS_USER}`

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { name: 'Stockfish',   role: 'Moteur d’échecs',  desc: 'Calcule chaque coup au niveau grand-maître, profondeur ajustable en temps réel.' },
  { name: 'Ollama',      role: 'LLM local',                  desc: 'Llama 3.1 génère le commentaire en direct, ton et personnalité du bot.' },
  { name: 'Kokoro TTS',  role: 'Synthèse vocale',        desc: 'Transforme le commentaire en voix naturelle, faible latence, 100 % local.' },
  { name: 'Warudo',      role: 'Avatar 3D / VTuber',         desc: 'Anime l’avatar VRM — lip-sync, expressions, réactions synchronisées à la voix.' },
  { name: 'OBS',         role: 'Composition & diffusion',    desc: 'Compose scène, échiquier et avatar, puis diffuse le flux vers les plateformes.' },
  { name: 'Twitch Chat', role: 'Modération & interaction', desc: 'Lit le chat, répond aux viewers et intègre leurs suggestions au stream.' },
] as const

const FLOW = [
  'Lichess API',
  'Python Bot',
  'Stockfish',
  'Ollama',
  'Kokoro TTS',
  'Warudo',
  'OBS',
  'Twitch / YT',
] as const

const STACK = [
  { tech: 'Python',        note: 'Orchestrateur — boucle de jeu & glue' },
  { tech: 'Stockfish',     note: 'Moteur UCI — évaluation des positions' },
  { tech: 'Ollama',        note: 'Llama 3.1 — commentaire génératif' },
  { tech: 'Kokoro',        note: 'ONNX — text-to-speech temps réel' },
  { tech: 'Warudo',        note: 'VRM — rig & animation de l’avatar' },
  { tech: 'OBS',           note: 'WebSocket — contrôle des scènes' },
  { tech: 'Lichess',       note: 'Bot API — parties en ligne 24/7' },
  { tech: 'Twitch',        note: 'IRC — lecture & réponse au chat' },
  { tech: 'Windows',       note: 'RTX 3050 — inférence GPU locale' },
] as const

const AVATARS = [
  { name: 'Tanuki',        emoji: '🦝', meta: 'VRM • .glb', status: 'ACTIF' as const,   model: '/assets/models/Tanuki-vr.glb' },
  { name: 'Kitsune',       emoji: '🦊', meta: 'VRM • .glb', status: 'BIENTÔT' as const, model: '/assets/models/Kitsune.glb' },
  { name: 'Tanuki Street', emoji: '🌃', meta: 'VRM • .glb', status: 'BIENTÔT' as const, model: '/assets/models/Tanuki-street.glb' },
] as const

// ─── Lichess stats ──────────────────────────────────────────────────────────────

interface LiveStats {
  games: number
  win: number
  loss: number
  draw: number
}

interface LichessCount {
  all?: number
  win?: number
  loss?: number
  draw?: number
}

/**
 * useLichessStats — fetch client-side des stats du compte bot sur Lichess.
 * AbortController pour cleanup, état null tant que non chargé / en erreur.
 */
function useLichessStats() {
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(LICHESS_API, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('HTTP'))))
      .then((data: { count?: LichessCount }) => {
        const c = data.count ?? {}
        setStats({
          games: c.all ?? 0,
          win: c.win ?? 0,
          loss: c.loss ?? 0,
          draw: c.draw ?? 0,
        })
      })
      .catch(() => {
        // Abort au unmount : ne pas setState. Sinon fetch échoué → 0, pas "—".
        if (controller.signal.aborted) return
        setStats({ games: 0, win: 0, loss: 0, draw: 0 })
      })

    return () => controller.abort()
  }, [])

  return stats
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-10 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
        {index}
      </span>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </span>
    </div>
  )
}

function LivePill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-text">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      Live
    </span>
  )
}

function StatBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-5 py-4">
      <span className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none text-text">
        {value === null ? '—' : value.toLocaleString('fr-FR')}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
    </div>
  )
}

function FlowStep({ label, last }: { label: string; last: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className="card-shine whitespace-nowrap rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-xs text-muted2">
        {label}
      </span>
      {!last && (
        <span aria-hidden="true" className="font-mono text-sm text-accent/60">
          →
        </span>
      )}
    </li>
  )
}

/**
 * AvatarCard — carte avatar avec rendu 3D du modèle .glb via <model-viewer>.
 * `ready` est piloté par le parent (import client-only de @google/model-viewer) :
 * tant que le web component n'est pas enregistré, on affiche le placeholder emoji
 * — ce qui évite aussi tout mismatch d'hydratation SSR.
 */
function AvatarCard({
  name,
  emoji,
  meta,
  status,
  model,
  ready,
}: {
  name: string
  emoji: string
  meta: string
  status: 'ACTIF' | 'BIENTÔT'
  model: string
  ready: boolean
}) {
  const isActive = status === 'ACTIF'

  // autoRotate piloté au hover : pause à l'entrée, reprise différée à la sortie.
  // Le délai laisse l'utilisateur reprendre la main sans relancer la rotation aussitôt.
  const [autoRotate, setAutoRotate] = useState(true)
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pauseRotate = () => {
    clearTimeout(resumeTimeout.current)
    setAutoRotate(false)
  }
  const scheduleResume = () => {
    resumeTimeout.current = setTimeout(() => setAutoRotate(true), 1500)
  }

  // Cleanup au démontage — évite un timer orphelin / setState fantôme.
  useEffect(() => () => clearTimeout(resumeTimeout.current), [])

  return (
    <article
      onMouseEnter={pauseRotate}
      onMouseLeave={scheduleResume}
      className="card-shine flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="relative aspect-square w-full bg-surface2">
        {ready ? (
          <model-viewer
            src={model}
            alt={`Avatar 3D ${name}`}
            camera-controls
            {...(autoRotate ? { 'auto-rotate': true } : {})}
            disable-zoom
            rotation-per-second="24deg"
            shadow-intensity="0.6"
            exposure="0.95"
            reveal="auto"
            loading="lazy"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="text-[clamp(3.5rem,9vw,5.5rem)] leading-none"
              role="img"
              aria-label={`Avatar ${name}`}
            >
              {emoji}
            </span>
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest ${
            isActive
              ? 'border-accent/30 bg-accent/10 text-accent'
              : 'border-border bg-bg/60 text-muted'
          }`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-1 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl uppercase tracking-tight text-text">
            {name}
          </span>
          <span className="font-mono text-[10px] text-muted">{meta}</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted2">
          Modèles 3D disponibles sur le stream
        </span>
      </div>
    </article>
  )
}

// ─── Client Component ───────────────────────────────────────────────────────────

/**
 * TanukiChessBotContent — page projet TanukiChessBot.
 * Hero + projet + architecture + stack + avatars 3D.
 * Hooks reveal (texte / stagger / clip-path) pour les entrées en viewport.
 */
export default function TanukiChessBotContent() {
  const locale = useLocale()
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)

  const stats = useLichessStats()

  // model-viewer chargé client-only — enregistre le custom element <model-viewer>
  // après le mount (le web component embarque three.js, incompatible SSR).
  const [mvReady, setMvReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    import('@google/model-viewer').then(() => {
      if (!cancelled) setMvReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Reveals
  const eyebrowRef = useTextReveal<HTMLParagraphElement>({ y: 12, delay: 0 })
  const subtitleRef = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 160 })
  const ctaRef = useTextReveal<HTMLDivElement>({ y: 20, delay: 240 })
  const statsRef = useStaggerReveal<HTMLDivElement>({ stagger: 70, y: 18 })

  const projectIntroRef = useTextReveal<HTMLParagraphElement>({ y: 20 })
  const featuresRef = useStaggerReveal<HTMLDivElement>({ stagger: 70, y: 20 })

  const flowRef = useStaggerReveal<HTMLUListElement>({ stagger: 50, y: 14, selector: 'li' })

  const stackRef = useStaggerReveal<HTMLDivElement>({ stagger: 50, y: 18 })

  const avatarsIntroRef = useTextReveal<HTMLParagraphElement>({ y: 16 })
  const avatarsRef = useImageReveal<HTMLDivElement>()

  return (
    <main className="min-h-dvh bg-bg">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32 md:px-16 md:pt-40">
        {/* Blob ambient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/5 blur-[120px]"
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-4">
            <p
              ref={eyebrowRef}
              className="font-mono text-[11px] uppercase tracking-widest text-accent"
            >
              Stream autonome 24/7
            </p>
            <LivePill />
          </div>

          <ScrambleText
            text="TANUKICHESSBOT"
            as="h1"
            className="block font-display text-[clamp(2.75rem,11vw,9rem)] uppercase leading-[0.92] tracking-tight text-text"
          />

          <p
            ref={subtitleRef}
            className="mt-8 max-w-2xl font-body text-base leading-relaxed text-muted2 md:text-lg"
          >
            Un bot IA qui joue aux échecs, commente à voix haute, anime un avatar
            3D et gère le chat Twitch — entièrement autonome, en direct, jour et nuit.
          </p>

          {/* Cover hero */}
          <div className="relative mt-12 aspect-video w-full overflow-hidden rounded-sm border border-border">
            <Image
              src={IMG.PROJECTS.tanukichessbot}
              alt="TanukiChessBot"
              fill
              sizes="(max-width: 1024px) 100vw, 1152px"
              className="object-cover"
              priority
            />
          </div>

          {/* Stats live Lichess */}
          <div
            ref={statsRef}
            className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <StatBox label="Parties jouées" value={stats?.games ?? null} />
            <StatBox label="Victoires" value={stats?.win ?? null} />
            <StatBox label="Défaites" value={stats?.loss ?? null} />
            <StatBox label="Nuls" value={stats?.draw ?? null} />
          </div>

          {/* CTA */}
          <div ref={ctaRef} className="mt-12">
            <a
              href={TWITCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
            >
              Regarder en live&nbsp;→
            </a>
          </div>
        </div>
      </section>

      {/* ── Le projet ────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionLabel index="01" label="Le projet" />
          <p
            ref={projectIntroRef}
            className="mb-12 max-w-2xl font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] italic leading-snug text-text"
          >
            Six briques open-source orchestrées en une seule chaîne temps réel,
            de la décision du coup à la voix de l’avatar.
          </p>

          <div
            ref={featuresRef}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f) => (
              <article
                key={f.name}
                className="card-shine flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/20"
              >
                <span className="font-display text-2xl uppercase tracking-tight text-text">
                  {f.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {f.role}
                </span>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted2">
                  {f.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/40 px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionLabel index="02" label="Architecture" />
          <ul ref={flowRef} className="flex flex-wrap items-center gap-3">
            {FLOW.map((step, i) => (
              <FlowStep key={step} label={step} last={i === FLOW.length - 1} />
            ))}
          </ul>
        </div>
      </section>

      {/* ── Stack technique ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionLabel index="03" label="Stack technique" />
          <div
            ref={stackRef}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {STACK.map((s) => (
              <div
                key={s.tech}
                className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/20"
              >
                <span className="font-display text-xl uppercase tracking-tight text-text">
                  {s.tech}
                </span>
                <span className="font-mono text-[11px] text-muted">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avatars ──────────────────────────────────────────────────────── */}
      <section className="border-t border-border px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionLabel index="04" label="Avatars" />
          <p
            ref={avatarsIntroRef}
            className="mb-12 max-w-2xl font-body text-sm leading-relaxed text-muted2"
          >
            Modèles VRM rigés dans Warudo. Le Tanuki est en stream ; deux nouveaux
            avatars arrivent. Les modèles 3D interactifs sont à découvrir en direct.
          </p>
          <div
            ref={avatarsRef}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {AVATARS.map((a) => (
              <AvatarCard
                key={a.name}
                name={a.name}
                emoji={a.emoji}
                meta={a.meta}
                status={a.status}
                model={a.model}
                ready={mvReady}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Retour ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href={lp('/projects')}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted2 transition-colors hover:text-accent"
          >
            <span aria-hidden="true">←</span> Retour aux projets
          </Link>
        </div>
      </section>

    </main>
  )
}
