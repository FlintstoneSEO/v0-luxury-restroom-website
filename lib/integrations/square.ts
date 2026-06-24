import crypto from 'crypto'

import type { QuoteRequest } from '@/lib/types/quote'

type SquareCustomerResponse = {
  customer?: {
    id?: string
  }
}

type SquareOrderResponse = {
  order?: {
    id?: string
  }
}

type SquareInvoiceResponse = {
  invoice?: {
    id?: string
    version?: number
    public_url?: string
  }
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'
}

function moneyFromDollars(value: number) {
  return Math.round(Number(value ?? 0) * 100)
}

async function squareFetch<T>(path: string, init: RequestInit) {
  const response = await fetch(`${squareBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('SQUARE_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      'Square-Version': '2026-06-18',
      ...init.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Square API request failed', {
      path,
      status: response.status,
      body: errorBody.slice(0, 500),
    })
    throw new Error('Square request failed')
  }

  return (await response.json()) as T
}

export async function createSquareDepositInvoice(quote: QuoteRequest) {
  const locationId = requireEnv('SQUARE_LOCATION_ID')
  const dueDate = quote.event_date || new Date().toISOString().slice(0, 10)

  const customerResponse = await squareFetch<SquareCustomerResponse>('/v2/customers', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: `quote-${quote.id}-customer`,
      given_name: quote.customer_name,
      email_address: quote.email,
      phone_number: quote.phone,
      reference_id: quote.id,
    }),
  })

  const customerId = customerResponse.customer?.id
  if (!customerId) {
    throw new Error('Square customer response was incomplete')
  }

  const orderResponse = await squareFetch<SquareOrderResponse>('/v2/orders', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: `quote-${quote.id}-deposit-order`,
      order: {
        location_id: locationId,
        reference_id: quote.id,
        line_items: [
          {
            name: `Rental deposit for ${quote.quote_number}`,
            quantity: '1',
            note: `Quote ID: ${quote.id}`,
            base_price_money: {
              amount: moneyFromDollars(quote.deposit_amount),
              currency: 'USD',
            },
          },
        ],
      },
    }),
  })

  const orderId = orderResponse.order?.id
  if (!orderId) {
    throw new Error('Square order response was incomplete')
  }

  const invoiceResponse = await squareFetch<SquareInvoiceResponse>('/v2/invoices', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: `quote-${quote.id}-deposit-invoice`,
      invoice: {
        location_id: locationId,
        order_id: orderId,
        primary_recipient: {
          customer_id: customerId,
        },
        delivery_method: 'EMAIL',
        title: `Deposit invoice for ${quote.quote_number}`,
        description: `Signature Luxe rental deposit. Quote ID: ${quote.id}`,
        payment_requests: [
          {
            request_type: 'BALANCE',
            due_date: dueDate,
            tipping_enabled: false,
          },
        ],
        accepted_payment_methods: {
          card: true,
          square_gift_card: false,
          bank_account: false,
          buy_now_pay_later: false,
          cash_app_pay: false,
        },
      },
    }),
  })

  const invoiceId = invoiceResponse.invoice?.id
  if (!invoiceId) {
    throw new Error('Square invoice response was incomplete')
  }

  const publishedInvoice = await squareFetch<SquareInvoiceResponse>(`/v2/invoices/${invoiceId}/publish`, {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: `quote-${quote.id}-deposit-invoice-publish`,
      version: invoiceResponse.invoice.version ?? 0,
    }),
  })

  return {
    customerId,
    invoiceId,
    invoiceUrl: publishedInvoice.invoice?.public_url ?? invoiceResponse.invoice?.public_url ?? null,
  }
}

export function verifySquareWebhook(rawBody: string, signature: string | null, notificationUrl: string) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!signatureKey || !signature) {
    return false
  }

  const expected = crypto
    .createHmac('sha256', signatureKey)
    .update(`${notificationUrl}${rawBody}`)
    .digest('base64')

  const left = Buffer.from(expected)
  const right = Buffer.from(signature)

  return left.length === right.length && crypto.timingSafeEqual(left, right)
}
