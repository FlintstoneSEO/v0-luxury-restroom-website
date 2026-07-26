# Phase 5 customer-workflow boundary

Status: locally implemented on 2026-07-26. Deployment routing and provider-environment validation remain cutover tasks.

This document follows the Phase 5 numbering in the repository `AGENTS.md`: customer-facing workflows. The older phased implementation plan groups the same work under its quote-request and customer-approval phases.

## Decision

Keep customer workflow rendering and all operational behavior in the root Next.js application during the Astro migration.

Next.js continues to own:

- `/request-quote` and its server action;
- `POST /api/quote-requests`;
- `/quote/[token]`;
- `POST /api/quote/[token]/respond`;
- `POST /api/quote/[token]/message`;
- token hashing, expiry, single-use response enforcement, and view tracking;
- pricing and distance calculations;
- quote, agreement, deposit, and final-balance state;
- Dropbox Sign and Square webhooks;
- transactional email and service-role Supabase access.

Astro remains static and owns no operational record, approval token, provider credential, or privileged transition.

## Why this is the lowest-risk option

The quote request server action and JSON API are not behaviorally equivalent: the server action sends admin and customer notifications, while the JSON API currently stores the request without sending those notifications. Moving the form to Astro now would create a customer-visible regression or require a separate workflow refactor.

The approval page performs server-side token lookup and hashing, writes view events, renders live quote options, and invokes same-origin mutation APIs. Moving it to Astro would introduce a second operational runtime without a customer benefit.

## Application origins

New deployments should configure three server-side origins:

| Variable | Purpose | Example |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | Astro marketing pages, public email assets, and customer return links | `https://www.signatureluxeevents.com` |
| `ADMIN_APP_URL` | Protected admin links and operational provider webhook origin | `https://admin.signatureluxeevents.com` |
| `CUSTOMER_WORKFLOW_URL` | Quote links and the host that owns `/quote/**` plus `/api/quote/**` | `https://www.signatureluxeevents.com` |

Values must be origins only. Paths, credentials, query strings, and fragments are rejected.

`NEXT_PUBLIC_APP_URL` and `APP_URL` remain migration fallbacks so the change is reversible. They should not be the permanent configuration because one value cannot safely describe three deployments.

## Required routing contract

The preferred production topology keeps existing customer URLs on the public origin through an edge or platform proxy:

| Incoming path | Owner |
| --- | --- |
| `/request-quote` | Next.js |
| `/quote/**` | Next.js |
| `/api/quote/**` | Next.js |
| `/api/quote-requests` | Next.js |
| `/_next/**` required by the proxied Next.js pages | Next.js |
| `/admin/**` and `/api/admin/**` | Next.js admin origin |
| Other migrated public routes | Astro |

`/quote/**` and `/api/quote/**` are one atomic routing unit. The approval client intentionally uses relative API URLs so the raw-token page cannot be deployed on one host while its mutation API silently points elsewhere.

If a proxy cannot preserve the primary-domain paths, a dedicated secure workflow origin is acceptable only after:

- old primary-domain `/quote/<token>` links continue forwarding without exposing the token to analytics or logs;
- quote emails use `CUSTOMER_WORKFLOW_URL`;
- the public site's quote CTA is updated deliberately;
- provider and workflow end-to-end tests pass.

No production proxy or DNS mutation is part of this repository change.

## Security and privacy safeguards

- Quote pages remain `noindex` and `nofollow` in metadata.
- Response headers add `noarchive`, `private, no-store`, and `Referrer-Policy: no-referrer`.
- The token route is explicitly dynamic with no revalidation.
- Raw tokens remain in Next.js and are hashed before database lookup.
- Service-role credentials, pricing, status transitions, and provider integrations remain server-only.
- Admin notification links use `ADMIN_APP_URL`; customer quote links use `CUSTOMER_WORKFLOW_URL`.
- Customer email branding and return links use `PUBLIC_SITE_URL`.

## Workflow analysis

No status semantics or writes were changed.

- Quote statuses involved: `quote_sent`, `customer_approved`, `change_requested`, `declined`.
- Agreement status involved: `ready_to_send`.
- Deposit statuses: unchanged.
- Data writes: unchanged token, quote, option, link-event, and status-history behavior.
- Customer-visible effect: links resolve to the intended application after deployment separation.
- Recovery: restore the previous environment values and route the customer path batch back to the known Next.js deployment.

## Validation

Run:

```bash
corepack pnpm verify:phase5
corepack pnpm lint
corepack pnpm build
corepack pnpm check:web
corepack pnpm build:web
```

Deployment validation still requires realistic Supabase/provider-backed records:

1. open valid, invalid, expired, and previously used links;
2. open a valid link multiple times and confirm view tracking;
3. approve a single-option quote;
4. approve a multi-option quote and confirm the selected pricing snapshot;
5. request changes and decline;
6. send a non-final customer message;
7. verify admin notification links use the admin origin;
8. verify a quote email link uses the customer workflow origin;
9. confirm old primary-domain links still resolve through the proxy;
10. confirm the response headers on `/quote/<token>`.

## Deferred work

- Bring `POST /api/quote-requests` notification behavior to parity before Astro owns the quote form.
- Review CSRF/origin checks and rate limiting before any cross-origin form submission.
- Improve partial-failure recovery for quote sending and token consumption in dedicated workflow changes.
- Configure and validate production proxy, DNS, provider callback URLs, and monitoring at cutover.

## Local validation results

Completed on 2026-07-26:

- `corepack pnpm verify:phase5`: passed;
- `corepack pnpm exec tsc --noEmit --pretty false`: passed;
- `corepack pnpm build`: passed; `/quote/[token]` remained dynamically rendered;
- `corepack pnpm check:web`: passed with zero diagnostics;
- `corepack pnpm build:web`: passed;
- live response-header check: `/quote/<token>` returned `private, no-store`, `noindex, nofollow, noarchive`, and `no-referrer`; the token response API returned private no-store/noindex headers;
- `corepack pnpm lint`: blocked by the existing repository setup because ESLint 6.4.0 cannot find a configuration file.

The local invalid-token page could not complete its database lookup because the production server process did not have `SUPABASE_SERVICE_ROLE_KEY`. Provider- and Supabase-backed workflow scenarios therefore remain deployment validation rather than being claimed as locally complete.
