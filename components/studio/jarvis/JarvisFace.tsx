'use client'

// components/studio/jarvis/JarvisFace.tsx — Avatar holographique de Jarvis.
// Raton victorien (lunettes rondes dorées, masque, cravate) projeté en
// hologramme bleu, cerclé d'anneaux rotatifs. États : idle / thinking / speaking.
// Inspiré du preview jarvis-option-b-v3.html. Tokens : --bg + bleu hologramme.

import { motion, useReducedMotion } from 'framer-motion'
import { JARVIS_GOLD, JARVIS_HOLO_BLUE } from '@/lib/studio/constants'

export type JarvisState = 'idle' | 'thinking' | 'speaking'

interface JarvisFaceProps {
  state?: JarvisState
  className?: string
}

const B = JARVIS_HOLO_BLUE
const GOLD = JARVIS_GOLD

/** Cadence des anneaux selon l'état (s par tour). */
const RING_SPEED: Record<JarvisState, number> = {
  idle: 22,
  thinking: 7,
  speaking: 12,
}

export default function JarvisFace({ state = 'idle', className }: JarvisFaceProps) {
  const reduce = useReducedMotion()
  const spin = RING_SPEED[state]
  const glow = state === 'idle' ? 0.45 : state === 'thinking' ? 0.7 : 0.9

  return (
    <div className={['relative grid place-items-center', className].filter(Boolean).join(' ')}>
      {/* Halo bleu pulsé derrière le raton */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${B}55 0%, transparent 70%)` }}
        animate={reduce ? undefined : { opacity: [glow * 0.6, glow, glow * 0.6], scale: [0.92, 1.04, 0.92] }}
        transition={{ duration: state === 'speaking' ? 1.1 : 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Anneaux hologramme rotatifs */}
      <motion.svg
        aria-hidden
        viewBox="0 0 220 220"
        className="absolute h-52 w-52"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: spin, repeat: Infinity, ease: 'linear' }}
        style={{ filter: `drop-shadow(0 0 4px ${B})` }}
      >
        <ellipse cx="110" cy="110" rx="100" ry="38" fill="none" stroke={B} strokeOpacity="0.55" strokeWidth="1" />
        <ellipse cx="110" cy="110" rx="78" ry="100" fill="none" stroke={B} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 7" />
        <ellipse cx="110" cy="110" rx="100" ry="78" fill="none" stroke={B} strokeOpacity="0.2" strokeWidth="1" transform="rotate(45 110 110)" />
      </motion.svg>

      {/* Raton victorien — flottement vertical doux */}
      <motion.svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Jarvis — ${state}`}
        className="relative h-44 w-44"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${B}) drop-shadow(0 0 14px ${B}88)` }}
      >
        <g fill="none" stroke={B} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Oreilles */}
          <path d="M62 58 L52 26 L86 46 Z" fill={`${B}14`} />
          <path d="M138 58 L148 26 L114 46 Z" fill={`${B}14`} />
          {/* Tête */}
          <path d="M58 60 Q100 38 142 60 Q158 92 142 128 Q100 156 58 128 Q42 92 58 60 Z" fill={`${B}10`} />
          {/* Masque raton */}
          <path d="M60 86 Q100 70 140 86 Q138 104 122 110 Q100 116 78 110 Q62 104 60 86 Z" fill={`${B}22`} stroke="none" />
          {/* Museau + truffe */}
          <path d="M88 118 Q100 124 112 118 L106 132 Q100 138 94 132 Z" fill={`${B}18`} />
          <ellipse cx="100" cy="120" rx="6" ry="4" fill={B} stroke="none" />
        </g>

        {/* Lunettes rondes dorées */}
        <g fill="none" stroke={GOLD} strokeWidth="3" style={{ filter: `drop-shadow(0 0 3px ${GOLD})` }}>
          <circle cx="80" cy="96" r="15" fill={`${GOLD}10`} />
          <circle cx="120" cy="96" r="15" fill={`${GOLD}10`} />
          <line x1="95" y1="96" x2="105" y2="96" />
          <line x1="65" y1="92" x2="52" y2="86" />
          <line x1="135" y1="92" x2="148" y2="86" />
        </g>
        {/* Yeux (pulsent en thinking/speaking) */}
        <motion.g
          fill={GOLD}
          animate={reduce || state === 'idle' ? undefined : { opacity: [1, 0.35, 1] }}
          transition={{ duration: state === 'thinking' ? 1.4 : 0.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="80" cy="96" r="4" />
          <circle cx="120" cy="96" r="4" />
        </motion.g>

        {/* Whiskers */}
        <g stroke={B} strokeWidth="1.4" strokeOpacity="0.6" strokeLinecap="round">
          <line x1="74" y1="122" x2="46" y2="116" />
          <line x1="74" y1="127" x2="48" y2="128" />
          <line x1="126" y1="122" x2="154" y2="116" />
          <line x1="126" y1="127" x2="152" y2="128" />
        </g>

        {/* Costume victorien : col + nœud papillon */}
        <g fill="none" stroke={B} strokeWidth="2" strokeLinejoin="round">
          <path d="M72 150 L100 162 L128 150 L138 184 L62 184 Z" fill={`${B}10`} />
          <path d="M88 158 L100 166 L112 158 L106 174 L94 174 Z" fill={`${B}26`} />
        </g>
      </motion.svg>
    </div>
  )
}
