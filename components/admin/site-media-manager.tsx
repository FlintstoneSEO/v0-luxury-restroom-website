'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';

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

const usedOnMap: Record<string, string> = {
  hero: 'Main banner image at the top of the page.',
  feature: 'Supporting image inside the main page content.',
  intro: 'Introductory section image near the top of the page.',
  trailer_exterior: 'Exterior trailer image used in the trailer details section.',
  trailer_interior: 'Interior amenity image used in the trailer details section.',
  weddings: 'Homepage wedding event card image.',
  private_parties: 'Homepage private parties event card image.',
  corporate_events: 'Homepage corporate events card image.',
  festivals: 'Homepage festivals card image.',
  special_events: 'Homepage special events card image.',
  trailer_gallery: 'Homepage trailer gallery image.',
  gallery_feature: 'Featured image on the gallery page.',
};

const PAGE_GROUPS = [
  { group: 'Homepage', pages: ['home'] },
  { group: 'Start Here', pages: ['start-here'] },
  { group: 'Luxury Restroom Trailers', pages: ['luxury-restroom-trailers'] },
  { group: 'Event Types', pages: ['weddings', 'private-parties', 'corporate-events', 'festivals', 'special-events'] },
  { group: 'Core Pages', pages: ['gallery', 'faq', 'contact', 'service-areas'] },
];

export default function SiteMediaManager({ initialRows }: { initialRows: SiteMediaRow[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState(initialRows);
  const [originalRows, setOriginalRows] = useState(initialRows);
  const [selectedPage, setSelectedPage] = useState('all');
  const [showGuide, setShowGuide] = useState(false);
  const [search, setSearch] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'missing'>('all');
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});

  const duplicates = useMemo(() => {
    const byPage = new Map<string, Map<string, number>>();
    rows.forEach((row) => {
      if (!row.image_url) return;
      const current = byPage.get(row.page_slug) ?? new Map<string, number>();
      current.set(row.image_url, (current.get(row.image_url) ?? 0) + 1);
      byPage.set(row.page_slug, current);
    });
    return byPage;
  }, [rows]);

  const rowWarnings = (row: SiteMediaRow) => {
    const warnings: string[] = [];
    if (!row.image_url) warnings.push('Missing Image');
    if (row.image_url && !row.alt_text?.trim()) warnings.push('Missing Alt Text');
    if (row.image_url && (duplicates.get(row.page_slug)?.get(row.image_url) ?? 0) > 1) warnings.push('Duplicate Image');
    if (!row.is_active) warnings.push('Inactive');
    const normalized = `${row.label ?? ''} ${row.alt_text ?? ''}`.toLowerCase();
    if (row.page_slug.includes('weddings') && normalized.includes('corporate')) warnings.push('Content mismatch: wedding page mentions corporate');
    if (row.page_slug.includes('corporate') && normalized.includes('wedding')) warnings.push('Content mismatch: corporate page mentions wedding');
    return warnings;
  };

  const pages = useMemo(() => ['all', ...Array.from(new Set(rows.map((r) => r.page_slug))).sort()], [rows]);
  const pageStats = useMemo(() => {
    const map = new Map<string, { slots: number; issues: number }>();
    rows.forEach((row) => {
      const stats = map.get(row.page_slug) ?? { slots: 0, issues: 0 };
      stats.slots += 1;
      if (rowWarnings(row).length > 0) stats.issues += 1;
      map.set(row.page_slug, stats);
    });
    return map;
  }, [rows]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (selectedPage !== 'all' && row.page_slug !== selectedPage) return false;
    if (issuesOnly && rowWarnings(row).length === 0) return false;
    if (statusFilter === 'active' && !row.is_active) return false;
    if (statusFilter === 'inactive' && row.is_active) return false;
    if (statusFilter === 'missing' && !!row.image_url) return false;
    if (!search.trim()) return true;
    const haystack = [row.page_slug, row.section_key, row.label, row.alt_text, row.caption].join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [rows, selectedPage, issuesOnly, statusFilter, search]);

  const dirtyIds = useMemo(() => new Set(rows.filter((row) => {
    const original = originalRows.find((item) => item.id === row.id);
    return JSON.stringify(original) !== JSON.stringify(row);
  }).map((row) => row.id)), [rows, originalRows]);

  const summary = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.is_active).length,
    missing: rows.filter((r) => !r.image_url).length,
    missingAlt: rows.filter((r) => r.image_url && !r.alt_text?.trim()).length,
    duplicate: rows.filter((r) => r.image_url && (duplicates.get(r.page_slug)?.get(r.image_url) ?? 0) > 1).length,
    inactive: rows.filter((r) => !r.is_active).length,
  }), [rows, duplicates]);

  const updateRow = (id: string, patch: Partial<SiteMediaRow>) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const notify = (text: string) => window.dispatchEvent(new CustomEvent('site-media-toast', { detail: text }));

  const uploadFile = async (row: SiteMediaRow, file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) throw new Error('Upload failed. File must be JPG, PNG, WebP, or GIF.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Upload failed. File must be under 10 MB.');

    setBusyById((b) => ({ ...b, [row.id]: true }));
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${sanitizeSlug(row.page_slug)}/${row.section_key}/${Date.now()}-${row.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      updateRow(row.id, { image_url: `${data.publicUrl}?v=${Date.now()}`, storage_path: path });
      notify('Image uploaded successfully. Don’t forget to save changes.');
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  const saveRow = async (row: SiteMediaRow) => {
    if (row.image_url && !row.alt_text?.trim()) throw new Error('Alt text is required before saving.');
    setBusyById((b) => ({ ...b, [row.id]: true }));
    try {
      const res = await fetch('/api/admin/site-media', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ row }) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save row.');
      setOriginalRows((prev) => prev.map((item) => (item.id === row.id ? row : item)));
      notify('Changes saved.');
    } finally {
      setBusyById((b) => ({ ...b, [row.id]: false }));
    }
  };

  const saveAllChanges = async () => {
    for (const row of rows.filter((r) => dirtyIds.has(r.id))) {
      await saveRow(row);
    }
  };

  return <div className="space-y-5">
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">Site Media Manager</CardTitle>
          <p className="text-sm text-muted-foreground">Manage every image used across the website from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><a href="/" target="_blank" rel="noreferrer">View Website</a></Button>
          <Button variant="outline" onClick={() => setRows([...rows])}>Refresh Media</Button>
          <Button variant="outline" onClick={() => setShowGuide((v) => !v)}>How This Works</Button>
        </div>
      </CardHeader>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{Object.entries({ 'Total image slots': summary.total, 'Active images': summary.active, 'Missing images': summary.missing, 'Missing alt text': summary.missingAlt, 'Duplicate images': summary.duplicate, 'Inactive images': summary.inactive }).map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p></CardContent></Card>)}</div>

    {showGuide && <Card><CardContent className="p-4 text-sm space-y-2"><p className="font-medium">How to Use This Page</p><ol className="list-decimal pl-5 space-y-1"><li>Choose a page from the sidebar.</li><li>Review each image slot for that page.</li><li>Use Upload / Replace to select the correct image.</li><li>Make sure the alt text describes the image and includes the page context.</li><li>Click Save Changes.</li><li>Use View Live Page to confirm the image appears correctly.</li></ol><p className="text-muted-foreground">Tip: Each image slot controls a specific section of the public website. For example, Wedding Page Hero controls the large image at the top of the Wedding Restroom Trailer page.</p></CardContent></Card>}

    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit"><CardContent className="p-3 space-y-2">{PAGE_GROUPS.map((group) => <div key={group.group}><p className="text-xs uppercase text-muted-foreground mb-1">{group.group}</p>{group.pages.map((page) => {
        const stats = pageStats.get(page);
        if (!stats && !pages.includes(page)) return null;
        return <button key={page} type="button" onClick={() => setSelectedPage(page)} className={`w-full flex items-center justify-between rounded-md border px-3 py-2 mb-1 text-left ${selectedPage === page ? 'bg-slate-100 border-slate-300' : 'bg-white'}`}><span>{page}</span><span className="flex items-center gap-2"><Badge variant="secondary">{stats?.slots ?? 0}</Badge>{(stats?.issues ?? 0) > 0 && <Badge variant="destructive">{stats?.issues}</Badge>}</span></button>;
      })}</div>)}<button className="w-full rounded-md border px-3 py-2" onClick={() => setSelectedPage('all')}>All pages</button></CardContent></Card>

      <div className="space-y-4">
        <Card><CardContent className="p-3 grid gap-3 md:grid-cols-3"><Input placeholder="Search by page, section, label, alt text, caption" value={search} onChange={(e) => setSearch(e.target.value)} /><label className="flex items-center gap-2 text-sm">Show Issues Only<Switch checked={issuesOnly} onCheckedChange={setIssuesOnly} /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'missing')} className="rounded-md border px-3 py-2 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="missing">Missing Image</option></select></CardContent></Card>

        {filteredRows.map((row) => {
          const warnings = rowWarnings(row);
          return <Card key={row.id} className="shadow-sm border-slate-200"><CardHeader className="space-y-2"><div className="flex flex-wrap items-center gap-2"><CardTitle className="text-lg">{row.label || 'Untitled slot'}</CardTitle>{dirtyIds.has(row.id) && <Badge>Unsaved</Badge>}{row.is_active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}{warnings.map((w) => <Badge key={w} variant="destructive">{w}</Badge>)}</div><p className="text-xs text-muted-foreground">{row.page_slug} · {row.section_key}</p><p className="text-xs text-muted-foreground">Used On: {usedOnMap[row.section_key] ?? 'This image is used in a website section identified by this section key.'}</p></CardHeader><CardContent className="space-y-3"><div className="grid md:grid-cols-2 gap-3"><div className="relative aspect-[4/3] rounded-md overflow-hidden border bg-muted"><Image src={getPreviewImageSrc(row.image_url)} alt={row.alt_text || `${row.section_key} image`} fill className="object-cover" unoptimized /></div><div className="space-y-2 text-sm"><Input value={row.alt_text || ''} onChange={(e) => updateRow(row.id, { alt_text: e.target.value })} placeholder="Alt text" /><Input value={row.caption || ''} onChange={(e) => updateRow(row.id, { caption: e.target.value })} placeholder="Caption" /><label className="flex items-center gap-2">Active <Switch checked={!!row.is_active} onCheckedChange={(checked) => updateRow(row.id, { is_active: checked })} /></label><p className="text-xs text-muted-foreground">Recommended dimensions: {row.recommended_width || '-'} × {row.recommended_height || '-'}</p><p className="text-xs text-muted-foreground break-all">Storage path: {row.storage_path || 'Not set'}</p></div></div>
          <label className="block rounded-md border-2 border-dashed p-4 text-sm cursor-pointer">Drop image here or click to upload<br />JPG, PNG, WebP, or GIF · Max 10 MB<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && uploadFile(row, e.target.files[0]).catch((err) => notify(err.message))} /></label>
          <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><a href={`/${row.page_slug}`} target="_blank" rel="noreferrer">View Live Page</a></Button>{row.image_url && <Button variant="outline" asChild><a href={row.image_url} target="_blank" rel="noreferrer">Open Image</a></Button>}<Button onClick={() => saveRow(row).catch((e) => notify(e.message))} disabled={!!busyById[row.id]}>{busyById[row.id] ? <><Spinner className="mr-2" />Saving...</> : 'Save Changes'}</Button></div>
          </CardContent></Card>;
        })}

        <Card><CardHeader><CardTitle className="text-base">Image Matching Guide</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p>Weddings: Use wedding venues, ceremonies, reception setups, daytime or elegant outdoor scenes.</p><p>Private Parties: Use backyard parties, reunions, graduation parties, and family gatherings.</p><p>Corporate Events: Use tailgates, branded events, office parties, networking events, and business settings.</p><p>Festivals: Use community crowds, outdoor vendor areas, fairs, and public events.</p><p>Special Events: Use galas, fundraisers, formal gatherings, and upscale celebrations.</p><p>Trailer pages: Use actual trailer exterior and interior images.</p><p>Service Areas: Use broad service/location imagery and avoid mismatched event-type photos.</p></CardContent></Card>
      </div>
    </div>

    {dirtyIds.size > 0 && <div className="sticky bottom-3 z-20 rounded-lg border bg-white/95 p-3 shadow-lg flex flex-wrap items-center justify-between gap-3"><p className="text-sm">You have {dirtyIds.size} unsaved changes</p><div className="flex gap-2"><Button onClick={() => saveAllChanges().catch((e) => notify(e.message))}>Save All Changes</Button><Button variant="outline" onClick={() => setRows(originalRows)}>Discard Changes</Button></div></div>}
    <ToastMount />
  </div>;
}

function ToastMount() {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setMessages((prev) => [...prev, detail]);
      setTimeout(() => setMessages((prev) => prev.slice(1)), 2600);
    };
    window.addEventListener('site-media-toast', handler);
    return () => window.removeEventListener('site-media-toast', handler);
  }, []);

  return <div className="fixed top-4 right-4 z-50 space-y-2">{messages.map((msg, idx) => <div key={`${msg}-${idx}`} className="rounded-md border bg-white px-3 py-2 text-sm shadow">{msg}</div>)}</div>;
}
