import type { ReactNode } from 'react'

/**
 * Next.js App Router — template.tsx re-monte à chaque navigation
 * (contrairement à layout.tsx qui persiste).
 *
 * La transition de page (initial/animate/exit) est portée par
 * components/motion/PageTransitions.tsx, où le motion.div est l'enfant direct
 * keyé de <AnimatePresence>. La porter ici aussi créait un double motion.div
 * imbriqué et empêchait AnimatePresence de recevoir le `safeToRemove` du
 * sortant (page bloquée à opacity 0). Ce template reste donc un passthrough.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>
}
