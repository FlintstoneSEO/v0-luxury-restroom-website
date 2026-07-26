# Phased implementation plan

> Numbering note: this document predates the phase names in the root `AGENTS.md`. The customer-facing workflow boundary requested as AGENTS.md Phase 5 is documented in `phase-5-customer-workflow-boundary.md` and corresponds to the quote-request/customer-approval work described below as Phases 8 and 9.

Each phase should be a small reviewable PR with explicit scope, routes, risk, rollback, security, SEO, validation, and follow-up.

## Phase 0: audit and safeguards

- Goal: establish evidence and baselines.
- Areas: repository, routes, workflows, integrations, docs.
- Dependencies: none.
- Risks: incomplete inventory.
- Validation: root build/lint/SEO baseline; route and env scans.
- Rollback: docs/foundation revert.
- Done: eight migration documents, risk register, baseline results.

## Phase 1: workspace and Astro foundation

- Goal: independent Astro build without production routing change.
- Areas: `pnpm-workspace.yaml`, `apps/web`, root scripts.
- Dependencies: Phase 0.
- Risks: lockfile/build interference.
- Validation: root Next build and Astro check/build.
- Rollback: remove `apps/web` and workspace metadata.
- Done: both applications build independently; pilot is noindex and unlinked.

## Phase 2: CloudCannon configuration and pilot collection

- Goal: validate editor-friendly typed content.
- Areas: CloudCannon config, schemas, pages pilot, data files.
- Dependencies: Astro build.
- Risks: invalid config/preview URL; editor exposes dead fields.
- Validation: official schemas, CLI validate, Astro build, manual editor preview.
- Rollback: remove CloudCannon config and pilot content.
- Done: editor can update pilot fields, reorder supported sections, and build.

## Phase 3: shared Astro layout and component system

- Status: implementation complete on 2026-07-25; see `phase-3-component-system-validation.md`.
- Goal: accessible brand foundation.
- Areas: layout, header, footer, SEO/schema helpers, image, buttons, typography.
- Dependencies: brand/asset audit and data files.
- Risks: visual drift, performance, duplicated imagery.
- Validation: responsive/a11y review, Lighthouse/Core Web Vitals budget, reduced motion.
- Rollback: keep Next public layout active.
- Done: representative component showcase passes QA.

## Phase 4: low-risk public-page migration

- Status: local implementation complete on 2026-07-26; CloudCannon-hosted editor and screenshot sign-off pending. See `phase-4-low-risk-route-validation.md`.
- Goal: migrate `start-here`, FAQ, and selected static informational pages.
- Areas: pages collection and route templates.
- Dependencies: route parity records.
- Risks: metadata/internal-link loss.
- Validation: HTML/metadata/schema/screenshots/link comparison.
- Rollback: route remains on Next deployment/proxy.
- Done: each route meets parity and is CloudCannon-editable.

## Phase 5: event, trailer, and service-area migration

- Goal: migrate service pages and all 17 city pages.
- Areas: event types, trailers, service areas, structured FAQ relationships.
- Dependencies: content import tooling and URL rules.
- Risks: duplicate/thin local content; slug changes.
- Validation: all current URLs, local SEO checklist, schema, images, cross-links.
- Rollback: batch-level routing reversal.
- Done: no missing/changed canonical URL; editorial preview works.

## Phase 6: blog and resource migration

- Goal: move resources and decide Soro/CloudCannon blog ownership.
- Areas: `lib/resources.ts`, Soro feed, blog collections.
- Dependencies: content-source decision.
- Risks: published slug/date/image loss and duplicate content.
- Validation: full slug manifest, dates, author, HTML sanitation, redirects, feeds/sitemap.
- Rollback: continue serving Soro/Next routes.
- Done: one authoritative source and parity for every indexed article.

## Phase 7: homepage migration

- Goal: migrate the highest-value marketing route last.
- Areas: homepage sections, media, analytics events.
- Dependencies: full component system and media ownership decision.
- Risks: conversion/SEO/Core Web Vitals regression.
- Validation: A/B-like screenshot/content parity review, analytics, CTA, performance, mobile.
- Rollback: restore Next homepage routing.
- Done: signed-off content, SEO, accessibility, performance.

## Phase 8: quote-request integration

- Goal: Astro presentation with server-owned quote creation.
- Areas: `/request-quote`, `POST /api/quote-requests`, CORS/proxy/rate limits.
- Dependencies: API parity with current server action.
- Risks: missed emails, pricing drift, spam, cross-origin failure.
- Validation: realistic submissions, duplicate, distance modes, email, DB fields, failure recovery.
- Rollback: route form back to Next.
- Done: behavior matches canonical workflow and no secret/client calculation exposure.

## Phase 9: customer quote and approval boundary

- Goal: formalize permanent hosting of `/quote/[token]`.
- Areas: path proxy or secure Next host, token APIs, email origins.
- Dependencies: domain/deployment decision.
- Risks: invalidating links or weakening token controls.
- Validation: old/new links, expiry, single use, view tracking, all responses/options.
- Rollback: preserve current Next route and origin.
- Done: documented stable customer-workflow SLA and rollback.

## Phase 10: admin shell redesign

- Goal: shared operations navigation and status primitives.
- Areas: admin layout, navigation, loading/empty/error, status helpers.
- Dependencies: admin scenario fixtures.
- Risks: auth/noindex/mobile regressions.
- Validation: auth matrix, keyboard, responsive, dynamic freshness.
- Rollback: retain old shell component.
- Done: all current screens accessible from the new shell.

## Phase 11: admin dashboard and calendar redesign

- Goal: task queues and reliable schedule visibility.
- Areas: dashboard, filters, next-action model, booking/capacity backend, calendar.
- Dependencies: booking/double-booking data decision.
- Risks: false conflict confidence and stale data.
- Validation: status scenarios, conflict cases, timezone/date-only, mobile agenda.
- Rollback: dashboard feature flag or component revert.
- Done: next action is accurate; conflicts derive from server-owned rules.

## Phase 12: quote detail redesign

- Goal: workflow workspace instead of one long editor.
- Areas: detail sections, stepper, priority action, options, history, notes.
- Dependencies: transition rules and shared components.
- Risks: accidental customer sends or overwritten pricing.
- Validation: full workflow-safety matrix and API failure cases.
- Rollback: keep old editor behind a reversible switch during rollout.
- Done: every current action remains available with clearer prerequisites/results.

## Phase 13: pricing, media, and settings redesign

- Goal: safer configuration and clear content ownership.
- Areas: pricing groups/examples, media placement/alt text, settings health.
- Dependencies: CloudCannon/Supabase media boundary.
- Risks: price changes and dual media ownership.
- Validation: defaults/partial settings, save errors, future-vs-existing quote explanation, media preview.
- Rollback: page-level revert.
- Done: operational configuration is understandable and audit-friendly.

## Phase 14: SEO, redirect, accessibility, and cutover

- Goal: controlled production separation.
- Areas: DNS/proxy/deployments, redirects, sitemap, robots, analytics, monitoring.
- Dependencies: all migrated routes and end-to-end workflow tests.
- Risks: traffic, indexing, customer links, admin exposure.
- Validation:
  - crawl old/new URL manifest;
  - redirect status/chains;
  - metadata/schema/canonicals;
  - forms and workflow E2E;
  - CloudCannon publish/preview;
  - accessibility and Core Web Vitals;
  - secrets/bundle scan;
  - independent deployment health.
- Rollback: documented routing/DNS reversal to known Next deployment.
- Done: sign-off, monitoring, rollback owner, and no open critical risks.

## PR checklist

Every PR states:

- scope and out-of-scope;
- routes/workflows affected;
- data/status fields read and written;
- customer-visible side effects;
- security and SEO impact;
- accessibility/mobile impact;
- commands and results;
- rollback;
- known follow-up.
