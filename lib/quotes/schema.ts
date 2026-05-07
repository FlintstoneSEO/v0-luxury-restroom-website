import { z } from 'zod';
import { AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, QUOTE_STATUSES } from '@/lib/quotes/types';

const nonNegativeMoney = z.number().finite().min(0);

export const pricingValuesSchema = z.object({
  basePrice: nonNegativeMoney,
  deliveryFee: nonNegativeMoney,
  addOnsTotal: nonNegativeMoney,
  discount: nonNegativeMoney,
  tax: nonNegativeMoney,
  total: nonNegativeMoney,
  depositAmount: nonNegativeMoney,
  remainingBalance: nonNegativeMoney,
});

export const quoteRequestCreateSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  eventDate: z.string().min(1),
  eventType: z.string().min(2),
  eventLocation: z.string().min(3),
  guestCount: z.number().int().positive(),
  eventStartTime: z.string().optional().nullable(),
  eventEndTime: z.string().optional().nullable(),
  eventNotes: z.string().max(5000).optional().nullable(),
  hasElectricalAccess: z.boolean().default(false),
  hasWaterAccess: z.boolean().default(false),
  setupNotes: z.string().max(5000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  customerNotes: z.string().max(5000).optional().nullable(),
  status: z.enum(QUOTE_STATUSES).default('new'),
  agreementStatus: z.enum(AGREEMENT_TRACKING_STATUSES).default('not_sent'),
  depositStatus: z.enum(DEPOSIT_TRACKING_STATUSES).default('due'),
  ...pricingValuesSchema.shape,
});

export const quoteRequestUpdateSchema = quoteRequestCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const quoteStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(QUOTE_STATUSES),
  internalNotes: z.string().max(5000).optional().nullable(),
});
