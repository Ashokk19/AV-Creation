import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  // Handle accidental double pasting like https://xyz.supabase.cohttps://xyz.supabase.co
  const match = trimmed.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i);
  if (match) {
    return match[0];
  }
  return trimmed;
}

// Retrieve config from Vite environment variables, Node env, or localStorage override
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : undefined;

  const rawEnvUrl = (metaEnv?.VITE_SUPABASE_URL || procEnv?.VITE_SUPABASE_URL || '').trim();
  const rawEnvKey = (metaEnv?.VITE_SUPABASE_ANON_KEY || procEnv?.VITE_SUPABASE_ANON_KEY || '').trim();

  const envUrl = sanitizeSupabaseUrl(rawEnvUrl);
  const envKey = rawEnvKey;

  const localUrl = sanitizeSupabaseUrl(typeof window !== 'undefined' ? localStorage.getItem('av_supabase_url') || '' : '');
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem('av_supabase_anon_key') || '' : '').trim();

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function setSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('av_supabase_url', url.trim());
    else localStorage.removeItem('av_supabase_url');

    if (anonKey) localStorage.setItem('av_supabase_anon_key', anonKey.trim());
    else localStorage.removeItem('av_supabase_anon_key');

    supabaseInstance = null; // Re-create next time
  }
}

/**
 * Centralized image helper to generate image URLs from stored Supabase Storage paths
 */
export function getProductImageUrl(imagePath?: string | null): string {
  if (!imagePath) {
    return '';
  }

  // If already an absolute URL, data URL, or local asset path
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('/assets/') ||
    imagePath.startsWith('/')
  ) {
    return imagePath;
  }

  const client = getSupabaseClient();
  if (!client) {
    return '';
  }

  const { data } = client.storage.from('product-images').getPublicUrl(imagePath);
  return data?.publicUrl || '';
}

export const SUPABASE_SQL_SCHEMA = `-- ================================================================
-- AV CREATION — Supabase Database Schema & Storage Configuration
-- Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    image_path TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    price NUMERIC(10, 2) CHECK (price >= 0),
    is_featured BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent column check for existing databases
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) CHECK (price >= 0);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Auto-update updated_at on product edits
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Admin Users Table (Server-Verified Authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'super_admin')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Customer Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_category TEXT,
    description TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name TEXT,
    reference_link TEXT,
    dimensions TEXT,
    material_preference TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    target_timeline TEXT,
    status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'in_progress', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);

DROP TRIGGER IF EXISTS trigger_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER trigger_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row-Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status = 'active' OR public.is_admin());
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Admins can read admin_users" ON public.admin_users FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries" ON public.enquiries FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries" ON public.enquiries FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can delete enquiries" ON public.enquiries FOR DELETE USING (public.is_admin());

-- 6. Storage Buckets (Product Images & Enquiry Attachments)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());

INSERT INTO storage.buckets (id, name, public) VALUES ('enquiry-attachments', 'enquiry-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can upload enquiry attachments" ON storage.objects;
CREATE POLICY "Public can upload enquiry attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'enquiry-attachments');
DROP POLICY IF EXISTS "Public can view enquiry attachments" ON storage.objects;
CREATE POLICY "Public can view enquiry attachments" ON storage.objects FOR SELECT USING (bucket_id = 'enquiry-attachments');
DROP POLICY IF EXISTS "Admins can delete enquiry attachments" ON storage.objects;
CREATE POLICY "Admins can delete enquiry attachments" ON storage.objects FOR DELETE USING (bucket_id = 'enquiry-attachments' AND public.is_admin());

-- 7. Seed Default Categories
INSERT INTO public.categories (name, slug)
VALUES 
    ('Tea Lights', 'tea-lights'),
    ('Clickers', 'clickers'),
    ('Pokemon', 'pokemon'),
    ('Wall Decors', 'wall-decors')
ON CONFLICT (slug) DO NOTHING;
`;
