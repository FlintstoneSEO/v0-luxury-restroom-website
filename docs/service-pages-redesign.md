# Service pages: photography and editorial layouts

User-selected direction: photography and editorial layouts within the existing Signature Estate ivory, navy, gold, and serif identity. Implemented with the Impeccable design skill; its context launcher could not install its engine in the restricted environment, so repository context and the existing rendered screenshots supplied the baseline. No new identity, fonts, packages, or generated photography.

## Pre-build brief

Workstream: Public service-page presentation.
Application: Existing Next.js public site during the Astro migration.
User workflow being improved: Understand the service, inspect trailer imagery, find planning guidance, and request a quote.
Current implementation: Five detailed service pages and three shared-template pages; generic text-first heroes hide page-variant images, repeated bordered boxes, and a large resource-card grid.
Current pain point: Weak photography, repetitive composition, and poor hierarchy.
Proposed change: Dedicated service hero with existing service-specific imagery, amenity strip, editorial content treatments, open planning links, keyboard-operable FAQ disclosures, and a clear closing quote action.
Routes affected: /wedding-restroom-trailer-rentals, /private-event-restroom-trailers, /corporate-event-restroom-trailers, /festival-community-event-restroom-trailers, /construction-long-term-restroom-trailer-rentals, /emergency-disaster-relief-restroom-trailers, /luxury-restroom-trailer-rentals, /luxury-restroom-trailer-features.
Files likely affected: Five service page consumers, components/service-hero.tsx, components/service-page-template.tsx, app/services.css, and the stylesheet import in app/layout.tsx.
Content or data involved: Existing JSON content, trailer records, media resolution for private events, existing local images and configured remote images. Keep source schemas unchanged.
Status fields involved: None.
Customer-visible risk: Image crops, wrapping, section hierarchy, and quote-link discoverability.
SEO risk: Retain routes, original H1 text, metadata, canonicals, service/breadcrumb/FAQ/business schema generation, and substantive service paragraphs.
Security risk: Presentation only; no admin, API, authentication, quote calculation, approval, agreement, deposit, provider, or token changes.
Accessibility considerations: Semantic headings, breadcrumb navigation, decorative SVGs hidden, visible focus, native keyboard FAQ disclosure, inherited reduced-motion treatment, readable contrast.
Mobile considerations: Single-column hero and editorial sections, stacked amenity strip, wrapping actions, no sticky planning heading below 900px.
Migration or rollback strategy: No migration or cutover. Remove this task's service presentation changes, retaining the pre-existing uncommitted Signature Estate work. No database/hosted rollback.
Validation steps: TypeScript, lint, production build, content validation, SEO audits, eight-route desktop/phone browser review, keyboard FAQ check, schema and canonical checks.

## Design and preservation

The shared template replaces its boxed paragraphs and image-card resource grid with an image-led introduction, editorial heading/text rows, a navy planning section, and compact native FAQ disclosures. Detailed service pages retain their distinct content, galleries, trailer comparison data, and existing interactive components, with service-only styles for headings, cards, accordions, and spacing.

The reusable service hero renders imagery independently of the generic HeroSection's page variant. Other public pages and the Astro pilot keep their existing hero implementation. The private-event page retains its configured media resolution. Legacy alias routes keep their redirects.

CSS lives under the explicit `.estate-service` scope or dedicated `service-*` component classes. No changes to public CMS content files, CloudCannon configuration, operational data, admin navigation, customer workflow handlers, or quote destinations are part of this task.

## Validation

- PASS: TypeScript outside the filesystem sandbox. Initial restricted execution produced dependency-access errors; these do not reproduce with normal filesystem access.
- PASS: Production Next.js webpack build with normal network/filesystem access; 75 static pages generated. The restricted attempt could not fetch Google Fonts or write part of its build output.
- PASS: Content validation: 59 files.
- PASS: Repository lint, excluding only the temporary `.next-service-*` generated validation directories; `git diff --check` passes.
- PASS with existing warnings: SEO content audit: zero errors, two existing resource-description length warnings. Internal-link audit remains informational.
- PASS: All eight routes at 320, 390, 768, and 1440 pixels: no document overflow, loaded hero imagery, one H1, preserved canonical, and quote links. Corporate FAQ opens using the keyboard.
- PASS: All eight routes in the completed local production build return HTTP 200 with one H1 and zero browser page errors. One development-session JSON error during the broader preview run did not reproduce in production.
- Browser artifacts: `output/service-redesign/`; `browser-checks.json` records responsive checks and the isolated development error; `production-checks.json` records the clean production run. Full-page screenshots supplement the viewport captures.
- NEEDS MANUAL VALIDATION: Hosted CMS editing, real quote submission, provider email, and production deployment. These were not changed or exercised by this presentation task.

Local production review: http://127.0.0.1:3004/corporate-event-restroom-trailers and the seven sibling service routes. Changes remain local and uncommitted.
