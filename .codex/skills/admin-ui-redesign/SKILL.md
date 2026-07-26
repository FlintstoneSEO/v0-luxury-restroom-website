# Admin UI Redesign Skill

Use this skill whenever the task involves improving or redesigning the admin side of the luxury restroom trailer website.

## When to use

Use this skill for changes to:

- `/admin`
- `/admin/login`
- `/admin/quotes/[quoteId]`
- `/admin/pricing`
- `/admin/site-media`
- `/admin/homepage-media`
- `/admin/settings`
- `components/admin/**`
- `app/api/admin/**` when the UI workflow depends on an API behavior

Do not use this skill for public marketing page redesign unless the task explicitly asks for public pages.

## Primary objective

Create an admin interface that helps the owner quickly manage quote requests, pricing, agreements, deposits, media, and operational settings.

The interface should feel premium, professional, fast, and operationally clear.

## Admin design brief template

Before coding, write a compact design brief:

```text
Admin screen:
Primary admin task:
Current friction:
Proposed improvement:
Data involved:
Status fields involved:
Customer-visible risk:
Security risk:
Accessibility concerns:
Responsive behavior:
Files to inspect:
Files likely to change:
QA steps:
```

## Dashboard redesign guidance

The dashboard is a quote operations command center.

Prioritize these elements:

1. Pipeline summary
   - New requests
   - Under review
   - Quote sent
   - Customer approved
   - Agreement sent/signed
   - Deposit due/paid
   - Booked/completed
   - Closed/lost

2. Next-action visibility
   - Needs initial review
   - Needs manual distance review
   - Ready to send quote
   - Waiting on customer
   - Ready to send agreement
   - Deposit follow-up needed
   - Upcoming events

3. Search and filtering
   - Customer name
   - Email
   - Phone
   - City/state/zip
   - Event type
   - Event date
   - Quote status
   - Agreement status
   - Deposit status
   - Test quote visibility

4. Quote cards or table rows
   Each row/card should show:
   - Customer name
   - Event date
   - Event city/state
   - Event type
   - Guest count
   - Quote total
   - Quote status
   - Agreement status
   - Deposit status
   - Quote viewed indicator
   - Manual review warning if applicable
   - Clear open/detail action

## Quote detail redesign guidance

The quote detail page should be organized as a workflow workspace.

Recommended structure:

1. Header summary
   - Quote number
   - Customer name
   - Event date
   - Event location
   - Total price
   - Primary workflow status
   - Back to dashboard

2. Workflow stepper
   - Request received
   - Quote prepared
   - Quote sent
   - Customer approved or change requested
   - Agreement sent
   - Agreement signed
   - Deposit paid
   - Booked/completed

3. Priority action panel
   Show the next best action based on status:
   - Review request
   - Recalculate pricing
   - Send quote
   - Send agreement
   - Record/request deposit
   - Mark booked
   - Close lost

4. Event and customer details
   Use compact, readable information blocks.

5. Quote options and pricing
   - Show recommended option clearly
   - Compare option totals
   - Explain travel, utility, after-hours, cleaning, damage waiver, discount, deposit, and final balance
   - Surface manual distance review prominently

6. Communications
   - Quote email preview
   - Quote sent/viewed history
   - Customer response
   - Agreement sent/signed history

7. Admin notes
   - Internal notes separate from customer notes
   - Save state visible

## Pricing/settings redesign guidance

Pricing screens should help the admin safely adjust business rules.

Use:

- Grouped sections
- Clear labels
- Helper text explaining what each fee changes
- Preview or calculation example where helpful
- Save/cancel affordances
- Success/error feedback
- Warning when a change affects future quotes only versus existing quotes

Avoid:

- Long unlabeled forms
- Destructive changes without confirmation
- Mixing public copy settings with financial settings without clear grouping

## Media manager redesign guidance

Media screens should focus on selection, preview, alt text, and placement.

Use:

- Thumbnail previews
- Current active image labels
- Placement context, such as hero, gallery, homepage section
- Alt text fields where images appear publicly
- Upload/replace/remove clarity
- File size and dimension guidance

## Accessibility requirements

Every admin change must maintain:

- Keyboard navigation
- Visible focus states
- Text labels for icon actions
- Semantic headings
- Buttons for actions and links for navigation
- Dialog/drawer focus management
- Sufficient color contrast
- Non-color-only status communication
- Touch targets that are comfortable on mobile

## Visual system

Use a premium admin console style:

- Navy and charcoal for structure
- Soft ivory/stone backgrounds
- Restrained gold/taupe accents
- Accessible semantic status colors
- Compact data-dense sections
- Clear borders and panels
- Minimal decorative motion

## Implementation rules

- Prefer existing `components/ui/**` primitives.
- Extract reusable admin components when repeated twice or more.
- Keep large status maps in helper functions or constants.
- Do not duplicate status label logic across multiple components if a shared helper is practical.
- Keep API interactions explicit and error-handled.
- Confirm customer-visible actions before sending.
- Use existing `QuoteRequest`, `QuoteOption`, `QUOTE_STATUSES`, `AGREEMENT_TRACKING_STATUSES`, and `DEPOSIT_TRACKING_STATUSES` types.

## QA checklist

Before considering the admin redesign complete:

- Dashboard loads with Supabase data.
- Dashboard handles mock/fallback source state if applicable.
- Filters and search do not hide all records without a useful empty state.
- Status labels are readable and consistent.
- Quote detail actions match the current quote status.
- Customer-visible send actions require confirmation or clear intent.
- Save actions show feedback.
- API errors are visible and understandable.
- Mobile navigation works.
- Dialogs and drawers are keyboard usable.
- `npm run lint` passes or blockers are documented.
- `npm run build` passes or blockers are documented.
