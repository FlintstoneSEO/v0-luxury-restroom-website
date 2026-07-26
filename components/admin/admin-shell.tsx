'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ChevronRight,
  Image as ImageIcon,
  LogOut,
  MapPinned,
  Menu,
  Settings,
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
  { href: '/admin', label: 'Dashboard', icon: BarChart3, match: 'quotes' },
  { href: '/admin/pricing', label: 'Pricing', icon: SlidersHorizontal },
  { href: '/admin/site-media', label: 'Media', icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/distance-settings', label: 'Distance', icon: MapPinned },
] as const;

const routeLabels: Record<string, string> = {
  admin: 'Dashboard',
  quotes: 'Quotes',
  pricing: 'Pricing',
  'site-media': 'Media',
  settings: 'Settings',
  'distance-settings': 'Distance',
};

function isActiveRoute(pathname: string, item: (typeof navigation)[number]) {
  if (item.href === '/admin') {
    return pathname === '/admin' || pathname.startsWith('/admin/quotes/');
  }

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
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
              active
                ? 'bg-navy text-white shadow-sm'
                : 'text-charcoal hover:bg-cream hover:text-navy',
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

  if (pathname === '/admin/login') return children;

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
    <div className="min-h-screen bg-[#f6f3ef] text-charcoal">
      <a
        href="#admin-main"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        Skip to admin content
      </a>

      <header className="sticky top-0 z-40 border-b border-[#d9d1c8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            <Image
              src="/favicon.ico"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-lg border border-[#d9d1c8]"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-semibold leading-tight text-navy">
                Signature Luxe
              </span>
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-text">
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
              <SheetContent side="right" className="w-[min(90vw,22rem)] border-[#d9d1c8] bg-white p-0">
                <SheetHeader className="border-b border-[#e5e0db] p-5 text-left">
                  <SheetTitle className="font-serif text-xl text-navy">Admin navigation</SheetTitle>
                  <SheetDescription>Quotes and operational settings</SheetDescription>
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

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#d9d1c8] bg-white p-4 lg:block">
          <div className="sticky top-20">
            <p className="mb-3 px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Operations console
            </p>
            <AdminNavigation pathname={pathname} />
          </div>
        </aside>

        <main id="admin-main" tabIndex={-1} className="min-w-0 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8">
          <AdminBreadcrumbs pathname={pathname} />
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
