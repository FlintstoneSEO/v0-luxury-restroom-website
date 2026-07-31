import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFutureBookedDates } from '@/lib/availability-server';
import { getLocalTodayDateOnly } from '@/lib/date-only';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const bookedDates = await getFutureBookedDates(
      supabase,
      getLocalTodayDateOnly(),
    );

    return NextResponse.json(
      { ok: true, bookedDates },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error('[booked-dates] Failed to load availability:', error);
    return NextResponse.json(
      {
        ok: false,
        code: 'AVAILABILITY_UNAVAILABLE',
        message: 'Availability could not be loaded. Please try again.',
      },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
