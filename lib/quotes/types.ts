// Quote statuses for the workflow
export const QUOTE_STATUSES = [
  'pending',
  'pending_review',
  'new',
  'under_review',
  'draft_quote',
  'quote_sent',
  'sent_to_customer',
  'customer_approved',
  'change_requested',
  'agreement_pending',
  'agreement_sent',
  'agreement_signed',
  'deposit_pending',
  'deposit_paid',
  'booked',
  'confirmed',
  'completed',
  'cancelled',
  'declined',
  'expired',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

// Agreement tracking statuses
export const AGREEMENT_TRACKING_STATUSES = [
  'not_sent',
  'not_started',
  'ready_to_send',
  'sent',
  'signed',
  'voided',
  'cancelled',
] as const;

export type AgreementTrackingStatus = (typeof AGREEMENT_TRACKING_STATUSES)[number];

// Deposit tracking statuses
export const DEPOSIT_TRACKING_STATUSES = [
  'not_required',
  'not_requested',
  'due',
  'requested',
  'pending',
  'paid',
  'overdue',
  'refunded',
  'waived',
] as const;

export type DepositTrackingStatus = (typeof DEPOSIT_TRACKING_STATUSES)[number];

// Customer response types
export const CUSTOMER_RESPONSE_TYPES = [
  'approved',
  'change_requested',
  'declined',
] as const;

export type CustomerResponseType = (typeof CUSTOMER_RESPONSE_TYPES)[number];

// Event types for the rental business
export const EVENT_TYPES = [
  'Wedding',
  'Private Party',
  'Corporate Event',
  'Festival/Community Event',
  'Construction/Long-term',
  'Disaster Relief/Government',
  'Graduation Party',
  'Outdoor Ceremony',
  'Other',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// Main quote request interface matching the Supabase schema
export interface QuoteRequest {
  // Core identification
  id: string;
  quote_number?: string;

  // Customer information
  customer_name: string;
  phone: string;
  email: string;

  // Event details
  event_date: string;
  event_type: string;
  guest_count: number;
  event_address: string;
  city: string;
  state: string;
  zip_code: string;
  event_start_time: string;
  event_end_time: string;

  // Site utilities
  has_power: boolean;
  has_water: boolean;
  additional_notes?: string;

  // Distance and travel
  distance_miles?: number;

  // Pricing breakdown
  base_price?: number;
  travel_fee?: number;
  utility_fee?: number;
  after_hours_fee?: number;
  cleaning_fee?: number;
  damage_waiver_fee?: number;
  rush_booking_fee?: number;
  subtotal?: number;
  total_price?: number;
  discount_amount?: number;

  // Deposit tracking
  deposit_amount?: number;
  deposit_status: DepositTrackingStatus;
  deposit_due_date?: string;
  deposit_paid_at?: string;
  deposit_paid_amount?: number;
  deposit_transaction_reference?: string;
  deposit_payment_link?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  final_balance?: number;

  // Quote management
  quote_expires_at?: string;
  calculated_breakdown?: Record<string, unknown>;
  is_manual_override?: boolean;
  needs_manual_distance_review?: boolean;

  // Workflow status
  status: QuoteStatus;

  // Approval token tracking
  approval_token_hash?: string;
  approval_token_expires_at?: string;
  approval_token_used_at?: string;
  approved_at?: string;

  // Customer response
  customer_response?: string;
  customer_response_type?: CustomerResponseType;
  customer_response_at?: string;

  // Agreement tracking
  agreement_status: AgreementTrackingStatus;
  agreement_sent_at?: string;
  agreement_viewed_at?: string;
  agreement_signed_at?: string;
  agreement_document_url?: string;
  signed_document_url?: string;
  agreement_provider_reference_id?: string;

  // Notes
  internal_notes?: string;
  customer_notes?: string;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

// Supabase row shape for mapping from database
export interface QuoteRequestRow {
  id: string;
  quote_number?: string;
  customer_name: string;
  phone: string;
  email: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  event_address: string;
  city: string;
  state: string;
  zip_code: string;
  event_start_time: string;
  event_end_time: string;
  has_power: boolean;
  has_water: boolean;
  additional_notes?: string;
  distance_miles?: number;
  base_price?: number;
  travel_fee?: number;
  utility_fee?: number;
  after_hours_fee?: number;
  cleaning_fee?: number;
  damage_waiver_fee?: number;
  rush_booking_fee?: number;
  subtotal?: number;
  total_price?: number;
  discount_amount?: number;
  deposit_amount?: number;
  deposit_status: DepositTrackingStatus;
  deposit_due_date?: string;
  deposit_paid_at?: string;
  deposit_paid_amount?: number;
  deposit_transaction_reference?: string;
  deposit_payment_link?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  final_balance?: number;
  quote_expires_at?: string;
  calculated_breakdown?: Record<string, unknown>;
  is_manual_override?: boolean;
  needs_manual_distance_review?: boolean;
  status: QuoteStatus;
  approval_token_hash?: string;
  approval_token_expires_at?: string;
  approval_token_used_at?: string;
  approved_at?: string;
  customer_response?: string;
  customer_response_type?: CustomerResponseType;
  customer_response_at?: string;
  agreement_status: AgreementTrackingStatus;
  agreement_sent_at?: string;
  agreement_viewed_at?: string;
  agreement_signed_at?: string;
  agreement_document_url?: string;
  signed_document_url?: string;
  agreement_provider_reference_id?: string;
  internal_notes?: string;
  customer_notes?: string;
  created_at: string;
  updated_at?: string;
}

// Map database row to QuoteRequest
export function mapQuoteRequestRow(row: QuoteRequestRow): QuoteRequest {
  return {
    id: row.id,
    quote_number: row.quote_number,
    customer_name: row.customer_name,
    phone: row.phone,
    email: row.email,
    event_date: row.event_date,
    event_type: row.event_type,
    guest_count: row.guest_count,
    event_address: row.event_address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    event_start_time: row.event_start_time,
    event_end_time: row.event_end_time,
    has_power: row.has_power,
    has_water: row.has_water,
    additional_notes: row.additional_notes,
    distance_miles: row.distance_miles,
    base_price: row.base_price,
    travel_fee: row.travel_fee,
    utility_fee: row.utility_fee,
    after_hours_fee: row.after_hours_fee,
    cleaning_fee: row.cleaning_fee,
    damage_waiver_fee: row.damage_waiver_fee,
    rush_booking_fee: row.rush_booking_fee,
    subtotal: row.subtotal,
    total_price: row.total_price,
    discount_amount: row.discount_amount,
    deposit_amount: row.deposit_amount,
    deposit_status: row.deposit_status,
    deposit_due_date: row.deposit_due_date,
    deposit_paid_at: row.deposit_paid_at,
    deposit_paid_amount: row.deposit_paid_amount,
    deposit_transaction_reference: row.deposit_transaction_reference,
    deposit_payment_link: row.deposit_payment_link,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    stripe_checkout_session_id: row.stripe_checkout_session_id,
    final_balance: row.final_balance,
    quote_expires_at: row.quote_expires_at,
    calculated_breakdown: row.calculated_breakdown,
    is_manual_override: row.is_manual_override,
    needs_manual_distance_review: row.needs_manual_distance_review,
    status: row.status,
    approval_token_hash: row.approval_token_hash,
    approval_token_expires_at: row.approval_token_expires_at,
    approval_token_used_at: row.approval_token_used_at,
    approved_at: row.approved_at,
    customer_response: row.customer_response,
    customer_response_type: row.customer_response_type,
    customer_response_at: row.customer_response_at,
    agreement_status: row.agreement_status,
    agreement_sent_at: row.agreement_sent_at,
    agreement_viewed_at: row.agreement_viewed_at,
    agreement_signed_at: row.agreement_signed_at,
    agreement_document_url: row.agreement_document_url,
    signed_document_url: row.signed_document_url,
    agreement_provider_reference_id: row.agreement_provider_reference_id,
    internal_notes: row.internal_notes,
    customer_notes: row.customer_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
