export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- GPLAY STORE / MOTORIDE APP STORE - SUPABASE DATABASE & STORAGE SCHEMA
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Apps Table
CREATE TABLE IF NOT EXISTS public.apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    developer_name TEXT NOT NULL,
    package_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    whats_new TEXT DEFAULT 'Bug fixes and performance improvements.',
    category TEXT NOT NULL CHECK (category IN (
        'Transportation', 'Business', 'Education', 'Entertainment',
        'Games', 'Travel', 'Productivity', 'Social', 'Other'
    )),
    version_name TEXT NOT NULL DEFAULT '1.0.0',
    version_code INTEGER NOT NULL DEFAULT 1,
    minimum_android_version TEXT DEFAULT 'Android 8.0 (API 26)',
    apk_storage_path TEXT,
    apk_url TEXT,
    icon_storage_path TEXT,
    icon_url TEXT NOT NULL,
    apk_size TEXT NOT NULL DEFAULT '25 MB',
    download_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    login_required BOOLEAN NOT NULL DEFAULT false,
    permissions JSONB DEFAULT '["INTERNET", "ACCESS_NETWORK_STATE"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create App Screenshots Table
CREATE TABLE IF NOT EXISTS public.app_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    storage_path TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create App Reviews Table
CREATE TABLE IF NOT EXISTS public.app_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create App Downloads Table
CREATE TABLE IF NOT EXISTS public.app_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    version_name TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all operations for profiles" ON public.profiles;

CREATE POLICY "Enable read for profiles"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Enable insert for profiles"
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for profiles"
ON public.profiles FOR UPDATE USING (true);

-- Apps Policies
DROP POLICY IF EXISTS "Anyone can view published apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can insert apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can update apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can delete apps" ON public.apps;
DROP POLICY IF EXISTS "Enable all operations for apps" ON public.apps;
DROP POLICY IF EXISTS "Enable read access for apps" ON public.apps;

CREATE POLICY "Enable all operations for apps"
ON public.apps FOR ALL
USING (true)
WITH CHECK (true);

-- App Screenshots Policies
DROP POLICY IF EXISTS "Anyone can view screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Only admins can insert screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Only admins can delete screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Enable all operations for screenshots" ON public.app_screenshots;

CREATE POLICY "Enable all operations for screenshots"
ON public.app_screenshots FOR ALL
USING (true)
WITH CHECK (true);

-- App Reviews Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.app_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.app_reviews;
DROP POLICY IF EXISTS "Users can delete their own review or admin can" ON public.app_reviews;
DROP POLICY IF EXISTS "Enable all operations for reviews" ON public.app_reviews;

CREATE POLICY "Enable all operations for reviews"
ON public.app_reviews FOR ALL
USING (true)
WITH CHECK (true);

-- App Downloads Policies
DROP POLICY IF EXISTS "Anyone can record download" ON public.app_downloads;
DROP POLICY IF EXISTS "Only admins can view downloads history" ON public.app_downloads;
DROP POLICY IF EXISTS "Enable all operations for downloads" ON public.app_downloads;

CREATE POLICY "Enable all operations for downloads"
ON public.app_downloads FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- STORED PROCEDURES & TRIGGERS
-- ==============================================================================

-- Trigger to auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic function to increment download counter and update app downloads
CREATE OR REPLACE FUNCTION public.increment_app_download(app_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.apps
  SET download_count = download_count + 1,
      updated_at = timezone('utc'::text, now())
  WHERE id = app_id_param;
  
  INSERT INTO public.app_downloads (app_id, version_name)
  SELECT id, version_name FROM public.apps WHERE id = app_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic function to update app rating when a review is added or removed
CREATE OR REPLACE FUNCTION public.update_app_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_app_id UUID;
  avg_score NUMERIC;
  cnt INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_app_id := OLD.app_id;
  ELSE
    target_app_id := NEW.app_id;
  END IF;

  SELECT COALESCE(AVG(rating), 5.0), COUNT(id)
  INTO avg_score, cnt
  FROM public.app_reviews
  WHERE app_id = target_app_id;

  UPDATE public.apps
  SET rating = ROUND(avg_score, 1),
      review_count = cnt
  WHERE id = target_app_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.app_reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.app_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_app_rating();

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('app-apks', 'app-apks', true),
    ('app-icons', 'app-icons', true),
    ('app-screenshots', 'app-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Read Access
CREATE POLICY "Public Read APKs"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-apks');

CREATE POLICY "Public Read Icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-icons');

CREATE POLICY "Public Read Screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-screenshots');

-- Storage Policies: Admin Upload / Update / Delete
CREATE POLICY "Admin Insert APKs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-apks');

CREATE POLICY "Admin Insert Icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-icons');

CREATE POLICY "Admin Insert Screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-screenshots');
`;

export const SUPABASE_RLS_FIX_SQL = `-- ==============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) QUICK FIX
-- Fixes: "new row violates row-level security policy for table apps"
-- Execute this script in your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. FIX POLICIES FOR "public.apps" TABLE
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can insert apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can update apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can delete apps" ON public.apps;
DROP POLICY IF EXISTS "Enable all operations for apps" ON public.apps;
DROP POLICY IF EXISTS "Enable read access for apps" ON public.apps;
DROP POLICY IF EXISTS "Enable insert access for apps" ON public.apps;
DROP POLICY IF EXISTS "Enable update access for apps" ON public.apps;
DROP POLICY IF EXISTS "Enable delete access for apps" ON public.apps;

CREATE POLICY "Enable all operations for apps"
ON public.apps FOR ALL
USING (true)
WITH CHECK (true);

-- 2. FIX POLICIES FOR "public.app_screenshots" TABLE
ALTER TABLE public.app_screenshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Only admins can insert screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Only admins can delete screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Enable all operations for screenshots" ON public.app_screenshots;

CREATE POLICY "Enable all operations for screenshots"
ON public.app_screenshots FOR ALL
USING (true)
WITH CHECK (true);

-- 3. FIX POLICIES FOR "public.profiles" TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all operations for profiles" ON public.profiles;

CREATE POLICY "Enable read for profiles"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Enable insert for profiles"
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for profiles"
ON public.profiles FOR UPDATE USING (true);

-- 4. FIX POLICIES FOR "public.app_reviews" TABLE
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.app_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.app_reviews;
DROP POLICY IF EXISTS "Users can delete their own review or admin can" ON public.app_reviews;
DROP POLICY IF EXISTS "Enable all operations for reviews" ON public.app_reviews;

CREATE POLICY "Enable all operations for reviews"
ON public.app_reviews FOR ALL
USING (true)
WITH CHECK (true);

-- 5. ELEVATE EXISTING PROFILES TO ADMIN (OPTIONAL HELPER)
UPDATE public.profiles SET role = 'admin' WHERE role = 'user';
`;

