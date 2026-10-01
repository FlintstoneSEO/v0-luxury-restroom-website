import type { SupabaseClient, User } from '@supabase/supabase-js'

export type AdminAccess =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403 | 503; error: string }

// Always obtain the user from Auth; cookie/session payloads are not authority.
export async function verifyAdmin(client: Pick<SupabaseClient, 'auth'>): Promise<AdminAccess> {
  try {
    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user) return { ok: false, status: 401, error: 'Authentication required' }
    if (user.app_metadata?.is_admin !== true) return { ok: false, status: 403, error: 'Admin access required' }
    return { ok: true, user }
  } catch {
    return { ok: false, status: 503, error: 'Unable to validate admin session' }
  }
}

export function safeAdminReturn(value: unknown): string {
  if (typeof value !== 'string' || /[\\%\s\x00-\x1f\x7f]/.test(value)) return '/admin'
  try {
    const url = new URL(value, 'https://admin.invalid')
    if (!value.startsWith('/') || url.origin !== 'https://admin.invalid') return '/admin'
    if (url.pathname !== '/admin' && !url.pathname.startsWith('/admin/')) return '/admin'
    if (url.pathname === '/admin/login' || url.pathname.startsWith('/admin/login/')) return '/admin'
    return url.pathname + url.search
  } catch { return '/admin' }
}
