# Phase 6 admin foundation

Status: locally implemented on 2026-07-26.

This document follows the phase numbering in the repository `AGENTS.md`. The older `phased-implementation-plan.md` calls the same admin-shell work Phase 10.

## Scope

Phase 6 establishes the protected admin application's shared presentation foundation without changing operational workflow behavior.

Implemented:

- a server layout that applies `noindex`, `nofollow`, and `nocache` metadata across `/admin/**`;
- a responsive operations shell with desktop navigation and a focus-managed mobile sheet;
- active-route state, `aria-current`, breadcrumbs, a skip link, and explicit main/navigation landmarks;
- navigation to every currently implemented admin destination;
- logout loading and failure feedback;
- a visually isolated `/admin/login` screen;
- shared admin page-header, loading, empty, error, save-state, and status-badge primitives;
- centralized labels and semantic tones for quote, agreement, and deposit statuses;
- shared status badges on dashboard records;
- shared page headers and feedback on low-risk pricing, media, settings, and distance screens;
- route-level admin loading and error boundaries.

Deferred:

- calendar or booking-capacity behavior;
- server-derived next actions;
- quote-detail workflow restructuring;
- allowed status-transition enforcement;
- pricing-form and media-manager redesign;
- any quote, agreement, deposit, provider, email, or customer-visible mutation changes.

## Workflow and data safety

This phase reads existing status strings for presentation only.

- New statuses: none.
- Data writes: none beyond the existing logout call and pre-existing settings forms.
- API behavior changes: none.
- Customer-visible side effects: none.
- Auth boundary: unchanged; `middleware.ts` continues to protect admin pages and APIs.
- Service-role use: unchanged and server-only.

The shared badge handles unknown status values with a readable title-cased label and a neutral tone instead of hiding the value.

## Accessibility and responsive behavior

- The first keyboard action can skip directly to admin content.
- Desktop and mobile navigation expose the current route with `aria-current="page"`.
- Mobile navigation uses the existing Radix dialog-based sheet for focus trapping, Escape behavior, and focus return.
- Icon buttons and logout actions have visible text or accessible names.
- Statuses always contain visible text and an icon in addition to color.
- Loading and save results use polite live regions; errors use alert semantics.
- Admin motion remains minimal and respects the global reduced-motion rules.

## Routes

| Route | Foundation behavior |
| --- | --- |
| `/admin` | Protected shell; Dashboard active |
| `/admin/quotes/[quoteId]` | Protected shell; Dashboard active; quote breadcrumbs |
| `/admin/pricing` | Protected shell; Pricing active |
| `/admin/site-media` | Protected shell; Media active |
| `/admin/settings` | Protected shell; Settings active |
| `/admin/distance-settings` | Protected shell; Distance active |
| `/admin/login` | No operations shell; noindex metadata retained |

## Rollback

Revert the Phase 6 admin layout and shared component files. No database, provider, status, or customer data recovery is required because this phase adds no operational mutations.

## Validation

Run:

```bash
corepack pnpm exec tsc --noEmit --pretty false
corepack pnpm lint
corepack pnpm build
```

Local results on 2026-07-26:

- TypeScript: passed.
- Next.js production build: passed.
- `/admin/login`: returned `200`, `noindex, nofollow`, and did not render the operations shell.
- unauthenticated `/admin`: returned `307` to `/admin/login`.
- ESLint: blocked by the existing repository setup; the invoked ESLint 6.4.0 cannot find a configuration file.
- Build warning retained: Next.js reports that the `middleware` file convention is deprecated in favor of `proxy`.

Live Supabase-backed screen review, authenticated keyboard testing, and physical mobile-device review remain deployment or preview-environment checks.
