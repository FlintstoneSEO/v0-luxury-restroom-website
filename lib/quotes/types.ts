export const QUOTE_STATUSES = [
  'new',
  'under_review',
  'quote_sent',
  'customer_approved',
  'agreement_pending',
  'deposit_pending',
  'booked',
  'completed',
  'cancelled',
  'declined',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const AGREEMENT_TRACKING_STATUSES = ['not_sent', 'sent', 'signed', 'voided'] as const;
export type AgreementTrackingStatus = (typeof AGREEMENT_TRACKING_STATUSES)[number];

export const DEPOSIT_TRACKING_STATUSES = ['not_required', 'due', 'pending', 'paid', 'overdue', 'refunded'] as const;
export type DepositTrackingStatus = (typeof DEPOSIT_TRACKING_STATUSES)[number];

export interface QuoteRequest {
  // Core identification & timestamps
  id: string;
  created_at: string;
  updated_at: string;

  // Customer information
  email: string;
  phone: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  // Restroom rental specifics
  room_type: string; // e.g., "Luxury 1-Stall", "Standard 2-Stall"
  room_condition: string; // e.g., "Excellent", "Good"
  features: string[]; // e.g., ["Hands-free soap", "LED lighting"]
  color_preference: string; // e.g., "White", "Charcoal"

  // Pricing
  base_price?: number;
  labor_cost?: number;
  materials_cost?: number;
  tax_amount?: number;
  total_price?: number;
  discount_amount?: number;
  final_price?: number;
  price_valid_until?: string;

  // Status tracking
  status: QuoteStatus;
  sent_at?: string;
  approved_at?: string;
  rejected_at?: string;

  // Agreement tracking
  agreement_status: AgreementTrackingStatus;
  agreement_document_url?: string;
  agreement_provider_reference_id?: string;
  agreement_sent_at?: string;
  agreement_signed_at?: string;

  // Deposit tracking
  deposit_status: DepositTrackingStatus;
  deposit_payment_link?: string;
  deposit_due_date?: string;
  deposit_paid_at?: string;
  deposit_paid_amount?: number;
  deposit_transaction_reference?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;

  // Notes
  internal_notes?: string;
  customer_notes?: string;
  notes?: string; // Legacy compatibility

  // Customer responses
  customer_response?: string;
  customer_response_type?: 'approval' | 'rejection' | 'inquiry';
  customer_response_at?: string;

  // Quote management
  quote_expires_at?: string;
  is_manual_override?: boolean;
}

// Supabase-shaped row for clean mapping from snake_case DB columns.
export interface QuoteRequestRow {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  room_type: string;
  room_condition: string;
  features: string[];
  color_preference: string;
  base_price?: number;
  labor_cost?: number;
  materials_cost?: number;
  tax_amount?: number;
  total_price?: number;
  discount_amount?: number;
  final_price?: number;
  price_valid_until?: string;
  status: QuoteStatus;
  sent_at?: string;
  approved_at?: string;
  rejected_at?: string;
  agreement_status: AgreementTrackingStatus;
  agreement_document_url?: string;
  agreement_provider_reference_id?: string;
  agreement_sent_at?: string;
  agreement_signed_at?: string;
  deposit_status: DepositTrackingStatus;
  deposit_payment_link?: string;
  deposit_due_date?: string;
  deposit_paid_at?: string;
  deposit_paid_amount?: number;
  deposit_transaction_reference?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  internal_notes?: string;
  customer_notes?: string;
  notes?: string;
  customer_response?: string;
  customer_response_type?: 'approval' | 'rejection' | 'inquiry';
  customer_response_at?: string;
  quote_expires_at?: string;
  is_manual_override?: boolean;
}

export function mapQuoteRequestRow(row: QuoteRequestRow): QuoteRequest {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    email: row.email,
    phone: row.phone,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    room_type: row.room_type,
    room_condition: row.room_condition,
    features: row.features || [],
    color_preference: row.color_preference,
    base_price: row.base_price,
    labor_cost: row.labor_cost,
    materials_cost: row.materials_cost,
    tax_amount: row.tax_amount,
    total_price: row.total_price,
    discount_amount: row.discount_amount,
    final_price: row.final_price,
    price_valid_until: row.price_valid_until,
    status: row.status,
    sent_at: row.sent_at,
    approved_at: row.approved_at,
    rejected_at: row.rejected_at,
    agreement_status: row.agreement_status,
    agreement_document_url: row.agreement_document_url,
    agreement_provider_reference_id: row.agreement_provider_reference_id,
    agreement_sent_at: row.agreement_sent_at,
    agreement_signed_at: row.agreement_signed_at,
    deposit_status: row.deposit_status,
    deposit_payment_link: row.deposit_payment_link,
    deposit_due_date: row.deposit_due_date,
    deposit_paid_at: row.deposit_paid_at,
    deposit_paid_amount: row.deposit_paid_amount,
    deposit_transaction_reference: row.deposit_transaction_reference,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    stripe_checkout_session_id: row.stripe_checkout_session_id,
    internal_notes: row.internal_notes,
    customer_notes: row.customer_notes,
    notes: row.notes,
    customer_response: row.customer_response,
    customer_response_type: row.customer_response_type,
    customer_response_at: row.customer_response_at,
    quote_expires_at: row.quote_expires_at,
    is_manual_override: row.is_manual_override,
  };
}
