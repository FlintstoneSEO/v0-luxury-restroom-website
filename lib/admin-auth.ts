import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type AdminAuthSuccess = {
  ok: true;
  user: {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
  };
};

type AdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireAdminUser(): Promise<AdminAuthSuccess | AdminAuthFailure> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 }),
      };
    }

    if (user.app_metadata?.is_admin !== true) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }),
      };
    }

    return { ok: true, user };
  } catch (error) {
    console.error('[admin-auth] Failed to validate admin user', error);
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unable to validate admin session' }, { status: 500 }),
    };
  }
}
