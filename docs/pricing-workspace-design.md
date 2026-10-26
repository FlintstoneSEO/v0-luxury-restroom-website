# Pricing workspace — approved direction, 2026-10-25

## Pre-build brief
Workstream: Pricing policy editor and shared calculation support.
Application: Next.js admin and shared backend; customer quote presentation only where needed to explain a new fee.
User workflow being improved: Owner edits policy, tries synthetic events, reviews changes, explicitly saves.
Current implementation: Root /admin/pricing uses PricingSettingsEditor; /admin/settings redirects there. Numeric pricing_settings rows overlay DEFAULT_PRICING. PUT /api/admin/pricing requires requireAdminUser. Shared buildQuoteCalculation supplies new requests and explicit recalculations.
Current pain point: Undifferentiated numeric grid, weak validation, no preview, unsupported JSON add-on editor, no event-duration calculation.
Proposed change: Grouped editor with time rules, fee inclusion choices, service-review thresholds, itemized live preview and diff confirmation.
Routes affected: /admin/pricing, /admin/settings, /api/admin/pricing; shared quote submission/recalculation paths; fee display on /admin/quotes/[quoteId] and /quote/[token].
Files likely affected: Pricing editor/styles, pricing page/API, pricing settings schema, engine/types, quote normalization/display, tests.
Content or data involved: Numeric pricing_settings; calculated_breakdown JSON snapshots and existing financial totals. No new table or column required.
Status fields involved: No new lifecycle states or transitions. Existing financial locks remain authoritative.
Customer-visible risk: Newly enabled rules change new/recalculated quotes. Extra event hours must remain itemized and survive option cloning, editing and approval.
SEO risk: None; admin noindex remains. No public URL/content migration.
Security risk: Preserve server admin authorization; validate every persisted setting; preview contains synthetic data and pure calculation only.
Accessibility considerations: Connected labels/help/errors, fieldsets, visible focus, live save status, Radix review dialog and focus return, readable units.
Mobile considerations: One-column controls, wrapping section links, preview below editor, non-obscuring save bar, 320px reflow.
Migration or rollback strategy: New settings default to legacy behavior; activation is explicit. New extended-use fee is stored in existing calculated_breakdown JSON (never folded into base_price/after_hours_fee). Roll back activation settings first. Once quotes use extra-hours fees, retain compatible snapshot readers and financial normalization when reverting UI; do not deploy old financial code that drops the JSON fee.
Validation steps: Unit tests for reference examples, partial hours, midnight, caps, overlap, invalid ranges, normalization and historical defaults; mocked API save/auth/errors; typecheck/lint/build; read-only live UI checks with unsaved preview edits. Do not change live settings for testing.

## Audit and permission inventory
- Observed rendered page at localhost:3000/admin/pricing: ivory shell, white two-column input panel, guest rates 1175/1375/1575/1775, 15 included miles and $5 mileage rate. Preserve DB values; do not replace with code defaults.
- Existing working tree contains unrelated admin polish; preserve it and layer this implementation into the current editor.
- Proxy validates session and app_metadata.is_admin for pages/APIs. PUT repeats server authorization. Anonymous receives 401; authenticated non-admin receives 403. No new role or permission model.
- API currently filters unknown keys silently, accepts invalid cutoff/negative fee values, and validates only percentage ranges. Replace with shared strict setting validation.
- Pricing page currently falls back to defaults without showing read errors. Disable editing/saving when settings cannot be read rather than overwrite unseen saved values.
- Optional add-on JSON is neither loaded nor sent. Remove this nonfunctional control. Extra-day rate is not consumed by the single-event engine: show as reference-only, not an active automatic rule.
- Forms already retain state after failure but give a misleading JSON error. Replace with useful validation/server feedback.
- Saved quotes use financial snapshots and financial-lock rules. No bulk repricing; only existing authorized draft/revision paths recalculate.

## Workflow and preservation matrix
| Area | Decision | Rationale / risk |
|---|---|---|
| Admin shell, routes, auth, noindex | Preserve | Established security and navigation; no folder move |
| Guest tiers and current numeric settings | Preserve | Do not silently change prices or tier boundaries |
| Pricing form | Restructure | Business-purpose sections; native number/time/select controls |
| Save | Improve | Explicit diff, reset, pending/error/success and validation |
| Calculator | Improve | One shared pure function for preview and server; opt-in event-window rules |
| JSON add-on input | Replace with explanatory absence | Was a misleading unsupported save affordance; no arbitrary rule builder |
| Financial snapshots/options | Preserve and extend | Extra-hour charge in JSON and financial sums; never reinterpret existing columns |
| Service review | Improve | Stored advisory reasons, visible in admin; no automated provider actions or booking changes |

Workflow: read saved policy → edit draft controls → inspect scenario and fee lines → review old/new settings → save one validated batch → confirm saved baseline. Cancel/review close keeps draft; reset restores saved values; network failure retains draft. No autosave. Browser-unload protection when dirty. Client navigation asks before discarding.

## Visual directions and selection
1. Stripe split workspace: editor plus itemized preview; strongest immediate cause/effect, moderate desktop width need. Fit 5/5, risk low.
2. Fresha rule table: compact time-window rows with explicit units/options; excellent time configuration, less suitable for all financial settings. Fit 4/5, risk low.
3. Clerk grouped settings: quiet section panels, sticky unsaved actions; best long-form editing, preview needs a companion panel. Fit 5/5, risk low.
User approved a combination: Stripe two-column workspace, Fresha explicit rule controls, Clerk save bar. Retain existing admin shell (security/navigation consistency), navy/stone palette, sans-serif controls, restrained serif page heading, compact borders and no decorative motion. No IA/route changes; in-page anchors only.
References: https://mobbin.com/screens/44aa81d0-0592-45bc-bb51-31a5d6dbb722 ; https://mobbin.com/screens/e14d2800-1978-4942-8bb0-6c127638a408 ; https://mobbin.com/screens/0dcb1707-a8ae-4218-a23a-4976adb5b4d2

## Implementation-ready screen specification
- Header: Pricing & settings, concise purpose, saved/unsaved status. Quiet notice about new quotes and explicit revisions.
- Sections: Guest pricing; Event hours; Delivery & utilities; Other charges; Service review; Tax & deposit. Persistent in-page links without changing app navigation.
- Guest tiers remain fixed boundaries. Cleaning/waiver/generator/water inclusion choices describe whether to add the configured fee, without guessing package inclusions.
- Event hours: opt-in scheduled-use policy, opt-in extra-hour charge, included hours, extra-hour rate, rounding modes (whole hour or exact minutes), after-hours cutoff/rate/cap (0 = uncapped), combine both or higher total charge only. Existing legacy end-time rule remains until enabled. End before start means next day; same time is invalid; events >=24h require a separate quote. No delivery/pickup duration charged.
- Preview: synthetic guests, start/end, event date, miles, available power/water. Four supplied scenarios plus partial and overnight presets. Reads draft settings; rejects invalid draft/scenario rather than displaying a plausible wrong price. Fee lines, subtotal, tax, total, deposit, balance and service-review reasons. No customer data, no save or email side effects.
- Review: diff table with business-facing labels and formatted values, impact statement, explicit save. Disabled duplicate submission; inline errors retained on failure. Reset is reversible draft discard.
- States: ready, dirty, invalid, loading/read failure, review open, saving, error, success; no empty settings treated as database failure (valid defaults).
- Shared primitives: field definition/validation metadata and setting formatter; pure event-time calculator; stored extra-fee reader. UI mechanics do not own quote status, auth, provider or booking rules.
- Desktop: editor and preview aligned at top; preview sticky only when enough height. Tablet/mobile: single column, preview jump link, full-width controls, wrapping save actions; no sticky tall panel hiding content.
- Accessibility: logical heading hierarchy, field labels with units, errors via aria-describedby and aria-invalid, native selects/checks, 44px inputs/actions, reduced-motion-safe behavior, dialog focus trap and return. Only save/errors use live announcements to avoid reading every keystroke's total.

## Regression plan and unresolved business decisions
Test authorization and direct PUT, malformed/unknown/negative settings, cutoff bounds, boolean/rounding enums, percentage ranges, failed saves, old snapshots without extra fee, new snapshots/options with fee, financial lock tests, four provided examples, midnight, partial hours, caps, inclusion switches and higher-charge mode. Verify no operational writes during UI tests. Existing emails/link semantics remain; itemization must show the extra fee where fee rows are displayed.
Owner must choose package inclusions, partial-hour handling, after-hours cap and review thresholds. Defaults preserve existing behavior; controls allow reviewing those decisions before activation. No pumping/water service amount is invented, and review warnings do not claim automatic operational approval. Multi-day service remains manual.

## Validation results
- Root production build passed (74 generated pages, dynamic pricing route), using isolated `.next-pricing-check`; temporary generated type references were removed afterward. Subsequent changes were a mobile preview shortcut and a text-escaping correction, checked by lint and the running browser.
- TypeScript passed. Full test suite: 10 files / 84 tests passed, including pricing policy, server save authorization/validation/failure mocks, historical financial locks and customer quote presentation.
- ESLint passed with `.next-*/**` excluded: the unmodified base command also scans old isolated generated builds, so source validation explicitly excludes those artifacts.
- Live local browser exercised all four supplied scenarios: pre-tax hourly surcharges $0 / $200 / $75 / $175. Partial-hour prorating produced $50 + $37.50. Invalid blank rate blocked review, focused the field, and suppressed the preview. Reset restored saved values. Review dialog displayed current/proposed values; Escape/Keep editing retained the draft. No save was submitted to live settings.
- Live saved cutoff was confirmed as 100. It remains unchanged in storage and is visibly invalid until the owner chooses a valid hour. The proposal button corrects it only in the unsaved draft.
- Checked 320, 375, 390, 768, 1024 and 1440px: no horizontal document overflow; all inputs/selects have associated labels; heading bounds fit. Narrow-phone preview total is available in the sticky action bar. Added mobile anchor offsets to clear the existing header. Screenshots in output/pricing-workspace.
- Visual review: navy preview header, compact numbered groups, explicit rule units, neutral impact message, readable itemization and single review/save flow. Native controls and Radix dialog retained. No new motion or media payload.
- Remaining verification boundaries: no full screen-reader or third-party automated WCAG certification; no real email, approval, agreement, payment or booking submission; no live settings persistence test or deployment. API writes and failures were tested with synthetic mocks. Schema remains unchanged; supported settings use existing numeric rows, extra-hour charges use the existing JSON snapshot.
- Rollback warning: once the owner enables these rules and quotes contain extra_hours_fee in their JSON snapshots, retain the extra-fee readers/financial normalization even if reverting the editor. Existing financial columns retain their original meaning.
