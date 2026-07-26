# Phase 3 Astro component-system validation

Validation date: 2026-07-25

## Scope

Phase 3 establishes the premium public design foundation inside the isolated Astro application. It does not switch production routing and does not modify quote, approval, admin, Supabase, email, agreement, deposit, or booking behavior.

Implemented areas:

- self-hosted Geist and Cormorant Garamond variable fonts;
- midnight navy, ivory, parchment, champagne, and gold design tokens;
- premium responsive header with utility contact details, desktop disclosure navigation, and a focus-managed mobile dialog;
- expanded conversion-oriented footer using CloudCannon-managed navigation, business, social, and service-area data;
- centralized canonical, robots, Open Graph, Twitter, and default-image handling;
- safe JSON-LD rendering with an organization schema built only from verified business details;
- responsive image contract with explicit intrinsic dimensions, alt text, loading priority, decoding, and sizes;
- reusable buttons, headings, editorial cards, marquee, horizontal experience accordion, service-assurance carousel, and motion gallery;
- redesigned CloudCannon page sections using the same public component tokens;
- a noindex `/design-system` representative showcase;
- automated Phase 3 generated-HTML and asset checks.

The current Next.js public site remains the production fallback and rollback point.

## Visual direction

The approved direction is **Midnight Michigan Editorial**:

- deep navy structure and cinematic evening photography;
- warm ivory content space and restrained champagne accents;
- wide Cormorant display typography with Geist for interface and body copy;
- generous editorial spacing and a strict two-to-three-line hero target;
- square-edged, high-contrast controls rather than generic rounded cards;
- a 12-column, two-row showcase bento with all 24 cells occupied;
- premium motion used as progressive enhancement rather than a navigation or content dependency.

No testimonial was fabricated for the showcase. The selected carousel treatment presents verifiable service assurances until approved testimonial collection content exists.

## Component contracts

| Area | Source | Contract |
|---|---|---|
| Metadata | `SeoHead.astro`, `lib/seo.ts` | Absolute canonical and social-image URLs, explicit robots state, one title source |
| Structured data | `JsonLd.astro`, `organizationSchema()` | Escaped JSON, verified organization/contact/service-area facts only |
| Images | `ResponsiveImage.astro` | Required `src`, `alt`, `width`, and `height`; lazy by default; eager/high priority opt-in |
| Buttons | `ButtonLink.astro` | Primary, secondary-on-dark, and tertiary-on-light variants with minimum touch height |
| Header | `SiteHeader.astro`, `navigation.json` | Static Astro markup, native disclosure/dialog semantics, direct production URLs |
| Footer | `SiteFooter.astro`, footer/business data | Conversion CTA, grouped links, contact details, social links, service statement |
| Motion | `MotionGallery.astro` | GSAP and ScrollTrigger load only on desktop without reduced-motion preference |
| Page builder | `sections/**`, `BlockRenderer.astro` | Existing `_type` renderer and CloudCannon live-edit contract preserved |

The root `public` directory remains the shared asset source during the staged migration. Image relocation and build-time format generation remain deferred because risk R33 requires a dedicated asset-ownership change.

## Accessibility and responsive behavior

- Skip link and main landmark remain present.
- The representative page contains exactly one H1.
- Header navigation uses native links, `details` disclosures, and a modal `dialog`.
- The mobile menu closes with its close control, Escape, backdrop activation, or a navigation link.
- Menu-open state prevents background scrolling and returns focus to the opener.
- Visible focus treatment is global and is not color-only.
- Controls use at least a 44px interactive height.
- Section relationships use real headings and explicit accessible labels where needed.
- Decorative logo duplication and image overlays do not add redundant spoken content.
- Horizontal accordions become stacked native disclosures on small screens.
- Motion enhancement is skipped below 1024px and whenever `prefers-reduced-motion: reduce` is active.
- All content remains present and usable when JavaScript or GSAP is unavailable.

## SEO and security boundary

- `/design-system` is `noindex,nofollow`.
- Existing Astro pilot routes remain `noindex,nofollow`.
- Canonicals resolve against `https://www.signatureluxeevents.com`.
- Default Open Graph imagery and alt text are always emitted.
- Organization JSON-LD contains no fabricated address, pricing, rating, or review data.
- Quote CTAs continue to link to the existing server-owned `/request-quote` workflow.
- The generated public HTML contains no `SUPABASE_SERVICE_ROLE_KEY` identifier.
- No operational imports, environment variables, API mutations, or client-side pricing logic were added.

## Performance treatment

- Astro remains statically rendered.
- Navigation, footer, metadata, images, and primary page sections require no framework runtime.
- Geist and Cormorant are self-hosted and do not require a third-party font request.
- GSAP is split into lazy client chunks and is requested only for the desktop motion-gallery enhancement.
- The CloudCannon component-registration bundle remains conditional on editor mode.
- Images include intrinsic dimensions and lazy loading except for the hero and header logo.
- Reduced-motion and small-screen modes avoid pinning and card-stack transforms.

A browser-based Lighthouse run is still required when the Astro preview is available in the deployment/QA browser environment. No browser executable is installed in this workspace, so Phase 3 uses build output, asset, semantic, and progressive-enhancement checks here.

## Validation evidence

| Check | Result |
|---|---|
| Baseline Astro check/build before Phase 3 | Pass |
| `corepack pnpm --filter @signature-luxe/web check` | Pass, zero diagnostics |
| `corepack pnpm --filter @signature-luxe/web build` | Pass, three static routes |
| `corepack pnpm --filter @signature-luxe/web verify:pilot` | Pass |
| `corepack pnpm --filter @signature-luxe/web verify:phase3` | Pass, 12 HTML/security assertions and 9 non-empty local image assets |
| `npx @cloudcannon/cli validate` | Pass |
| `corepack pnpm seo:audit-links` | Pass as informational audit; existing low-link opportunities remain |
| `corepack pnpm seo:audit-content` | Pass with zero errors and two pre-existing resource-description warnings |
| Root Next.js Turbopack build | Inconclusive: compilation exited without a rendered diagnostic while `.next/dev/lock` and active development output were present |
| Root Next.js webpack fallback build | Failed at compilation without a rendered module diagnostic |

The Next.js build result is documented rather than attributed to Phase 3: the implementation is isolated under `apps/web` plus shared workspace/config files, and the Astro application and regression suites pass. The root build should be rerun after the active Next development session is stopped so the builder can produce a clean diagnostic if a genuine root-app issue remains.

## Rollback

Rollback is additive and low risk:

1. Revert the Phase 3 Astro components, layout, styles, data expansions, font/GSAP dependencies, verification script, and showcase route.
2. Restore the Phase 2 Astro shell and CloudCannon link/footer input shapes.
3. Continue serving all public traffic from the unchanged Next.js application.

No customer record, operational workflow, production URL, or backend state requires restoration.
