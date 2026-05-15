'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface HomepageMediaRow {
  id: string;
  section_key: string;
  label: string | null;
  image_url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  recommended_width: number | null;
  recommended_height: number | null;
}

export default function HomepageMediaManager({ initialRows }: { initialRows: HomepageMediaRow[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState(initialRows);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});
  const duplicateUrls = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((r) => r.image_url && counts.set(r.image_url, (counts.get(r.image_url) ?? 0) + 1));
    return new Set(Array.from(counts.entries()).filter(([, c]) => c > 1).map(([url]) => url));
  }, [rows]);

  const updateRow = (id: string, patch: Partial<HomepageMediaRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const uploadFile = async (row: HomepageMediaRow, file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) throw new Error('Only JPG, PNG, WebP, and GIF files are allowed.');
    if (file.size > 10 * 1024 * 1024) throw new Error('File size must be 10 MB or less.');

    setBusyById((b) => ({ ...b, [row.id]: true }));
    setMessage(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${row.section_key}/${Date.now()}-${row.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('homepage-media').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('homepage-media').getPublicUrl(path);
      updateRow(row.id, { image_url: data.publicUrl, storage_path: path });
      setMessage({ type: 'success', text: `Uploaded image for ${row.section_key}. Click Save to persist.` });
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  const saveRow = async (row: HomepageMediaRow) => {
    if (!row.alt_text?.trim()) {
      setMessage({ type: 'error', text: `Alt text is required for ${row.section_key}.` });
      return;
    }
    setBusyById((b) => ({ ...b, [row.id]: true }));
    setMessage(null);
    try {
      const res = await fetch('/api/admin/homepage-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save row.');
      setMessage({ type: 'success', text: `Saved ${row.section_key}.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save row.' });
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {message && <div className={`rounded-lg border p-3 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{message.text}</div>}
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border bg-white p-4 space-y-4">
          <div className="grid md:grid-cols-[220px_1fr] gap-4">
            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
              <Image src={row.image_url || '/placeholder.jpg'} alt={row.alt_text || `${row.section_key} image`} fill className="object-cover" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input value={row.label || ''} onChange={(e) => updateRow(row.id, { label: e.target.value })} placeholder="Label" />
              <Input value={row.section_key} disabled />
              <Input value={row.alt_text || ''} onChange={(e) => updateRow(row.id, { alt_text: e.target.value })} placeholder="Alt text (required)" />
              <Input value={row.caption || ''} onChange={(e) => updateRow(row.id, { caption: e.target.value })} placeholder="Caption" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!row.is_active} onChange={(e) => updateRow(row.id, { is_active: e.target.checked })} /> Active</label>
              <p className="text-sm text-muted-foreground">Recommended: {row.recommended_width || '-'} × {row.recommended_height || '-'}</p>
            </div>
          </div>
          {row.image_url && duplicateUrls.has(row.image_url) && (
            <p className="text-amber-700 text-sm">Warning: this same image URL is currently used in multiple sections.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
              Upload / Replace
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && uploadFile(row, e.target.files[0]).catch((err) => setMessage({ type: 'error', text: err.message }))} />
            </label>
            <Button onClick={() => saveRow(row)} disabled={!!busyById[row.id]}>{busyById[row.id] ? <><Spinner className="mr-2" />Saving...</> : 'Save'}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
