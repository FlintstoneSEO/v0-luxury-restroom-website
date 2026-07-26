# CloudCannon content model

## Boundary

CloudCannon manages public editorial content only. Supabase remains authoritative for quotes, customers, bookings, pricing, agreements, deposits, approval tokens, admin users, internal notes, transactional email state, workflow status, and distance calculations.

The initial configuration is a draft foundation validated against CloudCannon's published JSON schemas. It exposes the Astro content directories even where collections are intentionally empty.

## Shared field shapes

### Image

| Field | Required | Notes |
|---|---:|---|
| `src` | Yes when image object exists | CloudCannon image picker; stored under `public/images` initially |
| `alt` | Yes when image object exists | Useful description; decorative treatment is a rendering decision |

### SEO

| Field | Required | Notes |
|---|---:|---|
| `title` | Yes | Unique search title |
| `description` | Yes | Target roughly 120–160 characters |
| `canonical` | No | Absolute override; normal route helper supplies default |
| `image` | No | Structured image/alt pair |
| `noindex` | No; default false | Explicit switch for pilots/drafts/special pages |

## Collections

### Pages

- Location: `apps/web/src/content/pages/**/*.{md,mdx}`
- Astro collection: `pages`
- URL: filename-based `/[slug]`; `index.md` would resolve to `/`
- Required: `_schema`, `title`, `description`, `seo`
- Optional/defaulted: `draft`, `sections`, Markdown body
- Images: section images and SEO image, always with alt text
- Slug: filename; preserve production paths exactly
- Preview: visual first for existing pages; content editor for new entries; pilot preview until real templates exist
- Reordering: yes, `sections`
- Editor note: only defined section structures may be added

### Trailers

- Location: `apps/web/src/content/trailers/**/*.{md,mdx}`
- Required: `name`, `summary`, `capacity`, `stations`, `featuredImage`, `seo`
- Optional/defaulted: `gallery`, `features`, `draft`, Markdown description
- Images: featured and gallery image/alt pairs
- Slug: filename
- Preview: data/content initially; public URL disabled until trailer URL strategy is approved
- Reordering: gallery and features
- Editor note: dimensions/capacity should be factual, not marketing guesses

### Event types

- Location: `apps/web/src/content/event-types/**/*.{md,mdx}`
- Required: `name`, `summary`, `featuredImage`, `seo`
- Optional/defaulted: related trailer IDs, FAQ IDs, sections, draft, body
- Images: featured and section images with alt text
- Slug: filename should be the complete current production slug
- Preview: content/data editor only in the foundation; enable `/[slug]` visual preview when the event-type Astro route exists
- Reordering: related entries, FAQs, sections
- Editor note: references are identifiers until relational selects are wired to populated collections

### Service areas

- Location: `apps/web/src/content/service-areas/**/*.{md,mdx}`
- Required: `city`, two-letter `state`, `summary`, `seo`
- Optional/defaulted: nearby area IDs, featured image, FAQ IDs, draft, body
- Slug: filename such as `lansing-mi`
- Preview: content/data editor only in the foundation; enable `/service-areas/[slug]` visual preview when that Astro route exists
- Reordering: nearby areas and FAQs
- Editor note: content must be locally useful and unique; avoid doorway-page duplication

### FAQs

- Location: `apps/web/src/content/faqs/**/*.{md,mdx}`
- Required: `question`, `answer`, `category`
- Optional/defaulted: `order`, `featured`
- Images: none
- Slug: stable descriptive filename
- Preview: data editor; no standalone public URL
- Reordering: page-level references control presentation order
- Editor note: answers are plain structured copy in the initial model

### Testimonials

- Location: `apps/web/src/content/testimonials/**/*.{md,mdx}`
- Required: `customerName`, `quote`
- Optional/defaulted: event type/location, image, featured, order
- Images: optional image/alt pair
- Slug: stable filename, not customer email or other sensitive data
- Preview: data editor; no standalone public URL
- Reordering: `order` or page references
- Editor note: publish only approved customer copy; do not add operational details

### Blog posts

- Location: `apps/web/src/content/blog/**/*.{md,mdx}`
- Required: `title`, `excerpt`, `publishedAt`, `author`, `featuredImage`, `seo`
- Optional/defaulted: `updatedAt`, categories, draft, body
- Images: featured/SEO plus rich-text uploads
- Slug: filename, preserving any migrated Soro URL
- Preview: content/data editor only in the foundation; enable `/blog/[slug]` visual preview after the blog source and Astro route are implemented
- Reordering: categories
- Editor note: Soro remains the current source until import/ownership is decided

## Site data

JSON files under `apps/web/src/data` are grouped as Site Settings:

| File | Purpose | Required concepts |
|---|---|---|
| `navigation.json` | Primary public navigation | label and internal/external href |
| `footer.json` | Footer tagline and links | public copy and links |
| `business.json` | Public business identity | name, phone, email, service region |
| `seo-defaults.json` | Site-wide metadata defaults | site name, title template, description, canonical origin, image |

Navigation/footer link arrays use a shared structured link object so editors can add and reorder complete items.

## Reusable sections

Initial `page_sections` structures:

### Hero

- `_type: hero`
- eyebrow, heading, body
- optional image with alt text
- optional primary CTA object

### Rich text

- `_type: rich_text`
- optional heading
- Markdown body

### CTA

- `_type: cta`
- heading, optional body, label, href

All structures include CloudCannon picker and item previews. Nested objects have explicit object inputs and preview icons. More structures should be added only alongside real Astro render components.

## Astro validation

`apps/web/src/content.config.ts` defines the content collections with Zod. Page sections use a discriminated union on `_type`, preventing one section schema from silently matching another. Optional editor fields accept null where CloudCannon may serialize an empty YAML field.

Every CloudCannon field addition must be paired with:

1. Zod schema change;
2. schema-template default;
3. `_inputs` configuration;
4. renderer/component support;
5. existing-content backfill when required;
6. build and CloudCannon validation.

## Editor safeguards

- Developer-only `_schema` is hidden.
- Draft entries are excluded from public generation.
- Numeric fields use number inputs.
- Images require dedicated alt fields.
- Closed visual variants must use select inputs when introduced.
- Markdown inputs explicitly configure toolbars.
- Operational data is absent from all collections and data files.
- Editors should not paste approval links, agreement URLs, payment URLs, customer messages, or internal notes.

## Preview strategy

The initial pilot provides a safe preview route without claiming production parity. A collection receives a production URL only when an Astro route actually builds it. Collections without a proven route use `disable_url: true`.

Before enabling visual previews for a migrated collection:

- compare the CloudCannon URL pattern to `apps/web/dist`;
- confirm trailing-slash behavior;
- ensure drafts open in the content editor;
- test newly created entries;
- verify all editable fields render;
- confirm no route collision with a retained Next.js workflow.

## Media

Initial upload path: `public/images`, shared with the current Next.js application. Do not move existing images in this phase.

Future asset work should:

- identify original/high-resolution sources;
- preserve meaningful filenames where useful;
- create responsive optimized derivatives through Astro;
- keep signed documents and payment assets out of Git;
- document any DAM or Supabase Storage ownership.
