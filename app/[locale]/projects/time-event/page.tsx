import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import ProjectShowcase from '../_components/ProjectShowcase'

const TAGS = ['Web', 'Google Ads', 'Billetterie', 'Consent Mode v2'] as const

const CONTENT = {
  fr: {
    tagline:     'Billetterie — Théâtre du Martolet',
    description:
      "Billetterie en ligne pour le Théâtre du Martolet. Suivi des conversions, pilotage des campagnes Google Ads et Consent Mode v2 — conformité RGPD assurée de bout en bout, du clic à la réservation.",
    statusLabel: 'Live',
    ctaLabel:    'Voir le site',
    backLabel:   'Tous les projets',
    metaTitle:   'Time-Event.ch — Billetterie Théâtre du Martolet',
  },
  en: {
    tagline:     'Ticketing — Théâtre du Martolet',
    description:
      'Online ticketing for the Théâtre du Martolet. Conversion tracking, Google Ads campaign management and Consent Mode v2 — end-to-end GDPR compliance, from click to booking.',
    statusLabel: 'Live',
    ctaLabel:    'Visit the site',
    backLabel:   'All projects',
    metaTitle:   'Time-Event.ch — Théâtre du Martolet ticketing',
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
    path: '/projects/time-event',
  })
}

export default async function TimeEventPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const c = CONTENT[loc]

  return (
    <ProjectShowcase
      index="05"
      total="05"
      title="TIME-EVENT.CH"
      tagline={c.tagline}
      description={c.description}
      tags={TAGS}
      status="live"
      statusLabel={c.statusLabel}
      cta={{ href: 'https://time-event.ch', label: c.ctaLabel }}
      backLabel={c.backLabel}
    />
  )
}
