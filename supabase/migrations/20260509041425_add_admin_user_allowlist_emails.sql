create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values
  ('flintstoneseo@gmail.com'),
  ('crystwi@gmail.com'),
  ('info@signatureluxeevents.com')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;
