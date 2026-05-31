# SMC / ICT Market Dashboard

Full-stack TypeScript app for Smart Money Concepts market analysis. It scans Binance OHLCV candles, computes classical indicators, detects SMC context, scores trade setups, and exposes a dashboard with live signals, chart overlays, statistics, settings, REST API, and socket.io events.

## Stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS, Lightweight Charts, Recharts, Zustand, TanStack Query
- Backend: Node.js, Express, TypeScript, socket.io, node-cron
- Data model: PostgreSQL + Prisma schema
- Market data: Binance public klines API with deterministic mock fallback when network is unavailable

## Quick Start

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:3000`.

The backend currently stores runtime signals/settings in memory so the app remains usable before database persistence is connected. The Prisma schema is included and ready for migrations.

## GitHub

```bash
git init
git add .
git commit -m "Initial SMC market dashboard"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Create the repository on GitHub first, then replace `<your-user>` and `<your-repo>`.

## Vercel Deploy

Deploy the frontend as a Vercel project with `frontend` as the project root.

Recommended Vercel settings:

- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_URL=https://<your-backend-host>`
  - `VITE_WS_URL=https://<your-backend-host>`

Vercel is a good fit for the React frontend. The current backend uses Express, socket.io, and node-cron as a persistent server, so it should be deployed separately on a Node host such as Render, Railway, Fly.io, a VPS, or Docker hosting. To run the whole backend on Vercel, the API would need to be refactored to serverless functions and the WebSocket/cron pieces replaced with hosted alternatives.

## SMC Concepts

- BOS: continuation break beyond the previous confirmed swing high or swing low.
- CHoCH: trend-character change when price breaks the opposite swing in an existing bias.
- Order Block: last opposite candle before an impulse that produced a BOS.
- Fair Value Gap: three-candle imbalance where candle `i - 2` does not overlap candle `i`.
- Liquidity: buyside or sellside levels around swing highs/lows and equal highs/lows.
- Premium/Discount: current price relative to the recent range equilibrium.

All SMC calculations are made from closed candles by dropping the latest live candle from the analysis set.

## Quality Score

The score is a 0-100 confluence rating:

- trend bias agrees with signal direction
- long entries prefer discount, short entries prefer premium
- RSI and EMA alignment support the setup
- recent liquidity sweep adds confluence
- order block and FVG context decide entry type

Signals below `MIN_QUALITY_SCORE` are ignored.

## API

- `GET /api/market/:symbol/:timeframe`
- `GET /api/signals`
- `GET /api/signals/:id`
- `GET /api/stats`
- `GET /api/smc/:symbol/:timeframe/summary`
- `GET /api/smc/:symbol/:timeframe/structure`
- `GET /api/smc/:symbol/:timeframe/orderblocks`
- `GET /api/smc/:symbol/:timeframe/fvg`
- `GET /api/smc/:symbol/:timeframe/liquidity`
- `POST /api/scan`
- `GET /api/settings`
- `PUT /api/settings`

Socket events:

- `new_signal`
- `signal_update`
- `market_update`
- `smc_event`

## Project Layout

```text
backend/
  prisma/schema.prisma
  src/routes
  src/services/market
  src/services/indicators
  src/services/smc
  src/services/scheduler
  src/websocket
frontend/
  src/pages
  src/components/chart
  src/hooks
  src/store
  src/api
```

## Notes

This project is an analysis and research tool, not financial advice. Validate every signal before placing trades.
