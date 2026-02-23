# OpenPasture App

Frontend for the Morning Farm Brief experience. Built with Vite, React, and TypeScript.

## Getting Started

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

## Environment

Copy and fill the app env template:

```bash
cp .env.example .env.local
```

Primary app variables:

- `VITE_CONVEX_URL` - required
- `VITE_DEV_AUTH=true` - optional local auth bypass
- `VITE_CLERK_PUBLISHABLE_KEY` - required when `VITE_DEV_AUTH=false`
- `VITE_PAYWALL_DISABLED=true` - optional local paywall bypass

Server-side Convex variables (`ANTHROPIC_API_KEY`, `BRAINTRUST_API_KEY`, etc.) are documented in [docs/environment.md](../docs/environment.md) and should be set in Convex Dashboard env vars.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## Project Structure

- `src/components` - UI and feature components
- `src/data/mock` - mock data used by the UI
- `src/routes` - application routes (TanStack Router)
- `src/lib` - shared utilities, hooks, and types

## More

See the root [README](../README.md) for project overview and docs.
