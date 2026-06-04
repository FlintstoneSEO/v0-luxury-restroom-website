import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
