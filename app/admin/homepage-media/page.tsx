import { createClient } from '@/lib/supabase/server';
import HomepageMediaManager from '@/components/admin/homepage-media-manager';

export const metadata = {
  title: 'Homepage Media | Admin | Signature Luxe',
  description: 'Manage homepage imagery from the admin dashboard.',
};

export default async function AdminHomepageMediaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('homepage_media').select('*').order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#2d3a47] mb-2">Homepage Media</h1>
        <p className="text-muted-foreground">Upload, replace, and manage all homepage images.</p>
      </div>
      <HomepageMediaManager initialRows={(data || []) as any} />
    </div>
  );
}
