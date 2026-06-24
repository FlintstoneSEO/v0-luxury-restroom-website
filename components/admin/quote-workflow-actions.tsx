'use client'

import { useState } from 'react'
import { ExternalLink, FileSignature, ReceiptText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

type QuoteWorkflowActionsProps = {
  quoteId: string
  agreementStatus?: string | null
  depositStatus?: string | null
  squareInvoiceUrl?: string | null
  signedAgreementUrl?: string | null
}

async function postAction(url: string) {
  const response = await fetch(url, { method: 'POST' })
  const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed')
  }

  return payload
}

export function QuoteWorkflowActions({
  quoteId,
  agreementStatus,
  depositStatus,
  squareInvoiceUrl,
  signedAgreementUrl,
}: QuoteWorkflowActionsProps) {
  const [pendingAction, setPendingAction] = useState<'agreement' | 'invoice' | null>(null)

  const canSendAgreement = agreementStatus !== 'signed'
  const canSendDepositInvoice = agreementStatus === 'signed' && depositStatus !== 'paid'

  async function sendAgreement() {
    setPendingAction('agreement')
    try {
      await postAction(`/api/admin/quotes/${quoteId}/send-agreement`)
      toast({
        title: 'Agreement sent',
        description: 'Dropbox Sign is sending the rental agreement to the customer.',
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Agreement was not sent',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setPendingAction(null)
    }
  }

  async function sendDepositInvoice() {
    setPendingAction('invoice')
    try {
      await postAction(`/api/admin/quotes/${quoteId}/send-deposit-invoice`)
      toast({
        title: 'Deposit invoice sent',
        description: 'Square is sending the deposit invoice to the customer.',
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Invoice was not sent',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        onClick={sendAgreement}
        disabled={!canSendAgreement || pendingAction !== null}
      >
        <FileSignature className="mr-2 h-4 w-4" />
        {pendingAction === 'agreement' ? 'Sending...' : 'Send Agreement'}
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={sendDepositInvoice}
        disabled={!canSendDepositInvoice || pendingAction !== null}
      >
        <ReceiptText className="mr-2 h-4 w-4" />
        {pendingAction === 'invoice' ? 'Sending...' : 'Send Deposit Invoice'}
      </Button>

      <Button type="button" variant="outline" disabled={!signedAgreementUrl} asChild={Boolean(signedAgreementUrl)}>
        {signedAgreementUrl ? (
          <a href={signedAgreementUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Agreement Status
          </a>
        ) : (
          <span>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Agreement Status
          </span>
        )}
      </Button>

      <Button type="button" variant="outline" disabled={!squareInvoiceUrl} asChild={Boolean(squareInvoiceUrl)}>
        {squareInvoiceUrl ? (
          <a href={squareInvoiceUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Square Invoice
          </a>
        ) : (
          <span>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Square Invoice
          </span>
        )}
      </Button>
    </div>
  )
}
