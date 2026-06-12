// lib/notion-types.ts — Types Notion pour les 5 databases du projet
// Usage interne lib/ uniquement — types exposés au reste de l'app via lib/types.ts

// ─── Primitives Notion ────────────────────────────────────────────────────────
// Définitions autonomes — pas de dépendance sur les chemins internes du SDK

export interface NotionRichTextItem {
  plain_text: string
  href: string | null
}

export interface NotionSelectOption {
  id: string
  name: string
  color: string
}

// ─── Union des valeurs de propriétés Notion ───────────────────────────────────
// Discriminated union sur le champ `type` — utilisée dans les parsers de notion.ts

export type NotionPropValue =
  | { type: 'title';        id: string; title:        NotionRichTextItem[] }
  | { type: 'rich_text';    id: string; rich_text:    NotionRichTextItem[] }
  | { type: 'number';       id: string; number:       number | null }
  | { type: 'select';       id: string; select:       NotionSelectOption | null }
  | { type: 'multi_select'; id: string; multi_select: NotionSelectOption[] }
  | { type: 'checkbox';     id: string; checkbox:     boolean }
  | { type: 'url';          id: string; url:          string | null }
  | { type: 'date';         id: string; date:         { start: string; end: string | null; time_zone: string | null } | null }
  | { type: 'status';      id: string; status:       { name: string } | null }

// Page Notion avec propriétés typées
export interface NotionPage {
  id: string
  properties: Record<string, NotionPropValue>
}

// ─── Schémas des databases — documentation du contrat Notion ─────────────────
// Ces interfaces documentent les propriétés attendues dans chaque database.
// Elles ne sont pas enforced à runtime — c'est lib/notion.ts qui les garantit.

export interface NotionProjectProperties {
  title:           Extract<NotionPropValue, { type: 'title' }>
  slug:            Extract<NotionPropValue, { type: 'rich_text' }>
  description:     Extract<NotionPropValue, { type: 'rich_text' }>
  longDescription: Extract<NotionPropValue, { type: 'rich_text' }>
  tags:            Extract<NotionPropValue, { type: 'multi_select' }>
  year:            Extract<NotionPropValue, { type: 'number' }>
  status:          Extract<NotionPropValue, { type: 'select' }>
  featured:        Extract<NotionPropValue, { type: 'checkbox' }>
  externalUrl:     Extract<NotionPropValue, { type: 'url' }>
  coverImage:      Extract<NotionPropValue, { type: 'url' }>
  badge:           Extract<NotionPropValue, { type: 'rich_text' }>
}

export interface NotionWidgetProperties {
  title:         Extract<NotionPropValue, { type: 'title' }>
  slug:          Extract<NotionPropValue, { type: 'rich_text' }>
  type:          Extract<NotionPropValue, { type: 'select' }>
  languages:     Extract<NotionPropValue, { type: 'multi_select' }>
  difficulty:    Extract<NotionPropValue, { type: 'select' }>
  description:   Extract<NotionPropValue, { type: 'rich_text' }>
  demoComponent: Extract<NotionPropValue, { type: 'rich_text' }>
  status:        Extract<NotionPropValue, { type: 'select' }>
  votes:         Extract<NotionPropValue, { type: 'number' }>
  views:         Extract<NotionPropValue, { type: 'number' }>
  publishedAt:   Extract<NotionPropValue, { type: 'date' }>
}

export interface NotionCommentProperties {
  widgetSlug: Extract<NotionPropValue, { type: 'rich_text' }>
  prenom:     Extract<NotionPropValue, { type: 'rich_text' }>
  message:    Extract<NotionPropValue, { type: 'rich_text' }>
  ipHash:     Extract<NotionPropValue, { type: 'rich_text' }>
  status:     Extract<NotionPropValue, { type: 'select' }>
  createdAt:  Extract<NotionPropValue, { type: 'date' }>
}

export interface NotionSuggestionProperties {
  title:       Extract<NotionPropValue, { type: 'title' }>
  description: Extract<NotionPropValue, { type: 'rich_text' }>
  votes:       Extract<NotionPropValue, { type: 'number' }>
  status:      Extract<NotionPropValue, { type: 'select' }>
  suggestedBy: Extract<NotionPropValue, { type: 'rich_text' }>
  voters:      Extract<NotionPropValue, { type: 'rich_text' }>
}

export interface NotionSkillProperties {
  skill:    Extract<NotionPropValue, { type: 'title' }>
  category: Extract<NotionPropValue, { type: 'select' }>
  level:    Extract<NotionPropValue, { type: 'number' }>
  sublabel: Extract<NotionPropValue, { type: 'rich_text' }>
  color:    Extract<NotionPropValue, { type: 'rich_text' }>
}

// ─── Inputs d'écriture ────────────────────────────────────────────────────────

export interface NotionCommentInput {
  widgetSlug: string
  prenom:     string
  message:    string
  ipHash:     string
}

export interface NotionSuggestionInput {
  title:       string
  description: string
  suggestedBy: string
}
