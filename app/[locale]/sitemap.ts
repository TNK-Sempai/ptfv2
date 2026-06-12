import type { MetadataRoute } from 'next'
import { getWidgets } from '@/lib/notion'

const LOCALES = ['fr', 'en'] as const
type Locale = (typeof LOCALES)[number]

const PROJECT_SLUGS = [
  'tanukichessbot',
  'opti-troc',
  'yummr',
  'big-factory',
  'time-event',
] as const

const STATIC_PATHS = [
  { path: '',         changeFrequency: 'weekly'  as const, priority: 1.0 },
  { path: '/about',   changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/skills',  changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly'  as const, priority: 0.5 },
  { path: '/projects',changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/widgets', changeFrequency: 'weekly'  as const, priority: 0.8 },
] as const

/**
 * Sitemap locale-specific — accessible à /[locale]/sitemap.xml.
 * Entrées statiques + projets + widgets Notion.
 * alternates.languages pour hreflang FR ↔ EN.
 */
export default async function sitemap({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<MetadataRoute.Sitemap> {
  const { locale } = await params
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanuki-corporation.com').replace(/\/$/, '')

  const now = new Date()

  const localeUrl = (path: string) => `${base}/${locale}${path}`

  const alternates = (path: string): { languages: Record<string, string> } => ({
    languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}/${l}${path}`])) as Record<string, string>,
  })

  // Pages statiques
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: localeUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
    alternates: alternates(path),
  }))

  // Pages projets
  const projectEntries: MetadataRoute.Sitemap = PROJECT_SLUGS.map((slug) => ({
    url: localeUrl(`/projects/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: alternates(`/projects/${slug}`),
  }))

  // Pages widgets — dynamiques depuis Notion
  let widgetEntries: MetadataRoute.Sitemap = []
  try {
    const widgets = await getWidgets()
    widgetEntries = widgets.map((w) => ({
      url: localeUrl(`/widgets/${w.slug}`),
      lastModified: w.publishedAt ? new Date(w.publishedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: alternates(`/widgets/${w.slug}`),
    }))
  } catch {
    // Notion indisponible en build — on continue sans les widgets
  }

  return [...staticEntries, ...projectEntries, ...widgetEntries]
}
