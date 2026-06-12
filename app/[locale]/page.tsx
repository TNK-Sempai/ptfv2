'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { SplitText } from '@/components/ui/SplitText'
import { fadeIn, slideUp, staggerContainer, popIn } from '@/components/motion/variants'

const STACK = [
  'Next.js', 'React', 'TypeScript', 'Interface Design', 'Node.js',
  'Supabase', 'Google Ads', 'Tailwind CSS', 'GSAP', 'Framer Motion',
  'Python', 'IA', 'Twitch', 'Figma', 'Vercel',
]

const TITLE_LINES = [
  { text: 'LASS',   delay: 0.2,  cls: 'font-serif italic text-[clamp(2rem,5vw,5rem)] leading-none text-muted2' },
  { text: 'TANUKI', delay: 0.38, cls: 'font-display text-[clamp(5rem,15vw,14rem)] leading-none tracking-tight text-text' },
  { text: 'SEMPAÏ', delay: 0.58, cls: 'font-display text-[clamp(3rem,8vw,8rem)] leading-none tracking-tight text-accent' },
] as const

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
    </>
  )
}

function HeroSection() {
  const locale = useLocale()
  const router = useRouter()
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)

  return (
    <section
      role="banner"
      aria-label="Hero"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-bg px-6 pb-16 pt-32 md:px-16 md:pb-24 lg:pt-40"
    >
      {/* Blobs ambient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-accent/3 blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* 2026 watermark */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 select-none font-display text-[clamp(4rem,8vw,8rem)] leading-none tracking-[0.3em] text-muted/10"
      >
        2026
      </p>

      {/* Contenu principal */}
      <motion.div
        className="relative z-10 max-w-5xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeIn}
          className="mb-6 font-mono text-xs uppercase tracking-widest text-accent"
        >
          Développeur Full-Stack & Community Management
        </motion.p>

        {/* Titre — 3 lignes */}
        <div className="mb-8">
          {TITLE_LINES.map(({ text, delay, cls }) => (
            <SplitText
              key={text}
              text={text}
              by="chars"
              trigger="immediate"
              delay={delay}
              as="p"
              className={cls}
            />
          ))}
        </div>

        {/* Sous-titre */}
        <motion.p
          variants={slideUp}
          className="mb-8 max-w-xl font-body text-base leading-relaxed text-muted2 md:text-lg"
        >
          Je conçois et développe des expériences digitales sur-mesure
          {' '}— de l&apos;idée au produit final.
        </motion.p>

        {/* Badge dispo + localisation */}
        <motion.div variants={fadeIn} className="mb-10 flex flex-wrap items-center gap-6">
          <motion.span
            variants={popIn}
            className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 font-body text-sm text-text"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Disponible pour de nouveaux projets
          </motion.span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <span aria-hidden="true">📍</span>
            Bruxelles, Belgique
          </span>
        </motion.div>

        {/* CTA */}
        <motion.div variants={slideUp}>
          <MagneticButton
            aria-label="Découvrir mon profil"
            className="rounded-full bg-accent px-8 py-3.5 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
            onClick={() => router.push(lp('/about'))}
          >
            Découvrir mon profil&nbsp;→
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div
        aria-label="Indicateur de défilement"
        className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-muted"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.span
          className="block h-12 w-px origin-top bg-muted/40"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </section>
  )
}

function MarqueeStrip() {
  const doubled = [...STACK, ...STACK]
  return (
    <section
      className="overflow-hidden border-y border-border bg-surface py-5"
      aria-hidden="true"
    >
      <style>{`@keyframes marquee-scroll{to{transform:translateX(-50%)}}`}</style>
      <div className="flex w-max animate-[marquee-scroll_40s_linear_infinite] items-center">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted2"
          >
            {item}
            <span className="mx-8 text-accent opacity-40" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </section>
  )
}
