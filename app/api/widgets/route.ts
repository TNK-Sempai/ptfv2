// app/api/widgets/route.ts — Widgets 1001 Widgets (lecture seule)
// GET            → tous les widgets publiés (cache ISR)
// GET ?slug=xxx  → widget unique par slug
//
// Lecture pure — getWidgets() est mémoïsé via unstable_cache (revalidate 3600).

import { NextResponse } from 'next/server'

import { getWidgets, getWidgetBySlug } from '@/lib/notion'
import type { Widget, ApiResponse } from '@/lib/types'

function json<T>(payload: ApiResponse<T>, status: number): NextResponse {
  return NextResponse.json(payload, { status })
}

// ─── GET — liste complète, ou widget unique si ?slug ───────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const slug = new URL(request.url).searchParams.get('slug')?.trim() ?? ''

  try {
    if (slug) {
      const widget = await getWidgetBySlug(slug)
      if (!widget) {
        return json<Widget>({ data: null, error: 'not_found' }, 404)
      }
      return json<Widget>({ data: widget, error: null }, 200)
    }

    const widgets = await getWidgets()
    return json<Widget[]>({ data: widgets, error: null }, 200)
  } catch {
    return json<Widget[]>({ data: null, error: 'Erreur de récupération des widgets.' }, 502)
  }
}
