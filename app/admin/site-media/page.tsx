import SiteMediaManager from '@/components/admin/site-media-manager';
import { fetchAllSiteMedia } from '@/lib/site-media';

export const metadata = {
  title: 'Site Media Manager | Admin | Signature Luxe',
  description: 'Manage site-wide imagery from the admin dashboard.',
};

export default async function AdminSiteMediaPage() {
  const rows = await fetchAllSiteMedia();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#2d3a47] mb-2">Site Media Manager</h1>
        <p className="text-muted-foreground">Upload, replace, and manage images for every page and section.</p>
      </div>
      <SiteMediaManager initialRows={rows as any} />
    </div>
  );
}
