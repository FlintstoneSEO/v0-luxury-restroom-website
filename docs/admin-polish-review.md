# Admin formatting and restraint pass

Workstream: Existing admin presentation refinement, not a redesign or migration.
Application: Root Next.js admin.
User workflow being improved: Scan quote queue, inspect quote details, navigate calendar, pricing and media screens.
Current implementation: Signature Operations / Quote Desk, navy rail and ivory workspace, existing Radix controls.
Current pain point: Route-dependent sidebar styling removes active indication; 10–11px helper text; false checkbox affordance; promotional calendar header; inconsistent panel and form sizing.
Proposed change: Retain layout and brand. Normalize navigation, readable utility typography, compact section headings, real control affordances, responsive action bar spacing, and quiet panel styling.
Routes affected: /admin and shared shell consumers, /admin/quotes/[quoteId], /admin/calendar, /admin/login.
Files likely affected: admin styles, shell, page header, dashboard display markup, calendar and login presentation.
Content or data involved: Existing quote, booking and settings presentation only. No data writes or schema changes.
Status fields involved: Existing quote/agreement/deposit labels and state logic preserved.
Customer-visible risk: No customer-facing action or email changes. Existing confirmations and disabled states retained.
SEO risk: None; admin noindex remains.
Security risk: No changes to authentication, authorization, APIs, tokens, secrets, providers or Supabase access.
Accessibility considerations: Focus, text contrast, readable helper sizes, touch targets, no fake checkbox; retain status labels.
Mobile considerations: Wrapping names/actions, 44px form targets, no horizontal page overflow, fixed-action safe area.
Migration or rollback strategy: No migration. Revert this pass's presentation diff only; preserve all earlier changes.
Validation steps: Local read-only browser inspection desktop/mobile; targeted lint and existing admin workflow tests; one detector pass. Never send, save, recalculate or mutate live records for visual QA.

Design references: Impeccable polish and craft-floor; Apple Design accessibility (Vision), layout (Visual hierarchy), typography (Ensuring legibility), sidebars, lists/tables and buttons (Style), translated to web controls. Use Apple principles without adding native-only glass or replacing the brand. Existing navy #152b3d, white, stone #f6f3ef, content #102442, muted #526171 and restrained gold focus are preserved. No new motion. Signature remains the quote queue and adjacent workbench, not decorative metrics.

Layout stays: desktop navigation | queue | inspector; compact navigation / queue-to-detail. Critical workflow, save guards and existing permissions remain untouched.

Validation results (2026-10-25):
- Targeted ESLint passed for all changed admin TSX files.
- Existing admin-workbench and quote-desk tests: 2 files / 9 tests passed.
- Root Next.js production build passed, including TypeScript and 75 generated pages, using isolated .next-admin-polish-check output. Fixed an existing optional-FAQ guard in the resource template uncovered by the build.
- Authenticated, read-only local browser review: dashboard and quote detail desktop/mobile; calendar, pricing and media. Pricing at 320px and media at 390px have no page overflow; pricing numeric inputs have connected labels; switches measure 24px tall. No operational saves, sends, recalculations or uploads performed.
- Impeccable detector on initial refinement targets found only retained Arial font warnings. Font retained intentionally for incumbent admin consistency.
- Media refinement removes duplicated heading and six oversized metric cards while preserving counts, actions, warnings and filters. No missing image records were changed.
- Separate pre-existing workflow issue: distance settings currently displays instructions/alert rather than persisting an environment setting, but claims success. This is outside presentation scope and was not changed.
- Production deployment and live provider actions were not tested or performed.

Calendar follow-up: corrected intrinsic seven-column sizing and toolbar wrapping; 320px browser confirmation reports document width 312px, viewport 320px, with all seven weekdays visible. Calendar TSX lint passed. Final calendar changes are presentation-only and were made after the successful production build.
