import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import ContactContent from './ContactContent'

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'

  const title = loc === 'fr'
    ? 'Contact — Travaillons ensemble'
    : 'Contact — Let\'s work together'

  return buildMetadata({ title, locale: loc, path: '/contact' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * ContactPage — Server Component.
 * Résout les traductions côté serveur et les passe en props à ContactContent
 * (composant client), préservant ainsi `generateMetadata` et le SSR.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <ContactContent
      label={t('label')}
      heading={t('heading')}
      subtitle={t('subtitle')}
      ctaEmail={t('cta_email')}
      ctaLinkedin={t('cta_linkedin')}
      ctaGithub={t('cta_github')}
    />
  )
}
