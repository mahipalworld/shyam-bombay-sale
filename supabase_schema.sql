-- SBS Store Supabase Database Schema
-- Run this SQL in your Supabase project's SQL Editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  subtitle text,
  image text not null,
  bg_color text not null,
  accent_color text,
  item_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  category text references public.categories(id) on delete set null,
  price numeric(10,2) not null,
  original_price numeric(10,2) not null,
  discount_percentage integer default 0,
  rating numeric(2,1) default 4.5,
  review_count integer default 0,
  image text not null,
  in_stock boolean default true,
  stock_count integer default 10,
  description text,
  features text[],
  video text,
  videos text[],
  video_thumbnail text,
  is_trending boolean default false,
  is_best_seller boolean default false,
  is_deal_of_day boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  avatar_url text,
  reward_points integer default 250,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. CART ITEMS TABLE
create table if not exists public.cart_items (
  id text primary key default uuid_generate_v4()::text,
  user_id uuid references auth.users on delete cascade,
  product_id text references public.products(id) on delete cascade,
  quantity integer default 1,
  selected boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. WISHLIST ITEMS TABLE
create table if not exists public.wishlist_items (
  id text primary key default uuid_generate_v4()::text,
  user_id uuid references auth.users on delete cascade,
  product_id text references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id)
);

-- 6. ORDERS TABLE
create table if not exists public.orders (
  id text primary key default uuid_generate_v4()::text,
  order_number text unique not null,
  user_id uuid references auth.users on delete set null,
  status text not null default 'Processing',
  items jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  delivery_charge numeric(10,2) default 0,
  total numeric(10,2) not null,
  shipping_address jsonb not null,
  payment_method text not null,
  tracking_number text,
  estimated_delivery text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. ADMIN TEAM MEMBERS & ROLES TABLE
create table if not exists public.admin_team_members (
  id text primary key default uuid_generate_v4()::text,
  email text unique not null,
  name text not null,
  role text not null check (role in ('OWNER', 'MANAGER', 'MARKETING', 'STAFF')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED')),
  department text,
  avatar_url text,
  is_super_admin boolean default false,
  added_at timestamp with time zone default timezone('utc'::text, now()),
  last_active timestamp with time zone
);

-- Seed Primary Super Admin
insert into public.admin_team_members (email, name, role, status, is_super_admin, department)
values ('mahipalstudent71@gmail.com', 'Mahipal (Super Admin)', 'OWNER', 'ACTIVE', true, 'Executive Store Management')
on conflict (email) do update set role = 'OWNER', is_super_admin = true, status = 'ACTIVE';

-- Row Level Security (RLS) policies
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.admin_team_members enable row level security;

-- Public read access
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read products" on public.products for select using (true);
create policy "Allow authenticated read team members" on public.admin_team_members for select using (true);
create policy "Allow super admin manage team members" on public.admin_team_members for all using (true);

-- Admin write access for categories and products
-- NOTE: Remove the two "Allow public write" policies below after seeding is complete.
--       In production, writes should only happen via service role (server-side).
create policy "Allow public write categories" on public.categories for insert with check (true);
create policy "Allow public update categories" on public.categories for update using (true) with check (true);
create policy "Allow public write products" on public.products for insert with check (true);
create policy "Allow public update products" on public.products for update using (true) with check (true);

-- User-scoped policies
create policy "Users can view and manage their own cart" on public.cart_items 
  for all using (auth.uid() = user_id);

create policy "Users can view and manage their own wishlist" on public.wishlist_items 
  for all using (auth.uid() = user_id);

create policy "Users can view their own profile" on public.profiles 
  for all using (auth.uid() = id);

create policy "Users can view their own orders" on public.orders 
  for all using (auth.uid() = user_id or user_id is null);

