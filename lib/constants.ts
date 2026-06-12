// lib/constants.ts — Configuration globale et tokens DA
// Jamais de magic strings ailleurs dans le projet

// ─── Locales ─────────────────────────────────────────────────────────────────

export const LOCALES = ['fr', 'en'] as const
export const DEFAULT_LOCALE = 'fr'

// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME:             '/',
  ABOUT:            '/about',
  SKILLS:           '/skills',
  CONTACT:          '/contact',
  PROJECTS:         '/projects',
  WIDGETS:          '/widgets',
  WIDGETS_SUGGEST:  '/widgets/suggest',
  ADMIN:            '/admin',
  ADMIN_COMMENTS:   '/admin/comments',
  ADMIN_WIDGETS:    '/admin/widgets',
  ADMIN_ARTICLES:   '/admin/articles',
} as const

export const PROJECT_SLUGS = [
  'tanukichessbot',
  'opti-troc',
  'yummr',
  'big-factory',
  'time-event',
] as const

export type ProjectSlug = (typeof PROJECT_SLUGS)[number]

// ─── ISR ─────────────────────────────────────────────────────────────────────

export const ISR_REVALIDATE = 3600

// ─── Sécurité ────────────────────────────────────────────────────────────────

export const COMMENT_PRENOM_MAX       = 50
export const COMMENT_MESSAGE_MAX      = 1000
export const RATE_LIMIT_MAX           = 3
export const RATE_LIMIT_WINDOW_MS     = 60 * 60 * 1000
export const SUGGESTION_VOTE_THRESHOLD = 10

// ─── Design System — DA_TOKENS (référence CSS variables) ─────────────────────
// Source de vérité : globals.css — ces valeurs sont la référence JS/TS uniquement

export const DA_TOKENS = {
  '--bg':           '#09090e',
  '--surface':      '#0e0e15',
  '--surface2':     '#13131c',
  '--border':       'rgba(255,255,255,0.06)',
  '--text':         '#ede8df',
  '--muted':        '#6b665f',
  '--muted2':       '#9c9590',
  '--accent':       '#c8f060',
  '--font-display': "'Bebas Neue', sans-serif",
  '--font-serif':   "'DM Serif Display', serif",
  '--font-mono':    "'DM Mono', monospace",
  '--font-body':    "'Instrument Sans', sans-serif",
} as const

// Aliases rapides pour usages inline (ex: inline style exceptionnels)
export const DA_COLORS = {
  bg:       '#09090e',
  surface:  '#0e0e15',
  surface2: '#13131c',
  border:   'rgba(255,255,255,0.06)',
  text:     '#ede8df',
  muted:    '#6b665f',
  muted2:   '#9c9590',
  accent:   '#c8f060',
} as const

export const DA_FONTS = {
  display: 'Bebas Neue',
  serif:   'DM Serif Display',
  mono:    'DM Mono',
  body:    'Instrument Sans',
} as const

// ─── Chemins images ───────────────────────────────────────────────────────────

export const IMG = {
  PROJECTS: {
    tanukichessbot: '/img/tanuki-chessbot-cover.webp',
    'opti-troc':    '/img/opti-troc-cover.webp',
    yummr:          '/img/yummr-cover.webp',
    'big-factory':  '/img/big-factory-cover.webp',
    'time-event':   '/img/time-event-cover.webp',
  },
  PORTRAIT:   '/img/portrait.webp',
  OG_DEFAULT: '/img/og-default.webp',
  LOGO:       '/img/tanuki-logo.svg',
} as const

// ─── PROJECTS — données statiques des 5 projets ───────────────────────────────
// Fallback + source de vérité pour generateStaticParams et SEO
// Les données enrichies (longDescription, featured…) viennent de Notion

export const PROJECTS = [
  {
    slug:        'tanukichessbot',
    title:       'TanukiChessBot',
    description: 'Bot Twitch interactif jouant aux échecs 24/7 sur Lichess. Les viewers votent les coups en temps réel via le chat.',
    tags:        ['Python', 'IA', 'Twitch', 'Lichess', 'Chess'],
    year:        2023,
    status:      'live' as const,
    coverImage:  IMG.PROJECTS['tanukichessbot'],
    badge:       'Live 24/7',
    externalUrl: null,
  },
  {
    slug:        'opti-troc',
    title:       'Opti-Troc',
    description: 'Marketplace B2B de troc de services entre TPE/PME. Matching intelligent par secteur, contrats dématérialisés et suivi en temps réel.',
    tags:        ['Next.js', 'TypeScript', 'B2B', 'Marketplace', 'SaaS'],
    year:        2024,
    status:      'live' as const,
    coverImage:  IMG.PROJECTS['opti-troc'],
    badge:       'Live',
    externalUrl: null,
  },
  {
    slug:        'yummr',
    title:       'Yummr',
    description: 'App mobile de découverte culinaire. Swipe de plats, recommandations IA selon tes goûts, géolocalisation des restaurants.',
    tags:        ['React Native', 'TypeScript', 'App Mobile', 'IA', 'Expo'],
    year:        2024,
    status:      'wip' as const,
    coverImage:  IMG.PROJECTS['yummr'],
    badge:       'En dev',
    externalUrl: null,
  },
  {
    slug:        'big-factory',
    title:       'Big Factory',
    description: 'Plateforme SaaS de gestion de production industrielle. Dashboard temps réel, alertes automatiques et reporting PDF avancé.',
    tags:        ['Next.js', 'TypeScript', 'shadcn/ui', 'SaaS', 'Dashboard'],
    year:        2024,
    status:      'live' as const,
    coverImage:  IMG.PROJECTS['big-factory'],
    badge:       'Live',
    externalUrl: null,
  },
  {
    slug:        'time-event',
    title:       'Time-Event.ch',
    description: 'Solution billetterie complète pour événements en Suisse. Google Ads intégré, paiement sécurisé et QR codes de contrôle d\'accès.',
    tags:        ['Web', 'Billetterie', 'Google Ads', 'Suisse', 'E-commerce'],
    year:        2023,
    status:      'live' as const,
    coverImage:  IMG.PROJECTS['time-event'],
    badge:       'Live',
    externalUrl: 'https://time-event.ch',
  },
] as const

// Gardé pour rétrocompatibilité — préférer PROJECTS pour les nouvelles pages
export const PROJECTS_CONFIG = PROJECTS

// ─── Navigation ──────────────────────────────────────────────────────────────

// NAV_LINKS — labels FR directs (pour composants sans i18n ou SSG)
export const NAV_LINKS = [
  { label: 'À propos',     href: ROUTES.ABOUT },
  {
    label:    'Projets',
    href:     ROUTES.PROJECTS,
    dropdown: PROJECT_SLUGS.map((slug) => ({
      slug,
      label: PROJECTS.find((p) => p.slug === slug)?.title ?? slug,
      href:  `${ROUTES.PROJECTS}/${slug}`,
    })),
  },
  { label: 'Skills',       href: ROUTES.SKILLS },
  { label: '1001 Widgets', href: ROUTES.WIDGETS },
  { label: 'Contact',      href: ROUTES.CONTACT },
] as const

// NAV_ITEMS — clés i18n (pour composants next-intl)
export const NAV_ITEMS = [
  { labelKey: 'nav.about',   href: ROUTES.ABOUT },
  {
    labelKey: 'nav.projects',
    href:     ROUTES.PROJECTS,
    dropdown: PROJECT_SLUGS.map((slug) => ({ slug, href: `${ROUTES.PROJECTS}/${slug}` })),
  },
  { labelKey: 'nav.skills',   href: ROUTES.SKILLS },
  { labelKey: 'nav.widgets',  href: ROUTES.WIDGETS },
  { labelKey: 'nav.contact',  href: ROUTES.CONTACT },
] as const

// ─── Animations ──────────────────────────────────────────────────────────────

export const ANIMATION = {
  DURATION_FAST:  0.2,
  DURATION_BASE:  0.4,
  DURATION_SLOW:  0.8,
  EASE_OUT:       [0.0, 0.0, 0.2, 1.0],
  EASE_IN_OUT:    [0.4, 0.0, 0.2, 1.0],
  STAGGER_DELAY:  0.08,
  MAGNETIC_RADIUS: 80,
} as const
