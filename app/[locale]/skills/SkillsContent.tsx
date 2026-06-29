'use client'

import SkillBar from '@/components/blocks/SkillBar'
import { useTextReveal } from '@/hooks/useTextReveal'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FRONTEND_SKILLS = [
  { skill: 'React / Next.js', level: 92 },
  { skill: 'CSS / Tailwind',  level: 90 },
  { skill: 'TypeScript',      level: 85 },
  { skill: 'HTML',            sublabel: 'sémantique + a11y', level: 95 },
] as const

const BACKEND_SKILLS = [
  { skill: 'Node.js / Express',     level: 78 },
  { skill: 'Supabase / PostgreSQL', level: 74 },
  { skill: 'Google Apps Script',    level: 70 },
] as const

const MARKETING_SKILLS = [
  { skill: 'Consent Mode v2',  level: 80 },
  { skill: 'Google Ads',       level: 78 },
  { skill: 'SEO / Analytics',  level: 72 },
] as const

const TECH_PILLS = [
  'Git / GitHub',
  'Vite',
  'Vercel',
  'Figma',
  'Claude Code',
  'Builder.io',
  'Consent Mode v2',
  'GTM',
  'REST API',
  'Prisma ORM',
  'shadcn/ui',
  'Radix UI',
] as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {index}
      </span>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted2">
        {label}
      </span>
    </div>
  )
}

// ─── Client Component ─────────────────────────────────────────────────────────

/**
 * SkillsContent — partie interactive/animée de la page Skills.
 * Extrait en composant client pour permettre l'usage des hooks reveal
 * sans casser le SSR ni l'export `metadata` du Server Component parent.
 */
export default function SkillsContent() {
  // Colonne gauche — reveals texte
  const eyebrowRef    = useTextReveal<HTMLParagraphElement>({ y: 12, delay: 0 })
  const titleRef      = useTextReveal<HTMLHeadingElement>({ y: 28, delay: 80 })
  const descRef       = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 160 })
  const pillsLabelRef = useTextReveal<HTMLParagraphElement>({ y: 12, delay: 220 })
  // Pills — stagger
  const pillsRef = useStaggerReveal<HTMLUListElement>({ stagger: 40, y: 12 })

  // Colonnes de skills — reveals par groupe
  const frontendRef  = useStaggerReveal<HTMLDivElement>({ stagger: 70, y: 18 })
  const backendRef   = useStaggerReveal<HTMLDivElement>({ stagger: 70, y: 18 })
  const marketingRef = useStaggerReveal<HTMLDivElement>({ stagger: 70, y: 18 })

  return (
    <main className="min-h-dvh bg-bg px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[2fr_3fr] lg:gap-24">

          {/* ── Colonne gauche — sticky ─────────────────────────────────── */}
          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">

            {/* Eyebrow */}
            <p
              ref={eyebrowRef}
              className="font-mono text-[10px] uppercase tracking-widest text-accent"
            >
              <span aria-hidden="true">03 /&nbsp;</span>
              Compétences
            </p>

            {/* Titre */}
            <h1
              ref={titleRef}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none tracking-tight text-text"
            >
              Ce que<br />je maîtrise
            </h1>

            {/* Description */}
            <p
              ref={descRef}
              className="font-body text-sm leading-relaxed text-muted2"
            >
              De l&apos;interface à l&apos;infrastructure, je construis des expériences
              web complètes — code propre, performances mesurées, zéro compromis
              sur l&apos;accessibilité.
            </p>

            {/* Tech pills */}
            <div>
              <p
                ref={pillsLabelRef}
                className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted"
              >
                Outils &amp; Éco-système
              </p>
              <ul
                ref={pillsRef}
                aria-label="Technologies maîtrisées"
                className="flex flex-wrap gap-2"
              >
                {TECH_PILLS.map((pill) => (
                  <li
                    key={pill}
                    className="pill-glow rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted2 transition-colors duration-200 hover:border-accent/30 hover:text-accent"
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            </div>

          </aside>

          {/* ── Colonne droite — scrollable ─────────────────────────────── */}
          <div className="flex flex-col gap-16">

            {/* Frontend */}
            <section aria-labelledby="cat-frontend">
              <CategoryLabel index="01" label="Frontend" />
              <h2 id="cat-frontend" className="sr-only">Frontend</h2>
              <div ref={frontendRef} className="flex flex-col gap-6">
                {FRONTEND_SKILLS.map((s) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    sublabel={'sublabel' in s ? (s as { sublabel: string }).sublabel : undefined}
                    level={s.level}
                    color="accent"
                  />
                ))}
              </div>
            </section>

            {/* Séparateur */}
            <span className="h-px w-full bg-border" aria-hidden="true" />

            {/* Backend */}
            <section aria-labelledby="cat-backend">
              <CategoryLabel index="02" label="Backend" />
              <h2 id="cat-backend" className="sr-only">Backend</h2>
              <div ref={backendRef} className="flex flex-col gap-6">
                {BACKEND_SKILLS.map((s) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    level={s.level}
                    color="blue"
                  />
                ))}
              </div>
            </section>

            {/* Séparateur */}
            <span className="h-px w-full bg-border" aria-hidden="true" />

            {/* Marketing */}
            <section aria-labelledby="cat-marketing">
              <CategoryLabel index="03" label="Marketing &amp; Tracking" />
              <h2 id="cat-marketing" className="sr-only">Marketing &amp; Tracking</h2>
              <div ref={marketingRef} className="flex flex-col gap-6">
                {MARKETING_SKILLS.map((s) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    level={s.level}
                    color="purple"
                  />
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}
