-- Oliyaruvi foundation schema.
-- Run in Supabase. The service role is not required for visitors.
-- This file does not create a password or invent studio history.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_role(uid uuid, role_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = uid
      and r.key = role_key
  );
$$;

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(uid, 'super_admin');
$$;

create or replace function public.is_staff(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur where ur.user_id = uid
  );
$$;

create or replace function public.can_edit_content(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin(uid) or public.has_role(uid, 'content_editor');
$$;

create or replace function public.can_manage_media(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin(uid) or public.has_role(uid, 'media_manager');
$$;

create or replace function public.can_manage_orders(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin(uid) or public.has_role(uid, 'order_manager');
$$;

create or replace function public.can_manage_live(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin(uid) or public.has_role(uid, 'live_event_manager');
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in (
    'super_admin',
    'content_editor',
    'media_manager',
    'order_manager',
    'live_event_manager'
  )),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  granted_by uuid references public.profiles (id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Site and theme
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id integer primary key check (id = 1),
  business_name text not null,
  business_name_ta text not null,
  location_en text not null,
  location_ta text not null default '',
  phone_primary text not null,
  phone_secondary text not null,
  whatsapp_number text not null,
  experience_years integer not null check (experience_years >= 0),
  address_en text,
  address_ta text,
  map_url text,
  latitude numeric,
  longitude numeric,
  hours jsonb,
  social_links jsonb not null default '[]'::jsonb,
  announcement_en text,
  announcement_ta text,
  announcement_enabled boolean not null default false,
  content_version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.theme_settings (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('draft', 'published')),
  tokens jsonb not null,
  header_variant text not null default 'studio',
  footer_variant text not null default 'studio',
  button_variant text not null default 'gold',
  created_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create unique index theme_one_published_idx
  on public.theme_settings (status)
  where status = 'published';

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index pages_slug_active_idx
  on public.pages (slug)
  where deleted_at is null;

create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create table public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  version integer not null check (version > 0),
  state text not null check (state in ('draft', 'published', 'archived')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (page_id, version)
);

create index page_revisions_page_state_idx
  on public.page_revisions (page_id, state);

create unique index page_revisions_one_draft_idx
  on public.page_revisions (page_id)
  where state = 'draft';

create unique index page_revisions_one_published_idx
  on public.page_revisions (page_id)
  where state = 'published';

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.page_revisions (id) on delete cascade,
  block_type text not null check (block_type in (
    'hero', 'video_hero', 'image_slider', 'text', 'image', 'gallery',
    'video_gallery', 'services', 'product_grid', 'live_events',
    'testimonials', 'statistics', 'faq', 'contact_form', 'cta', 'custom_layout'
  )),
  sort_order integer not null check (sort_order >= 0),
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  animation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (revision_id, sort_order)
);

create index page_sections_revision_order_idx
  on public.page_sections (revision_id, sort_order);

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages (id) on delete cascade,
  locale text not null check (locale in ('en', 'ta')),
  title text not null default '',
  description text not null default '',
  og_media_id uuid,
  created_at timestamptz not null default now()
);

create unique index seo_site_locale_idx
  on public.seo_metadata (locale)
  where page_id is null;

create unique index seo_page_locale_idx
  on public.seo_metadata (page_id, locale)
  where page_id is not null;

-- ---------------------------------------------------------------------------
-- Navigation
-- ---------------------------------------------------------------------------

create table public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('header', 'footer')),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus (id) on delete cascade,
  parent_id uuid references public.navigation_items (id) on delete cascade,
  label_en text not null,
  label_ta text not null default '',
  href text not null,
  link_type text not null check (link_type in ('internal', 'external')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now()
);

create index navigation_items_menu_order_idx
  on public.navigation_items (menu_id, parent_id, sort_order);

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('media-public', 'media-private')),
  storage_path text not null,
  folder text not null default '',
  kind text not null check (kind in ('image', 'video', 'file')),
  mime_type text not null,
  byte_size integer not null check (byte_size >= 0),
  width integer,
  height integer,
  duration_seconds integer,
  alt_en text not null default '',
  alt_ta text not null default '',
  title text not null default '',
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (bucket, storage_path)
);

create index media_assets_folder_idx
  on public.media_assets (folder)
  where deleted_at is null;

create trigger media_assets_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

alter table public.seo_metadata
  add constraint seo_metadata_og_media_fk
  foreign key (og_media_id) references public.media_assets (id);

create table public.media_references (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets (id) on delete restrict,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (media_id, entity_type, entity_id)
);

-- ---------------------------------------------------------------------------
-- Photography and video
-- ---------------------------------------------------------------------------

create table public.photo_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  name_en text not null,
  name_ta text not null default '',
  created_at timestamptz not null default now()
);

create table public.photo_albums (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.photo_categories (id),
  slug text not null,
  cover_media_id uuid references public.media_assets (id),
  sort_order integer not null default 0,
  is_visible boolean not null default false,
  is_featured boolean not null default false,
  title_en text not null,
  title_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index photo_albums_slug_active_idx
  on public.photo_albums (slug)
  where deleted_at is null;

create index photo_albums_category_idx
  on public.photo_albums (category_id, is_visible, is_featured);

create trigger photo_albums_updated_at
  before update on public.photo_albums
  for each row execute function public.set_updated_at();

create table public.photographs (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.photo_albums (id) on delete cascade,
  media_id uuid not null references public.media_assets (id),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  caption_en text not null default '',
  caption_ta text not null default '',
  created_at timestamptz not null default now()
);

create index photographs_album_order_idx
  on public.photographs (album_id, sort_order);

create table public.video_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  name_en text not null,
  name_ta text not null default '',
  created_at timestamptz not null default now()
);

create table public.video_collections (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.video_categories (id),
  slug text not null unique,
  sort_order integer not null default 0,
  is_visible boolean not null default false,
  title_en text not null,
  title_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger video_collections_updated_at
  before update on public.video_collections
  for each row execute function public.set_updated_at();

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.video_collections (id) on delete cascade,
  source_type text not null check (source_type in ('youtube', 'upload')),
  youtube_url text,
  media_id uuid references public.media_assets (id),
  thumbnail_media_id uuid references public.media_assets (id),
  duration_seconds integer,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_visible boolean not null default false,
  title_en text not null,
  title_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint videos_source_chk check (
    (source_type = 'youtube' and youtube_url is not null)
    or (source_type = 'upload' and media_id is not null)
  )
);

create index videos_collection_featured_idx
  on public.videos (collection_id, is_featured);

create trigger videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Live
-- ---------------------------------------------------------------------------

create table public.live_channels (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in (
    'facebook_live', 'youtube_live', 'yarl_rip_book', 'yarl_events', 'yarl_tharisanam'
  )),
  kind text not null check (kind in ('platform', 'identity')),
  name_en text not null,
  name_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  external_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger live_channels_updated_at
  before update on public.live_channels
  for each row execute function public.set_updated_at();

create table public.live_events (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.live_channels (id),
  thumbnail_media_id uuid references public.media_assets (id),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'live', 'ended')),
  status_source text not null default 'manual' check (status_source in ('manual', 'provider')),
  is_published boolean not null default false,
  is_featured boolean not null default false,
  replay_url text,
  title_en text not null default '',
  title_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index live_events_public_idx
  on public.live_events (is_published, status, starts_at);

create trigger live_events_updated_at
  before update on public.live_events
  for each row execute function public.set_updated_at();

create table public.event_broadcast_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.live_events (id) on delete cascade,
  platform text not null check (platform in ('facebook', 'youtube', 'other')),
  url text not null,
  label_en text not null default '',
  label_ta text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  catalogue text not null check (catalogue in ('printing', 'gifts')),
  slug text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  name_en text not null,
  name_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  created_at timestamptz not null default now(),
  unique (catalogue, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories (id),
  slug text not null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_available boolean not null default true,
  show_price boolean not null default false,
  name_en text not null,
  name_ta text not null default '',
  description_en text not null default '',
  description_ta text not null default '',
  enquiry_label_en text not null default '',
  enquiry_label_ta text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index products_slug_active_idx
  on public.products (slug)
  where deleted_at is null;

create index products_category_available_idx
  on public.products (category_id, is_available);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_media (
  product_id uuid not null references public.products (id) on delete cascade,
  media_id uuid not null references public.media_assets (id),
  sort_order integer not null default 0,
  primary key (product_id, media_id)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null default '',
  material text not null default '',
  price_lkr numeric(12, 2),
  name_en text not null default '',
  name_ta text not null default '',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers, bookings, enquiries, orders
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_phone_idx on public.customers (phone);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  service text not null,
  event_date date,
  location text not null default '',
  requirements text not null default '',
  status text not null default 'new' check (status in (
    'new', 'reviewing', 'confirmed', 'declined', 'closed'
  )),
  assigned_to uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_status_created_idx
  on public.bookings (status, created_at);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create table public.booking_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.booking_files (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  media_id uuid not null references public.media_assets (id),
  created_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  product_id uuid references public.products (id),
  source text not null check (source in ('contact', 'product', 'service')),
  service text not null default '',
  details text not null default '',
  status text not null default 'new' check (status in (
    'new', 'reviewing', 'confirmed', 'declined', 'closed'
  )),
  assigned_to uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_status_created_idx
  on public.enquiries (status, created_at);

create trigger enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers (id),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'partial', 'paid', 'waived'
  )),
  production_status text not null default 'pending' check (production_status in (
    'pending', 'in_production', 'ready', 'completed', 'cancelled'
  )),
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  fulfillment_status text not null default 'pending' check (fulfillment_status in (
    'pending', 'ready', 'out_for_delivery', 'picked_up', 'delivered', 'cancelled'
  )),
  internal_notes text not null default '',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  variant_id uuid references public.product_variants (id),
  name_snapshot text not null,
  variant_snapshot text not null default '',
  quantity integer not null check (quantity > 0),
  unit_price_lkr numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Other content
-- ---------------------------------------------------------------------------

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  location_label text not null default '',
  quote_en text not null,
  quote_ta text not null default '',
  media_id uuid references public.media_assets (id),
  is_visible boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_ta text not null default '',
  answer_en text not null,
  answer_ta text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at);

create table public.form_rate_events (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  form_key text not null check (form_key in ('booking', 'enquiry')),
  created_at timestamptz not null default now()
);

create index form_rate_events_lookup_idx
  on public.form_rate_events (ip_hash, form_key, created_at);

-- ---------------------------------------------------------------------------
-- Public form functions. They bypass row-level security and return only an id.
-- ---------------------------------------------------------------------------

create or replace function public.allow_form_post(p_ip_hash text, p_form_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_form_key not in ('booking', 'enquiry') then
    return false;
  end if;
  if p_ip_hash is null or length(p_ip_hash) < 16 then
    return false;
  end if;

  delete from public.form_rate_events
  where created_at < now() - interval '1 day';

  select count(*) into v_count
  from public.form_rate_events
  where ip_hash = p_ip_hash
    and form_key = p_form_key
    and created_at > now() - interval '10 minutes';

  if v_count >= 5 then
    return false;
  end if;

  insert into public.form_rate_events (ip_hash, form_key)
  values (p_ip_hash, p_form_key);
  return true;
end;
$$;

create or replace function public.submit_booking(
  p_name text,
  p_phone text,
  p_email text,
  p_service text,
  p_event_date date,
  p_location text,
  p_requirements text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_booking uuid;
  v_email text;
begin
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Invalid booking';
  end if;
  if p_phone is null or length(regexp_replace(p_phone, '\D', '', 'g')) < 8 then
    raise exception 'Invalid booking';
  end if;
  if p_service is null or length(trim(p_service)) < 2 then
    raise exception 'Invalid booking';
  end if;

  v_email := nullif(trim(coalesce(p_email, '')), '');
  if v_email is not null and position('@' in v_email) = 0 then
    raise exception 'Invalid booking';
  end if;

  select id into v_customer
  from public.customers
  where phone = trim(p_phone)
  order by created_at
  limit 1;

  if v_customer is null then
    insert into public.customers (full_name, phone, email)
    values (trim(p_name), trim(p_phone), v_email)
    returning id into v_customer;
  end if;

  insert into public.bookings (customer_id, service, event_date, location, requirements)
  values (
    v_customer,
    trim(p_service),
    p_event_date,
    trim(coalesce(p_location, '')),
    trim(coalesce(p_requirements, ''))
  )
  returning id into v_booking;

  return v_booking;
end;
$$;

create or replace function public.submit_enquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_source text,
  p_service text,
  p_details text,
  p_product_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_enquiry uuid;
  v_email text;
begin
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Invalid enquiry';
  end if;
  if p_phone is null or length(regexp_replace(p_phone, '\D', '', 'g')) < 8 then
    raise exception 'Invalid enquiry';
  end if;
  if p_source not in ('contact', 'product', 'service') then
    raise exception 'Invalid enquiry';
  end if;

  v_email := nullif(trim(coalesce(p_email, '')), '');
  if v_email is not null and position('@' in v_email) = 0 then
    raise exception 'Invalid enquiry';
  end if;

  select id into v_customer
  from public.customers
  where phone = trim(p_phone)
  order by created_at
  limit 1;

  if v_customer is null then
    insert into public.customers (full_name, phone, email)
    values (trim(p_name), trim(p_phone), v_email)
    returning id into v_customer;
  end if;

  insert into public.enquiries (customer_id, product_id, source, service, details)
  values (
    v_customer,
    p_product_id,
    p_source,
    trim(coalesce(p_service, '')),
    trim(coalesce(p_details, ''))
  )
  returning id into v_enquiry;

  return v_enquiry;
end;
$$;

revoke all on function public.allow_form_post(text, text) from public;
revoke all on function public.submit_booking(text, text, text, text, date, text, text) from public;
revoke all on function public.submit_enquiry(text, text, text, text, text, text, uuid) from public;
grant execute on function public.allow_form_post(text, text) to anon, authenticated;
grant execute on function public.submit_booking(text, text, text, text, date, text, text) to anon, authenticated;
grant execute on function public.submit_enquiry(text, text, text, text, text, text, uuid) to anon, authenticated;

grant execute on function public.has_role(uuid, text) to anon, authenticated;
grant execute on function public.is_super_admin(uuid) to anon, authenticated;
grant execute on function public.is_staff(uuid) to anon, authenticated;
grant execute on function public.can_edit_content(uuid) to anon, authenticated;
grant execute on function public.can_manage_media(uuid) to anon, authenticated;
grant execute on function public.can_manage_orders(uuid) to anon, authenticated;
grant execute on function public.can_manage_live(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.theme_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_revisions enable row level security;
alter table public.page_sections enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.navigation_menus enable row level security;
alter table public.navigation_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_references enable row level security;
alter table public.photo_categories enable row level security;
alter table public.photo_albums enable row level security;
alter table public.photographs enable row level security;
alter table public.video_categories enable row level security;
alter table public.video_collections enable row level security;
alter table public.videos enable row level security;
alter table public.live_channels enable row level security;
alter table public.live_events enable row level security;
alter table public.event_broadcast_links enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_notes enable row level security;
alter table public.booking_files enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.form_rate_events enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_super_admin(auth.uid())
    or public.can_manage_orders(auth.uid())
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_super_admin(auth.uid()))
  with check (id = auth.uid() or public.is_super_admin(auth.uid()));

create policy roles_select on public.roles
  for select to authenticated
  using (public.is_staff(auth.uid()));

create policy roles_write on public.roles
  for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin(auth.uid()));

create policy user_roles_write on public.user_roles
  for all to authenticated
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

create policy site_settings_select on public.site_settings
  for select to anon, authenticated
  using (true);

create policy site_settings_update on public.site_settings
  for update to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy theme_public_select on public.theme_settings
  for select to anon, authenticated
  using (status = 'published');

create policy theme_staff_all on public.theme_settings
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy pages_public_select on public.pages
  for select to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.page_revisions r
      where r.page_id = pages.id and r.state = 'published'
    )
  );

create policy pages_staff_all on public.pages
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy revisions_public_select on public.page_revisions
  for select to anon, authenticated
  using (
    state = 'published'
    and exists (
      select 1 from public.pages p
      where p.id = page_revisions.page_id and p.deleted_at is null
    )
  );

create policy revisions_staff_all on public.page_revisions
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy sections_public_select on public.page_sections
  for select to anon, authenticated
  using (
    is_visible
    and exists (
      select 1
      from public.page_revisions r
      join public.pages p on p.id = r.page_id
      where r.id = page_sections.revision_id
        and r.state = 'published'
        and p.deleted_at is null
    )
  );

create policy sections_staff_select on public.page_sections
  for select to authenticated
  using (public.can_edit_content(auth.uid()));

create policy sections_staff_write on public.page_sections
  for insert to authenticated
  with check (
    public.can_edit_content(auth.uid())
    and exists (
      select 1 from public.page_revisions r
      where r.id = revision_id and r.state = 'draft'
    )
  );

create policy sections_staff_update on public.page_sections
  for update to authenticated
  using (
    public.can_edit_content(auth.uid())
    and exists (
      select 1 from public.page_revisions r
      where r.id = page_sections.revision_id and r.state = 'draft'
    )
  )
  with check (
    public.can_edit_content(auth.uid())
    and exists (
      select 1 from public.page_revisions r
      where r.id = revision_id and r.state = 'draft'
    )
  );

create policy sections_staff_delete on public.page_sections
  for delete to authenticated
  using (
    public.can_edit_content(auth.uid())
    and exists (
      select 1 from public.page_revisions r
      where r.id = page_sections.revision_id and r.state = 'draft'
    )
  );

create policy seo_public_select on public.seo_metadata
  for select to anon, authenticated
  using (
    page_id is null
    or exists (
      select 1
      from public.pages p
      join public.page_revisions r on r.page_id = p.id and r.state = 'published'
      where p.id = seo_metadata.page_id and p.deleted_at is null
    )
  );

create policy seo_staff_all on public.seo_metadata
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy menus_public_select on public.navigation_menus
  for select to anon, authenticated
  using (true);

create policy menus_staff_all on public.navigation_menus
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy nav_public_select on public.navigation_items
  for select to anon, authenticated
  using (is_visible);

create policy nav_staff_all on public.navigation_items
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy media_public_select on public.media_assets
  for select to anon, authenticated
  using (bucket = 'media-public' and deleted_at is null);

create policy media_manager_all on public.media_assets
  for all to authenticated
  using (public.can_manage_media(auth.uid()))
  with check (public.can_manage_media(auth.uid()));

create policy media_live_select on public.media_assets
  for select to authenticated
  using (public.can_manage_live(auth.uid()) and bucket = 'media-public');

create policy media_live_insert on public.media_assets
  for insert to authenticated
  with check (
    public.can_manage_live(auth.uid())
    and bucket = 'media-public'
    and folder = 'live-events'
  );

create policy media_order_private_select on public.media_assets
  for select to authenticated
  using (public.can_manage_orders(auth.uid()) and bucket = 'media-private');

create policy media_refs_staff on public.media_references
  for all to authenticated
  using (
    public.can_edit_content(auth.uid())
    or public.can_manage_media(auth.uid())
    or public.can_manage_live(auth.uid())
  )
  with check (
    public.can_edit_content(auth.uid())
    or public.can_manage_media(auth.uid())
    or public.can_manage_live(auth.uid())
  );

create policy photo_categories_public on public.photo_categories
  for select to anon, authenticated
  using (is_visible);

create policy photo_categories_staff on public.photo_categories
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy photo_albums_public on public.photo_albums
  for select to anon, authenticated
  using (is_visible and deleted_at is null);

create policy photo_albums_staff on public.photo_albums
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy photographs_public on public.photographs
  for select to anon, authenticated
  using (
    is_visible
    and exists (
      select 1 from public.photo_albums a
      where a.id = photographs.album_id
        and a.is_visible
        and a.deleted_at is null
    )
  );

create policy photographs_staff on public.photographs
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy video_categories_public on public.video_categories
  for select to anon, authenticated
  using (is_visible);

create policy video_categories_staff on public.video_categories
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy video_collections_public on public.video_collections
  for select to anon, authenticated
  using (is_visible);

create policy video_collections_staff on public.video_collections
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy videos_public on public.videos
  for select to anon, authenticated
  using (
    is_visible
    and exists (
      select 1 from public.video_collections c
      where c.id = videos.collection_id and c.is_visible
    )
  );

create policy videos_staff on public.videos
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy channels_public on public.live_channels
  for select to anon, authenticated
  using (is_visible);

create policy channels_staff on public.live_channels
  for all to authenticated
  using (public.can_manage_live(auth.uid()))
  with check (public.can_manage_live(auth.uid()));

create policy events_public on public.live_events
  for select to anon, authenticated
  using (is_published and deleted_at is null and status <> 'draft');

create policy events_staff on public.live_events
  for all to authenticated
  using (public.can_manage_live(auth.uid()))
  with check (public.can_manage_live(auth.uid()));

create policy links_public on public.event_broadcast_links
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.live_events e
      where e.id = event_broadcast_links.event_id
        and e.is_published
        and e.deleted_at is null
        and e.status <> 'draft'
    )
  );

create policy links_staff on public.event_broadcast_links
  for all to authenticated
  using (public.can_manage_live(auth.uid()))
  with check (public.can_manage_live(auth.uid()));

create policy product_categories_public on public.product_categories
  for select to anon, authenticated
  using (is_visible);

create policy product_categories_staff on public.product_categories
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy products_public on public.products
  for select to anon, authenticated
  using (
    is_available
    and deleted_at is null
    and exists (
      select 1 from public.product_categories c
      where c.id = products.category_id and c.is_visible
    )
  );

create policy products_staff on public.products
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy product_media_public on public.product_media
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      join public.product_categories c on c.id = p.category_id
      where p.id = product_media.product_id
        and p.is_available
        and p.deleted_at is null
        and c.is_visible
    )
  );

create policy product_media_staff on public.product_media
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy variants_public on public.product_variants
  for select to anon, authenticated
  using (
    is_available
    and exists (
      select 1
      from public.products p
      join public.product_categories c on c.id = p.category_id
      where p.id = product_variants.product_id
        and p.is_available
        and p.deleted_at is null
        and c.is_visible
    )
  );

create policy variants_staff on public.product_variants
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy customers_staff on public.customers
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy bookings_staff on public.bookings
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy booking_notes_staff on public.booking_notes
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy booking_files_staff on public.booking_files
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy enquiries_staff on public.enquiries
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy enquiry_notes_staff on public.enquiry_notes
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy orders_staff on public.orders
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy order_items_staff on public.order_items
  for all to authenticated
  using (public.can_manage_orders(auth.uid()))
  with check (public.can_manage_orders(auth.uid()));

create policy testimonials_public on public.testimonials
  for select to anon, authenticated
  using (is_visible);

create policy testimonials_staff on public.testimonials
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy faqs_public on public.faqs
  for select to anon, authenticated
  using (is_visible);

create policy faqs_staff on public.faqs
  for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy audit_select on public.audit_logs
  for select to authenticated
  using (public.is_super_admin(auth.uid()));

create policy audit_insert on public.audit_logs
  for insert to authenticated
  with check (actor_id = auth.uid() and public.is_staff(auth.uid()));

-- No policies on form_rate_events. The rate-limit function is the only writer.

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media-public',
    'media-public',
    true,
    209715200,
    array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
  ),
  (
    'media-private',
    'media-private',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do nothing;

create policy media_public_objects_read
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'media-public'
    and exists (
      select 1 from public.media_assets m
      where m.bucket = storage.objects.bucket_id
        and m.storage_path = storage.objects.name
        and m.deleted_at is null
    )
  );

create policy media_manager_objects_write
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'media-public' and public.can_manage_media(auth.uid()))
  with check (bucket_id = 'media-public' and public.can_manage_media(auth.uid()));

create policy live_manager_objects_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media-public'
    and public.can_manage_live(auth.uid())
    and name like 'live-events/%'
  );

create policy order_manager_private_objects_read
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'media-private' and public.can_manage_orders(auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed verified facts only
-- ---------------------------------------------------------------------------

insert into public.roles (key, name)
values
  ('super_admin', 'Super Admin'),
  ('content_editor', 'Content Editor'),
  ('media_manager', 'Media Manager'),
  ('order_manager', 'Order Manager'),
  ('live_event_manager', 'Live Event Manager');

insert into public.site_settings (
  id,
  business_name,
  business_name_ta,
  location_en,
  location_ta,
  phone_primary,
  phone_secondary,
  whatsapp_number,
  experience_years,
  hours,
  social_links
)
values (
  1,
  'Oliyaruvi Digital Colour Lab',
  'ஒளியருவி டிஜிட்டல் கலர் லேப்',
  'Nelliady, Jaffna, Sri Lanka',
  '',
  '0773928215',
  '0777241958',
  '0773928215',
  32,
  null,
  '[]'::jsonb
);

insert into public.theme_settings (status, tokens, published_at)
values (
  'published',
  jsonb_build_object(
    'color', jsonb_build_object(
      'background', '#0B0B0D',
      'surface', '#17171B',
      'gold', '#D6AC57',
      'lightGold', '#F3D58C',
      'maroon', '#651C2A',
      'text', '#F7F3EB',
      'muted', '#B8B1A8'
    ),
    'font', jsonb_build_object(
      'heading', 'Playfair Display',
      'body', 'Inter',
      'tamil', 'Noto Sans Tamil'
    ),
    'radius', '999px',
    'spacing', '4.5rem'
  ),
  now()
);

insert into public.seo_metadata (page_id, locale, title, description)
values
  (
    null,
    'en',
    'Oliyaruvi Digital Colour Lab',
    'Photography, videography, printing, custom gifts, and live streaming in Nelliady, Jaffna.'
  ),
  (
    null,
    'ta',
    'ஒளியருவி டிஜிட்டல் கலர் லேப்',
    ''
  );

insert into public.navigation_menus (key, name)
values ('header', 'Header'), ('footer', 'Footer');

insert into public.navigation_items (menu_id, label_en, label_ta, href, link_type, sort_order)
select m.id, item.label_en, '', item.href, 'internal', item.sort_order
from public.navigation_menus m
join (
  values
    ('Home', '/', 0),
    ('About', '/about', 1),
    ('Photography', '/photography', 2),
    ('Videography', '/videography', 3),
    ('Printing', '/printing', 4),
    ('Custom Gifts', '/gifts', 5),
    ('Live', '/live', 6),
    ('Portfolio', '/portfolio', 7),
    ('Contact', '/contact', 8)
) as item(label_en, href, sort_order) on true
where m.key = 'header';

insert into public.navigation_items (menu_id, label_en, label_ta, href, link_type, sort_order)
select m.id, item.label_en, '', item.href, 'internal', item.sort_order
from public.navigation_menus m
join (
  values
    ('Photography', '/photography', 0),
    ('Videography', '/videography', 1),
    ('Printing', '/printing', 2),
    ('Custom Gifts', '/gifts', 3),
    ('Live', '/live', 4)
) as item(label_en, href, sort_order) on true
where m.key = 'footer';

insert into public.photo_categories (slug, sort_order, name_en)
values
  ('wedding', 0, 'Weddings'),
  ('engagement', 1, 'Engagements'),
  ('pre_wedding', 2, 'Pre-weddings'),
  ('birthday', 3, 'Birthdays'),
  ('family', 4, 'Family events'),
  ('temple', 5, 'Temple festivals'),
  ('school', 6, 'School events'),
  ('portrait', 7, 'Portraits'),
  ('other', 8, 'Other events');

insert into public.video_categories (slug, sort_order, name_en)
values
  ('wedding', 0, 'Wedding films'),
  ('highlight', 1, 'Highlight videos'),
  ('pre_wedding', 2, 'Pre-wedding films'),
  ('birthday', 3, 'Birthday films'),
  ('temple', 4, 'Temple festival videos'),
  ('promotional', 5, 'Promotional videos'),
  ('event', 6, 'Event coverage');

insert into public.product_categories (catalogue, slug, sort_order, name_en)
values
  ('printing', 'photo_prints', 0, 'Photo printing'),
  ('printing', 'passport_id', 1, 'Passport and ID photos'),
  ('printing', 'wedding_albums', 2, 'Wedding albums'),
  ('printing', 'banners', 3, 'Banner printing'),
  ('printing', 'flex', 4, 'Flex printing'),
  ('printing', 'cloth_banners', 5, 'Cloth banners'),
  ('printing', 'stickers', 6, 'Stickers'),
  ('printing', 'large_format', 7, 'Large-format printing'),
  ('printing', 'frames', 8, 'Frames'),
  ('printing', 'name_boards', 9, 'Name boards'),
  ('printing', 'other', 10, 'Other printing services'),
  ('gifts', 'mugs', 0, 'Printed mugs'),
  ('gifts', 'phone_covers', 1, 'Phone covers'),
  ('gifts', 'medals', 2, 'Medals'),
  ('gifts', 'trophies', 3, 'Trophies'),
  ('gifts', 'mementos', 4, 'Mementos'),
  ('gifts', 'crystal', 5, 'Crystal gifts'),
  ('gifts', 'frames', 6, 'Photo frames'),
  ('gifts', 'keychains', 7, 'Keychains'),
  ('gifts', 'other', 8, 'Personalized gifts');

insert into public.live_channels (key, kind, name_en, sort_order, external_url)
values
  ('facebook_live', 'platform', 'Facebook Live', 0, null),
  ('youtube_live', 'platform', 'YouTube Live', 1, null),
  ('yarl_rip_book', 'identity', 'Yarl Rip Book', 2, null),
  ('yarl_events', 'identity', 'Yarl Events', 3, null),
  ('yarl_tharisanam', 'identity', 'Yarl Tharisanam', 4, null);

create or replace function public._seed_page(p_slug text, p_title_en text, p_sections jsonb)
returns void
language plpgsql
as $$
declare
  v_page uuid;
  v_published uuid;
  v_draft uuid;
  v_index integer;
  v_section jsonb;
begin
  insert into public.pages (slug)
  values (p_slug)
  returning id into v_page;

  insert into public.page_revisions (page_id, version, state)
  values (v_page, 1, 'published')
  returning id into v_published;

  if jsonb_array_length(p_sections) > 0 then
    for v_index in 0 .. jsonb_array_length(p_sections) - 1 loop
      v_section := p_sections -> v_index;
      insert into public.page_sections (revision_id, block_type, sort_order, content)
      values (
        v_published,
        v_section ->> 'block_type',
        v_index,
        coalesce(v_section -> 'content', '{}'::jsonb)
      );
    end loop;
  end if;

  insert into public.page_revisions (page_id, version, state)
  values (v_page, 2, 'draft')
  returning id into v_draft;

  insert into public.page_sections (
    revision_id, block_type, sort_order, is_visible, content, style, animation
  )
  select v_draft, block_type, sort_order, is_visible, content, style, animation
  from public.page_sections
  where revision_id = v_published;

  insert into public.seo_metadata (page_id, locale, title, description)
  values
    (v_page, 'en', p_title_en, ''),
    (v_page, 'ta', '', '');
end;
$$;

select public._seed_page(
  'home',
  'Oliyaruvi Digital Colour Lab',
  jsonb_build_array(
    jsonb_build_object(
      'block_type', 'hero',
      'content', jsonb_build_object(
        'mediaType', 'image',
        'mediaIds', '[]'::jsonb,
        'autoplay', false,
        'mute', true,
        'loop', false,
        'primaryHref', '/photography',
        'secondaryHref', 'https://wa.me/94773928215',
        'en', jsonb_build_object(
          'heading', 'Oliyaruvi Digital Colour Lab',
          'subheading', 'Photography, videography, printing, and custom gifts in Nelliady.',
          'body', '',
          'primaryLabel', 'View portfolio',
          'secondaryLabel', 'WhatsApp'
        ),
        'ta', jsonb_build_object(
          'heading', 'ஒளியருவி டிஜிட்டல் கலர் லேப்',
          'subheading', '',
          'body', '',
          'primaryLabel', '',
          'secondaryLabel', ''
        )
      )
    ),
    jsonb_build_object(
      'block_type', 'services',
      'content', jsonb_build_object(
        'en', jsonb_build_object('heading', 'Services'),
        'ta', jsonb_build_object('heading', ''),
        'items', jsonb_build_array(
          jsonb_build_object('href', '/photography', 'icon', 'camera', 'en', jsonb_build_object('title', 'Photography', 'text', ''), 'ta', jsonb_build_object('title', '', 'text', '')),
          jsonb_build_object('href', '/videography', 'icon', 'video', 'en', jsonb_build_object('title', 'Videography', 'text', ''), 'ta', jsonb_build_object('title', '', 'text', '')),
          jsonb_build_object('href', '/printing', 'icon', 'print', 'en', jsonb_build_object('title', 'Printing', 'text', ''), 'ta', jsonb_build_object('title', '', 'text', '')),
          jsonb_build_object('href', '/gifts', 'icon', 'gift', 'en', jsonb_build_object('title', 'Custom Gifts', 'text', ''), 'ta', jsonb_build_object('title', '', 'text', '')),
          jsonb_build_object('href', '/live', 'icon', 'live', 'en', jsonb_build_object('title', 'Live Streaming', 'text', ''), 'ta', jsonb_build_object('title', '', 'text', ''))
        )
      )
    ),
    jsonb_build_object(
      'block_type', 'statistics',
      'content', jsonb_build_object(
        'items', jsonb_build_array(
          jsonb_build_object(
            'valueSource', 'setting',
            'settingKey', 'experience_years',
            'en', jsonb_build_object('label', 'Years'),
            'ta', jsonb_build_object('label', '')
          )
        )
      )
    ),
    jsonb_build_object('block_type', 'gallery', 'content', jsonb_build_object('mediaIds', '[]'::jsonb, 'layout', 'masonry', 'en', jsonb_build_object('heading', 'Photographs'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'video_gallery', 'content', jsonb_build_object('en', jsonb_build_object('heading', 'Films'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'live_events', 'content', jsonb_build_object('mode', 'upcoming', 'limit', 3, 'en', jsonb_build_object('heading', 'Live'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'product_grid', 'content', jsonb_build_object('catalogue', 'printing', 'featuredOnly', true, 'limit', 4, 'en', jsonb_build_object('heading', 'Printing'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'product_grid', 'content', jsonb_build_object('catalogue', 'gifts', 'featuredOnly', true, 'limit', 4, 'en', jsonb_build_object('heading', 'Custom gifts'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'testimonials', 'content', jsonb_build_object('featuredOnly', true, 'limit', 3, 'en', jsonb_build_object('heading', 'Testimonials'), 'ta', jsonb_build_object('heading', ''))),
    jsonb_build_object('block_type', 'contact_form', 'content', jsonb_build_object('purpose', 'contact', 'showPhone', true, 'showWhatsapp', true, 'showMap', true, 'showHours', true, 'en', jsonb_build_object('heading', 'Contact', 'intro', ''), 'ta', jsonb_build_object('heading', '', 'intro', '')))
  )
);

select public._seed_page(
  'photography',
  'Photography',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Photography', 'subheading', '', 'body', '', 'primaryLabel', 'Enquire', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'gallery', 'content', jsonb_build_object('mediaIds', '[]'::jsonb, 'layout', 'masonry', 'en', jsonb_build_object('heading', 'Photographs'), 'ta', jsonb_build_object('heading', '')))
  )
);

select public._seed_page(
  'videography',
  'Videography',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Videography', 'subheading', '', 'body', '', 'primaryLabel', 'Enquire', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'video_gallery', 'content', jsonb_build_object('en', jsonb_build_object('heading', 'Films'), 'ta', jsonb_build_object('heading', '')))
  )
);

select public._seed_page(
  'printing',
  'Printing',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Printing', 'subheading', '', 'body', '', 'primaryLabel', 'Request a quote', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'product_grid', 'content', jsonb_build_object('catalogue', 'printing', 'featuredOnly', false, 'limit', 12, 'en', jsonb_build_object('heading', 'Printing services'), 'ta', jsonb_build_object('heading', '')))
  )
);

select public._seed_page(
  'gifts',
  'Custom gifts',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Custom gifts', 'subheading', '', 'body', '', 'primaryLabel', 'Enquire', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'product_grid', 'content', jsonb_build_object('catalogue', 'gifts', 'featuredOnly', false, 'limit', 12, 'en', jsonb_build_object('heading', 'Gifts'), 'ta', jsonb_build_object('heading', '')))
  )
);

select public._seed_page(
  'live',
  'Live streaming',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Live streaming', 'subheading', '', 'body', '', 'primaryLabel', 'Enquire', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'live_events', 'content', jsonb_build_object('mode', 'upcoming', 'limit', 6, 'en', jsonb_build_object('heading', 'Events'), 'ta', jsonb_build_object('heading', '')))
  )
);

select public._seed_page(
  'about',
  'About us',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'About us', 'subheading', '', 'body', '', 'primaryLabel', 'Contact', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'text', 'content', jsonb_build_object('en', jsonb_build_object('heading', 'The studio', 'body', ''), 'ta', jsonb_build_object('heading', '', 'body', ''))),
    jsonb_build_object('block_type', 'custom_layout', 'content', jsonb_build_object('columns', 1, 'columnContent', jsonb_build_array(jsonb_build_object('en', jsonb_build_object('heading', 'Our story', 'body', ''), 'ta', jsonb_build_object('heading', '', 'body', '')))))
  )
);

select public._seed_page(
  'booking',
  'Book a service',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/contact', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Book a service', 'subheading', '', 'body', '', 'primaryLabel', 'Contact', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'contact_form', 'content', jsonb_build_object('purpose', 'booking', 'showPhone', true, 'showWhatsapp', true, 'showMap', false, 'showHours', false, 'en', jsonb_build_object('heading', 'Booking enquiry', 'intro', ''), 'ta', jsonb_build_object('heading', '', 'intro', '')))
  )
);

select public._seed_page(
  'contact',
  'Contact',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/booking', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Contact', 'subheading', '', 'body', '', 'primaryLabel', 'Book a service', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'contact_form', 'content', jsonb_build_object('purpose', 'contact', 'showPhone', true, 'showWhatsapp', true, 'showMap', true, 'showHours', true, 'en', jsonb_build_object('heading', 'Enquiry', 'intro', ''), 'ta', jsonb_build_object('heading', '', 'intro', '')))
  )
);

select public._seed_page(
  'portfolio',
  'Portfolio',
  jsonb_build_array(
    jsonb_build_object('block_type', 'hero', 'content', jsonb_build_object('mediaType', 'image', 'mediaIds', '[]'::jsonb, 'autoplay', false, 'mute', true, 'loop', false, 'primaryHref', '/photography', 'secondaryHref', '', 'en', jsonb_build_object('heading', 'Portfolio', 'subheading', '', 'body', '', 'primaryLabel', 'Photography', 'secondaryLabel', ''), 'ta', jsonb_build_object('heading', '', 'subheading', '', 'body', '', 'primaryLabel', '', 'secondaryLabel', ''))),
    jsonb_build_object('block_type', 'text', 'content', jsonb_build_object('en', jsonb_build_object('heading', 'Selected work', 'body', ''), 'ta', jsonb_build_object('heading', '', 'body', '')))
  )
);

drop function public._seed_page(text, text, jsonb);
