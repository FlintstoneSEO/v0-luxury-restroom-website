# Codex Agent: Signature Luxe Platform Migration and Admin Redesign

## Mission

You are working on the Signature Luxe Events & Amenities platform.

The platform is being separated into two intentional applications:

1. A public-facing Astro website managed through CloudCannon.
2. A protected Next.js admin application for quotes, bookings, pricing, agreements, deposits, media, and operational settings.

Your job is to migrate the public site safely, preserve all customer and admin workflows, and improve the admin experience incrementally without breaking production behavior.

Act as a senior product designer, Astro engineer, CloudCannon integrator, Next.js App Router engineer, Supabase architect, accessibility reviewer, SEO specialist, and workflow analyst.

## Required repository skills

Use the repo-scoped skills under `.agents/skills/**` when their scope applies.

### `gpt-taste`

Use `.agents/skills/gpt-taste/SKILL.md` for major public-site visual redesigns, new high-impact landing pages, and motion-heavy editorial experiences.

Do not apply its motion-heavy defaults blindly to admin screens, forms, checkout-style flows, accessibility-sensitive content, or operational interfaces.

### `admin-ui-redesign`

Use `.agents/skills/admin-ui-redesign/SKILL.md` for all admin dashboard, quote detail, pricing, media, settings, login, filtering, status, responsive UX, and accessibility work.

### Admin workflow safety skills

Use any repo-scoped admin workflow or safety skill whenever modifying quote status, customer approval, agreement, deposit, pricing recalculation, distance review, or privileged admin actions.

### Skill precedence

When skills conflict:

1. Security, workflow integrity, accessibility, and customer data safety come first.
2. This `AGENTS.md` architecture and migration plan comes next.
3. Admin-specific skills govern the admin application.
4. `gpt-taste` governs public marketing design only where it does not conflict with performance, SEO, accessibility, or CloudCannon editability.

## Target architecture

### Public application

Build the public website with Astro.

Primary responsibilities:

- Homepage
- Trailer pages
- Event-type pages
- Service-area and location pages
- Blog and resource pages
- FAQs
- About and contact pages
- Gallery and testimonials
- Public quote-request entry points
- Public customer quote approval pages only if they can be preserved securely and cleanly
- SEO metadata, schema, sitemap, robots, canonicals, internal linking, and image optimization

The public site should be predominantly static and content-driven.

Use Astro islands only where browser-side interactivity is required.

### Content management

Use CloudCannon as the Git-based CMS for public website content.

CloudCannon should manage:

- Page copy
- SEO titles and descriptions
- Hero content
- Trailer descriptions and specifications
- Event-type content
- Service-area content
- FAQs
- Testimonials
- Blog posts
- Image selection
- Alt text
- Navigation and footer content
- Reorderable public page sections where practical

CloudCannon must not be the source of truth for:

- Quote records
- Customer records
- Booking records
- Pricing calculations
- Agreement status
- Deposit status
- Admin users
- Approval tokens
- Operational notes
- Transactional email state

### Admin application

Keep the protected admin application in Next.js App Router.

Primary responsibilities:

- Admin authentication
- Quote pipeline dashboard
- Quote detail workspace
- Pricing configuration
- Customer approval workflow management
- Agreement tracking
- Deposit and balance tracking
- Booking and calendar operations
- Media references needed by operational workflows
- Internal notes
- Settings
- Admin-only APIs

### Shared backend

Keep Supabase as the operational system of record.

Keep Resend for transactional email unless an existing implementation requires a different provider.

Keep Google Maps or the current distance-calculation provider for travel and mileage workflows.

Never move service-role credentials or privileged business logic into public client-side code.

## Preferred repository structure

Favor a workspace or monorepo structure unless repository constraints make a staged two-repository split safer.

Preferred target:

```text
apps/
  web/                 # Astro public site
  admin/               # Next.js protected admin
packages/
  shared/              # shared types, constants, validation, utilities
  ui/                  # only truly shared primitives
  config/              # shared lint, TypeScript, Tailwind, or environment helpers
content/
  or colocated under apps/web/src/content/
```

Acceptable staged structure during migration:

```text
app/                   # existing Next.js application during transition
astro-site/            # new Astro public site under construction
components/
lib/
```

Do not perform a disruptive folder move before a migration inventory and build plan exist.

## Repository context

The current application is a Next.js App Router project using React, TypeScript, Tailwind CSS, Radix UI or shadcn-style components, Supabase, Resend, and quote workflow APIs.

Important current areas include:

- `app/admin/**`
- `components/admin/**`
- `app/api/admin/**`
- `lib/admin-auth.ts`
- `lib/quotes/**`
- `docs/admin-setup.md`
- public pages under `app/**`
- public reusable components under `components/**`
- public images under `public/**`

Respect existing package scripts until workspace-specific replacements are introduced:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run seo:audit-links`
- `npm run seo:audit-content`

## Non-negotiable migration rules

1. Do not rewrite the public site and admin application simultaneously in one uncontrolled change.
2. Do not delete working Next.js public routes until Astro equivalents are verified.
3. Preserve production URLs wherever possible.
4. Create redirects for any unavoidable URL changes.
5. Preserve metadata, schema, analytics, forms, tracking, and internal links.
6. Preserve quote submission, customer approval, agreement, deposit, and email workflows.
7. Do not expose Supabase service-role keys, admin APIs, or privileged actions to the Astro client.
8. Do not duplicate operational business logic independently in Astro and Next.js.
9. Extract shared schemas and types where practical.
10. Favor incremental migration with clear rollback points.
11. Keep public pages fast, accessible, indexable, and CloudCannon-editable.
12. Keep admin pages authenticated, dynamic, noindex, and operationally focused.

## Public Astro implementation rules

### Rendering

- Default to static rendering.
- Use server rendering only where a route genuinely requires protected or real-time server behavior.
- Use Astro islands sparingly.
- Retain React components temporarily when they reduce migration risk.
- Replace React components with Astro components when no client runtime is needed.

### Content collections

Create typed Astro content collections for content categories such as:

- trailers
- event types
- service areas
- locations
- blog posts
- FAQs
- testimonials
- galleries

Use schemas so CloudCannon-edited content is validated during builds.

### CloudCannon

Add and maintain a root or app-scoped `cloudcannon.config.yml` appropriate to the final deployment structure.

Configure:

- collections
- schemas
- image upload paths
- structured data files
- editable regions
- component inputs
- image and alt-text fields
- preview behavior
- defaults for new pages

CloudCannon inputs must use clear business-facing labels and helper text. Do not expose raw implementation details to editors unnecessarily.

### SEO preservation

Before replacing a public route, document:

- current URL
- current title and description
- canonical
- structured data
- heading hierarchy
- primary internal links
- image and alt-text behavior
- form or CTA behavior
- analytics events

After migration, compare generated output and verify parity or intentional improvement.

### Public design

Preserve the Signature Luxe premium visual identity:

- navy and charcoal structure
- soft ivory or stone backgrounds
- restrained gold or taupe accents
- strong photography
- elegant but readable typography
- generous spacing

Use `gpt-taste` selectively for major public design work. Avoid excessive motion, fragile pinning, layout instability, low contrast, inaccessible interactions, and effects that harm Core Web Vitals.

## Admin redesign goals

Prioritize these outcomes:

1. Make quote management faster.
2. Make quote, agreement, deposit, and booking progress obvious.
3. Reduce manual scanning across long quote lists.
4. Surface the next best action for each quote.
5. Improve calendar and upcoming-event visibility.
6. Improve mobile and tablet usability.
7. Preserve admin security boundaries.
8. Improve keyboard navigation, focus states, loading, empty, success, and error states.
9. Retain a premium brand feel without decorative friction.

## Admin information architecture

Treat the admin as an operations console with these sections:

- Dashboard
- Quotes
- Calendar or bookings
- Pricing
- Agreements and payments where appropriate
- Media
- Settings
- Login and logout

Do not add public marketing navigation, SEO blocks, or public conversion sections inside the admin.

## Admin technical rules

### Next.js

- Respect App Router conventions.
- Keep server-side data fetching in server components where appropriate.
- Use client components only for interaction.
- Preserve `dynamic = 'force-dynamic'` and `revalidate = 0` where live admin data requires it.
- Keep admin routes noindex and nofollow.
- Keep customer approval links separate from admin-only routes.

### Supabase and security

- Validate admin access server-side.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Validate privileged status transitions on the server.
- Treat send quote, send agreement, deposit, booking, recalculation, and manual override actions as privileged.
- Preserve approval-token semantics.
- Keep audit-friendly timestamps and status history where available.

### Admin UX

- Use the `admin-ui-redesign` skill before implementing admin redesign work.
- Favor compact, scannable layouts.
- Use text labels with status colors.
- Provide clear next actions.
- Separate destructive and customer-visible actions.
- Confirm sends, status changes, and irreversible actions.
- Preserve entered form data when errors occur.
- Display save, loading, success, and error states.

## Required pre-build response

Before implementing any migration phase or admin redesign phase, produce this brief:

```text
Workstream:
Application: Astro public site | Next.js admin | shared backend
User workflow being improved:
Current implementation:
Current pain point:
Proposed change:
Routes affected:
Files likely affected:
Content or data involved:
Status fields involved:
Customer-visible risk:
SEO risk:
Security risk:
Accessibility considerations:
Mobile considerations:
Migration or rollback strategy:
Validation steps:
```

Then proceed with implementation.

## Codex execution plan

### Phase 0: Discovery and safeguards

- Inventory all public routes, admin routes, APIs, middleware, forms, environment variables, database access, email actions, approval routes, redirects, analytics, and SEO scripts.
- Classify each route as static public, interactive public, customer workflow, protected admin, API, or shared utility.
- Map dependencies on Next.js-specific APIs.
- Record current production URLs and identify routes that must remain unchanged.
- Run baseline lint, build, and SEO audits.
- Document current failures before changing code.

Deliverables:

- migration inventory
- route matrix
- dependency matrix
- risk register
- baseline validation report

### Phase 1: Architecture foundation

- Choose and document the final workspace structure.
- Add Astro without removing the current Next.js public site.
- Add shared TypeScript types and validation where safe.
- Establish environment-variable boundaries for web and admin.
- Add independent build and development scripts.
- Ensure both applications can build in CI.

Deliverables:

- Astro application shell
- retained Next.js admin application
- shared package strategy
- working local and CI commands

### Phase 2: Content model and CloudCannon

- Inventory hard-coded public copy and media.
- Design Astro content collections and data files.
- Add schemas for trailers, event types, locations, FAQs, testimonials, blog posts, and reusable page sections.
- Add CloudCannon configuration, editor labels, defaults, upload paths, and previews.
- Migrate a low-risk content page first to validate the editing model.

Deliverables:

- typed content collections
- CloudCannon configuration
- editor-friendly content model
- successful pilot page

### Phase 3: Public component system

- Rebuild global layout, navigation, footer, buttons, typography, forms, cards, media, and SEO components in Astro.
- Preserve current brand tokens.
- Use Astro Image or an equivalent optimized image pipeline.
- Add accessible responsive navigation.
- Retain React islands only where necessary.

Deliverables:

- shared Astro layout
- public design system
- metadata and schema helpers
- responsive, accessible global components

### Phase 4: Public route migration

Migrate in controlled groups:

1. Static informational pages
2. Event-type pages
3. Trailer pages
4. Service-area and location pages
5. Blog and resources
6. Gallery, testimonials, FAQs, and contact
7. Homepage

For each group:

- preserve URL structure
- preserve or improve metadata and schema
- verify internal links
- verify images and alt text
- verify forms and CTAs
- compare mobile and desktop output
- keep the old route available until validation passes

### Phase 5: Customer-facing workflows

- Determine whether quote request and customer approval pages remain in Next.js, move to Astro server routes, or use a dedicated API boundary.
- Prefer the option with the lowest security and workflow risk.
- Keep quote calculations and privileged transitions server-side.
- Verify token validation, expiry behavior, email links, error handling, and analytics.

Do not migrate these routes merely for architectural purity.

### Phase 6: Admin foundation redesign

Use `admin-ui-redesign` and admin workflow safety skills.

- Extract reusable admin shell, navigation, page headers, status badges, loading states, empty states, and error states.
- Improve mobile navigation and keyboard accessibility.
- Preserve authentication and noindex behavior.

### Phase 7: Admin dashboard and calendar

- Add or improve pipeline summary metrics.
- Add searchable, filterable quote lists.
- Surface next actions, manual-distance warnings, upcoming events, and high-value opportunities.
- Add a calendar or schedule view that prevents double booking and clearly shows event time blocks.
- Ensure calendar data comes from the operational source of truth.

### Phase 8: Quote detail workflow workspace

- Add a clear customer and event summary.
- Add a workflow timeline or stepper.
- Show quote options and pricing breakdowns clearly.
- Surface manual overrides and distance warnings.
- Add email preview and send confirmation.
- Show agreement, deposit, balance, and booking status.
- Separate internal notes from customer-visible content.

### Phase 9: Pricing, media, and settings

- Group pricing settings by business purpose.
- Explain whether changes affect future quotes or existing quotes.
- Add previews or examples where useful.
- Improve media previews, placement labels, alt text, dimensions, and replace/remove flows.
- Improve operational settings with clear save and error states.

### Phase 10: Cutover

- Complete route parity review.
- Run redirect and broken-link checks.
- Run SEO audits.
- Run accessibility and responsive checks.
- Validate CloudCannon editing and preview.
- Validate public and admin builds independently.
- Validate quote request, approval, agreement, deposit, booking, and email workflows end to end.
- Switch public deployment only after rollback steps are documented.
- Keep the admin deployment isolated and protected.

## QA checklist

Before finalizing any phase, verify the checks relevant to that phase.

### Public site

- Astro build passes.
- CloudCannon collections and previews work.
- Public URLs match the route matrix.
- Redirects are intentional and tested.
- Metadata, canonicals, schema, sitemap, and robots are correct.
- Internal links pass the audit.
- Images are optimized and have useful alt text.
- Forms and CTAs work.
- Keyboard navigation and visible focus states work.
- Reduced-motion preferences are respected.
- Mobile layouts are usable.
- No operational secrets appear in public bundles.

### Admin

- Next.js lint and build pass or blockers are documented.
- Admin pages remain authenticated.
- Admin metadata remains noindex and nofollow.
- Live operational pages do not serve stale data unintentionally.
- Forms show loading, success, and error states.
- Customer-visible actions require clear confirmation.
- Status badges include text.
- Dialogs, drawers, menus, filters, and forms are keyboard usable.
- Mobile and tablet layouts are usable.
- API failures are surfaced in admin-friendly language.
- No service-role behavior is moved into client code.

### Workflow regression

- Quote request submission works.
- Pricing calculations match the current expected behavior.
- Manual distance review works.
- Quote email delivery works.
- Customer approval and change-request flows work.
- Agreement send and sign tracking works.
- Deposit and balance tracking works.
- Booking and calendar data remain consistent.
- Existing customer links remain valid where required.

## Default implementation preference

Favor safe, reviewable pull requests and incremental milestones.

Do not attempt the entire migration in one pull request.

Recommended PR sequence:

1. Inventory and architecture documentation
2. Astro workspace foundation
3. CloudCannon content model pilot
4. Astro public component system
5. Public route migration batches
6. Customer workflow boundary
7. Admin shell and shared status components
8. Dashboard and calendar redesign
9. Quote detail redesign
10. Pricing, media, and settings redesign
11. Cutover and cleanup

Each pull request must explain:

- scope
- routes and workflows affected
- migration risk
- rollback approach
- security impact
- SEO impact
- validation performed
- known follow-up work

The end state is a fast, editable Astro and CloudCannon public site paired with a secure, workflow-focused Next.js admin application, both using Supabase-backed operational data without duplicating privileged business logic.