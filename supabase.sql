-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Apps table
create table public.apps (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    bundle_id text unique not null,
    description text,
    icon_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- App Versions table
create table public.app_versions (
    id uuid default uuid_generate_v4() primary key,
    app_id uuid references public.apps(id) on delete cascade not null,
    version text not null,
    build_number text,
    platform text not null check (platform in ('ios', 'android')),
    download_url text not null,
    changelog text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup RLS (Row Level Security)
alter table public.apps enable row level security;
alter table public.app_versions enable row level security;

-- Read policies: Anyone can view apps & active versions
create policy "Allow public read-only access to apps" 
    on public.apps for select using (true);

create policy "Allow public read-only access to app_versions" 
    on public.app_versions for select using (is_active = true);

-- Write policies: Only authenticated users can insert, update, or delete
create policy "Allow authenticated insert on apps"
    on public.apps for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated update on apps"
    on public.apps for update using (auth.role() = 'authenticated');

create policy "Allow authenticated delete on apps"
    on public.apps for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert on app_versions"
    on public.app_versions for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated update on app_versions"
    on public.app_versions for update using (auth.role() = 'authenticated');

create policy "Allow authenticated delete on app_versions"
    on public.app_versions for delete using (auth.role() = 'authenticated');
