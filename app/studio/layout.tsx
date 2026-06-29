// app/studio/layout.tsx — Racine du sous-arbre /studio (HORS i18n, pas de [locale])
//
// Fournit <html>/<body> + typographie DA, car app/layout.tsx ne rend que `children`
// (les balises racine vivent dans app/[locale]/layout.tsx, hors de notre arbre).
//
// ⚠️ AUCUN auth guard ici : ce layout enveloppe aussi /studio/login.
//    Le guard est dans app/studio/(dashboard)/layout.tsx pour éviter la boucle
//    de redirection login → login.

import type { Metadata, Viewport } from 'next'
import {
  Bebas_Neue,
  DM_Serif_Display,
  DM_Mono,
  Instrument_Sans,
} from 'next/font/google'
import { THEME_COLOR } from '@/lib/metadata'
import StudioCursor from '@/components/studio/StudioCursor'
import '../globals.css'

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

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
}

// Cockpit privé : jamais indexé.
export const metadata: Metadata = {
  title: 'Tanuki Control Center',
  robots: { index: false, follow: false },
}

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${fontVars} antialiased`}>
      <body className="bg-bg text-text">
        {children}
        <StudioCursor />
      </body>
    </html>
  )
}
