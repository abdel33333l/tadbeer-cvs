-- 1. Create or Update Workers Table
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  worker_code text unique,
  name text,
  nationality text,
  country text,
  age integer,
  religion text,
  marital_status text,
  experience text,
  previous_experience_country text,
  work_experience jsonb default '[]'::jsonb,
  previous_experience jsonb default '[]'::jsonb,
  experience_details text,
  skills jsonb default '[]'::jsonb,
  languages jsonb default '[]'::jsonb,
  salary numeric,
  guarantee text,
  status text default 'available',
  portrait_image_url text,
  full_body_image_url text,
  passport_number text,
  date_of_birth text,
  place_of_birth text,
  phone text,
  mobile text,
  raw_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Add missing columns if they don't exist (in case table already exists)
do $$ 
begin
  if not exists (select from pg_attribute where attrelid = 'public.workers'::regclass and attname = 'experience_details') then
    alter table public.workers add column experience_details text;
  end if;
  if not exists (select from pg_attribute where attrelid = 'public.workers'::regclass and attname = 'previous_experience') then
    alter table public.workers add column previous_experience jsonb default '[]'::jsonb;
  end if;
end $$;

-- 3. Enable RLS
alter table public.workers enable row level security;

-- 4. Create Policies (Public access for simplicity in initial version)
-- NOTE: These should be restricted to authenticated users later for production security.
drop policy if exists "Public can read workers" on public.workers;
create policy "Public can read workers" on public.workers for select using (true);

drop policy if exists "Public can insert workers" on public.workers;
create policy "Public can insert workers" on public.workers for insert with check (true);

drop policy if exists "Public can update workers" on public.workers;
create policy "Public can update workers" on public.workers for update using (true);

drop policy if exists "Public can delete workers" on public.workers;
create policy "Public can delete workers" on public.workers for delete using (true);

-- 5. Storage Setup
-- Note: Run this individually if your Supabase version doesn't support storage SQL
-- insert into storage.buckets (id, name, public) values ('worker-images', 'worker-images', true) on conflict (id) do nothing;

-- 6. Storage Policies
-- SELECT policy
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'worker-images' );

-- INSERT policy
drop policy if exists "Public Upload" on storage.objects;
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'worker-images' );

-- UPDATE/DELETE policy
drop policy if exists "Public Modify" on storage.objects;
create policy "Public Modify" on storage.objects for update using ( bucket_id = 'worker-images' );
create policy "Public Modify" on storage.objects for delete using ( bucket_id = 'worker-images' );

-- COMMENT: Highly recommended to replace public write policies with Supabase Auth (e.g. check for auth.role() = 'authenticated')
