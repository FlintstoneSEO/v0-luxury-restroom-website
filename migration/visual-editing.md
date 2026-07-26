# Visual editing census

Updated: 2026-07-26

This census covers the isolated Astro application through the Phase 4
low-risk route batch. Routes that still render from Next.js are deliberately
excluded from Astro editable-region wiring until their documented migration
phase. They remain editable only in source code and are listed as deferred so
the boundary is explicit.

| Page or partial | Visible section | Content source | Treatment | Notes |
|---|---|---|---|---|
| Shared | Header | `data/navigation.json`, `data/business.json` | `@data` text/array editables | Shared across every Astro page. |
| Shared | Footer | `data/footer.json`, `data/business.json` | `@data` text/array editables | Shared across every Astro page. |
| `/start-here` | Hero | `content/pages/start-here.md` | Registered `hero` block plus nested text/image editables | Page-builder array item. |
| `/start-here` | Introduction | `content/pages/start-here.md` | Registered `text_section` block plus nested text editables | Page-builder array item. |
| `/start-here` | Planning details | `content/pages/start-here.md` | Registered `feature_grid` block; item array and nested fields editable | Page-builder array item. |
| `/start-here` | Site requirements | `content/pages/start-here.md` | Registered `requirements` block; nested list and aside fields editable | Page-builder array item. |
| `/start-here` | Process | `content/pages/start-here.md` | Registered `process` block; step array and nested fields editable | Page-builder array item. |
| `/start-here` | Final CTA | `content/pages/start-here.md` | Registered `cta` block plus nested text editables | Page-builder array item. |
| `/faq` | Hero | `content/pages/faq.md` | Registered `hero` block plus nested text editables | Page-builder array item. |
| `/faq` | FAQ introduction and list | `content/pages/faq.md`, `content/faqs/*.md` | Registered `faq_list` block; heading fields inline, FAQ entries managed in the FAQ collection | Cross-file FAQ changes require preview refresh; this avoids duplicating canonical answers. |
| `/faq` | Contact choices | `content/pages/faq.md` | Registered `link_grid` block; item array and nested fields editable | Page-builder array item. |
| `/faq` | Final CTA | `content/pages/faq.md` | Registered `cta` block plus nested text editables | Page-builder array item. |
| `/luxury-restroom-trailer-features` | Hero | `content/pages/luxury-restroom-trailer-features.md` | Registered `hero` block plus nested text editables | Page-builder array item. |
| `/luxury-restroom-trailer-features` | Amenity highlights | Page content file | Registered `feature_grid` block; item array and nested fields editable | Page-builder array item. |
| `/luxury-restroom-trailer-features` | Quote prompt | Page content file | Registered `cta` block plus nested text editables | Page-builder array item. |
| `/luxury-restroom-trailer-features` | Planning sections | Page content file | Registered `editorial_sections` block; section and paragraph arrays editable | Page-builder array item. |
| `/luxury-restroom-trailer-features` | Related resources | Page content file | Registered `link_grid` block; item array and nested text/image fields editable | Page-builder array item. |
| `/luxury-restroom-trailer-features` | FAQs | Page content file | Registered `inline_faqs` block; item array and nested fields editable | These answers are page-specific and feed FAQ JSON-LD. |
| `/luxury-restroom-trailer-features` | Final CTA | Page content file | Registered `cta` block plus nested text editables | Page-builder array item. |
| `/migration-pilot` | Hero and markdown body | Page content file | Registered hero block and block markdown editable | Noindex migration proof only. |
| `/design-system` | Component showcase | Astro source and shared data | Sidebar/source only | Noindex developer QA route; it is not editor-owned marketing content. |
| Next.js public routes not listed above | All sections | Existing Next.js source/data | Deferred | Migrated in Phases 5–9; production fallback remains unchanged. |
| Next.js customer/admin routes | All sections | Operational application and Supabase | Not applicable | Intentionally outside CloudCannon and the Astro public-content boundary. |

## Completeness rules for this batch

- Every `sections` array item is registered in `componentMap.ts` and
  `registerComponents.ts`.
- Every item array has array CRUD markup and nested editable fields.
- Every new block and nested item shape has a CloudCannon structure value.
- Every rendered content field has an explicit input type.
- FAQ answers have one canonical source per page: reusable collection entries
  on `/faq`, inline page-specific entries on the features page.
- Production Next.js routes, quote submission, approval, pricing, email, and
  admin behavior are not changed by this batch.
