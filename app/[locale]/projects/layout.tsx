import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/metadata'

// ─── SEO ─────────────────────────────────────────────────────────────────────
// La page (app/[locale]/projects/page.tsx) est un Client Component et ne peut
// donc pas exporter generateMetadata. Ce layout server-only s'en charge.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'

  return buildMetadata({
    title: 'Projets — Tanuki Sempaï',
    locale: loc,
    path: '/projects',
  })
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children
}
