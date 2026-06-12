'use client'
import { useRef, useState, useEffect, ReactNode, ButtonHTMLAttributes } from 'react'

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Force d'attraction — 0 à 1, défaut 0.4 */
  strength?: number
  /** Rayon de détection en px — défaut 80 */
  radius?: number
}

/**
 * Bouton magnétique : le contenu se déplace vers le curseur dans un rayon donné.
 * Guard touch obligatoire — inactif si ontouchstart + innerWidth < 1024.
 * Utiliser data-cursor="hover" pour le Cursor custom (déjà appliqué).
 */
export function MagneticButton({
  children,
  strength = 0.4,
  radius = 80,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isTouch, setIsTouch] = useState(true)

  useEffect(() => {
    setIsTouch('ontouchstart' in window && window.innerWidth < 1024)
  }, [])

  useEffect(() => {
    if (isTouch || !ref.current) return

    const el = ref.current

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < radius) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      } else {
        el.style.transform = 'translate(0px, 0px)'
      }
    }

    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)'
    }

    window.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [isTouch, strength, radius])

  return (
    <button
      ref={ref}
      data-cursor="hover"
      className={['transition-transform duration-300 ease-out', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
