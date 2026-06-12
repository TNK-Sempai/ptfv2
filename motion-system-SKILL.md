---
name: motion-system
description: >
  Système d'animation complet pour Tanuki v2 — Next.js 14+ App Router.
  Covers: Lenis smooth scroll, Framer Motion variants, GSAP SplitText + ScrollTrigger,
  Cursor.tsx, MagneticButton.tsx, useTilt hook.
  Guards touch OBLIGATOIRES. Performance rules strictes.
  Charger ce skill dès que l'on touche à une animation, transition, ou interaction
  pointeur sur le projet tanuki-corporation.com.
lead: MILO (UI) + NOVA (CSS) — ZARA support architecture
---

# motion-system — Tanuki v2

## RÈGLE ABSOLUE — Touch Guard

**Toute animation liée au pointeur DOIT tester :**
```ts
const isTouch = () => 'ontouchstart' in window && window.innerWidth < 1024
```
Si `isTouch()` → désactiver Cursor, MagneticButton, useTilt. Jamais `pointer:coarse` seul.

---

## 1. Setup Lenis — Smooth Scroll

### Installation
```bash
npm install @studio-freight/lenis
```

### Provider global — `components/motion/LenisProvider.tsx`
```tsx
'use client'
import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

let lenis: Lenis | null = null

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  return <>{children}</>
}

/** Export pour GSAP ScrollTrigger sync */
export function getLenis() { return lenis }
```

### Intégration dans `app/[locale]/layout.tsx`
```tsx
import { LenisProvider } from '@/components/motion/LenisProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
```

### Sync Lenis + GSAP ScrollTrigger (dans les composants qui utilisent ST)
```ts
import { getLenis } from '@/components/motion/LenisProvider'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Dans useEffect, après init GSAP :
getLenis()?.on('scroll', ScrollTrigger.update)
```

---

## 2. Framer Motion — Variants centralisés

### `components/motion/variants.ts`
```ts
import { Variants } from 'framer-motion'

/** Fade simple */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

/** Slide du bas */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

/** Slide de la gauche */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/** Clip-path reveal — de bas en haut */
export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
  },
}

/** Scale depuis centre */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/** Stagger container */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

/** Page transition */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } },
}
```

### Usage pattern dans un composant
```tsx
import { motion } from 'framer-motion'
import { staggerContainer, slideUp } from '@/components/motion/variants'

export function MySection() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <motion.h2 variants={slideUp}>Titre</motion.h2>
      <motion.p variants={slideUp}>Texte</motion.p>
    </motion.section>
  )
}
```

**Règles Framer Motion :**
- `viewport={{ once: true }}` toujours — pas de re-trigger au scroll up
- `whileInView` sur les sections, `animate` sur les états contrôlés
- Pas de `AnimatePresence` sans `mode="wait"` pour page transitions
- `layout` prop uniquement si réordonnnement réel

---

## 3. GSAP SplitText — Reveal texte

### Installation
```bash
npm install gsap
# SplitText inclus depuis GSAP 3.12 gratuit (vérifier license GSAP Club si usage commercial)
```

### Wrapper `components/ui/SplitText.tsx`
```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitText from 'gsap/SplitText'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(SplitText, ScrollTrigger)

interface SplitTextProps {
  children: string
  type?: 'lines' | 'chars' | 'words'
  trigger?: 'scroll' | 'immediate'
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function AnimatedSplitText({
  children,
  type = 'lines',
  trigger = 'scroll',
  className,
  as: Tag = 'div',
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const split = new SplitText(ref.current, { type })
    const targets = type === 'lines' ? split.lines
                   : type === 'chars' ? split.chars
                   : split.words

    const from = { opacity: 0, y: type === 'chars' ? 20 : 40 }
    const to = {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: type === 'chars' ? 0.03 : 0.08,
    }

    let ctx: gsap.Context

    if (trigger === 'scroll') {
      ctx = gsap.context(() => {
        gsap.from(targets, {
          ...from,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
          ...to,
        })
      }, ref)
    } else {
      ctx = gsap.context(() => {
        gsap.from(targets, { ...from, ...to })
      }, ref)
    }

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [type, trigger])

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  )
}
```

### Scramble effect (Hero title)
```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrambleTextPlugin)

export function ScrambleTitle({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        duration: 1.2,
        scrambleText: {
          text,
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          revealDelay: 0.3,
          speed: 0.8,
        },
        ease: 'none',
        delay: 0.5,
      })
    }, ref)
    return () => ctx.revert()
  }, [text])

  return (
    <h1 ref={ref} className={className} aria-label={text}>
      {text}
    </h1>
  )
}
```

---

## 4. GSAP ScrollTrigger — Patterns

### Règle absolue : toujours dans `gsap.context()` avec cleanup

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { getLenis } from '@/components/motion/LenisProvider'

gsap.registerPlugin(ScrollTrigger)

export function MyAnimatedSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sync Lenis + ScrollTrigger
    getLenis()?.on('scroll', ScrollTrigger.update)
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop: () => getLenis()?.scroll ?? window.scrollY,
    })

    const ctx = gsap.context(() => {
      // Pattern 1 : Reveal au scroll
      gsap.from('.reveal-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Pattern 2 : Parallax image (léger — max translateY 60px)
      gsap.to('.parallax-img', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        y: -60,
        ease: 'none',
      })

      // Pattern 3 : Pin section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=500',
        pin: true,
        pinSpacing: true,
      })
    }, sectionRef)

    return () => {
      ctx.revert() // Kill toutes les animations du context
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return <section ref={sectionRef}>{/* ... */}</section>
}
```

**Règles ScrollTrigger :**
- `once: true` sur reveals — pas de re-trigger
- `scrub: 1` max pour parallax — jamais `scrub: true` (trop sensible)
- Pin uniquement si section narrative — pas de pin décoratif
- `ctx.revert()` obligatoire en cleanup — pas juste `kill()`

---

## 5. Composants UI Animés

### 5.1 `components/ui/Cursor.tsx`
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

type CursorState = 'default' | 'hover' | 'text' | 'drag'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorState>('default')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Guard touch
    if ('ontouchstart' in window && window.innerWidth < 1024) return

    setVisible(true)
    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let rafId: number

    const moveDot = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      rafId = requestAnimationFrame(animateRing)
    }

    // Détection contexte (hover, text, drag)
    const handleEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor="hover"]')) setState('hover')
      else if (target.closest('p, h1, h2, h3, span, [data-cursor="text"]')) setState('text')
      else if (target.closest('[data-cursor="drag"]')) setState('drag')
      else setState('default')
    }

    const handleLeave = () => setState('default')

    document.addEventListener('mousemove', moveDot)
    document.addEventListener('mouseover', handleEnter)
    document.addEventListener('mouseleave', handleLeave)
    rafId = requestAnimationFrame(animateRing)

    return () => {
      document.removeEventListener('mousemove', moveDot)
      document.removeEventListener('mouseover', handleEnter)
      document.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full bg-accent transition-all duration-150 ${
            state === 'default' ? 'w-2 h-2' :
            state === 'hover'   ? 'w-1 h-1 opacity-0' :
            state === 'text'    ? 'w-0.5 h-4 rounded-none' :
            'w-2 h-2'
          }`}
        />
      </div>
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full border border-accent/40 transition-all duration-200 ${
            state === 'default' ? 'w-8 h-8' :
            state === 'hover'   ? 'w-12 h-12 bg-accent/10' :
            state === 'text'    ? 'w-6 h-6 opacity-40' :
            'w-16 h-16 bg-accent/5'
          }`}
        />
      </div>
    </>
  )
}
```

**Ajouter dans `globals.css` :**
```css
/* Cache le curseur natif sur desktop */
@media (hover: hover) and (pointer: fine) {
  * { cursor: none !important; }
}
```

---

### 5.2 `components/ui/MagneticButton.tsx`
```tsx
'use client'
import { useRef, useState, useEffect, ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number       // Force d'attraction — default 0.4
  radius?: number         // Rayon détection px — default 80
  className?: string
  onClick?: () => void
  'data-cursor'?: string
}

export function MagneticButton({
  children,
  strength = 0.4,
  radius = 80,
  className,
  onClick,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isTouch, setIsTouch] = useState(true) // SSR safe default

  useEffect(() => {
    setIsTouch('ontouchstart' in window && window.innerWidth < 1024)
  }, [])

  useEffect(() => {
    if (isTouch || !ref.current) return
    const el = ref.current

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < radius) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      } else {
        el.style.transform = 'translate(0px, 0px)'
      }
    }

    const reset = () => {
      el.style.transform = 'translate(0px, 0px)'
    }

    window.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', reset)

    return () => {
      window.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', reset)
    }
  }, [isTouch, strength, radius])

  return (
    <button
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      onClick={onClick}
      data-cursor="hover"
      {...props}
    >
      {children}
    </button>
  )
}
```

---

### 5.3 `hooks/useTilt.ts`
```ts
'use client'
import { useRef, useEffect } from 'react'

interface TiltOptions {
  maxRotate?: number   // Degrés max — default 8
  scale?: number       // Scale au hover — default 1.02
}

export function useTilt<T extends HTMLElement>({ maxRotate = 8, scale = 1.02 }: TiltOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    // Guard touch
    if ('ontouchstart' in window && window.innerWidth < 1024) return
    if (!ref.current) return

    const el = ref.current

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 à 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      el.style.transform = `
        perspective(800px)
        rotateX(${-y * maxRotate}deg)
        rotateY(${x * maxRotate}deg)
        scale(${scale})
      `
    }

    const reset = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    }

    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', reset)

    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', reset)
    }
  }, [maxRotate, scale])

  return ref
}
```

**Usage :**
```tsx
import { useTilt } from '@/hooks/useTilt'

export function ProjectCard() {
  const tiltRef = useTilt<HTMLDivElement>({ maxRotate: 6, scale: 1.02 })
  return (
    <div ref={tiltRef} className="transition-transform duration-200 ease-out">
      {/* card content */}
    </div>
  )
}
```

---

## 6. Rules Performance — Contrat strict

### ✅ Autorisé
- `will-change: transform` — uniquement pendant l'animation active, retiré après
- `transform` et `opacity` uniquement pour animations — pas de `top/left/width`
- `requestAnimationFrame` pour animations JS custom
- `once: true` sur tous les ScrollTriggers de reveal
- Lenis `duration: 1.2` max — au-delà c'est du lag, pas de la fluidité

### ❌ Interdit
- `will-change` sur des éléments statiques ou en masse
- Animations continues en background (loop infini sur éléments visibles permanents)
- Parallax lourd (translate > 100px scrubbed)
- Plus de 4 animations simultanées sur le même viewport
- `ScrollTrigger` sans `ctx.revert()` au unmount
- Lenis sans `destroy()` au unmount

### Règle `will-change`
```ts
// ✅ Correct : activer juste avant, désactiver après
el.style.willChange = 'transform'
gsap.to(el, {
  x: 100,
  onComplete: () => { el.style.willChange = 'auto' }
})

// ❌ Incorrect : permanent en CSS
.ma-carte { will-change: transform; } /* INTERDIT */
```

---

## 7. Anti-patterns — Rappel projet

```
❌ pointer:coarse seul pour touch detect → toujours ontouchstart + innerWidth < 1024
❌ gsap.from() hors gsap.context() → memory leak
❌ SplitText sans split.revert() → DOM corrompu entre navigations
❌ Cursor actif sur mobile → guard manquant
❌ Multiple ScrollTrigger.getAll().forEach(kill) global → killer les autres composants
   → Toujours ctx.revert() scopé
❌ Lenis sans export getLenis() → ScrollTrigger désynchronisé
❌ Animation sur :root ou body → impacte tout
```

---

## 8. Checklist livraison animation

Avant tout commit touchant une animation :
- [ ] Guard touch présent sur Cursor, Magnetic, Tilt
- [ ] `gsap.context()` + cleanup `ctx.revert()` dans chaque useEffect GSAP
- [ ] `split.revert()` après `SplitText` cleanup
- [ ] `lenis.destroy()` dans LenisProvider cleanup
- [ ] `will-change` retiré après animation (pas en CSS permanent)
- [ ] `viewport={{ once: true }}` sur tous les `whileInView` Framer
- [ ] Testé sur mobile (aucune animation pointer ne doit s'activer)
- [ ] Max 4 animations simultanées dans le viewport
