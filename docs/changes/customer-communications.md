# Customer inquiry reply and visibility fix

## Implementation brief

- Workstream/application: focused Next.js quote workspace and shared backend fix.
- Workflow/primary task: read customer questions and contact the customer from the quote details screen or notification email.
- Current implementation/friction: question notifications omit Reply-To; questions are stored in quote_status_history but not fetched by the details screen. Call/email links exist only in the quick view.
- Proposed improvement: customer Reply-To for question and response notifications; server-loaded Communications section in Activity & notes; Call customer, Email customer, and View customer questions controls beside the workspace.
- Routes affected: /admin/quotes/[quoteId], /api/quote/[token]/message, /api/quote/[token]/respond.
- Files: the above page/routes, quote-detail-editor, new quote-communications component, communications types, and getQuoteCommunications loader.
- Data read: saved customer email/phone/name/quote number and the newest 100 customer question history rows for the selected quote.
- Data written: existing question history and link-event records only. No schema migration.
- Current/new status fields: no new statuses or transitions. A question retains the same old/new quote status. Customer approval/change/decline RPC behavior is preserved.
- Customer-visible effect/risk: Reply addresses the customer; failed message persistence now returns an error instead of false success. A saved question remains successful if the notification fails.
- Admin-only effect: questions are readable in Communications; contact links open the existing phone/email app and do not automatically send anything.
- Content: internal notes are excluded from the question query. Question bodies render as escaped text, preserving line breaks.
- Security: authorize with requireAdminUser before creating the service-role history client. Filter by quote ID, customer actor, and existing question prefix; expose only message ID, timestamp and body. No new public endpoint or RLS grants. Existing token validation/expiry remains in force.
- SEO: admin remains dynamic and noindex; public routes are unchanged.
- Accessibility: labeled native contact links, hidden decorative icons, semantic heading/list/time, visible focus via existing Button, and alert/empty states.
- Mobile: wrapping contact actions with minimum 44px height; wrapping message bodies; existing responsive workspace tabs retained.
- Failure/recovery: message read failure displays an error instead of an empty conversation; refresh retries. Write failure stops notification and returns 500. Email/tracking failures after persistence cannot cause a false submission failure.
- Migration/rollback: deploy code only. Revert this change to restore previous behavior; saved history remains intact. No email provider/account settings change.
- QA fixtures: customer question, empty history, unavailable database, failed persistence, provider throw/returned failure, expired token, unauthorized user, approval/change/decline notifications, and missing contact details.

## Boundaries

Google Workspace integration is deferred. This view shows questions submitted through the quote page, not Gmail conversations. Email customer composes a new email with a quote-specific subject; it does not promise email threading or record the reply in the app. Historical questions using the existing `Customer message: ` prefix appear automatically.

## Validation

See the pull request for completed checks and environment limitations. Live inbox routing and the protected production screen require deployment verification with an authorized test quote. No real customer emails were sent during local tests.
