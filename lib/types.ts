// lib/types.ts — Entités métier du portfolio Tanuki v2
// Source de vérité pour Project, Widget, Comment, Suggestion, Skill

export type ProjectStatus = 'live' | 'soon' | 'wip'

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  tags: string[]
  year: number
  status: ProjectStatus
  featured: boolean
  externalUrl: string | null
  coverImage: string | null
  badge: string | null
}

// ─────────────────────────────────────────────────────────────────────────────

export type WidgetType = 'widget' | 'article' | 'fondations'
export type WidgetDifficulty = 'Débutant' | 'Intermédiaire' | 'Avancé'
export type WidgetStatus = 'published' | 'draft'

export interface Widget {
  id: string
  title: string
  slug: string
  type: WidgetType
  languages: string[]
  difficulty: WidgetDifficulty
  description: string
  longDescription: string
  code: string | null
  demoComponent: string | null
  upgrade?: string | null
  status: WidgetStatus
  votes: number
  views: number
  publishedAt: string | null
}

// ─────────────────────────────────────────────────────────────────────────────

export type CommentStatus = 'pending' | 'approved' | 'spam'

export interface Comment {
  id: string
  widgetSlug: string
  prenom: string
  message: string
  ipHash: string
  status: CommentStatus
  createdAt: string
}

export interface CommentInput {
  widgetSlug: string
  prenom: string
  message: string
  honeypot?: string
}

// ─────────────────────────────────────────────────────────────────────────────

export type SuggestionStatus = 'pending' | 'planned' | 'done'

export interface Suggestion {
  id: string
  title: string
  description: string
  votes: number
  status: SuggestionStatus
  suggestedBy: string
  voters: string[]
}

// ─────────────────────────────────────────────────────────────────────────────

export type SkillCategory = 'Frontend' | 'Backend' | 'Marketing' | 'Outils'

export interface Skill {
  id: string
  skill: string
  category: SkillCategory
  level: number
  sublabel: string | null
  color: string | null
}

// ─────────────────────────────────────────────────────────────────────────────

export type Locale = 'fr' | 'en'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
