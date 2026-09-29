# Protected admin extraction plan

Status: planning only, 2026-09-29. This document describes the checked-out repository. It does not assert that production DNS, provider callbacks, Supabase policies, or authenticated journeys have been verified. No application files, routes, credentials, or production settings change in this phase.

## Pre-build brief

| Field | Plan |
| --- | --- |
| Workstream | Protected admin extraction architecture |
| Application | Next.js admin; root Next.js customer workflow; Astro public web; shared backend |
| User workflow being improved | Operators reach the existing quote, booking, pricing, agreement, deposit, calendar, and media tools at an independent admin origin. |
| Current implementation | Root Next.js owns `/admin/**`, `/api/admin/**`, `/auth/callback`, customer routes, webhooks, and operational libraries. `apps/web` is the Astro public app. |
| Current pain point | One Next.js deployment couples protected admin releases to customer routes and legacy public routes. |
| Proposed change | Stage an `apps/admin` Next.js deployment with the same `/admin` and `/api/admin` paths, separate auth cookies, and controlled API/domain cutover. Keep the root Next.js workflow deployment until separately retired. |
| Routes affected | Eventually `/admin/**`, `/api/admin/**`, and admin auth callback; provider callbacks only after their ownership is decided. Customer paths stay put. |
| Files likely affected | Later phases: `app/admin/**`, `app/api/admin/**`, `components/admin/**`, required `components/ui/**`, `lib/admin-auth.ts`, Supabase adapters, root scripts/config, origin helpers, tests. None now. |
| Content or data involved | `quote_requests`, options, tokens/events/history, pricing settings, media, Supabase Auth, provider references. No data migration is proposed. |
| Status fields involved | Quote, agreement, deposit, test quote, manual distance, manual override, booking date and provider timestamps/IDs. |
| Customer-visible risk | High if quote links, sends, provider callbacks, or booking transitions change host or behavior. |
| SEO risk | Low for protected admin if noindex is preserved; high if root public/customer routing is changed unintentionally. |
| Security risk | High if service-role access, cookie scope, callback allowlists, direct API authorization, or webhook signature verification changes. |
| Accessibility considerations | Preserve current shell, focus, labels, errors, responsive calendar and status text. No screen redesign is in scope. |
| Mobile considerations | Preserve existing sheet navigation, quote forms and calendar access at narrow widths. |
| Migration or rollback strategy | Parallel preview, path-compatible cutover, keep root handlers available until verified, reversible DNS/proxy routing, no schema rewrite. |
| Validation steps | Independent builds; route/auth/API matrix; non-admin denial; safe quote fixtures; provider sandbox callbacks; old and new URL checks; rollback rehearsal. |

## Decisions and preservation boundary

1. Keep the admin path prefix on the new host: `https://admin.signatureluxevents.com/admin` and same-origin `/api/admin/**`. A later `/` alias is optional; changing paths during extraction adds avoidable risk.
2. Keep `/quote/[token]`, `/api/quote/[token]/respond`, `/api/quote/[token]/message`, `/request-quote`, quote request submission, and booked-date lookup on the root Next.js customer workflow surface. Do not copy their route handlers into `apps/admin`.
3. Keep one Supabase project and migration history. The split is a deployment/code ownership change, not a data or status migration. Keep existing authorization, pricing snapshots, token hashing/expiry, one-booking-per-day enforcement, and provider transitions.
4. Do not create a generic `packages/shared` server bundle. Share only stable, environment-neutral contracts/pure utilities after explicit consumer and dependency checks. Server-only services may remain in the root until a safe workspace package boundary is designed, or live as app-local copies temporarily with a single maintained source strategy; never maintain two divergent calculation engines.
5. Keep admin navigation and screen hierarchy as currently implemented for extraction. `information-architecture` here governs host/path ownership, legacy entry links, and callback links; screen restructuring belongs to a later redesign phase.

## Current-state route matrix

Classification is by current owner and eventual extraction boundary, not by URL visibility. “Root” means the existing root Next.js app.

| Current route(s) | Class | Current behavior / future owner |
| --- | --- | --- |
| `/admin`, `/admin/calendar`, `/admin/pricing`, `/admin/site-media`, `/admin/distance-settings` | ADMIN UI | Root protected UI; move as a path-compatible group to `apps/admin`. |
| `/admin/quotes/[quoteId]` | ADMIN UI | Live quote detail; move with all same-origin admin APIs. |
| `/admin/login` | ADMIN UI | Password login; move with admin SSR auth. |
| `/admin/settings`, `/admin/homepage-media` | ADMIN UI | Redirects to `/admin/pricing` and `/admin/site-media`; preserve redirect behavior initially. |
| `/admin/layout`, `/admin/login/layout`, `/admin/loading`, `/admin/error` | ADMIN UI | Layout/noindex and route states; move with UI. |
| `/api/admin/logout`, `/api/admin/pricing`, `/api/admin/site-media`, `/api/admin/homepage-media` | ADMIN API | Auth/session and configuration/media writes; move with UI. |
| `/api/admin/quotes/test`, `/api/admin/quotes/[quoteId]`, `/api/admin/quotes/[quoteId]/agreement`, `/deposit`, `/email-preview`, `/recalculate`, `/send`, `/send-test`, `/send-agreement`, `/send-deposit-invoice` | ADMIN API | Quote reads/writes, test copy, previews, external sends; move atomically with admin UI after parity. |
| `/api/admin/quotes/[quoteId]/options`, `/options/[optionId]`, `/options/[optionId]/recalculate` | ADMIN API | Option CRUD/recalculation; move atomically with admin UI. |
| `/api/admin/migrations/run` | LEGACY / CANDIDATE FOR REMOVAL | Admin-authenticated GET, production-disabled, direct `pg` connection in nonproduction. Decide removal or restricted dev tooling before extraction; do not deploy automatically. |
| `/auth/callback` | BACKEND / INFRASTRUCTURE | Supabase code exchange currently redirects to `/admin`; admin-specific callback must move/receive a distinct redirect URL. Audit whether any other flow calls it first. |
| `/quote/[token]` | CUSTOMER WORKFLOW | Server token lookup/view event and client response UI; stays root. |
| `/api/quote/[token]/respond`, `/api/quote/[token]/message` | CUSTOMER WORKFLOW | Token validation, DB writes/RPC, admin email; stays root. |
| `/api/quote/respond` | LEGACY / CANDIDATE FOR REMOVAL | Explicit HTTP 410 retired endpoint; preserve 410 until consumers/old links are assessed. |
| `/request-quote`, `/request-availability`, `/api/quote-requests`, `/api/availability/booked-dates`, `app/actions/quote-request.ts`, `request-availability.ts` | CUSTOMER WORKFLOW | Form, submission, booking lookup; root during extraction. `/request-availability` currently redirects to `/request-quote`. |
| `/api/webhooks/square`, `/api/webhooks/dropbox-sign` | BACKEND / INFRASTRUCTURE | Provider callbacks write operational quote fields; leave on verified callback origin in initial extraction. Moving requires separate provider URL/signature cutover. |
| `/contact` and `app/actions/contact.ts` | PUBLIC WEB | Public form/action on root during public migration; outside admin. |
| `/`, `/start-here`, `/our-restrooms`, `/luxury-restroom-trailer-rentals`, `/luxury-restroom-trailer-features`, `/gallery`, `/faq`, `/resources`, `/resources/[slug]`, `/blog`, `/blog/[slug]`, `/service-areas`, `/service-areas/[citySlug]` | PUBLIC WEB | Legacy root public routes; Astro migration is independent. |
| `/weddings`, `/wedding-restroom-trailer-rentals`, `/special-events`, `/private-event-restroom-trailers`, `/corporate-event-restroom-trailers`, `/festival-community-event-restroom-trailers`, `/construction-long-term`, `/construction-long-term-restroom-trailer-rentals`, `/disaster-relief-government`, `/emergency-disaster-relief-restroom-trailers` | PUBLIC WEB | Legacy public pages and redirects; outside admin. |
| `/lansing-mi`, `/east-lansing-mi`, `/okemos-mi`, `/haslett-mi`, `/grand-ledge-mi`, `/dewitt-mi`, `/jackson-mi` | PUBLIC WEB | Legacy city routes redirected by `next.config.mjs`; outside admin. |
| `/robots.txt`, `/sitemap.xml`, root icons, `app/layout.tsx` | PUBLIC WEB | Root public SEO/layout; do not copy marketing metadata, GTM, or public canonical to admin. |
| `apps/web/src/pages/[...slug].astro`, `/design-system` | PUBLIC WEB | Astro content routes; no admin data or secrets. |

### Admin page dependency matrix

All protected pages also depend on `proxy.ts` matching `/admin/:path*`, Supabase Auth, the admin layout/shell, UI primitives, and root `app/layout.tsx` styles/fonts today. The new admin needs its own root layout and CSS with noindex/no-store protection; it should not inherit marketing analytics or canonicals.

| Route | Server component/data | Client component / same-origin API | Tables and external effects |
| --- | --- | --- | --- |
| `/admin` | `getQuoteRequests` (`createAdminClient`, row mapping, development mock fallback) | `quote-requests-dashboard`, `booking-calendar`, `admin-status-badge`; `/api/admin/quotes/test` | `quote_requests`, `quote_options`; test quote creation; no ordinary read side effect. |
| `/admin/quotes/[quoteId]` | Supabase SSR `createClient`, `mapQuoteRequestRow`; same-date query, pricing read | `quote-detail-editor`, `same-date-requests-panel`; quote/option CRUD, recalc, preview, send, agreement, deposit APIs | `quote_requests`, `pricing_settings`, plus API tables below; emails, Dropbox Sign, Square may follow explicit actions. |
| `/admin/calendar` | `createAdminClient`, date-only range helpers | `BookingCalendar`, `UpcomingBookedEvents`; links to quote detail | `quote_requests`; read-only calendar, booking state comes from quote status/date and DB constraints. |
| `/admin/pricing` | Supabase SSR `createClient`, `DEFAULT_PRICING` | `pricing-settings-editor`; PUT `/api/admin/pricing` | `pricing_settings`; changes affect later calculations, not existing persisted snapshots automatically. |
| `/admin/site-media` | `fetchAllSiteMedia` uses Supabase SSR | `site-media-manager`; `/api/admin/site-media`; browser Supabase Storage | `site_media`, `site-media` storage bucket; public imagery may change. |
| `/admin/distance-settings` | None | Client-only component, no API | Displays hard-coded origin and alert; apparent save does not persist. Preserve behavior for extraction and flag for later correction. |
| `/admin/homepage-media` | Redirect | None | Redirect to site media; `homepage-media-manager` and API remain present but no active page. Verify any external/internal callers before retirement. |
| `/admin/settings` | Redirect | None | Redirect to pricing. |
| `/admin/login` | No server data | Supabase browser client `signInWithPassword`, app metadata check, UI fields | Auth cookies/session; no quote write. |

`components/admin/**` is app-specific UI: `admin-shell`, `admin-page-header`, `admin-feedback`, `admin-status-badge`, `booking-calendar`, `same-date-requests-panel`, `quote-requests-dashboard`, `quote-detail-editor`, `pricing-settings-editor`, `pricing-settings-form`, `site-media-manager`, `homepage-media-manager`. The last two legacy-adjacent components and `pricing-settings-form` need caller verification, not immediate deletion.

### Admin API dependency matrix

Every listed admin handler calls `requireAdminUser()` (server `auth.getUser()` plus `app_metadata.is_admin === true`) before its privileged work; `proxy.ts` is a second route gate. `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` server-side for most data operations. Keep methods, JSON shapes, status codes, validation, and error behavior while extracting.

| Route after `/api/admin` | Method | Key dependencies | Data / customer-visible effect |
| --- | --- | --- | --- |
| `/logout` | POST | Supabase SSR cookie client | Ends admin session. |
| `/pricing` | PUT | `DEFAULT_PRICING`, service role | Upserts `pricing_settings`; future quote calculations. |
| `/site-media` | PUT, POST | media registry, service role | `site_media` updates; public image references. |
| `/homepage-media` | PUT | service role | `homepage_media`; verify usage before migrating/removing. |
| `/quotes/test` | POST | pricing engine, service role | Creates test `quote_requests` and copies `quote_options`; must retain test markers. |
| `/quotes/[quoteId]` | GET, PATCH | update schema, calculation, financial lock, service role | `quote_requests`, `quote_status_history`; can modify status, totals, notes, provider references. |
| `/quotes/[quoteId]/agreement` | PATCH | agreement update schema, service role | Manual agreement fields on `quote_requests`; customer-facing state can change. |
| `/quotes/[quoteId]/deposit` | PATCH | deposit update schema, service role | Deposit fields on `quote_requests`; payment state can change. |
| `/quotes/[quoteId]/email-preview` | GET | email template, date helper, `CUSTOMER_WORKFLOW_URL` | `quote_requests`, `quote_options`; preview only; link host must be customer host. |
| `/quotes/[quoteId]/recalculate` | POST | `buildQuoteCalculation`, pricing, financial lock | `quote_requests`, `quote_approval_tokens`, `quote_status_history`; recalculation may revoke approval link and change snapshot. |
| `/quotes/[quoteId]/options` | GET, POST | option schema/calculation/lock | `quote_requests`, `quote_options`; option state and financials. |
| `/quotes/[quoteId]/options/[optionId]` | PATCH, DELETE | option schema/calculation/lock | `quote_requests`, `quote_options`; option mutation/deletion. |
| `/quotes/[quoteId]/options/[optionId]/recalculate` | POST | option calculation/lock | `quote_requests`, `quote_options`; option financial snapshot. |
| `/quotes/[quoteId]/send` | POST | token generator/hash, Resend abstraction/template, origin helper, pricing | `quote_requests`, `quote_options`, `quote_approval_tokens`, `quote_link_events`, `quote_status_history`; customer email with `/quote/<token>`. |
| `/quotes/[quoteId]/send-test` | POST | self-call to `/api/admin/quotes/test`, token/email/origin | Same quote/token/event tables; test email and cloned quote. Preserve same-origin cookie forwarding behavior. |
| `/quotes/[quoteId]/send-agreement` | POST | availability check, Dropbox Sign | `quote_requests`; sends signing request, records provider IDs/status. |
| `/quotes/[quoteId]/send-deposit-invoice` | POST | availability check, financial snapshot, Square | `quote_requests`; creates invoice and stores link/provider IDs/status. |
| `/migrations/run` | GET | `pg`, `POSTGRES_URL_NON_POOLING`/`POSTGRES_URL` | Nonproduction SQL execution, production 403. Separate security decision before inclusion. |

## File ownership matrix

| Files | Class | Extraction decision |
| --- | --- | --- |
| `app/admin/**`, `components/admin/**` | ADMIN UI | Move together later; preserve route paths and component behavior. |
| `app/api/admin/**`, `lib/admin-auth.ts`, `proxy.ts` admin matcher | ADMIN API / BACKEND / INFRASTRUCTURE | Move/provide equivalent within admin app; `proxy.ts` must not accidentally gate customer routes. |
| `lib/supabase/server.ts`, `client.ts`, `admin.ts` | BACKEND / INFRASTRUCTURE | App-specific adapters. Recreate or relocate only with explicit server/client entry points and identical auth behavior. Never export service role through a client barrel. Root customer app still needs its own service role client. |
| `app/auth/callback/route.ts` | BACKEND / INFRASTRUCTURE | Admin callback candidate; inventory actual callers and Supabase redirect allowlist before a new admin callback is enabled. |
| `app/quote/[token]/**`, `components/quote/quote-approval-view.tsx`, `app/api/quote/[token]/**` | CUSTOMER WORKFLOW | Retain root. `components/quote/quote-approval-view.tsx` uses retired `/api/quote/respond`; verify whether reachable before removal. |
| `app/api/quote-requests/**`, `app/api/availability/**`, `app/actions/quote-request.ts`, `request-availability.ts`, `components/quote-request-form.tsx`, `components/request-availability-form.tsx`, `components/availability-date-picker.tsx` | CUSTOMER WORKFLOW | Retain root; public entry routing remains a separate decision. |
| `app/api/webhooks/**`, `lib/integrations/square.ts`, `dropbox-sign.ts` | BACKEND / INFRASTRUCTURE | Provider-facing server-only code. Keep current callback owner until a separately tested provider cutover. |
| `lib/email/client.ts`, `templates.ts`, `send-quote-notification.ts`; `lib/agreements/merge-fields.ts` | SHARED DOMAIN LOGIC / BACKEND / INFRASTRUCTURE | Templates and agreement merge fields have admin/customer dependencies; provider transport and secrets stay server-only. Inspect callers before sharing a pure template or contract. |
| `lib/quotes/types.ts`, `schema.ts`, `status.ts`, `financial-lock.ts`, `lib/types/quote.ts`, `lib/availability.ts`, `lib/date-only.ts`, `lib/pricing-engine.ts`, `lib/pricing/defaultPricing.ts`, `lib/quote-approval.ts` | SHARED DOMAIN LOGIC | Candidate pure modules; split server-only token crypto from browser-safe types. Preserve exact versions and calculations. |
| `lib/quotes/build-quote-calculation.ts`, `getQuoteRequests.ts`, `quote-options.ts`, `calculateQuote.ts`, `mockQuotes.ts`, `lib/availability-server.ts`, `lib/distance-calculator.ts` | SHARED DOMAIN LOGIC / BACKEND / INFRASTRUCTURE | `build-quote-calculation` and availability server are operational server code; `getQuoteRequests` is admin read adapter; `distance-calculator` is legacy server action with a different 30-mile fallback. Audit callers before ownership changes. |
| `lib/app-origins.ts` | SHARED DOMAIN LOGIC | All three origins are consumed across root/customer/admin. Candidate small server-only configuration contract; do not import into client bundles. |
| `lib/site-media.ts`, `homepage-media.ts`, `site-media-registry.ts`, `lib/content/**`, `lib/seo.ts`, `seo-schema.ts`, `resources.ts`, `soro-blog.ts`, `blog-images.ts`, `homepage-images.ts` | PUBLIC WEB / SHARED DOMAIN LOGIC | `site-media.ts` mixes cached public reads with an admin SSR read; split at boundary later. Editorial content/SEO stay public. Media registry may be used by admin and public. |
| `components/ui/**`, `lib/utils.ts` | SHARED UI | 57 generic Radix/shadcn-style files exist. Copy only transitive imports actually needed by admin into its local UI layer initially; a `packages/ui` package is justified only if both apps need the same React runtime, theme, and release cadence. Astro currently uses Astro components. |
| `app/layout.tsx`, `app/globals.css`, root `public/**`, `next.config.mjs` | PUBLIC WEB / BACKEND / INFRASTRUCTURE | Admin needs an independent minimal root layout/styles/config; do not import public SEO, canonical, analytics, or all public assets. Retain only required admin brand assets. |
| `apps/web/**`, `cloudcannon.config.yml`, public `app/**` pages and `components/**` marketing components | PUBLIC WEB | Outside extraction; CloudCannon never owns operational records. |
| `supabase/schema.sql`, `supabase/config.toml`, `supabase/seed.sql`, `supabase/migrations/**` | MIGRATION / DATABASE | Remain at workspace root, one canonical migration stream. |
| `tests/*.test.ts`, `tests/*.test.tsx`, `scripts/verify-phase5-customer-workflows.mjs` | TEST | Keep/extend for two app builds and cross-origin link contract; update path assumptions only after new app exists. |
| `app/api/quote/respond/route.ts`, `app/api/admin/migrations/run/route.ts`, unused UI candidates | LEGACY / CANDIDATE FOR REMOVAL | Retain current behavior in this phase; require usage and security evidence before removal. |

The inspected `components/ui/**` files are: `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `hover-card`, `input`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`, `use-mobile`, and `use-toast` (`.tsx` or `.ts`). Current admin imports a subset; the remainder are not extraction requirements.

## Shared code boundary and target structure

```text
apps/
  web/                         # existing Astro/CloudCannon public site
  admin/                       # future standalone Next.js deployment
    app/admin/**               # same paths as today
    app/api/admin/**
    app/auth/callback/route.ts # only if needed by verified admin auth flow
    components/admin/**
    components/ui/**           # only needed React primitives
    lib/auth/**                # server auth gate + SSR/browser adapters
    lib/server/**              # service-role and provider-only adapters
    proxy.ts
  # root Next.js app remains customer workflow during extraction
packages/
  shared/                      # only proven cross-app pure contracts/utilities
  ui/                          # defer; Astro and Next.js do not currently share UI runtime
  config/                      # optional build/TS/lint configuration, no secrets
supabase/                       # single migration history
```

First candidates for `packages/shared`: quote/option types and Zod payload contracts used by both admin and root customer app; date-only helpers; booking status constants/pure classification; pure pricing contract and financial calculation if import graph proves no server dependency. Keep `lib/quotes/build-quote-calculation.ts`, Supabase clients, email/provider clients, request-specific origins, route handlers, and token crypto in server-only ownership. `lib/quotes/status.ts` is primarily admin presentation and need not be shared. A package must declare `exports` with separate safe entry points; no broad `index.ts` that re-exports secrets or `next/*` modules. Ensure one authoritative implementation of pricing/availability rules and lockstep tests across consumers before the root/admin builds use a package.

Current coupling worth preserving or splitting deliberately:

- Admin and customer API use `lib/quotes/schema.ts`, quote types, pricing snapshots, `lib/quote-approval.ts`, email templates/transport, and `lib/app-origins.ts`.
- Admin send creates customer tokens; customer respond consumes them through Supabase RPC. The schema/DB function is the contract, not a direct browser call between apps.
- Customer quote request and admin recalculation both call `buildQuoteCalculation`, which reads `pricing_settings` and calls Google Distance Matrix with `GOOGLE_MAPS_API_KEY`; it has a 50-mile fallback and manual-review flag. Legacy `app/actions/request-availability.ts` uses `lib/distance-calculator.ts` with a 30-mile fallback and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Do not merge these silently.
- Admin calendar, admin sends, public booked-date lookup, customer request, and the database constraint share one-booking-per-day semantics. Migration `20260731020944_enforce_one_booking_per_day.sql` is the database guard. No calendar-only capacity rule should replace it.
- `site_media` serves public images while admin writes their records; moving the UI/API does not move the public read model. Browser Storage uploads require bucket policy and CORS verification on the new admin origin.

## Authentication and authorization migration

**Observed current flow.** `proxy.ts` matches only `/admin/:path*` and `/api/admin/:path*`. It allows `/admin/login`; missing Supabase public env yields a setup warning there, 503 on admin API, and a login redirect on protected pages in production. On other protected requests it creates an `@supabase/ssr` server client, calls `auth.getUser()`, returns 401 for anonymous admin API, redirects anonymous pages to `/admin/login`, returns 403 for authenticated non-admin API, and redirects non-admin pages to `/`. `app/admin/login/page.tsx` uses browser `signInWithPassword`, checks `data.user.app_metadata.is_admin`, signs a non-admin out, and pushes an admin to `/admin`. `lib/admin-auth.ts` independently calls server `auth.getUser()` and requires `app_metadata.is_admin === true` for every admin API. Pages currently rely on the proxy route gate; the quote/pricing/media server components do not each call `requireAdminUser`. `app/api/admin/logout` checks admin authorization, then signs out using an SSR cookie client. `app/auth/callback` exchanges a code for a session and always redirects to `/admin`.

**Standalone model.** Give `apps/admin` its own host-only, Secure, appropriate SameSite Supabase SSR cookies, refreshed by its own proxy. The current `@supabase/ssr` browser client reads/writes session cookies, so do not claim these cookies are HttpOnly without changing and validating the auth design. Do not set a parent-domain cookie. Customer token pages do not use the admin login cookie, and Astro does not need it. Use the same Supabase Auth project and protected `app_metadata.is_admin` claim. Verify it with `getUser()` on every protected request and again in each privileged route handler. Keep service-role calls after the authorization check. Do not trust browser-provided `user_metadata` or UI visibility. A non-admin login must remain denied; on the new host use a safe 403/access-denied or sign-out/login destination rather than redirecting to `/` on an admin-only host without a page. This is a deliberate UI-routing adaptation, not permission expansion.

The admin callback, if in use, must be on the admin origin, exchange the code there, and redirect only to a validated same-origin path. Add its exact URL to the Supabase Auth redirect allowlist and test invited/recovery flows; do not assume the current password flow uses the callback. Existing root `/auth/callback` must remain for any root consumers until audited. Preserve relative `/api/admin` calls so the browser sends admin cookies to the admin host only. The requested `admin.signatureluxevents.com` and currently configured public `www.signatureluxeevents.com` are **different registrable domains** (one extra `e` in the public domain). A browser cannot share a parent-domain cookie between them. Independent admin login is therefore required unless the intended admin domain is corrected before deployment; verify domain ownership and spelling with the user before DNS/certificates. Verify SSR refresh/cookie writes and login/logout on preview host, including expired session and cross-origin navigation. Set admin response headers/metadata to noindex and no-store, independent of robots.txt.

## Environment-variable matrix

Never copy `.env.local` values into docs, packages, browser code, or preview logs. The table records names and consumers, not values. The `.env.example` comment says `user_metadata.is_admin`; actual code and `docs/admin-setup.md` require protected **`app_metadata.is_admin`**. Correct that comment in the implementation phase.

| Variable(s) | Current consumer / required future deployment | Boundary |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Root auth/customer/public media; future admin SSR/browser auth and media uploads | Public Supabase project/anon values, but auth/DB policies still matter. |
| `SUPABASE_SERVICE_ROLE_KEY` | Root customer APIs/actions/webhooks and admin APIs/pages; future root workflow **and** admin server deployments | Server only, never `NEXT_PUBLIC_` or generic client package. |
| `ADMIN_APP_URL` | Admin links in request/customer notifications; Square signature URL today | Server origin; set to `https://admin.signatureluxevents.com` only after webhook URL dependency is decoupled or callback is moved. |
| `CUSTOMER_WORKFLOW_URL` | Admin quote preview/send/test link generation | Server origin of `/quote/**` and `/api/quote/**`; must match real routing. |
| `PUBLIC_SITE_URL` | Public return/brand links and email assets | Public origin. |
| `NEXT_PUBLIC_APP_URL`, `APP_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` | `lib/app-origins.ts` fallbacks | Migration fallbacks; explicit origins required before split. |
| `RESEND_API_KEY`, `EMAIL_PROVIDER`, `EMAIL_FROM`, optional `SENDGRID_API_KEY`, `EMAIL_FROM_ADDRESS`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` | Admin send and customer notification flows via `lib/email/client.ts`; root public actions | Provider credentials server-only; provision only on deployment that sends. |
| `GOOGLE_MAPS_API_KEY` | Canonical `buildQuoteCalculation` in root request and admin recalculation | Server-only Google Distance Matrix key on both server deployments if both calculate. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Public autocomplete and legacy `lib/distance-calculator.ts` server action | Browser-exposed autocomplete key; isolate/restrict separately from server key. |
| `BUSINESS_ORIGIN_ADDRESS` | Legacy availability action; admin distance page displays hard-coded value | Root workflow config. Canonical calculator has a hard-coded address; resolve divergence in a separate behavior-reviewed phase. |
| `DROPBOX_SIGN_API_KEY`, `DROPBOX_SIGN_TEMPLATE_ID`, `DROPBOX_SIGN_TEST_MODE`, `DROPBOX_SIGN_WEBHOOK_SECRET` | Admin agreement send; root webhook verification | Split send and callback secrets by actual deployment owner; verify sandbox/live mode. |
| `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`, `SQUARE_WEBHOOK_SIGNATURE_KEY` | Admin deposit invoice; root Square webhook | Split by endpoint owner; signature uses exact callback URL. |
| `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` | Nonproduction `/api/admin/migrations/run` only | Prefer deployment migration job; do not automatically provision on production admin. |
| `NEXT_PUBLIC_BUSINESS_PHONE`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Root public SEO | Public web only; admin does not need these. |
| `NODE_ENV`, `NEXT_DIST_DIR` | Runtime/build configuration | Per deployment; admin build needs its own output and root. |

## API, deployment, DNS, and callback model

Deploy three separately scoped applications from the same repository: `apps/web` Astro for public pages, root Next.js for customer workflow and initially provider webhooks, and `apps/admin` Next.js for `/admin/**` and `/api/admin/**`. The root app may still serve legacy public routes during the broader Astro migration. Configure independent builds, environment sets, preview URLs, access logging, and rollback deployment IDs. `apps/admin` should not expose public quote request or token paths. The same Supabase database and Auth project remain authoritative.

DNS: point `admin.signatureluxevents.com` to the admin deployment only after confirming that exact domain and preview parity. It differs from the current public `signatureluxeevents.com` domain; do not silently substitute one for the other. TLS must cover the confirmed admin host. Keep customer quote URL routing on its established origin; a public-origin path proxy must forward both `/quote/**` and `/api/quote/**` plus required Next.js assets to the root workflow deployment. Do not redirect token URLs to admin. Old `/admin/**` GET links can be redirected to the new host after cutover; preserve path and query. Do not 301/302 unsafe `/api/admin/**` mutations: move same-origin clients with the admin UI, and leave old root handlers temporarily protected/disabled by a deliberate cutover policy rather than relying on method-changing redirects. Treat old and new write endpoints against one database as a dual-write risk; use one active operator host and revoke old writes once verified. Define a short observation window, then remove old handlers in a separate PR.

**Provider callback decision gate.** Square verifies `x-square-hmacsha256-signature` against `getAdminAppOrigin(request) + '/api/webhooks/square'`. If `ADMIN_APP_URL` changes while the Square callback still hits the root host, signature verification can fail. Before cutover, either (A) keep the webhook on its existing origin and introduce a dedicated exact `SQUARE_WEBHOOK_URL` used for verification, or (B) move webhook to admin in a separate, provider-registered callback cutover with raw-body tests and rollback. Dropbox Sign also has an exact webhook endpoint/secret and must be registered and tested wherever it lives. Do not run two independently active callbacks without idempotency/duplicate-event evidence. Record actual registered provider URLs and delivery history in the deployment checklist; they are not established by repository code alone.

`app/api/admin/quotes/[quoteId]/send-test` calls the test-clone API using `new URL('/api/admin/quotes/test', request.url)` and forwards authorization context; test this specifically behind the new host/proxy. Admin media browser uploads also need CORS/storage-policy checks. Customer response/message emails build admin links from `ADMIN_APP_URL`, while admin sends build token links from `CUSTOMER_WORKFLOW_URL`; verify both directions with safe test records.

## Preserve / Improve / Restructure / Replace

| Choice | Scope | Rationale and regression guard |
| --- | --- | --- |
| **Preserve** | Quote, agreement, deposit, booking status families and persisted financial snapshots | No semantic changes. Compare fixtures and DB fields before/after. |
| **Preserve** | Customer token URLs, hashing, expiry, single-use RPC, noindex/no-store | Keep route and API on root; validate valid/invalid/expired/used links. |
| **Preserve** | Existing admin screen paths, navigation labels, interactions, same-origin APIs | Makes extraction testable without a redesign. |
| **Preserve** | Supabase Auth project, `app_metadata.is_admin`, server API checks, service role secrecy | Deny anonymous/non-admin direct access; inspect bundles and headers. |
| **Improve** | Deployment isolation, explicit origins, auth denial destination, per-app env inventory | Needed for host split; parity checks prevent behavior drift. |
| **Improve** | Cross-app test coverage and callback observability | Existing tests emphasize pricing/availability, not full auth/providers. Use sandbox fixtures and delivery logs. |
| **Restructure** | Root admin UI/API into `apps/admin`; minimal app-local SSR/provider adapters | Separate releases while retaining paths and backend contracts. |
| **Restructure** | Mixed `lib/site-media.ts`, origin helper and pure domain contracts only when real consumers warrant | Avoid importing Next cache/server or secrets into Astro/client packages. |
| **Replace / defer** | Nonproduction migration runner and retired response endpoint | Candidate removal only after caller/security audit; no removal now. |
| **Defer** | Distance settings false save, legacy 30/50-mile paths, quote detail redesign | Real issues but changing them during extraction obscures parity. |

## Migration phases and rollback points

1. **Freeze evidence:** capture current route inventory, package/import graph, builds/tests, env names, Supabase Auth redirect allowlist, provider webhook URLs, current DNS/proxy maps, known production links, and safe quote scenarios. Record live facts separately from repository facts.
2. **Contract tests:** add cross-app origin tests, auth role/direct API tests, booking/pricing/token tests, and provider sandbox callback tests. Define response/body/DB field parity snapshots. Do not use real customer records for mutation testing.
3. **Workspace scaffold:** add `apps/admin` package, Next config/root layout/CSS/proxy, independent scripts and CI build; no traffic or route deletion. Keep `/admin` prefix, noindex and no-store.
4. **Server boundary:** install app-local Supabase SSR/browser/service-role adapters and `requireAdminUser`; move protected UI and API handlers in reviewable batches without altering contracts. Introduce a shared pure package only after consumer tests show it is needed; otherwise keep a single controlled source and build packaging strategy.
5. **Preview parity:** deploy isolated admin preview, configure Supabase Auth allowed callback, provision least necessary env, verify anonymous/admin/non-admin access, every page/API, cookie refresh/logout, UI state, mobile/keyboard, email previews/test sends, booking and provider sandbox actions. Root customer paths remain live.
6. **Callback/origin preparation:** establish actual Square/Dropbox callback ownership and exact signature URL; decouple Square URL or migrate callback separately. Confirm `ADMIN_APP_URL` and `CUSTOMER_WORKFLOW_URL` generated links before changing DNS.
7. **Cutover:** route admin subdomain to new deployment, update admin notification links, route legacy `/admin/**` GET to new host, and stop old admin writes only after new API verification. Watch auth failures, API 4xx/5xx, email sends, provider callbacks, DB state and customer response links.
8. **Observation and cleanup:** retain reversible root deployment and migration rollback window. Remove root admin UI/API, unused dependencies and legacy candidates only in a later reviewed PR after logs and tests prove no callers. Keep root customer workflow until its own migration is approved.

Rollback: route `admin.signatureluxevents.com` and old GET admin paths back to the known root deployment, restore prior `ADMIN_APP_URL`/callback URL configuration as one change, re-enable exactly one old admin writer, and verify login, quote read/write, test email, customer link, and provider events. Do not roll back database migrations merely to reverse an app extraction. Reconcile any in-flight provider sends/invoices before replaying actions; never blindly retry customer-visible mutations.

## Regression test matrix

| Boundary | Required cases | Evidence gate |
| --- | --- | --- |
| Build/route | Root Next, `apps/web` Astro, future `apps/admin` build separately; all route paths and redirects; no admin route in Astro | CI output and route manifest. |
| Auth | Anonymous page/API; admin login/logout/refresh; expired cookie; non-admin login and direct page/API; missing env; callback/invite/recovery | Browser + HTTP status/header captures on preview. |
| Security | Service role absent from client bundles; direct API authorization; noindex/no-store; safe cookie scope; CSRF/origin behavior on mutations; no token in logs | Bundle scan, headers, negative tests. |
| Quote pipeline | New/under-review/manual-distance, sent viewed/unviewed, approved/change requested, agreement/deposit, booked/completed, declined/cancelled/expired, test hidden/shown | Safe fixtures and before/after DB fields. |
| Pricing/mileage | Canonical calculation, tax/deposit/balance, manual override lock, option recalculation, Google failure fallback/manual flag, legacy availability path | Existing Vitest plus endpoint parity. |
| Booking/calendar | Same-date pending/test vs blocking, one-booking-per-day DB constraint, date-only/timezone, calendar links and conflict messages | Existing availability/migration tests plus preview fixture. |
| Email/customer | Preview host, real send to controlled test inbox, valid/expired/used token, approve/change/message, admin notification link, no admin cookie required | Test inbox, link/response and DB history proof. |
| Agreement/payment | Dropbox Sign send and signed webhook; Square invoice and paid webhook; duplicate/retry; failed provider then DB update | Provider sandbox + signature and state evidence. |
| Media | Storage upload from admin host, `site_media` update and public read, alt text/active state | Preview browser + storage/CORS record. |
| Accessibility/responsive | Login, shell, dashboard, quote detail, calendar, forms at mobile/tablet/desktop; keyboard focus, status/error feedback | Rendered preview checks; no design changes implied. |
| Rollback | Old login/quote write/callback route restored, no duplicate webhooks or email sends, customer links still open | Staging rehearsal with controlled records. |

Existing automated checks: `tests/availability.test.ts`, `booking-availability-migration.test.ts`, `quote-pricing.test.ts`, `quote-presentation.test.tsx`, `supabase-migration.test.ts`, and `scripts/verify-phase5-customer-workflows.mjs`. They cover important pure/schema behavior but do not prove hosted Supabase Auth, RLS, provider delivery, DNS, or end-to-end customer workflows. Run root `test`, `typecheck`, `lint`, `build`, `verify:phase5`, `check:web`, and `build:web` as baselines when implementation begins; record any failures before edits.

### Planning-phase local validation, 2026-09-29

- Route-document check: every current `app/admin/**/page.tsx` and `app/api/admin/**/route.ts` path appears in this plan.
- `corepack pnpm test`: 17 passed, 2 failed. Both failures are in `tests/booking-availability-migration.test.ts`, which reads missing `supabase/migrations/20260731014028_enforce_one_booking_per_day.sql`; the repository contains `20260731020944_enforce_one_booking_per_day.sql`. The initial sandboxed run also hit an esbuild filesystem-access error; a permitted rerun produced the test results above. No test or migration file was changed.
- `corepack pnpm typecheck`: failed in generated `.next` type files referencing absent `app/api/admin/availability-blocks/**` routes. This is a generated-output baseline issue, not evidence of a current source route. No generated files were cleared or modified.
- No browser, production, provider, Supabase role, lint, or build validation was performed in this planning phase.

## Known risks / unresolved decisions

1. **Square signature host coupling:** `getAdminAppOrigin()` currently supplies the verification URL even though the webhook route is outside `/api/admin`. Resolve before setting the new admin origin.
2. **Admin callback ownership:** `/auth/callback` redirects to root `/admin`; actual invite/recovery use and Supabase allowlist require live verification.
3. **Page-level auth reliance:** protected server components rely on proxy gating. Preserve the proxy matcher and add direct-access tests; consider explicit server page checks in a separate security-reviewed change.
4. **Privileged shared modules:** root customer workflows and admin both require service role, pricing and email code. A package boundary must prevent client imports and divergent calculation versions.
5. **Media dual ownership:** `site_media` is publicly read and admin written; CloudCannon editorial ownership may eventually supersede some entries. Do not drop the operational editor during extraction.
6. **Provider partial failures:** sending agreement/invoice precedes database update; retries may duplicate external actions. Preserve current behavior and use sandbox/reconciliation before cutover; hardening is separate work.
7. **Different mileage paths:** canonical 50-mile fallback and legacy 30-mile fallback coexist. Do not normalize during extraction.
8. **Hard-coded distance settings:** admin screen's save only displays an alert and has hard-coded text; it is not a persistent setting. Document for later UX correction.
9. **Legacy callback and endpoints:** migration runner is nonproduction but privileged; `/api/quote/respond` is 410; homepage media API/component exist despite page redirect. Callers need evidence before removal.
10. **Live deployment unknowns:** actual DNS, proxy, provider callback registrations, Auth redirect URLs, Storage CORS/RLS, production schemas and current environment values are outside this source audit. Treat all as cutover gates, not established facts.
11. **Admin domain spelling:** the requested admin host and current public host have different registrable domains. Confirm intent before any DNS, TLS, cookie, or email-link cutover.
