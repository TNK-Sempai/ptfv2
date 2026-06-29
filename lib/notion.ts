// lib/notion.ts — Client Notion v2.2.15 + fonctions de données
// ISR revalidate: 3600 via unstable_cache — zéro any

import { Client } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

import { ISR_REVALIDATE } from './constants'
import type {
  Project,
  Widget,
  Comment,
  Suggestion,
  Skill,
  ProjectStatus,
  WidgetType,
  WidgetDifficulty,
  WidgetStatus,
  CommentStatus,
  SuggestionStatus,
  SkillCategory,
} from './types'
import type {
  NotionPage,
  NotionPropValue,
  NotionCommentInput,
  NotionSuggestionInput,
} from './notion-types'

// ─── Client singleton ─────────────────────────────────────────────────────────

// En dev : revalidate false → pas de cache, changements Notion visibles immédiatement.
// En prod : revalidate ISR_REVALIDATE (3600) → cache 1h.
// unstable_cache n'accepte pas 0 → false pour désactiver le cache.
const isDev = process.env.NODE_ENV === 'development'
const REVALIDATE: number | false = isDev ? false : ISR_REVALIDATE

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DB = {
  PROJECTS:    process.env.NOTION_DATABASE_PROJECTS    ?? '',
  WIDGETS:     process.env.NOTION_DATABASE_WIDGETS     ?? '',
  COMMENTS:    process.env.NOTION_DATABASE_COMMENTS    ?? '',
  SUGGESTIONS: process.env.NOTION_DATABASE_SUGGESTIONS ?? '',
  SKILLS:      process.env.NOTION_DATABASE_SKILLS      ?? '',
} as const

// ─── Type guard ───────────────────────────────────────────────────────────────
// Filtre les PartialPageObjectResponse (sans `properties`) retournés par v2

function isNotionPage(r: unknown): r is NotionPage {
  return typeof r === 'object' && r !== null && 'id' in r && 'properties' in r
}

// Coupe la chaîne de typage SDK → NotionPage pour éviter l'incompatibilité
// entre les 20+ variants du SDK et notre union délibérément réduite.
// Prend unknown[] : TypeScript ne vérifie pas la compatibilité avec PageObjectResponse.
function toNotionPages(results: unknown[]): NotionPage[] {
  return results.filter(isNotionPage)
}

// ─── Parsers de propriétés ────────────────────────────────────────────────────
// Narrowing discriminant sur `prop.type` — aucun `any`

function parseTitle(prop: NotionPropValue | undefined): string {
  if (!prop || prop.type !== 'title') return ''
  return prop.title.map((t) => t.plain_text).join('')
}

function parseRichText(prop: NotionPropValue | undefined): string {
  if (!prop || prop.type !== 'rich_text') return ''
  return prop.rich_text.map((t) => t.plain_text).join('')
}

function parseNumber(prop: NotionPropValue | undefined): number {
  if (!prop || prop.type !== 'number') return 0
  return prop.number ?? 0
}

function parseSelect(prop: NotionPropValue | undefined): string | null {
  if (!prop || prop.type !== 'select') return null
  return prop.select?.name ?? null
}

function parseStatus(prop: NotionPropValue | undefined): string | null {
  if (!prop || prop.type !== 'status') return null
  return prop.status?.name ?? null
}

function parseMultiSelect(prop: NotionPropValue | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return []
  return prop.multi_select.map((o) => o.name)
}

function parseCheckbox(prop: NotionPropValue | undefined): boolean {
  if (!prop || prop.type !== 'checkbox') return false
  return prop.checkbox
}

function parseUrl(prop: NotionPropValue | undefined): string | null {
  if (!prop || prop.type !== 'url') return null
  return prop.url
}

function parseDate(prop: NotionPropValue | undefined): string | null {
  if (!prop || prop.type !== 'date') return null
  return prop.date?.start ?? null
}

function parseVoters(prop: NotionPropValue | undefined): string[] {
  const raw = parseRichText(prop)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

// ─── Parsers de pages ─────────────────────────────────────────────────────────

function parseProject(page: NotionPage): Project {
  const p = page.properties
  return {
    id:              page.id,
    title:           parseTitle(p['title']),
    slug:            parseRichText(p['slug']),
    description:     parseRichText(p['description']),
    longDescription: parseRichText(p['longDescription']),
    tags:            parseMultiSelect(p['tags']),
    year:            parseNumber(p['year']),
    status:          (parseSelect(p['status']) ?? 'wip') as ProjectStatus,
    featured:        parseCheckbox(p['featured']),
    externalUrl:     parseUrl(p['externalUrl']),
    coverImage:      parseUrl(p['coverImage']),
    badge:           parseRichText(p['badge']) || null,
  }
}

function parseWidget(page: NotionPage): Widget {
  const p = page.properties
  return {
    id:            page.id,
    title:         parseTitle(p['title']),
    slug:          parseRichText(p['slug']),
    type:          (parseSelect(p['type']) ?? 'widget') as WidgetType,
    languages:     parseMultiSelect(p['languages']),
    difficulty:    (parseSelect(p['difficulty']) ?? 'Débutant') as WidgetDifficulty,
    description:   parseRichText(p['description']),
    longDescription: parseRichText(p['longDescription']),
    code:          parseRichText(p['code']) || null,
    demoComponent: parseRichText(p['demoComponent']) || null,
    upgrade:       parseRichText(p['upgrade']) || null,
    status:        (parseSelect(p['status']) ?? 'draft') as WidgetStatus,
    votes:         parseNumber(p['votes']),
    views:         parseNumber(p['views']),
    publishedAt:   parseDate(p['publishedAt']),
  }
}

function parseComment(page: NotionPage): Comment {
  const p = page.properties
  return {
    id:         page.id,
    widgetSlug: parseRichText(p['widgetSlug']),
    prenom:     parseRichText(p['prenom']),
    message:    parseRichText(p['message']),
    ipHash:     parseRichText(p['ipHash']),
    status:     (parseSelect(p['status']) ?? 'pending') as CommentStatus,
    createdAt:  parseDate(p['createdAt']) ?? new Date().toISOString(),
  }
}

function parseSuggestion(page: NotionPage): Suggestion {
  const p = page.properties
  return {
    id:          page.id,
    title:       parseTitle(p['title']),
    description: parseRichText(p['description']),
    votes:       parseNumber(p['votes']),
    status:      (parseSelect(p['status']) ?? 'pending') as SuggestionStatus,
    suggestedBy: parseRichText(p['suggestedBy']),
    voters:      parseVoters(p['voters']),
  }
}

function parseSkill(page: NotionPage): Skill {
  const p = page.properties
  return {
    id:       page.id,
    skill:    parseTitle(p['skill']),
    category: (parseSelect(p['category']) ?? 'Outils') as SkillCategory,
    level:    parseNumber(p['level']),
    sublabel: parseRichText(p['sublabel']) || null,
    color:    parseRichText(p['color']) || null,
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const response = await notion.databases.query({
      database_id: DB.PROJECTS,
      sorts: [{ property: 'title', direction: 'ascending' }],
    })
    return toNotionPages(response.results).map(parseProject)
  },
  ['projects'],
  { revalidate: REVALIDATE, tags: ['projects'] }
)

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return projects.filter((p) => p.featured)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find((p) => p.slug === slug) ?? null
}

// ─── Widgets ──────────────────────────────────────────────────────────────────

export const getWidgets = unstable_cache(
  async (): Promise<Widget[]> => {
    const response = await notion.databases.query({
      database_id: DB.WIDGETS,
      filter: {
        property: 'status',
        select: { equals: 'published' },
      },
      sorts: [{ property: 'publishedAt', direction: 'descending' }],
    })
    return toNotionPages(response.results).map(parseWidget)
  },
  ['widgets'],
  { revalidate: REVALIDATE, tags: ['widgets'] }
)

export async function getWidgetBySlug(slug: string): Promise<Widget | null> {
  const widgets = await getWidgets()
  return widgets.find((w) => w.slug === slug) ?? null
}

export async function getWidgetsByType(type: WidgetType): Promise<Widget[]> {
  const widgets = await getWidgets()
  return widgets.filter((w) => w.type === type)
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export const getSkills = unstable_cache(
  async (): Promise<Skill[]> => {
    const response = await notion.databases.query({
      database_id: DB.SKILLS,
      sorts: [{ property: 'level', direction: 'descending' }],
    })
    return toNotionPages(response.results).map(parseSkill)
  },
  ['skills'],
  { revalidate: REVALIDATE, tags: ['skills'] }
)

export async function getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
  const skills = await getSkills()
  return skills.filter((s) => s.category === category)
}

// ─── Comments ─────────────────────────────────────────────────────────────────
// Retourne uniquement les commentaires approuvés — les pending/spam restent invisibles

const _getCommentsCached = unstable_cache(
  async (widgetSlug: string): Promise<Comment[]> => {
    const response = await notion.databases.query({
      database_id: DB.COMMENTS,
      filter: {
        and: [
          {
            property: 'widgetSlug',
            rich_text: { equals: widgetSlug },
          },
          {
            property: 'status',
            select: { equals: 'approved' },
          },
        ],
      },
      sorts: [{ property: 'createdAt', direction: 'ascending' }],
    })
    return toNotionPages(response.results).map(parseComment)
  },
  ['comments'],
  { revalidate: REVALIDATE, tags: ['comments'] }
)

export const getComments = _getCommentsCached

export async function createComment(data: NotionCommentInput): Promise<Comment> {
  const page = await notion.pages.create({
    parent: { database_id: DB.COMMENTS },
    properties: {
      widgetSlug: { rich_text: [{ text: { content: data.widgetSlug } }] },
      prenom:     { rich_text: [{ text: { content: data.prenom } }] },
      message:    { rich_text: [{ text: { content: data.message } }] },
      ipHash:     { rich_text: [{ text: { content: data.ipHash } }] },
      status:     { select: { name: 'pending' } },
      createdAt:  { date: { start: new Date().toISOString() } },
    },
  })
  if (!isNotionPage(page)) throw new Error('Notion createComment : réponse invalide')
  return parseComment(page)
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

export const getSuggestions = unstable_cache(
  async (): Promise<Suggestion[]> => {
    const response = await notion.databases.query({
      database_id: DB.SUGGESTIONS,
      sorts: [{ property: 'votes', direction: 'descending' }],
    })
    return toNotionPages(response.results).map(parseSuggestion)
  },
  ['suggestions'],
  { revalidate: REVALIDATE, tags: ['suggestions'] }
)

export async function createSuggestion(data: NotionSuggestionInput): Promise<Suggestion> {
  const page = await notion.pages.create({
    parent: { database_id: DB.SUGGESTIONS },
    properties: {
      title:       { title: [{ text: { content: data.title } }] },
      description: { rich_text: [{ text: { content: data.description } }] },
      votes:       { number: 0 },
      status:      { select: { name: 'pending' } },
      suggestedBy: { rich_text: [{ text: { content: data.suggestedBy } }] },
      voters:      { rich_text: [{ text: { content: '[]' } }] },
    },
  })
  if (!isNotionPage(page)) throw new Error('Notion createSuggestion : réponse invalide')
  return parseSuggestion(page)
}

export async function voteForSuggestion(
  id: string,
  ipHash: string
): Promise<{ success: boolean; alreadyVoted: boolean; newTotal: number }> {
  const raw = await notion.pages.retrieve({ page_id: id })
  if (!isNotionPage(raw)) return { success: false, alreadyVoted: false, newTotal: 0 }

  const suggestion = parseSuggestion(raw)

  if (suggestion.voters.includes(ipHash)) {
    return { success: false, alreadyVoted: true, newTotal: suggestion.votes }
  }

  const newTotal = suggestion.votes + 1
  const newVoters = [...suggestion.voters, ipHash]

  await notion.pages.update({
    page_id: id,
    properties: {
      votes:  { number: newTotal },
      voters: { rich_text: [{ text: { content: JSON.stringify(newVoters) } }] },
    },
  })

  return { success: true, alreadyVoted: false, newTotal }
}
