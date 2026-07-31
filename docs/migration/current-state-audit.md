# Current-state audit

Audit date: 2026-07-25  
Branch: `dev`  
Starting worktree: not clean. Existing user-owned changes included the additive migration foundation and an admin API parameter-folder rename. This audit preserves those changes and does not claim a clean pre-change baseline.

## Executive finding

The repository is a single Next.js 16 App Router application. It combines:

- static and statically generated public marketing pages;
- public forms implemented with client components and Next.js server actions;
- a tokenized customer quote-review workflow;
- a protected admin console and privileged admin route handlers;
- Supabase operational data and authentication;
- Resend/customer email, Google distance calculation, Dropbox Sign, Square, Soro RSS, GTM, and Vercel Analytics.

The safest first boundary is additive: keep the root Next.js application deployed and introduce `apps/web` as an independent Astro build. Moving the root application to `apps/admin` now would mix a folder migration with public-route migration and is intentionally deferred.

## Baseline validation

| Command | Result | Notes |
|---|---|---|
| `corepack pnpm build` | Pass | Next.js compiled, type-checked, and generated all 117 routes/pages in the build manifest. Middleware-to-proxy deprecation warning only. |
| `corepack pnpm lint` | Fail, pre-existing | The invoked ESLint 6.4.0 cannot find a configuration file. The root package does not currently declare ESLint or provide an ESLint config. |
| `corepack pnpm seo:audit-links` | Pass | Informational low-link findings remain for some resources and city pages. |
| `corepack pnpm seo:audit-content` | Pass with warnings | Two resource meta descriptions are outside the 120–160 character target. |
| `corepack pnpm check:web` | Pass after script correction | Initial nested script failed because `pnpm` was not directly available on PATH; workspace scripts now invoke `corepack pnpm`. Empty future collections emit expected “no files found” warnings. |
| `corepack pnpm build:web` | Pass after script correction | Astro produces only the independent, noindex migration pilot. Empty future collections emit expected warnings until the pilot collection phase seeds them. |
| `corepack pnpm build:all` | Pass with network access | The combined build passes. A restricted-network run failed only because `next/font` could not fetch Cormorant Garamond and Montserrat from Google; rerunning with network access passed. |
| `npx @cloudcannon/cli validate` | Pass | Both `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` validate. Repository schema snapshots match the current official release checksums. |

## Runtime boundaries

### Public content

Most public routes are React server components using `next/link`, `next/image`, metadata exports, and shared layout components. City, resource, and blog detail routes use static parameter generation. Some otherwise public pages become dynamic because they read Supabase-backed site media or remote Soro content.

### Public interaction

| Entry point | Implementation | Classification |
|---|---|---|
| `/request-quote` | `components/quote-request-form.tsx` → `app/actions/quote-request.ts` | Keep temporarily in Next.js customer workflow |
| `POST /api/quote-requests` | Zod validation → server-only calculation → service-role insert | Shared backend/API boundary candidate |
| `/request-availability` | Legacy `request-availability-form.tsx` → server action | Requires decision; behavior differs from canonical quote path |
| `/contact` | Server action inserts `contact_submissions` and optionally emails | Astro island or server endpoint decision |
| `/quote/[token]` | Dynamic server page plus client response component | Keep temporarily in Next.js customer workflow |

### Protected admin

`proxy.ts` protects `/admin/:path*` and `/api/admin/:path*` using Supabase SSR cookies and protected `app_metadata.is_admin === true`. Individual privileged APIs also call `requireAdminUser()`. Service-role operations remain server-only through `lib/supabase/admin.ts`.

The admin pages are dynamic where live data is required. `/admin` explicitly exports `dynamic = 'force-dynamic'` and `revalidate = 0`. Admin metadata is noindex/nofollow.

### Admin page routes

| Route | Current source | Data / behavior | Migration class |
|---|---|---|---:|
| `/admin/login` | `app/admin/login/**` | Supabase email/password sign-in; setup and auth errors | 3 |
| `/admin` | `app/admin/page.tsx` | Live quote pipeline dashboard from `getQuoteRequests` | 3 |
| `/admin/quotes/[quoteId]` | `app/admin/quotes/[quoteId]/page.tsx` | Live quote, options, and pricing workspace | 3 |
| `/admin/pricing` | `app/admin/pricing/page.tsx` | Reads `pricing_settings`; renders protected editor | 3 |
| `/admin/settings` | `app/admin/settings/page.tsx` | Operational pricing/settings form | 3 |
| `/admin/site-media` | `app/admin/site-media/page.tsx` | Supabase-backed public media references | 3/6 |
| `/admin/homepage-media` | redirect page | Redirects to `/admin/site-media` | 3 |
| `/admin/distance-settings` | client page | Presentational settings screen; persistence path requires follow-up decision | 3/6 |

The admin shell is `app/admin/layout.tsx`. It is a client component that supplies responsive navigation and logout through `POST /api/admin/logout`. The middleware matcher covers both `/admin/:path*` and `/api/admin/:path*`; the login page is the only admin page allowed through without an authenticated admin session.

## Route-handler and action inventory

### Server actions

| File | Writes / side effects |
|---|---|
| `app/actions/contact.ts` | `contact_submissions`; optional Resend notification |
| `app/actions/quote-request.ts` | Calculation, duplicate detection, `quote_requests`, admin and customer Resend emails |
| `app/actions/request-availability.ts` | Legacy distance/pricing path; `quote_requests`, best-effort `availability_requests`, Resend |

### Public/customer APIs

| Route | Purpose | Auth |
|---|---|---|
| `POST /api/quote-requests` | Canonical JSON quote creation boundary | Public; honeypot, Zod, duplicate detection |
| `POST /api/quote/[token]/respond` | Approve, request changes, or decline | Valid unexpired unused token |
| `POST /api/quote/[token]/message` | Customer message without consuming token | Valid unexpired token |
| `POST /api/quote/respond` | Retired legacy endpoint | Always `410 Gone` |
| `GET /auth/callback` | Supabase auth code exchange | OAuth callback |
| `POST /api/webhooks/dropbox-sign` | Agreement signed updates | Provider signature when secret configured |
| `POST /api/webhooks/square` | Deposit paid updates | Provider signature when key configured |

### Admin APIs

| Route | Purpose |
|---|---|
| `/api/admin/logout` | Supabase logout |
| `/api/admin/pricing` | Update pricing settings; current pages read settings server-side |
| `/api/admin/homepage-media` | Manage homepage media references |
| `/api/admin/site-media` | Manage public media registry |
| `/api/admin/migrations/run` | Non-production SQL migration runner; disabled in production |
| `/api/admin/quotes/test` | Clone/create isolated test quote |
| `/api/admin/quotes/[quoteId]` | Fetch/update quote and status history |
| `/api/admin/quotes/[quoteId]/recalculate` | Server-side canonical recalculation |
| `/api/admin/quotes/[quoteId]/options` | List/create quote options |
| `/api/admin/quotes/[quoteId]/options/[optionId]` | Update/delete option |
| `/api/admin/quotes/[quoteId]/options/[optionId]/recalculate` | Recalculate one option |
| `/api/admin/quotes/[quoteId]/email-preview` | Render customer email preview |
| `/api/admin/quotes/[quoteId]/send` | Create token, transition status, send quote |
| `/api/admin/quotes/[quoteId]/send-test` | Clone and send an isolated test quote |
| `/api/admin/quotes/[quoteId]/agreement` | Manual agreement tracking update |
| `/api/admin/quotes/[quoteId]/deposit` | Manual deposit tracking update |
| `/api/admin/quotes/[quoteId]/send-agreement` | Dropbox Sign send |
| `/api/admin/quotes/[quoteId]/send-deposit-invoice` | Square invoice creation |

## Operational data inventory

Tables referenced by application code:

- `quote_requests`
- `quote_options`
- `quote_approval_tokens`
- `quote_link_events`
- `quote_status_history`
- `pricing_settings`
- `site_media`
- `homepage_media`
- `contact_submissions`
- `availability_requests` (legacy best-effort sync)

Tables declared in `supabase/schema.sql` but not consistently used as the primary tracking source:

- `quote_agreements`
- `quote_deposits`

The live workflow currently stores agreement and deposit tracking primarily on `quote_requests`.

Important field families:

- Identity and event: `quote_number`, customer contact fields, event date/type/location/times, guests, utilities.
- Calculation: distance, itemized fees, subtotal, discount, total, deposit, final balance, `calculated_breakdown`.
- Safety: `needs_manual_distance_review`, `is_manual_override`, `is_test_quote`.
- Quote lifecycle: `status`, sent/viewed/approved/response timestamps, selected option.
- Token lifecycle: hashed token, expiry, used/viewed timestamps and counts.
- Agreement: `agreement_status`, provider IDs, sent/signed timestamps and document URLs.
- Payment: `deposit_status`, due/paid fields, Square IDs/URLs, final-balance fields.
- Audit: `quote_status_history`, `quote_link_events`, created/updated timestamps.

## Integration inventory

| Integration | Files | Boundary |
|---|---|---|
| Supabase Auth | `proxy.ts`, `lib/supabase/server.ts`, `lib/admin-auth.ts` | Next.js admin only |
| Supabase service role | `lib/supabase/admin.ts`, public/customer/admin server code | Server-only |
| Resend | server actions and `lib/email/client.ts` | Server-only |
| SendGrid/Mailgun fallback | `lib/email/client.ts` | Server-only; supported by code but absent from `.env.example` |
| Google Distance Matrix | `lib/quotes/build-quote-calculation.ts` | Server-only `GOOGLE_MAPS_API_KEY` |
| Google Places autocomplete | public form components | Browser-safe `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Dropbox Sign | send route, webhook, merge fields | Server-only |
| Square | invoice route and webhook | Server-only |
| Soro RSS | `lib/soro-blog.ts` | Build/server fetch, hourly revalidation |
| GTM | `app/layout.tsx`, container `GTM-P5LFZN2` | Public layout |
| Vercel Analytics | `app/layout.tsx` | Production public layout |
| Vercel deployment | README, `VERCEL_URL`, remote image rules | Current Next deployment |

## Environment variables

### Browser-exposed

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_BUSINESS_PHONE`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`

### Server-only

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `EMAIL_FROM_ADDRESS`
- `SENDGRID_API_KEY`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `GOOGLE_MAPS_API_KEY`
- `BUSINESS_ORIGIN_ADDRESS`
- `DROPBOX_SIGN_API_KEY`
- `DROPBOX_SIGN_TEMPLATE_ID`
- `DROPBOX_SIGN_TEST_MODE`
- `DROPBOX_SIGN_WEBHOOK_SECRET`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_ENVIRONMENT`
- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `APP_URL`
- `VERCEL_URL`
- `SEO_AUDIT_LOW_THRESHOLD`
- `SEO_AUDIT_STRICT`

`.env.example` does not yet enumerate every optional provider variable. This phase documents the gap without moving or changing secrets.

## Next.js-specific dependencies and migration impact

- `next/image`: replace with Astro image handling or static image paths after an asset audit.
- `next/link`: ordinary anchors in Astro.
- `next/font/google`: self-host or use Astro-compatible font loading while preserving font-display behavior.
- `next/navigation`: redirects/not-found/static params require Astro equivalents.
- `next/headers` and `@supabase/ssr`: remain in Next.js admin/customer workflows.
- Next server actions: require an API boundary or retained Next route.
- Route handlers and middleware: remain in Next.js.
- Next metadata, sitemap, robots, and `next/og`: reproduce deliberately in Astro.
- `revalidate`: Soro blog ingestion needs a build/webhook/cache decision.
- React client components: form, approval, admin, carousel, accordion, mobile navigation, and YouTube components need island-by-island review.

## Client-component inventory

High-value interactive components:

- `components/quote-request-form.tsx`
- `components/request-availability-form.tsx`
- `app/quote/[token]/quote-approval-client.tsx`
- `components/lite-youtube-embed.tsx`
- admin components under `components/admin/**`
- Radix/shadcn primitives under `components/ui/**`

Simple public accordions, carousels, navigation, and media interactions should be assessed individually. Do not carry the full React UI library into Astro for static content.

### Major component classification

| Current area | Representative files | Target class | Boundary note |
|---|---|---:|---|
| Public shell | `components/layout/header.tsx`, `footer.tsx`, `app/layout.tsx` | 1/2 | Rebuild in Astro; mobile navigation may be a small island. Preserve GTM, metadata, fonts, and focus behavior. |
| Static marketing sections | hero, CTA, section header, feature/process/service cards | 1 | Prefer Astro components with no client runtime. |
| Public media interactions | gallery, carousel, lite YouTube | 2 | Migrate only the interaction that needs JavaScript; static poster/content remains server-rendered. |
| Public forms | quote request, availability, contact | 2/4/6 | Presentation can become an island only after a stable server boundary and parity decision. |
| Service template and SEO datasets | `service-page-template.tsx`, `lib/seo*.ts`, city/resources datasets | 1/5 | Convert content and pure SEO helpers deliberately; preserve structured-data output. |
| Customer quote UI | `app/quote/[token]/**`, `components/quote/**` | 4 | Remains Next.js because it depends on server-side token/service-role behavior. |
| Admin shell/screens | `app/admin/**`, `components/admin/**` | 3 | Remains protected Next.js; redesign in later safety-reviewed phases. |
| UI primitives | `components/ui/**` | 3/6 | Keep for admin/customer React. Do not migrate the full library to Astro; adopt only proven island dependencies. |
| Operational libraries | quote calculation/types/schema/status, Supabase, email, providers | 5 | Server-only unless a module is proven pure and environment-neutral before extraction. |

## Assets and media

Local brand and business photography lives under `public/images/**`, including the 3 Station Pro gallery and event-specific imagery. The Astro scaffold reuses the existing `public` directory rather than duplicating assets.

Supabase-backed `site_media` and `homepage_media` provide runtime-configurable media references. Before those pages migrate, decide whether each asset is editorial public content suitable for CloudCannon or an operational reference that remains in Supabase.

Remote image allowlists include Supabase storage, Vercel Blob, YouTube thumbnails, and Soro-supported hosts.

The current local inventory contains 26 files under `public`, including seven 3 Station Pro photos/derivatives, event-specific PNGs, the brand logo, icons/favicons, two Google verification files, and generic placeholder assets. Three extensionless files (`Corporate Event Restroom Trailer`, `Festival Restroom Trailer`, and `Wedding Restroom Trailer in Lansing`) are only two bytes each and should be treated as invalid asset stubs until their intended source is recovered. Several PNG/JPEG originals are roughly 1–2.7 MB; optimization and duplicate-use review are required before route migration, but no asset is moved in this phase.

## SEO and tracking inventory

- Root metadata, canonical origin, Open Graph, Twitter, icons, and default robots: `app/layout.tsx`.
- Route metadata: page-level exports/generators.
- Structured data: `lib/seo-schema.ts` and page templates.
- Sitemap: `app/sitemap.ts`, including final public routes, city pages, resources, and Soro blog posts.
- Robots: allows public routes; disallows `/admin`, `/api`, and `/quote`.
- Redirects: `next.config.mjs`.
- SEO datasets/utilities: `lib/seo.ts`, `lib/city-pages.ts`, `lib/resources.ts`, `lib/soro-blog.ts`.
- Audits: `scripts/audit-internal-links.ts`, `scripts/audit-seo-content.ts`.
- Tracking: GTM and production-only Vercel Analytics.

## Tests and validation

There is no automated unit, integration, or browser test suite. Existing validation consists of:

- Next production build/type checking;
- ESLint script, currently blocked by missing flat config;
- two SEO audit scripts;
- documented manual quote smoke test;
- pricing/distance reference checks;
- route health and local SEO checklists.

## Findings requiring follow-up decisions

1. Canonical quote submission exists both as a server action and JSON API; Astro should call one documented server boundary, not copy pricing logic.
2. `/request-availability` uses a legacy calculation path with a 30-mile fallback, while the canonical calculation uses a 50-mile fallback plus manual-review metadata.
3. Soro is the current blog source, while the target calls for CloudCannon blog content. Ownership and import/cutover rules must be decided.
4. `quote_agreements` and `quote_deposits` exist in schema but workflow code primarily updates `quote_requests`.
5. Booking/calendar operations are represented by quote statuses and event dates; there is no dedicated booking/calendar table or double-booking API.
6. Webhook verification functions accept requests when their signature secret/key is absent. Production configuration must be audited before cutover; semantics are unchanged in this phase.
7. The quote-send route changes status before email delivery. A send failure can leave `status = quote_sent` without `quote_sent_at`; address only in a dedicated workflow-safety PR.
8. Current README says merges to `main` auto-deploy through v0/Vercel; deployment separation needs an explicit plan before moving routes.
