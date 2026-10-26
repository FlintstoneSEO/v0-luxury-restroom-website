# Isolated pricing persistence verification

The worktree has no real environment files. A test-only Supabase-compatible HTTP fixture wraps a disposable on-disk PostgreSQL database (PGlite). The actual Next application runs against that fixture with placeholder keys. An outbound-network guard permits loopback addresses only. No production application logic, auth guard or pricing handler is replaced. The fixture simulates Supabase Auth and its REST boundary; it is not hosted Auth/RLS/PostgREST certification.

## Reproduce

1. Use a worktree without `.env`, `.env.local`, `.env.development` or `.env.development.local`.
2. Run `node scripts/test-pricing-workspace.mjs` (ports 3106 and 15439 must be free).
3. Run `node scripts/verify-pricing-persistence.mjs`.
4. For browser acceptance, use http://127.0.0.1:3106/admin/pricing. The synthetic account is `pricing-admin@example.invalid`, password `fixture-password-only`; these are fixture-only values, not real credentials. Save the additional hourly rate as 130, reload, then run `node scripts/verify-pricing-persistence.mjs --verify-ui-save`.
5. Stop the fixture launcher when finished. Its disposable data stays under ignored `.next-pricing-fixture/data` and can be reopened to verify persistence. Never point this harness at a hosted URL.

## Results

- Real pricing PUT handler, server admin check and Supabase HTTP client wrote settings to PostgreSQL; a fresh server-rendered page read them back.
- Actual browser Review → Save succeeded; the additional-hour rate of 130 survived a full reload.
- The real public quote-submission endpoint persisted synthetic quotes with hourly surcharges 0 / 200 / 75 / 175 for the four supplied examples.
- Updating rates to 125/80 changed the next 2–11 PM quote to 1462.80 including tax. After the browser saved 130, another new quote used 130/80 and totaled 1468.10.
- Existing synthetic quote snapshots and a historical sent fixture remained unchanged when settings changed.
- Anonymous saves returned 401, invalid mixed batches returned 400 without partial persistence, and a deliberately failed storage write returned 500 without changing saved settings.
- After shutting down the test server, reopening the disk database still returned the saved rate of 130. All stored records have synthetic `.invalid` addresses; no live customers or pricing were loaded into this fixture.
- Machine-readable results: `output/pricing-persistence/results.json`; browser capture: `output/pricing-persistence/saved.png`.

No email, agreement, payment or booking actions were invoked. Hosted database policies, deployment configuration, Google mileage and email-provider delivery remain outside this local persistence test.
