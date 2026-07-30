# Admin Setup (Supabase Auth)

## 1) Required environment variables
Set these locally in `.env.local` and in your deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `PUBLIC_SITE_URL` (public Astro origin)
- `ADMIN_APP_URL` (protected Next.js origin)
- `CUSTOMER_WORKFLOW_URL` (Next.js origin or proxy origin for `/quote/**`)

Optional but commonly required:

- `RESEND_API_KEY`
- `EMAIL_PROVIDER=resend`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL` (legacy migration fallback only)

## 2) Create an admin user
1. Open Supabase Dashboard → **Authentication** → **Users**.
2. Create a user (email/password) or invite the admin user.
3. Confirm the user can sign in.

## 3) Set protected `is_admin` app metadata
Do not use user metadata for authorization because users can edit it. In the
Supabase SQL editor, set the protected app metadata for the intended admin:

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
where email = 'admin@example.com';
```

Replace the example email and confirm exactly one row was updated. The user
must sign out and back in afterward so the refreshed token contains the claim.

## 4) Access admin locally
1. Run `npm run dev`.
2. Open `http://localhost:3000/admin/login`.
3. Sign in using the admin account.
4. Visit `/admin`.

## 5) Access admin after deployment
1. Set the same environment variables in your hosting provider.
2. Ensure `ADMIN_APP_URL` matches the protected Next.js deployment and `CUSTOMER_WORKFLOW_URL` matches the origin used in customer quote links.
3. Open `https://yourdomain.com/admin/login` and sign in.

## 6) Test login quickly
- Non-admin user should be redirected away from `/admin`.
- Admin user (`app_metadata.is_admin: true`) should access `/admin` and quote detail pages.

## 7) Troubleshooting redirects
If you are redirected to `/admin/login` repeatedly:
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.
- Verify browser cookies are enabled.
- Verify the user is authenticated in Supabase Auth.

If you are redirected to `/` from admin routes:
- User is authenticated but missing `app_metadata.is_admin = true`, or has not signed in again since it was assigned.

If `/admin` shows setup issues in production:
- Missing Supabase public env vars are blocking admin route protection.

## Security reminder
`SUPABASE_SERVICE_ROLE_KEY` must only be used server-side (API routes/server actions). Never expose it in client-side code or `NEXT_PUBLIC_*` variables.
