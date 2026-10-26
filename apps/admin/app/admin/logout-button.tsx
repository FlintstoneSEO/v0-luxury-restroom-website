'use client'

import { useActionState } from 'react'
import { logout } from './actions'

export function LogoutButton() {
  const [error, action, pending] = useActionState(logout, '')
  return <form action={action}>
    <button disabled={pending} className="min-h-11 rounded border border-slate-400 px-4 py-2 font-semibold disabled:opacity-60">{pending ? 'Signing out…' : 'Sign out'}</button>
    <p role="status" className="mt-2 text-sm text-[#8b2525]">{error}</p>
  </form>
}
