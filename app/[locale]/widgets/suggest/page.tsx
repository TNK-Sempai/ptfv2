import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import SuggestContent from './SuggestContent'

type Props = {
  params: Promise<{ locale: string }>
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'

  return buildMetadata({
    title: 'Suggérer un widget — 1001 Widgets',
    description: 'Propose un widget à la communauté. Si 10 devs votent pour, on le construit.',
    locale: loc,
    path: '/widgets/suggest',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuggestPage() {
  return (
    <article className="flex flex-col gap-16 py-12">
      {/* Retour */}
      <Link
        href="/widgets"
        className="group inline-flex w-fit items-center gap-2 font-mono text-sm text-muted2 transition-colors hover:text-text"
      >
        <span aria-hidden className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Retour aux widgets
      </Link>

      {/* En-tête */}
      <header className="flex flex-col gap-5">
        <span className="w-fit rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Suggérer un widget
        </span>
        <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-text md:text-7xl">
          Tu veux coder ça ?
        </h1>
        <p className="max-w-md font-body text-base leading-relaxed text-muted2">
          Propose un widget à la communauté. Si 10 devs votent pour, on le construit.
        </p>
      </header>

      <SuggestContent />
    </article>
  )
}
