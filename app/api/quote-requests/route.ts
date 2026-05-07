import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ ok: false, message: 'Supabase not configured yet. TODO: configure env vars.' }, { status: 503 })
  }

  const res = await fetch(`${url}/rest/v1/quote_requests`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) return NextResponse.json({ ok: false, message: 'Unable to save quote request' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
