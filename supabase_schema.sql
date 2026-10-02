-- ==============================================================================
-- POCHAMPALLY SILK SAREE BUSINESS DATABASE SCHEMA FOR SUPABASE
-- Album-Based Photo & Flexible Collection Architecture
-- ==============================================================================

-- 1. Shop Settings Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Homepage Content Table
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  hero_description TEXT,
  hero_image_url TEXT NOT NULL,
  hero_badge TEXT,
  explore_btn_text TEXT DEFAULT 'Explore Collections',
  contact_btn_text TEXT DEFAULT 'Visit Showroom',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. About Pochampally Content Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Storytelling "How Sarees Are Made" Process Steps Table
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

-- 5. Collections (Cloth/Fabric Types: Cotton, Sico, Pure Silk, Silk Mix, etc.)
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  display_order INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Photo Albums (Grouping real photographs under a Collection)
CREATE TABLE IF NOT EXISTS public.albums (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
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

-- 7. Customer Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  album_name TEXT,
  photo_code TEXT,
  saree_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_albums_collection ON public.albums(collection_id);
CREATE INDEX IF NOT EXISTS idx_albums_status ON public.albums(status);
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Public READ Policies for customer website
CREATE POLICY "Public can view shop settings" ON public.shop_settings FOR SELECT USING (true);
CREATE POLICY "Public can view homepage content" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Public can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Public can view active process steps" ON public.process_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active collections" ON public.collections FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view active albums" ON public.albums FOR SELECT USING (status = 'active');
CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Authenticated / Admin FULL ACCESS Policies
CREATE POLICY "Admins have full access to shop settings" ON public.shop_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to homepage content" ON public.homepage_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to about content" ON public.about_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to process steps" ON public.process_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to collections" ON public.collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to albums" ON public.albums FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to enquiries" ON public.enquiries FOR ALL USING (auth.role() = 'authenticated');
