// lib/studio/constants.ts — Tanuki Control Center (/studio)
// Source de vérité des données statiques du studio.
// Jamais de magic strings ailleurs dans le périmètre /studio.
//
// ⚠️ /studio est HORS i18n (pas de [locale]) et indépendant de /admin.

// ─── Routes studio ───────────────────────────────────────────────────────────

export const STUDIO_ROUTES = {
  ROOT:     '/studio',
  LOGIN:    '/studio/login',
  API_AUTH: '/api/studio/auth',
} as const

/** Clé de query du slug caché : /studio/login?key=<STUDIO_SLUG>. */
export const STUDIO_SLUG_PARAM = 'key'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const STUDIO_COOKIE_NAME = 'studio-session'
/** PIN à 8 chiffres exactement (cf. PROJECT LOG V3 — règle 2). */
export const STUDIO_PIN_LENGTH = 8
/** Durée de vie de la session signée — 12 h. */
export const STUDIO_SESSION_MAX_AGE_S = 60 * 60 * 12

// ─── Jarvis (Ollama local, model-agnostic) ───────────────────────────────────

/** Variable centrale model-agnostic — surchargée par l'env JARVIS_MODEL. */
export const JARVIS_MODEL = process.env.JARVIS_MODEL ?? 'qwen2.5:7b'
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

/**
 * Règle de décomposition atomique 7B (RTX 3050 8GB) — PROJECT LOG V3.
 * Une tâche = un appel = ≤ 2000 tokens input + ≤ 500 tokens output.
 */
export const JARVIS_LIMITS = {
  MAX_INPUT_TOKENS:   2000,
  MAX_OUTPUT_TOKENS:  500,
  MAX_CONTEXT_TOKENS: 800,
  MAX_HISTORY:        5, // 5 derniers échanges max
} as const

// ─── Couleurs de statut ──────────────────────────────────────────────────────
// Référence JS/TS uniquement (comme DA_COLORS dans lib/constants.ts).
// Alignées DA quand possible : accent / muted / muted2, bleu & rouge du PROJECT LOG.

export const STATUS_COLORS = {
  healthy:  '#c8f060', // --accent
  warning:  '#ffb84d',
  critical: '#ff6060',
  paused:   '#6b665f', // --muted
  building: '#64b4ff',
  unknown:  '#9c9590', // --muted2
} as const

// ─── Les 11 projets monitorés ────────────────────────────────────────────────

export const STUDIO_PROJECTS = [
  {
    id: 'tnk-adaptive',
    name: 'TNK Adaptive',
    icon: '📈',
    category: 'trading',
    description: 'Bot trading Python/SQLite — métriques via Flask localhost:5000',
    data_source: 'flask-local',
    color: '#c8f060',
  },
  {
    id: 'unfiltered',
    name: 'UNFILTERED',
    icon: '📸',
    category: 'content',
    description: 'Magazine Instagram automatisé — posts via Supabase + ComfyUI',
    data_source: 'supabase',
    color: '#64b4ff',
  },
  {
    id: 'tanuki-merch',
    name: 'Tanuki Merch',
    icon: '🛍️',
    category: 'ecom',
    description: 'Print-on-demand Gelato — pipeline n8n → ComfyUI → Gelato',
    data_source: 'n8n',
    color: '#b464ff',
  },
  {
    id: 'chess-bot',
    name: 'TanukiChessBot',
    icon: '♟️',
    category: 'stream',
    description: 'Bot Twitch chess 24/7 — Stockfish + Ollama + avatar 3D',
    data_source: 'lichess',
    color: '#ffd700',
  },
  {
    id: 'opti-troc',
    name: 'Opti-Troc',
    icon: '🔭',
    category: 'marketplace',
    description: 'Marketplace B2B équipement optique professionnel',
    data_source: 'supabase',
    color: '#60d8f0',
  },
  {
    id: 'goriki',
    name: 'Goriki',
    icon: '🎴',
    category: 'ecom',
    description: `Shop TCG fermé (Lass + associé) + dépôt-vente.
      3 rôles : admin / déposant / client.
      Features : scan IA cartes, pricing Cardmarket,
      listing automation (style TCG Automate),
      sync eBay/Cardmarket, espace déposant.
      Stack : Next.js + Supabase (goriki_*) + GPT-4o Vision + Mollie.`,
    data_source: 'supabase',
    color: '#ff6060',
    status_default: 'building',
  },
  {
    id: 'pele-mele',
    name: 'Pêle-Mêle',
    icon: '🛒',
    category: 'ecom',
    description: 'E-commerce client Laravel',
    data_source: 'manual',
    color: '#a0a0a0',
  },
  {
    id: 'jaay',
    name: 'Jaay.ca',
    icon: '🍁',
    category: 'client',
    description: 'Mission client bloquée — relance auto Jarvis après X jours',
    data_source: 'manual',
    color: '#ff6060',
    status_default: 'warning',
  },
  {
    id: 'time-event',
    name: 'Time-Event.ch',
    icon: '🎭',
    category: 'client',
    description: 'Plateforme billetterie théâtre — campagnes Google Ads',
    data_source: 'manual',
    color: '#a0a0a0',
  },
  {
    id: 'big-factory',
    name: 'Big Factory',
    icon: '🎵',
    category: 'client',
    description: 'Structure culturelle — gère DJ Idem et autres artistes. Suivi watch hours YouTube YPP.',
    data_source: 'youtube',
    color: '#ff3030',
  },
  {
    id: 'yummr',
    name: 'Yummr',
    icon: '🍽️',
    category: 'saas',
    description: 'App mobile recettes (React Native) — en pause',
    data_source: 'manual',
    color: '#a0a0a0',
    status_default: 'paused',
  },
] as const

export type ProjectId = (typeof STUDIO_PROJECTS)[number]['id']
export type ProjectStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'paused'
  | 'building'
  | 'unknown'
export type ProjectDataSource = (typeof STUDIO_PROJECTS)[number]['data_source']
export type ProjectCategory = (typeof STUDIO_PROJECTS)[number]['category']
