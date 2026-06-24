import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { QuoteWorkflowActions } from '@/components/admin/quote-workflow-actions'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { createAdminClient } from '@/lib/supabase/admin'
import type { QuoteRequest } from '@/lib/types/quote'

export const metadata = {
  title: 'Quote Detail | Admin | Signature Luxe',
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value || 'Not provided'}</dd>
    </div>
  )
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const quote = data as QuoteRequest
  const agreementStatus = quote.agreement_status ?? 'not_sent'
  const depositStatus = quote.deposit_status ?? 'not_sent'

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Quote Detail</p>
            <h1 className="mt-1 text-3xl font-serif font-bold text-navy">{quote.quote_number}</h1>
            <p className="mt-2 text-muted-foreground">{quote.customer_name} · {quote.email}</p>
          </div>
          <QuoteWorkflowActions
            quoteId={quote.id}
            agreementStatus={agreementStatus}
            depositStatus={depositStatus}
            squareInvoiceUrl={quote.square_deposit_invoice_url}
            signedAgreementUrl={quote.signed_agreement_url}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy">Event and Customer</h2>
              <Badge variant="secondary">{quote.status}</Badge>
            </div>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <DetailRow label="Customer" value={quote.customer_name} />
              <DetailRow label="Phone" value={quote.phone} />
              <DetailRow label="Email" value={quote.email} />
              <DetailRow label="Event Date" value={quote.event_date} />
              <DetailRow label="Event Type" value={quote.event_type} />
              <DetailRow label="Guest Count" value={quote.guest_count} />
              <DetailRow label="Time" value={`${quote.event_start_time} - ${quote.event_end_time}`} />
              <DetailRow label="Address" value={`${quote.event_address}, ${quote.city}, ${quote.state} ${quote.zip_code}`} />
              <DetailRow label="Power Available" value={quote.has_power ? 'Yes' : 'No'} />
              <DetailRow label="Water Available" value={quote.has_water ? 'Yes' : 'No'} />
            </dl>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-navy">Workflow</h2>
              <dl className="mt-3">
                <DetailRow label="Agreement Status" value={<Badge>{agreementStatus}</Badge>} />
                <DetailRow label="Agreement Sent" value={formatDateTime(quote.agreement_sent_at)} />
                <DetailRow label="Agreement Signed" value={formatDateTime(quote.agreement_signed_at)} />
                <DetailRow label="Deposit Status" value={<Badge variant="secondary">{depositStatus}</Badge>} />
                <DetailRow label="Deposit Paid" value={formatDateTime(quote.deposit_paid_at)} />
              </dl>
            </section>

            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-navy">Pricing</h2>
              <dl className="mt-3">
                <DetailRow label="Base Price" value={formatCurrency(quote.base_price)} />
                <DetailRow label="Travel Fee" value={formatCurrency(quote.travel_fee)} />
                <DetailRow label="Utility Fee" value={formatCurrency(quote.utility_fee)} />
                <DetailRow label="After Hours Fee" value={formatCurrency(quote.after_hours_fee)} />
                <DetailRow label="Total Price" value={formatCurrency(quote.total_price)} />
                <DetailRow label="Deposit" value={formatCurrency(quote.deposit_amount)} />
                <DetailRow label="Final Balance" value={formatCurrency(quote.final_balance)} />
              </dl>
            </section>
          </aside>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
