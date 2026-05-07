import { z } from 'zod';
import { AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, QUOTE_STATUSES, CUSTOMER_RESPONSE_TYPES } from '@/lib/quotes/types';

const nonNegativeMoney = z.number().finite().min(0);

// Schema for creating a new quote request (customer-facing form)
export const quoteRequestCreateSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
  event_date: z.string().min(1, 'Event date required'),
  event_type: z.string().min(1, 'Event type required'),
  guest_count: z.number().int().positive('Guest count must be positive'),
  event_address: z.string().min(3, 'Event address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zip_code: z.string().min(5, 'ZIP code required'),
  event_start_time: z.string().min(1, 'Start time required'),
  event_end_time: z.string().min(1, 'End time required'),
  has_power: z.boolean(),
  has_water: z.boolean(),
  additional_notes: z.string().max(5000).optional(),
});

// Schema for admin updates to quote requests
export const quoteRequestUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  
  // Customer information
  customer_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  
  // Event details
  event_date: z.string().optional(),
  event_type: z.string().optional(),
  guest_count: z.number().int().min(0).optional(),
  event_address: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  zip_code: z.string().min(5).optional(),
  event_start_time: z.string().optional(),
  event_end_time: z.string().optional(),
  has_power: z.boolean().optional(),
  has_water: z.boolean().optional(),
  additional_notes: z.string().max(5000).optional(),
  
  // Distance
  distance_miles: nonNegativeMoney.optional(),
  
  // Pricing fields
  base_price: nonNegativeMoney.optional(),
  travel_fee: nonNegativeMoney.optional(),
  utility_fee: nonNegativeMoney.optional(),
  after_hours_fee: nonNegativeMoney.optional(),
  cleaning_fee: nonNegativeMoney.optional(),
  damage_waiver_fee: nonNegativeMoney.optional(),
  rush_booking_fee: nonNegativeMoney.optional(),
  subtotal: nonNegativeMoney.optional(),
  total_price: nonNegativeMoney.optional(),
  discount_amount: nonNegativeMoney.optional(),
  
  // Deposit tracking
  deposit_amount: nonNegativeMoney.optional(),
  deposit_status: z.enum(DEPOSIT_TRACKING_STATUSES).optional(),
  deposit_due_date: z.union([z.string(), z.literal(''), z.null()]).optional(),
  deposit_paid_at: z.union([z.string().datetime(), z.literal(''), z.null()]).optional(),
  deposit_paid_amount: nonNegativeMoney.optional(),
  deposit_transaction_reference: z.string().optional(),
  deposit_payment_link: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  
  // Balance and expiration
  final_balance: nonNegativeMoney.optional(),
  quote_expires_at: z.union([z.string().datetime(), z.literal(''), z.null()]).optional(),
  
  // Workflow status
  status: z.union([z.enum(QUOTE_STATUSES), z.null()]).optional(),
  is_manual_override: z.boolean().optional(),
  
  // Agreement tracking
  agreement_status: z.enum(AGREEMENT_TRACKING_STATUSES).optional(),
  agreement_sent_at: z.union([z.string().datetime(), z.literal(''), z.null()]).optional(),
  agreement_signed_at: z.union([z.string().datetime(), z.literal(''), z.null()]).optional(),
  agreement_document_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  signed_document_url: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  agreement_provider_reference_id: z.string().optional(),
  
  // Notes
  internal_notes: z.string().max(5000).optional(),
  customer_notes: z.string().max(5000).optional(),
  
  // Customer response
  customer_response: z.string().max(5000).optional(),
  customer_response_type: z.enum(CUSTOMER_RESPONSE_TYPES).optional(),
  customer_response_at: z.union([z.string().datetime(), z.literal(''), z.null()]).optional(),
});

// Schema for status updates
export const quoteStatusUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  status: z.enum(QUOTE_STATUSES),
  internal_notes: z.string().max(5000).optional(),
});

// Schema for agreement updates
export const quoteAgreementUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  agreement_status: z.enum(AGREEMENT_TRACKING_STATUSES),
  agreement_document_url: z.string().url().optional(),
  signed_document_url: z.string().url().optional(),
  agreement_provider_reference_id: z.string().optional(),
  agreement_sent_at: z.string().datetime().optional(),
  agreement_signed_at: z.string().datetime().optional(),
});

// Schema for deposit updates
export const quoteDepositUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  deposit_status: z.enum(DEPOSIT_TRACKING_STATUSES),
  deposit_amount: nonNegativeMoney.optional(),
  deposit_payment_link: z.string().url().optional(),
  deposit_due_date: z.string().optional(),
  deposit_paid_at: z.string().datetime().optional(),
  deposit_paid_amount: nonNegativeMoney.optional(),
  deposit_transaction_reference: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  stripe_checkout_session_id: z.string().optional(),
});

// Schema for customer quote response
export const quoteCustomerResponseSchema = z.object({
  response_type: z.enum(CUSTOMER_RESPONSE_TYPES),
  comments: z.string().max(2000).optional(),
}).superRefine((data, ctx) => {
  if (data.response_type === 'change_requested' && !data.comments?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['comments'],
      message: 'Comments are required when requesting changes',
    });
  }

});
