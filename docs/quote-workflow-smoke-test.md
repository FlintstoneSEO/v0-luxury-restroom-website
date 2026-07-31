# Quote Workflow Smoke Test

1. Set environment variables locally (`.env.local`) from `.env.example`.
2. Create an admin user in Supabase Auth.
3. Set protected `app_metadata.is_admin = true` for that user as documented in `docs/admin-setup.md`, then sign out and back in.
4. Run `npm install`.
5. Run `npm run dev`.
6. Submit a quote from `/request-quote`.
7. Confirm a row appears in Supabase `quote_requests`.
8. Open `/admin/login`.
9. Login as admin.
10. Open `/admin`.
11. Confirm the new quote appears in the dashboard.
12. Open quote detail.
13. Edit pricing and save.
14. Confirm 6% Michigan sales tax is applied after discounts and the deposit is 40% of the tax-inclusive total.
15. Send quote email.
16. Open generated `/quote/[token]` link and confirm its tax, total, deposit, and balance match the database and email.
17. Approve quote.
18. Confirm quote `status` becomes `customer_approved`.
19. Confirm `agreement_status` becomes `ready_to_send`.
20. Confirm opening or saving the approved quote does not change its stored financial totals.
21. Request changes test with a separate quote.
22. Decline test with a separate quote.
