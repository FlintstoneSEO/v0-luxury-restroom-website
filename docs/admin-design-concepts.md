# Admin design exploration: three directions and a combined fourth

## Quote-detail design proposals — October 18, 2026

New request: provide three alternative quote-detail mockups, not application implementation. Artifacts: `output/quote-detail-design-concepts/index.html` and three PNGs. The approved persistent navy admin shell is a deliberate shared constraint; the directions differ in task structure, density and editing approach rather than global navigation.

Source audit: `quote-detail-editor.tsx` currently has a long stacked form: customer; event and utilities; pricing/recalculation/manual override; quote options; three separate tracking families; agreement references/dates; deposit references/dates; customer activity; public/private notes; explicit save, preview and confirmed send actions. Same-date requests and manual-distance notices appear above the form. The existing open browser was viewed read-only and showed same-date availability, customer and event sections. No values were entered or actions triggered; no live record data was used for image generation.

Preserve: all existing fields, pricing/options calculations, financial-lock/revision rules, provider identifiers, test visibility, direct quote route, unsaved/error recovery, authorization and token/customer links. Improve: task hierarchy, current summary, save scope, scanability and next-action placement. Restructure only the presentation. Replace neither backend nor status semantics. Saved public/admin changes remain untouched.

1. **Quote Desk — recommended, fit 5/5, implementation risk medium.** A tabbed editable work area (Event; Pricing & options; Agreements & payments; Activity & notes) plus persistent summary and explicit action shelf. Best for daily quote management. Mobile uses focused sections and a summary drawer; one shared draft must persist through tab changes. Requires complete field mapping, dirty-state protection, keyboard tabs and independent tracking, plus error/submission verification before implementation.
2. **Event Dossier — fit 4.5/5, risk low-medium.** A single-page anchored event file, paired customer/event and pricing panels, independent agreement/deposit panels, notes and action dock. Best for whole-event review and minimal tab switching. Mobile uses anchored stacked sections with intentional disclosure. Requires clear edit/save boundaries, form-error focus and accessible anchors; longer scrolling is the main tradeoff.
3. **Pricing Studio — fit 4/5 for general management, 5/5 for multi-option quoting; risk medium-high.** Itemized option comparison dominates, with persistent preparation sidebar. Best for pricing/utility alternatives. Event/tracking/notes remain accessible. Mobile selects one option at a time with a deliberate compare mode rather than squeezing two tables. Requires strong distinction among recommended, selected and draft options, financial locks, explicit revision and independent save/preview/send flows.

Shared visual language: navy structure, stone workspace, white panels, restrained gold; serif identity/title and sans-serif functional text. No marketing composition or decorative motion. No new roles, autosave, hourly scheduling or multi-trailer allocation. Pending requests remain non-reserving; agreement/deposit completion is not introduced as a new booking prerequisite.

Mockups use fictional Morgan Reed / SL-DEMO-0248, not the viewed customer. Figures are illustrative, not new rates or policy. Visual QA corrected an image-generated incorrect booking prerequisite, a balance typo, utility-field wording and a wrong active navigation item. Illustrations may abbreviate fields and invent decorative copy/required markers; implementation must map every real field and verify actual action eligibility. Optional fee descriptions, trailer details and note text in the illustrations are fictional examples, not scope or product claims. These images do not prove keyboard access, responsive rendering, saved state, role behavior, calculations or provider delivery.

The substantial-redesign implementation gate is not complete for quote-detail implementation: a selected direction, full field/action/state specification and safe responsive/workflow regression plan are still needed. No application source, route, API, records, statuses, email, agreement or payment was changed for this mockup request.

October 18, 2026. Concept review only; no application implementation, operational writes, new roles, or route migration. Four image mockups use fictional demo records. Open `output/admin-design-concepts/index.html` to compare them. They are visual proposals, not tested interactive screens or authoritative workflow specifications.

## Scope and brief

Workstream: Protected admin design exploration.
Application: Root Next.js admin; not the Astro marketing site or the separate `apps/admin` extraction foundation.
User workflow being improved: Triage inquiries, inspect a quote, understand its next step, and see reserved dates.
Current implementation: App Router server pages with a shared client admin shell, quote dashboard/editor, booking calendar, pricing, media, distance settings, and protected APIs.
Current pain point: Large introductory panel, six metric cards, calendar, and verbose filter sections precede the queue. Long quote records and the quote editor require substantial scanning. Functional typography inherits a serif face.
Proposed change: Compare queue-first, task-first, and schedule-first structures, then a combined queue/workbench with subordinate booking outlook.
Routes affected if later implemented: `/admin`, `/admin/calendar`, `/admin/quotes/[quoteId]`, and the shared shell used by pricing/media/settings. No route changes now.
Files inspected: `components/admin/admin-shell.tsx`, `quote-requests-dashboard.tsx`, `quote-detail-editor.tsx`, `booking-calendar.tsx`, `admin-page-header.tsx`; `app/admin/page.tsx`, `layout.tsx`, `calendar/page.tsx`; `lib/admin-auth.ts`, `lib/quotes/types.ts`, `status.ts`; `app/globals.css`.
Files changed now: Design documentation and isolated mockup artifacts only.
Content/data involved: Existing quote, agreement, deposit, booking/date, manual-distance, pricing and test-record concepts. Generated images contain only invented examples.
Status fields involved: Existing quote lifecycle, agreement tracking, deposit tracking, manual distance review, test-record visibility, date reservation state. No new values.
Customer-visible risk: None from static mockups. Later sends, recalculation, financial revision and booking actions remain privileged and confirmation-sensitive.
SEO risk: None; preserve authenticated dynamic noindex/no-store behavior in any later implementation.
Security risk: No auth/data changes. Keep server authorization, service role, approval tokens and customer origins separate from presentation.
Accessibility considerations: Clear sans-serif functional typography, text with status colors, semantic tables/tabs, focus-managed detail drawer, visible focus, labelled controls, announced save/error state, adequate touch targets.
Mobile considerations: One task at a time rather than shrinking a multi-pane desktop. Specific adaptations below.
Migration/rollback strategy: No migration, cutover or app modification. Remove the isolated artifact/docs to discard the concepts.
Validation: Observed the existing authenticated dashboard in its open browser; audited selected source files; visually reviewed generated mockups and corrected filter/next-action inconsistencies. No application builds or workflow tests were needed or claimed for static image proposals.

## Observed application audit

The current browser at `http://localhost:3001/admin` shows a functioning quote dashboard, real records, pipeline filters, a booked-events calendar and next-event list. No personal/customer data from that browser was used in image generation. Only read-only viewing/scrolling occurred; no records, test quotes, emails, prices or bookings were created or modified.

The current dashboard defaults to the New Requests bucket, which was empty during inspection even though other buckets held records. At the observed width, navigation was a drawer, six metrics occupied two rows, and a large calendar appeared before the filter/queue region. These are observed hierarchy issues, not claims that the existing calendar or navigation is missing.

Source inspection confirms the dashboard's test-record filtering, separate agreement/deposit filters, manual-distance flags, status buckets and estimated-pipeline label. `app/globals.css` maps both `--font-sans` and `--font-serif` to Cormorant Garamond, consistent with the serif-heavy rendered admin. A later fix should be scoped to admin rather than replacing public-site typography.

`docs/migration/admin-redesign-plan.md` is historical: some statements about absent calendar/navigation/booking enforcement no longer describe the current code. It was background context, not treated as current truth.

### Role and permission inventory

| Actor | Boundary |
|---|---|
| Authorized admin | Server verifies `user.app_metadata.is_admin === true`; privileged APIs must continue authorizing independently. |
| Anonymous user | Existing sign-in/401 boundary; no proposed access expansion. |
| Signed-in non-admin | Existing 403 boundary; do not rely on hidden buttons for protection. |
| Customer with quote token | Separate customer URL and server validation; no admin shell or CMS behavior. |

No additional staff, dispatcher, finance or editor role was established. Mockups do not invent assignments or team permissions. Hosted role lifecycle was not tested.

### Primary workflows and preservation

| Task | Current mechanics and protected outcome | Proposed presentation improvement |
|---|---|---|
| Find/review request | Search/filter/sort, test visibility, pipeline bucket, open quote | Put the working queue in the first viewport and show the selected record beside it. |
| Prepare quote | Event/customer fields, option/itemized pricing, distance fallback/manual override | Group Event, Pricing, Activity and Notes; keep unresolved distance visible. |
| Save/recalculate | Explicit save, confirmation when replacing manual pricing, financial locks/revisions | Distinguish save feedback from recalculation; retain entered values after errors. |
| Send quote | Preview, confirmation, server token/email behavior | Clear preview and confirm sequence, never a one-click row send. |
| Approval/agreement | Separate primary quote and agreement states, customer response, privileged agreement action | Explicit status family labels and a contextual action area. |
| Deposit/balance | Separate payment tracking and financial controls | Preserve itemization and payment meaning; no automatic deposit action inferred from agreement sent. |
| Booking/calendar | Existing day-based single-trailer rules and same-date summaries | Compact outlook on dashboard; full calendar on its existing route. Requests do not reserve dates. |
| Media/pricing/settings | Existing dedicated routes, fields, validation, explicit saves | Carry the selected shell and form mechanics across them later. |

Workflow indicators summarize existing fields; they must not become a new database state machine or imply that every record followed an identical linear path. Any proposed next-action helper needs a verified mapping of all existing statuses and server eligibility, including expired/cancelled/change-requested/manual-override/financial-lock cases.

### Preserve / Improve / Restructure / Replace

| Decision | Scope | Rationale / regression risk |
|---|---|---|
| Preserve | Auth, noindex/dynamic behavior, Supabase/provider adapters, status values, pricing semantics, tokens/customer URLs, capacity rules | High risk if changed; outside visual scope. |
| Improve | Typography, action priority, status clarity, empty/filter feedback, compact calendar summary | Presentation work; requires responsive and keyboard regression. |
| Restructure | Dashboard order, quote-detail grouping, shell navigation presentation | Medium risk: retain every action, field, filter and direct-access route. |
| Replace | Oversized hero/metric-card hierarchy with compact header and counts | Low domain risk; compare metric definitions, test visibility and empty states. |
| Do not replace | Existing backend, booking enforcement, email/payment/agreement workflows | No redesign need or authorization for new rules. |

## Navigation and shared primitives proposal

Retain the current destinations: Dashboard `/admin`; Booking Calendar `/admin/calendar`; Pricing & Settings `/admin/pricing` with the existing settings entry preserved; Media `/admin/site-media`; Distance `/admin/distance-settings`; existing homepage-media route remains reachable through media workflow. Quote detail stays `/admin/quotes/[quoteId]`. Queue/detail tabs are presentation within these destinations, not silently added routes. No public marketing navigation.

Reusable UI mechanics: `AdminShell`, compact page header, queue toolbar, filter disclosure, status indicator using the existing status formatter, semantic record table/mobile list, detail panel, form section, save/error feedback, confirmation dialog, and booking-outlook presentation.

Domain-owned mechanics stay separate: lifecycle grouping, next-action eligibility, financial locks, calculation/revision behavior, distance fallback, send/provider actions and day reservation rules. UI primitives must not duplicate them or issue privileged calls themselves.

## Four directions

### 1. Quiet Console — queue-first

See `output/admin-design-concepts/01-quiet-console.png`.

Strategy: Compare many inquiries quickly. Navy persistent navigation, compact pipeline totals, table as the dominant region, narrow inspector and a small next-reserved-date strip. Dense aligned columns provide hierarchy; no large promotional header. Ivory/white surfaces, restrained gold, serif wordmark and crisp sans-serif data. No decorative media or animation; row selection and focus do the work.

Mobile: Replace table with a concise record list; filters in a labelled sheet; selected record opens a full-screen detail surface with Back to results. Preserve filter/search state. Risk: inspector can become cramped; complex edits should use the existing full quote route. Subjective fit 4/5; implementation risk medium. Best alternate for fast scanning.

### 2. Workflow Desk — task-first

See `output/admin-design-concepts/02-workflow-desk.png`.

Strategy: Finish one inquiry without losing the work queue. Horizontal global navigation, left master list, broad editing workspace and a narrow next-booking reminder. Little table density; task labels, grouped fields and the selected record lead. Warm stone, white, navy and muted sage. Functional sans-serif; small brand serif. Explicit note save and an action/confirmation bar. No photography or decorative motion.

Mobile: Queue and detail become separate views; top navigation becomes a focus-managed menu; selected-record save/send controls remain reachable above the keyboard. Risk: multi-pane state and unsaved-change protection need careful design; task grouping must agree with status semantics. Subjective fit 4.5/5; implementation risk medium-high. Strongest individual-quote workspace.

### 3. Schedule Studio — date-first

See `output/admin-design-concepts/03-schedule-studio.png`.

Strategy: Make date capacity and pending requests visually distinct. Slim labelled navigation rail, day-based week/month calendar, upcoming list and contextual quote inspector. Calendar position and text legends supply hierarchy; no hourly lanes or multi-trailer dispatch. Navy/ivory with semantic amber review and muted status accents. Mostly sans-serif data; serif accents must remain subordinate.

Mobile: Replace the seven-column week with a date selector and agenda; keep 'request, not reserved' labels. Quote inspector becomes a separate view. Risk: a sparse calendar can waste the dashboard's first viewport and make quote triage secondary. Preserve the existing day-based backend; no availability promise inferred from empty cells. Subjective fit 4/5; implementation risk medium. Best as the dedicated Calendar direction.

### 4. Signature Operations — combined, recommended

See `output/admin-design-concepts/04-signature-operations.png`.

Combine 1's persistent shell and concise status totals, 2's queue-plus-quote workbench, and 3's explicit reservation distinction in a subordinate booking outlook. The queue is visible immediately, selecting a quote reveals the work context, and the calendar remains a dedicated route. Navy structure, stone workspace, restrained gold, readable sans-serif functional type and a small brand-serif treatment. The intent is calm operational density, not marketing whitespace.

Desktop: A compact persistent rail, shallow header/totals, approximately 60/40 queue/workbench, and a single booking-outlook row. On narrower desktops/tablets, drop the secondary workbench into a drawer or full quote view rather than squeezing both columns. Mobile: queue first, detail second, explicit Back, filter drawer, readable status lines, and a labelled More actions menu. Avoid horizontal scrolling as the only way to reach actions.

Risk: Combining views adds selection/filter/save-state complexity. Constrain the first implementation to shell, compact queue and read-only selection context before moving editable actions. Subjective fit 5/5; implementation risk medium-high if done all at once, lower in stages. This is a composition recommendation, not implementation approval.

## Proposed screen/state specification for a later phase

Dashboard primary task is find the next request to review. Keep search, all current filters, test visibility, sorting and closed/lost access. Compact totals must retain current definitions; do not relabel estimated pipeline revenue as collected revenue. A proposed default All/Needs action view needs an explicit decision; it is not changed by these mockups.

Selected quote shows identifier, event date/location/type, itemized total access, distinct quote/agreement/deposit state, manual-distance/override/financial-lock warnings, notes and activity access, and the current eligible next action. Initial visual prototype may be read-only; editing needs a complete save/conflict/error design. Full quote route remains available.

Required states: initial loading without layout collapse; loaded; no requests; empty filtered bucket with Reset filters; source fallback/demo banner; fetch failure with Retry; unauthorized/forbidden; stale selection after refresh; unsaved changes; save pending/saved/failed without loss of entered text; manual distance pending; manual pricing and financial lock; send preview/confirmation/submitting/success/failure; unknown status fallback; closed/lost record; test-record visibility. No optimistic customer send or payment change.

Confirmation must state recipient, action and customer-visible effect. Preserve the current preview/token behavior and prevent duplicate sends. Keep destructive/override operations separate from normal save/review actions. No automatic payment, agreement, booking or status transitions.

Accessibility target: keyboard-operable semantic tabs/table or list, visible active route and focus, non-color status text, error messages associated with inputs, live save/status announcements, dialog focus trapping/restoration, touch targets at least 44px, reduced motion and 200% zoom/reflow. Mockup imagery does not prove conformance.

## Implementation gate and regression plan

This task ends at observed audit, alternative concepts and a provisional screen specification. Direction choice, navigation decisions, detailed status/action mapping, field coverage, form/save recovery and safe fixtures must be settled before the repository's substantial-redesign gate can be considered complete.

Suggested phases after selection: (1) scoped admin typography/shell; (2) queue density and compact booking outlook; (3) selected-record read-only context; (4) quote-detail sections and confirmed actions; (5) pricing/media/settings consistency. Preserve the root implementation and do not move operational code into `apps/admin` as part of this design choice.

Regression fixtures must cover new/under-review/quote-sent/approved/change-requested/agreement-sent/signed/deposit-paid/booked/completed/closed, manual distance fallback, manual pricing, financially locked quotes, same-date requests/booking conflict, test visibility and provider failure/retry. Check anonymous/non-admin/direct API denial; metadata/dynamic state; token links; full calculation breakdown; sends/preview semantics; no duplicate booking; desktop/tablet/mobile keyboard/save recovery. Hosted email/payment/CMS and production behavior need separate explicit validation.

## Mockup limitations

AI-generated screenshots are design illustrations. Their individual text, example timestamps, icons, prices and toggle appearances are not implementation specifications or actual data. In particular, test records remain hidden by default in implementation even if a rendered checkbox appearance is ambiguous. Existing financial and provider rules determine the true action eligibility, not the example timeline or demo notes. No UI, API, database, provider configuration or deployment was changed for this exploration.
