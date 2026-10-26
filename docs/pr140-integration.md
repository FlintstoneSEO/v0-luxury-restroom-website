# PR 140 integration and release

## Pre-build brief
Workstream: Reconcile pricing/admin branch with current main and release through existing Vercel Git integration.
Application: Root Next.js admin/customer/public app; retain Astro and separate-admin scaffolds without cutover.
User workflow being improved: Deploy approved pricing and operations work while retaining main's booking/date safeguards.
Current implementation: PR 140 head ceb1489 diverges from main 5145719; seven conflicted files. Root Vercel project v0-luxury-restroom-website remains Next.js.
Current pain point: Concurrent changes to calendar/dashboard, quote email confirmation, build scripts and migration tests.
Proposed change: Integrate main, preserve redesigned operations UI and pricing persistence, use authoritative AvailabilityBlock model and existing main APIs for blocks/soft holds, preserve round-trip mileage and GA4.
Routes affected: Root admin/dashboard/calendar/quote/pricing; existing customer workflow routes retain server safeguards and URLs.
Files likely affected: Seven conflict files plus directly related block presentation/types/tests. No broad folder move.
Content or data involved: Source files and validation fixtures only; no pricing-setting/database writes or schema execution during merge/release.
Status fields involved: Preserve existing quote/agreement/deposit states and active/cancelled block meanings, hard blocks, soft holds and locks.
Customer-visible risk: Regressing send confirmations or capacity enforcement; retaining main handlers and tests is required.
SEO risk: Preserve root analytics/metadata and URLs; no Astro public deployment cutover.
Security risk: Preserve server authorization, financial locks, tokens and provider boundaries; scaffolds remain separate and unpromoted.
Accessibility considerations: Retain focus/labels/confirmations and readable calendar statuses.
Mobile considerations: Preserve current admin polish and responsive calendar sizing while using main's date detail workflow.
Migration or rollback strategy: Local backup branch codex/pr140-before-main-sync; merge main into PR branch; validate exact pushed commit before merging PR; existing deployment remains rollback target. No database migration or host cutover.
Validation steps: Root types/lint/tests/build, workspace builds as applicable; explicit availability, travel, pricing persistence and standalone-admin auth tests; Vercel preview then main deployment status and public/admin/customer-route smoke checks without customer mutations.

## Conflict decisions
- Calendar/server loaders and booking-availability migration tests use main's current availability-block implementation and reconciled migration chain.
- Dashboard retains the current quote queue/workbench and uses main's combined quote/block availability summaries and filters. Booking outlook consumes the same AvailabilityBlock contract.
- Quote detail retains the current Quote Desk and duplicate-action locks, plus main's hard-block warnings and explicit soft-hold acknowledgment for sends.
- Build scripts retain main's Windows-compatible WASM wrappers and the branch's independent admin workspace commands.
- Root deployment stays on the existing Vercel Next.js project. apps/admin remains a staged authentication scaffold; apps/web remains the public migration workspace. Neither is promoted by this merge.

## Validation evidence
- Frozen pnpm workspace dependency install passed.
- All 111 tests across 14 files passed with one worker, including isolated PostgreSQL pricing persistence, all four time-charge examples, historical quote preservation, rejected non-admin writes, migration replay, availability conflicts and standalone-admin authorization. No hosted database writes or emails were used.
- Root TypeScript and ESLint passed. Astro check had no errors/warnings/hints; Astro build and standalone-admin typecheck/lint/build passed.
- SEO content audit: zero errors; two existing meta-description length advisories. Link audit completed with informational low-link findings.
- Removed stale local validation-build references from the root TypeScript configuration; production remains the root Next.js app. Local root build uses synthetic public Supabase placeholders because this worktree has no live environment file; the Vercel Git build is the hosted environment check.
- Previous production rollback target: dpl_A1ckCmv3VwhS2m3mT4zJV3FhYSRc (main 51457199d737fd51fef1a89852f21997527e2269), assigned signatureluxeevents.com and www.signatureluxeevents.com.
- No database migration, domain change, production pricing edit, customer quote mutation, provider action or customer email is part of this release validation.
- Root Next.js production build passed with synthetic public build variables; all 74 generated pages completed. Hosted media lookup failures in this local-only build are expected with the deliberately unreachable fixture URL.
