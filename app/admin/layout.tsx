'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center font-bold">
                  SL
                </div>
                <span className="font-serif font-semibold text-navy text-lg hidden sm:inline">
                  Admin Portal
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-navy transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/settings"
                className="text-muted-foreground hover:text-navy transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-[#f8f5f1] rounded-lg"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-navy" />
              ) : (
                <Menu className="w-6 h-6 text-navy" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gold/20 py-4 space-y-3">
              <Link
                href="/admin"
                className="block px-4 py-2 text-muted-foreground hover:text-navy hover:bg-[#f8f5f1] rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 text-muted-foreground hover:text-navy hover:bg-[#f8f5f1] rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-none px-4 md:px-6 lg:px-8 xl:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
