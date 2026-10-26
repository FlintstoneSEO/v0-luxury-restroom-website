# Service areas and homepage occasion section

## Pre-build brief

Workstream: Photography-led service-area pages and the pictured homepage occasion showcase.
Application: Existing Next.js public website.
User workflow being improved: Find local coverage, understand local rental planning, and browse rental occasions from the homepage.
Current implementation: Service-area index, shared city route, JSON city collections, and five homepage occasion images resolved through existing homepage media configuration.
Current pain point: Repeated full-width text sections and boxed content; text-only city hero; four equal homepage tiles followed by a disconnected tailgate tile.
Proposed change: Photo-led locality hero, editorial coverage directory, city-specific overview, concise visual use cases, expandable local planning details/FAQs, and a connected five-image homepage composition with service links.
Routes affected: /service-areas, all /service-areas/[citySlug] pages, and only #homepage-events on /.
Files likely affected: Service-area index and city template, homepage section, dedicated public presentation components/styles, stylesheet import.
Content or data involved: Preserve service-area JSON and schemas, city-specific content and resource/service links, homepage eventScenarios labels and media-key resolution, existing imagery and configured overrides.
Status fields involved: None.
Customer-visible risk: Discoverability of collapsed planning details, link targets, image crops, focus/reflow.
SEO risk: Preserve URL generation, H1 meaning/text, metadata, canonicals, structured data, and server-render all local content even when displayed in native disclosures.
Security risk: No operational data, admin, authentication, APIs, customer tokens, quote calculations, agreements, deposits, or emails change.
Accessibility considerations: Native keyboard disclosures; visible focus; meaningful image alternatives; real links for occasion tiles; one H1; readable navy/ivory captions; reduced-motion support.
Mobile considerations: Linear reading order; reflowing photo composition; readable directory rows; no horizontal scrollers or hidden essential actions.
Migration or rollback strategy: Presentation only. Revert this task's scoped components/styles and page changes while preserving earlier service-page and Signature Estate changes. No migration, publication, database, or hosted configuration changes.
Validation steps: Production build, TypeScript, lint, content and SEO audits, generated-city content preservation, local production route checks, desktop/tablet/phone screenshots, keyboard disclosure and homepage link checks.

## Direction

Continue the user-selected photography/editorial direction with Impeccable, retaining the existing ivory, navy, restrained gold, Cormorant, and Montserrat identity. The homepage keeps its four editable scenario labels/media sources and the existing MSU tailgate image; five related images form one grid without an orphan tile. City imagery illustrates the trailer offering and does not claim to document a particular city installation. City-specific content stays in existing JSON sources and is fully rendered, with long-form details grouped in native disclosures rather than deleted.

## Validation and handoff

- PASS: Final production webpack build, including TypeScript and all 75 static pages. An intermediate cached rebuild encountered a webpack hashing error; the final build uses a fresh output directory and completes successfully. Final log: `output/area-home-redesign/build-final.log`.
- PASS: Repository lint, excluding only generated `.next-service-*` validation output; `git diff --check`.
- PASS: Content validation, 59 source files. SEO content audit reports zero errors and the same two pre-existing resource-description length warnings. Internal-link audit remains informational.
- PASS: All 17 city routes return HTTP 200 in the final local production build. An unknown city returns 404.
- PASS: Generated HTML preserves all 17 cities' intro, nearby coverage, venue notes, use cases, overview, planning details, nearby communities, trust notes, FAQ questions/answers, source resource/service links, and original H1 text. Evidence: `output/area-home-redesign/preservation.json`.
- PASS: Twenty responsive samples: homepage, service-area directory, Ann Arbor, Lansing, and East Lansing at 320, 390, 768, and 1440 pixels. No horizontal document overflow, one H1, preserved canonicals and quote links; zero browser page errors in the final production review.
- PASS: Native local-guide disclosure opens with Enter. Homepage occasion destinations verified for weddings, parties, corporate events, festivals, and MSU tailgates. Visual and keyboard order match at desktop and mobile widths.
- NEEDS MANUAL VALIDATION: Full screen-reader/assistive-technology review, hosted CMS editing, real quote submission/provider actions, and deployment. No hosted changes or workflow actions were performed.

Evidence and screenshots: `output/area-home-redesign/`. `production-checks.json` records the final browser/route review. Local preview uses the refreshed existing address: http://127.0.0.1:3004/service-areas/ann-arbor-mi and http://127.0.0.1:3004/#homepage-events . No commit, push, or publication was performed.
