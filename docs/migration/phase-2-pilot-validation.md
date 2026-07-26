# Phase 2 CloudCannon pilot validation

Validation date: 2026-07-25

## Scope

This phase is additive and limited to the isolated Astro public application:

- validates the CloudCannon build settings and page collection;
- renders structured page sections through a shared component map;
- registers every supported section for CloudCannon live re-rendering;
- introduces Tailwind design tokens and accessible public layout primitives;
- adds a preview-only Astro version of `/start-here`;
- leaves the production Next.js route, quote workflow, admin application, and Supabase logic unchanged.

Production routing is not switched. The Astro `/start-here` entry remains `noindex,nofollow` until a later route-cutover phase.

## Renderer and editing contract

The `sections` frontmatter array uses `_type` as its discriminator. `BlockRenderer.astro` and `registerComponents.ts` share the same `componentMap`, preventing build-time and Visual Editor renderers from drifting.

| Section | Renderer | Inline fields | Nested array treatment |
|---|---|---|---|
| Hero | `HeroSection.astro` | eyebrow, heading, body, image, CTA labels | none |
| Text section | `TextSection.astro` | eyebrow, heading, body | none |
| Feature grid | `FeatureGridSection.astro` | eyebrow, heading, body | item array with icon, title, description |
| Site requirements | `RequirementsSection.astro` | eyebrow, heading, body, aside | requirement item array |
| Process | `ProcessSection.astro` | eyebrow, heading, body | step array with title and description |
| Call to action | `CtaSection.astro` | heading, body, label | none |

CloudCannon structures include complete default value shapes, picker previews, sidebar previews, explicit input types, and named sub-structures for every nested array.

No MDX component appears in content. Structured page sections are therefore used instead of snippets; this avoids exposing imports or component markup to editors and makes the MDX auto-import pipeline inapplicable to this pilot.

## Visual-editing census

| Visible area | Source | Treatment | Notes |
|---|---|---|---|
| Header navigation | `navigation.json` | data-file array with nested text regions | Links continue to existing production URLs |
| Footer tagline and links | `footer.json` | data-file text and array regions | Shared public foundation |
| Footer business details | `business.json` | data-file text regions | Operational/customer data is not involved |
| Page sections | page frontmatter | renderer-backed page-builder array | `_type` selects the registered renderer |
| Feature items | section frontmatter | array, array-item, nested text | Icon is selected in the sidebar |
| Requirement items | section frontmatter | array, array-item, nested text | Object items make inline binding explicit |
| Process steps | section frontmatter | array, array-item, nested text | Step numbers are derived from order |
| Markdown body | page body | block text region when non-empty | Start Here uses sections only |

## SEO parity: `/start-here`

| Element | Current Next.js output | Astro preview | Result |
|---|---|---|---|
| URL | `/start-here` | `/start-here` in isolated build | Preserved; no production routing change |
| Intended title | `Restroom Trailer Rental Planning Guide Lansing MI \| Signature Luxe Events & Amenities` | Same | Preserved |
| Generated title | Brand suffix appears twice because the page title already includes the root template suffix | One suffix | Intentional correction |
| Description | `Learn what information we need to provide you with a custom restroom trailer rental quote for your event in Lansing and Mid-Michigan.` | Same | Exact parity |
| Canonical | Generated as site root by inherited root metadata | `https://www.signatureluxeevents.com/start-here` | Intentional correction |
| Robots | Indexable on production | `noindex,nofollow` | Temporary preview safeguard |
| H1 | Planning Your Restroom Trailer Rental | Same | Exact parity |
| H2 content | Introduction, planning details, requirements, process, final CTA | Same | Preserved |
| Structured data | None on the current route | None | Parity |
| Primary workflow link | `/request-quote` | `/request-quote` | Preserved; workflow remains in Next.js |
| Page imagery | No content image | No content image | Parity |

The Astro shell is a new accessible foundation, not a production-header/footer cutover. Full global-navigation, analytics, and deployment parity remain later-phase gates.

## Accessibility and responsive treatment

- skip link targets the main landmark;
- header and footer navigation have accessible names;
- exactly one page H1 is rendered;
- section headings follow the H1;
- decorative icons and logos do not duplicate accessible text;
- links have visible focus indicators and minimum touch height;
- content grids collapse at narrow widths;
- reduced-motion preferences disable nonessential transitions and smooth scrolling.

## Validation evidence

| Command/check | Result |
|---|---|
| Official CloudCannon schema refresh | Pass |
| `npx @cloudcannon/cli validate` | Pass for config and initial settings |
| `corepack pnpm --filter @signature-luxe/web check` | Pass, zero diagnostics |
| `corepack pnpm --filter @signature-luxe/web build` | Pass; two static preview routes |
| Local HTTP request for `/migration-pilot` | `200` |
| Local HTTP request for `/start-here` | `200` |
| `corepack pnpm --filter @signature-luxe/web verify:pilot` | Verifies SEO, headings, quote links, and all renderer markers |
| `corepack pnpm build` | Pass; existing Next.js application still generates all 117 pages/routes |
| Generated output markers | 6 section components, 6 editable arrays, 25 array items, 54 text regions |

The remaining platform-specific acceptance check is a real CloudCannon save/reorder/reopen cycle after the repository is connected to a CloudCannon site. The repository-side configuration, build, renderer registration, and generated editable markers are validated and ready for that external check.

## Rollback

Remove the preview content entry, section components, component registration, Tailwind integration, and Phase 2 CloudCannon structure additions. No production route, operational database logic, admin code, or customer workflow needs restoration because none was changed.
