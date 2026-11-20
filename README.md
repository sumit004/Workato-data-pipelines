# Workato Data Pipeline automation (Playwright + TypeScript)

Phase 1: ODP2 **full load** (SAP OData -> Snowflake / BigQuery / Databricks).

## Setup
1. `npm install` and install Chrome (or `npx playwright install chromium`).
2. `cp .env.example .env` and fill in: folder id, connection names, destination(s).
3. `npm run auth` - sign in to Workato yourself in the opened browser, press Enter. Session saved to `.auth/workato.json` (git-ignored).
4. Tune selectors once: `npm run codegen`, then click through the flow and compare with `pages/workato/*`.
5. `npm run test:pipeline:headed` (first runs), later `npm run test:pipeline`.

## Layout
- `config/pipeline.config.ts` - all env-specific values + destination list
- `pages/workato/` - AssetsPage, PipelineBuilderPage, PipelinePage
- `tests/pipelines/full-load.spec.ts` - one test per destination
- `scripts/save-auth.ts` - one-time login helper

## Pass criteria (full load)
Pipeline created -> source + object + destination configured -> started -> first run finishes with rows loaded == rows extracted (> 0). Cleanup stops and deletes the pipeline unless `KEEP_PIPELINE=true`.
