import type { Metadata } from 'next'
import { getWidgets } from '@/lib/notion'
import type { Widget } from '@/lib/types'
import WidgetsContent from './WidgetsContent'

export const metadata: Metadata = {
  title: '1001 Widgets — Apprends en construisant — Tanuki',
  description:
    'Des composants à reproduire, comprendre et personnaliser. Annuaire de widgets, articles et fondations pour les devs juniors qui veulent progresser vraiment.',
}

/**
 * WidgetsPage — Server Component.
 * Récupère les widgets depuis Notion (getWidgets) et délègue le rendu interactif
 * (filtres, compteur, reveals) au composant client WidgetsContent.
 * En cas d'indisponibilité Notion, on passe une liste vide : le fallback
 * statique est appliqué côté client.
 */
export default async function WidgetsPage() {
  let widgets: Widget[] = []
  try {
    widgets = await getWidgets()
  } catch {
    widgets = []
  }

  return <WidgetsContent widgets={widgets} />
}
