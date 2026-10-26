create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  label text,
  image_url text,
  storage_bucket text default 'site-media',
  storage_path text,
  alt_text text,
  caption text,
  sort_order integer default 0,
  is_active boolean default true,
  recommended_width integer,
  recommended_height integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint site_media_page_section_unique unique (page_slug, section_key)
);

create index if not exists site_media_page_slug_idx on public.site_media (page_slug);
create index if not exists site_media_active_sort_idx on public.site_media (is_active, sort_order);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_site_media_updated_at on public.site_media;
create trigger set_site_media_updated_at
before update on public.site_media
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.site_media enable row level security;

drop policy if exists "Public can read active site media" on public.site_media;
create policy "Public can read active site media"
on public.site_media
for select
using (is_active = true);

insert into public.site_media (
  page_slug,
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
select
  '/' as page_slug,
  hm.section_key,
  hm.label,
  hm.image_url,
  coalesce(hm.storage_bucket, 'homepage-media') as storage_bucket,
  hm.storage_path,
  hm.alt_text,
  hm.caption,
  coalesce(hm.sort_order, 0) as sort_order,
  coalesce(hm.is_active, true) as is_active,
  hm.recommended_width,
  hm.recommended_height
from public.homepage_media hm
on conflict (page_slug, section_key) do update set
  label = excluded.label,
  image_url = excluded.image_url,
  storage_bucket = excluded.storage_bucket,
  storage_path = excluded.storage_path,
  alt_text = excluded.alt_text,
  caption = excluded.caption,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  recommended_width = excluded.recommended_width,
  recommended_height = excluded.recommended_height;

insert into public.site_media (page_slug, section_key, label, alt_text, sort_order, is_active, recommended_width, recommended_height)
values
  ('/start-here', 'hero', 'Start Here Hero', 'Luxury restroom trailer rental process for Lansing and Mid-Michigan events', 10, true, 1920, 1080),
  ('/start-here', 'intro', 'Start Here Intro Image', 'Signature Luxe restroom trailer setup process for Michigan event rentals', 20, true, 1200, 800),
  ('/luxury-restroom-trailers', 'hero', 'Luxury Restroom Trailers Hero', 'Luxury restroom trailers for weddings and events in Lansing Michigan', 10, true, 1920, 1080),
  ('/luxury-restroom-trailers', 'trailer_exterior', 'Trailer Exterior', 'Exterior view of Signature Luxe luxury restroom trailer', 20, true, 1200, 800),
  ('/luxury-restroom-trailers', 'trailer_interior', 'Trailer Interior', 'Interior view of luxury restroom trailer amenities', 30, true, 1200, 800),
  ('/event-types/weddings', 'hero', 'Wedding Page Hero', 'Luxury restroom trailer rental for weddings in Lansing and Mid-Michigan', 10, true, 1920, 1080),
  ('/event-types/weddings', 'feature', 'Wedding Feature Image', 'Luxury restroom trailer at an elegant Michigan wedding venue', 20, true, 1200, 800),
  ('/event-types/private-parties', 'hero', 'Private Parties Hero', 'Luxury restroom trailer rental for private parties in Michigan', 10, true, 1920, 1080),
  ('/event-types/private-parties', 'feature', 'Private Parties Feature Image', 'Luxury restroom trailer setup for a private backyard party', 20, true, 1200, 800),
  ('/event-types/corporate-events', 'hero', 'Corporate Events Hero', 'Luxury restroom trailer rental for corporate events in Michigan', 10, true, 1920, 1080),
  ('/event-types/corporate-events', 'feature', 'Corporate Events Feature Image', 'Luxury restroom trailer setup for a corporate event or tailgate', 20, true, 1200, 800),
  ('/event-types/festivals', 'hero', 'Festivals Hero', 'Luxury restroom trailer rental for festivals and community events in Michigan', 10, true, 1920, 1080),
  ('/event-types/festivals', 'feature', 'Festivals Feature Image', 'Luxury restroom trailer serving a Michigan festival or community event', 20, true, 1200, 800),
  ('/event-types/special-events', 'hero', 'Special Events Hero', 'Luxury restroom trailer rental for special events near Lansing Michigan', 10, true, 1920, 1080),
  ('/event-types/special-events', 'feature', 'Special Events Feature Image', 'Luxury restroom trailer for galas fundraisers and private events in Michigan', 20, true, 1200, 800),
  ('/gallery', 'hero', 'Gallery Hero', 'Signature Luxe luxury restroom trailer gallery for Michigan events', 10, true, 1920, 1080),
  ('/gallery', 'gallery_feature', 'Gallery Feature Image', 'Featured luxury restroom trailer image from Signature Luxe Events and Amenities', 20, true, 1200, 800),
  ('/faq', 'hero', 'FAQ Hero', 'Frequently asked questions about luxury restroom trailer rentals in Michigan', 10, true, 1920, 1080),
  ('/contact', 'hero', 'Contact Hero', 'Contact Signature Luxe for luxury restroom trailer rentals in Lansing Michigan', 10, true, 1920, 1080),
  ('/service-areas', 'hero', 'Service Areas Hero', 'Luxury restroom trailer service areas around Lansing and Mid-Michigan', 10, true, 1920, 1080)
on conflict (page_slug, section_key) do nothing;
