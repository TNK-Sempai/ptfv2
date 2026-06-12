'use client'
import { motion } from 'framer-motion'
import { pageTransition } from '@/components/motion/variants'
import type { ReactNode } from 'react'

/**
 * Next.js App Router — template.tsx re-monte à chaque navigation
 * (contrairement à layout.tsx qui persiste).
 * Applique la transition de page depuis variants.ts.
 *
 * Pour les animations exit : KAEL doit entourer {children} dans layout.tsx
 * avec <AnimatePresence mode="wait"> pour que exit: {} se déclenche.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
