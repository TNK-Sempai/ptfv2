import type { Metadata } from 'next'
import SkillsContent from './SkillsContent'

export const metadata: Metadata = {
  title: 'Compétences — Tanuki',
  description: 'Stack technique et niveaux de maîtrise — Frontend, Backend, Marketing.',
}

/**
 * SkillsPage — Server Component.
 * Délègue le rendu et les animations au composant client SkillsContent,
 * ce qui préserve l'export statique `metadata` (incompatible avec 'use client').
 */
export default function SkillsPage() {
  return <SkillsContent />
}
