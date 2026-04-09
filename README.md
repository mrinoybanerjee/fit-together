# FitTogether ❤️

> A beautiful couples fitness tracking dashboard — track your fitness journey side by side.

**Partner 1** connects their **Whoop** for recovery, strain, HRV, and sleep data.
**Partner 2** connects their **Apple Watch** via **Terra API** for steps, HRV, sleep, and workouts.

The dashboard shows both partners' data in real time, side by side.

---

## Quickstart (5 commands)

```bash
git clone https://github.com/mrinoybanerjee/fit-together
cd fit-together
npm install
cp backend/.env.example backend/.env
npm run dev
```

Open **http://localhost:5173** — the demo works with no API keys.

**Demo login:** `demo@fittogether.com` / `demo123`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Real-time | WebSocket (ws) |
| Auth | JWT |
| Partner 1 API | [Whoop REST API v1](https://developer.whoop.com) |
| Partner 2 API | [Terra API v2](https://tryterra.co) — Apple Watch / HealthKit bridge |

---

## Connecting Real Devices

### Partner 1 — Whoop

1. Register at **https://developer.whoop.com** and create an OAuth2 app
2. Set redirect URI to `http://localhost:3001/api/whoop/callback`
3. Add to `backend/.env`:
   ```
   WHOOP_CLIENT_ID=your-client-id
   WHOOP_CLIENT_SECRET=your-client-secret
   ```
4. Visit **http://localhost:3001/api/whoop/auth** to authorize
5. Copy the tokens shown into `.env` and restart

### Partner 2 — Apple Watch (via Terra)

1. Sign up at **https://tryterra.co** (free tier: 100 calls/day)
2. Add to `backend/.env`:
   ```
   TERRA_API_KEY=your-api-key
   TERRA_DEV_ID=your-dev-id
   ```

---

## Features

- Recovery rings — color-coded (green/yellow/red) for both partners
- Strain gauges — semi-circular daily effort gauge
- 14-day comparison charts — any metric, both partners
- Sleep analysis — stages (Deep/REM/Light) + performance scores
- HRV trends — 14-day area chart with optimal zone band
- Workout history — both partners interleaved by date
- Streak counter — consecutive days both partners hit goals
- Daily motivational messages — 50 rotating messages
- Goal badges — milestones (Perfect Week, Best HRV, Power Couple)
- Real-time WebSocket updates every 30 seconds
- Demo mode — beautiful mock data, no API keys needed
- Mobile responsive

---

## Development

```bash
npm run dev                   # Start frontend (5173) + backend (3001)
cd frontend && npm test       # Frontend tests (Vitest)
cd backend && npm test        # Backend tests (Jest + supertest)
```

---

## Customizing Partner Names

```
PARTNER1_NAME=Alex
PARTNER2_NAME=Sam
```

---

Made with ❤️ for two people who move together.
