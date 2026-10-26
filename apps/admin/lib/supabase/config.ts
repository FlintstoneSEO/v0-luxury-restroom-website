export function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Admin authentication is not configured')
  return { url, key }
}

export const cookieOptions = {
  name: 'sl-admin-auth',
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false,
  // No Domain: authentication belongs only to the current admin host.
}
