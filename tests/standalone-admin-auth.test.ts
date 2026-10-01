import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { safeAdminReturn, verifyAdmin } from '../apps/admin/lib/auth-policy'

const mock = vi.hoisted(() => ({
  getUser: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(),
  set: vi.fn(), factory: vi.fn(), service: vi.fn(), refresh: false,
}))
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: mock.set }) }))
vi.mock('next/navigation', () => ({ redirect: (path: string) => { throw new Error('REDIRECT:' + path) } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: mock.service }))
vi.mock('@supabase/ssr', () => ({ createServerClient: (...args: unknown[]) => {
  mock.factory(...args)
  if (mock.refresh) {
    const options = args[2] as { cookies: { setAll: (v: unknown[], h: Record<string, string>) => void } }
    options.cookies.setAll([{ name: 'sl-admin-auth', value: 'refreshed', options: { path: '/', sameSite: 'lax', secure: true } }], { 'Cache-Control': 'no-store' })
  }
  return { auth: { getUser: mock.getUser, signInWithPassword: mock.signInWithPassword, signOut: mock.signOut } }
} }))

import { proxy } from '../apps/admin/proxy'
import { GET } from '../apps/admin/app/api/admin/session/route'
import { login, logout } from '../apps/admin/app/admin/actions'
import { createAuthorizedAdminClient } from '../apps/admin/lib/supabase/admin'
import { requireAdminPage } from '../apps/admin/lib/admin-auth'

const client = { auth: { getUser: mock.getUser } } as unknown as SupabaseClient
function user(admin: unknown, metadata = false) {
  return { data: { user: { id: 'fixture', email: 'operator@example.test', app_metadata: { is_admin: admin }, user_metadata: { is_admin: metadata } } }, error: null }
}
beforeEach(() => {
  vi.clearAllMocks()
  mock.refresh = false
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon'
  mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
  mock.signInWithPassword.mockResolvedValue({ error: null })
  mock.signOut.mockResolvedValue({ error: null })
})

describe('standalone server authorization and direct handler boundary', () => {
  it.each([
    ['no session', null, 401], ['non-admin', false, 403], ['string claim', 'true', 403], ['admin', true, 200],
  ])('%s', async (_name, claim, status) => {
    if (claim !== null) mock.getUser.mockResolvedValue(user(claim, true))
    const result = await verifyAdmin(client)
    expect(result.ok ? 200 : result.status).toBe(status)
    expect((await GET()).status).toBe(status)
    expect((await proxy(new NextRequest('https://admin.example.test/api/admin/session'))).status).toBe(status)
  })
  it('fails closed on invalid/expired sessions and transport errors', async () => {
    mock.getUser.mockResolvedValue({ ...user(true), error: new Error('expired') })
    expect((await GET()).status).toBe(401)
    mock.getUser.mockRejectedValue(new Error('network'))
    expect((await GET()).status).toBe(503)
  })
  it('protects pages independently of proxy', async () => {
    await expect(requireAdminPage()).rejects.toThrow('REDIRECT:/admin/login?reason=session')
    mock.getUser.mockResolvedValue(user(false))
    await expect(requireAdminPage()).rejects.toThrow('reason=denied')
    mock.getUser.mockResolvedValue(user(true))
    expect((await requireAdminPage()).id).toBe('fixture')
  })
  it('authorizes before constructing a service-role client', async () => {
    await expect(createAuthorizedAdminClient()).rejects.toThrow('authorization')
    expect(mock.service).not.toHaveBeenCalled()
    mock.getUser.mockResolvedValue(user(true))
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-only'
    await createAuthorizedAdminClient()
    expect(mock.service).toHaveBeenCalledOnce()
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })
})

describe('proxy and redirect safety', () => {
  it('redirects anonymous/non-admin pages to login and keeps login public', async () => {
    const request = new NextRequest('https://admin.example.test/admin/future')
    expect((await proxy(request)).headers.get('location')).toContain('/admin/login?next=')
    mock.getUser.mockResolvedValue(user(false))
    expect((await proxy(request)).headers.get('location')).toContain('reason=denied')
    expect((await proxy(new NextRequest('https://admin.example.test/admin/login'))).status).toBe(200)
  })
  it('propagates refresh cookies on request, success, and denial responses', async () => {
    mock.refresh = true
    mock.getUser.mockResolvedValue(user(true))
    const request = new NextRequest('https://admin.example.test/admin')
    const response = await proxy(request)
    expect(request.cookies.get('sl-admin-auth')?.value).toBe('refreshed')
    expect(response.cookies.get('sl-admin-auth')?.value).toBe('refreshed')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('set-cookie')).toContain('Secure')
    expect(response.headers.get('set-cookie')).not.toContain('Domain=')
    mock.getUser.mockResolvedValue(user(false))
    expect((await proxy(request)).cookies.get('sl-admin-auth')?.value).toBe('refreshed')
  })
  it.each(['https://evil.test/admin', '//evil.test/admin', '/admin/../../evil', '/admin\\evil', '/admin/%2f%2fevil', '/admin/login', '/api/admin/session', undefined])('rejects unsafe return %s', value => {
    expect(safeAdminReturn(value)).toBe('/admin')
  })
  it('retains safe admin paths', () => expect(safeAdminReturn('/admin/future?filter=open')).toBe('/admin/future?filter=open'))
})

describe('password login and logout', () => {
  function form() { const data = new FormData(); data.set('email', 'operator@example.test'); data.set('password', 'fixture-password'); data.set('next', '//evil.test'); return data }
  it('denies a successful non-admin authentication and signs it out', async () => {
    mock.getUser.mockResolvedValue(user(false, true))
    expect(await login('', form())).toContain('does not have admin access')
    expect(mock.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
  it('redirects verified admin and handles incorrect credentials', async () => {
    mock.getUser.mockResolvedValue(user(true))
    await expect(login('', form())).rejects.toThrow('REDIRECT:/admin')
    mock.signInWithPassword.mockResolvedValue({ error: new Error('credentials') })
    expect(await login('', form())).toContain('Check your email and password')
  })
  it('logs out locally and reports failure', async () => {
    await expect(logout()).rejects.toThrow('REDIRECT:/admin/login')
    expect(mock.signOut).toHaveBeenCalledWith({ scope: 'local' })
    mock.signOut.mockResolvedValue({ error: new Error('offline') })
    expect(await logout()).toContain('Unable to sign out')
  })
})
