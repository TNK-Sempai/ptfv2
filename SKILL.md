---
name: motion-system
description: >
  Système d'animation Awwwards-grade pour Next.js 14+ App Router + TypeScript.
  Déclencher obligatoirement avant tout travail d'animation sur le portfolio Tanuki v2
  ou tout projet Next.js nécessitant un niveau visuel premium.
  Couvre : Lenis smooth scroll, page transitions AnimatePresence, GSAP ScrollTrigger,
  cursor morphing contextuel, magnetic buttons, tilt 3D, SplitText scramble,
  micro-interactions. Inclut tous les pièges critiques et guards obligatoires.
---

# motion-system — Animation Awwwards-grade pour Next.js

## 0. Philosophie
> "L'animation n'est pas de la décoration. C'est de la communication."
> Chaque mouvement a une raison. Chaque transition raconte quelque chose.
> Un site Awwwards a 5 couches d'animation qui fonctionnent ensemble.
> Un site ordinaire en a 1 mal branchée.

---

## 1. Les 5 Couches — Vue d'ensemble

| Couche | Technologie | Rôle | Impact perçu |
|---|---|---|---|
| Souffle | Lenis | Scroll physique inertiel | Immédiat — 1ère sensation |
| Entrée | Framer Motion AnimatePresence | Page transitions | Chaque navigation |
| Révélation | GSAP ScrollTrigger | Sections qui s'ouvrent | Scroll ongoing |
| Présence | Cursor + Magnetic | Réactivité au pointeur | Permanent |
| Détail | SplitText + micro | Moments "wow" | Mémorable |

---

## 2. Installation

```bash
npm install lenis gsap framer-motion
```

**Versions validées :**
- `lenis` (pas @studio-freight/lenis — déprécié depuis 2024)
- `gsap` 3.12+ (SplitText gratuit inclus)
- `framer-motion` 12+

---

## 3. MODULE 1 — Lenis Smooth Scroll

### Setup Provider

```tsx
// components/providers/LenisProvider.tsx
'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Guard StrictMode — évite double instanciation
    if (lenisRef.current) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
    })

    lenisRef.current = lenis

    // CRITIQUE — synchronisation Lenis + GSAP
    // Sans ça : ScrollTrigger et Lenis entrent en conflit
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
```

### Intégration dans layout.tsx

```tsx
// app/[locale]/layout.tsx
import { LenisProvider } from '@/components/providers/LenisProvider'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <LenisProvider>
          <Nav />
          {children}
          <Footer />
        </LenisProvider>
        <Cursor />
        <NoiseOverlay />
      </body>
    </html>
  )
}
```

### ⚠️ Règles Lenis
- Une seule instance dans tout le projet
- Guard `if (lenisRef.current) return` obligatoire
- Toujours synchroniser avec GSAP ticker
- `lenis.destroy()` dans le cleanup

---

## 4. MODULE 2 — Page Transitions

### ⚠️ DÉTAIL CRITIQUE — template.tsx pas layout.tsx
`layout.tsx` persiste entre les routes → AnimatePresence ne se déclenche PAS.
`template.tsx` est re-monté à chaque navigation → AnimatePresence fonctionne.
C'est l'erreur que 90% des devs font.

```tsx
// app/[locale]/template.tsx  ← PAS layout.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const overlayVariants = {
  initial: { scaleY: 0, transformOrigin: 'bottom' },
  animate: { scaleY: 1, transformOrigin: 'bottom',
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] }
  },
  exit: { scaleY: 0, transformOrigin: 'top',
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.1 }
  },
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.35 }
  },
  exit: { opacity: 0, y: -10,
    transition: { duration: 0.2 }
  },
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Overlay accent qui couvre pendant la transition */}
        <motion.div
          className="fixed inset-0 z-[9999] bg-accent pointer-events-none"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        />
        {/* Contenu de la page */}
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.main>
      </motion.div>
    </AnimatePresence>
  )
}
```

### Règles Page Transitions
- Jamais de flash blanc — toujours un état intermédiaire
- Overlay bg-accent 300ms → retire 300ms = 600ms total
- `mode="wait"` sur AnimatePresence — attend exit avant enter
- key={pathname} sur le motion.div enfant

---

## 5. MODULE 3 — GSAP ScrollTrigger

### Guard SSR obligatoire

```tsx
// Toujours vérifier window avant GSAP
useEffect(() => {
  if (typeof window === 'undefined') return
  // init GSAP ici
}, [])
```

### Pattern TextReveal (masking)

```tsx
// hooks/useTextReveal.ts
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useTextReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const ctx = gsap.context(() => {
      // Masking : le texte monte depuis en dessous d'une ligne invisible
      gsap.fromTo(ref.current,
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true, // ne rejoue pas
          }
        }
      )
    }, ref)

    return () => ctx.revert() // CLEANUP OBLIGATOIRE
  }, [])

  return ref
}

// Usage dans un composant :
// <div style={{ overflow: 'hidden' }}>  ← le wrapper clip le texte
//   <div ref={ref}>Mon titre</div>
// </div>
```

### Pattern ImageReveal (clip-path)

```tsx
export function useImageReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once: true,
          }
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
```

### Pattern StaggerChildren

```tsx
export function useStaggerReveal(selector: string = '.stagger-item') {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current!.querySelectorAll(selector),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once: true,
          }
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}
```

### Règles ScrollTrigger
- `ctx.revert()` dans CHAQUE useEffect cleanup — obligatoire
- `once: true` par défaut — ne rejoue pas au re-scroll
- `typeof window !== 'undefined'` guard en tête
- `gsap.registerPlugin(ScrollTrigger)` une fois au module level

---

## 6. MODULE 4 — Cursor System

### CursorContext — broadcaster d'état

```tsx
// contexts/CursorContext.tsx
'use client'
import { createContext, useContext, useState } from 'react'

type CursorState = 'default' | 'hover' | 'text' | 'drag' | 'view'

const CursorContext = createContext<{
  state: CursorState
  setState: (s: CursorState) => void
  label: string
  setLabel: (l: string) => void
}>({
  state: 'default',
  setState: () => {},
  label: '',
  setLabel: () => {},
})

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CursorState>('default')
  const [label, setLabel] = useState('')
  return (
    <CursorContext.Provider value={{ state, setState, label, setLabel }}>
      {children}
    </CursorContext.Provider>
  )
}

export const useCursor = () => useContext(CursorContext)
```

### Cursor.tsx — composant complet

```tsx
// components/ui/Cursor.tsx
'use client'
import { useEffect, useRef } from 'react'
import { useCursor } from '@/contexts/CursorContext'

// GUARD TOUCH — jamais pointer:coarse (non fiable avec MetaMask)
const isTouch = () => ('ontouchstart' in window) && window.innerWidth < 1024

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const { state, label } = useCursor()

  useEffect(() => {
    if (isTouch()) return // sortir immédiatement sur touch

    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMove)

    const loop = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`
        dotRef.current.style.top = `${my}px`
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`
        ringRef.current.style.top = `${ry}px`
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Tailles selon l'état
  const sizes = {
    default: { dot: 10, ring: 38 },
    hover:   { dot: 22, ring: 60 },
    text:    { dot: 4,  ring: 50 },
    drag:    { dot: 6,  ring: 70 },
    view:    { dot: 6,  ring: 80 },
  }
  const { dot, ring } = sizes[state]

  return (
    <>
      <div
        ref={dotRef}
        style={{ width: dot, height: dot }}
        className="fixed top-0 left-0 rounded-full bg-accent
          pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2
          mix-blend-difference transition-[width,height] duration-200"
      />
      <div
        ref={ringRef}
        style={{ width: ring, height: ring }}
        className="fixed top-0 left-0 rounded-full border border-accent/35
          pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2
          transition-all duration-300 flex items-center justify-center"
      >
        {label && (
          <span className="font-mono text-[9px] tracking-widest uppercase text-accent">
            {label}
          </span>
        )}
      </div>
    </>
  )
}
```

### Usage dans les composants

```tsx
// Sur n'importe quel composant
const { setState, setLabel } = useCursor()

<div
  onMouseEnter={() => { setState('view'); setLabel('VOIR') }}
  onMouseLeave={() => { setState('default'); setLabel('') }}
>
```

### Règles Cursor
- Guard `isTouch()` en tête de useEffect — jamais pointer:coarse
- CursorProvider dans layout.tsx — une seule instance
- `cancelAnimationFrame` dans le cleanup
- mix-blend-difference sur le dot — effet visuel signature

---

## 7. MODULE 5 — Magnetic + Tilt 3D

### MagneticButton.tsx

```tsx
// components/ui/MagneticButton.tsx
'use client'
import { useRef, useState, useCallback, ButtonHTMLAttributes } from 'react'

const isTouch = () => ('ontouchstart' in window) && window.innerWidth < 1024

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number
  children: React.ReactNode
}

export function MagneticButton({ children, strength = 0.3, ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = useCallback((e: React.MouseEvent) => {
    if (isTouch()) return
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }, [strength])

  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), [])

  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: pos.x === 0 ? 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' : 'none',
        willChange: pos.x !== 0 ? 'transform' : 'auto', // will-change limité
      }}
      {...props}
    >
      {children}
    </button>
  )
}
```

### useTilt hook

```tsx
// hooks/useTilt.ts
'use client'
import { useRef, useCallback } from 'react'

const isTouch = () => ('ontouchstart' in window) && window.innerWidth < 1024

export function useTilt(strength = 12) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (isTouch()) return
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`
    el.style.transition = 'none'
    el.style.willChange = 'transform'
  }, [strength])

  const onLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'
    ref.current.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'
    ref.current.style.willChange = 'auto'
  }, [])

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave }
}
```

---

## 8. MODULE 6 — Micro-interactions

### SplitText Scramble (hero title)

```tsx
// components/ui/SplitText.tsx — version scramble
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'
const isTouch = () => ('ontouchstart' in window) && window.innerWidth < 1024

interface Props {
  text: string
  className?: string
  delay?: number
  scramble?: boolean
}

export function SplitTextScramble({ text, className, delay = 0, scramble = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const touch = isTouch()
    const ctx = gsap.context(() => {
      const split = new SplitText(ref.current!, { type: 'chars' })

      if (scramble && !touch) {
        // Scramble effect : caractères aléatoires avant le bon texte
        split.chars.forEach((char, i) => {
          const original = char.textContent || ''
          let iterations = 0
          const interval = setInterval(() => {
            char.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
            iterations++
            if (iterations > 8) {
              char.textContent = original
              clearInterval(interval)
            }
          }, 40)
          setTimeout(() => {}, delay * 1000 + i * 50)
        })
      } else {
        // Reveal classique par char
        gsap.fromTo(split.chars,
          { y: '110%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.025,
            delay,
          }
        )
      }

      return () => split.revert()
    }, ref)

    return () => ctx.revert()
  }, [text, delay, scramble])

  return (
    <span ref={ref} aria-label={text} className={className}>
      {text}
    </span>
  )
}
```

### Card Shine Effect

```css
/* Dans globals.css ou le composant */
.card-shine {
  position: relative;
  overflow: hidden;
}
.card-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255,255,255,0.06),
    transparent
  );
  transform: skewX(-15deg);
  transition: left 0.6s ease;
  pointer-events: none;
}
.card-shine:hover::after {
  left: 150%;
}
```

### Tech Pill Glow

```css
.tech-pill {
  transition: all 0.2s;
}
.tech-pill:hover {
  border-color: rgba(200,240,96,0.35);
  color: var(--accent);
  background: rgba(200,240,96,0.08);
  box-shadow: 0 0 12px rgba(200,240,96,0.15);
  animation: pill-pulse 0.4s ease once;
}
@keyframes pill-pulse {
  0% { box-shadow: 0 0 0 0 rgba(200,240,96,0.3); }
  100% { box-shadow: 0 0 12px rgba(200,240,96,0.15); }
}
```

---

## 9. Pièges critiques — NE PAS OUBLIER

| Piège | Symptôme | Fix |
|---|---|---|
| Lenis double init (StrictMode) | Scroll saccadé | `if (lenisRef.current) return` |
| GSAP + Lenis non synchronisés | ScrollTrigger décalé | `gsap.ticker.add((t) => lenis.raf(t * 1000))` |
| AnimatePresence dans layout.tsx | Transitions qui ne jouent pas | Utiliser `template.tsx` |
| GSAP SSR crash | Build error window undefined | Guard `typeof window !== 'undefined'` |
| pointer:coarse non fiable | Cursor visible sur mobile | `('ontouchstart' in window) && innerWidth < 1024` |
| will-change partout | GPU memory leak | Activer sur mouseenter, auto sur mouseleave |
| SplitText sans 'use client' | Hydration error | 'use client' + init dans useEffect |
| ctx.revert() oublié | Memory leaks + bugs scroll | ctx.revert() dans CHAQUE cleanup |

---

## 10. Checklist avant livraison

- [ ] Lenis provider dans layout.tsx avec synchronisation GSAP ticker
- [ ] template.tsx créé pour AnimatePresence (pas layout.tsx)
- [ ] Chaque useEffect GSAP a son ctx.revert() dans le cleanup
- [ ] Guard isTouch() sur tous les effets souris
- [ ] will-change activé sur mouseenter uniquement
- [ ] SplitText en 'use client' + init dans useEffect
- [ ] CursorProvider dans layout.tsx
- [ ] Pas plus de 4 animations simultanées par page
- [ ] typeof window !== 'undefined' avant tout GSAP

---

## 11. Ordre d'implémentation dans portfoliov2

```
1. npm install lenis gsap framer-motion
2. components/providers/LenisProvider.tsx
3. contexts/CursorContext.tsx
4. components/ui/Cursor.tsx (version complète avec états)
5. app/[locale]/template.tsx (AnimatePresence)
6. app/[locale]/layout.tsx — brancher LenisProvider + CursorProvider
7. hooks/useTextReveal.ts + useImageReveal.ts + useStaggerReveal.ts
8. hooks/useTilt.ts (remplace la version inline dans ProjectCard)
9. Appliquer les hooks sur chaque section de chaque page
10. SplitTextScramble sur le hero
11. Card shine + pill glow dans globals.css
```

---

*Forgé par le conseil Vegapunk — Session All for One motion-system*
*LILITH (créatif) · ATLAS (structure) · YORK (pièges) · EDISON (exécution)*
