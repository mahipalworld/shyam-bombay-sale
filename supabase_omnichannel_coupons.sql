-- ============================================================
-- SBS STORE: OMNICHANNEL COUPON SYSTEM & IN-STORE CASHIER REDEMPTION
-- Database: SBS Store Supabase (pclwoyqrlfyqfqojhmag)
-- File: supabase_omnichannel_coupons.sql
--
-- Introduces:
--   1. Extensions to public.coupons:
--      - channel_applicability ('PHYSICAL_STORE_ONLY', 'ONLINE_ONLY', 'ALL_CHANNELS')
--      - customer_eligibility ('ALL', 'NEW_CUSTOMERS_ONLY', 'RETURNING_CUSTOMERS_ONLY')
--      - usage_limit_per_customer (INTEGER DEFAULT 1)
--      - terms_and_conditions (TEXT)
--   2. Authoritative Seed: SBS20 In-Store Welcome Voucher (Flat ₹200 OFF > ₹999)
--   3. public.coupon_issuances table for tracking claims & redemptions
--   4. Deduplication unique index: (phone_normalized, upper(coupon_code))
--   5. Cashier, journey, and audit indexes
--   6. Normalization trigger for canonical 10-digit phone
--   7. Row Level Security policies for authenticated staff/cashiers & service_role
--   8. Three authoritative SECURITY DEFINER RPCs:
--      - lookup_customer_by_phone(phone_input, p_phone_suffix)
--      - redeem_in_store_coupon(p_phone, p_coupon_code, p_cashier_id)
--      - get_customer_order_status(p_phone, p_order_number)
--
-- Idempotent — safe to execute multiple times.
-- ============================================================

-- Ensure UUID generation extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. BASE COUPONS TABLE & OMNICHANNEL EXTENSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FLAT', 'PERCENTAGE')),
  value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  expires_at TIMESTAMPTZ,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add Omnichannel Governance Columns
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS channel_applicability TEXT NOT NULL DEFAULT 'ALL_CHANNELS',
  ADD COLUMN IF NOT EXISTS customer_eligibility TEXT NOT NULL DEFAULT 'ALL',
  ADD COLUMN IF NOT EXISTS usage_limit_per_customer INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Named Check Constraints for public.coupons (Idempotent DO $$ block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coupons_channel_applicability_check'
      AND conrelid = 'public.coupons'::regclass
  ) THEN
    ALTER TABLE public.coupons
      ADD CONSTRAINT coupons_channel_applicability_check
      CHECK (channel_applicability IN ('PHYSICAL_STORE_ONLY', 'ONLINE_ONLY', 'ALL_CHANNELS'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coupons_customer_eligibility_check'
      AND conrelid = 'public.coupons'::regclass
  ) THEN
    ALTER TABLE public.coupons
      ADD CONSTRAINT coupons_customer_eligibility_check
      CHECK (customer_eligibility IN ('ALL', 'NEW_CUSTOMERS_ONLY', 'RETURNING_CUSTOMERS_ONLY'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coupons_usage_limit_check'
      AND conrelid = 'public.coupons'::regclass
  ) THEN
    ALTER TABLE public.coupons
      ADD CONSTRAINT coupons_usage_limit_check
      CHECK (usage_limit_per_customer > 0);
  END IF;
END $$;

-- Case-insensitive unique index on coupon code
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper
  ON public.coupons (upper(code));

-- Seed Authoritative In-Store QR Voucher: SBS20 (Flat ₹200 OFF > ₹999)
INSERT INTO public.coupons (
  id, code, title, discount_type, value, min_order_value, max_discount,
  channel_applicability, customer_eligibility, usage_limit_per_customer,
  description, expires_at, is_active
) VALUES (
  'coup_in_store_sbs20',
  'SBS20',
  'In-Store Walk-In Welcome Voucher',
  'FLAT',
  200,
  999,
  200,
  'PHYSICAL_STORE_ONLY',
  'ALL',
  1,
  'Exclusive in-store walk-in discount of Flat ₹200 OFF on billing above ₹999.',
  '2026-12-31 23:59:59+00',
  true
)
ON CONFLICT (code) DO UPDATE SET
  channel_applicability = 'PHYSICAL_STORE_ONLY',
  customer_eligibility = 'ALL',
  usage_limit_per_customer = 1,
  value = 200,
  min_order_value = 999,
  is_active = true;

-- ============================================================
-- 2. COUPON_ISSUANCES TABLE DEFINITION
-- Tracks claims from In-Store QR stands and website touchpoints
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coupon_issuances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  customer_name TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FLAT', 'PERCENTAGE')),
  discount_value NUMERIC(10,2) NOT NULL,
  journey TEXT NOT NULL DEFAULT 'IN_STORE_QR'
    CHECK (journey IN ('IN_STORE_QR', 'WEBSITE', 'PROMO', 'WEBSITE_FLOATING', 'PRODUCT_PAGE', 'ORDER_SUCCESS', 'BROADCAST_CAMPAIGN')),
  touchpoint_ref TEXT NOT NULL DEFAULT '[ref:store_walkin]',
  status TEXT NOT NULL DEFAULT 'ISSUED'
    CHECK (status IN ('ISSUED', 'REDEEMED', 'EXPIRED', 'CANCELLED')),
  discount_applied NUMERIC(10,2),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by_cashier TEXT,
  attributed_order_number TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES FOR COUPON_ISSUANCES
-- ============================================================

-- Unique deduplication index: 1 issuance per customer phone & coupon code
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_issuances_phone_code
  ON public.coupon_issuances (phone_normalized, upper(coupon_code));

-- Cashier phone lookup index for fast counter checkout
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_phone_normalized
  ON public.coupon_issuances (phone_normalized);

-- Status index
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_status
  ON public.coupon_issuances (status);

-- Journey index
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_journey
  ON public.coupon_issuances (journey);

-- Journey and status composite index for conversion analytics
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_journey_status
  ON public.coupon_issuances (journey, status);

-- Redemption index for cashier audit and daily settlement logs
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_redeemed_at
  ON public.coupon_issuances (redeemed_at)
  WHERE redeemed_at IS NOT NULL;

-- Attributed order number index for closed-loop attribution
CREATE INDEX IF NOT EXISTS idx_coupon_issuances_order
  ON public.coupon_issuances (attributed_order_number)
  WHERE attributed_order_number IS NOT NULL;

-- ============================================================
-- 4. PHONE NORMALIZATION & UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.trg_normalize_coupon_issuance_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_digits TEXT;
BEGIN
  -- 1. Normalize Coupon Code to uppercase trimmed
  NEW.coupon_code := upper(trim(COALESCE(NEW.coupon_code, '')));

  -- 2. Normalize Phone to Trailing 10 Digits
  v_digits := regexp_replace(COALESCE(NEW.phone, ''), '\D', '', 'g');
  IF length(v_digits) > 10 THEN
    NEW.phone_normalized := right(v_digits, 10);
  ELSIF length(v_digits) >= 7 THEN
    NEW.phone_normalized := v_digits;
  ELSE
    NEW.phone_normalized := COALESCE(NEW.phone_normalized, v_digits);
  END IF;

  -- 3. Synchronize status with redeemed_at
  IF NEW.redeemed_at IS NOT NULL AND NEW.status = 'ISSUED' THEN
    NEW.status := 'REDEEMED';
  ELSIF NEW.status = 'REDEEMED' AND NEW.redeemed_at IS NULL THEN
    NEW.redeemed_at := NOW();
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_coupon_issuance ON public.coupon_issuances;
CREATE TRIGGER trg_normalize_coupon_issuance
  BEFORE INSERT OR UPDATE OF phone, phone_normalized, coupon_code, redeemed_at, status
  ON public.coupon_issuances
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_normalize_coupon_issuance_data();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.coupon_issuances ENABLE ROW LEVEL SECURITY;

-- Drop prior policies if recreating
DROP POLICY IF EXISTS "Admins and cashiers can manage coupon issuances" ON public.coupon_issuances;
DROP POLICY IF EXISTS "Service role full access on coupon issuances" ON public.coupon_issuances;
DROP POLICY IF EXISTS "Allow public read coupon issuances" ON public.coupon_issuances;

-- Admins and Cashiers manage issuances
CREATE POLICY "Admins and cashiers can manage coupon issuances"
  ON public.coupon_issuances
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() ->> 'email') = ANY (ARRAY[
      'mahipalstudent71@gmail.com',
      'shyambombaysale@gmail.com',
      'mahipalworld71@gmail.com',
      'devanshipatel564@gmail.com'
    ]))
    OR EXISTS (
      SELECT 1 FROM public.admin_team_members
      WHERE admin_team_members.email = (auth.jwt() ->> 'email')
        AND admin_team_members.status = 'ACTIVE'
    )
  )
  WITH CHECK (
    ((auth.jwt() ->> 'email') = ANY (ARRAY[
      'mahipalstudent71@gmail.com',
      'shyambombaysale@gmail.com',
      'mahipalworld71@gmail.com',
      'devanshipatel564@gmail.com'
    ]))
    OR EXISTS (
      SELECT 1 FROM public.admin_team_members
      WHERE admin_team_members.email = (auth.jwt() ->> 'email')
        AND admin_team_members.status = 'ACTIVE'
    )
  );

-- Service role direct access
CREATE POLICY "Service role full access on coupon issuances"
  ON public.coupon_issuances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public read for lookup/verification via anon & authenticated
CREATE POLICY "Allow public read coupon issuances"
  ON public.coupon_issuances
  FOR SELECT
  TO public
  USING (true);

-- ============================================================
-- 6. AUTHORITATIVE SECURITY DEFINER RPCS
-- ============================================================

-- ------------------------------------------------------------
-- 6.1. Customer Identity & Order Summary Lookup
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.lookup_customer_by_phone(text);
DROP FUNCTION IF EXISTS public.lookup_customer_by_phone(text, text);

CREATE OR REPLACE FUNCTION public.lookup_customer_by_phone(
  phone_input text DEFAULT NULL,
  p_phone_suffix text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_input text;
  v_clean_digits text;
  v_profile record;
  v_order record;
  v_order_count integer := 0;
BEGIN
  -- 1. Dual-parameter resolution (supports phone_input and legacy p_phone_suffix)
  v_raw_input := COALESCE(NULLIF(trim(phone_input), ''), NULLIF(trim(p_phone_suffix), ''), '');
  v_clean_digits := regexp_replace(v_raw_input, '\D', '', 'g');

  -- 2. Normalize to trailing 10 digits (Indian standard mobile)
  IF length(v_clean_digits) > 10 THEN
    v_clean_digits := right(v_clean_digits, 10);
  END IF;

  -- 3. Minimum length validation
  IF length(v_clean_digits) < 7 THEN
    RETURN jsonb_build_object(
      'found', false,
      'reason', 'phone_too_short'
    );
  END IF;

  -- 4. Search in registered customer profiles (public.profiles)
  SELECT id, name, email, phone, reward_points, created_at
  INTO v_profile
  FROM public.profiles
  WHERE regexp_replace(COALESCE(phone, ''), '\D', '', 'g') LIKE '%' || v_clean_digits
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_profile.id IS NOT NULL THEN
    -- Calculate order count across profile ID and matching shipping phone
    SELECT count(*)
    INTO v_order_count
    FROM public.orders
    WHERE user_id = v_profile.id
       OR regexp_replace(COALESCE(shipping_address->>'phone', ''), '\D', '', 'g') LIKE '%' || v_clean_digits;

    -- Fetch most recent order
    SELECT order_number, total, status, created_at
    INTO v_order
    FROM public.orders
    WHERE user_id = v_profile.id
       OR regexp_replace(COALESCE(shipping_address->>'phone', ''), '\D', '', 'g') LIKE '%' || v_clean_digits
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN jsonb_build_object(
      'found', true,
      'source', 'profile',
      'customer', jsonb_build_object(
        'id', v_profile.id,
        'name', COALESCE(v_profile.name, 'Valued Member'),
        'email', v_profile.email,
        'phone', v_profile.phone,
        'reward_points', COALESCE(v_profile.reward_points, 0),
        'created_at', v_profile.created_at
      ),
      'order_summary', jsonb_build_object(
        'total_orders', COALESCE(v_order_count, 0),
        'recent_order', CASE WHEN v_order.order_number IS NOT NULL THEN
          jsonb_build_object(
            'order_number', v_order.order_number,
            'total', v_order.total,
            'status', v_order.status,
            'created_at', v_order.created_at
          ) ELSE NULL END
      )
    );
  END IF;

  -- 5. Fallback: Search guest orders (public.orders)
  SELECT count(*)
  INTO v_order_count
  FROM public.orders
  WHERE regexp_replace(COALESCE(shipping_address->>'phone', ''), '\D', '', 'g') LIKE '%' || v_clean_digits;

  IF v_order_count > 0 THEN
    SELECT order_number, total, status, shipping_address, created_at
    INTO v_order
    FROM public.orders
    WHERE regexp_replace(COALESCE(shipping_address->>'phone', ''), '\D', '', 'g') LIKE '%' || v_clean_digits
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN jsonb_build_object(
      'found', true,
      'source', 'guest_order',
      'customer', jsonb_build_object(
        'name', COALESCE(v_order.shipping_address->>'name', 'Valued Customer'),
        'phone', v_order.shipping_address->>'phone'
      ),
      'order_summary', jsonb_build_object(
        'total_orders', v_order_count,
        'recent_order', jsonb_build_object(
          'order_number', v_order.order_number,
          'total', v_order.total,
          'status', v_order.status,
          'created_at', v_order.created_at
        )
      )
    );
  END IF;

  -- 6. No matching profile or order found
  RETURN jsonb_build_object(
    'found', false,
    'reason', 'not_found'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_customer_by_phone(text, text) TO anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 6.2. Atomic In-Store Cashier Coupon Redemption
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.redeem_in_store_coupon(text, text, text);

CREATE OR REPLACE FUNCTION public.redeem_in_store_coupon(
  p_phone text,
  p_coupon_code text,
  p_cashier_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone_clean text;
  v_clean_code text;
  v_clean_cashier text;
  v_coupon record;
  v_issuance record;
  v_now timestamptz := NOW();
BEGIN
  -- 1. Input Sanitization
  v_phone_clean := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
  IF length(v_phone_clean) > 10 THEN
    v_phone_clean := right(v_phone_clean, 10);
  END IF;

  v_clean_code := upper(trim(COALESCE(p_coupon_code, '')));
  v_clean_cashier := trim(COALESCE(p_cashier_id, ''));

  -- 2. Input Validation
  IF length(v_phone_clean) < 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_phone',
      'reason', 'invalid_phone',
      'message', 'Please enter a valid 10-digit mobile number.'
    );
  END IF;

  IF v_clean_code = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'missing_coupon_code',
      'reason', 'missing_coupon_code',
      'message', 'Please provide a coupon code.'
    );
  END IF;

  IF v_clean_cashier = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'missing_cashier_id',
      'reason', 'missing_cashier_id',
      'message', 'Cashier ID is required for audit trail.'
    );
  END IF;

  -- 3. Lookup Coupon Definition in public.coupons
  SELECT *
  INTO v_coupon
  FROM public.coupons
  WHERE upper(code) = v_clean_code
    AND (is_active IS NULL OR is_active = true)
  LIMIT 1;

  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'coupon_not_found',
      'reason', 'coupon_not_found',
      'message', 'Coupon code ' || v_clean_code || ' is invalid or currently inactive.'
    );
  END IF;

  -- 4. Expiry Check
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < v_now THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'coupon_expired',
      'reason', 'coupon_expired',
      'message', 'This coupon expired on ' || to_char(v_coupon.expires_at, 'YYYY-MM-DD') || '.'
    );
  END IF;

  -- 5. Channel Applicability Check (must allow physical store)
  IF v_coupon.channel_applicability = 'ONLINE_ONLY' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'channel_not_applicable',
      'reason', 'channel_not_applicable',
      'message', 'This coupon code is valid only for online purchases on sbsstore.in.'
    );
  END IF;

  -- 6. Lock Issuance Row FOR UPDATE (Prevents Concurrent Double-Redemption)
  SELECT *
  INTO v_issuance
  FROM public.coupon_issuances
  WHERE (
    phone_normalized = v_phone_clean
    OR right(regexp_replace(phone, '\D', '', 'g'), 10) = v_phone_clean
  )
    AND upper(coupon_code) = v_clean_code
  FOR UPDATE;

  -- 7. If Issuance Exists, Verify Redemption State
  IF v_issuance.id IS NOT NULL THEN
    IF v_issuance.redeemed_at IS NOT NULL OR v_issuance.status = 'REDEEMED' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'already_redeemed',
        'reason', 'already_redeemed',
        'redeemed_at', v_issuance.redeemed_at,
        'redeemed_by_cashier', v_issuance.redeemed_by_cashier,
        'message', 'Coupon has already been redeemed'
      );
    END IF;

    -- Execute Atomic Redemption Update
    UPDATE public.coupon_issuances
    SET status = 'REDEEMED',
        redeemed_at = v_now,
        redeemed_by_cashier = v_clean_cashier,
        discount_applied = COALESCE(v_coupon.value, discount_applied, 200),
        updated_at = v_now
    WHERE id = v_issuance.id;

    RETURN jsonb_build_object(
      'success', true,
      'coupon_code', v_clean_code,
      'phone', v_phone_clean,
      'discount_value', COALESCE(v_coupon.value, v_issuance.discount_applied, 200),
      'discount_type', COALESCE(v_coupon.discount_type, 'FLAT'),
      'min_order_value', COALESCE(v_coupon.min_order_value, 999),
      'customer_name', COALESCE(v_issuance.customer_name, 'In-Store Shopper'),
      'redeemed_at', v_now,
      'redeemed_by_cashier', v_clean_cashier,
      'message', 'Coupon ' || v_clean_code || ' redeemed successfully'
    );
  END IF;

  -- 8. If No Prior Issuance Exists: Handle Direct In-Store Walk-In
  IF v_coupon.channel_applicability IN ('PHYSICAL_STORE_ONLY', 'ALL_CHANNELS') THEN
    BEGIN
      INSERT INTO public.coupon_issuances (
        coupon_code,
        phone,
        phone_normalized,
        customer_name,
        discount_type,
        discount_value,
        journey,
        touchpoint_ref,
        status,
        discount_applied,
        issued_at,
        redeemed_at,
        redeemed_by_cashier
      ) VALUES (
        v_clean_code,
        v_phone_clean,
        v_phone_clean,
        'Walk-In Customer',
        COALESCE(v_coupon.discount_type, 'FLAT'),
        COALESCE(v_coupon.value, 200),
        'IN_STORE_QR',
        '[ref:store_walkin]',
        'REDEEMED',
        COALESCE(v_coupon.value, 200),
        v_now,
        v_now,
        v_clean_cashier
      );

      RETURN jsonb_build_object(
        'success', true,
        'coupon_code', v_clean_code,
        'phone', v_phone_clean,
        'discount_value', COALESCE(v_coupon.value, 200),
        'discount_type', COALESCE(v_coupon.discount_type, 'FLAT'),
        'min_order_value', COALESCE(v_coupon.min_order_value, 999),
        'customer_name', 'Walk-In Customer',
        'redeemed_at', v_now,
        'redeemed_by_cashier', v_clean_cashier,
        'message', 'Coupon ' || v_clean_code || ' redeemed successfully'
      );
    EXCEPTION WHEN unique_violation THEN
      -- Race condition safety: Lock existing row and report already redeemed
      SELECT * INTO v_issuance
      FROM public.coupon_issuances
      WHERE (
        phone_normalized = v_phone_clean
        OR right(regexp_replace(phone, '\D', '', 'g'), 10) = v_phone_clean
      )
        AND upper(coupon_code) = v_clean_code
      FOR UPDATE;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'already_redeemed',
        'reason', 'already_redeemed',
        'redeemed_at', v_issuance.redeemed_at,
        'redeemed_by_cashier', v_issuance.redeemed_by_cashier,
        'message', 'Coupon has already been redeemed'
      );
    END;
  END IF;

  -- 9. Fallthrough: Ineligible
  RETURN jsonb_build_object(
    'success', false,
    'error', 'no_issuance_found',
    'reason', 'no_issuance_found',
    'message', 'No valid coupon issuance found for this customer phone.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_in_store_coupon(text, text, text) TO anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 6.3. Security Definer Order Status Tracking with Phone Verification
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_customer_order_status(text, text);

CREATE OR REPLACE FUNCTION public.get_customer_order_status(
  p_phone text,
  p_order_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone_clean text;
  v_clean_order text;
  v_order record;
  v_order_phone text;
  v_profile_phone text;
  v_authorized boolean := false;
  v_courier_partner text;
  v_tracking_url text;
  v_items_summary text := '';
BEGIN
  -- 1. Input Sanitization
  v_phone_clean := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
  IF length(v_phone_clean) > 10 THEN
    v_phone_clean := right(v_phone_clean, 10);
  END IF;

  v_clean_order := upper(trim(COALESCE(p_order_number, '')));

  -- 2. Input Validation
  IF length(v_phone_clean) < 7 THEN
    RETURN jsonb_build_object(
      'found', false,
      'authorized', false,
      'reason', 'invalid_phone',
      'message', 'Please provide a valid phone number.'
    );
  END IF;

  IF v_clean_order = '' THEN
    RETURN jsonb_build_object(
      'found', false,
      'authorized', false,
      'reason', 'missing_order_number',
      'message', 'Order number is required.'
    );
  END IF;

  -- 3. Lookup Order in public.orders
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE upper(order_number) = v_clean_order
     OR upper(id::text) = v_clean_order
  LIMIT 1;

  -- Order Not Found
  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object(
      'found', false,
      'authorized', false,
      'reason', 'order_not_found',
      'message', 'No order found matching order number ' || v_clean_order || '.'
    );
  END IF;

  -- 4. Verify Phone Ownership
  -- Check A: Shipping Address phone
  v_order_phone := regexp_replace(COALESCE(v_order.shipping_address->>'phone', ''), '\D', '', 'g');
  IF length(v_order_phone) > 10 THEN
    v_order_phone := right(v_order_phone, 10);
  END IF;

  IF v_order_phone = v_phone_clean THEN
    v_authorized := true;
  END IF;

  -- Check B: Linked User Profile phone
  IF NOT v_authorized AND v_order.user_id IS NOT NULL THEN
    SELECT regexp_replace(COALESCE(phone, ''), '\D', '', 'g')
    INTO v_profile_phone
    FROM public.profiles
    WHERE id = v_order.user_id;

    IF length(v_profile_phone) > 10 THEN
      v_profile_phone := right(v_profile_phone, 10);
    END IF;

    IF v_profile_phone = v_phone_clean THEN
      v_authorized := true;
    END IF;
  END IF;

  -- 5. Phone Mismatch: Return Privacy Shield Payload (found: true, authorized: false)
  IF NOT v_authorized THEN
    RETURN jsonb_build_object(
      'found', true,
      'authorized', false,
      'reason', 'phone_mismatch',
      'message', 'For data privacy, order details can only be shared with the verified contact number associated with this order.'
    );
  END IF;

  -- 6. Derive Courier Partner and Tracking URL
  v_courier_partner := CASE
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(DL|DELHIVERY)' THEN 'Delhivery'
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(SF|SHADOWFAX)' THEN 'Shadowfax'
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(BD|BLUEDART)' THEN 'BlueDart'
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(EK|EKART)' THEN 'Ekart'
    WHEN v_order.tracking_number IS NOT NULL AND trim(v_order.tracking_number) <> '' THEN 'Delhivery Express'
    ELSE 'Surface Courier'
  END;

  v_tracking_url := CASE
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(DL|DELHIVERY)'
      THEN 'https://www.delhivery.com/track/package/' || v_order.tracking_number
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(SF|SHADOWFAX)'
      THEN 'https://shadowfax.in/track/' || v_order.tracking_number
    WHEN upper(COALESCE(v_order.tracking_number, '')) ~ '^(BD|BLUEDART)'
      THEN 'https://www.bluedart.com/tracking?trackNumber=' || v_order.tracking_number
    WHEN v_order.tracking_number IS NOT NULL AND trim(v_order.tracking_number) <> ''
      THEN 'https://www.delhivery.com/track/package/' || v_order.tracking_number
    ELSE NULL
  END;

  -- 7. Build Items Summary
  IF jsonb_typeof(v_order.items) = 'array' THEN
    SELECT string_agg(
      COALESCE(elem->>'name', 'Item') || ' (Qty: ' || COALESCE(elem->>'quantity', '1') || ')',
      ', '
    )
    INTO v_items_summary
    FROM jsonb_array_elements(v_order.items) AS elem;
  END IF;

  IF v_items_summary IS NULL OR v_items_summary = '' THEN
    v_items_summary := 'Products';
  END IF;

  -- 8. Return Full Authorized Order Payload
  RETURN jsonb_build_object(
    'found', true,
    'authorized', true,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'total', v_order.total,
    'subtotal', v_order.subtotal,
    'discount', COALESCE(v_order.discount, 0),
    'delivery_charge', COALESCE(v_order.delivery_charge, 0),
    'payment_method', v_order.payment_method,
    'tracking_number', v_order.tracking_number,
    'courier_partner', v_courier_partner,
    'tracking_url', v_tracking_url,
    'estimated_delivery', COALESCE(v_order.estimated_delivery, '3–5 Business Days'),
    'items_summary', v_items_summary,
    'created_at', v_order.created_at,
    'order', jsonb_build_object(
      'order_number', v_order.order_number,
      'status', v_order.status,
      'total', v_order.total,
      'subtotal', v_order.subtotal,
      'discount', COALESCE(v_order.discount, 0),
      'delivery_charge', COALESCE(v_order.delivery_charge, 0),
      'payment_method', v_order.payment_method,
      'tracking_number', v_order.tracking_number,
      'courier_partner', v_courier_partner,
      'tracking_url', v_tracking_url,
      'estimated_delivery', COALESCE(v_order.estimated_delivery, '3–5 Business Days'),
      'items_summary', v_items_summary,
      'created_at', v_order.created_at
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_order_status(text, text) TO anon, authenticated, service_role;
