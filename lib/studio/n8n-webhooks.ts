// lib/studio/n8n-webhooks.ts — Catalogue des webhooks n8n (local)
//
// ⚠️ Serveur uniquement. URLs construites depuis N8N_BASE_URL + path catalogué
//    (anti-pattern interdit : URL hardcodée).
//
// Catalogue volontairement minimal en Phase 1 — entrées dérivées du PROJECT LOG V3
// (pipeline Tanuki Merch, brief matinal Jarvis, relance auto Jaay). À compléter
// au fil des workflows n8n réellement déployés.

const N8N_BASE_URL = process.env.N8N_BASE_URL ?? 'http://localhost:5678'

// ─── Catalogue ───────────────────────────────────────────────────────────────

/** Clé logique → chemin du webhook n8n (sans le préfixe /webhook/). */
export const N8N_WEBHOOKS = {
  /** Pipeline print-on-demand : n8n → ComfyUI → Gelato (projet tanuki-merch). */
  MERCH_PIPELINE: 'tanuki-merch/pipeline',
  /** Chaîne d'appels atomiques du brief matinal Jarvis (cron 06:30) → Telegram. */
  MORNING_BRIEF: 'jarvis/morning-brief',
  /** Relance automatique d'une mission client bloquée (projet jaay). */
  JAAY_RELANCE: 'jaay/relance',
} as const

export type N8nWebhookKey = keyof typeof N8N_WEBHOOKS

// ─── Construction d'URL ──────────────────────────────────────────────────────

export function webhookUrl(key: N8nWebhookKey): string {
  return `${N8N_BASE_URL}/webhook/${N8N_WEBHOOKS[key]}`
}

// ─── Déclenchement ───────────────────────────────────────────────────────────

export interface TriggerResult {
  ok: boolean
  status: number
  body: string
}

/**
 * Déclenche un webhook n8n par sa clé de catalogue.
 * Payload sérialisé en JSON ; jamais d'URL passée par l'appelant.
 */
export async function triggerWebhook(
  key: N8nWebhookKey,
  payload: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<TriggerResult> {
  const res = await fetch(webhookUrl(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  return {
    ok: res.ok,
    status: res.status,
    body: await res.text(),
  }
}
