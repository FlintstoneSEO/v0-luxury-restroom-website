# MSU reserved-date visibility

Workstream: Calendar data-source correction (isolated fix).
Application: Next.js admin.
User workflow being improved: Find MSU partner reservations in the calendar and upcoming events.
Current implementation: /admin/calendar and dashboard outlook query only quote_requests.
Current pain point: Six active RevelXP partner bookings exist in availability_blocks and are omitted entirely.
Proposed change: Read existing reserved-date rows alongside quotes and display them as distinct partner reservations; no creation/update/cancellation or quote conversion.
Routes affected: /admin, /admin/calendar.
Files likely affected: Admin pages, booking calendar/outlook, read-only block adapter and regression tests.
Content or data involved: availability_blocks id/title/start_date/end_date/type/effect/status/organization; existing quote fields.
Status fields involved: Read active/cancelled and hard_block/soft_hold only; no transitions.
Customer-visible risk: No customer action, pricing, email, token or booking enforcement changes. This corrects admin visibility only; existing public availability integration is a separate boundary.
SEO risk: None; existing noindex/auth/dynamic behavior retained.
Security risk: Server-only database reads; no new write endpoint or permission.
Accessibility considerations: Text reservation labels, date descriptions and legends; no color-only meaning.
Mobile considerations: Existing wrapping calendar/details/list pattern retained.
Migration or rollback strategy: No data migration. Revert the display/query diff; database reservations remain intact.
Validation steps: Synthetic active/cancelled/hard/soft, inclusive multi-day spans, upcoming/past and quote compatibility tests; typecheck/lint; read-only database confirmation.

Observed live rows: MSU Tailgate 2026-09-04; vs Nebraska 2026-09-26; vs Illinois 2026-10-10; vs Northwestern 2026-10-17; vs Washington 2026-11-14; vs Oregon 2026-11-20. All are active hard-block partner bookings for RevelXP. No MSU customer quotes were found. Four dates are past on 2026-10-25, two are upcoming. The feature/-blocking-dates branch contains a separate availability-block implementation; this branch lacks it. This patch does not merge that broader workflow.
