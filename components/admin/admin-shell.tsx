'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  CalendarDays,
  ChevronRight,
  Image as ImageIcon,
  LogOut,
  MapPinned,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: House, match: 'quotes' },
  { href: '/admin/calendar', label: 'Booking Calendar', icon: CalendarDays },
  { href: '/admin/pricing', label: 'Pricing & Settings', icon: SlidersHorizontal },
  { href: '/admin/site-media', label: 'Media', icon: ImageIcon },
  { href: '/admin/distance-settings', label: 'Distance', icon: MapPinned },
] as const;

const routeLabels: Record<string, string> = {
  admin: 'Dashboard',
  quotes: 'Quotes',
  calendar: 'Booking Calendar',
  pricing: 'Pricing & Settings',
  'site-media': 'Media',
  settings: 'Pricing & Settings',
  'distance-settings': 'Distance',
};

function isActiveRoute(pathname: string, item: (typeof navigation)[number]) {
  if (item.href === '/admin') {
    return pathname === '/admin' || pathname.startsWith('/admin/quotes/');
  }

  if (item.href === '/admin/pricing') {
    return pathname === '/admin/pricing' || pathname.startsWith('/admin/pricing/') || pathname === '/admin/settings';
  }

  if (item.href === '/admin/site-media' && pathname === '/admin/homepage-media') return true;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function AdminNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item);
        const link = (
          <Link
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2a263] focus-visible:ring-offset-2 focus-visible:ring-offset-[#152b3d]',
              active
                ? 'bg-white/10 text-white border-l-2 border-[#c2a263]'
                : 'text-[#dae1e7] hover:bg-white/10 hover:text-white border-l-2 border-transparent',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );

        return onNavigate ? <SheetClose asChild key={item.href}>{link}</SheetClose> : <div key={item.href}>{link}</div>;
      })}
    </nav>
  );
}

function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.slice(1).map((segment, index) => {
    const href = segment === 'quotes' ? '/admin' : `/${segments.slice(0, index + 2).join('/')}`;
    const isQuoteId = segments[index + 1] === 'quotes' && index > 0;
    const label = isQuoteId ? 'Quote detail' : routeLabels[segment] ?? segment.replaceAll('-', ' ');
    return { href, label };
  });

  if (pathname === '/admin') return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/admin"
            className="rounded-sm underline-offset-4 hover:text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              {current ? (
                <span aria-current="page" className="font-medium capitalize text-charcoal">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="rounded-sm capitalize underline-offset-4 hover:text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (pathname === '/admin/login') return <div className="admin-typography">{children}</div>;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Sign out failed. Please try again.');
      router.replace('/admin/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Sign out failed. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={cn("admin-typography min-h-screen bg-[#f6f3ef] text-charcoal", pathname.startsWith("/admin/quotes/") && "quote-desk-route")}>
      <a
        href="#admin-main"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        Skip to admin content
      </a>

      <header className="sticky top-0 z-40 border-b border-[#d9d1c8] bg-white lg:hidden">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-semibold leading-tight text-navy">
                Signature Luxe
              </span>
              <span className="block text-sm font-bold uppercase tracking-[0.12em] text-gold-text">
                Operations
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground lg:inline">Protected admin</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden min-h-10 text-red-700 hover:bg-red-50 hover:text-red-800 lg:inline-flex"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 border-[#c8b9a8] lg:hidden"
                  aria-label="Open admin navigation"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="admin-typography w-[min(90vw,22rem)] border-[#314658] bg-[#152b3d] p-0 text-white">
                <SheetHeader className="border-b border-[#e5e0db] p-5 text-left">
                  <SheetTitle className="font-serif text-xl text-white">Admin navigation</SheetTitle>
                  <SheetDescription className="text-slate-300">Quotes and operational settings</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <AdminNavigation pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                </div>
                <SheetFooter className="border-t border-[#e5e0db] p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="min-h-11 w-full justify-start border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {isLoggingOut ? 'Signing out…' : 'Sign out'}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="admin-shell-grid min-h-screen lg:grid">
        <aside className="admin-rail hidden lg:flex">
          <Link href="/admin" className="admin-wordmark">
            <span className="font-serif text-[1.8rem] leading-tight">Signature Luxe</span>
            {pathname.startsWith("/admin/quotes/") && <span className="desk-brand-subtitle">EVENTS &amp; AMENITIES</span>}
            <span className="mt-3 block text-xs text-[#dfc591]">Operations</span>
          </Link>
          <AdminNavigation pathname={pathname} />
          <Button type="button" variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className="mt-auto min-h-11 justify-start text-white hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" aria-hidden="true" />{isLoggingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </aside>

        <main id="admin-main" tabIndex={-1} className="admin-content min-w-0 px-4 py-5 focus:outline-none sm:px-6 lg:px-7 lg:py-6">
          {!pathname.startsWith("/admin/quotes/") && <AdminBreadcrumbs pathname={pathname} />}
          {logoutError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {logoutError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
