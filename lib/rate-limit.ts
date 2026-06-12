// lib/rate-limit.ts — 3 commentaires / IP hashée / heure
// Store en mémoire (edge-compatible) — reset au redémarrage serveur

import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './constants'

interface RateLimitEntry {
  count: number
  windowStart: number
}

// Map globale — survit entre les requêtes dans un même worker
const store = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(ipHash: string): RateLimitResult {
  const now = Date.now()
  const entry = store.get(ipHash)

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    store.set(ipHash, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS,
    }
  }

  entry.count += 1
  store.set(ipHash, entry)

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetAt: entry.windowStart + RATE_LIMIT_WINDOW_MS,
  }
}

// ─── Nettoyage des entrées expirées ──────────────────────────────────────────
// À appeler périodiquement si nécessaire (ex: route cron ou dans le handler)

export function purgeExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
      store.delete(key)
    }
  }
}
