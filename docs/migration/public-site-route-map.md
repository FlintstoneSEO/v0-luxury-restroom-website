# Public-site route map

Classification legend:

1. Astro static content
2. Astro interactive island
3. Keep in Next.js admin
4. Keep temporarily in Next.js customer workflow
5. Shared backend or utility
6. Architectural decision required

No current route is removed or redirected by this phase.

## Public pages

| URL | Current source | Current behavior | Target class | Migration note |
|---|---|---|---:|---|
| `/` | `app/page.tsx` | Static with hourly revalidation; public imagery/media | 1/6 | Migrate last; resolve Supabase homepage media ownership first. |
| `/start-here` | `app/start-here/page.tsx` | Static guide | 1 | Early low-risk content batch. |
| `/contact` | `app/contact/page.tsx`, server action | Static page plus form submission | 2/6 | Content to Astro; form remains server-backed. |
| `/faq` | `app/faq/page.tsx` | Static FAQ/schema | 1 | Typed FAQ collection. |
| `/gallery` | `app/gallery/page.tsx` | Dynamic media-backed page | 1/6 | Decide CloudCannon vs Supabase media ownership. |
| `/luxury-restroom-trailer-rentals` | page file | Static/primary service page | 1 | Preserve canonical and Service schema. |
| `/luxury-restroom-trailer-features` | page file | Static feature page | 1 | Early content batch. |
| `/wedding-restroom-trailer-rentals` | page file | Static service page | 1 | Event-type collection. |
| `/private-event-restroom-trailers` | page file | Dynamic due to media/data dependency | 1/6 | Resolve media source before migration. |
| `/corporate-event-restroom-trailers` | page file | Static service page | 1 | Event-type collection. |
| `/festival-community-event-restroom-trailers` | page file | Static service page | 1 | Event-type collection. |
| `/construction-long-term-restroom-trailer-rentals` | page file | Static service page | 1 | Event-type collection. |
| `/emergency-disaster-relief-restroom-trailers` | page file | Static service page | 1 | Event-type collection. |
| `/service-areas` | page file | Static index | 1 | Content/data-driven listing. |
| `/service-areas/[citySlug]` | dynamic page + `lib/city-pages.ts` | SSG for 17 city slugs | 1 | Service-area collection; preserve every slug. |
| `/resources` | page file + `lib/resources.ts` | Static listing | 1 | Convert TypeScript dataset to content. |
| `/resources/[slug]` | dynamic page | SSG for 7 resources | 1 | Blog/resource collection or separate resource collection decision. |
| `/blog` | page + `lib/soro-blog.ts` | Hourly remote RSS | 6 | Decide Soro ownership vs CloudCannon import. |
| `/blog/[slug]` | dynamic page | SSG/revalidated Soro posts | 6 | Preserve published slugs and remote-image behavior. |

Current service-area slugs:

`lansing-mi`, `east-lansing-mi`, `okemos-mi`, `haslett-mi`, `grand-ledge-mi`, `dewitt-mi`, `holt-mi`, `mason-mi`, `jackson-mi`, `howell-mi`, `brighton-mi`, `flint-mi`, `grand-rapids-mi`, `ann-arbor-mi`, `battle-creek-mi`, `kalamazoo-mi`, `charlotte-mi`.

Current resource slugs:

`restroom-trailer-vs-porta-potty`, `how-many-restroom-trailers-for-wedding`, `restroom-trailer-setup-requirements`, `outdoor-wedding-restroom-planning-michigan`, `restroom-trailer-rental-cost-michigan`, `festival-restroom-planning-guide`, `construction-restroom-trailer-rental-guide`.

## Customer workflow pages

| URL | Source | Class | Rule |
|---|---|---:|---|
| `/request-quote` | page + client form + server action | 4 | Stay in Next.js until Astro calls a stable server API and end-to-end regression passes. |
| `/request-availability` | legacy page/form/action | 6 | Decide whether to retire to the canonical form or preserve separately. |
| `/quote/[token]` | server page + approval client | 4 | Keep URL, token semantics, noindex, event tracking, and server-side service-role access unchanged. |

## Legacy page routes

These page files currently redirect or present older content. Preserve the redirect behavior, not duplicate indexable content:

| Legacy URL | Current target/handling |
|---|---|
| `/our-restrooms` | Permanent redirect to `/luxury-restroom-trailer-rentals` via `next.config.mjs` |
| `/request-availability` | Permanent config redirect exists from `/request-availability` to `/request-quote`, although a page file also exists; verify effective production behavior |
| `/weddings` | Permanent redirect to `/wedding-restroom-trailer-rentals` |
| `/special-events` | Permanent redirect to `/private-event-restroom-trailers` |
| `/construction-long-term` | Permanent redirect to `/construction-long-term-restroom-trailer-rentals` |
| `/disaster-relief-government` | Permanent redirect to `/emergency-disaster-relief-restroom-trailers` |
| `/home00736a12` | Permanent redirect to `/` |
| `/lansing-mi` | Permanent redirect to `/service-areas/lansing-mi` |
| `/east-lansing-mi` | Permanent redirect to `/service-areas/east-lansing-mi` |
| `/okemos-mi` | Permanent redirect to `/service-areas/okemos-mi` |
| `/haslett-mi` | Permanent redirect to `/service-areas/haslett-mi` |
| `/grand-ledge-mi` | Permanent redirect to `/service-areas/grand-ledge-mi` |
| `/dewitt-mi` | Permanent redirect to `/service-areas/dewitt-mi` |
| `/jackson-mi` | Permanent redirect to `/service-areas/jackson-mi` |
| `/howell-mi` | Permanent redirect to `/service-areas/howell-mi` |
| `/flint-mi` | Permanent redirect to `/service-areas/flint-mi` |
| `/grand-rapids-mi` | Permanent redirect to `/service-areas/grand-rapids-mi` |
| `/ann-arbor-mi` | Permanent redirect to `/service-areas/ann-arbor-mi` |

Route files also exist for several root city slugs. The final redirect manifest must be generated from one source of truth and verified at the HTTP layer.

## SEO system routes

| URL | Source | Class |
|---|---|---:|
| `/sitemap.xml` | `app/sitemap.ts` | 5; reproduce in Astro only at cutover |
| `/robots.txt` | `app/robots.ts` | 5; reproduce with the same exclusions |
| `/icon`, favicons, verification files | App/public assets | 1/5 |

## Parity record required before replacing any route

For every current URL record:

- metadata title and description;
- canonical;
- Open Graph and Twitter data;
- robots directives;
- JSON-LD types and values;
- H1/H2 hierarchy;
- internal inbound and outbound links;
- image source, dimensions, and alt text;
- CTA destination and any tracking event;
- form or client interaction;
- rendered desktop/mobile screenshots;
- redirect behavior and HTTP status;
- build output path and trailing-slash behavior.

## Initial Astro route

`/migration-pilot` exists only in the independent `apps/web` build, is noindex/nofollow, and is not connected to production routing.
