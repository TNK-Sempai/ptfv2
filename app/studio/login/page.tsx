// app/studio/login/page.tsx — Page de connexion studio (publique mais cachée)
//
// Le slug secret est passé en query (?key=<STUDIO_SLUG>). Validation côté serveur :
// slug absent ou faux → 404, la page elle-même reste invisible sans le slug.
// Next.js 16 : searchParams est asynchrone → await.

import { notFound } from 'next/navigation'
import { verifySlug } from '@/lib/studio/studio-auth'
import { STUDIO_SLUG_PARAM } from '@/lib/studio/constants'
import { LoginForm } from './LoginForm'

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const raw = params[STUDIO_SLUG_PARAM]
  const slug = typeof raw === 'string' ? raw : ''

  if (!verifySlug(slug)) notFound()

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <LoginForm slug={slug} />
    </main>
  )
}
