import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Pricing & Settings',
  description: 'Manage centralized pricing and quote settings',
};

export default function AdminSettingsPage() {
  redirect('/admin/pricing');
}
