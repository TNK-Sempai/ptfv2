'use client'

import { useTextReveal } from '@/hooks/useTextReveal'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

const EMAIL    = 'contact@tanuki-corporation.com'
const LINKEDIN = 'https://www.linkedin.com/in/meidhy-ali-oussalah-15a982229/'
const GITHUB   = 'https://github.com/TNK-Sempai'

interface ContactContentProps {
  label:        string
  heading:      string
  subtitle:     string
  ctaEmail:     string
  ctaLinkedin:  string
  ctaGithub:    string
}

/**
 * ContactContent — partie interactive/animée de la page Contact.
 * Extrait en composant client pour permettre l'usage des hooks reveal
 * sans casser le SSR ni l'export async `generateMetadata` du Server Component parent.
 *
 * Les traductions sont injectées en props depuis le Server Component.
 */
export default function ContactContent({
  label,
  heading,
  subtitle,
  ctaEmail,
  ctaLinkedin,
  ctaGithub,
}: ContactContentProps) {
  // Reveals texte
  const eyebrowRef  = useTextReveal<HTMLParagraphElement>({ y: 12, delay: 0 })
  const titleRef    = useTextReveal<HTMLHeadingElement>({ y: 36, delay: 80 })
  const subtitleRef = useTextReveal<HTMLParagraphElement>({ y: 20, delay: 180 })
  const emailRef    = useTextReveal<HTMLAnchorElement>({ y: 16, delay: 260 })
  // CTA buttons — stagger
  const ctaRef = useStaggerReveal<HTMLDivElement>({ stagger: 80, y: 16 })

  return (
    <section
      className="relative flex min-h-dvh flex-col justify-center px-6 pb-24 pt-24 md:px-16"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto w-full max-w-5xl">

        {/* Eyebrow */}
        <p
          ref={eyebrowRef}
          className="mb-6 font-mono text-xs uppercase tracking-widest text-accent"
        >
          <span aria-hidden="true">05&nbsp;/&nbsp;</span>
          {label}
        </p>

        {/* Grand titre */}
        <h1
          ref={titleRef}
          id="contact-heading"
          className="font-display text-[clamp(3rem,8vw,8rem)] uppercase leading-none tracking-tight text-text"
        >
          {heading}
        </h1>

        {/* Sous-titre */}
        <p
          ref={subtitleRef}
          className="mt-5 font-body text-base text-muted2 md:text-lg"
        >
          {subtitle}
        </p>

        {/* Séparateur */}
        <div className="my-10 h-px w-16 bg-border" aria-hidden="true" />

        {/* Email link — pas d'adresse en clair dans le HTML */}
        <a
          ref={emailRef}
          href={`mailto:${EMAIL}`}
          className="font-mono text-sm text-muted2 transition-colors duration-200 hover:text-accent md:text-base"
          aria-label={ctaEmail}
        >
          {ctaEmail}&nbsp;→
        </a>

        {/* CTA buttons — stagger */}
        <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4">

          {/* Primary — Envoyer un email */}
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-body text-sm font-semibold text-bg transition-opacity duration-200 hover:opacity-90 focus-visible:opacity-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {ctaEmail}
          </a>

          {/* LinkedIn */}
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-body text-sm font-semibold text-text transition-colors duration-200 hover:border-accent/40 hover:text-accent focus-visible:border-accent/40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            {ctaLinkedin}
          </a>

          {/* GitHub */}
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-body text-sm font-semibold text-text transition-colors duration-200 hover:border-accent/40 hover:text-accent focus-visible:border-accent/40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            {ctaGithub}
          </a>
        </div>

      </div>
    </section>
  )
}
