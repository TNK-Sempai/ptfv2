import type { Metadata, Viewport } from 'next'
import {
  Bebas_Neue,
  DM_Serif_Display,
  DM_Mono,
  Instrument_Sans,
} from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import {
  buildMetadata,
  DEFAULT_DESCRIPTION,
  THEME_COLOR,
  TITLE_TEMPLATE,
} from '@/lib/metadata'
import Nav from '@/components/blocks/Nav'
import Footer from '@/components/blocks/Footer'
import { NoiseOverlay } from '@/components/ui/NoiseOverlay'
import { Cursor } from '@/components/ui/Cursor'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { CursorProvider } from '@/components/motion/CursorContext'
import { PageTransitions } from '@/components/motion/PageTransitions'
import { DoorTransition } from '@/components/motion/DoorTransition'
import '../globals.css'

// ─── Fonts ───────────────────────────────────────────────────────────────────

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas',
  subsets: ['latin'],
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  subsets: ['latin'],
  display: 'swap',
})

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  subsets: ['latin'],
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  subsets: ['latin'],
  display: 'swap',
})

const fontVars = [
  bebasNeue.variable,
  dmSerifDisplay.variable,
  dmMono.variable,
  instrumentSans.variable,
].join(' ')

// ─── Static params & metadata ────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'fr'
  const base = buildMetadata({
    title: 'Tanuki Sempaï — Développeur Full-Stack',
    description: DEFAULT_DESCRIPTION[loc],
    locale: loc,
    path: '/',
  })

  return {
    ...base,
    title: {
      template: TITLE_TEMPLATE,
      default: 'Tanuki Sempaï — Développeur Full-Stack',
    },
    manifest: '/manifest.json',
    alternates: {
      ...base.alternates,
      languages: { fr: '/fr', en: '/en' },
    },
  }
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${fontVars} antialiased`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <CursorProvider>
              <DoorTransition />
              <Nav />
              <PageTransitions>
                <main>{children}</main>
              </PageTransitions>
              <Footer />
            </CursorProvider>
          </LenisProvider>
        </NextIntlClientProvider>
        <>
          <NoiseOverlay />
          <Cursor />
        </>
      </body>
    </html>
  )
}
