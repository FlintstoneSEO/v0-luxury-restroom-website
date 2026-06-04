import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: 'This legacy quote response endpoint has been retired. Please use the secure quote approval link from your latest quote email.',
    },
    { status: 410 }
  );
}
