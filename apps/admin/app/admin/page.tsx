import { requireAdminPage } from '../../lib/admin-auth'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminFoundationPage() {
  const user = await requireAdminPage()
  return (
    <main className="min-h-screen bg-cream px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#755839]">Signature Luxe</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-navy">Operations application</h1>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <p className="min-w-0 break-all text-sm text-slate-700">Signed in as {user.email || 'administrator'}</p>
          <LogoutButton />
        </div>
        <p className="mt-4 leading-relaxed text-slate-700">This application is being prepared for Signature Luxe operations. Operational screens are not available here yet.</p>
      </div>
    </main>
  )
}
