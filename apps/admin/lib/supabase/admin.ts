import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { requireAdminUser } from '../admin-auth'

// No raw factory is exported: authorization must succeed before key access.
export async function createAuthorizedAdminClient() {
  const access = await requireAdminUser()
  if (!access.ok) throw new Error('Admin authorization required')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Operational access is not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}
