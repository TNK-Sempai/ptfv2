import type { Metadata } from 'next'

const SITE_NAME = 'Tanuki Sempaï'
const OG_IMAGE = '/img/og-default.jpg'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanuki-corporation.com'
export const THEME_COLOR = '#09090e'
export const TITLE_TEMPLATE = '%s — Tanuki Sempaï'

export const DEFAULT_DESCRIPTION: Record<'fr' | 'en', string> = {
  fr: 'Développeur Full-Stack passionné — Next.js, TypeScript, animations et design niveau Awwwards.',
  en: 'Passionate Full-Stack developer — Next.js, TypeScript, animations and Awwwards-level design.',
}

type BuildMetadataOptions = {
  title: string
  description?: string
  locale?: 'fr' | 'en'
  path?: string
}

export function buildMetadata({
  title,
  description,
  locale = 'fr',
  path = '/',
}: BuildMetadataOptions): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION[locale]
  const canonical = `${SITE_URL}${path}`

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    robots: { index: true, follow: true },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description: desc,
      url: canonical,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@tanukicorp',
      title,
      description: desc,
      images: [OG_IMAGE],
    },
    alternates: {
      canonical,
    },
  }
}
