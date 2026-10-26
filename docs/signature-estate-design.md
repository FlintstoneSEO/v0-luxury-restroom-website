# Signature Estate public design

Approved direction: concept 4 in `output/design-exploration/04-signature-estate.png`. Branch: `codex/signature-estate-design`. This is a presentation change, not a migration or cutover.

## Pre-build brief

- Workstream: Signature Estate public design.
- Application: Existing Next.js public routes and shared Astro pilot presentation.
- User workflow: Explore trailers, compare rental uses, read planning information, request availability.
- Current implementation: Root Next.js public pages use shared header/footer, HeroSection, SectionHeader, ServiceCard, FeatureGrid, and CTASection, plus custom layouts. Astro has a separate BaseLayout and registered section components.
- Pain point: Centered masthead, full-screen photo hero, rounded shadowed cards, and differing typography do not express approved direction 4 consistently.
- Change: Ivory shell, navy actions, gold rules, readable functional sans, expressive serif, split home composition, immediate amenity ribbon, editorial cards, coherent inner-page heroes and article surfaces.
- Routes/files: All public Header-consuming page files, shared public components, scoped CSS, Astro shell/hero/CTA styles. Dynamic city, resource, and blog templates cover their generated routes.
- Content/data: Preserve existing public content sources, media resolution, IDs, CTA destinations, schema and analytics. No generated mockup interior images enter the site.
- Status fields: None.
- Customer-visible risk: Navigation, wrapping, reflow, and visual regressions. Form logic is untouched.
- SEO risk: Preserve route files, metadata, canonical/schema generation and H1 wording. Existing content warnings remain explicit.
- Security risk: No changes to admin, auth, API handlers, operational data, customer tokens, provider actions or server-side business logic.
- Accessibility: Contrast, functional font size, focus, labelled navigation, dialog name/close control, reduced motion, intrinsic sizing.
- Mobile: Text-first split hero becomes a vertical composition, no fixed full-screen height; ribbons stack, grids reflow, navigation remains accessible.
- Rollback: Revert the design branch's presentation changes. No database or deployment rollback needed.
- Validation: Baseline/final lint, build, typecheck, SEO/content audits, Astro checks, route-family browser review and static preservation check.

## Implementation-ready composition map

Shared shell: slim opaque ivory masthead, existing logo left, unchanged navigation labels and destinations, navy availability action right. Large screens show navigation when space permits; smaller screens use the existing focus-trapped sheet. Footer remains navy with existing contacts, hours, areas, social links and attribution. Public CSS is scoped to explicit public containers so operational pages retain their current typography and colors.

Homepage: existing CMS hero title/body/CTAs on ivory at left, existing resolved wedding trailer image at right. Heading scale/column width permits natural wrapping without forced breaks. Compact navy ribbon immediately communicates the first three existing amenities and service region. A daylight exterior editorial introduction uses existing content and an existing real product photo. Preserve services, walkthrough video, fleet information, features, process, gallery, service areas and all CTAs; style these into a clear rhythm of ivory, white and navy. Preserve original content even when longer than the raster concept.

Service and event pages: shared left-aligned ivory title treatment, image split when an image is already supplied. Existing page-only title sections remain restrained ivory editorial bands. Body retains distinct fleet comparisons, detail lists, FAQs and requirement tables. Navy bands retain white text.

Areas: directory uses the same hero and flat ruled location cards. Dynamic city titles get an editorial ivory title band and navy action; existing use-case imagery and local guidance remain intact.

Articles/resources: preserve article reading order, categories, dates, author fields, tables and TOCs. Use ivory/white reading surfaces, thin rules, serif titles, sans body, restrained square image crops. No universal hero forced onto article templates.

Gallery/FAQ/start-here/features: retain gallery interactions, native disclosures, question content and planning sequences. Apply shared rules, image edges, type and buttons.

Public request/contact forms: shared public shell and introductory styling only; preserve field names, validation, submission actions, errors, success messages, and pending states. No test sends or submissions to live providers.

Astro pilot: align tokens, header, buttons, cards, hero and CTA. Preserve editable-region attributes, registered component names, schemas, content, static/noindex staging guards. Do not invent missing Astro routes or change CloudCannon configuration.

Mobile/tablet: 320px minimum width, 44px controls, no horizontally clipped actionable text, no hidden service content. Hero image follows message and actions. Amenities use one column on phones, three at wider widths. Dense content tables may scroll within their own containers. Maintain reading widths on desktop.

## Preservation and risk

Preserve domain logic and backend entirely. Improve public presentation and mobile navigation accessibility. Restructure homepage presentation only. Replace no source media or operational components. Header-left/nav/action-right is intentional: approved concept 4 uses it and the existing large navigation requires a compact familiar shell. No random art direction, full-screen pinning, generated assets or heavy motion: the approved direction and repository safety/accessibility rules take precedence over gpt-taste defaults.

## Coverage and validation

Code inspection or local build does not prove hosted CMS editing, production workflows, payment/email delivery or accessibility compliance.

### Completed scope

All 24 public Header consumers now have the explicit public design scope and skip-link target: 23 route templates plus ServicePageTemplate (used by corporate events, festivals, and trailer features). Shared tokens, typography, navigation, hero treatments, service cards, feature lists, CTA layouts, article surfaces and footer apply throughout. Redirect aliases inherit their target pages. The Astro pilot retains its independent staging/noindex behavior and editable-region markers.

The new optional homepage introduction is typed in the existing homepage schema and stored in the public content file, with defaults in the existing CloudCannon homepage template. It uses a pre-existing product photo. No generated concept imagery is used by production components.

Two location-template image paths pointed to two-byte placeholder files. They now reference existing exterior and vanity photos with descriptive alt text. The content validator now recognizes Windows CRLF front matter as well as LF; no Markdown content changed for that fix.

### Validation results

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Final Next.js production build | PASS | Compiled, TypeScript checked, and routes generated; log in output/design-validation/build.log. Feed-dependent content may still render 404 despite a successful build. |
| Standalone TypeScript | PASS | Normal filesystem access required to resolve installed pnpm dependency links. Restricted run produced dependency/type errors. |
| ESLint | PASS | Final lint run after shared-template change. |
| Public content | PASS | All 59 files; structured images and local paths validated. |
| SEO audits | PASS with existing warnings | Zero content errors, two pre-existing description-length warnings. Link audit remains informational and reports existing low-link pages. URLs, metadata and schema implementations preserved. |
| Astro diagnostics/build | PASS | 37 files, zero diagnostics; five static pages built. Empty testimonial collection still produces the existing loader notice. |
| Astro Phase 3/4 parity | PASS | Noindex, canonicals, JSON-LD, workflow links, FAQ disclosures, editable markers and local assets retained. |
| Existing quote fixtures | PASS | 11 tests across quote presentation and pricing; fixture proof only. |
| Safety boundaries | PASS | No modified admin, API, action, token-approval, auth, quote-domain, or standalone-admin implementation files. No admin/customer-approval consumers of changed public components. |
| Public template coverage | PASS | 24 consumers, zero missing design scopes; output/design-validation/preservation-checks.json. |
| Responsive homepage | PASS for observed layouts | Captured at 320, 375, 390, 768, 1024, 1440. Measured five main widths with no document overflow; H1 uses two or three lines. |
| Representative page families | PASS for rendered samples | Services, trailer catalog, areas/dynamic city, resources/article, blog index, gallery, FAQ, planning, contact and request entry pages captured at desktop and phone widths. Three shared service routes additionally verified at actual 1440/390 widths in production preview. |
| Keyboard/interactions | PASS for sampled controls | Production preview: mobile menu opens, labelled dialog, Escape closes and returns focus; desktop disclosure Escape closes; skip link focuses main; FAQ expands; gallery lightbox opens and closes with Escape. |
| Astro header contrast | PASS after repair | Observed white text on navy button, and phone reflow; screenshots saved. |
| Blog article runtime | NEEDS MANUAL VALIDATION | Connected Soro feed returned 403 in the existing dev environment; article sample returned no content/404, including local production preview. Article template styling is in place; no provider or fallback changes were made. |
| Hosted CMS and live operations | NEEDS MANUAL VALIDATION | No hosted editing, form sends, real quotes, emails, payment/agreement actions, or cutover performed. |
| Full accessibility/performance certification | NEEDS MANUAL VALIDATION | Local semantic, keyboard, contrast and reflow samples; no screen-reader, axe, Lighthouse or field Core Web Vitals certification. CSS payload snapshot saved without claiming baseline improvement. |

### Visual review

Subjective scores out of 5: brand fit 4.5, hierarchy 4.5, responsive composition 4, consistency 4.5. Approved split hero, flat imagery, navy ribbon, ivory surfaces and restrained gold are present. Existing detailed fleet/planning content makes the implemented homepage and some service pages longer than the concept; retained intentionally. Screenshots are visual evidence at sampled widths, not proof of every route/state. Some full-page captures may show images before lazy loading; use the running preview for final image review.

### Review and rollback

Local production preview: http://127.0.0.1:3001/ . Existing development server remains separate. Screenshot and diagnostic artifacts: output/design-validation/. Design source and comparison prompts: output/design-exploration/.

Changes remain local and uncommitted on codex/signature-estate-design. No deployment or remote push. Revert the task-specific presentation/content/schema changes to roll back; there are no database migrations or hosted configuration changes. Next.js may regenerate its own next-env.d.ts during build/dev validation.
