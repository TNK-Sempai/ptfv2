import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import ProjectShowcase from '../_components/ProjectShowcase'

const TAGS = ['Next.js', 'TypeScript', 'B2B', 'Marketplace', 'Sécurité'] as const

const CONTENT = {
  fr: {
    tagline:     'Marketplace B2B — équipement optique',
    description:
      "Plateforme B2B d'échange et de revente de matériel optique entre professionnels. Authentification robuste, gestion d'annonces et messagerie intégrée — une interface complète conçue avec Builder.io et Figma.",
    statusLabel: 'Live',
    ctaLabel:    'Voir le site',
    backLabel:   'Tous les projets',
    metaTitle:   'Opti-Troc — Marketplace B2B équipement optique',
  },
  en: {
    tagline:     'B2B marketplace — optical equipment',
    description:
      'A B2B platform for trading and reselling optical equipment between professionals. Robust authentication, listings management and built-in messaging — a complete interface designed with Builder.io and Figma.',
    statusLabel: 'Live',
    ctaLabel:    'Visit the site',
    backLabel:   'All projects',
    metaTitle:   'Opti-Troc — B2B optical equipment marketplace',
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
    path: '/projects/opti-troc',
  })
}

export default async function OptiTrocPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const c = CONTENT[loc]

  return (
    <ProjectShowcase
      index="02"
      total="05"
      title="OPTI-TROC"
      tagline={c.tagline}
      description={c.description}
      tags={TAGS}
      status="live"
      statusLabel={c.statusLabel}
      cta={{ href: 'https://opti-troc.vercel.app/', label: c.ctaLabel }}
      backLabel={c.backLabel}
    />
  )
}
