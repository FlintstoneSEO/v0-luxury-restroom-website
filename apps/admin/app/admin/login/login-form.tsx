'use client'

import { useActionState } from 'react'
import { login } from '../actions'

export function LoginForm({ next, notice }: { next: string; notice: string }) {
  const [error, action, pending] = useActionState(login, '')
  return <form action={action} className="mt-6 space-y-5" aria-busy={pending}>
    <input type="hidden" name="next" value={next} />
    <div><label htmlFor="email" className="block text-sm font-semibold">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required className="mt-2 min-h-11 w-full rounded border border-slate-400 bg-white px-3" /></div>
    <div><label htmlFor="password" className="block text-sm font-semibold">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 min-h-11 w-full rounded border border-slate-400 bg-white px-3" /></div>
    <p role="status" aria-live="polite" className="text-sm text-[#8b2525]">{error || notice}</p>
    <button disabled={pending} className="min-h-11 w-full rounded bg-navy px-4 py-3 font-semibold text-white disabled:opacity-60">{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>
}
