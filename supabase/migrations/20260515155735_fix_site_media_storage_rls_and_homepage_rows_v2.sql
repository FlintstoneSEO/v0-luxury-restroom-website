do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can read site media images'
  ) then
    create policy "Authenticated users can read site media images"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'site-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can upload site media images'
  ) then
    create policy "Authenticated users can upload site media images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'site-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can update site media images'
  ) then
    create policy "Authenticated users can update site media images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'site-media')
    with check (bucket_id = 'site-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can delete site media images'
  ) then
    create policy "Authenticated users can delete site media images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'site-media');
  end if;
end $$;

update public.site_media target
set
  image_url = source.image_url,
  storage_bucket = source.storage_bucket,
  storage_path = source.storage_path,
  alt_text = source.alt_text,
  caption = source.caption,
  is_active = source.is_active,
  updated_at = now()
from public.site_media source
where source.page_slug = '/'
  and target.page_slug = 'homepage'
  and target.section_key = source.section_key
  and source.image_url is not null;

update public.site_media
set is_active = false, updated_at = now()
where page_slug = '/';
