# Phase 4 low-risk public-route validation

Validation date: 2026-07-26

## Status

Local implementation and automated validation are complete. CloudCannon-hosted
Visual Editor checks and desktop/mobile screenshot review remain human
verification items before any routing change.

The production Next.js routes remain unchanged and continue to serve public
traffic. All Astro equivalents intentionally emit `noindex,nofollow` during
staging to prevent duplicate preview indexing.

## Scope

This first Phase 4 batch migrates three low-risk informational routes into the
isolated Astro public application:

- `/start-here`
- `/faq`
- `/luxury-restroom-trailer-features`

It adds reusable, registered page-builder blocks for FAQ lists, inline FAQs,
editorial section groups, and related-link grids. Twelve existing FAQ answers
now live in the typed `faqs` content collection.

Out of scope:

- production proxy or deployment routing;
- removal or modification of the existing Next.js page files;
- quote submission, customer approval, pricing, admin, email, deposit,
  agreement, or booking behavior;
- event-type, trailer, location, blog, gallery, contact-form, or homepage
  migration.

## Route parity record

| Field | `/start-here` | `/faq` | `/luxury-restroom-trailer-features` |
|---|---|---|---|
| Astro source | `content/pages/start-here.md` | `content/pages/faq.md` + `content/faqs/*.md` | `content/pages/luxury-restroom-trailer-features.md` |
| Title | Preserved | Preserved | Preserved |
| Description | Preserved | Preserved | Preserved |
| Canonical | Explicit `/start-here`; intentional correction from inherited root canonical | Explicit `/faq`; intentional correction from inherited root canonical | Preserved |
| Robots | Temporary staging `noindex,nofollow` | Temporary staging `noindex,nofollow` | Temporary staging `noindex,nofollow` |
| Structured data | Verified Organization | Verified Organization, FAQPage with 12 visible questions, BreadcrumbList | Verified Organization, Service, FAQPage with 4 visible questions, BreadcrumbList |
| Heading hierarchy | Exactly one H1; five or more H2s | Exactly one H1; semantic section headings | Exactly one H1; semantic section headings |
| Primary CTA | `/request-quote` preserved | `/request-quote` preserved | `/request-quote` preserved |
| Supporting links | Existing planning links retained through shared header/footer | `/contact` and email actions preserved | Gallery, service areas, related services, FAQ, and quote links preserved |
| Images | Shared responsive-image contract | Default social image; no decorative FAQ imagery required | Existing feature/resource images and alt text preserved |
| Interaction | Static sections | Native `details`/`summary` disclosures; no JS dependency | Native `details`/`summary` disclosures; no JS dependency |
| CloudCannon | Reorderable registered blocks and nested fields | Reorderable blocks; FAQ answers managed once in typed FAQ collection | Reorderable registered blocks and nested editorial, link, image, and FAQ arrays |

## Content and visual-editing decisions

- The FAQ landing page reads all reusable FAQ entries from the typed collection
  and sorts them by the explicit `order` field.
- FAQ collection content is managed in the Data/Content editor. A preview
  refresh is required after changing a cross-file FAQ answer; the page section
  heading and introduction remain inline-editable.
- Page-specific feature FAQs remain inline so the visible questions and that
  route's FAQPage JSON-LD share one source.
- Structured-data selection is explicit in page SEO frontmatter. Service schema
  requires a service name; no operational or unverified business data is read.
- Every new page-builder `_type` is represented in the Zod union,
  `componentMap.ts`, component registration, CloudCannon structures, and the
  visual-editing census at `migration/visual-editing.md`.

## Accessibility and mobile

- Each route renders exactly one H1 and retains a skip link and main landmark.
- FAQ controls use native disclosure semantics and remain usable without
  JavaScript.
- Disclosure summaries and linked cards meet the existing minimum touch-target
  contract.
- Focus states use the shared high-contrast global treatment.
- Grids collapse to one column on small screens and expand progressively.
- No new motion is required to reveal or understand content.

## SEO and security

- Titles, descriptions, canonical URLs, Open Graph, Twitter metadata, and
  structured data are rendered from typed content.
- Staged copies stay noindex until Phase 14 cutover; production Next.js pages
  remain the indexable source.
- Quote calls to action still link to `/request-quote`; no form or pricing logic
  moved into Astro.
- Generated public HTML contains neither the service-role key identifier nor
  admin API links.

## Validation evidence

| Check | Result |
|---|---|
| `corepack pnpm --filter @signature-luxe/web check` | Pass; zero diagnostics |
| `corepack pnpm --filter @signature-luxe/web build` | Pass; five static routes |
| `corepack pnpm --filter @signature-luxe/web verify:pilot` | Pass |
| `corepack pnpm --filter @signature-luxe/web verify:phase3` | Pass |
| `corepack pnpm --filter @signature-luxe/web verify:phase4` | Pass; three routes, 16 FAQ disclosures, metadata/schema/link/security assertions, five local images |
| `npx @cloudcannon/cli validate` | Pass for config and initial site settings |
| `corepack pnpm seo:audit-links` | Pass as informational audit; existing low-link opportunities remain |
| `corepack pnpm seo:audit-content` | Pass with zero errors and two pre-existing resource-description warnings |
| Local preview HTTP smoke | Four staged URLs returned HTTP 200 |
| Browser screenshots and interaction | Pending; no browser executable is available in this workspace |
| CloudCannon inline edit/save-to-git | Pending human verification in hosted CloudCannon |

Expected build warnings remain for empty future collections (`trailers`,
`event-types`, `service-areas`, `testimonials`, and `blog`) that are scheduled
for later phases.

## Rollback

1. Keep production routing on the existing Next.js routes; no proxy reversal is
   needed because this batch does not change routing.
2. Revert the two new page entries, FAQ collection entries, registered section
   components, schema/config additions, and Phase 4 verification script.
3. Restore the Phase 3 Astro build with `/start-here` as the sole staged
   content-backed production-route equivalent.

No customer data or backend state requires restoration.

## Human verification before route cutover

- Open all three routes in CloudCannon's Visual Editor.
- Edit and save representative hero, nested array, CTA, image, and FAQ fields.
- Confirm add/remove/reorder controls work for page blocks and nested arrays.
- Confirm reusable FAQ edits land in the expected `content/faqs/*.md` file and
  appear after preview refresh.
- Review desktop and mobile screenshots against the current Next.js pages.
- Keep the Astro entries noindex until the production routing switch and final
  crawl validation are ready.
