---
name: admin-workflow-safety
description: Use when changing admin quote workflow behavior, quote statuses, agreement tracking, deposit tracking, pricing recalculation, customer-visible send actions, admin API routes, Supabase service-role access, or protected admin authentication. Do not use for purely visual public-site changes.
---

# Admin Workflow Safety Skill

Use this skill whenever a task changes quote workflow behavior, admin API routes, Supabase access, status transitions, customer-visible emails, agreements, deposits, or pricing calculations.

## Scope

Use this skill for files under:

- `app/api/admin/**`
- `app/admin/quotes/**`
- `components/admin/quote-*.tsx`
- `components/admin/pricing-*.tsx`
- `lib/admin-auth.ts`
- `lib/quotes/**`
- Quote email preview/send logic
- Agreement send/sign tracking
- Deposit request/payment tracking
- Pricing recalculation logic

## Core rule

Do not treat admin workflow changes as simple UI changes. Quote, agreement, deposit, and pricing changes can affect customer emails, approved quotes, payment tracking, and booked events.

Before changing workflow behavior, identify what state transitions and customer-visible side effects are involved.

## Required workflow analysis

Before coding, answer:

```text
Workflow being changed:
Current statuses involved:
New statuses involved, if any:
Customer-visible effect:
Admin-only effect:
Data fields read:
Data fields written:
API routes involved:
Auth/security requirement:
Failure cases:
Rollback or recovery path:
QA test records needed:
```

## Status families

Respect the existing status families.

### Quote status

Quote statuses represent the primary lifecycle of the request, quote, agreement, deposit, and booking.

Examples:

- pending
- pending_review
- new
- under_review
- draft_quote
- quote_sent
- sent_to_customer
- customer_approved
- change_requested
- agreement_pending
- agreement_sent
- agreement_signed
- deposit_pending
- deposit_paid
- booked
- confirmed
- completed
- cancelled
- declined
- expired

### Agreement status

Agreement tracking is separate from the primary quote status.

Examples:

- not_sent
- not_started
- ready_to_send
- sent
- signed
- voided
- cancelled

### Deposit status

Deposit tracking is separate from the primary quote status.

Examples:

- not_required
- not_requested
- due
- requested
- invoice_sent
- pending
- paid
- overdue
- refunded
- waived

## Safe transition principles

- Do not skip workflow steps unless the existing business logic already allows it.
- Do not silently mark customer-facing items as sent.
- Do not overwrite signed agreement URLs or payment references without confirmation.
- Do not recalculate a manually overridden quote without preserving or warning about manual override state.
- Do not remove manual distance review flags unless the mileage issue has been resolved.
- Do not alter approval tokens casually.
- Do not merge test quote behavior with production quote behavior.

## API safety

For admin API routes:

- Verify admin authorization server-side.
- Validate request bodies with a schema or explicit validation.
- Return useful error messages without leaking secrets.
- Keep service role usage server-only.
- Do not move privileged Supabase calls into client components.
- Make customer-visible actions idempotent where practical.
- Log or surface enough context for debugging failed send/payment/agreement operations.

## Customer-visible action rules

These actions require extra caution:

- Send quote email
- Preview quote email
- Send agreement
- Request deposit
- Recalculate quote after customer approval
- Mark quote declined/cancelled/expired
- Mark deposit paid/refunded/waived
- Send final balance invoice

For these actions:

- Show confirmation in the UI.
- Explain what the customer will receive or see.
- Show success/failure result.
- Preserve a timestamp or audit-friendly field where existing schema supports it.

## Pricing and calculation rules

When editing pricing behavior:

- Identify whether the change affects new quotes only or existing quotes.
- Preserve itemized breakdowns.
- Keep base price, travel fee, utility fee, after-hours fee, cleaning fee, damage waiver, rush booking fee, subtotal, discount, total, deposit, and final balance explainable.
- If distance calculation falls back, keep the manual review warning visible.
- Do not hide calculation details from admin screens.

## UI safety patterns

For admin screens that trigger workflow changes:

- Use disabled states while actions are running.
- Prevent double-submits.
- Show optimistic UI only when rollback is safe.
- Prefer explicit refresh after workflow mutation.
- Provide meaningful empty/error/loading states.
- Keep destructive actions visually separate from normal workflow actions.

## Testing checklist

Use realistic quote scenarios:

1. New request with no quote sent
2. Under-review request with manual distance warning
3. Quote sent but not viewed
4. Quote sent and viewed multiple times
5. Customer approved quote
6. Agreement sent but not signed
7. Agreement signed, deposit due
8. Deposit paid, event upcoming
9. Booked/completed quote
10. Declined/cancelled/expired quote
11. Test quote hidden by default
12. Test quote visible when explicitly filtered

Verify for each affected scenario:

- Status badges are correct.
- Next action is correct.
- Disabled actions are correctly disabled.
- API errors are handled.
- Customer-visible actions are confirmed.
- Admin-only notes remain private.
- Mobile layout remains usable.
- Build and lint pass or blockers are documented.
