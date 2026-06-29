import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import ProjectShowcase from '../_components/ProjectShowcase'

const TAGS = ['React Native', 'Next.js', 'shadcn/ui'] as const

const CONTENT = {
  fr: {
    tagline:     'Le Tinder des recettes',
    description:
      "Application mobile de match culinaire : swipez les recettes, matchez celles qui vous tentent et finissez les prises de tête en cuisine. Pensée pour décider à deux, sans débat interminable devant le frigo.",
    statusLabel: 'En développement',
    backLabel:   'Tous les projets',
    metaTitle:   'Yummr — Le Tinder des recettes',
  },
  en: {
    tagline:     'The Tinder of recipes',
    description:
      'A mobile recipe-matching app: swipe through recipes, match the ones you fancy and end the kitchen standoffs. Built to help two people decide — without the endless debate in front of the fridge.',
    statusLabel: 'In development',
    backLabel:   'All projects',
    metaTitle:   'Yummr — The Tinder of recipes',
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
    path: '/projects/yummr',
  })
}

export default async function YummrPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const c = CONTENT[loc]

  return (
    <ProjectShowcase
      index="03"
      total="05"
      title="YUMMR"
      tagline={c.tagline}
      description={c.description}
      tags={TAGS}
      status="wip"
      statusLabel={c.statusLabel}
      cta={null}
      backLabel={c.backLabel}
    />
  )
}
