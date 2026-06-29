# CLAUDE.md — Portfolio Tanuki v2
> Mémoire partagée de tous les agents Claude Code.
> Ce fichier est lu automatiquement par chaque instance au démarrage.
> Ne jamais modifier sans validation de RYUU.

---

## PROJET
Reconstruction complète du portfolio tanuki-corporation.com.
Next.js 16.2.9 (Turbopack) App Router + TypeScript + Tailwind + Framer Motion + GSAP + Lenis + Vercel + Notion CMS.
Niveau visuel Awwwards. Portfolio dev senior + blog "1001 Widgets" pour devs juniors FR.

---

## RÈGLE ABSOLUE — TOUS LES AGENTS
> "Ne touche qu'à ce qu'on t'a demandé de toucher."
> Un fichier hors périmètre = STOP + signal à RYUU. Jamais d'initiative non sollicitée.

---

## LES AGENTS

| Agent | Modèle | Rôle | Périmètre |
|---|---|---|---|
| **RYUU** | opus | Chef de projet | Orchestre, distribue, valide — ne code jamais |
| **KAEL** | opus | Architecte | app/ routing, middleware, providers, types globaux |
| **ZARA** | sonnet | Dev Senior | lib/, API routes, Notion, auth admin, i18n config |
| **MILO** | sonnet | Dev UI | components/blocks/, components/widgets/ |
| **NOVA** | sonnet | Dev CSS | globals.css, tailwind.config, components/ui/ |
| **REX** | haiku | Dev Fix | Bugs isolés uniquement, correction minimale |

### Signature obligatoire dans chaque réponse
```
[NOM — Rôle]
Fichiers modifiés : [liste exacte]
Fichiers NON touchés : [si risque de confusion]
```

### Périmètres stricts — AUCUN CROISEMENT

| Dossier/Fichier | Agent responsable | Autres agents |
|---|---|---|
| `app/` routing + layout | KAEL | ❌ |
| `middleware.ts` | KAEL | ❌ |
| `lib/` | ZARA | ❌ |
| `app/api/` | ZARA | ❌ |
| `messages/fr.json` + `messages/en.json` | ZARA | ❌ |
| `components/blocks/` | MILO | ❌ |
| `components/widgets/` | MILO | ❌ |
| `components/ui/` | NOVA | ❌ |
| `styles/globals.css` | NOVA | ❌ |
| `tailwind.config.ts` | NOVA | ❌ |
| `components/motion/variants.ts` | NOVA | ❌ |
| Bugs ponctuels | REX | ❌ |

---

## STACK TECHNIQUE

```
Next.js 16.2.9 (Turbopack)  App Router, TypeScript strict, pas de Pages Router
Tailwind CSS    tokens DA dans globals.css, mobile-first
Framer Motion   page transitions, variants centralisés dans variants.ts
GSAP            SplitText (gratuit), ScrollTrigger — cleanup obligatoire
Lenis           smooth scroll — provider global dans layout.tsx
next-intl       i18n FR/EN — app/[locale]/ wrapper
Notion API      CMS — projets, widgets, commentaires, votes
Vercel          deploy — ISR revalidate: 3600
```

---

## DESIGN SYSTEM — TOKENS DA

```css
/* globals.css — ne jamais hardcoder ces valeurs ailleurs */
--bg:       #09090e;
--surface:  #0e0e15;
--surface2: #13131c;
--border:   rgba(255,255,255,0.06);
--text:     #ede8df;
--muted:    #6b665f;
--muted2:   #9c9590;
--accent:   #c8f060;

--font-display: 'Bebas Neue', sans-serif;
--font-serif:   'DM Serif Display', serif;
--font-mono:    'DM Mono', monospace;
--font-body:    'Instrument Sans', sans-serif;
```

**Règle NOVA** : jamais de couleur hardcodée dans un composant.
Toujours les variables CSS ou les tokens Tailwind qui les mappent.

---

## ARCHITECTURE FICHIERS

```
portfoliov2/
├── CLAUDE.md                         ← CE FICHIER — ne pas modifier sans RYUU
│
├── app/
│   └── [locale]/                     ← i18n wrapper (fr / en)
│       ├── layout.tsx                ← LenisProvider + CursorProvider + Nav + Footer + Noise
│       ├── page.tsx                  ← Hero + Marquee + teaser 1001 Widgets
│       ├── about/page.tsx
│       ├── skills/page.tsx
│       ├── contact/page.tsx
│       ├── projects/
│       │   ├── page.tsx              ← 5 sections — chacune sa section scrollable
│       │   ├── tanukichessbot/page.tsx
│       │   ├── opti-troc/page.tsx
│       │   ├── yummr/page.tsx
│       │   ├── big-factory/page.tsx
│       │   └── time-event/page.tsx
│       ├── widgets/
│       │   ├── layout.tsx
│       │   ├── page.tsx              ← Annuaire vivant + filtres + vote suggestions
│       │   ├── suggest/page.tsx
│       │   └── [slug]/page.tsx
│       └── admin/
│           ├── layout.tsx            ← Auth middleware
│           ├── page.tsx
│           ├── comments/page.tsx
│           ├── widgets/page.tsx
│           └── articles/page.tsx
│
├── components/
│   ├── ui/                           ← NOVA
│   │   ├── Cursor.tsx
│   │   ├── MagneticButton.tsx
│   │   ├── SplitText.tsx
│   │   ├── CountUp.tsx
│   │   └── NoiseOverlay.tsx
│   ├── blocks/                       ← MILO
│   │   ├── Nav.tsx                   ← Dropdown hover Projets + i18n switcher
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── SkillBar.tsx
│   │   └── WidgetCard.tsx
│   ├── widgets/                      ← MILO
│   │   ├── WidgetShell.tsx
│   │   ├── CssPlayground.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentList.tsx
│   └── motion/                       ← NOVA
│       └── variants.ts               ← Tous les variants Framer Motion
│
├── lib/                              ← ZARA
│   ├── notion.ts
│   ├── notion-types.ts
│   ├── admin.ts
│   ├── rate-limit.ts
│   ├── security.ts
│   ├── i18n.ts
│   ├── constants.ts
│   └── types.ts
│
├── messages/                         ← ZARA
│   ├── fr.json
│   └── en.json
│
├── middleware.ts                      ← KAEL
├── tailwind.config.ts                 ← NOVA
└── styles/
    └── globals.css                    ← NOVA
```

---

## NAVIGATION — STRUCTURE EXACTE

```
TANUKI [logo]                         ← href="/"
├── À propos                          ← href="/about"
├── Projets ▾  [dropdown hover]
│   ├── TanukiChessBot                ← href="/projects/tanukichessbot"
│   ├── Opti-Troc                     ← href="/projects/opti-troc"
│   ├── Yummr                         ← href="/projects/yummr"
│   ├── Big Factory                   ← href="/projects/big-factory"
│   └── Time-Event.ch                 ← href="/projects/time-event"
├── Skills                            ← href="/skills"
├── 1001 Widgets                      ← href="/widgets"
├── Contact                           ← href="/contact"
└── [FR / EN]                         ← switcher i18n
```

---

## i18n — RÈGLES

- `next-intl` — toutes les pages dans `app/[locale]/`
- Locales : `fr` (défaut) + `en`
- Clés dans `messages/fr.json` + `messages/en.json`
- Détection automatique navigateur + fallback `fr`
- Switcher persistent `localStorage`
- Métadonnées SEO traduites (`generateMetadata`)
- Données dynamiques Notion/API : non traduites

---

## NOTION — DATABASES

### Projects
`title` `slug` `description` `longDescription` `tags` `year`
`status` (live/soon/wip) `featured` `externalUrl` `coverImage` `badge`

### Widgets
`title` `slug` `type` (widget/article/fondations) `languages` `difficulty`
`description` `demoComponent` `status` `votes` `views` `publishedAt`

### Comments
`widgetSlug` `prenom` `message` `ipHash` `status` (pending/approved/spam) `createdAt`

### Suggestions
`title` `description` `votes` `status` (pending/planned/done) `suggestedBy` `voters`

### Skills
`skill` `category` `level` (0-100) `sublabel` `color`

---

## SÉCURITÉ COMMENTAIRES

- Prénom max 50 chars — message max 1000 chars
- `htmlspecialchars` côté serveur (API route)
- Honeypot field invisible — rejet silencieux
- Rate limit : 3 commentaires / IP / heure
- IP stockée SHA-256 — jamais en clair
- Statut par défaut : `pending`
- Modération dans Notion

---

## ANIMATIONS — RÈGLES (motion-system)

### Autorisé
- Framer Motion variants depuis `components/motion/variants.ts`
- GSAP SplitText pour titres hero uniquement
- GSAP ScrollTrigger avec `cleanup()` obligatoire dans `useEffect`
- Lenis via provider global — jamais instancié deux fois
- Tilt 3D sur project cards — guard touch obligatoire
- Magnetic buttons — guard touch obligatoire

### Guard touch — TOUJOURS
```typescript
const isTouch = ('ontouchstart' in window) && window.innerWidth < 1024
if (isTouch) return // sortir avant toute animation souris
```

### Interdit
- `pointer:coarse` pour détection touch — non fiable (MetaMask)
- Animations continues en background
- `will-change` global — seulement sur éléments actifs
- Plus de 4 animations simultanées sur une même page
- Parallax lourd
- Oublier `disconnect()` sur IntersectionObserver

---

## ANTI-PATTERNS INTERDITS

```
❌ CSS inline dans un composant
❌ Couleur hardcodée — toujours les tokens
❌ Composant dupliqué
❌ pointer:coarse pour touch detection
❌ URLs hardcodées (embeds Twitch → dynamique)
❌ any TypeScript
❌ console.log en production
❌ Magic strings → constants.ts
❌ Business logic dans composants UI
❌ God component > 150 lignes → décomposer
❌ Props drilling > 3 niveaux → Context
❌ Patch sur patch → rollback + recommencer
```

---

## QUALITÉ CODE

```typescript
// TypeScript strict — tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

- 1 responsabilité par fichier
- Composant > 150 lignes → décomposer
- Pas de barrel exports sauf +5 composants
- PascalCase composants, camelCase utils, SCREAMING_SNAKE constants
- Commenter le non-évident uniquement

---

## WORKFLOW DE MODIFICATION — TOUS LES AGENTS

```
1. Lire ce CLAUDE.md
2. Identifier fichier exact + lignes concernées
3. Vérifier : "est-ce dans mon périmètre ?"
4. Si hors périmètre → signal à RYUU, ne pas toucher
5. Correction minimale — rien de plus
6. Vérifier effets de bord
7. Signaler les problèmes adjacents sans les corriger
```

---

## ÉTAPES DU PROJET — ORDRE STRICT

```
✅ 0. Init Next.js (fait)
✅ 1. Ce CLAUDE.md (fait)
⬜ 2. Config Tailwind + tokens DA dans globals.css        → NOVA
⬜ 3. next-intl setup + messages fr.json + en.json        → ZARA
⬜ 4. lib/types.ts + lib/constants.ts + lib/notion-types  → ZARA
⬜ 5. middleware.ts (i18n + admin protection)              → KAEL
⬜ 6. components/ui/ (Cursor, Noise, MagneticButton...)   → NOVA
⬜ 7. components/motion/variants.ts                        → NOVA
⬜ 8. app/[locale]/layout.tsx (providers + Nav + Footer)  → KAEL + MILO
⬜ 9. app/[locale]/page.tsx (Hero + Marquee)              → MILO
⬜ 10. /projects/page.tsx + 5 pages projets               → MILO + ZARA
⬜ 11. /skills + /about + /contact                        → MILO
⬜ 12. /widgets/page.tsx (annuaire vivant)                → MILO + ZARA
⬜ 13. /widgets/[slug]/page.tsx (WidgetShell)             → MILO + ZARA
⬜ 14. /admin (dashboard + modération)                    → ZARA + KAEL
⬜ 15. Tests i18n FR/EN toutes les pages                  → REX
⬜ 16. Deploy Vercel + config domaine                     → KAEL
```

---

## PROJETS EN AVANT (v1)

| # | Slug | Titre | Stack | Statut |
|---|---|---|---|---|
| 1 | tanukichessbot | TanukiChessBot | Python / IA / Twitch / Lichess | Live 24/7 |
| 2 | opti-troc | Opti-Troc | Next.js / B2B / Marketplace | Live |
| 3 | yummr | Yummr | React Native / App Mobile | En dev |
| 4 | big-factory | Big Factory | Next.js / TypeScript / shadcn/ui | Live |
| 5 | time-event | Time-Event.ch | Web / Google Ads / Billetterie | Live |

---

*Dernière mise à jour : Session Forge #1 — Juin 2026*
*Toute modification de ce fichier doit être validée par RYUU*
