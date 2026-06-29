'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Easing « porte » — cubic-bezier serré (in/out marqué).
const DOOR_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const STORAGE_KEY = 'door-shown'

// ─── Store global — état d'ouverture exposé via useDoorTransition() ────────────
// NB : <DoorTransition /> est monté en *sibling* de <Nav /> (pas en wrapper),
// un Context React ne pourrait donc pas fournir sa valeur à ses voisins.
// On utilise un store externe lu par useSyncExternalStore : même accès « global »
// (n'importe quel composant client peut lire `done`), sans Provider englobant.

let doorDone = false
const listeners = new Set<() => void>()

function setDoorDone(value: boolean) {
  if (doorDone === value) return
  doorDone = value
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Hook global : `{ done }` passe à true quand l'animation de porte est terminée. */
export function useDoorTransition() {
  const done = useSyncExternalStore(
    subscribe,
    () => doorDone,
    () => false,
  )
  return { done }
}

// ─── Texture grain des panneaux ────────────────────────────────────────────────
// Même feTurbulence que NoiseOverlay, id de filtre dédié pour ne pas écraser le
// `noise-filter` global. opacity 0.4 sur les panneaux.
function PanelNoise() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ opacity: 0.4 }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="door-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#door-noise-filter)" />
      </svg>
    </div>
  )
}

/**
 * DoorTransition — intro « porte qui s'ouvre », persistante dans le layout.
 *
 * Au premier montage de la session (clé `door-shown` absente de sessionStorage) :
 * deux panneaux couvrent le viewport (logo + barre de progression), la barre va
 * de 0 à 100 % en 1200 ms, puis (à 100 %, 400 ms de pause) les panneaux s'écartent
 * vers la gauche/droite en 900 ms. À la fin de l'animation, on persiste la clé
 * → l'intro ne se rejoue pas tant que l'onglet/session vit.
 *
 * Si la clé est déjà présente → rendu `null` (pas d'animation au retour).
 */
export function DoorTransition() {
  // false = portes affichées ; true = ouverture lancée (exit des panneaux).
  const [closed, setClosed] = useState(false)
  // true = déjà vu cette session → on ne monte rien (pas d'animation de sortie).
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    if (window.sessionStorage.getItem(STORAGE_KEY)) {
      setDoorDone(true)
      setSkip(true)
      return
    }
    // 1200 ms (barre) + 400 ms (pause à 100 %) → déclenche l'ouverture.
    const id = setTimeout(() => setClosed(true), 1600)
    return () => clearTimeout(id)
  }, [])

  if (skip) return null

  return (
    <AnimatePresence
      onExitComplete={() => {
        window.sessionStorage.setItem(STORAGE_KEY, '1')
        setDoorDone(true)
      }}
    >
      {!closed && (
        <motion.div
          key="door"
          aria-hidden="true"
          className="fixed inset-0 z-[10000]"
        >
          {/* Panneau gauche */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r border-accent/20 bg-bg"
            exit={{ x: '-100%', transition: { duration: 0.9, ease: DOOR_EASE } }}
          >
            <PanelNoise />
          </motion.div>

          {/* Panneau droite */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-accent/20 bg-bg"
            exit={{ x: '100%', transition: { duration: 0.9, ease: DOOR_EASE } }}
          >
            <PanelNoise />
          </motion.div>

          {/* Centre — logo + barre de progression */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
          >
            <span className="font-display text-6xl uppercase tracking-widest text-accent">
              TANUKI
            </span>
            <div className="h-px w-40 overflow-hidden bg-accent/15">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
