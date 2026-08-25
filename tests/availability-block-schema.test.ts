import { describe, expect, it } from 'vitest';
import {
  availabilityBlockInputSchema,
  availabilityBlockUpdateSchema,
} from '@/lib/availability-blocks/schema';

const validBlock = {
  title: 'Lions Tailgate Weekend 1',
  start_date: '2026-09-11',
  end_date: '2026-09-13',
  block_type: 'partner_booking' as const,
  availability_effect: 'hard_block' as const,
  organization_name: 'XYZ Tailgating',
  notes: 'Delivery through pickup.',
};

describe('availability block validation', () => {
  it('accepts an inclusive multi-day partner block', () => {
    const result = availabilityBlockInputSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.allow_conflict).toBe(false);
  });

  it('rejects invalid and reversed date ranges', () => {
    expect(availabilityBlockInputSchema.safeParse({
      ...validBlock,
      start_date: '2026-02-30',
    }).success).toBe(false);
    expect(availabilityBlockInputSchema.safeParse({
      ...validBlock,
      start_date: '2026-09-14',
      end_date: '2026-09-13',
    }).success).toBe(false);
  });

  it('requires an organization for partner bookings', () => {
    expect(availabilityBlockInputSchema.safeParse({
      ...validBlock,
      organization_name: null,
    }).success).toBe(false);
  });

  it('requires an optimistic-concurrency timestamp for updates', () => {
    expect(availabilityBlockUpdateSchema.safeParse(validBlock).success).toBe(false);
    expect(availabilityBlockUpdateSchema.safeParse({
      ...validBlock,
      expected_updated_at: '2026-08-25T12:00:00.000Z',
    }).success).toBe(true);
  });
});
