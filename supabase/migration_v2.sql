-- ================================================================
-- AV CREATION — Supabase Migration V2: Pricing & Customer Enquiries
-- Run this script in the Supabase SQL Editor to upgrade your existing database.
-- ================================================================

-- 1. Add Price Column to Products Table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) CHECK (price >= 0);

CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- 2. Create Customer Enquiries Table
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

-- 3. Auto-update updated_at Trigger for Enquiries
DROP TRIGGER IF EXISTS trigger_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER trigger_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row-Level Security for Enquiries Table
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Public visitors can submit custom print enquiries
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

-- Only verified administrators can view submitted enquiries
DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
    ON public.enquiries FOR SELECT
    USING (public.is_admin());

-- Only verified administrators can update enquiry status and internal notes
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries"
    ON public.enquiries FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only verified administrators can delete enquiries
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can delete enquiries"
    ON public.enquiries FOR DELETE
    USING (public.is_admin());

-- 5. Storage Bucket for Enquiry Reference Attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('enquiry-attachments', 'enquiry-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can upload enquiry attachments
DROP POLICY IF EXISTS "Public can upload enquiry attachments" ON storage.objects;
CREATE POLICY "Public can upload enquiry attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'enquiry-attachments');

-- Public and admins can view enquiry attachments
DROP POLICY IF EXISTS "Public can view enquiry attachments" ON storage.objects;
CREATE POLICY "Public can view enquiry attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'enquiry-attachments');

-- Admins can delete enquiry attachments
DROP POLICY IF EXISTS "Admins can delete enquiry attachments" ON storage.objects;
CREATE POLICY "Admins can delete enquiry attachments"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'enquiry-attachments'
        AND public.is_admin()
    );
