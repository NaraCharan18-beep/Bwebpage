'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  QrCode, 
  Database, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  ExternalLink,
  Download,
  AlertTriangle,
  MessageCircle,
  Activity,
  Copy,
  Check,
  Sparkles,
  FileCode
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';
import { resetDataToDefaults } from '@/lib/data-store';
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

interface SettingsTabProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onDataReset: () => void;
}

export default function SettingsTab({
  settings,
  onSaveSettings,
  onDataReset,
}: SettingsTabProps) {
  // PIN State
  const [pin, setPin] = useState(settings.admin_pin || '7579');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Supabase State
  const currentSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabase.key);
  const [supabaseStatus, setSupabaseStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [diagReport, setDiagReport] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [showSqlMigration, setShowSqlMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Reset confirmation
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    const newPin = pin.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('pochampally_admin_pin', newPin);
    }
    await onSaveSettings({ ...settings, admin_pin: newPin });
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSupabaseStatus({ type: 'error', message: 'Both Supabase URL and Anon Key are required.' });
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseStatus(null);
    try {
      await setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setSupabaseStatus({
        type: 'success',
        message: 'Credentials saved permanently to server (.env.local)! Testing database & storage permissions now...',
      });
      await runDiagnostics(supabaseUrl.trim(), supabaseKey.trim());
    } catch (err: any) {
      setSupabaseStatus({ type: 'error', message: err.message || 'Failed to save configuration' });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const runDiagnostics = async (urlToTest?: string, keyToTest?: string) => {
    setIsDiagnosing(true);
    setDiagReport(null);
    try {
      const client = getSupabaseClient();
      let accessToken: string | undefined = undefined;
      if (client) {
        try {
          const { data: sessionData } = await client.auth.getSession();
          accessToken = sessionData?.session?.access_token;
        } catch {}
      }

      const res = await fetch('/api/supabase/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToTest || supabaseUrl.trim(),
          key: keyToTest || supabaseKey.trim(),
          accessToken,
        }),
      });
      const data = await res.json();
      setDiagReport(data);
    } catch (e: any) {
      setDiagReport({ success: false, error: e.message || 'Diagnostic network error' });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- ==============================================================================
-- SRI LAXMI NARSHIMA SAREES HOUSE - SUPABASE SCHEMA V2 (ENTERPRISE RBAC & SECURE)
-- Preserves existing tables, columns, rows, images, and catalogue data
-- Implements verified Supabase Auth administrator roles and anti-spam protection
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. Diagnostic Helper: Query Existing Policies (Informational Read-Only)
-- Run this anytime to inspect all active policies on your database:
-- SELECT schemaname, tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname IN ('public', 'storage');
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- 1. Ensure all core tables exist (Preserves existing tables and records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  shop_name TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  description TEXT,
  about_shop TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  opening_hours TEXT,
  google_maps_url TEXT,
  google_maps_embed TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  whatsapp_group_url TEXT,
  website_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dedicated Private Settings Table (Restricted strictly to verified admins; never exposed to public)
CREATE TABLE IF NOT EXISTS public.private_admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  admin_pin TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homepage_content (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  hero_description TEXT,
  hero_image_url TEXT NOT NULL,
  hero_images JSONB DEFAULT '[]'::jsonb,
  hero_badge TEXT,
  explore_btn_text TEXT DEFAULT 'Explore Sarees',
  contact_btn_text TEXT DEFAULT 'Contact Showroom',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.about_content (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  history_text TEXT,
  ikat_explanation TEXT,
  craftsmanship_text TEXT,
  image_url TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  years_of_heritage INT DEFAULT 120,
  weavers_supported INT DEFAULT 85,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.process_steps (
  id TEXT PRIMARY KEY,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  display_order INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  sarees JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  section_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.albums (
  id TEXT PRIMARY KEY,
  collection_id TEXT,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  cover_image TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  saree_code TEXT,
  collection_name TEXT,
  saree_name TEXT,
  album_name TEXT,
  photo_code TEXT,
  saree_sku TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standalone Sarees Catalog Table (Preserves existing schema, records and image URLs)
CREATE TABLE IF NOT EXISTS public.sarees (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  description TEXT,
  price NUMERIC,
  category TEXT,
  image_url TEXT
);

-- Legacy Sares Table (Preserved to prevent foreign key or historical reference breaks)
CREATE TABLE IF NOT EXISTS public."Sares" (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verified Administrator Users Table (Links directly to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Explicit Column Additions (Safe & Idempotent on existing tables)
-- ------------------------------------------------------------------------------
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS sarees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS section_id TEXT;

ALTER TABLE public.homepage_content ADD COLUMN IF NOT EXISTS hero_images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.about_content ADD COLUMN IF NOT EXISTS years_of_heritage INT DEFAULT 120;
ALTER TABLE public.about_content ADD COLUMN IF NOT EXISTS weavers_supported INT DEFAULT 85;

-- Ensure admin_pin column exists temporarily on shop_settings to allow safe migration if present
ALTER TABLE public.shop_settings ADD COLUMN IF NOT EXISTS admin_pin TEXT;

-- Safely copy existing admin_pin only if private_admin_settings does NOT already have a PIN set
-- Prevents accidental overwriting of an existing private PIN
INSERT INTO public.private_admin_settings (id, admin_pin)
SELECT s.id, s.admin_pin 
FROM public.shop_settings s
WHERE s.admin_pin IS NOT NULL AND s.admin_pin <> ''
ON CONFLICT (id) DO UPDATE SET 
  admin_pin = COALESCE(public.private_admin_settings.admin_pin, EXCLUDED.admin_pin);

-- Permanently remove admin_pin from the publicly accessible shop_settings table
ALTER TABLE public.shop_settings DROP COLUMN IF EXISTS admin_pin;

ALTER TABLE public.shop_settings ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;
ALTER TABLE public.shop_settings ADD COLUMN IF NOT EXISTS website_url TEXT;

ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS saree_code TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS collection_name TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS saree_name TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS saree_sku TEXT;

-- ------------------------------------------------------------------------------
-- 3. Fast Query Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_order ON public.collections(display_order);
CREATE INDEX IF NOT EXISTS idx_albums_collection ON public.albums(collection_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- ------------------------------------------------------------------------------
-- 4. Verified Administrator Verification Functions (Security Definer)
-- Strict security: search_path = '' prevents search_path injection attacks.
-- Single source of truth: public.admin_users table.
-- Enabling instant access revocation when an admin row is deleted.
-- ------------------------------------------------------------------------------

-- Check if user is a verified administrator (Single source of truth: public.admin_users)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Returns TRUE only if user is authenticated AND exists in public.admin_users
  -- Returns FALSE immediately for anonymous callers without executing queries
  RETURN COALESCE(
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    ),
    false
  );
END;
$$;

-- Check if user is specifically a verified super_admin (Single source of truth: public.admin_users)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Returns TRUE only if user is authenticated AND has role = 'super_admin' in public.admin_users
  -- Returns FALSE immediately for anonymous callers without executing queries
  RETURN COALESCE(
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND role = 'super_admin'
    ),
    false
  );
END;
$$;

-- Secure Super Admin Registration: Sets role = 'super_admin' (Callable ONLY by service_role or project owner in SQL Editor)
CREATE OR REPLACE FUNCTION public.register_super_admin(admin_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(admin_email)) LIMIT 1;
  IF v_user_id IS NULL THEN
    RETURN 'Notice: User ' || admin_email || ' does not exist in auth.users yet. Create user in Supabase Auth first, then call register_super_admin.';
  END IF;

  INSERT INTO public.admin_users (id, email, role)
  VALUES (v_user_id, lower(trim(admin_email)), 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  RETURN 'Success: ' || admin_email || ' is registered as a verified super_admin (Shop Owner)!';
END;
$$;

-- Secure Ordinary Admin Registration: Sets role = 'admin' (NEVER demotes an existing super_admin)
CREATE OR REPLACE FUNCTION public.register_admin(admin_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_existing_role TEXT;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(admin_email)) LIMIT 1;
  IF v_user_id IS NULL THEN
    RETURN 'Notice: User ' || admin_email || ' does not exist in auth.users yet. Create user in Supabase Auth first, then call register_admin.';
  END IF;

  SELECT role INTO v_existing_role FROM public.admin_users WHERE id = v_user_id;
  IF v_existing_role = 'super_admin' THEN
    RETURN 'Notice: ' || admin_email || ' is already a verified super_admin (Shop Owner). Demotion to ordinary admin is blocked.';
  END IF;

  INSERT INTO public.admin_users (id, email, role)
  VALUES (v_user_id, lower(trim(admin_email)), 'admin')
  ON CONFLICT (id) DO UPDATE SET 
    role = CASE 
      WHEN public.admin_users.role = 'super_admin' THEN 'super_admin' 
      ELSE 'admin' 
    END;

  RETURN 'Success: ' || admin_email || ' is registered as a verified administrator!';
END;
$$;

-- Privileges: Grant execute on is_admin() and is_super_admin() to anon and authenticated
-- Allows public SELECT policies on collections, albums, and process steps to evaluate without permission errors
-- The functions safely return false for anonymous users in zero time
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.register_admin(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_admin(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.register_admin(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.register_admin(TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.register_super_admin(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_super_admin(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.register_super_admin(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.register_super_admin(TEXT) TO service_role;

-- ------------------------------------------------------------------------------
-- 5. Storage Buckets Configuration (Non-destructive: DO NOTHING if bucket exists)
-- Preserves existing bucket privacy and settings if already configured
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('saree-images', 'saree-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('sarees', 'sarees', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('collection-pdfs', 'collection-pdfs', true, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. Enable Row Level Security (RLS) on all tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Sares" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 7. Clean Outdated Restrictive or Overly Permissive Policies
-- Replaces insecure auth.role() = 'authenticated' policies which allowed any logged-in user to write
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Admins have full access to shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Enable read for all on shop_settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Enable write for admin on shop_settings" ON public.shop_settings;

DROP POLICY IF EXISTS "Admins have full access to private_admin_settings" ON public.private_admin_settings;

DROP POLICY IF EXISTS "Public can view homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Admins have full access to homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Enable read for all on homepage_content" ON public.homepage_content;
DROP POLICY IF EXISTS "Enable write for admin on homepage_content" ON public.homepage_content;

DROP POLICY IF EXISTS "Public can view about content" ON public.about_content;
DROP POLICY IF EXISTS "Admins have full access to about content" ON public.about_content;
DROP POLICY IF EXISTS "Enable read for all on about_content" ON public.about_content;
DROP POLICY IF EXISTS "Enable write for admin on about_content" ON public.about_content;

DROP POLICY IF EXISTS "Public can view active process steps" ON public.process_steps;
DROP POLICY IF EXISTS "Admins have full access to process steps" ON public.process_steps;
DROP POLICY IF EXISTS "Enable read for all on process_steps" ON public.process_steps;
DROP POLICY IF EXISTS "Enable write for admin on process_steps" ON public.process_steps;

DROP POLICY IF EXISTS "Public can view active collections" ON public.collections;
DROP POLICY IF EXISTS "Admins have full access to collections" ON public.collections;
DROP POLICY IF EXISTS "Enable read for all on collections" ON public.collections;
DROP POLICY IF EXISTS "Enable write for admin on collections" ON public.collections;

DROP POLICY IF EXISTS "Public can view active albums" ON public.albums;
DROP POLICY IF EXISTS "Admins have full access to albums" ON public.albums;
DROP POLICY IF EXISTS "Enable read for all on albums" ON public.albums;
DROP POLICY IF EXISTS "Enable write for admin on albums" ON public.albums;

DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public can submit validated enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins have full access to enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Enable read for all on enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Enable insert for all on enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Enable update delete for admin on enquiries" ON public.enquiries;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins have full access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;

-- Drop standalone sarees and Sares legacy policies
DROP POLICY IF EXISTS "Public can view sarees" ON public.sarees;
DROP POLICY IF EXISTS "Admins have full access to sarees" ON public.sarees;
DROP POLICY IF EXISTS "Enable read for all on sarees" ON public.sarees;
DROP POLICY IF EXISTS "Enable write for admin on sarees" ON public.sarees;
DROP POLICY IF EXISTS "Allow all on sarees" ON public.sarees;

DROP POLICY IF EXISTS "Public can view Sares" ON public."Sares";
DROP POLICY IF EXISTS "Admins have full access to Sares" ON public."Sares";
DROP POLICY IF EXISTS "Enable read for all on Sares" ON public."Sares";
DROP POLICY IF EXISTS "Enable write for admin on Sares" ON public."Sares";

-- Drop insecure storage upload policies identified in audit
DROP POLICY IF EXISTS "Allow uploads 1jzlisv_0" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Sarees Storage" ON storage.objects;

-- Drop legacy storage policies for saree-images, collection-pdfs and sarees
DROP POLICY IF EXISTS "Public Access for Saree Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Saree Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Saree Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Saree Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for Saree Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete for Saree Images" ON storage.objects;

DROP POLICY IF EXISTS "Public Access for Collection PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Collection PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Collection PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Collection PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for PDFs" ON storage.objects;

DROP POLICY IF EXISTS "Public Access for Sarees Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Sarees Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Sarees Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Sarees Bucket" ON storage.objects;

-- ------------------------------------------------------------------------------
-- 8. Secure Storage Policies (RBAC Enforced)
-- Customers: View published photographs and catalog PDFs (SELECT)
-- Verified Administrators: Upload, update, and delete photographs and catalog PDFs
-- ------------------------------------------------------------------------------

-- Saree Images: Public can view, only Verified Admins can upload/modify/delete
CREATE POLICY "Public Access for Saree Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'saree-images');

CREATE POLICY "Admin Upload Saree Images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'saree-images' AND public.is_admin());

CREATE POLICY "Admin Update Saree Images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'saree-images' AND public.is_admin()) 
WITH CHECK (bucket_id = 'saree-images' AND public.is_admin());

CREATE POLICY "Admin Delete Saree Images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'saree-images' AND public.is_admin());

-- Collection PDFs: Public can view, only Verified Admins can upload/modify/delete
CREATE POLICY "Public Access for Collection PDFs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'collection-pdfs');

CREATE POLICY "Admin Upload Collection PDFs" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'collection-pdfs' AND public.is_admin());

CREATE POLICY "Admin Update Collection PDFs" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'collection-pdfs' AND public.is_admin()) 
WITH CHECK (bucket_id = 'collection-pdfs' AND public.is_admin());

CREATE POLICY "Admin Delete Collection PDFs" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'collection-pdfs' AND public.is_admin());

-- Sarees Storage Bucket (Preserved: Public can view, only Verified Admins can upload/modify/delete)
CREATE POLICY "Public Access for Sarees Bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'sarees');

CREATE POLICY "Admin Upload Sarees Bucket" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'sarees' AND public.is_admin());

CREATE POLICY "Admin Update Sarees Bucket" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'sarees' AND public.is_admin()) 
WITH CHECK (bucket_id = 'sarees' AND public.is_admin());

CREATE POLICY "Admin Delete Sarees Bucket" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'sarees' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. Secure Database Table Policies (RBAC Enforced)
-- Customers: Read-only access to published content & validated enquiry submission
-- Verified Administrators: Full catalog management
-- ------------------------------------------------------------------------------

-- Collections
CREATE POLICY "Public can view active collections" 
ON public.collections FOR SELECT 
USING (status = 'active' OR (auth.role() = 'authenticated' AND public.is_admin()));

CREATE POLICY "Admins have full access to collections" 
ON public.collections FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Albums
CREATE POLICY "Public can view active albums" 
ON public.albums FOR SELECT 
USING (status = 'active' OR (auth.role() = 'authenticated' AND public.is_admin()));

CREATE POLICY "Admins have full access to albums" 
ON public.albums FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Shop Settings
CREATE POLICY "Public can view shop settings" 
ON public.shop_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins have full access to shop settings" 
ON public.shop_settings FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Homepage Content
CREATE POLICY "Public can view homepage content" 
ON public.homepage_content FOR SELECT 
USING (true);

CREATE POLICY "Admins have full access to homepage content" 
ON public.homepage_content FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- About Content
CREATE POLICY "Public can view about content" 
ON public.about_content FOR SELECT 
USING (true);

CREATE POLICY "Admins have full access to about content" 
ON public.about_content FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Process Steps
CREATE POLICY "Public can view active process steps" 
ON public.process_steps FOR SELECT 
USING (is_active = true OR (auth.role() = 'authenticated' AND public.is_admin()));

CREATE POLICY "Admins have full access to process steps" 
ON public.process_steps FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Customer Enquiries (Public insert with strict anti-spam check; Verified Admin read/manage)
-- Enforces status = 'new' (status cannot be NULL, contacted, or resolved)
-- Public users have ZERO select, update, or delete privileges on enquiries
CREATE POLICY "Public can submit validated enquiries" 
ON public.enquiries FOR INSERT 
WITH CHECK (
  status = 'new'
  AND customer_name IS NOT NULL AND length(trim(customer_name)) >= 2 AND length(customer_name) <= 100
  AND phone IS NOT NULL AND length(trim(phone)) >= 7 AND length(phone) <= 20
  AND message IS NOT NULL AND length(trim(message)) >= 2 AND length(message) <= 2000
);

CREATE POLICY "Admins have full access to enquiries" 
ON public.enquiries FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Private Admin Settings Table (Only verified administrators have access; completely hidden from public)
CREATE POLICY "Admins have full access to private_admin_settings" 
ON public.private_admin_settings FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Admin Users Table (Hierarchical RBAC: Admins can view roster; ONLY Super Admin can manage)
CREATE POLICY "Admins can view admin_users" 
ON public.admin_users FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Super admins can manage admin_users" 
ON public.admin_users FOR ALL 
TO authenticated 
USING (public.is_super_admin()) 
WITH CHECK (public.is_super_admin());

-- Standalone Sarees Table (Preserved: Public can view, only Verified Admins have full access)
CREATE POLICY "Public can view sarees" 
ON public.sarees FOR SELECT 
USING (true);

CREATE POLICY "Admins have full access to sarees" 
ON public.sarees FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Legacy Sares Table (Preserved: Public can view, only Verified Admins have full access)
CREATE POLICY "Public can view Sares" 
ON public."Sares" FOR SELECT 
USING (true);

CREATE POLICY "Admins have full access to Sares" 
ON public."Sares" FOR ALL 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. Explicit Table Permissions & Grants (Defense-in-Depth)
-- Enforces least-privilege table grants in addition to Row Level Security
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Public read-only tables: anon can SELECT (RLS filters active vs hidden)
GRANT SELECT ON public.shop_settings TO anon, authenticated;
GRANT SELECT ON public.homepage_content TO anon, authenticated;
GRANT SELECT ON public.about_content TO anon, authenticated;
GRANT SELECT ON public.process_steps TO anon, authenticated;
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.albums TO anon, authenticated;
GRANT SELECT ON public.sarees TO anon, authenticated;
GRANT SELECT ON public."Sares" TO anon, authenticated;

-- Customer Enquiries: anon can INSERT only (RLS enforces strict anti-spam)
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;

-- Private Tables: anon has ZERO permissions
REVOKE ALL ON public.private_admin_settings FROM anon;
REVOKE ALL ON public.admin_users FROM anon;

-- Admin Tables: authenticated users access governed strictly by RLS admin functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.process_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sarees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Sares" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_admin_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;

-- Service Role retains full bypass access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleResetData = () => {
    resetDataToDefaults();
    onDataReset();
    setConfirmReset(false);
  };

  const liveShowroomUrl = settings.website_url || 'https://bwebpage-szwt.vercel.app';
  const whatsappGroupUrl = settings.whatsapp_group_url || 'https://chat.whatsapp.com/J9afqXLrDfR7fhsHYffP9r';
  const qrCodeUrl = '/images/visiting_card_qr.jpg';
  const whatsappQrUrl = '/images/whatsapp_qr.jpg';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          System Settings & Security
        </h2>
        <p className="text-xs text-stone-500">
          Manage admin dashboard password/PIN, visiting card QR code, database sync, and showroom resets
        </p>
      </div>

      {/* 1. Admin PIN Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <KeyRound className="w-5 h-5 text-[#800020]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Admin Security PIN / Password
          </h3>
        </div>

        <p className="text-xs text-stone-600">
          This PIN is required to log in to this private management dashboard.
        </p>

        {pinSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Admin PIN updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSavePin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter new 4-8 character PIN"
            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Update Admin PIN
          </button>
        </form>
      </div>

      {/* 2. Showroom Visiting Card & WhatsApp Group QR Codes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <QrCode className="w-5 h-5 text-[#800020]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Showroom QR Codes (WhatsApp Group & Visiting Card)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Group QR */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  1. WhatsApp Group QR Code
                </h4>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Customers scan using WhatsApp camera to join your customer updates & saree showcase community.
              </p>
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center max-w-[200px] mx-auto shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={whatsappQrUrl}
                  alt="WhatsApp Group QR Code"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg border border-[#E7DFD5] font-mono text-[10px] text-stone-600 truncate">
                {whatsappGroupUrl}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappQrUrl}
                  download="sri-laxmi-narshima-whatsapp-group-qr.jpg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-[#D6C7B2] font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Visiting Card Showroom QR */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-[#800020]" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  2. Visiting Card Back QR Code
                </h4>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Printed on the back of your shop visiting cards. Scans with any phone camera to open your live web showroom.
              </p>
              <div className="p-2 bg-white rounded-xl border border-stone-200 text-center max-w-[280px] mx-auto shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Visiting Card QR Code"
                  className="w-full h-auto object-contain rounded-lg mx-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg border border-[#E7DFD5] font-mono text-[10px] text-[#800020] font-bold truncate">
                {liveShowroomUrl}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={qrCodeUrl}
                  download="charan-visiting-card-qr.jpg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-[#800020] border border-[#E7DFD5] font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </a>
                <a
                  href={liveShowroomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Supabase Cloud Database */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#800020]" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Supabase Cloud Database & Storage Sync
            </h3>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              isSupabaseConfigured()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {isSupabaseConfigured() ? 'Cloud Active' : 'Local Fallback Active'}
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Connecting your Supabase project allows your showroom to synchronize live across all customer devices (phones, tablets, and PCs), store high-resolution saree photographs permanently in Supabase Storage, and extract/publish PDF catalogs.
        </p>

        {supabaseStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              supabaseStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {supabaseStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{supabaseStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Project URL *
              </label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Anon / Public API Key *
              </label>
              <input
                type="password"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isTestingSupabase || isDiagnosing}
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTestingSupabase ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving & Syncing...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Save & Sync All Devices</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => runDiagnostics()}
              disabled={isDiagnosing || !supabaseUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5 text-[#800020]" />
              <span>{isDiagnosing ? 'Testing Database & Storage...' : 'Test Connection & Permissions'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlMigration(!showSqlMigration)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-700" />
              <span>{showSqlMigration ? 'Hide SQL Script' : 'View / Copy SQL Migration'}</span>
            </button>
          </div>
        </form>

        {/* Live Diagnostic Report Box */}
        {diagReport && (
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
              <span className="text-xs font-bold font-serif text-stone-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#800020]" />
                <span>Live Supabase Diagnostics Report</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  diagReport.success
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {diagReport.success ? '100% Operational' : 'Action Required'}
              </span>
            </div>

            <p className="text-xs text-stone-700 font-medium">{diagReport.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">1. Database Connection:</span>
                <span className={`font-bold flex items-center gap-1 ${diagReport.report?.connected ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {diagReport.report?.connected ? '✓ Connected' : '✗ Connection Failed'}
                </span>
                {diagReport.report?.connectionError && (
                  <p className="text-[10px] text-rose-600 font-mono leading-tight">{diagReport.report.connectionError}</p>
                )}
                {diagReport.report?.sanitizedUrl && (
                  <p className="text-[9px] text-stone-400 font-mono truncate">{diagReport.report.sanitizedUrl}</p>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">2. Collections Table:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    diagReport.report?.columns?.hasSareesColumn || diagReport.report?.tables?.collections?.hasSareesColumn
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {diagReport.report?.columns?.hasSareesColumn || diagReport.report?.tables?.collections?.hasSareesColumn
                    ? '✓ Ready (sarees JSONB)'
                    : '✗ Missing sarees column'}
                </span>
                <p className="text-[10px] text-stone-500">
                  {diagReport.report?.columns?.hasSareesColumn || diagReport.report?.tables?.collections?.hasSareesColumn
                    ? 'Catalog items format verified'
                    : 'Requires column migration'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">3. Storage Buckets:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    diagReport.report?.storage?.hasSareeImages && diagReport.report?.storage?.hasCollectionPdfs
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {diagReport.report?.storage?.hasSareeImages && diagReport.report?.storage?.hasCollectionPdfs
                    ? '✓ Ready (Images & PDFs)'
                    : diagReport.report?.storage?.hasSareeImages
                    ? '⚠ Missing collection-pdfs'
                    : '✗ Buckets Missing'}
                </span>
                <p className="text-[10px] text-stone-500">
                  {diagReport.report?.storage?.hasSareeImages
                    ? 'saree-images verified'
                    : 'saree-images bucket required'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">4. Admin Write & RLS:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    diagReport.report?.writeTest?.success ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {diagReport.report?.writeTest?.success 
                    ? `✓ Authorized (${diagReport.report?.auth?.userEmail ? `Admin: ${diagReport.report.auth.userEmail}` : 'Insert/Delete OK'})` 
                    : '✗ Blocked by RLS'}
                </span>
                <p className="text-[10px] text-stone-500">
                  {diagReport.report?.writeTest?.success
                    ? 'Admin write permissions verified'
                    : !diagReport.report?.auth?.hasSession
                      ? 'Sign in via Supabase Auth tab to test admin writes'
                      : diagReport.report?.writeTest?.error || 'RLS policy blocking writes'}
                </p>
              </div>
            </div>

            {diagReport.report?.recommendations?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-xs text-amber-900">
                <span className="font-bold block">Recommended Fixes:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {diagReport.report.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Collapsible SQL Migration Copy Box */}
        {showSqlMigration && (
          <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">
                supabase_schema_v2.sql (Copy and run in Supabase SQL Editor)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-black/50 p-3 rounded-xl overflow-x-auto max-h-48 text-stone-300">
{`-- 1. Create Verified Admin Table & Functions (search_path = '')
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'))
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN COALESCE(auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  ), false);
END; $$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN COALESCE(auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin')
  ), false);
END; $$;

-- 2. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('saree-images', 'saree-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('collection-pdfs', 'collection-pdfs', true, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 3. Hierarchical Admin Permissions (Only Super Admin manages admin accounts)
CREATE POLICY "Admins can view admin_users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super admins can manage admin_users" ON public.admin_users FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());`}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Factory Reset to Seed Data */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
          <RotateCcw className="w-5 h-5 text-rose-600" />
          <h3 className="font-serif text-base font-bold text-rose-950">
            Reset to Sample Showroom Data
          </h3>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed">
          If you are testing and wish to restore the authentic default Pochampally collections (Pure Silk, Pochampally Ikat, Cotton, Sico, Wedding) and high-resolution photographs, click the reset button below.
        </p>

        {confirmReset ? (
          <div className="p-4 bg-white rounded-2xl border border-rose-300 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure? This will restore initial collections and albums.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Reset Showroom
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-colors"
          >
            Reset to Sample Catalog
          </button>
        )}
      </div>

    </div>
  );
}
