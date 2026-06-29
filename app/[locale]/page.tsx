'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

import { MagneticButton } from '@/components/ui/MagneticButton'
import { SplitText } from '@/components/ui/SplitText'
import { CountUp } from '@/components/ui/CountUp'
import ScrambleText from '@/components/blocks/ScrambleText'
import ProjectCard from '@/components/blocks/ProjectCard'
import { fadeIn, slideUp, scaleIn, staggerContainer, staggerContainerFast, popIn } from '@/components/motion/variants'
import { useTextReveal } from '@/hooks/useTextReveal'
import { PROJECTS } from '@/lib/constants'

// ─── Données éditoriales (statiques) ──────────────────────────────────────────

const STACK = [
  'Next.js', 'React', 'TypeScript', 'Interface Design', 'Node.js',
  'Supabase', 'Google Ads', 'Tailwind CSS', 'GSAP', 'Framer Motion',
  'Python', 'IA', 'Twitch', 'Figma', 'Vercel',
]

const STATS = [
  { to: 4,   suffix: '+',  label: 'ans d’expérience' },
  { to: 7,   suffix: '+',  label: 'projets livrés' },
  { to: 3,   suffix: '',   label: 'pays clients' },
  { to: 100, suffix: '%',  label: 'satisfaction' },
] as const

const FEATURED_SLUGS = ['tanukichessbot', 'opti-troc', 'yummr'] as const

const SERVICES = [
  {
    icon: '‹∕›',
    title: 'Développement Web',
    desc: 'Applications rapides, accessibles et maintenables, du SSR au temps réel.',
    items: ['Next.js', 'React', 'TypeScript'],
  },
  {
    icon: '◈',
    title: 'Marketing Digital',
    desc: 'Acquisition mesurable : campagnes pilotées par la donnée et conformité RGPD.',
    items: ['Google Ads', 'SEO', 'Analytics'],
  },
  {
    icon: '⚡',
    title: 'Produits IA',
    desc: 'Automatisations et agents sur-mesure qui font gagner du temps au quotidien.',
    items: ['Bots', 'Automatisation', 'Intégrations'],
  },
] as const

const TITLE_LINES = [
  { text: 'LASS',   delay: 0.2,  cls: 'font-serif italic text-[clamp(1.5rem,4vw,3rem)] leading-none text-muted2' },
  { text: 'TANUKI', delay: 0.38, cls: 'font-display text-[clamp(4rem,15vw,14rem)] leading-none tracking-tight text-text' },
] as const

const CONTACT_EMAIL = 'contact@tanuki-corporation.com'

// Viewport partagé — déclenche à 10 % de visibilité, une seule fois.
const VIEWPORT = { once: true, amount: 0.1 } as const

export default function HomePage() {
  const locale = useLocale()
  const router = useRouter()
  // Préfixe locale — cohérent avec le reste du portfolio (next/link non préfixé)
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)

  return (
    <main className="bg-bg text-text">
      <HeroSection lp={lp} router={router} />
      <MarqueeStrip />
      <StatsSection />
      <FeaturedSection lp={lp} />
      <ServicesSection />
      <FinalCtaSection lp={lp} router={router} />
    </main>
  )
}

// ─── Section 1 — Hero fullscreen ──────────────────────────────────────────────

type NavProps = {
  lp: (p: string) => string
  router: ReturnType<typeof useRouter>
}

function HeroSection({ lp, router }: NavProps) {
  const watermarkRef = useTextReveal<HTMLParagraphElement>({ delay: 1800, y: 12 })

  return (
    <section
      role="banner"
      aria-label="Hero"
      className="relative min-h-svh flex items-center overflow-hidden bg-bg bg-grid px-14 pt-24 pb-12"
    >
      {/* Blobs ambient — en absolute derrière tout (.blob-ambient → NOVA) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-ambient h-[600px] w-[600px] bg-accent/5 top-[-100px] right-[-150px]" />
        <div className="blob-ambient h-[400px] w-[400px] bg-accent/3 bottom-0 left-[-100px] [animation-delay:-6s]" />
        <div className="blob-ambient h-[300px] w-[300px] bg-blue-500/3 top-[30%] right-[30%] [animation-delay:-3s]" />
      </div>

      {/* 2026 watermark vertical droite */}
      <p
        ref={watermarkRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 select-none font-display text-[clamp(4rem,8vw,8rem)] leading-none tracking-[0.3em] text-muted/10"
      >
        2026
      </p>

      {/* Grid 2 colonnes — contenu | Chopper, partage l'espace */}
      <div className="relative z-10 grid grid-cols-[1fr_1fr] items-center gap-8 max-w-6xl mx-auto w-full">
      {/* Colonne gauche — contenu, above the fold → animate="visible" */}
      <motion.div
        className="pr-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeIn}
          className="mb-6 font-mono text-xs uppercase tracking-widest text-accent"
        >
          Disponible pour missions freelance
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
          <ScrambleText
            text="SEMPAÏ"
            delay={0.58}
            as="p"
            className="font-display text-[clamp(2.5rem,8vw,8rem)] leading-none tracking-tight text-accent"
          />
        </div>

        {/* Sous-titre */}
        <motion.p
          variants={slideUp}
          className="mb-8 max-w-xl font-body text-base leading-relaxed text-muted2 md:text-lg"
        >
          Je conçois des expériences digitales qui convertissent
          {' '}— de l&apos;idée au produit final.
        </motion.p>

        {/* Badge dispo pulsant + localisation */}
        <motion.div variants={fadeIn} className="mb-10 flex flex-wrap items-center gap-6">
          <motion.span
            variants={popIn}
            className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 font-body text-sm text-text"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Disponible
          </motion.span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <span aria-hidden="true">📍</span>
            Bruxelles, Belgique
          </span>
        </motion.div>

        {/* 2 CTA côte à côte */}
        <motion.div variants={slideUp} className="flex flex-wrap items-center gap-4">
          <MagneticButton
            aria-label="Démarrer un projet"
            className="rounded-full bg-accent px-8 py-3.5 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
            onClick={() => router.push(lp('/contact'))}
          >
            Démarrer un projet&nbsp;→
          </MagneticButton>
          <MagneticButton
            aria-label="Voir mes projets"
            className="rounded-full border border-border px-8 py-3.5 font-body text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:text-accent"
            onClick={() => router.push(lp('/projects'))}
          >
            Voir mes projets
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Colonne droite — Chopper, glow néon (.chopper-glow → NOVA) */}
      <div className="relative flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/logo-tnkc.svg"
          alt=""
          aria-hidden="true"
          className="chopper-glow"
          style={{
            width: '100%',
            maxWidth: '650px',
            margin: 'auto',
            filter: `
              drop-shadow(0 0 15px #c8f060)
              drop-shadow(0 0 35px #c8f060)
              drop-shadow(0 0 70px rgba(200,240,96,0.8))
              drop-shadow(0 0 120px rgba(200,240,96,0.5))
              drop-shadow(0 0 200px rgba(200,240,96,0.3))
            `,
          }}
        />
      </div>
      </div>

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

// ─── Marquee — entre hero et chiffres ─────────────────────────────────────────

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

// ─── Section 2 — Chiffres (CountUp au scroll) ─────────────────────────────────

function StatsSection() {
  return (
    <motion.section
      variants={staggerContainerFast}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className="grid grid-cols-2 gap-px border-y border-border bg-surface md:grid-cols-4"
    >
      {STATS.map((s) => (
        <motion.div
          key={s.label}
          variants={popIn}
          className="flex flex-col items-center justify-center gap-2 bg-bg px-6 py-14"
        >
          <CountUp
            to={s.to}
            suffix={s.suffix}
            className="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-accent"
          />
          <span className="text-center font-mono text-[11px] uppercase tracking-widest text-muted">
            {s.label}
          </span>
        </motion.div>
      ))}
    </motion.section>
  )
}

// ─── Section 3 — Projets en avant (3 cards) ───────────────────────────────────

function FeaturedSection({ lp }: { lp: (p: string) => string }) {
  const featured = FEATURED_SLUGS
    .map((slug) => PROJECTS.find((p) => p.slug === slug))
    .filter((p): p is (typeof PROJECTS)[number] => Boolean(p))

  return (
    <section className="px-6 py-24 md:px-16 lg:px-24">
      {/* Header section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="mb-12 flex flex-wrap items-end justify-between gap-6"
      >
        <div className="flex flex-col gap-3">
          <motion.span variants={slideUp} className="font-mono text-xs uppercase tracking-widest text-accent">
            Projets en avant
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.95] tracking-tight text-text"
          >
            Une sélection
          </motion.h2>
        </div>
        <motion.a
          variants={slideUp}
          href={lp('/projects')}
          data-cursor="hover"
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-border px-6 py-3 font-body text-sm text-muted2 transition-colors hover:border-accent/40 hover:text-accent"
        >
          Tous les projets
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </motion.a>
      </motion.div>

      {/* Grille cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {featured.map((project) => (
          <motion.div key={project.slug} variants={scaleIn}>
            <ProjectCard
              title={project.title}
              description={project.description}
              tags={[...project.tags]}
              badge={project.badge}
              year={project.year}
              href={lp(`/projects/${project.slug}`)}
              image={project.coverImage}
              status={project.status}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ─── Section 4 — Services ─────────────────────────────────────────────────────

function ServicesSection() {
  return (
    <section className="border-t border-border px-6 py-24 md:px-16 lg:px-24">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="mb-12 flex flex-col gap-3"
      >
        <motion.span variants={slideUp} className="font-mono text-xs uppercase tracking-widest text-accent">
          Ce que je fais
        </motion.span>
        <motion.h2
          variants={slideUp}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.95] tracking-tight text-text"
        >
          Trois expertises
        </motion.h2>
      </motion.div>

      <motion.div
        variants={staggerContainerFast}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="grid gap-6 md:grid-cols-3"
      >
        {SERVICES.map((service) => (
          <motion.article
            key={service.title}
            variants={slideUp}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-8"
          >
            <span aria-hidden="true" className="font-display text-3xl text-accent">{service.icon}</span>
            <h3 className="font-body text-xl font-semibold text-text">{service.title}</h3>
            <p className="font-body text-sm leading-relaxed text-muted2">{service.desc}</p>
            <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Compétences">
              {service.items.map((item) => (
                <li key={item} className="rounded border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted2">
                  {item}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}

// ─── Section 5 — CTA final (tunnel contact) ───────────────────────────────────

function FinalCtaSection({ lp, router }: NavProps) {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-32 md:px-16 lg:px-24">
      {/* Blob accent derrière le CTA (.blob-ambient à définir par NOVA) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob-ambient h-[400px] w-[800px] bg-accent/5 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative z-10 flex flex-col items-center gap-8 text-center"
      >
        <motion.h2
          variants={slideUp}
          className="font-display text-[clamp(3rem,10vw,8rem)] uppercase leading-[0.9] tracking-tight text-text"
        >
          Un projet en tête&nbsp;?
        </motion.h2>
        <motion.p variants={slideUp} className="max-w-md font-body text-lg leading-relaxed text-muted2">
          Parlons-en. Je réponds sous 24h.
        </motion.p>

        <motion.div variants={slideUp}>
          <MagneticButton
            aria-label="Démarrer un projet"
            strength={0.5}
            className="rounded-full bg-accent px-10 py-4 font-body text-base font-semibold text-bg transition-colors hover:bg-accent/90"
            onClick={() => router.push(lp('/contact'))}
          >
            Démarrer un projet&nbsp;→
          </MagneticButton>
        </motion.div>

        <motion.a
          variants={fadeIn}
          href={`mailto:${CONTACT_EMAIL}`}
          data-cursor="hover"
          aria-label="Envoyer un email"
          className="font-mono text-sm text-muted transition-colors hover:text-accent"
        >
          Envoyer un email&nbsp;→
        </motion.a>
      </motion.div>
    </section>
  )
}