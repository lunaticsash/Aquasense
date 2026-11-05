# AquaSense Mini-Build

Live: <vercel link> | Tests: ![tests](<repo>/actions/workflows/test.yml/badge.svg)

Part A: React dashboard (current, today's min/max, alert below 20%, alert history, chart).
Part B: Device API client, test plan and automated tests with mocked responses.

## Run
npm install
npm run dev     # dashboard
npm test        # 24 tests (Vitest, Jest-compatible API, chosen because the project uses Vite)

## Assumptions
- "Today" is the latest date in the data (mock data is from 2026-11-02), not the system date.
- Alert is strictly below 20% (exactly 20% is not an alert).
- Invalid readings (null, string, <0, >100, non-ISO timestamp) are dropped.
- Stale device = last_seen older than 5 minutes. Anomaly = level < 20 and pump off.

## Structure
src/lib/levels.js    dashboard logic (pure, tested)
src/components/      UI
src/api/client.js    login and status client with validation
tests/               levels and API tests
docs/                TEST_PLAN, WIFI_LOSS, AI_NOTE

![dashboard](docs/screenshot.png)