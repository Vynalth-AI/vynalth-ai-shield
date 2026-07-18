# Project: Vynalth AI Shield Threat Intel Ingestion and Enrichment

## Architecture
- Module/package boundaries, data flow, shared interfaces:
  - `api/cron/crawl.ts`: Executes daily cron crawl, fetches feeds, trains Autoencoder, updates stats and risk config.
  - `src/lib/riskEngine.ts`: Frontend risk engine using same autoencoder architecture.
  - Supabase Database: Houses tables `threat_intel`, `autoencoder_states`, `threat_feed_stats`, and `threat_risk_config`.
  - Offline Utilities: `scripts/test-bot.js` for simulation checks, and `scripts/threat_crawler.cjs` for site crawls.

## Code Layout
- `api/cron/crawl.ts` - Main crawling and training serverless endpoint
- `api/cron/learn.ts` - Autoencoder learning loop endpoint
- `schema.sql` - Supabase database SQL schema definition
- `scripts/test-bot.js` - Standalone anti-bot correctness validation suite
- `scripts/threat_crawler.cjs` - Offline web page scraping and sitemap generation script

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Architecture | Codebase exploration and environment checks | none | DONE |
| 2 | Feed Ingestion (R1) | Run/trigger existing crawl logic from `api/cron/crawl.ts` locally or via a helper script | 1 | IN_PROGRESS |
| 3 | Browser Enrichment (R2) | Implement browser-based intel enrichment or workaround for Windows environment | 2 | PLANNED |
| 4 | Verification (R3) | Verify database writes to `threat_intel` and stats compilation to `threat_feed_stats` | 3 | PLANNED |
| 5 | E2E Testing & Acceptance | Dual Track E2E suite validation | 4 | PLANNED |

## Interface Contracts
### API ↔ Supabase
- Read/write access to threat_intel, threat_feed_stats, threat_risk_config, autoencoder_states tables.
