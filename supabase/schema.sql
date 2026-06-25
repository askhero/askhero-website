create extension if not exists "pgcrypto";

create table if not exists public.users_profile (
  id uuid primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'realtor', 'admin')),
  target_markets text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text unique not null,
  city text,
  role text,
  created_at timestamp with time zone default now()
);

create table if not exists public.realtor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profile(id) on delete cascade,
  name text,
  email text not null,
  phone text,
  brokerage text,
  market text,
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.realtor_signups (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  brokerage text,
  market text,
  created_at timestamp with time zone default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users_profile(id) on delete set null,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  price numeric,
  beds numeric,
  baths numeric,
  sqft numeric,
  lot_size numeric,
  year_built numeric,
  property_type text,
  status text default 'coming_soon',
  description text,
  listing_agent_name text,
  listing_agent_email text,
  listing_agent_phone text,
  brokerage_name text,
  source_type text default 'manual' check (source_type in ('manual', 'idx', 'reso', 'api')),
  source_id text,
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int default 0,
  category text,
  category_slug text,
  is_cover boolean default false,
  created_at timestamp with time zone default now()
);

alter table if exists public.listing_photos add column if not exists category text;
alter table if exists public.listing_photos add column if not exists category_slug text;
alter table if exists public.listing_photos add column if not exists is_cover boolean default false;

create table if not exists public.hero_scores (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  total_score int not null check (total_score between 0 and 100),
  letter_grade text,
  explanation text,
  buyer_recommendation text,
  confidence_level text default 'low',
  component_scores jsonb not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(listing_id)
);

create table if not exists public.saved_homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profile(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, listing_id)
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profile(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  created_at timestamp with time zone default now()
);

create table if not exists public.comparison_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profile(id) on delete cascade,
  listing_ids uuid[] not null,
  created_at timestamp with time zone default now(),
  constraint comparison_sets_max_four check (array_length(listing_ids, 1) <= 4)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  buyer_user_id uuid references public.users_profile(id) on delete set null,
  realtor_user_id uuid references public.users_profile(id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  message text,
  status text default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Closed', 'Lost')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamp with time zone default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users_profile(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

create index if not exists listings_public_search_idx on public.listings (approval_status, city, state, price);
create index if not exists hero_scores_listing_idx on public.hero_scores (listing_id);
create index if not exists leads_realtor_idx on public.leads (realtor_user_id, status);
create index if not exists saved_homes_user_idx on public.saved_homes (user_id);

alter table public.users_profile enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.realtor_profiles enable row level security;
alter table public.realtor_signups enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.hero_scores enable row level security;
alter table public.saved_homes enable row level security;
alter table public.saved_searches enable row level security;
alter table public.comparison_sets enable row level security;
alter table public.leads enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users_profile
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles own or admin read" on public.users_profile
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles own update" on public.users_profile
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "approved listings public read" on public.listings
  for select using (approval_status = 'approved' or owner_user_id = auth.uid() or public.is_admin());

create policy "realtors own listings insert" on public.listings
  for insert with check (owner_user_id = auth.uid() or public.is_admin());

create policy "realtors own listings update" on public.listings
  for update using (owner_user_id = auth.uid() or public.is_admin());

create policy "approved listing photos public read" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
      and (listings.approval_status = 'approved' or listings.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "approved hero scores public read" on public.hero_scores
  for select using (
    exists (
      select 1 from public.listings
      where listings.id = hero_scores.listing_id
      and (listings.approval_status = 'approved' or listings.owner_user_id = auth.uid() or public.is_admin())
    )
  );

create policy "buyer own saved homes" on public.saved_homes
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "buyer own saved searches" on public.saved_searches
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "buyer own comparisons" on public.comparison_sets
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "lead parties or admin" on public.leads
  for select using (
    buyer_user_id = auth.uid() or realtor_user_id = auth.uid() or public.is_admin()
  );

create policy "lead insert authenticated or service" on public.leads
  for insert with check (true);

create policy "realtor own profiles" on public.realtor_profiles
  for select using (user_id = auth.uid() or public.is_admin());

create policy "admin read waitlist" on public.waitlist_signups
  for select using (public.is_admin());

create policy "admin read contact" on public.contact_messages
  for select using (public.is_admin());

create policy "admin read realtor signups" on public.realtor_signups
  for select using (public.is_admin());

create policy "admin read audit" on public.audit_logs
  for select using (public.is_admin());

insert into public.users_profile (id, email, full_name, role)
values ('00000000-0000-0000-0000-000000000001', 'admin@askhero.net', 'AskHero Admin', 'admin')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', false)
on conflict (id) do nothing;

create table if not exists public.hero_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  parsed_profile jsonb not null default '{}',
  estimated_safe_budget numeric,
  result_count int default 0,
  created_at timestamp with time zone default now()
);

create index if not exists hero_searches_created_at_idx on public.hero_searches (created_at desc);

alter table public.hero_searches enable row level security;

create policy "admin read hero searches" on public.hero_searches
  for select using (public.is_admin());

-- connect_supabase_zoho migration additions
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
-- Provider-based listing enrichment
create table if not exists public.listing_enrichment (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade unique,
  property_details jsonb default '{}'::jsonb,
  geocoding_data jsonb default '{}'::jsonb,
  nearby_schools jsonb default '[]'::jsonb,
  nearby_grocery jsonb default '[]'::jsonb,
  nearby_shopping jsonb default '[]'::jsonb,
  nearby_hospitals jsonb default '[]'::jsonb,
  nearby_roads jsonb default '[]'::jsonb,
  nearby_highways jsonb default '[]'::jsonb,
  crime_data jsonb default '{}'::jsonb,
  flood_data jsonb default '{}'::jsonb,
  appreciation_projection jsonb default '{}'::jsonb,
  unavailable_data jsonb default '[]'::jsonb,
  provider_status jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table if exists public.listing_enrichment add column if not exists property_details jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists geocoding_data jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_schools jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_grocery jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_shopping jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_hospitals jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_roads jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists nearby_highways jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists crime_data jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists flood_data jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists appreciation_projection jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists unavailable_data jsonb default '[]'::jsonb;
alter table if exists public.listing_enrichment add column if not exists provider_status jsonb default '{}'::jsonb;
alter table if exists public.listing_enrichment add column if not exists updated_at timestamptz default now();

create index if not exists listing_enrichment_listing_id_idx on public.listing_enrichment (listing_id);
alter table public.listing_enrichment enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'listing_enrichment' and policyname = 'admin manage listing enrichment') then
    create policy "admin manage listing enrichment" on public.listing_enrichment for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
