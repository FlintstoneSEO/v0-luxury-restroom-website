import { z } from 'zod';
import {
  AVAILABILITY_BLOCK_STATUSES,
  AVAILABILITY_BLOCK_TYPES,
  AVAILABILITY_EFFECTS,
} from '@/lib/availability';
import { isValidDateOnly } from '@/lib/date-only';

const dateOnly = z.string().refine(isValidDateOnly, 'Expected a valid YYYY-MM-DD date');

export const availabilityBlockInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  start_date: dateOnly,
  end_date: dateOnly,
  block_type: z.enum(AVAILABILITY_BLOCK_TYPES),
  availability_effect: z.enum(AVAILABILITY_EFFECTS),
  organization_name: z.string().trim().max(160).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  allow_conflict: z.boolean().optional().default(false),
}).superRefine((data, context) => {
  if (data.end_date < data.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_date'],
      message: 'End date must be on or after the start date',
    });
  }
  if (data.block_type === 'partner_booking' && !data.organization_name?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['organization_name'],
      message: 'Partner or organization is required for partner bookings',
    });
  }
});

export const availabilityBlockUpdateSchema = availabilityBlockInputSchema.and(
  z.object({
    expected_updated_at: z.string().datetime(),
  }),
);

export const availabilityBlockListSchema = z.object({
  start: dateOnly,
  end: dateOnly,
  include_cancelled: z.boolean().optional().default(false),
}).superRefine((data, context) => {
  if (data.end < data.start) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end'],
      message: 'End date must be on or after the start date',
    });
  }
});

export const availabilityBlockStatusSchema = z.enum(AVAILABILITY_BLOCK_STATUSES);
