'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// Mapping clé Notion → composant client réel.
// { ssr: false } autorisé ici car DemoSlot est un Client Component.
const WIDGET_MAP: Record<string, ComponentType> = {
  CounterWidget: dynamic(() => import('./CounterWidget'), { ssr: false }),
  CalculatorWidget: dynamic(() => import('./CalculatorWidget'), { ssr: false }),
  PaletteWidget: dynamic(() => import('./PaletteWidget'), { ssr: false }),
}

export function DemoSlot({ name }: { name: string }) {
  const Demo = WIDGET_MAP[name]
  return Demo ? (
    <Demo />
  ) : (
    <span className="font-mono text-xs text-muted">Demo non disponible</span>
  )
}
