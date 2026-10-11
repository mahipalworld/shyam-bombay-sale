-- ========================================================
-- SBS STORE — SUPABASE DATABASE SECURITY HARDENING
-- Run this in Supabase Dashboard -> SQL Editor
-- This removes public write wildcards and locks down tables.
-- ========================================================

-- 1. SECURE PRODUCTS TABLE
DROP POLICY IF EXISTS "Public write products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
DROP POLICY IF EXISTS "Allow public update products" ON public.products;
DROP POLICY IF EXISTS "Allow public write products" ON public.products;

CREATE POLICY "Admins can manage products" ON public.products
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 2. SECURE CATEGORIES TABLE
DROP POLICY IF EXISTS "Public write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 3. SECURE STORE SETTINGS TABLE
DROP POLICY IF EXISTS "Public write store_settings" ON public.store_settings;

CREATE POLICY "Admins can manage store_settings" ON public.store_settings
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 4. SECURE COUPONS TABLE
DROP POLICY IF EXISTS "Public write coupons" ON public.coupons;

CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 5. SECURE ORDERS TABLE (Customer Data & Payment Privacy)
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Public write orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Allow customers to view ONLY their own orders (and admins to view all)
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT TO public
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- Allow authenticated users and guests to insert new orders
CREATE POLICY "Users and guests can insert orders" ON public.orders
FOR INSERT TO public
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (user_id IS NULL)
);

-- Admins can update/manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 6. SECURE BROADCAST NOTIFICATIONS
DROP POLICY IF EXISTS "Allow public delete of broadcast_notifications" ON public.broadcast_notifications;
DROP POLICY IF EXISTS "Allow public insert of broadcast_notifications" ON public.broadcast_notifications;

CREATE POLICY "Admins can manage broadcast_notifications" ON public.broadcast_notifications
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);

-- 7. SECURE RETURN REQUESTS
DROP POLICY IF EXISTS "Public write return_requests" ON public.return_requests;
DROP POLICY IF EXISTS "Public read return_requests" ON public.return_requests;

CREATE POLICY "Customers can insert return requests" ON public.return_requests
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage return requests" ON public.return_requests
FOR ALL TO authenticated
USING (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
)
WITH CHECK (
  ((auth.jwt() ->> 'email') = ANY (ARRAY['mahipalstudent71@gmail.com', 'shyambombaysale@gmail.com', 'mahipalworld71@gmail.com', 'devanshipatel564@gmail.com']))
  OR EXISTS (
    SELECT 1 FROM admin_team_members
    WHERE admin_team_members.email = (auth.jwt() ->> 'email') AND admin_team_members.status = 'ACTIVE'
  )
);
