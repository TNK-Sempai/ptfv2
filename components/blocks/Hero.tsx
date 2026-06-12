import { SplitText } from '@/components/ui/SplitText'
import { MagneticButton } from '@/components/ui/MagneticButton'

/**
 * Placeholder Hero — markup uniquement, pas de logique.
 * Slots : eyebrow | title (SplitText) | subtitle | CTA
 * Logique scramble + clip-path reveal → session suivante (MILO).
 */
export function Hero() {
  return (
    <section
      role="banner"
      className="relative flex min-h-svh flex-col items-start justify-end bg-[var(--bg)] px-6 pb-16 pt-32 md:px-16 md:pb-24"
      aria-label="Hero"
    >
      {/* Eyebrow */}
      <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--accent)]">
        <span aria-hidden="true">01 —&nbsp;</span>
        Développeur Full-Stack Senior
      </p>

      {/* Title */}
      <SplitText
        text="SEMPAÏ"
        by="chars"
        trigger="immediate"
        delay={0.2}
        as="h1"
        className="font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,10rem)] uppercase leading-none tracking-tight text-[var(--text)]"
      />

      {/* Subtitle */}
      <p className="mt-6 max-w-xl font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--muted2)] md:text-lg">
        {/* slot : copy hero */}
        Je construis des expériences web qui convertissent.
        Code propre, animations précises, zéro compromis.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap gap-4">
        <MagneticButton
          className="rounded-full bg-[var(--accent)] px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--bg)]"
        >
          Voir mes projets
        </MagneticButton>

        <MagneticButton
          className="rounded-full border border-[var(--border)] px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)]/40"
        >
          Me contacter
        </MagneticButton>
      </div>

      {/* Scroll indicator — slot décoratif */}
      <div
        aria-label="Indicateur de défilement"
        className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-[var(--muted)]"
      >
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest">
          Scroll
        </span>
        <span className="h-10 w-px bg-[var(--border)]" />
      </div>
    </section>
  )
}
