# Pricing save and new-quote verification — October 25, 2026

Result: the actual pricing editor and save API persisted changes to an isolated PostgreSQL database; the actual new-quote endpoint read the saved policy and stored the expected financial snapshots. No application pricing code change was needed.

## Isolation and scope

- Separate worktree app on `http://127.0.0.1:3106`; fixture data endpoint on `http://127.0.0.1:15439`. The existing localhost:3000 app/tab was not used for writes.
- Real PGlite PostgreSQL storage with quote_requests and pricing_settings definitions extracted from supabase/schema.sql. The disk-backed database lives under ignored .next-pricing-fixture/data; automated tests use unique temporary directories and clean them up.
- Real Supabase JS/SSR clients, real admin auth helper, real pricing page, real PUT /api/admin/pricing, shared calculator, and real POST /api/quote-requests. No mocked save return value or mocked quote calculation in these persistence checks.
- Supabase-compatible REST transport and synthetic Auth responses are test fixtures. They exercise the application's role checks, but do not certify hosted Supabase Auth, RLS, grants, PostgREST behavior, triggers, or remote deployment configuration.
- Launcher refuses environment files, removes inherited provider/Supabase configuration, injects only dummy local credentials, disables telemetry, and preloads a network guard that rejects non-loopback connections. A deliberate external fetch was rejected with PRICING_FIXTURE_EXTERNAL_NETWORK_BLOCKED.
- Synthetic admin/customer identities use example.invalid. All quote records in the isolated fixture are marked as tests. The event address matches the configured origin to avoid requesting driving directions. No email, agreement, payment, or booking action was called.

## Browser and database checks performed

1. Signed in through the actual login page as the synthetic administrator. Loaded the $1,000 fixture baseline.
2. Edited the base price to $1,175, enabled scheduled-use and extra-hour rules, selected uncapped after-hours use, reviewed the diff and clicked Save pricing rules.
3. Read saved rows directly from local PostgreSQL through the fixture inspection endpoint, then fully reloaded the pricing page. The $1,175 rate and enabled rules remained saved.
4. Submitted four synthetic new quote requests through the running Next app. Verified the stored base price, separate extra-hour and after-hours fees, tax-inclusive total, and deposit:

| Event | Extra hours | After hours | Total with 6% tax | 40% deposit |
|---|---:|---:|---:|---:|
| 2–10 PM | $0 | $0 | $1,245.50 | $498.20 |
| Noon–10 PM | $200 | $0 | $1,457.50 | $583.00 |
| 4–11 PM | $0 | $75 | $1,325.00 | $530.00 |
| 2–11 PM | $100 | $75 | $1,431.00 | $572.40 |

5. Changed the extra-hour rate to $130. Deliberately failed the next fixture write. The dialog showed an error and kept the $130 draft; persisted settings remained unchanged. Retried successfully, fully reloaded, and confirmed $130 persisted.
6. Submitted the four scenarios again. The nine-hour quote now stored $130 extra hours + $75 after hours, $1,380 subtotal, $82.80 tax, $1,462.80 total and $585.12 deposit. The ten-hour quote stored $260 extra time and a $1,521.10 total.
7. Compared the entire existing sent quote row before/after; it was unchanged. Automated tests also verify a previously created $1,431 quote stays $1,431 after subsequent pricing changes.
8. Automated tests closed/reopened the disk-backed database and reloaded the real server page: settings survived. Invalid cutoff, anonymous, and non-admin saves were rejected without altering stored settings. A failed write preserved the old database values and a retry succeeded.

## Evidence and repeatability

- output/pricing-persistence/proposed-rules-results.json — first saved policy and four stored quote results.
- output/pricing-persistence/results.json — $130 follow-up policy and results.
- output/pricing-persistence/saved-and-reloaded.png — reloaded saved $130 rule and matching preview.
- output/pricing-persistence/failed-save.png — error feedback with retained draft.
- `npm test -- tests/pricing-persistence.test.ts` — four persistence scenarios passed.
- Full run at verification time: 11 test files / 88 tests passed. ESLint passed with `.next-*/**` excluded.
- Full-project typecheck: the new persistence test type issues were corrected. The final check encountered unrelated, concurrently edited calendar errors: app/admin/calendar/page.tsx passes blocks to BookingCalendar and BookingOutlook whose then-current prop definitions did not accept blocks. Those files were not modified by this verification work.

To repeat in a worktree without environment files: run `node scripts/test-pricing-workspace.mjs`, open its local login, use pricing-admin@example.invalid / fixture-password-only, save the proposed hourly policy and $1,175 base, then run `node scripts/verify-pricing-persistence.mjs`. This fixture is test-only; do not deploy it or interpret its Auth/REST emulation as hosted Supabase acceptance. The automated persistence test runs without this manual server.

The isolated server and browser tab were stopped after testing. Live pricing, customer quotes, and external providers were not modified.
