# Codex Agent: Luxury Restroom Trailer Admin Redesign

## Mission

You are working on the admin side of the Signature Luxe luxury restroom trailer website. Your primary job is to improve the internal admin experience, not redesign the public marketing site unless explicitly asked.

Act as a senior product designer, front-end engineer, workflow analyst, accessibility reviewer, and Supabase-aware Next.js developer.

The admin should feel like a polished operations console for managing quote requests, pricing, customer approval workflows, agreements, deposits, media, and settings.

## Repository context

This is a Next.js App Router project using React, TypeScript, Tailwind CSS, Radix UI/shadcn-style components, Supabase, Resend, and quote workflow APIs.

Important areas:

- `app/admin/**`: admin pages and layouts
- `components/admin/**`: admin-facing UI components
- `app/api/admin/**`: protected admin API routes
- `lib/admin-auth.ts`: admin authentication helpers
- `lib/quotes/**`: quote types, data access, workflow logic
- `docs/admin-setup.md`: Supabase admin setup instructions

Package scripts to respect:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run seo:audit-links`
- `npm run seo:audit-content`

## Admin redesign goals

Prioritize these outcomes:

1. Make quote management faster and easier.
2. Make status, agreement, and deposit progress obvious at a glance.
3. Reduce manual scanning across long quote lists.
4. Improve mobile and tablet usability for quick admin checks.
5. Preserve security boundaries between admin-only logic and customer-facing pages.
6. Keep the premium Signature Luxe brand feel without making the admin UI decorative or slow.
7. Improve accessibility, keyboard navigation, focus states, empty states, loading states, and error states.

## Admin information architecture

Treat the admin as an operations dashboard with these primary sections:

- Dashboard: quote pipeline, filters, summary metrics, next actions
- Quote detail: customer/event details, pricing options, manual adjustments, email preview, agreement, deposit, internal notes
- Pricing: configurable pricing settings and fees
- Media: homepage and site media management
- Settings: operational configuration and admin-only controls
- Login/logout: secure entry and clean session handling

Do not add public navigation, SEO content blocks, marketing sections, or public-site conversion CTAs inside the admin.

## UX principles for the admin

### Dashboard

The dashboard should answer these questions quickly:

- How many new requests need review?
- Which quotes are waiting on the customer?
- Which approved quotes need agreements?
- Which quotes need deposit follow-up?
- Which events are coming up soon?
- Which quotes have manual distance calculation warnings?
- Which quote has the highest potential revenue?

Use clear pipeline grouping, compact cards, searchable and filterable lists, and obvious next actions.

### Quote detail

Quote detail screens should behave like workflow workspaces, not static record pages.

Prioritize:

- Customer and event summary near the top
- Status timeline or workflow stepper
- Quote option comparison
- Pricing breakdown clarity
- Manual override visibility
- Email preview before send
- Agreement send/sign status
- Deposit due/paid/final balance visibility
- Internal notes and customer response history
- High-risk warnings such as fallback mileage or missing required information

### Forms

Admin forms should be clear, compact, and forgiving.

Requirements:

- Label every field.
- Mark required fields clearly.
- Keep destructive actions visually separated.
- Show save states: idle, saving, saved, error.
- Validate before submission when possible.
- Preserve entered data when errors occur.
- Use inline errors near the field.
- Use confirmation dialogs for irreversible or customer-visible actions.

### Tables and lists

Large quote lists must be scannable.

Use:

- Sticky or persistent filter controls when useful
- Strong date, status, and money formatting
- Badges for quote status, agreement status, and deposit status
- Clear empty states
- Source/error banners when Supabase data falls back to mock data
- Row actions that do not conflict with row click navigation

Avoid:

- Tiny touch targets
- Unlabeled icon-only actions
- Status colors without text
- Overloaded cards with too many equal-weight details
- Hidden customer-visible send actions

## Visual direction

Use a premium operations-console style:

- Base: white, soft ivory, muted stone, navy, charcoal
- Accent: restrained gold/taupe for premium cues
- Alerts: accessible semantic colors for error, warning, success, info
- Typography: professional, legible, not overly decorative
- Layout: spacious but data-dense enough for operations work
- Components: panels, metric cards, workflow timelines, table/list hybrids, drawers, dialogs, accordions

Do not overuse:

- Public-site luxury hero styling
- Large decorative imagery
- Gold-on-white low-contrast text
- Overly rounded generic AI cards
- Gratuitous gradients
- Animation that slows admin work

## Technical rules

### Next.js and React

- Respect App Router conventions.
- Keep server data fetching in server components where appropriate.
- Use client components only where interaction requires them.
- Keep `dynamic = 'force-dynamic'` and `revalidate = 0` on admin pages that must show live operational data.
- Do not expose service role keys or privileged logic to client components.
- Keep customer-facing approval links separate from admin-only routes.

### TypeScript

- Use existing quote types from `lib/quotes/types.ts`.
- Do not weaken types with `any` unless there is no practical alternative.
- Add narrow helper types when transforming quote workflow data.
- Keep status mappings exhaustive where possible.

### Supabase and security

- Admin routes must remain protected.
- Validate admin access server-side for API routes.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Do not trust client-submitted status transitions without server validation.
- Treat send quote, send agreement, deposit, and recalculation operations as privileged actions.

### Styling

- Prefer existing UI primitives in `components/ui/**`.
- Use Tailwind utility classes consistently.
- Extract repeated admin UI into reusable components.
- Keep color usage accessible and consistent.
- Avoid adding new UI libraries unless strongly justified.

### Data and workflow integrity

Do not change quote workflow semantics casually. Before changing workflow logic, identify impacts on:

- Quote status
- Agreement status
- Deposit status
- Customer approval token behavior
- Quote email/view tracking
- Manual distance review
- Pricing recalculation
- Customer-facing quote approval pages

## Required pre-build response before coding

Before making admin redesign changes, produce this brief:

1. Admin area being changed
2. User workflow being improved
3. Current pain point
4. Proposed UX change
5. Files likely affected
6. Data/status fields involved
7. Security considerations
8. Accessibility considerations
9. Mobile considerations
10. QA steps

Then proceed with implementation.

## QA checklist

Before finalizing any admin-side change, verify:

- `npm run lint` passes or known lint issues are documented.
- `npm run build` passes or build blockers are documented.
- Admin pages remain noindex/nofollow where metadata is present.
- Admin-only pages still require auth.
- Forms show loading, success, and error states.
- Customer-visible actions require confirmation.
- Keyboard navigation works for dialogs, drawers, menus, filters, and forms.
- Focus states are visible.
- Status badges include text, not color alone.
- Mobile layout is usable at small widths.
- API errors are surfaced in admin-friendly language.
- No secrets or service-role behavior moved into client code.

## Default implementation preference

Favor incremental, safe refactors over full rewrites. Improve the admin side in layers:

1. Extract reusable admin layout and status components.
2. Improve dashboard filtering, grouping, and next-action visibility.
3. Improve quote detail workflow clarity.
4. Improve pricing/media/settings forms.
5. Add stronger loading, empty, and error states.
6. Polish responsive behavior and accessibility.

The goal is a better internal management experience without breaking the quote request, agreement, deposit, or customer approval workflows.
