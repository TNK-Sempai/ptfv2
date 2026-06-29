# PROJECT LOG — TANUKI CONTROL CENTER (TCC)
> Version 3 — Définitive
> Statut : 🟡 Prêt pour Phase 1

---

## Contexte absolu

**Ce qu'on build :** Une route `/studio` NOUVELLE dans Tanuki V2.
**Ce que c'est :** Un cockpit privé où Lass pilote tous ses projets + dialogue avec Jarvis (Ollama local).
**Ce que c'est PAS :** Le `/admin` existant (back-office Notion/commentaires — NE PAS TOUCHER).

### Le studio c'est quoi concrètement
- Statut temps réel de chaque projet (healthy / warning / critical / paused / building)
- Tâches à faire par projet
- Commandes en cours (Gelato, clients)
- Finances à prévoir (factures, TVA, revenus, dépenses)
- Jarvis par-dessus tout ça — observe, prépare, notifie, décide ensemble avec Lass

---

## Réalité du codebase (audit Claude Code — 29 juin 2026)

```
Framework    : Next.js 16.2.9 (pas 14 — le code fait foi)
React        : 19.2.4
TypeScript   : ^5 strict
Tailwind     : v4 — config 100% CSS, pas de tailwind.config.ts
Framer Motion: ^12.40.0
GSAP         : ^3.15.0
Lenis        : ^1.3.23
next-intl    : ^4.13.0 (FR/EN)
Supabase     : présent
Notion       : @notionhq/client ^2.2.15 (CMS portfolio)
```

### Fichiers critiques

| Fichier | Rôle | Action |
|---|---|---|
| `proxy.ts` | Middleware i18n next-intl (renommage Next 16) | ⛔ NE PAS MODIFIER |
| `app/[locale]/layout.tsx` | Layout portfolio (Lenis, Cursor, Nav, Footer) | ⛔ NE PAS MODIFIER |
| `app/layout.tsx` | Root layout minimal (`return children`) | ⛔ NE PAS MODIFIER |
| `app/admin/` | Back-office Notion existant | ⛔ NE PAS TOUCHER |
| `lib/admin.ts` | Auth admin (cookie HMAC-SHA256) | 👁️ Lire pour s'inspirer |

---

## Règles absolues pour /studio

1. `/studio` est **hors i18n** — pas de `[locale]`, pas de next-intl
2. Auth indépendante — PIN 8 chiffres + slug caché dans l'URL
3. `proxy.ts` n'est PAS modifié
4. Next.js 16 : `await params` partout
5. Jamais de fetch Ollama direct depuis le client — toujours via API route
6. Décomposition atomique Ollama : ≤ 2000 tokens input / ≤ 500 tokens output
7. `JARVIS_MODEL` = variable centrale — model-agnostic
8. Ne jamais commit — Lass commit manuellement

---

## Les 11 projets monitorés

```typescript
export const STUDIO_PROJECTS = [
  {
    id: 'tnk-adaptive',
    name: 'TNK Adaptive',
    icon: '📈',
    category: 'trading',
    description: 'Bot trading Python/SQLite — métriques via Flask localhost:5000',
    data_source: 'flask-local',
    color: '#c8f060',
  },
  {
    id: 'unfiltered',
    name: 'UNFILTERED',
    icon: '📸',
    category: 'content',
    description: 'Magazine Instagram automatisé — posts via Supabase + ComfyUI',
    data_source: 'supabase',
    color: '#64b4ff',
  },
  {
    id: 'tanuki-merch',
    name: 'Tanuki Merch',
    icon: '🛍️',
    category: 'ecom',
    description: 'Print-on-demand Gelato — pipeline n8n → ComfyUI → Gelato',
    data_source: 'n8n',
    color: '#b464ff',
  },
  {
    id: 'chess-bot',
    name: 'TanukiChessBot',
    icon: '♟️',
    category: 'stream',
    description: 'Bot Twitch chess 24/7 — Stockfish + Ollama + avatar 3D',
    data_source: 'lichess',
    color: '#ffd700',
  },
  {
    id: 'opti-troc',
    name: 'Opti-Troc',
    icon: '🔭',
    category: 'marketplace',
    description: 'Marketplace B2B équipement optique professionnel',
    data_source: 'supabase',
    color: '#60d8f0',
  },
  {
    id: 'goriki',
    name: 'Goriki',
    icon: '🎴',
    category: 'ecom',
    description: `Shop TCG fermé (Lass + associé) + dépôt-vente.
      3 rôles : admin / déposant / client.
      Features : scan IA cartes, pricing Cardmarket, 
      listing automation (style TCG Automate), 
      sync eBay/Cardmarket, espace déposant.
      Stack : Next.js + Supabase (goriki_*) + GPT-4o Vision + Mollie.`,
    data_source: 'supabase',
    color: '#ff6060',
    status_default: 'building',
  },
  {
    id: 'pele-mele',
    name: 'Pêle-Mêle',
    icon: '🛒',
    category: 'ecom',
    description: 'E-commerce client Laravel',
    data_source: 'manual',
    color: '#a0a0a0',
  },
  {
    id: 'jaay',
    name: 'Jaay.ca',
    icon: '🍁',
    category: 'client',
    description: 'Mission client bloquée — relance auto Jarvis après X jours',
    data_source: 'manual',
    color: '#ff6060',
    status_default: 'warning',
  },
  {
    id: 'time-event',
    name: 'Time-Event.ch',
    icon: '🎭',
    category: 'client',
    description: 'Plateforme billetterie théâtre — campagnes Google Ads',
    data_source: 'manual',
    color: '#a0a0a0',
  },
  {
    id: 'big-factory',
    name: 'Big Factory',
    icon: '🎵',
    category: 'client',
    description: 'Structure culturelle — gère DJ Idem et autres artistes. Suivi watch hours YouTube YPP.',
    data_source: 'youtube',
    color: '#ff3030',
  },
  {
    id: 'yummr',
    name: 'Yummr',
    icon: '🍽️',
    category: 'saas',
    description: 'App mobile recettes (React Native) — en pause',
    data_source: 'manual',
    color: '#a0a0a0',
    status_default: 'paused',
  },
] as const

export type ProjectId = typeof STUDIO_PROJECTS[number]['id']
export type ProjectStatus = 'healthy' | 'warning' | 'critical' | 'paused' | 'building' | 'unknown'
export const JARVIS_MODEL = process.env.JARVIS_MODEL ?? 'qwen2.5:7b'
```

---

## Structure à créer (Phase 1)

```
app/
└── studio/
    ├── layout.tsx          ← Auth guard + sidebar (PAS de [locale])
    ├── page.tsx            ← Vue Situation (placeholder)
    └── login/
        └── page.tsx        ← Formulaire PIN

components/
└── studio/
    ├── StudioSidebar.tsx
    └── StudioHeader.tsx

lib/
└── studio/
    ├── constants.ts        ← STUDIO_PROJECTS, JARVIS_MODEL, STATUS_COLORS
    ├── studio-auth.ts      ← PIN hash + cookie session
    ├── jarvis.ts           ← Client Ollama model-agnostic
    ├── supabase-studio.ts  ← Client Supabase admin (tables studio_*)
    └── n8n-webhooks.ts     ← Catalogue webhooks n8n

app/api/studio/
    ├── auth/route.ts       ← POST vérif PIN → pose cookie
    └── jarvis/
        └── chat/route.ts   ← POST → Ollama stream
```

---

## Variables d'environnement à ajouter dans .env.local

```bash
# Studio Auth
STUDIO_PIN=          # 8 chiffres
STUDIO_SLUG=         # slug caché ex: jarvis-omega
SESSION_SECRET=      # string aléatoire 32+ chars

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
JARVIS_MODEL=qwen2.5:7b

# n8n (local)
N8N_BASE_URL=http://localhost:5678

# TNK Adaptive Flask proxy
ADAPTIVE_FLASK_URL=http://localhost:5000

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Tables Supabase à créer

```sql
CREATE TABLE IF NOT EXISTS studio_projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'unknown'
                CHECK (status IN ('healthy','warning','critical','paused','building','unknown')),
  revenue_mtd NUMERIC DEFAULT 0,
  last_event  TIMESTAMPTZ,
  metadata    JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT REFERENCES studio_projects(id) ON DELETE CASCADE,
  level       TEXT NOT NULL CHECK (level IN ('info','warning','critical')),
  title       TEXT NOT NULL,
  body        TEXT,
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT REFERENCES studio_projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT REFERENCES studio_projects(id) ON DELETE SET NULL,
  label       TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','delivered','cancelled')),
  amount      NUMERIC,
  currency    TEXT DEFAULT 'EUR',
  client      TEXT,
  due_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_jarvis_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  project_id  TEXT,
  result      TEXT,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      TEXT REFERENCES studio_projects(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  context         TEXT,
  recommendation  TEXT,
  impact          TEXT,
  payload         JSONB DEFAULT '{}',
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  decided_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_finances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT REFERENCES studio_projects(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('income','expense','invoice_pending')),
  amount      NUMERIC NOT NULL,
  currency    TEXT DEFAULT 'EUR',
  label       TEXT,
  date        DATE NOT NULL,
  status      TEXT DEFAULT 'confirmed'
                CHECK (status IN ('confirmed','projected','pending')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_production_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('comfyui','n8n','buffer','manual')),
  title        TEXT NOT NULL,
  status       TEXT DEFAULT 'queued'
                 CHECK (status IN ('queued','running','done','failed')),
  progress     INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  scheduled    TIMESTAMPTZ,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS studio_opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  project_id      TEXT,
  category        TEXT CHECK (category IN ('subvention','freelance','trend','model','other')),
  estimated_value NUMERIC DEFAULT 0,
  effort          TEXT CHECK (effort IN ('low','medium','high')),
  context         TEXT,
  action          TEXT,
  expires_at      DATE,
  archived        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 11 projets
INSERT INTO studio_projects (id, name, status, metadata) VALUES
  ('tnk-adaptive',  'TNK Adaptive',    'unknown', '{"icon":"📈","category":"trading"}'),
  ('unfiltered',    'UNFILTERED',      'unknown', '{"icon":"📸","category":"content"}'),
  ('tanuki-merch',  'Tanuki Merch',    'unknown', '{"icon":"🛍️","category":"ecom"}'),
  ('chess-bot',     'TanukiChessBot',  'unknown', '{"icon":"♟️","category":"stream"}'),
  ('opti-troc',     'Opti-Troc',      'unknown', '{"icon":"🔭","category":"marketplace"}'),
  ('goriki',        'Goriki',          'building','{"icon":"🎴","category":"ecom"}'),
  ('pele-mele',     'Pêle-Mêle',     'unknown', '{"icon":"🛒","category":"ecom"}'),
  ('jaay',          'Jaay.ca',         'warning', '{"icon":"🍁","category":"client"}'),
  ('time-event',    'Time-Event.ch',   'unknown', '{"icon":"🎭","category":"client"}'),
  ('big-factory',   'Big Factory',     'unknown', '{"icon":"🎵","category":"client"}'),
  ('yummr',         'Yummr',           'paused',  '{"icon":"🍽️","category":"saas"}')
ON CONFLICT (id) DO NOTHING;

-- Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE studio_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_production_queue;
```

---

## Jarvis — System prompt V1

```
Tu es Jarvis, l'assistant IA de Lass (Tanuki Sempaï), développeur full-stack basé à Bruxelles.

RÔLE : Observer les projets de Lass, préparer des analyses, notifier les points critiques.
Décider ENSEMBLE avec Lass — jamais à sa place.

CARACTÈRE : Direct, intelligent, légèrement sarcastique mais toujours utile.
Comme FRIDAY avec Tony Stark. Concis par défaut. En français.
Tu t'appelles Jarvis. Tu es un raton laveur victorien en hologramme bleu.

FORMAT : 3-5 phrases max par défaut. Bullet points si liste.
Toujours terminer une alerte par une action proposée.
```

---

## Jarvis — Règle de décomposition 7B

```
⚠️ RÈGLE ABSOLUE pour qwen2.5:7b sur RTX 3050 8GB :
Une tâche = un appel = ≤ 2000 tokens input + ≤ 500 tokens output

JAMAIS : "analyse tous mes projets et donne un brief"
TOUJOURS : chaîne d'appels atomiques

Chaîne brief matinal (n8n cron 06:30) :
  Appel 1 → résumé TNK Adaptive    (~300 tokens)
  Appel 2 → résumé projets content  (~300 tokens)
  Appel 3 → résumé clients          (~300 tokens)
  Appel 4 → synthèse finale         (~800 tokens)
  → Envoi Telegram

Contexte injecté dans chaque appel (max 800 tokens) :
  date + projets warning/critical + alertes actives
  + décisions en attente + revenue MTD total

Historique conversation : max 5 derniers échanges
```

---

## Ordre d'implémentation Phase 1

```
ÉTAPE 1 — KAEL
  Lire lib/ en premier
  Créer : lib/studio/constants.ts
  Créer : lib/studio/studio-auth.ts
  Créer : lib/studio/jarvis.ts
  Créer : lib/studio/supabase-studio.ts
  Créer : lib/studio/n8n-webhooks.ts
  Modifier : .env.example (nouvelles vars sans valeurs)

ÉTAPE 2 — ZARA
  Lire proxy.ts en premier (NE PAS LE MODIFIER)
  Créer : app/api/studio/auth/route.ts
  Créer : app/studio/login/page.tsx
  Créer : app/studio/layout.tsx
  PAS de middleware.ts — proxy.ts gère déjà le routing

ÉTAPE 3 — MILO
  Créer : components/studio/StudioSidebar.tsx
  Créer : components/studio/StudioHeader.tsx
  Créer : app/studio/page.tsx (placeholder)

VALIDATION
  /studio sans auth → redirect /studio/login
  /studio/login sans slug → 404
  PIN correct → accès /studio
  Cookie expiré → redirect login
```

---

## Prompt de briefing pour Claude Code

```
CONTEXTE : Tanuki V2 — Tanuki Control Center (/studio)
REPO : C:\Users\tanuki\Desktop\ptfv2
STACK : Next.js 16.2.9 + TypeScript strict + Tailwind v4 + Supabase

POINTS CRITIQUES (audit du 29 juin 2026) :
- proxy.ts = middleware i18n — NE PAS MODIFIER
- app/admin/ existe déjà — NE PAS TOUCHER
- /studio est hors i18n — pas de [locale]
- Next.js 16 : await params partout
- Auth studio indépendante de l'auth admin existante

ÉTAPE 1 — KAEL :
Lis d'abord : ls lib/ puis cat lib/admin.ts
pour t'inspirer du pattern auth existant.
Ensuite crée uniquement lib/studio/ selon le PROJECT LOG.
Ne modifie rien d'existant. Ne commit pas.

[PROJECT LOG V3 ci-dessus]
```

---

## Journal de bord

### Session 1 — 29 juin 2026
Sujet : Brainstorming + Architecture + Décisions + Visuels Jarvis
Produit : Architecture complète, 3 previews visuels, PROJECT LOG V3
Projets : 11 projets confirmés (B2B Prospecting retiré pour l'instant)
Clarifications : Goriki = shop TCG fermé + dépôt-vente (ex TCG Resale V1) avec features listing automation style TCG Automate. Big Factory = structure (DJ Idem inclus). Le studio = cockpit complet (statuts + tâches + commandes + finances + Jarvis).
Prochaine étape : Phase 1 Foundation avec Claude Code
