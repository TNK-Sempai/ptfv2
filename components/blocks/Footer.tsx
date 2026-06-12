import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('nav')

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Top row: brand + links */}
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <Link href="/" className="font-display text-2xl tracking-widest text-accent">
              TANUKI
            </Link>
            <span className="font-mono text-xs text-muted">tanuki-corporation.com</span>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted2">
            <Link href="/about"    className="transition-colors hover:text-text">{t('about')}</Link>
            <Link href="/projects" className="transition-colors hover:text-text">{t('projects')}</Link>
            <Link href="/skills"   className="transition-colors hover:text-text">{t('skills')}</Link>
            <Link href="/widgets"  className="transition-colors hover:text-text">{t('widgets')}</Link>
            <Link href="/contact"  className="transition-colors hover:text-text">{t('contact')}</Link>
          </nav>
        </div>

        {/* Bottom row: copyright */}
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Tanuki Corporation
          </p>
          <span className="font-mono text-xs text-muted2">v2</span>
        </div>
      </div>
    </footer>
  )
}
