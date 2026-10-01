import 'server-only'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient } from './supabase/server'
import { type AdminAccess, verifyAdmin } from './auth-policy'

export async function requireAdminUser(): Promise<AdminAccess> {
  try { return await verifyAdmin(await createClient()) }
  catch { return { ok: false, status: 503, error: 'Authentication is temporarily unavailable' } }
}

export function deniedResponse(access: Extract<AdminAccess, { ok: false }>) {
  return NextResponse.json({ ok: false, error: access.error }, {
    status: access.status, headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  })
}

export async function requireAdminPage() {
  const access = await requireAdminUser()
  if (!access.ok) redirect('/admin/login?reason=' + (access.status === 403 ? 'denied' : access.status === 503 ? 'unavailable' : 'session'))
  return access.user
}
