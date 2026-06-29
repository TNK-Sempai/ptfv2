// app/api/studio/auth/route.ts — Vérification PIN + slug → pose le cookie de session studio
//
// Indépendant de l'auth /admin. Réutilise le rate-limit existant (anti brute-force PIN).
// ⚠️ Runtime Node : studio-auth utilise le module crypto natif.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createSessionToken,
  studioCookieOptions,
  verifyPin,
  verifySlug,
} from '@/lib/studio/studio-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { extractIp, hashIp } from '@/lib/security'

export const runtime = 'nodejs'

interface AuthBody {
  pin?: unknown
  slug?: unknown
}

export async function POST(request: Request): Promise<NextResponse> {
  // Anti brute-force : limite par IP hashée (clé préfixée pour ne pas
  // entrer en collision avec le rate-limit des commentaires).
  const ipHash = await hashIp(extractIp(request))
  const rl = checkRateLimit(`studio-auth:${ipHash}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Trop de tentatives. Réessaie plus tard.' },
      { status: 429 },
    )
  }

  let body: AuthBody
  try {
    body = (await request.json()) as AuthBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 })
  }

  const pin = typeof body.pin === 'string' ? body.pin : ''
  const slug = typeof body.slug === 'string' ? body.slug : ''

  // Slug ET PIN requis. Message volontairement identique → ne révèle pas
  // lequel des deux est faux.
  if (!verifySlug(slug) || !verifyPin(pin)) {
    return NextResponse.json({ ok: false, error: 'Accès refusé.' }, { status: 401 })
  }

  const token = createSessionToken()
  const { name, ...options } = studioCookieOptions
  const store = await cookies()
  store.set(name, token, options)

  return NextResponse.json({ ok: true })
}
