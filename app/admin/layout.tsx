import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: {
    default: 'Admin | Signature Luxe',
    template: '%s | Signature Luxe',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
