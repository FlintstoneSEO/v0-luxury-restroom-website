import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  availabilityBlockInputSchema,
  availabilityBlockListSchema,
} from '@/lib/availability-blocks/schema';
import {
  getAvailabilityBlockConflicts,
  getAvailabilityBlocksInRange,
} from '@/lib/availability-blocks/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const url = new URL(request.url);
  const parsed = availabilityBlockListSchema.safeParse({
    start: url.searchParams.get('start'),
    end: url.searchParams.get('end'),
    include_cancelled: url.searchParams.get('include_cancelled') === 'true',
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: 'INVALID_RANGE', message: 'Invalid availability block range.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const blocks = await getAvailabilityBlocksInRange(
      createAdminClient(),
      parsed.data.start,
      parsed.data.end,
      { includeCancelled: parsed.data.include_cancelled },
    );
    return NextResponse.json({ ok: true, blocks });
  } catch (error) {
    console.error('[admin/availability-blocks] GET failed', error);
    return NextResponse.json(
      { ok: false, code: 'BLOCKS_UNAVAILABLE', message: 'Availability blocks could not be loaded.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const parsed = availabilityBlockInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: 'INVALID_BLOCK', message: 'Review the block details and try again.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const conflicts = await getAvailabilityBlockConflicts(
      supabase,
      parsed.data.start_date,
      parsed.data.end_date,
    );
    const hasBlockingConflict =
      parsed.data.availability_effect === 'hard_block' &&
      (conflicts.hardBlocks.length > 0 || conflicts.blockingQuotes.length > 0);

    if (hasBlockingConflict && !parsed.data.allow_conflict) {
      return NextResponse.json(
        {
          ok: false,
          code: 'BLOCKING_COMMITMENT_CONFLICT',
          message: 'This range overlaps an existing blocking commitment. Review the conflict before creating the block.',
          requires_confirmation: true,
          conflicts,
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('availability_blocks')
      .insert({
        title: parsed.data.title,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        block_type: parsed.data.block_type,
        availability_effect: parsed.data.availability_effect,
        organization_name: parsed.data.organization_name || null,
        notes: parsed.data.notes || null,
        created_by: adminAuth.user.id,
        updated_by: adminAuth.user.id,
        ...(hasBlockingConflict && parsed.data.allow_conflict
          ? { conflict_override_at: now, conflict_override_by: adminAuth.user.id }
          : {}),
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === 'P0001' && error.message.includes('BLOCKING_COMMITMENT_CONFLICT')) {
        return NextResponse.json(
          { ok: false, code: 'BLOCKING_COMMITMENT_CONFLICT', message: 'A conflicting commitment was created while you were saving. Review the calendar and try again.', requires_confirmation: true },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json(
      { ok: true, block: data, warnings: { active_request_count: conflicts.activeRequests.length } },
      { status: 201 },
    );
  } catch (error) {
    console.error('[admin/availability-blocks] POST failed', error);
    return NextResponse.json(
      { ok: false, code: 'BLOCK_CREATE_FAILED', message: 'The availability block could not be created.' },
      { status: 500 },
    );
  }
}

