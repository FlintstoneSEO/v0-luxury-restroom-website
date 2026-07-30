export const QUOTE_REQUEST_STATUSES = [
  'draft',
  'pending_review',
  'quoted',
  'proposal_sent',
  'awaiting_client',
  'approved',
  'customer_approved',
  'changes_requested',
  'customer_declined',
  'declined',
  'expired',
  'cancelled',
] as const;

export type QuoteRequestStatus = (typeof QUOTE_REQUEST_STATUSES)[number];

export const AGREEMENT_STATUSES = ['not_sent', 'ready_to_send', 'sent', 'viewed', 'signed', 'voided'] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export const DEPOSIT_STATUSES = ['not_required', 'due', 'partially_paid', 'paid', 'refunded'] as const;
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];

export interface QuoteFormData {
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
}

export interface PricingSettings {
  base_price_100_guests: number;
  base_price_150_guests: number;
  base_price_200_guests: number;
  base_price_200_plus: number;
  included_miles: number;
  travel_rate_per_mile: number;
  generator_fee: number;
  water_fee: number;
  after_hours_hourly_rate: number;
  after_hours_cutoff_hour: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  cleaning_fee: number;
  extra_day_fee: number;
  sales_tax_percentage: number;
  deposit_percentage: number;
}

export interface QuoteLineItem {
  code: 'base_rental' | 'travel' | 'utilities' | 'after_hours' | 'cleaning' | 'damage_waiver' | 'rush_booking';
  label: string;
  quantity: number;
  unit_price: number;
  total: number;
  taxable?: boolean;
}

export interface PriceBreakdown {
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  cleaning_fee: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  subtotal: number;
  discount_amount: number;
  pretax_total: number;
  taxable_amount: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
  line_items: QuoteLineItem[];
  details: {
    guest_tier: string;
    distance_miles: number;
    extra_miles: number;
    generator_needed: boolean;
    water_needed: boolean;
    after_hours_count: number;
    rush_days_out: number | null;
    distance_calculation_status?: 'success' | 'fallback' | 'same_address' | 'failed';
    distance_calculation_message?: string;
    distance_fallback_miles?: number;
    [key: string]: unknown;
  };
}

export interface QuoteApprovalToken {
  token_hash: string;
  token_expires_at: string;
  token_used_at?: string | null;
}

export interface QuoteAgreementTracking {
  agreement_status: AgreementStatus;
  agreement_sent_at?: string | null;
  agreement_viewed_at?: string | null;
  agreement_signed_at?: string | null;
  agreement_document_url?: string | null;
  signed_document_url?: string | null;
  agreement_provider_reference_id?: string | null;
}

export interface QuoteDepositTracking {
  deposit_status: DepositStatus;
  deposit_due_date?: string | null;
  deposit_paid_at?: string | null;
  deposit_paid_amount?: number | null;
  deposit_transaction_reference?: string | null;
  deposit_payment_link?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
}

export interface QuoteRequest extends QuoteFormData, QuoteApprovalToken, QuoteAgreementTracking, QuoteDepositTracking {
  id: string;
  created_at: string;
  updated_at?: string;
  quote_number: string;
  status: QuoteRequestStatus;
  distance_miles: number;
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  cleaning_fee: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  subtotal: number;
  discount_amount: number;
  pretax_total: number;
  taxable_amount: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
  calculated_breakdown: PriceBreakdown;
}

export const EVENT_TYPES = [
  'Wedding',
  'Corporate Event',
  'Festival/Concert',
  'Private Party',
  'Construction Site',
  'Outdoor Ceremony',
  'Graduation Party',
  'Other',
] as const;
