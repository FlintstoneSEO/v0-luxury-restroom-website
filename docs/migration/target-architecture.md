# Target architecture

## Decision

Use pnpm workspaces and migrate incrementally.

### Transitional structure implemented in this phase

```text
app/                       # existing Next.js public, customer, and admin application
components/
lib/
apps/
  web/                     # isolated Astro public-site foundation
docs/
  migration/
```

### Intended end state

```text
apps/
  web/                     # Astro public marketing site
  admin/                   # Next.js protected operations application
packages/
  shared/                  # environment-neutral types, schemas, constants, utilities
  config/                  # shared lint/TypeScript conventions where useful
docs/
  migration/
```

The root Next.js application will not move to `apps/admin` until public route groups have migrated or an equivalent proxy/deployment plan is proven.

## Package-manager decision

Use the existing pnpm lockfile and pnpm workspaces. Do not add Turborepo in this phase.

Why:

- the repository already has a pnpm lockfile;
- two applications do not require a separate task orchestrator;
- pnpm filters provide independent install/build commands;
- workspace adoption is additive and reversible;
- a single lockfile simplifies CI and CloudCannon installation.

## Application boundaries

### Astro public web

Target stack: Astro, TypeScript, Tailwind CSS, Astro Content Collections, and CloudCannon. Static output is the default. React or another client runtime is introduced only for a measured interactive island. The phase-one pilot uses scoped CSS and no Tailwind integration so this foundation does not prematurely define the production design system; Tailwind configuration belongs in Phase 3 with the shared public components and visual tokens.

Owns:

- marketing page rendering;
- content collections and public data files;
- navigation/footer;
- public SEO metadata and schema;
- sitemap/robots at cutover;
- optimized public images;
- carefully selected interactive islands.

Must not own:

- service-role credentials;
- quote calculations;
- admin authentication;
- approval-token validation;
- privileged status transitions;
- agreement/payment integrations;
- internal notes or operational records.

### Next.js admin and customer workflow

Owns:

- `/admin/**` and `/api/admin/**`;
- Supabase SSR authentication and admin authorization;
- quote/customer/booking/pricing operations;
- `/quote/[token]` until a separately approved boundary exists;
- provider webhooks;
- transactional email and privileged server-side integrations.

### Shared package boundary

Eligible later:

- environment-neutral Zod request schemas;
- quote/status TypeScript types;
- public constants;
- date-only formatting;
- pure calculation display helpers.

Not eligible:

- modules importing `next/*`;
- Supabase clients;
- provider clients;
- secret-reading code;
- route handlers;
- duplicated pricing implementations.

## Environment boundaries

### Astro

Only `PUBLIC_*` variables that are safe in a browser bundle. The initial scaffold requires none.

### Next.js admin/customer backend

Keeps all current server-only variables: Supabase service role, Resend/provider keys, Google server key, Dropbox Sign, Square, and database connection strings.

`NEXT_PUBLIC_APP_URL` currently generates both admin and customer links. Before separate domains, replace this overloaded concept with explicit server-side origins such as `PUBLIC_SITE_URL`, `ADMIN_APP_URL`, and `CUSTOMER_WORKFLOW_URL`, while keeping compatibility during rollout.

## Deployment and domains

Recommended final topology:

- `www.signatureluxeevents.com` → Astro public site;
- `admin.signatureluxeevents.com` → Next.js admin;
- customer quote URLs either:
  - remain on a stable Next.js workflow host such as `secure.signatureluxeevents.com/quote/<token>`; or
  - remain on the primary domain through an edge/proxy rule that forwards `/quote/**` and workflow APIs to Next.js.

Recommendation: preserve the current primary-domain customer URL through a path proxy during migration. Email links already in the wild must remain valid.

No DNS, Vercel project, CloudCannon production, or proxy change is made in this phase.

## Public quote requests

Preferred migration boundary:

1. Astro renders the marketing page and a progressively enhanced form/island.
2. Submission calls the existing server-owned `POST /api/quote-requests` over an explicitly allowed same-origin proxy or dedicated workflow origin.
3. The API continues Zod validation, duplicate prevention, server-side distance/pricing, service-role insert, and operational notification.
4. Customer confirmation behavior must be brought to parity with the server action before switching the form.

Do not import the calculation engine into a public Astro client. Do not expose the service-role key. Add CSRF/origin/rate-limit review before cross-origin launch.

## Customer quote approval

Keep `/quote/[token]` and its APIs in Next.js during public content migration. It performs server-side token hashing, expiry/used checks, view tracking, option validation, lifecycle changes, and email notifications.

Before any later move, prove:

- existing emailed links resolve unchanged;
- hashes and raw tokens never leak to logs or CMS;
- expiry and single-use behavior match;
- view/event writes remain idempotent enough for retries;
- all response types and option selection pass realistic tests.

## CloudCannon content

Astro content collections hold pages, trailers, event types, service areas, FAQs, testimonials, and blog posts. JSON data files hold navigation, footer, business information, and SEO defaults. Reusable page sections use discriminated structures so editors can reorder safe, known blocks.

CloudCannon never stores operational records or provider state.

## Public visual direction

The future public system retains Signature Luxe's navy and charcoal structure, ivory/stone backgrounds, white, restrained gold/taupe accents, Cormorant-style editorial headings, readable sans-serif body copy, generous spacing, and existing trailer/event photography.

Design rules:

- wide headings limited to two or three lines on normal desktop widths;
- strong photographic hierarchy without repeating the same image on one page;
- clear high-contrast quote actions;
- no generic placeholder photography when owned business assets exist;
- motion only where it improves comprehension, never around forms or critical CTAs;
- reduced-motion alternatives and a strict Core Web Vitals budget;
- no fragile scroll pinning on mobile;
- content structures constrain editors to safe variants and complete image/alt pairs;
- page layouts remain coherent when optional content is empty or text length changes.

The migration pilot deliberately avoids GSAP and production marketing composition. Those choices belong in the later shared-component and homepage phases after content, accessibility, and performance constraints are measurable.

## Media strategy

During migration, reuse existing business photography under root `public/images`. CloudCannon uploads target `public/images`.

Longer term:

- editorial marketing images: Git/CloudCannon or an approved DAM;
- operational documents, signed agreements, payment references: provider/Supabase only;
- Supabase `site_media` entries: audit one by one and either migrate the public editorial reference or retain the operational reference;
- preserve alt text as structured content, not inferred from filenames.

Avoid duplicated imagery on one page. Retain existing business photography instead of introducing generic placeholders.

## SEO parity and redirects

- Keep filenames/slugs aligned with current production paths.
- Build a route-parity manifest before each batch.
- Preserve the canonical origin and schema semantics.
- Recreate the current sitemap composition only when the relevant content source has migrated.
- Carry the `next.config.mjs` redirect inventory into the final public host configuration.
- Test redirect status, target, query strings, and chains.
- Keep `/admin`, `/api`, and `/quote` disallowed/noindex as appropriate.
- Preserve GTM and Vercel Analytics events or document an intentional analytics platform change.

## Current-site continuity

The root scripts remain the Next.js defaults. Astro has separate `dev:web`, `build:web`, and `check:web` scripts. The pilot is not linked from the current application. Production stays on Next.js until a route batch is verified and a rollback is documented.

## Rollback

Before cutover, rollback is removal/reversion of:

- `apps/web`;
- workspace metadata and web scripts;
- CloudCannon draft configuration;
- migration documentation.

Because no existing routes or workflows are altered, rollback does not require a database or DNS change.
