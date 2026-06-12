# KIT DE DÉMARRAGE — Portfolio Tanuki v2 + 1001 Widgets
> Généré par Pythagore | Session Forge #1 | Juin 2026
> **Coller en tête de toute nouvelle conversation sur ce projet.**
> **Activer les skills : `nextjs-multiagent` + `all-for-one` dès l'ouverture.**

---

## Brief Fondateur
**Objectif** : Reconstruire tanuki-corporation.com from scratch.
Next.js/TypeScript/Vercel. Niveau visuel Awwwards. Outil de vente pour dev senior
+ blog communautaire "1001 Widgets" pour devs juniors FR.
**Critère de succès** : Un recruteur/client comprend le niveau en 3 secondes et veut contacter.
Un dev junior trouve de la valeur et revient.
**Contrainte** : L'actuel reste en ligne jusqu'au go-live du nouveau.

---

## Décisions validées — DÉFINITIVES

| # | Décision |
|---|---|
| 1 | Stack : Next.js 14+ App Router + TypeScript strict |
| 2 | Deploy : Vercel + ISR revalidate 3600 |
| 3 | Style : Tailwind CSS + tokens DA dans globals.css |
| 4 | Animation : Framer Motion + GSAP + SplitText (gratuit 2024) + Lenis (MIT) |
| 5 | CMS : Notion API — pipeline n8n futur |
| 6 | Auth admin : cookie signé + env ADMIN_PASSWORD — pas de service tiers |
| 7 | Commentaires : anonymes (prénom uniquement) — modération Notion |
| 8 | Votes widgets : anti-spam IP hashée SHA-256 — stocké Notion |
| 9 | i18n : FR/EN sur TOUTES les pages — next-intl ou next-i18next |
| 10 | Nav : dropdown hover sur "Projets" + page /projects dédiée |
| 11 | 5 projets en avant — 8+ en réserve |
| 12 | 1001 Widgets : /widgets/ même domaine, layout distinct |
| 13 | WebGL/Three.js : hors scope v1 — skill séparé futur |
| 14 | Claude Code prend en charge l'intégralité de l'exécution |

---

## Stack technique complète

| Couche | Technologie | Raison |
|---|---|---|
| Framework | Next.js 14+ App Router | SSR, ISR, routing, middleware |
| Language | TypeScript strict | Pas de `any`, pas de `@ts-ignore` |
| Style | Tailwind CSS | Tokens centralisés, mobile-first |
| Animation principale | Framer Motion | Page transitions, variants réutilisables |
| Animation avancée | GSAP + SplitText | Scramble, ScrollTrigger, timeline |
| Smooth scroll | Lenis | Provider global dans layout.tsx |
| CMS | Notion API | Projets, widgets, commentaires, votes |
| i18n | next-intl | FR/EN, détection browser, localStorage |
| Deploy | Vercel | GitHub integration, preview branches |
| Auth admin | Cookie signé + middleware | Route /admin/* protégée |
| Automatisation future | n8n | Pipeline Notion → social → newsletter |

---

## Architecture complète

```
app/
├── [locale]/                         ← i18n wrapper (fr / en)
│   ├── layout.tsx                    ← LenisProvider, CursorProvider, Nav, Footer, Noise
│   ├── page.tsx                      ← Hero + Marquee + teaser 1001 Widgets
│   ├── about/page.tsx
│   ├── skills/page.tsx
│   ├── contact/page.tsx
│   │
│   ├── projects/
│   │   ├── page.tsx                  ← Les 5 projets — chacun sa section + résumé
│   │   ├── tanukichessbot/page.tsx
│   │   ├── opti-troc/page.tsx
│   │   ├── yummr/page.tsx
│   │   ├── big-factory/page.tsx
│   │   └── time-event/page.tsx
│   │
│   ├── widgets/
│   │   ├── layout.tsx                ← Layout propre au blog
│   │   ├── page.tsx                  ← Annuaire : filtres + cards animées + vote suggestions
│   │   ├── suggest/page.tsx          ← "Je veux coder ça" + vote
│   │   └── [slug]/page.tsx           ← Demo + tuto + upgrade + CSS playground + commentaires
│   │
│   └── admin/
│       ├── layout.tsx                ← Middleware auth cookie
│       ├── page.tsx                  ← Dashboard global
│       ├── comments/page.tsx         ← Modération (approuver / spam / supprimer)
│       ├── widgets/page.tsx          ← Gestion widgets + votes suggestions
│       └── articles/page.tsx         ← Créer/éditer articles "Les Fondations"

components/
├── ui/
│   ├── Cursor.tsx                    ← Dot + ring + morphing contextuel
│   ├── MagneticButton.tsx            ← Attraction dans rayon 80px
│   ├── SplitText.tsx                 ← Wrapper GSAP SplitText
│   ├── CountUp.tsx                   ← Chiffres animés au scroll
│   └── NoiseOverlay.tsx              ← Texture grain fixe
├── blocks/
│   ├── Nav.tsx                       ← Dropdown hover Projets + mobile menu + i18n switcher
│   ├── Footer.tsx
│   ├── Hero.tsx                      ← Scramble title + clip-path reveal
│   ├── ProjectCard.tsx               ← Tilt 3D + reflet lumineux au hover
│   ├── SkillBar.tsx                  ← Remplissage élastique + CountUp synchronisé
│   └── WidgetCard.tsx                ← Preview live en loop + badge difficulté
├── widgets/
│   ├── WidgetShell.tsx               ← Wrapper complet : demo + code + CSS editor + comments
│   ├── CssPlayground.tsx             ← Éditeur CSS live avec custom properties
│   ├── CommentForm.tsx               ← Prénom + message + honeypot + rate limit
│   └── CommentList.tsx               ← Commentaires approuvés uniquement
└── motion/
    └── variants.ts                   ← Tous les variants Framer Motion centralisés

lib/
├── notion.ts                         ← Client Notion (projects, widgets, comments, votes)
├── notion-types.ts                   ← Types TypeScript des databases Notion
├── admin.ts                          ← Vérification cookie signé
├── rate-limit.ts                     ← 3 commentaires / IP / heure
├── security.ts                       ← Sanitize, honeypot, escape
├── i18n.ts                           ← Config next-intl
├── constants.ts                      ← Tokens DA, config globale
└── types.ts                          ← Project, Widget, Comment, Vote

middleware.ts                         ← Protection /admin/* + redirect i18n

messages/
├── fr.json                           ← Toutes les clés FR
└── en.json                           ← Toutes les clés EN
```

---

## Navigation — Structure exacte

```
TANUKI [logo]
├── À propos
├── Projets ▾  [dropdown hover]
│   ├── TanukiChessBot
│   ├── Opti-Troc
│   ├── Yummr
│   ├── Big Factory
│   └── Time-Event.ch
├── Skills
├── 1001 Widgets
├── Contact
└── [FR / EN] [switcher]
```

**Page /projects** : chaque projet a sa propre section scrollable avec :
hero image | tags | résumé court | stats clés | CTA "Voir le projet"
Ordre : TanukiChessBot → Opti-Troc → Yummr → Big Factory → Time-Event

---

## Databases Notion

### Projects
title | slug | description | longDescription (Rich Text) | tags (Multi-select)
year | status (live/soon/wip) | featured (Checkbox) | externalUrl | coverImage | badge

### Widgets
title | slug | type (widget/article/fondations) | languages (Multi-select)
difficulty (Débutant/Intermédiaire/Avancé) | description | demoComponent
status (published/draft) | votes | views | publishedAt

### Comments
widgetSlug | prenom | message | ipHash (SHA-256) | status (pending/approved/spam) | createdAt

### Suggestions
title | description | votes | status (pending/planned/done) | suggestedBy | voters (JSON IP hashées)

### Skills
skill | category (Frontend/Backend/Marketing/Outils) | level (0-100) | sublabel | color

---

## i18n — Règles
- **next-intl** — toutes les pages dans app/[locale]/
- Clés dans messages/fr.json + messages/en.json
- Détection automatique navigateur + fallback FR
- Switcher FR/EN dans la Nav (desktop + mobile)
- Switcher persistent localStorage
- Éléments dynamiques Lichess API / Notion : non traduits (données live)
- Métadonnées SEO : traduites (title, description, og:*)

---

## Sécurité commentaires
- Prénom : max 50 chars | Message : max 1000 chars
- htmlspecialchars côté serveur (API route Next.js)
- Honeypot field invisible — rejet silencieux si rempli
- Rate limit : 3 commentaires / IP / heure
- IP stockée SHA-256 — jamais en clair
- Statut par défaut : "pending" — visible après approbation admin
- Modération dans Notion directement (interface familière)

---

## Design System DA — Tokens (inchangés)

```css
--bg:       #09090e
--surface:  #0e0e15
--surface2: #13131c
--border:   rgba(255,255,255,0.06)
--text:     #ede8df
--muted:    #6b665f
--muted2:   #9c9590
--accent:   #c8f060

--font-display: 'Bebas Neue'
--font-serif:   'DM Serif Display'
--font-mono:    'DM Mono'
--font-body:    'Instrument Sans'
```

Composants signature à implémenter :
Cursor (dot + ring + morphing) | NoiseOverlay | Nav scrolled + dropdown
Eyebrow labels numérotés | Corner brackets | Blobs ambients | Marquee
Reveal au scroll (clip-path) | Skill bars animées | Magnetic buttons

---

## 5 Moments Awwwards à implémenter

| Moment | Description |
|---|---|
| Arrivée | Loading 500ms → logo TANUKI se dessine → clip-path reveal → SplitText scramble SEMPAÏ |
| Scroll | Lenis inertiel → masking vertical titres → parallax images cards |
| Hover | Tilt 3D cards + reflet lumineux / magnetic buttons / glow pulse tech pills |
| Page projet | Hero stats live + avatars 3D modal cinématique |
| 1001 Widgets | Cards avec previews vivantes en loop + filtres temps réel |

---

## Skills à activer

### Skills existants — charger en tête de session
```
nextjs-multiagent  →  agents RYUU/KAEL/ZARA/MILO/NOVA/REX
all-for-one        →  conseil Vegapunk pour décisions stratégiques
```

### Skills à forger — AVANT le premier composant

**`motion-system`** (MILO + NOVA lead, ZARA support)
- Setup Lenis dans Next.js App Router (provider, useEffect, cleanup)
- Variants Framer Motion : fade, slideUp, stagger, clipPath, scale, pageTransition
- GSAP SplitText : reveal par ligne, par caractère, scramble effect
- GSAP ScrollTrigger : patterns courants + cleanup obligatoire
- Cursor.tsx complet : dot + ring + morphing contextuel
- MagneticButton.tsx : calcul distance + transform + guard touch
- Hook useTilt : rotateX/Y selon position curseur + guard touch
- Guards touch OBLIGATOIRES : `('ontouchstart' in window) && window.innerWidth < 1024`
- Rules performance : will-change limité, disconnect() observers, rAF
- Interdits : parallax lourd, animations background continues, +4 animations projet

**`widget-shell`** (ZARA lead, MILO support)
- Structure page /widgets/[slug] : layout split desktop / vertical mobile
- WidgetShell.tsx : demo live + tuto narratif + code + upgrade + CSS editor + comments
- CssPlayground.tsx : éditeur live CSS custom properties + preview temps réel
- Syntax highlighting : Shiki (server-side, zéro JS client)
- CommentForm.tsx : prénom + message + honeypot + validation + rate limit
- Push Notion API (route /api/comments/create)
- SEO metadata par widget : generateMetadata Next.js
- Schema Notion widget complet

---

## Anti-patterns interdits (audit de l'existant)
- ❌ CSS inline dans une page
- ❌ Composant dupliqué — un composant, un fichier
- ❌ `pointer:coarse` pour détection touch → toujours `ontouchstart + innerWidth < 1024`
- ❌ URLs hardcodées pour embeds tiers → dynamiques
- ❌ Fonctions appelées mais non définies
- ❌ Animations continues en background
- ❌ `will-change` sur tout — seulement éléments actifs
- ❌ `any` TypeScript — types stricts partout
- ❌ `console.log` en production
- ❌ Magic strings — toujours dans constants.ts
- ❌ Business logic dans les composants UI

---

## Projets

### En avant (v1)
| # | Projet | Stack | Statut |
|---|---|---|---|
| 1 | TanukiChessBot | Python / IA / Twitch / Lichess | Live 24/7 |
| 2 | Opti-Troc | Next.js / B2B / Marketplace | Live |
| 3 | Yummr | React Native / App Mobile | En dev |
| 4 | Big Factory | Next.js / TypeScript / shadcn/ui | Live |
| 5 | Time-Event.ch | Web / Google Ads / Billetterie | Live |

### En réserve (ajout progressif)
TI Préformation | TI Paris | TNK Adaptive | Géolocalisation
Calculatrice Monique | Compteur JS | Palette | + autres

### Widgets 1001 (existants à migrer)
Compteur JS | Calculatrice Monique | Générateur de palettes | Géolocalisation

---

## 1001 Widgets — Contenu initial

### Section "Les Fondations" (articles sans IA)
- Lire une erreur console (vraiment)
- Structurer son HTML avant de coder
- Pourquoi ton CSS ne marche pas
- Démarrer un projet de A à Z sans copier-coller
- Comprendre le DOM avant de toucher à JS

### Mécaniques communautaires
- Vote "Je veux coder ça" → seuil 10 votes → widget "planned"
- Commentaires par widget (prénom uniquement, modération Notion)
- Suggestions de widgets par la communauté

---

## Prochaines étapes — Ordre strict

```
1. [ ] Forger skill motion-system
2. [ ] Forger skill widget-shell
3. [ ] Init Next.js + config Tailwind + tokens DA + next-intl
4. [ ] Créer les 5 databases Notion + clés API
5. [ ] middleware.ts (i18n redirect + admin protection)
6. [ ] layout.tsx — LenisProvider + CursorProvider + NoiseOverlay + Nav + Footer
7. [ ] page.tsx — Hero (scramble + clip-path) + Marquee
8. [ ] /projects/page.tsx — 5 sections + dropdown nav
9. [ ] /projects/[slug] — 5 pages projets
10. [ ] /skills + /about + /contact
11. [ ] /widgets/page.tsx — annuaire vivant
12. [ ] /widgets/[slug]/page.tsx — WidgetShell complet
13. [ ] /widgets/suggest — votes communauté
14. [ ] /admin — dashboard + modération
15. [ ] Tests i18n FR/EN sur toutes les pages
16. [ ] Deploy Vercel + config domaine
```

---

*Kit généré par le conseil Vegapunk — Session Forge #1*
*Dr Vegapunk a tranché toutes les décisions ci-dessus.*
