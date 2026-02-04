# Environment Variables

This is the single source of truth for environment configuration across the repo.

## App Local Env (`app/.env.local`)

From repo root:

```bash
cp app/.env.example app/.env.local
```

Frontend (Vite) variables:

- `VITE_CONVEX_URL` (required)
- `VITE_DEV_AUTH` (optional, defaults to `false`)
- `VITE_CLERK_PUBLISHABLE_KEY` (required when `VITE_DEV_AUTH=false`)
- `VITE_PAYWALL_DISABLED` (optional, defaults to `false`)

## Ingestion Local Env (`src/ingestion/.env.local`)

From repo root:

```bash
cp src/ingestion/.env.example src/ingestion/.env.local
```

Minimum required for Convex writeback:

- `CONVEX_DEPLOYMENT_URL`
- `CONVEX_API_KEY`

Provider/storage variables are optional and depend on enabled integrations.

## Convex Dashboard Env Vars (Server-side only)

Set these in Convex Dashboard for backend actions:

1. Open [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your deployment
3. Go to `Deployment Settings` -> `Environment Variables`
4. Add/update keys below

Required:

- `ANTHROPIC_API_KEY`

Optional:

- `BRAINTRUST_API_KEY`
- `BRAINTRUST_PROJECT_NAME`
- `GITHUB_TOKEN`
- `CONVEX_DEBUG`

These are server-side only. Do not prefix them with `VITE_`.

## Variable Matrix

| Variable | Scope | Required | Default | Where Used | Acquisition |
|---|---|---|---|---|---|
| `VITE_CONVEX_URL` | Vite | Yes | none | `app/src/main.tsx` | Convex deployment URL from [Deployment Settings](https://docs.convex.dev/dashboard/deployments/deployment-settings) |
| `VITE_DEV_AUTH` | Vite | No | `false` | `app/src/lib/auth/index.tsx` | Local toggle, no external provider needed |
| `VITE_CLERK_PUBLISHABLE_KEY` | Vite | Conditional (`VITE_DEV_AUTH=false`) | none | `app/src/lib/auth/index.tsx` | Clerk dashboard publishable key per [Clerk env docs](https://clerk.com/docs/deployments/clerk-environment-variables) |
| `VITE_PAYWALL_DISABLED` | Vite | No | `false` | `app/src/routes/app.tsx` | Local toggle, no external provider needed |
| `ANTHROPIC_API_KEY` | Convex | Yes (AI path) | none | `app/convex/grazingAgentDirect.ts` | Anthropic console key per [Anthropic getting started](https://docs.anthropic.com/en/api/getting-started) |
| `BRAINTRUST_API_KEY` | Convex | No | none | `app/lib/braintrust.ts` | Braintrust org API key per [Braintrust API intro](https://www.braintrust.dev/docs/api-reference/introduction) |
| `BRAINTRUST_PROJECT_NAME` | Convex | No | `grazing-agent` | `app/lib/braintrust.ts` | Optional name from [Braintrust projects](https://www.braintrust.dev/docs/core/projects) |
| `GITHUB_TOKEN` | Convex | No | none | `app/convex/bugReportsAction.ts` and `app/convex/featureRequestsAction.ts` | GitHub PAT per [token docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) |
| `CONVEX_DEBUG` | Convex | No | `false` | `app/convex/lib/logger.ts` | Local/Convex toggle, no provider key |
| `CONVEX_DEPLOYMENT_URL` | Ingestion | Yes (writeback path) | none | `src/ingestion/writer.py` | Convex deployment URL from [Deployment Settings](https://docs.convex.dev/dashboard/deployments/deployment-settings) |
| `CONVEX_API_KEY` | Ingestion | Yes (writeback path) | none | `src/ingestion/writer.py` and `src/ingestion/scheduler.py` | Convex deploy key per [deploy key docs](https://docs.convex.dev/cli/deploy-key-types) |
| `COPERNICUS_CLIENT_ID` | Ingestion | No | none | `src/ingestion/providers/copernicus.py` | CDSE OAuth client per [CDSE auth docs](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Overview/Authentication.html) |
| `COPERNICUS_CLIENT_SECRET` | Ingestion | No | none | `src/ingestion/providers/copernicus.py` | CDSE OAuth secret from same client setup |
| `PL_API_KEY` | Ingestion | No | none | `src/ingestion/providers/planet_scope.py` | Planet API key per [Planet auth docs](https://docs.planet.com/develop/authentication/) |
| `PL_CLIENT_ID` | Ingestion | No | none | `src/ingestion/providers/planet_scope.py` | Planet OAuth client credentials (optional) per [Planet auth docs](https://docs.planet.com/develop/authentication/) |
| `PL_CLIENT_SECRET` | Ingestion | No | none | `src/ingestion/providers/planet_scope.py` | Planet OAuth client credentials (optional) per [Planet auth docs](https://docs.planet.com/develop/authentication/) |
| `R2_ACCOUNT_ID` | Ingestion | No | none | `src/ingestion/storage/r2.py` | Cloudflare account ID per [R2 S3 token docs](https://developers.cloudflare.com/r2/api/s3/tokens/) |
| `R2_ACCESS_KEY_ID` | Ingestion | No | none | `src/ingestion/storage/r2.py` | Cloudflare R2 S3 access key per [R2 get started](https://developers.cloudflare.com/r2/get-started/cli/) |
| `R2_SECRET_ACCESS_KEY` | Ingestion | No | none | `src/ingestion/storage/r2.py` | Cloudflare R2 S3 secret key per [R2 get started](https://developers.cloudflare.com/r2/get-started/cli/) |
| `R2_BUCKET_NAME` | Ingestion | No | `grazing-satellite-tiles` | `src/ingestion/storage/r2.py` | Existing/new R2 bucket name |
| `R2_PUBLIC_URL_BASE` | Ingestion | No | none | `src/ingestion/storage/r2.py` | Optional public/custom domain URL |
| `COMPOSITE_WINDOW_DAYS` | Ingestion | No | `21` | `src/ingestion/config.py` | Local tuning value |
| `MAX_CLOUD_COVER` | Ingestion | No | `50` | `src/ingestion/config.py` | Local tuning value |
| `MIN_CLOUD_FREE_PCT` | Ingestion | No | `0.3` | `src/ingestion/config.py` | Local tuning value |
| `DEFAULT_PROVIDER` | Ingestion | No | `sentinel2` | `src/ingestion/config.py` | Local tuning value (`copernicus` or `sentinel2`) |
| `ENABLE_PLANET_SCOPE` | Ingestion | No | `false` | `src/ingestion/config.py` | Local toggle for PlanetScope integration |
| `WRITE_TO_CONVEX` | Ingestion | No | `true` | `src/ingestion/config.py` | Local toggle for writeback |
| `OUTPUT_DIR` | Ingestion | No | `output` | `src/ingestion/config.py` | Local filesystem path |
| `LOG_LEVEL` | Ingestion | No | `INFO` | `src/ingestion/config.py` | Local logging config |

## Convex CLI Parity

Reference: [Convex env docs](https://docs.convex.dev/production/environment-variables).

```bash
npx convex env list
npx convex env get ANTHROPIC_API_KEY
npx convex env set ANTHROPIC_API_KEY "your_value"
npx convex env remove CONVEX_DEBUG
```
