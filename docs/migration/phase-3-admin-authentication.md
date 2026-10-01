# Phase 3: standalone admin authentication

Base: `f63e39187f51be77f6c4134b75ff568384df4055`. This is the standalone extraction Phase 3, distinct from the earlier public component-system Phase 3. No production cutover is authorized or performed.

## Pre-build brief and observed scope

| Field | Decision |
| --- | --- |
| Workstream / application | Standalone authentication / Next.js admin |
| User workflow | Operator password login, protected access, refresh, logout |
| Current implementation / pain | Root owns working auth and operations; standalone has an unprotected informational placeholder |
| Proposed change | Admin-local Supabase adapters, server authorization, proxy, password form, protected shell, read-only session API |
| Routes affected | Standalone `/` redirects to `/admin`; `/admin`, `/admin/login`, `/api/admin/session`; proxy guards future admin pages/APIs |
| Files likely affected | `apps/admin/app`, `apps/admin/lib`, `apps/admin/proxy.ts`, tests and this record |
| Content/data | Verified Supabase user identity and auth cookies only |
| Status fields | Strict `app_metadata.is_admin === true`; no operational statuses |
| Customer-visible risk | No customer routes, tokens, emails, provider or production routing changes |
| SEO | Retain noindex/nofollow/noarchive and no-store; no marketing metadata |
| Security | Verify identity on server, fail closed, check each handler independently, gate service-role construction |
| Accessibility | Labeled fields, autocomplete, visible focus, text errors, live status, native form semantics |
| Mobile | Single-column form, minimum 44px controls, account/logout wrap |
| Rollback | Revert only Phase 3 additive changes; root remains operational |
| Validation | Role and action tests, builds/checks, HTTP headers, browser/hosted checks where available |

## Audit, workflow and screen specification

This is a bounded authentication foundation, not a substantial operational redesign. Preserve root Next.js routes, all business APIs, Supabase data/schema, customer workflows and existing callback. Replace the standalone public placeholder with a protected rendering of the same restrained navy/ivory shell. Add only authentication mechanics; no operational navigation or screens move.

Roles: anonymous/invalid session gets a login redirect for pages or 401 for APIs; a verified non-admin gets login with access-denied explanation or API 403; a verified admin proceeds. Configuration/transport failures fail closed (503 for APIs, login with unavailable message for pages). API handlers must still call `requireAdminUser()` themselves. The proof endpoint does so and returns only `{ ok: true }` to admins.

Login screen: identity, heading, email, password, inline status, submit. Native validation precedes the server action; pending disables duplicate submission. Bad credentials and unavailable auth produce recoverable messages. Email remains in the uncontrolled input on failure; passwords are never returned in action state or URLs. The action verifies the authenticated user again with `getUser`; a non-admin is denied and local sign-out is attempted. Even if that sign-out fails, page/API authorization still denies access. Validated return paths are restricted to `/admin` descendants; external origins, login loops, backslashes, encoded paths and traversal outside admin fall back to `/admin`.

Protected shell: existing identity and informational content plus current email (or generic administrator label) and logout. No quotes, calendar, pricing, media, distance settings, or provider actions. Logout is a server action using local scope; it reports errors and redirects to login after success. Next.js server actions retain their framework same-origin POST checks. No GET mutation route is added. No auth callback or recovery/signup UI is introduced.

Only auth session state is written. Operational data is neither read nor written. Failure recovery is retry/login; no database rollback or fixture cleanup is needed. Automated fixtures use fabricated users and mocked Auth responses, never production credentials.

## Architecture and changed files

- `apps/admin/lib/supabase/config.ts`: browser-safe config and shared host-only cookie options.
- `client.ts`: browser adapter using only public URL/key; reserved for future browser interactions (the current login uses a server action).
- `server.ts`: per-request SSR anon-key adapter with request cookies.
- `admin.ts`: server-only service-role factory, internally requiring authorization before reading the key or constructing a client. No Phase 3 route uses this factory.
- `apps/admin/lib/auth-policy.ts`: verified-user authorization and conservative return-path validation.
- `apps/admin/lib/admin-auth.ts`: server-only page/API guards and denial responses.
- `apps/admin/proxy.ts`: Next.js 16 proxy for `/admin/:path*` and `/api/admin/:path*`, with login exempt. Static/framework assets are outside its matcher.
- `apps/admin/app/admin/actions.ts`, `login/*`, `logout-button.tsx`, `page.tsx`: password login, logout and guarded shell.
- `apps/admin/app/api/admin/session/route.ts`: non-destructive independently guarded test API.
- `apps/admin/app/page.tsx`: redirect to the protected entry point.
- `apps/admin/.env.example`: clarify active authentication configuration.
- `tests/standalone-admin-auth.test.ts`: 21 added authorization/action/proxy tests.

`getUser()` obtains the current Auth user server-side; neither `getSession()` nor `user_metadata` authorizes access. Proxy refresh writes cookies into both the forwarded request and outgoing response; redirect/API denials preserve refreshed/deleted cookies. Pages repeat authorization instead of trusting proxy alone. The service-role module imports `server-only`; no client component imports it.

## Cookie/session model

Cookie base name is `sl-admin-auth` (SSR may split large values into chunks). This avoids collision with the root application's default cookie name during local development on the same hostname. Options: `Path=/`, `SameSite=Lax`, `Secure` in production, no `Domain`. They belong to the current host; no parent-domain sharing with Astro or customer workflows is intended. Cookies are explicitly **not HttpOnly**, matching the shared browser/SSR adapter architecture. Tokens are not logged or returned in the test API.

The proxy refreshes sessions through Supabase Auth on protected requests and preserves the refreshed cookies for subsequent navigation. Invalid/expired unrefreshable sessions return to login. Login/server actions can write cookies; Server Component writes are ignored because proxy owns refresh there. Phase 2 no-store headers cover login and actions as well as protected routes. Local-scope logout removes this session; it does not intentionally sign the operator out of all other deployments. Hosted revocation, refresh rotation and browser cookie deletion still need preview verification.

## Callback ownership and deployment requirements

Repository audit found root `app/auth/callback/route.ts` exchanges a code and redirects to root `/admin`. Root password login directly calls `signInWithPassword`; it does not invoke this callback. Searches in `app`, `components`, `lib`, `scripts` and docs found no implementations invoking OAuth, magic-link, invitation, or password-recovery redirect flows. Customer quote-token workflows do not reference this callback in repository code. Provider/dashboard email templates and actual external users of the root callback remain unverified. Keep it intact.

Password login needs no standalone callback and **no new Supabase redirect allowlist entry in this phase**. If a future approved PKCE flow requires one, reserve the shape `https://<confirmed-admin-host>/auth/callback`; implement and test it first, then allowlist that exact URL (and explicit preview URL), with server code exchange and validated same-origin admin destination. That route does not exist in this phase and must not be configured as a working callback yet. Recovery additionally needs its own specified password-update flow.

`ADMIN_APP_URL` remains environment-driven, unused until origin-dependent functionality exists. The `signatureluxeevents.com` versus `signatureluxevents.com` discrepancy remains unresolved. Confirm host ownership/spelling and HTTPS before deployment. No DNS, provider dashboard, Supabase redirect configuration, database or email changes were made.

Implementation references: [Supabase SSR integration](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy). Current SSR docs and installed 0.10.2 cookie adapter types were inspected. Changelog markdown fetch failed (web content-type rejection and shell network restriction); no Supabase dependency upgrade was attempted.

## Validation evidence

- **PASS** `corepack pnpm check:admin` before and after implementation.
- **PASS** `corepack pnpm build:admin`: `/admin` and `/admin/login` dynamic, `/api/admin/session` dynamic, proxy present.
- **PASS** `corepack pnpm check:all`: root TypeScript/lint, Astro diagnostics (0 errors/warnings/hints), admin TypeScript/lint.
- **PASS** `corepack pnpm test`: 6 files, 40 tests (19 existing + 21 new). Initial sandbox esbuild ACL failure; permitted rerun passed.
- **PASS** `corepack pnpm build:web`: 5 static pages; existing empty testimonials collection warning.
- **PASS** Root `corepack pnpm build`: 151 generated pages. Initial sandbox run could not fetch existing Google Fonts; permitted network-enabled rerun passed.
- **PASS** Production-mode local HTTP at port 3001 with dummy public auth configuration and no credentials: `/admin` and `/admin/future` return 307 to login and contain no protected account content; `/admin/login` returns 200; `/api/admin/session` returns 401.
- **PASS** Those four HTTP responses carry no-store, noindex/nofollow/noarchive, no-referrer and nosniff headers.
- **PASS (mocked)** direct handler and proxy role matrix, strict boolean claim, rejection of user-editable metadata, invalid session, independent page guard, service-role construction order, safe redirects, login/non-admin denial, logout errors and local scope, refreshed request/response cookies including redirect denial.
- **NEEDS MANUAL VALIDATION** Hosted Supabase admin/non-admin password login, real refresh rotation across navigation, logout deletion, expired/invalid session behavior, production Secure/SameSite/host scope. Mocks prove application contracts, not hosted Auth behavior.
- **NEEDS MANUAL VALIDATION** Rendered visual, keyboard, screen-reader and responsive checks at 320/375/390/768/1024/1440. Review skills were read and source semantics checked, but the browser tool reported no available browsers or apps. No screenshot or full accessibility pass is claimed.

Do not cut over production on this evidence alone. Use isolated preview accounts and HTTPS to complete the hosted/browser matrix. No operational migration begins as part of this change.

## Rollback

Revert the Phase 3 changes listed above (or its eventual commit). This restores the Phase 2 standalone informational scaffold. Root admin/auth/customer code is unchanged. There are no database migrations, DNS edits, provider callbacks or customer links to reverse. A preview-only cookie under the new name may remain in an operator's browser until cleared/expired; it is not consumed by root authentication.
