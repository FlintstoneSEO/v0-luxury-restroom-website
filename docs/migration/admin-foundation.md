# Standalone admin foundation

## Pre-build brief

| Field | Foundation phase |
| --- | --- |
| Workstream | Additive standalone admin workspace scaffold |
| Application | Next.js admin; shared Supabase backend unchanged |
| User workflow being improved | Prepare an independent application boundary for later operator authentication and route extraction. |
| Current implementation | Root Next.js owns `/admin/**`, `/api/admin/**`, its authentication proxy, and all operational actions; Astro lives in `apps/web`. |
| Current pain point | Admin cannot build or deploy independently. |
| Proposed change | Add a buildable `apps/admin` with its own config, styles, informational placeholder, and workspace scripts. Keep authentication, operational screens, and APIs on root. |
| Routes affected | New app: `/` and `/admin` informational routes. Root routes and production routing unchanged. |
| Files likely affected | `apps/admin/**`, root workspace scripts/config, example environment, and one migration test path. |
| Content or data involved | None. Supabase dependencies are installed for later migration; the placeholder reads no session or operational data. |
| Status fields involved | None. |
| Customer-visible risk | None from routing; the new app is not deployed or linked. |
| SEO risk | New app must emit noindex/noarchive and no-store headers. |
| Security risk | The informational placeholder is public and exposes no operational data or actions. Authentication and protected `app_metadata.is_admin` checks are deferred until an operational route exists. |
| Accessibility considerations | Semantic landmark and heading, readable text and contrast. |
| Mobile considerations | Placeholder fits narrow screens. |
| Migration or rollback strategy | Additive files and scripts; revert this commit to roll back. Keep root admin writer and routes untouched. |
| Validation steps | Workspace install, independent lint/typecheck/build, root and web regression checks, tests, route/header inspection. Auth and production routing require later phases. |

## Scope boundary

This implements step 3, **Workspace scaffold**, of [admin-extraction-plan.md](admin-extraction-plan.md). The standalone `/admin` page is a staging placeholder, not an operational dashboard. No `/api/admin/**` handlers, customer token routes, provider callbacks, pricing engines, or operational UI have been copied. The current root application remains the sole operational admin implementation. No `packages/shared` or `packages/ui` package is created: the approved plan requires import-graph and consumer proof before those boundaries exist.

The new app uses restrained navy, cream, and gold tokens. It has no login, auth proxy, or operational API yet. Its informational route is intentionally accessible without a session and reads no protected data. Before any operational page or API moves, Phase 3 must add server-side authorization using protected `app_metadata.is_admin`, independently guard each privileged handler, and verify login, cookie refresh, and logout on an isolated preview host.

## Environment boundary and domain

`apps/admin/.env.example` lists variables for the future admin deployment. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser-safe project identifiers. `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GOOGLE_MAPS_API_KEY`, Dropbox Sign, and Square values must remain server-only. No service-role key is used by this scaffold. `PUBLIC_SITE_URL`, `ADMIN_APP_URL`, and `CUSTOMER_WORKFLOW_URL` are separate origins needed before customer-visible sends or provider cutover. The root `.env.example` remains the root workflow reference.

The architecture plan names `admin.signatureluxevents.com`, while the configured public site uses `signatureluxeevents.com`. The repository cannot establish which spelling is the intended production admin domain. Keep `ADMIN_APP_URL` unset in the example; confirm domain ownership and the exact admin host before DNS, auth redirect allowlists, or provider callback changes. No production host is configured in this phase.

## Structure and scripts

`apps/admin` contains App Router pages (`app/layout.tsx`, `app/page.tsx`, `app/admin/page.tsx`), `globals.css`, Next/PostCSS/TypeScript/ESLint config, a package manifest, environment example, and scoped agent instructions. There are no operational imports from root or Astro. The package includes React, Next.js, Tailwind, `lucide-react`, and Supabase SSR/client libraries for later use. Radix dependencies are deferred until a real screen needs them.

Root scripts now include `dev:admin`, `build:admin`, `typecheck:admin`, `check:admin`, `build:all`, and `check:all`, preserving existing root and Astro commands. `check:admin` runs the app's TypeScript and ESLint checks. On this Windows pnpm workspace, Next 16 Turbopack did not resolve the pnpm-linked `next` package from the nested app directory. `apps/admin` uses Next's webpack mode for `dev` and `build`; this is a build-tool setting only.

## Validation record

- **PASS** — `corepack pnpm install --frozen-lockfile` completed for all three workspace projects after updating `pnpm-lock.yaml`. The first sandboxed install could not access npm; the permitted retry reused the local pnpm store.
- **PASS** — `corepack pnpm check:admin` and `corepack pnpm build:admin` completed. The route manifest contains only `/` and `/admin` plus Next's not-found route. Both application routes render dynamically; there are no admin API handlers or auth routes.
- **PASS** — Aggregate `corepack pnpm check:all` completed across root TypeScript/ESLint, Astro, and admin TypeScript/ESLint.
- **PASS** — `corepack pnpm lint`, `corepack pnpm check:web` (zero errors, warnings, hints), and `corepack pnpm build:web` completed.
- **PASS** — All existing Vitest files passed: 5 files, 19 tests. The sandboxed test process hit a filesystem ACL restriction; the permitted rerun passed.
- **PASS** — Root `corepack pnpm typecheck` passed after `corepack pnpm exec next typegen` refreshed stale, ignored `.next` types. The stale references to removed `availability-blocks` routes were generated output, not current source defects.
- **PASS** — Root `corepack pnpm build` passed with permitted network access for its existing `next/font/google` requests. The initial sandboxed build failed to fetch those fonts.
- **PASS** — Local no-env HTTP smoke check: `/admin` returned 200, `X-Robots-Tag: noindex, nofollow, noarchive`, and `Cache-Control: private, no-store, max-age=0`. It displayed only the informational foundation message.
- **BASELINE CORRECTION** — `booking-availability-migration.test.ts` now points to the repository's actual `20260731020944_enforce_one_booking_per_day.sql`; no migration SQL or database behavior changed.
- **NEEDS PREVIEW VALIDATION** — Admin authentication and role denial, session refresh/logout/cookie settings, accessibility and responsive review, provider/API parity, and production routing belong to later phases. Operational UI and APIs remain on root.

## Next gate and rollback

Before Phase 3, establish the exact intended admin domain, auth redirect allowlist, preview deployment, server-side admin claim enforcement, cookie/session behavior, and direct API denial. Provider callbacks, customer token links, and the root admin writer remain owned by the root application. No public or production traffic should target this placeholder as an operational admin.

To roll back Phase 2, revert this commit. It adds an isolated workspace app, root scripts/config exclusions, documentation, and one test path correction; there are no data migrations, DNS changes, or provider changes to reverse.
