import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookieOptions, publicConfig } from './lib/supabase/config'
import { verifyAdmin, safeAdminReturn, type AdminAccess } from './lib/auth-policy'

export async function proxy(request: NextRequest) {
  // Login (including its server actions) must remain reachable without a session.
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()
  let refreshed = NextResponse.next({ request })
  let access: AdminAccess
  try {
    const { url, key } = publicConfig()
    const client = createServerClient(url, key, {
      cookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value))
          refreshed = NextResponse.next({ request })
          values.forEach(({ name, value, options }) => refreshed.cookies.set(name, value, options))
          Object.entries(headers).forEach(([name, value]) => refreshed.headers.set(name, value))
        },
      },
    })
    access = await verifyAdmin(client)
  } catch { access = { ok: false, status: 503, error: 'Authentication is temporarily unavailable' } }

  let response = refreshed
  if (!access.ok) {
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      response = NextResponse.json({ ok: false, error: access.error }, { status: access.status })
    } else {
      const login = new URL('/admin/login', request.url)
      login.searchParams.set('next', safeAdminReturn(request.nextUrl.pathname + request.nextUrl.search))
      login.searchParams.set('reason', access.status === 403 ? 'denied' : access.status === 503 ? 'unavailable' : 'session')
      response = NextResponse.redirect(login)
    }
    refreshed.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
  }
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
