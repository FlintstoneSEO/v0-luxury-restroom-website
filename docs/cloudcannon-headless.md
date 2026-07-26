# CloudCannon headless content architecture

## Architecture

Signature Luxe remains a runtime Next.js application hosted by Vercel. CloudCannon is a Git-backed editor only:

1. An editor changes structured content or public image references in CloudCannon.
2. CloudCannon commits the change to `dev`.
3. Vercel creates a preview deployment from `dev`.
4. The production Next.js application reads the same repository content.
5. Approval and merging from `dev` to `main` happen outside CloudCannon and outside this migration task.

CloudCannon must not run an install command, build Next.js or Astro, host generated output, or receive Vercel runtime environment variables.

## Phase A audit summary

The audit was performed before implementation.

- **Runtime application:** the repository root is Next.js App Router. `next.config.mjs` has runtime security headers, redirects, and Next Image remote patterns; it has no static-export setting. Middleware protects `/admin/**` and `/api/admin/**` with Supabase authentication.
- **File-backed content:** the Astro pilot had four marketing page Markdown files, twelve FAQ Markdown files, and four JSON site-data files. Root Next.js also has file-backed TypeScript datasets in `lib/resources.ts`, `lib/city-pages.ts`, `lib/soro-blog.ts`, and media registries.
- **Hardcoded content:** most root marketing pages, homepage sections, header, footer, trailer descriptions, event pages, FAQ arrays, image references, metadata, and JSON-LD inputs are still embedded in TSX/TypeScript. Phase A converts only homepage SEO and hero copy.
- **Database-backed content:** quotes, customers, pricing, distance settings, agreements, deposits, payment state, bookings, admin authentication, homepage/site media overrides, transactional email, and webhook state use Supabase or operational integrations and must remain database-backed.
- **Astro readiness:** the Astro collection schemas are typed and the migrated page/FAQ files are useful content-model pilots. They are not complete production parity: trailer, event-type, service-area, testimonial, and blog collections were empty, and some pilot pages are intentionally `noindex`.
- **Duplication:** Astro navigation/footer copy differs from the production header/footer; Astro page pilots overlap production routes but are not imported by root Next.js. Production output is therefore authoritative when conflicts are migrated.
- **Previous consumption:** before Phase A, no root Next.js runtime import referenced `apps/web/src/content` or `apps/web/src/data`. Astro content was not the production source of truth.
- **Shared source:** `content/**` is now the canonical Git-backed public content root. Both CloudCannon and Astro point there, and Next.js imports validated JSON through `lib/content/**`.
- **Images:** curated public assets remain at their stable URLs under `public/images`. New editor uploads use `public/images/uploads` and should be stored as `/images/uploads/<file>` references.
- **Vercel:** there is no repository `vercel.json`; root `pnpm build` remains `next build`, so Vercel's root runtime assumptions are unchanged.
- **Risks:** Astro and production content differ; many marketing routes remain hardcoded; dynamic Supabase media can override homepage imagery; several public assets have extensionless filenames; and the migrated Markdown collections are not yet consumed by Next.js. These are follow-up migration concerns, not reasons to duplicate content.

## Shared content structure

```text
content/
  pages/          # homepage JSON and long-form marketing Markdown
  trailers/       # trailer entries
  event-types/    # event-service entries
  service-areas/  # local long-form pages
  faqs/           # reusable questions
  testimonials/   # approved testimonials
  blog/           # articles
  resources/      # planning guides
  site/           # navigation, footer, business, and SEO defaults
public/images/uploads/ # new CloudCannon uploads
```

The homepage is a Data Editor document because it is structured JSON. Long-form entries use Markdown and the Content Editor. Zod validates production-consumed structured content in `lib/content` at build/runtime module initialization, producing direct build errors for malformed content without network requests or Supabase access.

## Editing content

### Homepage and site data

Open **Homepage** or **Site Settings**, edit the labeled fields, save, and review the resulting Vercel preview. Do not edit slugs or URLs casually; they are part of the public contract.

### Images and alt text

Upload new public marketing images to `public/images/uploads`. Image values must be browser paths such as `/images/uploads/example.webp`, never local absolute paths. Complete the adjacent alt field with a concise description of the meaningful visual content. Existing curated assets may remain at their current stable paths.

Do not upload customer documents, agreements, private event records, or admin media to a public collection.

### Blog posts and resources

Open **Blog** or **Resources**, select **Add**, start from the provided schema, leave `draft: true` while writing, preserve the intended slug, add publication dates and SEO fields, and supply featured-image alt text. Publish only after the Vercel preview is approved.

### Service-area pages

Open **Service Areas**, use the service-area schema, keep the two-letter state code and stable slug, add unique local copy, nearby-area and FAQ relationships, SEO fields, and an image with alt text. Do not clone near-identical city copy.

## Preview and publishing

CloudCannon's Content and Data Editors save to `dev`. Use the linked Vercel preview deployment for visual review; CloudCannon's Visual Editor is disabled for headless collections. CloudCannon must not merge or publish to `main`. After approval, repository maintainers merge `dev` to `main` through their normal protected GitHub process, which triggers Vercel production deployment.

## Data that remains in Supabase

Do not move these into `content/**`: admin users, authentication, quote requests, quote options, pricing, distance calculations/settings, customers, bookings, agreements/signatures, deposits/balances, operational notes, email delivery state, webhook state, or private media. Runtime environment variables and private/service-role keys belong in Vercel and must never be committed or entered as editable content.

## Files editors should not change

Editors should use only `content/**` and approved public uploads. They should not change `app/admin/**`, `app/api/**`, `middleware.ts`, `lib/supabase/**`, operational libraries, migrations, environment files, package files, build configuration, or CloudCannon schemas/configuration without engineering review.

## CloudCannon dashboard setup

1. Open **Site Settings**.
2. Open **Details**.
3. Set **Mode** to **Headless**.
4. Turn off CloudCannon hosting and builds.
5. Confirm the connected publishing branch is `dev`.
6. Do not enter build commands, output directories, testing-domain settings, or private Vercel/Supabase environment variables.
7. Use Content Editor for Markdown and Data Editor for JSON/YAML.

## Troubleshooting

- **No visual preview in CloudCannon:** expected in Headless Mode; use the Vercel preview for the `dev` commit.
- **Vercel build reports invalid content:** correct the field identified by Zod; required strings and alt text cannot be blank in production-consumed JSON.
- **Image is broken:** confirm it exists under `public`, begins with `/images/`, and includes the exact filename/case.
- **Content saved but the preview is old:** verify CloudCannon committed to `dev`, then inspect the matching Vercel deployment and commit SHA.
- **A runtime workflow fails:** do not copy it into Git content. Escalate to engineering and inspect Vercel/Supabase configuration.

## Phase A scope and follow-up

Phase A migrates the existing Astro content/data to the shared root, establishes schemas and typed Next.js access, switches CloudCannon paths to headless editors, removes CloudCannon-only build hooks/settings, documents operations, and uses homepage SEO/hero content as the production pilot. Header/footer and remaining homepage sections intentionally remain unchanged until Phase B so production/Astro copy conflicts can be reviewed explicitly.

## Phase B global content

Phase B makes the production Next.js output—not the earlier Astro preview copy—the canonical source for global content. The following now come from validated files under `content/`:

- `content/site/navigation.json`: desktop and mobile navigation, dropdown links, CTA, and logo metadata.
- `content/site/footer.json`: production footer copy, links, service areas, hours, social links, CTA, copyright, and agency credit.
- `content/site/business.json`: public business name, phone/email display values, and safe `tel:`/`mailto:` links.
- `content/site/seo-defaults.json`: root metadata title/template, description, canonical origin, keywords, locale, and default Open Graph image metadata.
- `content/faqs/*.json`: ordered reusable FAQ records used by `/faq` and its FAQPage JSON-LD.
- `content/testimonials/*.json`: approved reusable testimonials; new testimonials default to unpublished and are not rendered until explicitly approved.

The earlier Astro navigation/footer values conflicted with the live Next.js site. They were replaced with exact production values rather than silently merged. Header/footer layout, responsive behavior, menu interactions, FAQ order, public routes, and displayed copy remain unchanged. Empty testimonials are intentional because the audit found no production-approved testimonials to migrate.

## Phase C primary marketing content

Phase C begins the controlled migration of primary marketing collections without rewriting route layouts:

- Remaining structured homepage records—features, process steps, services, event-scenario labels, gallery metadata, and service-area names—now live in `content/pages/home.json`. Runtime Supabase media overrides remain authoritative for operationally managed homepage images.
- `/gallery` now reads SEO, hero copy, image captions/categories, categorized section copy, CTA content, and fallback media from `content/pages/gallery.json`. Runtime site-media overrides remain intact.
- Corporate and festival/community event routes now read complete production copy, metadata, FAQ data, resource imagery, and section order from `content/event-types/*.json` through the existing `ServicePageTemplate`.
- CloudCannon uses Data Editor JSON schemas for event types and dedicated Homepage/Gallery documents. New event entries default to draft and noindex.

This phase intentionally does not yet migrate the bespoke wedding, private-event, construction, emergency-response, or full fleet route bodies. Those pages contain larger icon/layout-specific content models and remain production-hardcoded until the next controlled Phase C batch. No duplicate editable copies were added for them.

## Phase C completion

The final Phase C batch migrates the remaining production fleet and bespoke event-page records:

- `content/trailers/*.json` is the canonical ordered fleet source for the 2-, 3-, and 4-station options displayed on `/luxury-restroom-trailer-rentals`.
- `content/service-pages/luxury-restroom-trailers.json` contains the fleet landing page's features, requirements, amenities, service-area links, FAQs, and interior gallery metadata.
- `content/service-pages/weddings.json`, `private-events.json`, `construction-long-term.json`, and `emergency-response.json` contain the production metadata and structured records used by their existing bespoke route layouts.
- Icon names are stored as stable editor-safe identifiers and mapped to the existing Lucide components in each route. This keeps presentation code outside editable content.
- CloudCannon exposes ordered trailer records and the existing bespoke service-page documents through Data Editors. New trailer defaults are draft, and service-page documents cannot be added from the editor because each is tied to an existing production route.

Phase C is now complete. Inline layout-only headings and connective copy remain in the bespoke TSX templates intentionally: they define presentation structure rather than reusable structured records. Phase D should address programmatic service areas, blog/resources, sitemap, and final metadata validation.

## Phase D programmatic content and SEO

Phase D moves the remaining Git-owned programmatic content into the shared root:

- `content/service-areas/*.json` is the canonical source for all 17 production city routes, including stable slugs, priority-city status, local copy, FAQs, nearby communities, and resource/service relationships.
- `content/resources/*.json` is the canonical source for all seven production planning resources, including dates, SEO fields, image alt text, article sections, FAQs, and related links.
- `content/site/routes.json` is the internal route manifest used by sitemap and audit tooling. It is intentionally excluded from CloudCannon's Site Settings collection because editors should not change routing infrastructure.
- Service-area static data and resource static data are validated through Zod loaders. Route templates, metadata calculations, JSON-LD, and public URLs remain unchanged.
- Sitemap generation now receives cities and resources from the shared content layer. Dynamic Soro blog entries continue to be appended at runtime with their existing revalidation behavior.

The production blog remains backed by the existing Soro RSS integration. CloudCannon's unused Git blog collection was removed rather than creating a second, non-production source of truth. Soro parsing, sanitization, remote-image allowlisting, dates, dynamic routes, and hourly revalidation remain unchanged. A future blog-provider migration must be planned separately and include URL/content parity before switching sources.

Resource and service-area records remain structured JSON because the production templates rely on ordered arrays, typed relationships, FAQ blocks, and distinct local-planning fields. This avoids burying route-critical relationships in unvalidated Markdown while still providing editor-friendly Data Editors.

Phase D validation checks content relationships against the route, city, and resource manifests; scans JSON as part of the internal-link audit; verifies resource dates and hero alt text; and preserves the existing informational warnings for low-linked routes and two resource description lengths.
