import { safeAdminReturn } from '../../../lib/auth-policy'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const notice = params.reason === 'denied' ? 'This account does not have admin access. Sign in with an authorized account.'
    : params.reason === 'unavailable' ? 'Authentication is temporarily unavailable. Please try again.'
    : params.reason === 'session' ? 'Sign in to continue.' : ''
  return <main className="min-h-screen bg-cream px-4 py-10 sm:px-8">
    <section aria-labelledby="login-title" className="mx-auto max-w-md rounded-lg border border-border bg-white p-6 sm:p-8">
      <p className="text-sm font-semibold text-[#755839]">Signature Luxe Operations</p>
      <h1 id="login-title" className="mt-3 font-serif text-3xl font-bold text-navy">Admin sign in</h1>
      <LoginForm next={safeAdminReturn(params.next)} notice={notice} />
    </section>
  </main>
}
