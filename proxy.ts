import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getSupabaseSetupError() {
  const urlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (urlConfigured && anonConfigured) return null;

  return 'Admin authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    const setupError = getSupabaseSetupError();

    if (!setupError) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.headers.set('x-admin-setup-warning', setupError);
    return response;
  }

  const setupError = getSupabaseSetupError();
  if (setupError) {
    if (process.env.NODE_ENV === 'production') {
      if (isAdminApi) {
        return NextResponse.json(
          { ok: false, error: 'Admin setup incomplete', message: setupError },
          { status: 503 },
        );
      }

      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('setup', 'supabase_env_missing');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Admin setup incomplete',
        message: setupError,
      },
      { status: 503 },
    );
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (user.app_metadata?.is_admin !== true) {
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
