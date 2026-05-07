export const QUOTE_STATUSES = [
  'new',
  'under_review',
  'draft_quote',
  'sent_to_customer',
  'customer_approved',
  'completed',
  'cancelled',
  'declined',
  'expired',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const AGREEMENT_TRACKING_STATUSES = ['not_sent', 'sent', 'signed', 'voided'] as const;
export type AgreementTrackingStatus = (typeof AGREEMENT_TRACKING_STATUSES)[number];

export const DEPOSIT_TRACKING_STATUSES = ['not_required', 'due', 'paid', 'overdue', 'refunded'] as const;
export type DepositTrackingStatus = (typeof DEPOSIT_TRACKING_STATUSES)[number];

export interface QuoteRequest {
  // Customer
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Event
  eventDate: string;
  eventType: string;
  eventLocation: string;
  guestCount: number;
  eventStartTime?: string | null;
  eventEndTime?: string | null;
  eventNotes?: string | null;

  // Setup
  hasElectricalAccess: boolean;
  hasWaterAccess: boolean;
  setupNotes?: string | null;

  // Pricing
  basePrice: number;
  deliveryFee: number;
  addOnsTotal: number;
  discount: number;
  tax: number;
  total: number;
  depositAmount: number;
  remainingBalance: number;

  // Workflow
  status: QuoteStatus;
  internalNotes?: string | null;
  customerNotes?: string | null;
  approvalToken?: string | null;
  quoteSentAt?: string | null;
  customerApprovedAt?: string | null;

  // Agreement tracking
  agreementStatus: AgreementTrackingStatus;
  agreementDocumentUrl?: string | null;
  signedAgreementUrl?: string | null;
  agreementProviderReferenceId?: string | null;
  agreementSentAt?: string | null;
  agreementSignedAt?: string | null;

  // Deposit tracking
  depositStatus: DepositTrackingStatus;
  depositPaymentLink?: string | null;
  depositDueDate?: string | null;
  depositPaidAt?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Supabase-shaped row for clean mapping from snake_case DB columns.
export interface QuoteRequestRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_type: string;
  event_location: string;
  guest_count: number;
  event_start_time?: string | null;
  event_end_time?: string | null;
  event_notes?: string | null;
  has_electrical_access: boolean;
  has_water_access: boolean;
  setup_notes?: string | null;
  base_price: number;
  delivery_fee: number;
  add_ons_total: number;
  discount: number;
  tax: number;
  total: number;
  deposit_amount: number;
  remaining_balance: number;
  status: QuoteStatus;
  internal_notes?: string | null;
  customer_notes?: string | null;
  approval_token?: string | null;
  quote_sent_at?: string | null;
  customer_approved_at?: string | null;
  agreement_status: AgreementTrackingStatus;
  agreement_document_url?: string | null;
  signed_agreement_url?: string | null;
  agreement_provider_reference_id?: string | null;
  agreement_sent_at?: string | null;
  agreement_signed_at?: string | null;
  deposit_status: DepositTrackingStatus;
  deposit_payment_link?: string | null;
  deposit_due_date?: string | null;
  deposit_paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function mapQuoteRequestRow(row: QuoteRequestRow): QuoteRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    eventDate: row.event_date,
    eventType: row.event_type,
    eventLocation: row.event_location,
    guestCount: row.guest_count,
    eventStartTime: row.event_start_time,
    eventEndTime: row.event_end_time,
    eventNotes: row.event_notes,
    hasElectricalAccess: row.has_electrical_access,
    hasWaterAccess: row.has_water_access,
    setupNotes: row.setup_notes,
    basePrice: row.base_price,
    deliveryFee: row.delivery_fee,
    addOnsTotal: row.add_ons_total,
    discount: row.discount,
    tax: row.tax,
    total: row.total,
    depositAmount: row.deposit_amount,
    remainingBalance: row.remaining_balance,
    status: row.status,
    internalNotes: row.internal_notes,
    customerNotes: row.customer_notes,
    approvalToken: row.approval_token,
    quoteSentAt: row.quote_sent_at,
    customerApprovedAt: row.customer_approved_at,
    agreementStatus: row.agreement_status,
    agreementDocumentUrl: row.agreement_document_url,
    signedAgreementUrl: row.signed_agreement_url,
    agreementProviderReferenceId: row.agreement_provider_reference_id,
    agreementSentAt: row.agreement_sent_at,
    agreementSignedAt: row.agreement_signed_at,
    depositStatus: row.deposit_status,
    depositPaymentLink: row.deposit_payment_link,
    depositDueDate: row.deposit_due_date,
    depositPaidAt: row.deposit_paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
