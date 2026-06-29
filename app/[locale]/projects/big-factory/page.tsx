import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import ProjectShowcase from '../_components/ProjectShowcase'

const TAGS = ['Next.js', 'TypeScript', 'shadcn/ui'] as const

const CONTENT = {
  fr: {
    tagline:     'Association culturelle — Bruxelles / Paris',
    description:
      "Site vitrine d'une association culturelle active entre Bruxelles et Paris. Design system robuste sous shadcn/ui, identité forte et navigation soignée pour mettre en valeur événements et projets artistiques.",
    statusLabel: 'Live',
    ctaLabel:    'Voir le site',
    backLabel:   'Tous les projets',
    metaTitle:   'Big Factory — Association culturelle Bruxelles / Paris',
  },
  en: {
    tagline:     'Cultural association — Brussels / Paris',
    description:
      'A showcase website for a cultural association active between Brussels and Paris. A robust design system built on shadcn/ui, a strong identity and careful navigation to highlight events and artistic projects.',
    statusLabel: 'Live',
    ctaLabel:    'Visit the site',
    backLabel:   'All projects',
    metaTitle:   'Big Factory — Cultural association Brussels / Paris',
  },
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  return buildMetadata({
    title: CONTENT[loc].metaTitle,
    description: CONTENT[loc].description,
    locale: loc,
    path: '/projects/big-factory',
  })
}

export default async function BigFactoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const c = CONTENT[loc]

  return (
    <ProjectShowcase
      index="04"
      total="05"
      title="BIG FACTORY"
      tagline={c.tagline}
      description={c.description}
      tags={TAGS}
      status="live"
      statusLabel={c.statusLabel}
      cta={{ href: 'https://bigfactory-nine.vercel.app/', label: c.ctaLabel }}
      backLabel={c.backLabel}
    />
  )
}
