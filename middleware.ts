import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getSupabaseSetupError() {
  const urlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (urlConfigured && anonConfigured) return null;

  return 'Admin authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const setupError = getSupabaseSetupError();

  if (pathname === '/admin/login') {
    if (!setupError) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.headers.set('x-admin-setup-warning', setupError);
    return response;
  }

  if (setupError) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'setup_error');
    return NextResponse.redirect(loginUrl);
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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'auth_required');
    return NextResponse.redirect(loginUrl);
  }

  const { data: adminUser, error: adminLookupError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (adminLookupError || !adminUser) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'access_denied');
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
