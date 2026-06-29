'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import { pageTransition } from '@/components/motion/variants'

/**
 * Enrobe les pages dans <AnimatePresence mode="wait"> et porte la transition
 * de page (variant `pageTransition`) sur un motion.div **enfant direct** keyé
 * par pathname.
 *
 * Pourquoi le motion.div vit ici et non dans template.tsx : AnimatePresence ne
 * détecte la sortie (et n'appelle `safeToRemove`) que sur ses enfants directs
 * qui sont des composants motion. Un <Fragment> intermédiaire ne reçoit pas ce
 * callback : avec `mode="wait"`, l'exit du sortant ne se terminait jamais, donc
 * l'entrant n'était jamais monté et la page pouvait rester bloquée à opacity 0.
 *
 * `initial={false}` évite l'animation d'entrée au tout premier render : le
 * contenu apparaît directement à l'état `animate` (jamais masqué à opacity 0).
 * template.tsx reste un simple passthrough — le re-mount par route est déjà
 * assuré par Next + la `key={pathname}` ci-dessous.
 */
export function PageTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
