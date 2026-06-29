'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  fadeIn, slideUp, slideRight, staggerContainer, popIn,
} from '@/components/motion/variants'
import { IMG } from '@/lib/constants'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import { useTextReveal } from '@/hooks/useTextReveal'

const STATS = [
  { value: '4+', label: "ans d'expérience" },
  { value: '7+', label: 'projets livrés' },
  { value: '2', label: 'pays clients' },
  { value: '3', label: 'stacks core' },
] as const

const TIMELINE = [
  { year: '2026', title: 'TanukiChessBot', desc: "Bot IA d'échecs 24/7 sur Twitch & Lichess", status: 'live' },
  { year: '2026', title: 'Opti-Troc', desc: 'Marketplace B2B — Next.js', status: 'live' },
  { year: '2026', title: 'Yummr', desc: 'App mobile culinaire géolocalisée', status: 'wip' },
  { year: '2021', title: 'Time-Event.ch', desc: 'Billetterie en ligne + Google Ads', status: 'live' },
  { year: '2021', title: 'Big Factory Corp ASBL', desc: 'Site vitrine — design system', status: 'live' },
] as const

const PROCESS = [
  { n: '01', title: 'Écoute & Stratégie', desc: 'Comprendre votre métier, vos contraintes et vos objectifs avant toute ligne de code.' },
  { n: '02', title: 'Design & Architecture', desc: 'Wireframes, system design et choix technologiques validés ensemble.' },
  { n: '03', title: 'Développement itératif', desc: 'Livraisons régulières, feedback continu, qualité à chaque étape.' },
  { n: '04', title: 'Launch & Suivi', desc: 'Déploiement, SEO, analytics et optimisations post-lancement.' },
] as const

// Viewport partagé — déclenche à 10 % de visibilité, une seule fois.
const VIEWPORT = { once: true, amount: 0.1 } as const

/** Crochets d'angle DA — encadrent le portrait. */
function CornerBrackets() {
  const base = 'pointer-events-none absolute h-6 w-6 border-accent/50'
  return (
    <>
      <span className={`${base} -left-px -top-px border-l-2 border-t-2`} aria-hidden="true" />
      <span className={`${base} -right-px -top-px border-r-2 border-t-2`} aria-hidden="true" />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2`} aria-hidden="true" />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2`} aria-hidden="true" />
    </>
  )
}

export default function AboutPage() {
  // Process cards — stagger
  const processGridRef = useStaggerReveal<HTMLDivElement>({ stagger: 90, y: 24 })
  // Eyebrows (texte reveal)
  const parcoursEyebrowRef = useTextReveal<HTMLParagraphElement>({ y: 16, delay: 0 })
  const processEyebrowRef = useTextReveal<HTMLParagraphElement>({ y: 16, delay: 0 })

  return (
    <motion.main variants={fadeIn} initial="hidden" animate="visible" className="bg-bg text-text">

      {/* ── HERO : portrait (sticky) + contenu ── */}
      <section className="grid gap-12 px-6 pb-24 pt-32 md:px-16 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-24">

        {/* Colonne gauche — portrait + stats, sticky */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">

          {/* Portrait — aspect 3/4, border + crochets DA, wipe reveal */}
          <div className="relative aspect-3/4 w-full">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 overflow-hidden rounded-sm border border-border bg-surface2"
            >
              <Image
                src={IMG.PORTRAIT}
                alt="Portrait Tanuki Sempaï"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
                priority
              />
            </motion.div>
            <CornerBrackets />
          </div>

          {/* Stats — 2 colonnes */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={popIn}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <p className="font-display text-4xl leading-none text-accent">{s.value}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </aside>

        {/* Colonne droite — label + titre + bio + timeline */}
        <div className="flex flex-col gap-12">

          {/* Label + titre + bio */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.span variants={slideUp} className="font-mono text-xs uppercase tracking-widest text-accent">
              01 / À propos
            </motion.span>
            <motion.h1
              variants={slideUp}
              className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.95] tracking-tight text-text"
            >
              Vos idées<br />à l&apos;écran
            </motion.h1>
            <motion.p variants={slideUp} className="max-w-xl font-body text-lg leading-relaxed text-text">
              Développeur Full-Stack basé à <span className="text-accent">Bruxelles</span>, je conçois des
              expériences web avec Next.js, React et TypeScript.
            </motion.p>
            <motion.p variants={slideUp} className="max-w-xl font-body text-base leading-relaxed text-muted2">
              Maîtrise Google Ads &amp; SEO, je construis des <em>solutions business</em> — pas juste des
              fichiers. Chaque projet commence par comprendre votre métier, pas votre maquette.
            </motion.p>
          </motion.div>

          {/* Timeline */}
          <div>
            <p
              ref={parcoursEyebrowRef}
              className="mb-8 font-mono text-xs uppercase tracking-widest text-accent"
            >
              02 / Parcours
            </p>
            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="flex flex-col"
            >
              {TIMELINE.map((item) => (
                <motion.li
                  key={item.title}
                  variants={slideRight}
                  className="flex gap-6 border-b border-border py-5 last:border-0"
                >
                  <span className="w-12 shrink-0 font-mono text-sm text-muted">{item.year}</span>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div>
                      <p className="font-body font-semibold text-text">{item.title}</p>
                      <p className="font-mono text-xs text-muted2">{item.desc}</p>
                    </div>
                    {item.status === 'wip' && (
                      <span className="shrink-0 rounded border border-muted2/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted2">
                        En dev
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="border-t border-border px-6 py-24 md:px-16 lg:px-24">
        <p
          ref={processEyebrowRef}
          className="mb-12 font-mono text-xs uppercase tracking-widest text-accent"
        >
          03 / Process
        </p>
        <div
          ref={processGridRef}
          className="grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {PROCESS.map((step) => (
            <div key={step.n} className="flex flex-col gap-4">
              <span
                aria-hidden="true"
                className="font-display text-6xl leading-none text-transparent [-webkit-text-stroke:1.5px_var(--accent)]"
              >
                {step.n}
              </span>
              <p className="font-body font-semibold text-text">{step.title}</p>
              <p className="font-mono text-xs leading-relaxed text-muted2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </motion.main>
  )
}
