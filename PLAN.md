<!-- /autoplan restore point: /Users/mrinoy/.gstack/projects/mrinoybanerjee-fit-together/main-autoplan-restore-20260409-153319.md -->
# FitTogether — Engineering Plan (Reviewed)

> Reviewed via `/autoplan` pipeline: CEO + Design + Eng + DX reviews complete.

## What We're Building

A couples fitness tracking web app showing both partners' health data side-by-side in real time. This is a personal gift for the user and their fiancée. Goal: a beautiful dashboard they'll open every morning — not another generic fitness tracker.

## Premises (confirmed)

1. Whoop (Partner 1) and Apple Watch via Terra (Partner 2) — no other devices at v1
2. Works fully with mock data out of the box — API keys optional
3. Dark theme: Partner 1 = purple, Partner 2 = rose/pink
4. Web app with mobile-responsive stacking (partners stack vertically on 375px)
5. JWT auth is lightweight — Whoop OAuth done server-side
6. "Demo Mode" badge shown when real device data is unavailable

## Scope (cherry-picked in CEO review)

**Core:** Partner cards, recovery rings, charts, mock data, Whoop + Terra integrations, auth, WebSocket

**Added in review:**
- ✅ Streak counter — consecutive days both partners hit goals (dashboard, Overview tab)
- ✅ Motivational messages — rotating daily message, header area
- ✅ Goal badges / milestones — personal records (best HRV, longest streak)

## Architecture

### System Diagram

```
Browser (React + Vite)
    │
    ├── REST /api/*  ─────────────────────────────────────┐
    │       │                                             │
    │   Express Router                                    │
    │       ├── POST /auth/login ──► JWT (24h)           │
    │       ├── GET  /api/health ──► 200 OK              │
    │       ├── /whoop/* (auth required)                  │
    │       │       └── WhoopService                      │
    │       │               ├── Whoop API v1 (live)       │
    │       │               │   [5min cache, refresh-on-401]
    │       │               └── Mock fallback (no token)  │
    │       ├── /terra/* (auth required)                  │
    │       │       └── TerraService                      │
    │       │               ├── Terra API v2 (live)       │
    │       │               │   [5min cache]              │
    │       │               └── Mock fallback (no key)    │
    │       └── /partners/summary ──► aggregates both    │
    │                               X-Data-Source: mock|live
    │                                                     │
    └── WebSocket ws://?token=JWT                        │
            │   [auth: verify JWT on upgrade]            │
            └── 30s timer ──► broadcast DATA_UPDATE ◄───┘
                              (uses cached data — no extra API calls)
```

### Tech Stack

**Frontend:**
- React 18 + Vite — fast dev, HMR
- Tailwind CSS — utility-first, dark theme
- shadcn/ui (Tabs, Progress, Avatar, Tooltip, Badge) — accessible primitives
- Recharts (ResponsiveContainer on all charts) — charts
- Framer Motion — animated entrances, stagger `children: 0.05s max`
- Lucide React — icons (not in colored circles — flat)
- React Router v6

**Backend:**
- Node.js + Express
- ws — WebSocket, JWT-authenticated upgrades
- axios — HTTP client with 5-min in-memory cache
- jsonwebtoken — JWT
- dotenv — env
- cors — explicit allowlist: `localhost:5173`, `localhost:3000`

**Root:**
- concurrently — `npm run dev` starts both frontend + backend

### In-memory Cache Design

```js
// cache.js
const cache = new Map(); // key → { data, expiresAt }
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function get(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function set(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}
```

Both WhoopService and TerraService use this. WebSocket broadcasts cached data (no extra API calls per broadcast).

## File Structure

```
fit-together/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # main layout, tabs
│   │   │   ├── Header.jsx           # sticky bar + motivational message
│   │   │   ├── PartnerCard.jsx      # partner summary + metrics
│   │   │   ├── RecoveryRing.jsx     # SVG ring (CSS stroke-dashoffset anim)
│   │   │   ├── StrainGauge.jsx      # semi-circle gauge
│   │   │   ├── MetricCard.jsx       # small stat tile (flat, no icon circles)
│   │   │   ├── ComparisonChart.jsx  # dual-line 14d recharts
│   │   │   ├── SleepChart.jsx       # grouped bar sleep stages
│   │   │   ├── HRVTrend.jsx         # area chart + optimal zone band
│   │   │   ├── WorkoutList.jsx      # recent workouts both partners
│   │   │   ├── StreakCounter.jsx    # streak display + milestone badges
│   │   │   └── ConnectionStatus.jsx # "Demo Mode" badge when mock
│   │   ├── pages/
│   │   │   ├── Login.jsx            # gradient bg + "Try Demo" button
│   │   │   └── Home.jsx             # dashboard wrapper
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js      # WS + reconnect + JWT
│   │   │   └── usePartnerData.js    # fetch /partners/summary + WS merge
│   │   ├── lib/
│   │   │   ├── api.js               # axios + JWT interceptor
│   │   │   ├── mockData.js          # REMOVED — backend is source of truth
│   │   │   └── utils.js             # cn(), formatDate, getRecoveryColor
│   │   ├── App.jsx                  # router + auth context
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind + CSS vars + Inter font
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # proxy /api → 3001, /ws → ws://3001
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /login; demo: demo@fittogether.com/demo123
│   │   │   ├── whoop.js             # /recovery /sleep /workouts /cycles
│   │   │   ├── terra.js             # /daily /sleep /workouts /hrv
│   │   │   └── partners.js          # /summary + X-Data-Source header
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verify
│   │   ├── services/
│   │   │   ├── whoopService.js      # Whoop v1 + cache + refresh-on-401
│   │   │   ├── terraService.js      # Terra v2 + cache
│   │   │   └── cache.js             # shared 5-min in-memory cache
│   │   ├── data/
│   │   │   └── mockData.js          # SINGLE source of mock data
│   │   ├── websocket/
│   │   │   └── wsServer.js          # JWT on upgrade, 30s broadcast from cache
│   │   └── index.js                 # Express setup + CORS + WS
│   ├── package.json
│   └── .env.example
├── package.json                     # root: concurrently dev script
├── CLAUDE.md
├── PLAN.md
├── README.md
└── .gitignore
```

## Key Architectural Decisions (from review)

| Decision | Choice | Reason |
|----------|--------|--------|
| Mock data location | Backend only (`data/mockData.js`) | Single source of truth, DRY |
| WebSocket auth | JWT as query param on upgrade | No unauth'd data exposure |
| API caching | 5-min in-memory Map | Stays under Terra free tier |
| Whoop token refresh | refresh-on-401 in service | Handles expiry transparently |
| CSS animations | `stroke-dashoffset` (not Framer Motion) | No layout thrash on SVG |
| Concurrently | Root `npm run dev` | Zero-friction dev setup |

## UI / Screen Design

### Information Hierarchy (above the fold)

```
┌─────────────────────────────────────────────────────┐
│ FitTogether ♥  [Today: Apr 9]  [Alex] [Sam]  LIVE ● │  <- Header
│ "Rest is where growth happens." (motivational msg)  │
├───────────────────────────────┬─────────────────────┤
│  ALEX          WHOOP          │  SAM    Apple Watch  │  <- Partner cards
│  ┌──────────┐                 │  ┌──────────┐        │
│  │  87%     │  Recovery       │  │  72%     │  Recovery│
│  │  ring    │                 │  │  ring    │        │
│  └──────────┘                 │  └──────────┘        │
│  Strain: 14.2  Sleep: 7.5h    │  Steps: 8420  HRV: 45│
│  HRV: 58ms    Steps: 9200     │  Sleep: 6.8h  Cal: 2350│
├───────────────────────────────┴─────────────────────┤
│  🔥 8-day streak together!  [Overview|Sleep|Workouts|HRV]│
├─────────────────────────────────────────────────────┤
│  [COMPARISON CHART — dual line, 14 days]            │
└─────────────────────────────────────────────────────┘
Mobile (375px): partners stack vertically, charts full-width
```

### Interaction States

| Feature | Loading | Empty | Error | Success |
|---------|---------|-------|-------|---------|
| Partner card | Skeleton pulse | "Connecting..." + device icon | "Sync failed" + retry | Full card |
| Charts | Shimmer bars | "No data yet — connect device" | "Chart unavailable" | Rendered |
| Workout list | Shimmer rows | "No workouts this week 🎯" | "Couldn't load" | Cards |
| Login | Button spinner | — | "Invalid credentials" inline | Redirect |
| WebSocket | "Connecting..." | — | "Offline — last sync Xm ago" | "LIVE" green dot |
| Demo mode | — | — | — | "Demo Mode" badge in header |

### User Journey & Emotional Arc

| Step | User does | User feels |
|------|-----------|------------|
| Opens app (morning) | Sees both recovery rings | "We both recovered well!" / competitive joy |
| First login | Sees Demo Mode + beautiful data | "This is gorgeous, I want real data" |
| Checks fiancée's HRV | Sees 14d trend | Caring, connected |
| Sees streak counter | "8-day streak together!" | Pride, motivation |
| Low recovery day | Partner has red ring | Empathy, "rest day?" |
| Gets badge | "New milestone: Best HRV!" | Celebration |

## API Integrations

### Whoop API v1
- Base: `https://api.prod.whoop.com/developer/v1`
- Auth: OAuth2 client credentials → `WHOOP_ACCESS_TOKEN` in env
- Token refresh: retry with refresh token on 401, update cache
- Endpoints: `/recovery`, `/sleep`, `/workout`, `/cycle`
- Cache: 5 min, shared via `cache.js`

### Terra API v2 (Apple Watch bridge)
- Base: `https://api.tryterra.co/v2`
- Auth: `dev-id` + `x-api-key` headers
- Endpoints: `/daily`, `/sleep`, `/activity`, `/body`
- Cache: 5 min, shared via `cache.js`

### Response Header
All `/api/partners/summary` and `/api/whoop/*` and `/api/terra/*` responses include:
```
X-Data-Source: mock | live
```
Frontend checks this header to show/hide "Demo Mode" badge.

## Auth Flow

1. `POST /api/auth/login` `{ email, password }`
2. Demo credentials: `demo@fittogether.com` / `demo123`
3. Returns `{ token: "JWT...", user: { name, partner1, partner2 } }`
4. JWT stored in `localStorage`
5. Axios interceptor: `Authorization: Bearer <token>`
6. WebSocket: `ws://localhost:3001/ws?token=<JWT>`
7. Server verifies JWT on WS upgrade event

## WebSocket Protocol

Broadcast every 30s (from cache — no extra API calls):
```json
{
  "type": "DATA_UPDATE",
  "timestamp": "2024-01-15T10:30:00Z",
  "dataSource": "live | mock",
  "partner1": { "name": "Alex", "device": "WHOOP", "recovery": 87, ... },
  "partner2": { "name": "Sam", "device": "Apple Watch", "steps": 8420, ... }
}
```

Client: exponential backoff reconnect (1s, 2s, 4s, max 30s).

## New Features (from scope review)

### Streak Counter

Located on Overview tab, below partner cards:
```
🔥 8-day streak together!
Alex: ██████████ 10 days  Sam: ████████ 8 days
```
Logic: count consecutive days where both partners hit recovery > 50% OR steps > 7000. Show joint streak + individual streaks. Reset to 0 if either partner misses.

### Motivational Messages

50 hard-coded messages in `frontend/src/lib/messages.js`. Pick: `messages[dayOfYear % messages.length]`. Shown in header below the logo. Examples:
- "Rest is where growth happens."
- "Together you're unstoppable."
- "Small steps, big strides."

### Goal Badges / Milestones

Track in-memory (no DB needed for v1) per session. Badges:
- "Best HRV Ever" — new personal HRV high
- "Perfect Week" — 7 consecutive days with recovery > 66%
- "Step Champion" — over 10,000 steps
- "Sleep Champion" — 8+ hours with >85% performance
- "Power Couple" — both partners >80% recovery same day

Shown as toast notification on dashboard, persistent badge in PartnerCard header.

## Design Tokens

```css
:root {
  --bg-base: #0a0a0f;
  --bg-card: #12121a;
  --bg-card-hover: rgba(255,255,255,0.03);
  --partner1: #8b5cf6;          /* Alex / Whoop - purple */
  --partner1-dark: #6d28d9;
  --partner2: #f43f5e;          /* Sam / Apple Watch - rose */
  --partner2-dark: #e11d48;
  --recovery-green: #10b981;
  --recovery-yellow: #f59e0b;
  --recovery-red: #ef4444;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: rgba(255,255,255,0.08);
  --glass: rgba(255,255,255,0.05);
}
```

**Font:** Inter (Google Fonts) — NOT system-ui or Arial.

**AI Slop avoidance:**
- No purple gradient backgrounds (purple = Partner 1 accent only)
- No icon-in-colored-circles
- No centered-everything layout
- No 3-column feature grids
- Cards only where card IS the interaction (partner cards, metric tiles)
- Charts use full-width canvas sections, not card-wrapped

## RecoveryRing Animation (CSS, not Framer Motion)

```css
.recovery-ring-path {
  stroke-dasharray: 283; /* 2π × 45 (radius) */
  stroke-dashoffset: 283;
  transition: stroke-dashoffset 1.2s ease-out;
}
.recovery-ring-path.animate {
  stroke-dashoffset: calc(283 * (1 - var(--pct)));
}
```

Mount: set `animate` class after 100ms timeout. No JS animation loop, no layout thrash.

## Test Plan

**Framework:** Vitest (frontend, co-located), supertest (backend)

```
backend/
└── __tests__/
    ├── auth.test.js         # login valid/invalid/missing
    ├── whoop.test.js        # mock fallback, live path, 401 refresh
    ├── terra.test.js        # mock fallback, live path
    ├── partners.test.js     # summary aggregation, X-Data-Source header
    └── cache.test.js        # TTL expiry, cache miss/hit

frontend/src/
└── __tests__/
    ├── Login.test.jsx       # render, demo button, error state
    ├── Dashboard.test.jsx   # renders with mock data
    ├── RecoveryRing.test.jsx # color thresholds (>66 green, 33-66 yellow, <33 red)
    └── ComparisonChart.test.jsx # renders with 14-day data
```

## Developer Setup (Zero Friction)

### 5-command quickstart
```bash
git clone https://github.com/mrinoybanerjee/fit-together
cd fit-together
npm install          # installs root concurrently
cp backend/.env.example backend/.env
npm run dev          # starts both frontend (5173) and backend (3001)
```

Open http://localhost:5173 — demo works with no API keys.

### Connecting Real Devices

**Whoop (Partner 1):**
1. Register at https://developer.whoop.com
2. Create OAuth2 app, get client ID + secret
3. Set `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET` in `backend/.env`
4. Visit `http://localhost:3001/api/whoop/auth` to authorize

**Apple Watch via Terra (Partner 2):**
1. Sign up at https://tryterra.co (free tier: 100 calls/day)
2. Create a project, get API key + dev ID
3. Set `TERRA_API_KEY`, `TERRA_DEV_ID` in `backend/.env`

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Whoop API down | 5-min cache serves last good data; after TTL: mock fallback + `X-Data-Source: mock` |
| Terra API down | Same as above |
| Whoop 401 | Attempt token refresh; if fails: mock fallback |
| WebSocket disconnect | Client reconnects with exponential backoff (1s, 2s, 4s, max 30s) |
| JWT expired | API returns 401 → client clears token → redirects to Login |
| Invalid credentials | `{ error: "Invalid credentials" }` 401 — displayed inline |

## Not In Scope (v1)

- Push notifications / email alerts
- Historical data export (CSV/PDF)
- Shared workout planning or goals
- Native mobile app
- Database persistence (localStorage for JWT is fine for a personal app)
- Multi-user (more than 2 partners)
- Other device integrations (Fitbit, Garmin, Oura)

## Build Phases

1. **Phase 1: Project skeleton** — monorepo setup, root package.json, .gitignore, concurrently
2. **Phase 2: Frontend shell** — Vite + Tailwind + shadcn, routing, Login page, auth context
3. **Phase 3: Core dashboard** — Header, PartnerCard, RecoveryRing (CSS anim), MetricCard, tabs
4. **Phase 4: Charts** — ComparisonChart, SleepChart, HRVTrend, WorkoutList
5. **Phase 5: New features** — StreakCounter, motivational messages, milestone badges
6. **Phase 6: Backend** — Express, auth, CORS, cache, health endpoint, JWT WebSocket
7. **Phase 7: API services** — WhoopService (OAuth + refresh), TerraService, mock data
8. **Phase 8: Tests** — Vitest frontend, supertest backend
9. **Phase 9: README** — quickstart + device connection guide

## GSTACK REVIEW REPORT

| Review | Trigger | Runs | Status | Key Findings |
|--------|---------|------|--------|--------------|
| CEO Review | `/plan-ceo-review` | 1 | ✅ DONE | SELECTIVE EXPANSION mode; added streak, messages, badges |
| Design Review | `/plan-design-review` | 1 | ✅ DONE | Vertical stack mobile; CSS ring anim; AI slop checklist passed |
| Eng Review | `/plan-eng-review` | 1 | ✅ DONE | 5-min cache; WS JWT auth; single mock data source; test plan |
| DX Review | `/plan-devex-review` | 1 | ✅ DONE | concurrently; X-Data-Source header; 5-command quickstart |
| Codex Review | `/codex review` | 0 | — | — |

**VERDICT:** REVIEWED — plan is implementation-ready. All critical issues resolved.
