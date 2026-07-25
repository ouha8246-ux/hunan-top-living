# HunanTopLiving

A bilingual ceramic collection and inquiry site built with Next.js.

## Local development

1. Install dependencies with `pnpm install`.
2. Run `pnpm optimize:assets`, then set `CATALOG_SOURCE_DIR=.catalog-optimized` and run `pnpm sync:assets` to copy the web-ready JPEG catalog into `public/catalog` and regenerate the typed manifest.
3. Copy `.env.example` to `.env.local` and configure Resend to enable inquiry delivery.
4. Start the site with `pnpm dev`.

## Commands

- `pnpm sync:assets` — refresh the catalog from `CATALOG_SOURCE_DIR`.
- `pnpm optimize:assets` — use Photoshop CC 2019 to generate quality-82, maximum-2560px JPEG derivatives without modifying the desktop PNG sources.
- `pnpm test` — verify catalog ordering, exclusions, and image count.
- `pnpm typecheck` — run strict TypeScript checks.
- `pnpm lint` — run the Next.js ESLint rules.
- `pnpm build` — create a production build.
- `pnpm cf:build` — create the OpenNext Cloudflare Worker bundle.
- `pnpm cf:preview` — build and preview the Worker locally.
- `pnpm cf:deploy` — build and deploy to Cloudflare Workers.

## Cloudflare deployment

The application deploys through OpenNext to the `hunan-top-living` Worker. Catalog images are served directly from Workers Static Assets, and Next.js runtime image optimization is disabled because the checked-in JPEG derivatives are already optimized for the web.

Run `wrangler login` once, then `pnpm cf:deploy`. To enable inquiry delivery later, add `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`, and `INQUIRY_TO_EMAIL` as Cloudflare secrets or variables.

The catalog sync intentionally ignores unnumbered folders, PDFs, empty product types, and all non-image files.
