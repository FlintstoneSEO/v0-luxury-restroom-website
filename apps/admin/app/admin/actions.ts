'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { safeAdminReturn, verifyAdmin } from '../../lib/auth-policy'

export async function login(_previous: string, form: FormData): Promise<string> {
  const email = form.get('email')
  const password = form.get('password')
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) return 'Enter your email and password.'
  try {
    const client = await createClient()
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return 'Unable to sign in. Check your email and password and try again.'
    const access = await verifyAdmin(client)
    if (!access.ok) {
      await client.auth.signOut({ scope: 'local' })
      return access.status === 403 ? 'This account does not have admin access.' : 'Unable to verify your session. Please try again.'
    }
  } catch { return 'Sign-in is temporarily unavailable. Please try again.' }
  redirect(safeAdminReturn(form.get('next')))
}

export async function logout(): Promise<string> {
  try {
    const client = await createClient()
    const { error } = await client.auth.signOut({ scope: 'local' })
    if (error) return 'Unable to sign out. Please try again.'
  } catch { return 'Unable to sign out. Please try again.' }
  redirect('/admin/login')
}
