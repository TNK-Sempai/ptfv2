'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  fadeIn, slideUp, slideRight, staggerContainer, clipReveal, popIn,
} from '@/components/motion/variants'

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

export default function AboutPage() {
  return (
    <motion.main variants={fadeIn} initial="hidden" animate="visible" className="bg-bg text-text">

      {/* ── 01 HERO ── */}
      <section className="flex min-h-dvh flex-col justify-end px-6 pb-24 pt-40 md:px-16 lg:px-24">
        <motion.div variants={staggerContainer} className="flex flex-col gap-4">
          <motion.span variants={slideUp} className="font-mono text-xs tracking-widest text-accent">
            01 / À propos
          </motion.span>
          <motion.h1
            variants={clipReveal}
            className="font-display text-6xl leading-none tracking-tight text-text md:text-8xl lg:text-[10rem]"
          >
            Vos idées<br />à l'écran
          </motion.h1>
        </motion.div>
      </section>

      {/* ── 02 PORTRAIT + STATS + BIO ── */}
      <section className="grid gap-16 px-6 py-24 md:grid-cols-2 md:px-16 lg:px-24">
        <motion.div variants={clipReveal} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface2">
          <Image
            src="/img/portrait.png"
            alt="Portrait Tanuki Sempaï"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </motion.div>

        <div className="flex flex-col justify-between gap-12">
          {/* Stats */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={popIn} className="rounded bg-surface2 p-5">
                <p className="font-display text-4xl text-accent">{s.value}</p>
                <p className="font-mono text-xs text-muted">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bio */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col gap-4">
            <motion.p variants={slideUp} className="font-body text-lg leading-relaxed text-text">
              Développeur Full-Stack basé à <span className="text-accent">Bruxelles</span>, je conçois des
              expériences web avec Next.js, React et TypeScript.
            </motion.p>
            <motion.p variants={slideUp} className="font-body text-base leading-relaxed text-muted2">
              Maîtrise Google Ads & SEO, je construis des <em>solutions business</em> — pas juste des
              fichiers. Chaque projet commence par comprendre votre métier, pas votre maquette.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── 03 TIMELINE ── */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <motion.p variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mb-12 font-mono text-xs tracking-widest text-accent">
          02 / Parcours
        </motion.p>
        <motion.ol variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex flex-col">
          {TIMELINE.map((item) => (
            <motion.li key={item.title} variants={slideRight}
              className="flex gap-8 border-b border-border py-6 last:border-0">
              <span className="w-12 shrink-0 font-mono text-sm text-muted">{item.year}</span>
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <p className="font-body font-semibold text-text">{item.title}</p>
                  <p className="font-mono text-xs text-muted2">{item.desc}</p>
                </div>
                {item.status === 'wip' && (
                  <span className="rounded border border-muted2/40 px-2 py-0.5 font-mono text-xs text-muted2">
                    En dev
                  </span>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* ── 04 PROCESS ── */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <motion.p variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mb-12 font-mono text-xs tracking-widest text-accent">
          03 / Process
        </motion.p>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step) => (
            <motion.div key={step.n} variants={slideUp}
              className="flex flex-col gap-4 rounded border border-border p-6">
              <span className="font-display text-5xl text-accent/20">{step.n}</span>
              <p className="font-body font-semibold text-text">{step.title}</p>
              <p className="font-mono text-xs leading-relaxed text-muted2">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </motion.main>
  )
}
