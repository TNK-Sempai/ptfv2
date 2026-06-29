// lib/studio/studio-auth.ts — Auth /studio (indépendante de lib/admin.ts)
// Pattern inspiré de lib/admin.ts : cookie signé HMAC-SHA256 + timingSafeEqual.
//
// Différences avec l'auth admin (PROJECT LOG V3 — règle 2) :
//   - secret de signature dédié : SESSION_SECRET (pas ADMIN_PASSWORD)
//   - facteur d'accès : PIN 8 chiffres (STUDIO_PIN) + slug caché (STUDIO_SLUG)
//   - session horodatée → expiration STUDIO_SESSION_MAX_AGE_S
//
// ⚠️ Module serveur uniquement (lit des secrets non NEXT_PUBLIC_*).

import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import {
  STUDIO_COOKIE_NAME,
  STUDIO_PIN_LENGTH,
  STUDIO_ROUTES,
  STUDIO_SESSION_MAX_AGE_S,
} from './constants'

// ─── Comparaison à temps constant ────────────────────────────────────────────

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// ─── Vérification des facteurs d'accès ───────────────────────────────────────

/** PIN attendu : exactement STUDIO_PIN_LENGTH chiffres, comparé en temps constant. */
export function verifyPin(pin: string): boolean {
  const expected = process.env.STUDIO_PIN
  if (!expected) return false
  const cleaned = pin.trim()
  if (!new RegExp(`^\\d{${STUDIO_PIN_LENGTH}}$`).test(cleaned)) return false
  return safeEqual(cleaned, expected)
}

/** Slug caché dans l'URL — comparé en temps constant. */
export function verifySlug(slug: string): boolean {
  const expected = process.env.STUDIO_SLUG
  if (!expected) return false
  return safeEqual(slug.trim(), expected)
}

// ─── Session signée (stateless, horodatée) ───────────────────────────────────

function getSecret(): string | null {
  return process.env.SESSION_SECRET ?? null
}

/** Signe une valeur (`<value>.<hmac>`) avec SESSION_SECRET. */
export function signSession(value: string): string {
  const secret = getSecret()
  if (!secret) throw new Error('SESSION_SECRET manquant.')
  const sig = createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${sig}`
}

/**
 * Crée le token de session à poser dans le cookie.
 * La valeur encode l'instant d'émission → permet l'expiration côté vérification.
 */
export function createSessionToken(): string {
  return signSession(`studio.${Date.now()}`)
}

export interface SessionVerdict {
  valid: boolean
  expired: boolean
}

/** Vérifie la signature puis l'âge de la session. */
export function verifySession(signed: string): SessionVerdict {
  const secret = getSecret()
  if (!secret) return { valid: false, expired: false }

  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return { valid: false, expired: false }

  const value = signed.slice(0, lastDot)
  const sig = signed.slice(lastDot + 1)
  const expected = createHmac('sha256', secret).update(value).digest('hex')

  let signatureOk = false
  try {
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    signatureOk =
      sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)
  } catch {
    signatureOk = false
  }
  if (!signatureOk) return { valid: false, expired: false }

  // value = `studio.<issuedAtMs>`
  const issuedAt = Number(value.split('.')[1])
  if (!Number.isFinite(issuedAt)) return { valid: false, expired: false }

  const ageS = (Date.now() - issuedAt) / 1000
  if (ageS > STUDIO_SESSION_MAX_AGE_S) return { valid: false, expired: true }

  return { valid: true, expired: false }
}

// ─── Cookie ──────────────────────────────────────────────────────────────────

/** Options du cookie de session studio (à passer à cookies().set côté API route). */
export const studioCookieOptions = {
  name: STUDIO_COOKIE_NAME,
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: STUDIO_ROUTES.COOKIE_PATH, // '/' → couvre /studio ET /api/studio/* (sinon 401 sur le chat)
  maxAge: STUDIO_SESSION_MAX_AGE_S,
} as const

/**
 * Lit et vérifie le cookie de session côté serveur (RSC / route handler / layout).
 * Next.js 16 : cookies() est asynchrone → await obligatoire.
 */
export async function verifyStudioCookie(): Promise<SessionVerdict> {
  const store = await cookies()
  const token = store.get(STUDIO_COOKIE_NAME)?.value
  if (!token) return { valid: false, expired: false }
  return verifySession(token)
}
