create extension if not exists "pgcrypto";

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  source text default 'contact_form',
  status text default 'new',
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.contact_messages add column if not exists phone text;
alter table public.contact_messages add column if not exists subject text;
alter table public.contact_messages add column if not exists source text default 'contact_form';
alter table public.contact_messages add column if not exists status text default 'new';
alter table public.contact_messages add column if not exists metadata jsonb default '{}'::jsonb;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  city text,
  role text,
  message text,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.leads add column if not exists agent_id uuid;
alter table public.leads add column if not exists source text default 'website';
alter table public.leads add column if not exists metadata jsonb default '{}'::jsonb;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  brokerage text,
  license_number text,
  market text,
  status text default 'pending',
  created_at timestamptz default now(),
  approved_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

alter table public.listings add column if not exists agent_id uuid;
alter table public.listings add column if not exists title text;
alter table public.listings add column if not exists address text;
alter table public.listings add column if not exists published boolean default false;
alter table public.listings add column if not exists approved_at timestamptz;
alter table public.listings add column if not exists metadata jsonb default '{}'::jsonb;

create table if not exists public.hero_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  parsed_profile jsonb default '{}'::jsonb,
  safe_budget jsonb default '{}'::jsonb,
  result_count integer default 0,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.hero_searches add column if not exists safe_budget jsonb default '{}'::jsonb;
alter table public.hero_searches add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
create index if not exists agents_created_at_idx on public.agents (created_at desc);
create index if not exists hero_searches_created_at_idx on public.hero_searches (created_at desc);
create index if not exists listings_published_approved_idx on public.listings (published, approved_at, approval_status, city, state, price);

alter table public.contact_messages enable row level security;
alter table public.waitlist enable row level security;
alter table public.leads enable row level security;
alter table public.agents enable row level security;
alter table public.listings enable row level security;
alter table public.hero_searches enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'contact_messages' and policyname = 'public insert contact messages') then
    create policy "public insert contact messages" on public.contact_messages for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'waitlist' and policyname = 'public insert waitlist') then
    create policy "public insert waitlist" on public.waitlist for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'waitlist_signups' and policyname = 'public insert waitlist signups') then
    create policy "public insert waitlist signups" on public.waitlist_signups for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'public insert leads') then
    create policy "public insert leads" on public.leads for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agents' and policyname = 'public insert agents') then
    create policy "public insert agents" on public.agents for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'realtor_signups' and policyname = 'public insert realtor signups') then
    create policy "public insert realtor signups" on public.realtor_signups for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_searches' and policyname = 'public insert hero searches') then
    create policy "public insert hero searches" on public.hero_searches for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'contact_messages' and policyname = 'admin manage contact messages') then
    create policy "admin manage contact messages" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'waitlist' and policyname = 'admin manage waitlist') then
    create policy "admin manage waitlist" on public.waitlist for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agents' and policyname = 'admin manage agents') then
    create policy "admin manage agents" on public.agents for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_searches' and policyname = 'admin manage hero searches') then
    create policy "admin manage hero searches" on public.hero_searches for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

drop policy if exists "approved listings public read" on public.listings;
create policy "approved published listings public read" on public.listings
  for select using (
    (
      published is true
      and (
        approval_status = 'approved'
        or approved_at is not null
        or status = 'approved'
      )
    )
    or owner_user_id = auth.uid()
    or public.is_admin()
  );