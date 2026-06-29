# DESIGN-SYSTEM.md — Portfolio Tanuki v2

> Documentation exhaustive du système visuel **actuel** du projet.
> Source de vérité : [app/globals.css](app/globals.css), [components/motion/variants.ts](components/motion/variants.ts), `components/ui/`, `components/blocks/`, `hooks/`.
> Stack : Next.js 16 (App Router) · **Tailwind CSS v4** (config 100 % CSS, pas de `tailwind.config.ts`) · Framer Motion · GSAP · Lenis · next-intl.
>
> ⚠️ Ce document **décrit l'existant**, il ne le remplace pas. En cas de divergence, le code fait foi.
> Règles DA absolues : voir [CLAUDE.md](CLAUDE.md) — ne jamais hardcoder une couleur, jamais de `any`, jamais de CSS inline arbitraire.

---

## 1. TOKENS DE BASE

### 1.1 Couleurs

Toutes les couleurs sont définies une seule fois dans `:root` ([app/globals.css:4-14](app/globals.css#L4-L14)) puis exposées à Tailwind v4 via `@theme inline` ([app/globals.css:17-34](app/globals.css#L17-L34)).

| Variable CSS | Valeur | Utilitaire Tailwind | Usage |
|---|---|---|---|
| `--bg` | `#09090e` | `bg-bg` / `text-bg` | Fond global (`html`, `body`). Texte sur fond accent. |
| `--surface` | `#0e0e15` | `bg-surface` | Cartes, panneaux, footer, dropdown items. |
| `--surface2` | `#13131c` | `bg-surface2` | Surfaces de 2ᵉ niveau : dropdown nav, encarts preview, tracks de barres, hover stack. |
| `--border` | `rgba(255,255,255,0.06)` | `border-border` | **Toutes** les bordures de séparation. |
| `--text` | `#ede8df` | `text-text` | Texte principal, titres. |
| `--muted` | `#6b665f` | `text-muted` | Texte tertiaire / désactivé, descriptions secondaires. |
| `--muted2` | `#9c9590` | `text-muted2` | Texte secondaire, liens nav au repos. |
| `--accent` | `#c8f060` | `text-accent` / `bg-accent` / `border-accent` | Couleur de marque (vert-lime). Liens actifs, CTA, focus, sélection. |
| `--blue` | `rgba(100,140,255,1)` | `text-blue` / `bg-blue` | Accent secondaire (skill bars notamment). |

**Opacités dérivées** (syntaxe Tailwind `/NN`) très utilisées :
`bg-accent/10`, `bg-accent/5`, `border-accent/40`, `border-accent/20`, `text-accent`, `bg-bg/80`, `bg-bg/70`, `border-accent/40` (hover CTA).

**Accent transparent côté CSS** : toujours via `color-mix(in srgb, var(--accent) NN%, transparent)` — **jamais** un `rgba()` hardcodé. Voir `.card-shine`, `.pill-glow`, `.bg-grid`, `.eyebrow-label`, corners, process-number.

> ⚠️ **Couleurs hors-token tolérées uniquement dans `SkillBar`** : `bg-blue-500` / `bg-purple-500` / `text-blue-400` / `text-purple-400` (palette Tailwind par défaut). C'est la **seule** entorse actuelle au système de tokens — à migrer vers `--blue` / un futur `--purple` si l'occasion se présente.

### 1.2 Typographie

4 familles chargées via `next/font/google` dans [app/[locale]/layout.tsx:30-57](app/[locale]/layout.tsx#L30-L57), exposées en variables puis mappées en `@theme inline` ([app/globals.css:30-33](app/globals.css#L30-L33)).

| Rôle | Famille | Variable next/font | Token `@theme` | Utilitaire | Poids | Usage |
|---|---|---|---|---|---|---|
| Display | **Bebas Neue** | `--font-bebas` | `--font-display` | `font-display` | 400 | Titres `h1/h2/h3`, logo TANUKI, gros chiffres, badges arch/avatar. Toujours `uppercase` + `tracking` large. |
| Serif | **DM Serif Display** | `--font-dm-serif` | `--font-serif` | `font-serif` | 400 (+ italic) | Accents éditoriaux / citations. |
| Mono | **DM Mono** | `--font-dm-mono` | `--font-mono` | `font-mono` | 300/400/500 | Eyebrows, tags techniques, années, badges statut, switcher locale, valeurs `%`, timeline. |
| Body | **Instrument Sans** | `--font-instrument` | `--font-body` | `font-body` | 400/500/600/700 | Corps de texte, paragraphes, liens nav, CTA. Défaut du `body`. |

**Forçage anti-FOUC** ([app/globals.css:388-397](app/globals.css#L388-L397)) : `font-display` / `[class*="font-display"]` et `h1,h2,h3` reçoivent `var(--font-bebas) !important` pour garantir l'héritage même si une règle tierce écrase la `font-family`. La source réelle reste la variable next/font (jamais le nom de la police hardcodé).

> Les variables next/font sont posées sur `<html>` via `fontVars` ([app/[locale]/layout.tsx:59-64](app/[locale]/layout.tsx#L59-L64), classe `antialiased`).

**Échelles de taille observées** (tokens Tailwind par défaut) :
- Eyebrow / micro-labels : `text-[10px]`, `text-[11px]`, `text-xs`, `0.68rem`–`0.72rem` (CSS custom).
- Texte courant : `text-sm`, `text-base`.
- Titres cartes : `text-2xl` (`font-display uppercase`).
- Lettrages larges : `tracking-wide`, `tracking-wider`, `tracking-widest`, `letter-spacing: 0.04em`–`0.24em` (CSS custom).

### 1.3 Espacements récurrents

| Contexte | Valeur | Source |
|---|---|---|
| Rythme vertical de section | `padding-block: 8rem` | `.section` ([app/globals.css:78-87](app/globals.css#L78-L87)) |
| Gouttière horizontale section (mobile) | `padding-inline: 1.5rem` | `.section` |
| Gouttière horizontale section (≥768px) | `padding-inline: 3.5rem` | `.section` |
| Largeur conteneur max | `max-w-7xl` (80rem) + `mx-auto px-6` | Nav, Footer |
| Hauteur header fixe | `h-16` | Nav |
| Padding cartes | `p-4` (Widget) · `p-5` (Project) · `1.5rem` (feat-card) | composants |
| Gaps usuels | `gap-2`, `gap-3`, `gap-5`, `gap-8` (nav), `2rem`/`4rem` (grilles projet) | — |
| Padding badge / pill | `px-2 py-0.5`, `px-3 py-0.5`, `px-5 py-2` (CTA) | — |

### 1.4 Bordures, rayons & surfaces

- **Bordure standard** : `1px solid var(--border)` → `border border-border`.
- **Bordure accent (hover)** : `color-mix(in srgb, var(--accent) 20%, transparent)` ou `border-accent/40`.
- **Rayons** :
  - `rounded` / `6px` / `8px` — petits éléments (tags, arch-node, feat-card, avatar-card).
  - `rounded-lg` — dropdown nav.
  - `rounded-2xl` — cartes Project & Widget.
  - `rounded-full` / `999px` — pills, badges statut, CTA, dot/ring curseur, tracks de barres.
- **Surfaces empilées** : `--bg` (fond) → `--surface` (carte) → `--surface2` (encart/hover dans la carte).
- **Focus visible** ([app/globals.css:95-99](app/globals.css#L95-L99)) : `outline: 2px solid var(--accent)` + `outline-offset: 3px`.
- **Sélection texte** ([app/globals.css:102-105](app/globals.css#L102-L105)) : fond `--accent`, texte `--bg`.

---

## 2. COMPOSANTS UI

### 2.1 `components/ui/` (périmètre NOVA)

#### `Cursor` — [components/ui/Cursor.tsx](components/ui/Cursor.tsx)
Curseur custom à monter **une seule fois** dans le layout. Cache le curseur natif via `cursor: none !important` sous `@media (hover:hover) and (pointer:fine)` ([app/globals.css:50-58](app/globals.css#L50-L58)).
- **Props** : aucune.
- **Structure** : `dot` (position exacte, `z-[9999]`) + `ring` (interpolation `0.12`, `z-[9998]`), une seule boucle rAF.
- **États** (`CursorState`) : `default` · `hover` (a/button/`[data-cursor="hover"]`) · `text` (p/h1-6/span/`[data-cursor="text"]`) · `drag` (`[data-cursor="drag"]`).
- **Classes clés** : `bg-accent`, `border border-accent/40`, `bg-accent/10` (hover ring), `bg-accent/5` (drag ring), `transition-all duration-150/200`.
- **Guard touch obligatoire** : inactif si `'ontouchstart' in window && innerWidth < 1024` → `return null`.

#### `MagneticButton` — [components/ui/MagneticButton.tsx](components/ui/MagneticButton.tsx)
Bouton dont le contenu est attiré vers le curseur.
- **Props** : `children`, `strength` (déf. `0.4`), `radius` px (déf. `80`), `className`, `...ButtonHTMLAttributes`.
- **Comportement** : translate proportionnel à la distance dans le rayon ; retour à `translate(0,0)` au `mouseleave`. `transition-transform duration-300 ease-out`.
- **A11y/curseur** : `data-cursor="hover"` posé automatiquement.
- **Guard touch obligatoire**.

#### `SplitText` — [components/ui/SplitText.tsx](components/ui/SplitText.tsx)
Wrapper GSAP `SplitText` (réservé aux titres hero, règle CLAUDE.md).
- **Props** : `text`, `by` (`chars`|`words`|`lines`, déf. `lines`), `delay`, `stagger`, `className`, `as` (déf. `div`), `trigger` (`scroll`|`immediate`, déf. `scroll`).
- **Anim** : `from {opacity:0, y:20|40}` → `power3.out`, `duration 0.7`, stagger défaut `0.03/0.05/0.08` selon `by`. ScrollTrigger `start: 'top 85%'`, `once: true`.
- **A11y** : `aria-label={text}` sur le parent.
- **Cleanup obligatoire** : `ctx.revert()` + `split.revert()`.
- **Guard touch** : texte rendu sans animation.

#### `CountUp` — [components/ui/CountUp.tsx](components/ui/CountUp.tsx)
Chiffre animé au scroll-in.
- **Props** : `to`, `from` (déf. 0), `duration` ms (déf. 1200), `decimals` (déf. 0), `suffix`, `prefix`, `className`.
- **Comportement** : `IntersectionObserver` `threshold: 0.3`, **une seule fois** (`hasRun`), easing `easeOutCubic`.
- **Cleanup obligatoire** : `observer.disconnect()`.

#### `NoiseOverlay` — [components/ui/NoiseOverlay.tsx](components/ui/NoiseOverlay.tsx)
Texture grain SVG fixe sur tout le site (`feTurbulence` + désaturation).
- **Props** : `opacity` (déf. `0.035`).
- **Classes** : `pointer-events-none fixed inset-0 z-[9990]`.
- À monter avant la fermeture de `<body>`.

> `MagneticButton`, `SplitText`, `CountUp`, `NoiseOverlay` sont listés dans CLAUDE.md ; `Cursor` existe, `SkillBar`/`WidgetCard` sont rangés dans `components/blocks/`.

### 2.2 `components/blocks/` (périmètre MILO)

#### `Nav` — [components/blocks/Nav.tsx](components/blocks/Nav.tsx)
Header fixe i18n.
- **Conteneur** : `fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm`, inner `h-16 max-w-7xl px-6`.
- **Logo** : `font-display text-2xl tracking-widest text-accent`.
- **Liens desktop** (`hidden lg:flex gap-8 text-sm text-muted2`) : hover `hover:text-text`, actif via `aria-current` + `text-accent`.
- **Dropdown Projets** : `group relative` → panneau `invisible opacity-0 group-hover:visible group-hover:opacity-100`, `bg-surface2 border-border rounded-lg shadow-2xl`, chevron `group-hover:rotate-180`. Items `hover:bg-surface hover:text-text`.
- **Switcher locale** : `font-mono text-xs uppercase`, actif `text-accent`.
- **Hamburger mobile** (`lg:hidden`) : 3 barres `h-px w-6 bg-text` animées (rotate 45 / opacity 0).
- **Menu mobile** : `transition-[max-height] duration-300`, `bg-surface`.

#### `Footer` — [components/blocks/Footer.tsx](components/blocks/Footer.tsx)
Server component (`getTranslations`/`getLocale`).
- **Conteneur** : `border-t border-border bg-surface`, inner `max-w-7xl px-6 py-12`.
- Brand `font-display text-2xl tracking-widest text-accent` + URL `font-mono text-xs text-muted`.
- Liens `text-muted2 hover:text-text`. Bas de page `border-t border-border pt-6`, `© year` + `v2`.

#### `ProjectCard` — [components/blocks/ProjectCard.tsx](components/blocks/ProjectCard.tsx)
- **Props** : `title`, `description`, `tags[]`, `badge`, `year`, `href`, `image`, `status` (`live`|`soon`|`wip`).
- **Carte** : `group ... rounded-2xl border border-border bg-surface`, **tilt 3D** via `useTilt()`.
- **Cover** : `aspect-video`, image `group-hover:scale-105 duration-500`. Badge année `font-mono text-[10px]` + badge statut pill `STATUS_STYLE`.
- **`STATUS_STYLE`** : `live` → `bg-accent/10 text-accent border-accent/20` ; `soon` → `bg-muted/10 text-muted2 border-muted/20` ; `wip` → `bg-muted/10 text-muted border-muted/20`.
- **Titre** : `font-display text-2xl uppercase tracking-wide`. Tags `border border-border font-mono text-[11px] text-muted2`.
- **CTA** : pill `rounded-full border border-border ... hover:border-accent/40 hover:text-accent`, `data-cursor="hover"`.

#### `WidgetCard` — [components/blocks/WidgetCard.tsx](components/blocks/WidgetCard.tsx)
- **Props** : `title`, `description`, `languages[]`, `difficulty` (`beginner`|`intermediate`|`advanced`), `href`, `preview?` (ReactNode).
- **Carte** : `Link group ... rounded-2xl border border-border bg-surface hover:border-accent/20`, `data-cursor="hover"`.
- **Preview** : encart `aspect-video bg-surface2`, fallback titre `font-mono text-xs text-muted`.
- **`DIFFICULTY_STYLE`** : `beginner` → accent ; `intermediate` → `muted2` ; `advanced` → `text`.
- Titre `font-body font-semibold group-hover:text-accent`. Tags langages identiques à ProjectCard.

#### `SkillBar` — [components/blocks/SkillBar.tsx](components/blocks/SkillBar.tsx)
- **Props** : `skill`, `sublabel?`, `level` (0–100), `color` (`accent`|`blue`|`purple`, déf. `accent`).
- **Track** : `h-1.5 rounded-full bg-surface2 overflow-hidden`, `role="progressbar"` + `aria-valuenow/min/max`.
- **Fill** : `BAR_COLOR` (`bg-accent`/`bg-blue-500`/`bg-purple-500`), transition `width 1200ms cubic-bezier(0.34,1.56,0.64,1)` (élastique, overshoot clippé par l'`overflow-hidden`).
- **Valeur** : CountUp synchronisé en `easeOutCubic` (pas d'overshoot sur le chiffre), `font-mono tabular-nums`.
- **Déclenchement** : `IntersectionObserver` `threshold: 0.4`, une fois. **Guard touch** → état final immédiat. Cleanup `disconnect()` + `cancelAnimationFrame`.

#### `ScrambleText` — [components/blocks/ScrambleText.tsx](components/blocks/ScrambleText.tsx)
- **Props** : `text`, `delay`, `className`, `as` (déf. `span`).
- **Anim** : GSAP `ScrambleTextPlugin`, `duration 1.2`, `chars: 'upperCase'`, `revealDelay 0.3`, `speed 0.8`.
- Respecte `prefers-reduced-motion` (affiche le texte directement). `aria-label={text}`. Cleanup `ctx.revert()`.

---

## 3. PATTERNS DE LAYOUT

### 3.1 Conteneurs & sections
- **Section verticale** : classe `.section` ([app/globals.css:78](app/globals.css#L78)) → `padding-block: 8rem` + gouttière responsive `1.5rem` → `3.5rem` (≥768px).
- **Conteneur centré** : `mx-auto max-w-7xl px-6` (Nav, Footer — réutiliser ce gabarit).

### 3.2 Grid systems (CSS custom, [app/globals.css:166-304](app/globals.css#L166-L304))
| Classe | Mobile | Desktop (≥768px) |
|---|---|---|
| `.proj-section-grid` | `1fr` (empilé), `gap 2rem` | `1fr 1fr`, `gap 4rem` ; `.reverse` inverse l'ordre des colonnes |
| `.stack-grid` | `1fr`, `gap 2px` | `repeat(3, 1fr)` |
| `.arch-flow` | flex wrap centré, `gap 0.75rem` | idem |
| `.timeline-item` | grid `5rem 1fr`, `gap 1.5rem` | idem |

Cartes en grille de page : grilles Tailwind responsive (`sizes` des images : `33vw` ≥1024px, `50vw` ≥640px, sinon `100vw`).

### 3.3 Breakpoints
**Tailwind v4 par défaut** : `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- Bascule **desktop nav / mobile menu** : `lg` (1024).
- Bascule **grilles de contenu** (CSS custom + media queries) : `768px`.
- **Seuil guard touch** (JS) : `window.innerWidth < 1024` combiné à `'ontouchstart' in window`.

### 3.4 z-index (échelle observée)
`z-50` Nav · `z-[9990]` NoiseOverlay · `z-[9998]` ring curseur · `z-[9999]` dot curseur · `z-1` `.card-shine::before`.

---

## 4. ANIMATIONS

### 4.1 Variants Framer Motion — [components/motion/variants.ts](components/motion/variants.ts)
Tous les variants sont centralisés ici (règle DA). Easing signature du projet : `[0.22, 1, 0.36, 1]` (ease-out doux) ; clip-paths en `[0.76, 0, 0.24, 1]` ; pops élastiques en `[0.34, 1.56, 0.64, 1]`.

| Variant | États | Détail |
|---|---|---|
| `fadeIn` | hidden/visible | opacity, 0.5s easeOut |
| `slideUp` | hidden/visible | `y:32→0`, 0.6s |
| `slideRight` / `slideLeft` | hidden/visible | `x:∓24→0`, 0.5s |
| `clipReveal` | hidden/visible | `inset(100%…)`→`inset(0…)`, 0.8s (bas→haut) |
| `clipRevealH` | hidden/visible | clip horizontal gauche→droite, 0.7s |
| `scaleIn` | hidden/visible | `scale:0.92→1`, 0.5s |
| `staggerContainer` | hidden/visible | `staggerChildren 0.1`, `delayChildren 0.1` |
| `staggerContainerFast` | hidden/visible | `staggerChildren 0.06`, `delayChildren 0.05` |
| `pageTransition` | initial/animate/exit | `y:12→0→-8` ; utilisé par `PageTransitions` |
| `skillBarFill` | hidden/visible | `scaleX:0→1 originX:0`, 0.9s |
| `cardHover` | rest/hover | `scale:1→1.02`, 0.3s |
| `popIn` | hidden/visible | `scale:0.8→1`, élastique |
| `marqueeItem` | hidden/visible | `x:-16→0` (interne Marquee) |
| `overlayFade` | hidden/visible/exit | backdrop |
| `modalSlideUp` | hidden/visible/exit | `y:40→0`, `scale:0.97→1` |

**Page transitions** ([components/motion/PageTransitions.tsx](components/motion/PageTransitions.tsx)) : `AnimatePresence mode="wait" initial={false}`, `motion.div key={pathname}` enfant direct (sinon l'`exit` ne se résout pas sous `mode="wait"`).

### 4.2 Classes CSS d'animation ([app/globals.css](app/globals.css))
| Classe | Effet | Tokens / notes |
|---|---|---|
| `.card-shine` (+`::before`) | Reflet diagonal balayant au hover (`translateX -100% → 100%`, 0.55s) | `color-mix(var(--accent) 8%)`. Requiert `overflow-hidden`. `will-change` uniquement via `::before`. |
| `.pill-glow` (+`:hover`) | Halo accent autour d'un badge | box-shadow en `color-mix(var(--accent))`, 0.25s |
| `.bg-grid` | Grille de fond `60px` | double `linear-gradient` `color-mix(var(--accent) 3%)` |
| `.blob-ambient` | Halo flou en dérive lente (`blur(80px)`, `blob-drift` 12s alternate) | couleur/taille posées à l'usage. **Coupé sous `prefers-reduced-motion`** |
| `.eyebrow-label` (+`::after`) | Label mono numéroté + trait | `--font-mono`, accent |
| `.arch-node` / `.highlight` / `.arch-arrow` | Nœuds d'architecture | surface + border, highlight accent |
| `.feat-card` (+`:hover`) | Carte feature, border accent au hover | surface + border |
| `.stack-item` (+`:hover`) | Barre latérale accent + `bg-surface2` au hover | `border-left 2px transparent → accent` |
| `.avatar-card` / `.avatar-badge` / `.soon` | Vignette + pastille statut | badge accent (déf.) / `soon` neutre |
| `.section-divider` | `border-top: 1px var(--border)` | — |
| `.corner-tl/tr/bl/br` | Coins/brackets décoratifs `16px` | `color-mix(var(--accent) 25%)`. Parent `position:relative`. |
| `.timeline-item` / `.timeline-year` | Ligne d'historique | année `--font-mono` accent |
| `.process-number` | Gros numéro contour (`-webkit-text-stroke`) | `4rem`, `color:transparent`, stroke accent 15% |
| `.reveal-fallback` | **Escape hatch** anti-FOUC : force `opacity:1`/`transform:none` `!important` | opt-in seulement, jamais global |

### 4.3 Hooks reveal disponibles (`hooks/`)
Tous basés sur Framer Motion `useInView` (les `IntersectionObserver` natifs cassent sous Lenis). Tous respectent `prefers-reduced-motion` (révèlent immédiatement) et `once:true` par défaut.

| Hook | Rôle | Options |
|---|---|---|
| `useReveal` | Fade-up unifié sur un élément | `once` (true), `amount` (0.1), `delay` (0ms), `y` (25px). Transition `0.9s cubic-bezier(0.25,0.46,0.45,0.94)`. |
| `useStaggerReveal` | Reveal en cascade des enfants directs (ou `selector`) | `stagger` (80ms), `y` (20px), `selector`, `once`, `amount`. Ref **sur le conteneur**. |
| `useTextReveal` | Alias rétro-compat de `useReveal` (signature historique delay/y/once) | idem `useReveal` |
| `useImageReveal` | Alias rétro-compat de `useReveal` | idem `useReveal` |
| `useTilt` | Tilt 3D `perspective(900px)` au hover | `strength` (12). **Guard touch** ; `will-change` activé pendant l'interaction seulement ; retour 500ms `cubic-bezier(0.22,1,0.36,1)`. |

### 4.4 Smooth scroll — [components/motion/LenisProvider.tsx](components/motion/LenisProvider.tsx)
Singleton module-level (**une seule instance** dans toute l'app), monté dans le layout. `duration 1.2`, easing exponentiel, `smoothWheel`. Synchronise `ScrollTrigger.update` + `ScrollTrigger.refresh()`. Accès via `getLenis()`. Cleanup `cancelAnimationFrame` + `destroy()`. Fallback CSS `scroll-behavior: smooth` ([app/globals.css:90-92](app/globals.css#L90-L92)).

### 4.5 Règles motion (rappel CLAUDE.md)
- Guard touch **toujours** : `'ontouchstart' in window && window.innerWidth < 1024` → `return`.
- **Jamais** `pointer:coarse` pour la détection touch (non fiable / MetaMask).
- Cleanup obligatoire : GSAP `ctx.revert()`, observers `disconnect()`, rAF `cancelAnimationFrame`.
- ≤ 4 animations simultanées par page ; pas de `will-change` global ; pas d'anim continue de fond (sauf blob, coupé en reduced-motion).

---

## 5. CONVENTIONS DE NOMMAGE

### 5.1 Tailwind v4
- **Config 100 % CSS** : pas de `tailwind.config.ts`. Tout est dans [app/globals.css](app/globals.css) via `@import "tailwindcss"` + `@theme inline`.
- Les tokens `--color-*` / `--font-*` du bloc `@theme` génèrent automatiquement les utilitaires : `bg-bg`, `text-accent`, `border-border`, `font-display`, etc.
- Opacités via `/NN` (`bg-accent/10`), valeurs arbitraires via `[...]` (`text-[10px]`, `z-[9999]`).
- Composition des classes conditionnelles : tableau `.filter(Boolean).join(' ')` (voir Cursor, MagneticButton).

### 5.2 Classes CSS custom (`globals.css`)
- **kebab-case**, préfixe par famille fonctionnelle : `proj-section-grid`, `arch-node`, `feat-card`, `stack-item`, `avatar-card`/`avatar-badge`, `eyebrow-label`, `corner-tl…`, `timeline-item`/`timeline-year`, `process-number`, `card-shine`, `pill-glow`, `bg-grid`, `blob-ambient`, `section`, `section-divider`, `reveal-fallback`.
- Modificateurs en suffixe-mot : `.reverse`, `.highlight`, `.soon`.
- Keyframes : kebab-case (`blob-drift`).
- **Toujours** consommer les tokens (`var(--…)`) ou `color-mix(var(--accent) …)` — jamais une couleur littérale.

### 5.3 Code (rappel CLAUDE.md)
- `PascalCase` composants · `camelCase` utils/hooks (`useReveal`, `useTilt`) · `SCREAMING_SNAKE` constantes (`STATUS_STYLE`, `DIFFICULTY_STYLE`, `BAR_COLOR`, `PROJECTS`, `DURATION`).
- `data-cursor="hover|text|drag"` pour piloter le curseur custom.
- Hooks reveal : ref sur l'élément (ou le **conteneur** pour `useStaggerReveal`).

---

## 6. ANTI-PATTERNS INTERDITS (règles DA absolues)

```
❌ Couleur hardcodée — toujours les tokens (var(--…) / utilitaires Tailwind mappés)
❌ rgba() accent en dur — utiliser color-mix(in srgb, var(--accent) NN%, transparent)
❌ CSS inline arbitraire dans un composant (les transforms d'anim pilotées sont l'exception cadrée)
❌ Composant dupliqué
❌ pointer:coarse pour la détection touch — non fiable (MetaMask)
❌ URLs hardcodées (embeds dynamiques)
❌ any TypeScript (strict + noImplicitAny + strictNullChecks)
❌ console.log en production
❌ Magic strings → lib/constants.ts
❌ Business logic dans un composant UI
❌ God component > 150 lignes → décomposer
❌ Props drilling > 3 niveaux → Context
❌ will-change global — seulement sur l'élément actif, pendant l'interaction
❌ > 4 animations simultanées sur une même page
❌ Parallax lourd / animation continue de fond
❌ Oublier le cleanup : ctx.revert() (GSAP), disconnect() (Observer), cancelAnimationFrame (rAF), destroy() (Lenis)
❌ Oublier le guard touch sur toute interaction souris (tilt, magnetic, cursor, split)
❌ Instancier Lenis deux fois (singleton unique)
❌ Patch sur patch → rollback + recommencer
```

### Point d'attention actuel (dette connue)
`SkillBar` utilise `bg-blue-500` / `bg-purple-500` / `text-blue-400` / `text-purple-400` (palette Tailwind par défaut) au lieu de tokens DA. Seule entorse identifiée au système de tokens — à aligner sur `--blue` / un futur `--purple` si modifié.

---

*Généré le 2026-06-13 — reflète l'état du code à cette date. Toute évolution des tokens, variants ou composants doit être répercutée ici. Modifications du système validées par RYUU (voir CLAUDE.md).*