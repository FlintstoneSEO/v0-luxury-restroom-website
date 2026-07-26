# Customer and operations workflow map

This document records current semantics. It does not authorize behavior changes.

## Status families

Quote statuses accepted by current types include:

`pending`, `pending_review`, `new`, `under_review`, `draft_quote`, `quote_sent`, `sent_to_customer`, `customer_approved`, `change_requested`, `agreement_pending`, `agreement_sent`, `agreement_signed`, `deposit_pending`, `deposit_paid`, `booked`, `confirmed`, `completed`, `cancelled`, `declined`, `expired`.

Agreement tracking is separate:

`not_sent`, `not_started`, `ready_to_send`, `sent`, `signed`, `voided`, `cancelled`.

Deposit tracking is separate:

`not_required`, `not_requested`, `due`, `requested`, `invoice_sent`, `pending`, `paid`, `overdue`, `refunded`, `waived`.

## 1. Quote request submission

- Entry: `/request-quote`.
- Action: `submitQuoteRequest` in `app/actions/quote-request.ts`.
- Alternative API: `POST /api/quote-requests`.
- Validation: honeypot, field validation/Zod, normalized email/address, ten-minute duplicate check.
- Tables: reads `quote_requests`; writes `quote_requests`.
- Initial status: `pending_review`; agreement `not_sent`; deposit `due`.
- Auth: public entry; server action/API uses service role.
- Email: action sends admin notification and customer confirmation when Resend is configured; JSON API currently does not send those emails.
- Failure: validation errors preserve form state; service-role/config/DB failure returns generic production message; email failure is non-fatal in the action.
- Risk: high. The action/API parity gap must be resolved before Astro becomes the form owner.

## 2. Quote calculation

- Entry: quote submission or admin recalculation.
- Canonical code: `lib/quotes/build-quote-calculation.ts` plus pricing settings/defaults.
- Tables: reads `pricing_settings`; writes itemized values and `calculated_breakdown` to quote or option.
- Fields: base, travel, utilities, after-hours, cleaning, damage waiver, rush, subtotal, discount, total, deposit, final balance.
- Auth: public submission invokes server-only code; recalculation is admin-protected.
- Failure: safe default pricing settings; errors surface to caller.
- Risk: critical. Never duplicate in Astro/client.

## 3. Distance calculation

- Canonical origin: `4463 Helmsway Dr, Lansing, MI 48911`.
- API: Google Distance Matrix through server-only `GOOGLE_MAPS_API_KEY`.
- Same-address result: zero miles, `same_address`.
- Canonical fallback: 50 miles, `distance_calculation_status = fallback`, explanatory message.
- Fields: `distance_miles`, breakdown details, `needs_manual_distance_review`.
- Legacy path: `/request-availability` uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` through `lib/distance-calculator.ts` and a 30-mile fallback.
- Risk: high because two paths differ.

## 4. Manual mileage review

- Entry: admin dashboard/detail warnings.
- Detection: `needs_manual_distance_review` or fallback status inside `calculated_breakdown.details`.
- Admin action: verify distance, adjust/recalculate pricing, preserve manual override semantics.
- Failure safety: recalculation sets the flag again if Google falls back.
- Risk: high. Never clear solely because the UI was dismissed.

## 5. Admin quote review

- Entry: `/admin` → `/admin/quotes/[quoteId]`.
- Data: `getQuoteRequests`, `quote_requests`, `quote_options`, `pricing_settings`.
- Auth: middleware plus server/API admin checks.
- Activities: filter, search, inspect, edit, option management, notes, preview, send.
- Risk: high due to customer-visible actions and unrestricted status dropdowns.

## 6. Quote editing and options

- APIs: `PATCH /api/admin/quotes/[quoteId]`; option CRUD/recalculate routes.
- Validation: Zod schemas and allowed-field list.
- Writes: quote/event/customer/pricing/status/tracking fields; `quote_status_history` when primary status changes.
- Manual override: protected recalculation returns `409` unless `force=true`.
- Selected option: cannot be deleted.
- Failure: API error shown by editor; history failure is logged but does not roll back quote update.
- Risk: critical for approved quotes and manual pricing.

## 7. Quote sending

- Entry: quote detail send action.
- API: `POST /api/admin/quotes/[quoteId]/send`.
- Allowed statuses: pending-family, draft, change requested, and quote sent for resend.
- Reads: quote and active options.
- Writes:
  - new hashed record in `quote_approval_tokens`, expires in 10 days;
  - quote `status = quote_sent` before email;
  - on success, `quote_sent_at`;
  - `quote_link_events` and `quote_status_history`.
- Email: customer quote summary and raw-token link `/quote/<token>`.
- Auth: admin required.
- Failure: token/DB failures stop; email failure occurs after status transition and can leave partial state.
- Risk: critical. Preserve URL and token behavior; later improve idempotency in a dedicated PR.

## 8. Customer quote viewing

- Entry: `/quote/[token]`.
- Auth: possession of raw token; server hashes it before lookup.
- Validation: token exists and is unexpired.
- Reads: token, quote, active quote options.
- Writes on each view:
  - token first/last viewed and count;
  - quote viewed timestamp/count;
  - `quote_link_events` event `quote_link_opened`.
- Robots: noindex/nofollow.
- Already used: page remains viewable but response UI is informed.
- Failure: branded invalid/expired/not-found state.
- Risk: critical due to raw links already emailed.

## 9. Customer approval, change request, decline

- API: `POST /api/quote/[token]/respond`.
- Validation: token exists, unexpired, unused; response schema valid; selected option required when options exist.
- Concurrency: token update uses `used_at IS NULL` and expects one updated row.
- Status transitions:
  - approved → `customer_approved`, agreement `ready_to_send`;
  - change requested → `change_requested`;
  - declined → `declined`.
- Approved option: copied into quote totals and marked `selected`; other active options become `not_selected`.
- Writes: response fields/timestamp, approved timestamp, token used timestamp, status history, link event.
- Email: admin response notification.
- Failure: invalid/expired/used states are explicit; DB update after token consumption can theoretically leave a consumed token if quote update fails.
- Risk: critical.

## 10. Customer messages

- API: `POST /api/quote/[token]/message`.
- Token: must exist and be unexpired; does not require unused token.
- Writes: link event and same-status history note.
- Email: admin notification.
- Risk: medium; message content must remain private from public/CMS.

## 11. Agreement sending and signing

- Entry: admin quote detail.
- Send API: `POST /api/admin/quotes/[quoteId]/send-agreement`.
- Preconditions: quote approved by status/response/timestamp; agreement not signed or already sent with provider ID.
- Provider: Dropbox Sign template with quote merge fields and `metadata.quote_id`.
- Send transition: agreement `sent`; quote `agreement_sent`; provider IDs/URL and sent timestamp.
- Sign webhook: `/api/webhooks/dropbox-sign`.
- Sign transition: agreement `signed`; quote `agreement_signed`; signed document URLs and timestamp.
- Auth: admin for send; signature verification for webhook when secret configured.
- Failure: provider errors return safe production message.
- Risk: critical; signed URLs and provider IDs must never enter CloudCannon.

## 12. Deposit tracking

- Manual API: `PATCH /api/admin/quotes/[quoteId]/deposit`.
- Invoice API: `POST /api/admin/quotes/[quoteId]/send-deposit-invoice`.
- Preconditions for invoice: agreement signed; deposit not paid.
- Provider: Square customer and invoice.
- Invoice transition: deposit `invoice_sent`; quote `deposit_pending`; Square IDs/URLs stored.
- Paid webhook: `/api/webhooks/square`.
- Paid transition: deposit `paid`; quote `confirmed`; paid timestamp/amount/reference.
- Failure: provider/API errors surface; webhook signature is enforced only when configured.
- Risk: critical.

## 13. Final balance tracking

- Fields exist on `quote_requests`: `final_balance`, `square_final_invoice_id`, `square_final_invoice_url`, `final_balance_paid_at`.
- Current UI exposes fields, but there is no dedicated final-balance invoice route or webhook branch in the audited code.
- Risk: architectural decision required before claiming end-to-end support.

## 14. Booking confirmation and calendar visibility

- Booking-like statuses: `booked`, `confirmed`, `completed`; event date/time live on `quote_requests`.
- Dashboard computes upcoming events from event date and status.
- There is no dedicated booking table, resource allocation model, calendar route, or server-side double-booking constraint.
- Risk: critical product/data decision. A visual calendar alone cannot prevent double booking.

## 15. Email notifications

- Quote request: admin and customer through direct Resend in server action.
- Quote sent/test: provider-neutral `sendEmail`, usually Resend.
- Customer response/message: admin notification through `sendEmail`.
- Agreement: Dropbox Sign provider delivers signing request.
- Deposit: Square invoice email delivery.
- Failure behavior varies by flow; not all emails are transactional with database changes.

## Customer-visible URLs that must remain stable

- `/request-quote`
- `/quote/[token]`
- links embedded in quote emails;
- agreement signing URLs managed by Dropbox Sign;
- Square invoice URLs.

## Required regression scenarios

1. New request and duplicate prevention.
2. Google success, same-address, and fallback/manual review.
3. Manual override and forced recalculation.
4. Quote with one option and multiple options.
5. Send, resend, email failure, view once/multiple times.
6. Approve, request change, decline, expired link, reused link.
7. Agreement precondition, send, duplicate send, signed webhook.
8. Deposit precondition, invoice, paid webhook, duplicate webhook.
9. Test quote isolation.
10. Booked/completed and upcoming-event display.
