'use client'

/**
 * Texture grain fixe — superposée en pointer-events:none sur tout le site.
 * Monter dans app/[locale]/layout.tsx, avant la fermeture de <body>.
 * Opacité réglable via la prop `opacity` (défaut 0.07).
 */

interface NoiseOverlayProps {
  opacity?: number
}

export function NoiseOverlay({ opacity = 0.07 }: NoiseOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9990]"
      style={{ opacity }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  )
}
