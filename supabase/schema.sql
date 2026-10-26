-- ================================================================
-- AV CREATION — Supabase Database Schema & Storage Configuration
-- Safe to run ONCE on a fresh Supabase project or re-run idempotently.
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 2. Categories Table
-- ================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- ================================================================
-- 3. Products Table
-- ================================================================
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

-- Auto-update updated_at on every product edit
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

-- ================================================================
-- 4. Admin Users Table (Server-Verified Role Authorization)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'super_admin')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security Definer function: returns true if the current JWT user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ================================================================
-- 5. Customer Enquiries Table
-- ================================================================
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

-- ================================================================
-- 6. Row-Level Security (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories FOR DELETE
    USING (public.is_admin());

-- Products: public read (active only), admin read all + write
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- Admin Users: users can read their own entry; admins can read all
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Admins can read admin_users"
    ON public.admin_users FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Enquiries: public can submit; admins can view, update, delete
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
    ON public.enquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
    ON public.enquiries FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries"
    ON public.enquiries FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can delete enquiries"
    ON public.enquiries FOR DELETE
    USING (public.is_admin());

-- ================================================================
-- 7. Storage Buckets (Product Images & Enquiry Attachments)
-- ================================================================

-- 7.1 Product Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- 7.2 Enquiry Attachments Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('enquiry-attachments', 'enquiry-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can upload enquiry attachments" ON storage.objects;
CREATE POLICY "Public can upload enquiry attachments"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'enquiry-attachments');

DROP POLICY IF EXISTS "Public can view enquiry attachments" ON storage.objects;
CREATE POLICY "Public can view enquiry attachments"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'enquiry-attachments');

DROP POLICY IF EXISTS "Admins can delete enquiry attachments" ON storage.objects;
CREATE POLICY "Admins can delete enquiry attachments"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'enquiry-attachments'
        AND public.is_admin()
    );

-- ================================================================
-- 8. Seed Default Categories (Idempotent)
-- ================================================================
INSERT INTO public.categories (name, slug)
VALUES
    ('Tea Lights', 'tea-lights'),
    ('Clickers', 'clickers'),
    ('Pokemon', 'pokemon'),
    ('Wall Decors', 'wall-decors')
ON CONFLICT (slug) DO NOTHING;
