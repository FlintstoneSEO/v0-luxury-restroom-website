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

## 3) Set `is_admin` metadata
In Supabase Auth user metadata, set:

```json
{
  "is_admin": true
}
```

You can set this in the Auth user editor (User Metadata) in the Supabase Dashboard.

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
- Admin user (`is_admin: true`) should access `/admin` and quote detail pages.

## 7) Troubleshooting redirects
If you are redirected to `/admin/login` repeatedly:
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.
- Verify browser cookies are enabled.
- Verify the user is authenticated in Supabase Auth.

If you are redirected to `/` from admin routes:
- User is authenticated but missing `user_metadata.is_admin = true`.

If `/admin` shows setup issues in production:
- Missing Supabase public env vars are blocking admin route protection.

## Security reminder
`SUPABASE_SERVICE_ROLE_KEY` must only be used server-side (API routes/server actions). Never expose it in client-side code or `NEXT_PUBLIC_*` variables.
