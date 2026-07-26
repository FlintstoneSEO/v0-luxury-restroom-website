# Admin redesign plan

This is a planning deliverable only. No admin UI or workflow semantics change in this phase.

## Audit summary

The current admin already provides:

- authenticated navigation and responsive mobile menu;
- quote pipeline buckets, summary metrics, search, filters, sorting, and test-quote filtering;
- manual-distance warnings and quote view indicators;
- a comprehensive quote detail editor;
- quote options, recalculation/manual override protection, email preview, confirmations, agreement and deposit actions;
- pricing, site media, homepage media, settings, and distance-settings pages.

The largest issues are structural:

- the top navigation omits pricing, homepage media, and distance settings;
- no dedicated calendar/bookings view exists;
- booking capacity and double-booking are not represented server-side;
- status styling/label logic is duplicated;
- the quote detail component is very large and places many unrelated operations in one long form;
- manual status selectors can bypass a guided next-action model;
- some interactions use `window.prompt`/`window.alert`;
- active navigation state, mobile focus/close behavior, and logout error feedback need improvement;
- agreement, deposit, and primary quote status can diverge;
- final-balance workflow is only partially represented.

## Design brief

Admin screen: Entire protected operations console  
Primary admin task: Move each inquiry safely from request through review, approval, agreement, payment, booking, and completion  
Current friction: Dense but fragmented workflow, long quote detail page, no true calendar, inconsistent navigation and duplicated status presentation  
Proposed improvement: Shared admin shell and workflow primitives, server-derived next action, dedicated schedule view, and task-oriented quote workspace  
Data involved: Quotes, options, status history, link events, pricing, agreement/payment fields, media references, settings  
Status fields involved: Quote, agreement, deposit, viewed, manual-distance, manual-override, test-quote, event timing  
Customer-visible risk: High for quote/agreement/payment sends and status mutations  
Security risk: High for service-role APIs and provider actions  
Accessibility concerns: Landmarks, active navigation, semantic table/cards, focus management, labeled controls, live status feedback, non-color-only status  
Responsive behavior: Persistent desktop rail or compact top bar; mobile drawer; cards/table adapt without hiding key actions  
Files to inspect: `app/admin/**`, `components/admin/**`, `app/api/admin/**`, quote types/status/schema, auth, provider routes  
Files likely to change: Later phased PRs only; none in this phase  
QA steps: Auth/noindex, 12 workflow scenarios, keyboard/mobile, API failure, live Supabase and fallback state, build/lint

## Prioritized roadmap

### P0: workflow and data safety

1. Define a server-owned lifecycle/next-action model from the three status families.
2. Define booking capacity and double-booking rules before building a calendar warning.
3. Audit allowed status transitions; prevent UI-only skips.
4. Make quote send/agreement/deposit actions idempotent or safely retryable.
5. Confirm webhook signature secrets are mandatory in production.
6. Decide final-balance workflow and source of truth.
7. Add test fixtures for every lifecycle scenario.

### P1: shared admin foundation

- Build an admin shell with Dashboard, Quotes, Calendar/Bookings, Pricing, Media, Settings, and logout.
- Add active-route state and breadcrumbs.
- Keep noindex metadata and dynamic data behavior.
- Replace the ad hoc mobile menu with a focus-managed drawer.
- Introduce shared page header, status badge, metric, alert, loading, empty, error, and save-state components.
- Centralize status labels/colors/icons and never communicate status by color alone.
- Use restrained navy/charcoal structure, ivory surfaces, taupe accents, and semantic status colors.

### P1: dashboard and pipeline

- Separate operational metrics from revenue estimates.
- Surface queues: needs review, manual distance, ready to send, waiting customer, agreement ready, deposit follow-up, upcoming.
- Keep search across customer/contact/location/quote number.
- Add event-date range, city, viewed/unviewed, manual-review, next-action, agreement, deposit, and test filters.
- Make active filters visible and individually removable.
- Preserve a useful empty state with a clear reset action.
- Add saved filter presets only after real usage justifies them.
- Provide a compact desktop table and readable mobile cards.

### P1: next-action visibility

Each row/card should show one server-derived primary action and supporting reason:

- Review request
- Verify mileage
- Finish pricing
- Preview/send quote
- Waiting for customer
- Review change request
- Send agreement
- Await signature
- Send/follow up deposit
- Confirm booking
- Upcoming event preparation
- Complete or close

Never derive privileged eligibility only in the client.

### P1: upcoming events and calendar

Do not label the initial view “double-booking prevention” until the backend has capacity rules.

Required schedule model:

- event date;
- start/end time;
- delivery/setup and pickup/service buffers;
- assigned trailer/resource;
- booking/confirmation status;
- test-quote exclusion;
- timezone/date-only handling;
- conflict rule and override audit.

Views:

- agenda list as accessible default;
- month/week calendar as enhancement;
- clear time blocks and event location;
- conflict and missing-time warnings with text;
- keyboard-accessible navigation;
- mobile agenda rather than squeezed month cells.

### P1: quote detail workflow workspace

Split the current large editor into:

1. Sticky summary header: quote number, customer, event date/location, total, primary status.
2. Workflow stepper: request, prepared, sent, response, agreement, deposit, booked/completed.
3. Priority action panel: one recommended action, prerequisites, customer-visible consequence.
4. Customer/event section.
5. Quote options and pricing comparison.
6. Communications/history.
7. Agreement and payment tracking.
8. Internal notes.
9. Advanced/manual fields collapsed by default.

The stepper must describe actual state, not mutate it directly.

### P1: pricing and overrides

- Compare options side by side with recommended/selected labels.
- Keep every fee explainable.
- Place distance fallback and manual override warnings next to totals and actions.
- Show what a recalculation replaces before confirmation.
- Explain whether pricing-setting changes affect future quotes, current drafts, or neither.
- Require explicit confirmation after customer approval.
- Preserve current input after errors.

### P1: quote email and response history

- Keep email preview in a focus-managed dialog.
- Show recipient, subject, customer link host, option summary, and expiry before send.
- Confirm sends with customer-visible consequences.
- Timeline quote sent/viewed counts, response, messages, agreement events, and payment events.
- Distinguish test sends visually and exclude them by default.

### P1: agreement, deposit, and final balance

- Separate provider actions from manual tracking overrides.
- Show prerequisites and why disabled actions are unavailable.
- Display provider reference, sent/signed/paid timestamps, and document/invoice links.
- Require confirmation for manual signed/paid/refunded/waived states.
- Treat final balance as a first-class workflow only after its API/provider model exists.

### P2: pricing configuration

- Keep grouped sections: base pricing, travel, utilities, service fees, after-hours, deposit.
- Add calculation examples using non-customer test inputs.
- Explain scope of changes.
- Add dirty state, save/cancel, inline validation, success and error summary.
- Restrict unknown/invalid keys and preserve default merge rules.

### P2: media management

- Unified media information architecture with placement filters.
- Thumbnail, current-use labels, dimensions, type and file-size guidance.
- Alt text required for public placement.
- Clear upload/replace/remove actions and confirmation.
- Identify which media will move to CloudCannon to prevent dual ownership.

### P2: settings

- Separate public display settings, operational rules, provider configuration health, and dangerous/admin-only tools.
- Never expose secret values; show configured/missing health only.
- Remove or isolate the production-disabled migration runner from normal settings.
- Provide save/loading/success/error states.

## Accessibility acceptance criteria

- Skip link and semantic navigation/main landmarks.
- Current page exposed with `aria-current`.
- Logical H1/H2 hierarchy.
- Visible focus at 3:1 against adjacent colors.
- All icon buttons have accessible names.
- Minimum comfortable touch targets.
- Drawer/dialog focus trap and focus return.
- Tables include headers and meaningful row actions.
- Status and warnings contain text/icons, not color alone.
- Async messages use appropriate live regions without excessive announcements.
- No essential hover-only content.
- 200% zoom and narrow mobile remain usable.
- Reduced motion respected; no decorative GSAP in admin.

## Validation scenarios

Use the 12 scenarios from `admin-workflow-safety`, plus provider failure, missing configuration, empty Supabase result, fallback/mock source, slow responses, and mobile keyboard use. Build a scenario matrix before changing the quote detail UI.

