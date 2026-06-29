// lib/studio/supabase-studio.ts — Client Supabase admin (service-role) pour les tables studio_*
//
// ⚠️⚠️ BLOQUANT (signalé à RYUU) :
//   1. `@supabase/supabase-js` N'EST PAS installé (absent de package.json ET node_modules).
//      Ce fichier ne compilera pas tant que `npm i @supabase/supabase-js` n'aura pas
//      été lancé. Installation = décision infra hors périmètre KAEL → à valider par RYUU.
//   2. Les variables d'env Supabase ne figurent PAS dans la liste .env du PROJECT LOG V3.
//      Requises ici : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
// ⚠️ Serveur uniquement : utilise la clé service-role (bypass RLS). Ne JAMAIS importer
//    ce module dans un composant client.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ProjectId, ProjectStatus } from './constants'

// ─── Noms de tables (anti magic-string) ──────────────────────────────────────

export const STUDIO_TABLES = {
  PROJECTS:         'studio_projects',
  ALERTS:           'studio_alerts',
  TASKS:            'studio_tasks',
  ORDERS:           'studio_orders',
  JARVIS_LOG:       'studio_jarvis_log',
  DECISIONS:        'studio_decisions',
  FINANCES:         'studio_finances',
  PRODUCTION_QUEUE: 'studio_production_queue',
  OPPORTUNITIES:    'studio_opportunities',
} as const

// ─── Types de lignes (miroir du schéma SQL — PROJECT LOG V3) ──────────────────

export interface StudioProjectRow {
  id: ProjectId | string
  name: string
  status: ProjectStatus
  revenue_mtd: number
  last_event: string | null
  metadata: Record<string, unknown>
  updated_at: string
}

export interface StudioAlertRow {
  id: string
  project_id: string | null
  level: 'info' | 'warning' | 'critical'
  title: string
  body: string | null
  resolved: boolean
  created_at: string
}

export interface StudioTaskRow {
  id: string
  project_id: string | null
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  created_at: string
}

export interface StudioOrderRow {
  id: string
  project_id: string | null
  label: string
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled'
  amount: number | null
  currency: string
  client: string | null
  due_date: string | null
  notes: string | null
  created_at: string
}

export interface StudioJarvisLogRow {
  id: string
  action: string
  project_id: string | null
  result: string | null
  tokens_used: number | null
  created_at: string
}

export interface StudioDecisionRow {
  id: string
  project_id: string | null
  title: string
  context: string | null
  recommendation: string | null
  impact: string | null
  payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  decided_at: string | null
  created_at: string
}

export interface StudioFinanceRow {
  id: string
  project_id: string | null
  type: 'income' | 'expense' | 'invoice_pending'
  amount: number
  currency: string
  label: string | null
  date: string
  status: 'confirmed' | 'projected' | 'pending'
  created_at: string
}

export interface StudioProductionQueueRow {
  id: string
  project_id: string
  type: 'comfyui' | 'n8n' | 'buffer' | 'manual'
  title: string
  status: 'queued' | 'running' | 'done' | 'failed'
  progress: number
  scheduled: string | null
  started_at: string | null
  completed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface StudioOpportunityRow {
  id: string
  title: string
  project_id: string | null
  category: 'subvention' | 'freelance' | 'trend' | 'model' | 'other' | null
  estimated_value: number
  effort: 'low' | 'medium' | 'high' | null
  context: string | null
  action: string | null
  expires_at: string | null
  archived: boolean
  created_at: string
}

// ─── Client admin (singleton serveur) ────────────────────────────────────────

let client: SupabaseClient | null = null

/**
 * Client Supabase service-role, instancié paresseusement une seule fois.
 * Lève si les variables d'env sont absentes.
 */
export function getStudioAdminClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase studio non configuré : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY manquants.',
    )
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
