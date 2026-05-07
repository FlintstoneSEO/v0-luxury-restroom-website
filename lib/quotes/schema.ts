import { z } from 'zod';
import { AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, QUOTE_STATUSES } from '@/lib/quotes/types';

const nonNegativeMoney = z.number().finite().min(0);

export const quoteRequestCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
  address: z.string().min(3, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zip: z.string().min(5, 'ZIP code required'),
  room_type: z.string().min(1, 'Room type required'),
  room_condition: z.string().min(1, 'Room condition required'),
  features: z.array(z.string()).optional().default([]),
  color_preference: z.string().optional(),
  base_price: nonNegativeMoney.optional(),
  labor_cost: nonNegativeMoney.optional(),
  materials_cost: nonNegativeMoney.optional(),
  tax_amount: nonNegativeMoney.optional(),
  total_price: nonNegativeMoney.optional(),
  discount_amount: nonNegativeMoney.optional(),
  final_price: nonNegativeMoney.optional(),
  price_valid_until: z.string().optional(),
  internal_notes: z.string().max(5000).optional(),
  customer_notes: z.string().max(5000).optional(),
  status: z.enum(QUOTE_STATUSES).default('new'),
  agreement_status: z.enum(AGREEMENT_TRACKING_STATUSES).default('not_sent'),
  deposit_status: z.enum(DEPOSIT_TRACKING_STATUSES).default('due'),
});

export const quoteRequestUpdateSchema = quoteRequestCreateSchema.partial().extend({
  id: z.string().uuid('Valid ID required'),
});

export const quoteStatusUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  status: z.enum(QUOTE_STATUSES),
  internal_notes: z.string().max(5000).optional(),
});

export const quoteAgreementUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  agreement_status: z.enum(AGREEMENT_TRACKING_STATUSES),
  agreement_document_url: z.string().url().optional(),
  agreement_provider_reference_id: z.string().optional(),
  agreement_sent_at: z.string().datetime().optional(),
  agreement_signed_at: z.string().datetime().optional(),
});

export const quoteDepositUpdateSchema = z.object({
  id: z.string().uuid('Valid ID required'),
  deposit_status: z.enum(DEPOSIT_TRACKING_STATUSES),
  deposit_payment_link: z.string().url().optional(),
  deposit_due_date: z.string().optional(),
  deposit_paid_at: z.string().datetime().optional(),
  deposit_paid_amount: nonNegativeMoney.optional(),
  deposit_transaction_reference: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  stripe_checkout_session_id: z.string().optional(),
});
