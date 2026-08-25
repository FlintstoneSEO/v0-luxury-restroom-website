import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { availabilityBlockUpdateSchema } from '@/lib/availability-blocks/schema';
import { getAvailabilityBlockConflicts } from '@/lib/availability-blocks/server';

const idSchema = z.string().uuid();
const cancelSchema = z.object({ expected_updated_at: z.string().datetime() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;
  const { blockId } = await params;
  if (!idSchema.safeParse(blockId).success) {
    return NextResponse.json({ ok: false, code: 'INVALID_BLOCK_ID', message: 'Invalid block ID.' }, { status: 400 });
  }

  const parsed = availabilityBlockUpdateSchema.safeParse(await request.json());
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
      { excludeBlockId: blockId },
    );
    const hasBlockingConflict =
      parsed.data.availability_effect === 'hard_block' &&
      (conflicts.hardBlocks.length > 0 || conflicts.blockingQuotes.length > 0);
    if (hasBlockingConflict && !parsed.data.allow_conflict) {
      return NextResponse.json(
        {
          ok: false,
          code: 'BLOCKING_COMMITMENT_CONFLICT',
          message: 'This range overlaps an existing blocking commitment. Review the conflict before saving.',
          requires_confirmation: true,
          conflicts,
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('availability_blocks')
      .update({
        title: parsed.data.title,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        block_type: parsed.data.block_type,
        availability_effect: parsed.data.availability_effect,
        organization_name: parsed.data.organization_name || null,
        notes: parsed.data.notes || null,
        updated_by: adminAuth.user.id,
        updated_at: now,
        conflict_override_at: hasBlockingConflict && parsed.data.allow_conflict ? now : null,
        conflict_override_by: hasBlockingConflict && parsed.data.allow_conflict ? adminAuth.user.id : null,
      })
      .eq('id', blockId)
      .eq('status', 'active')
      .eq('updated_at', parsed.data.expected_updated_at)
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === 'P0001' && error.message.includes('BLOCKING_COMMITMENT_CONFLICT')) {
        return NextResponse.json(
          { ok: false, code: 'BLOCKING_COMMITMENT_CONFLICT', message: 'A conflicting commitment was created while you were saving.', requires_confirmation: true },
          { status: 409 },
        );
      }
      throw error;
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, code: 'BLOCK_UPDATED', message: 'This block changed in another session. Reload before saving your changes.' },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, block: data, warnings: { active_request_count: conflicts.activeRequests.length } });
  } catch (error) {
    console.error('[admin/availability-blocks] PATCH failed', error);
    return NextResponse.json({ ok: false, code: 'BLOCK_UPDATE_FAILED', message: 'The availability block could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;
  const { blockId } = await params;
  if (!idSchema.safeParse(blockId).success) {
    return NextResponse.json({ ok: false, code: 'INVALID_BLOCK_ID', message: 'Invalid block ID.' }, { status: 400 });
  }

  const parsed = cancelSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'INVALID_CANCEL', message: 'The block version is required.' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('availability_blocks')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        cancelled_by: adminAuth.user.id,
        updated_at: now,
        updated_by: adminAuth.user.id,
      })
      .eq('id', blockId)
      .eq('status', 'active')
      .eq('updated_at', parsed.data.expected_updated_at)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { ok: false, code: 'BLOCK_UPDATED', message: 'This block changed or was already removed. Reload the calendar.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, block: data });
  } catch (error) {
    console.error('[admin/availability-blocks] DELETE failed', error);
    return NextResponse.json({ ok: false, code: 'BLOCK_CANCEL_FAILED', message: 'The availability block could not be removed.' }, { status: 500 });
  }
}

