import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    let supabaseResponse = request.nextResponse.next({
      request,
    });

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

    // If no user, redirect to login
    if (!user) {
      return request.nextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is admin (has is_admin metadata)
    const isAdmin = user.user_metadata?.is_admin === true;
    if (!isAdmin) {
      // Redirect non-admins to home page
      return request.nextResponse.redirect(new URL('/', request.url));
    }

    return supabaseResponse;
  }

  return request.nextResponse.next({
    request,
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
