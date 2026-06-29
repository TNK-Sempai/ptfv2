'use client'

import { useRef, useEffect } from 'react'

/**
 * useTilt — Tilt 3D effect on hover.
 * Guard touch obligatoire : inactif si ontouchstart + innerWidth < 1024.
 * willChange activé uniquement pendant l'interaction (règle CLAUDE.md).
 */
export function useTilt<T extends HTMLElement = HTMLElement>(strength = 12) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    const onEnter = () => {
      el.style.willChange = 'transform'
      el.style.transition = 'none'
    }
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const nx = (e.clientX - left) / width - 0.5
      const ny = (e.clientY - top) / height - 0.5
      el.style.transform = `perspective(900px) rotateX(${-ny * strength}deg) rotateY(${nx * strength}deg)`
    }
    const onLeave = () => {
      el.style.willChange = 'auto'
      el.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}
