'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SiteMediaRow {
  id: string;
  page_slug: string;
  section_key: string;
  label: string | null;
  image_url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  caption: string | null;
  is_active: boolean | null;
  recommended_width: number | null;
  recommended_height: number | null;
}

const sanitizeSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
const getPreviewImageSrc = (url: string | null) => (!url ? '/placeholder.jpg' : /^https?:\/\//.test(url) || url.startsWith('/') ? url : `/${url.replace(/^\/+/, '')}`);

export default function SiteMediaManager({ initialRows }: { initialRows: SiteMediaRow[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState(initialRows);
  const [pageFilter, setPageFilter] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});

  const pages = useMemo(() => ['all', ...Array.from(new Set(rows.map((r) => r.page_slug))).sort()], [rows]);
  const visibleRows = useMemo(() => rows.filter((r) => pageFilter === 'all' || r.page_slug === pageFilter), [rows, pageFilter]);

  const duplicateByPage = useMemo(() => {
    const result = new Set<string>();
    const grouped = new Map<string, Map<string, number>>();
    rows.forEach((row) => {
      if (!row.image_url) return;
      const pageMap = grouped.get(row.page_slug) || new Map<string, number>();
      pageMap.set(row.image_url, (pageMap.get(row.image_url) ?? 0) + 1);
      grouped.set(row.page_slug, pageMap);
    });
    grouped.forEach((urlMap, page) => urlMap.forEach((count, url) => count > 1 && result.add(`${page}:${url}`)));
    return result;
  }, [rows]);

  const updateRow = (id: string, patch: Partial<SiteMediaRow>) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const uploadFile = async (row: SiteMediaRow, file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) throw new Error('Only JPG, PNG, WebP, and GIF files are allowed.');
    if (file.size > 10 * 1024 * 1024) throw new Error('File size must be 10 MB or less.');

    setBusyById((b) => ({ ...b, [row.id]: true }));
    setMessage(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${sanitizeSlug(row.page_slug)}/${row.section_key}/${Date.now()}-${row.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      updateRow(row.id, { image_url: data.publicUrl, storage_path: path });
      setMessage({ type: 'success', text: `Uploaded image for ${row.page_slug}/${row.section_key}. Click Save to persist.` });
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  const saveRow = async (row: SiteMediaRow) => {
    setBusyById((b) => ({ ...b, [row.id]: true }));
    setMessage(null);
    try {
      const res = await fetch('/api/admin/site-media', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ row }) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save row.');
      setMessage({ type: 'success', text: `Saved ${row.page_slug}/${row.section_key}.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save row.' });
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  return <div className="space-y-4">
    {message && <div className={`rounded-lg border p-3 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{message.text}</div>}
    <div className="max-w-xs">
      <Select value={pageFilter} onValueChange={setPageFilter}>
        <SelectTrigger><SelectValue placeholder="Filter by page" /></SelectTrigger>
        <SelectContent>{pages.map((page) => <SelectItem key={page} value={page}>{page === 'all' ? 'All pages' : page}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    {visibleRows.map((row) => (
      <div key={row.id} className="rounded-lg border bg-white p-4 space-y-4">
        <div className="grid md:grid-cols-[220px_1fr] gap-4">
          <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
            <Image src={getPreviewImageSrc(row.image_url)} alt={row.alt_text || `${row.section_key} image`} fill className="object-cover" unoptimized />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={row.page_slug} disabled />
            <Input value={row.section_key} disabled />
            <Input value={row.label || ''} onChange={(e) => updateRow(row.id, { label: e.target.value })} placeholder="Label" />
            <Input value={row.alt_text || ''} onChange={(e) => updateRow(row.id, { alt_text: e.target.value })} placeholder="Alt text (required when image exists)" />
            <Input value={row.caption || ''} onChange={(e) => updateRow(row.id, { caption: e.target.value })} placeholder="Caption" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!row.is_active} onChange={(e) => updateRow(row.id, { is_active: e.target.checked })} /> Active</label>
            <p className="text-sm text-muted-foreground sm:col-span-2">Recommended: {row.recommended_width || '-'} × {row.recommended_height || '-'}</p>
          </div>
        </div>
        {row.image_url && duplicateByPage.has(`${row.page_slug}:${row.image_url}`) && <p className="text-amber-700 text-sm">Warning: duplicate image URL detected on this page.</p>}
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">Upload / Replace
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && uploadFile(row, e.target.files[0]).catch((err) => setMessage({ type: 'error', text: err.message }))} />
          </label>
          <Button onClick={() => saveRow(row)} disabled={!!busyById[row.id]}>{busyById[row.id] ? <><Spinner className="mr-2" />Saving...</> : 'Save'}</Button>
        </div>
      </div>
    ))}
  </div>;
}
