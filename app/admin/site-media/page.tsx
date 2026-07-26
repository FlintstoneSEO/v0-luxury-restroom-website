import SiteMediaManager from '@/components/admin/site-media-manager';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { fetchAllSiteMedia } from '@/lib/site-media';

export const metadata = {
  title: 'Site Media Manager',
  description: 'Manage site-wide imagery from the admin dashboard.',
};

export default async function AdminSiteMediaPage() {
  const rows = await fetchAllSiteMedia();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content operations"
        title="Site Media Manager"
        description="Upload, replace, and manage images for every page and section."
      />
      <SiteMediaManager initialRows={rows as any} />
    </div>
  );
}
