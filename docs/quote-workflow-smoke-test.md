# Quote Workflow Smoke Test

1. Set environment variables locally (`.env.local`) from `.env.example`.
2. Create an admin user in Supabase Auth.
3. Set `user_metadata.is_admin = true` for that user.
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
14. Send quote email.
15. Open generated `/quote/[token]` link.
16. Approve quote.
17. Confirm quote `status` becomes `customer_approved`.
18. Confirm `agreement_status` becomes `ready_to_send`.
19. Request changes test with a separate quote.
20. Decline test with a separate quote.
