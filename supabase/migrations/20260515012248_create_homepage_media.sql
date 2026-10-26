-- Homepage media management for Signature Luxe Events & Amenities
-- Creates a public-readable media table, admin-manageable records, and a Supabase Storage bucket for homepage imagery.

create extension if not exists pgcrypto;

create table if not exists public.homepage_media (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  label text not null,
  image_url text,
  storage_bucket text not null default 'homepage-media',
  storage_path text,
  alt_text text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  recommended_width integer,
  recommended_height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,

  constraint homepage_media_section_key_unique unique (section_key),
  constraint homepage_media_section_key_format check (section_key ~ '^[a-z0-9_\-]+$'),
  constraint homepage_media_alt_text_length check (char_length(trim(alt_text)) >= 12),
  constraint homepage_media_image_source_check check (image_url is not null or storage_path is not null)
);

comment on table public.homepage_media is 'Editable homepage image slots managed from the admin dashboard.';
comment on column public.homepage_media.section_key is 'Stable key used by the frontend, such as hero, weddings, private_parties, corporate_events, festivals, special_events, trailer_gallery.';
comment on column public.homepage_media.image_url is 'Public image URL. May be generated from Supabase Storage or manually provided.';
comment on column public.homepage_media.storage_path is 'Path inside the homepage-media storage bucket when using Supabase Storage.';
comment on column public.homepage_media.alt_text is 'SEO-friendly image alt text. Required for accessibility and local SEO.';

create index if not exists homepage_media_active_sort_idx
  on public.homepage_media (is_active, sort_order);

create index if not exists homepage_media_section_key_idx
  on public.homepage_media (section_key);

create or replace function public.set_homepage_media_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_homepage_media_updated_at on public.homepage_media;
create trigger set_homepage_media_updated_at
before update on public.homepage_media
for each row
execute function public.set_homepage_media_updated_at();

alter table public.homepage_media enable row level security;

-- The homepage needs to read active media records without requiring a login.
drop policy if exists "Public can read active homepage media" on public.homepage_media;
create policy "Public can read active homepage media"
on public.homepage_media
for select
to anon, authenticated
using (is_active = true);

-- Authenticated admin users can manage records. The app should still restrict the admin UI by its existing admin auth checks.
drop policy if exists "Authenticated users can insert homepage media" on public.homepage_media;
create policy "Authenticated users can insert homepage media"
on public.homepage_media
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update homepage media" on public.homepage_media;
create policy "Authenticated users can update homepage media"
on public.homepage_media
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete homepage media" on public.homepage_media;
create policy "Authenticated users can delete homepage media"
on public.homepage_media
for delete
to authenticated
using (true);

-- Create public storage bucket for homepage media.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-media',
  'homepage-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public can read images from the homepage-media bucket.
drop policy if exists "Public can read homepage media images" on storage.objects;
create policy "Public can read homepage media images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'homepage-media');

-- Authenticated users can upload/update/delete homepage media images.
drop policy if exists "Authenticated users can upload homepage media images" on storage.objects;
create policy "Authenticated users can upload homepage media images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'homepage-media');

drop policy if exists "Authenticated users can update homepage media images" on storage.objects;
create policy "Authenticated users can update homepage media images"
on storage.objects
for update
to authenticated
using (bucket_id = 'homepage-media')
with check (bucket_id = 'homepage-media');

drop policy if exists "Authenticated users can delete homepage media images" on storage.objects;
create policy "Authenticated users can delete homepage media images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'homepage-media');

-- Seed the editable homepage slots with fallback paths. Codex should update these paths to match the repo's actual current images if needed.
insert into public.homepage_media (
  section_key,
  label,
  image_url,
  storage_bucket,
  storage_path,
  alt_text,
  caption,
  sort_order,
  is_active,
  recommended_width,
  recommended_height
)
values
  ('hero', 'Homepage Hero', '/images/hero-trailer.jpg', 'homepage-media', null, 'Luxury restroom trailer rental for events in Lansing Michigan', 'Primary homepage hero image', 10, true, 1920, 1080),
  ('weddings', 'Weddings Section', '/images/wedding-trailer.jpg', 'homepage-media', null, 'Luxury wedding restroom trailer rental in Lansing and Mid-Michigan', 'Wedding event section image', 20, true, 1200, 900),
  ('private_parties', 'Private Parties Section', '/images/private-party-trailer.jpg', 'homepage-media', null, 'Luxury restroom trailer for private parties in Mid-Michigan', 'Private party event section image', 30, true, 1200, 900),
  ('corporate_events', 'Corporate Events Section', '/images/corporate-event-trailer.jpg', 'homepage-media', null, 'Luxury restroom trailer rental for corporate events in Michigan', 'Corporate event section image', 40, true, 1200, 900),
  ('festivals', 'Festivals and Community Events Section', '/images/festival-trailer.jpg', 'homepage-media', null, 'Luxury restroom trailer for festivals and community events in Michigan', 'Festival and community event section image', 50, true, 1200, 900),
  ('special_events', 'Special Events Section', '/images/special-event-trailer.jpg', 'homepage-media', null, 'Luxury restroom trailer rental for special events near Lansing Michigan', 'Special events section image', 60, true, 1200, 900),
  ('trailer_gallery', 'Trailer Gallery', '/images/gallery-trailer.jpg', 'homepage-media', null, 'Signature Luxe restroom trailer gallery image for Michigan events', 'General trailer gallery image', 70, true, 1200, 900)
on conflict (section_key) do update
set
  label = excluded.label,
  alt_text = excluded.alt_text,
  caption = excluded.caption,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  recommended_width = excluded.recommended_width,
  recommended_height = excluded.recommended_height,
  updated_at = now();
