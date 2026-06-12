'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type CursorState = 'default' | 'hover' | 'text' | 'drag'

interface CursorContextValue {
  state: CursorState
  setState: (s: CursorState) => void
}

const CursorContext = createContext<CursorContextValue>({
  state: 'default',
  setState: () => undefined,
})

/**
 * Provider global cursor — monter une seule fois dans layout.tsx.
 * Guard touch : sur ontouchstart + innerWidth < 1024, aucun listener n'est attaché.
 * Détecte automatiquement l'état via data-cursor sur les éléments survolés.
 * Les composants qui veulent overrider l'état : useCursor().setState('hover').
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>('default')
  const [isTouch, setIsTouch] = useState(true) // SSR-safe : true par défaut

  useEffect(() => {
    setIsTouch('ontouchstart' in window && window.innerWidth < 1024)
  }, [])

  const handleOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-cursor="drag"]')) {
      setState('drag')
    } else if (target.closest('a, button, [data-cursor="hover"]')) {
      setState('hover')
    } else if (
      target.closest('p, h1, h2, h3, h4, h5, h6, span, [data-cursor="text"]')
    ) {
      setState('text')
    } else {
      setState('default')
    }
  }, [])

  const handleLeave = useCallback(() => setState('default'), [])

  useEffect(() => {
    if (isTouch) return

    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [isTouch, handleOver, handleLeave])

  return (
    <CursorContext.Provider value={{ state, setState }}>
      {children}
    </CursorContext.Provider>
  )
}

/**
 * Hook curseur — lecture + contrôle depuis n'importe quel composant.
 * @example
 * const { setState } = useCursor()
 * <div onMouseEnter={() => setState('drag')} onMouseLeave={() => setState('default')} />
 */
export function useCursor(): CursorContextValue {
  return useContext(CursorContext)
}
