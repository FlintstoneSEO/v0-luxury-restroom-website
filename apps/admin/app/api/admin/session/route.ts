import { NextResponse } from 'next/server'
import { deniedResponse, requireAdminUser } from '../../../../lib/admin-auth'

export const dynamic = 'force-dynamic'
export async function GET() {
  const access = await requireAdminUser()
  if (!access.ok) return deniedResponse(access)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
}
