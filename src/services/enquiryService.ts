import { getSupabaseClient } from '../lib/supabase';
import { CustomerEnquiry } from '../types';

/**
 * Upload an enquiry reference file or photo to Supabase Storage
 */
export async function uploadEnquiryAttachment(file: File): Promise<{ url: string; name: string }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  // Max 10MB limit for reference attachments
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Attachment exceeds the 10MB limit. Please choose a smaller file.');
  }

  const fileExt = file.name.split('.').pop() || 'bin';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniquePath = `enquiries/${Date.now()}-${cleanBase}.${fileExt}`;

  const { error: uploadError } = await client.storage
    .from('enquiry-attachments')
    .upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Attachment upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = client.storage
    .from('enquiry-attachments')
    .getPublicUrl(uniquePath);

  return {
    url: publicUrlData?.publicUrl || uniquePath,
    name: file.name,
  };
}

/**
 * Submit a customer custom print enquiry to Supabase
 */
export async function submitEnquiry(
  data: {
    customer_name: string;
    email: string;
    phone?: string;
    project_category?: string;
    description: string;
    reference_link?: string;
    dimensions?: string;
    material_preference?: string;
    quantity?: number;
    target_timeline?: string;
  },
  attachmentFile?: File | null
): Promise<CustomerEnquiry> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  if (!data.customer_name.trim()) {
    throw new Error('Customer name is required.');
  }

  if (!data.email.trim()) {
    throw new Error('Email address is required.');
  }

  if (!data.description.trim()) {
    throw new Error('Project description is required.');
  }

  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;

  if (attachmentFile) {
    const uploaded = await uploadEnquiryAttachment(attachmentFile);
    attachmentUrl = uploaded.url;
    attachmentName = uploaded.name;
  }

  const payload = {
    customer_name: data.customer_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    project_category: data.project_category || null,
    description: data.description.trim(),
    attachment_url: attachmentUrl,
    attachment_name: attachmentName,
    reference_link: data.reference_link?.trim() || null,
    dimensions: data.dimensions || null,
    material_preference: data.material_preference || null,
    quantity: data.quantity && data.quantity > 0 ? data.quantity : 1,
    target_timeline: data.target_timeline || null,
    status: 'new' as const,
  };

  const { data: inserted, error } = await client
    .from('enquiries')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to submit enquiry.');
  }

  return inserted;
}

/**
 * Fetch all customer enquiries (Admin only, RLS protected)
 */
export async function fetchEnquiries(): Promise<CustomerEnquiry[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching enquiries from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch enquiries:', err);
    return [];
  }
}

/**
 * Update the status of an enquiry (Admin only)
 */
export async function updateEnquiryStatus(
  id: string,
  status: 'new' | 'in_progress' | 'completed'
): Promise<CustomerEnquiry> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await client
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update enquiry status.');
  }

  return data;
}

/**
 * Update internal admin notes on an enquiry (Admin only)
 */
export async function updateEnquiryNotes(
  id: string,
  notes: string
): Promise<CustomerEnquiry> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await client
    .from('enquiries')
    .update({ admin_notes: notes.trim() || null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update enquiry notes.');
  }

  return data;
}

/**
 * Delete an enquiry (Admin only)
 */
export async function deleteEnquiry(id: string, attachmentUrl?: string | null): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await client
    .from('enquiries')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete enquiry.');
  }

  // Best-effort cleanup of attachment if stored in Supabase storage
  if (attachmentUrl && attachmentUrl.includes('/enquiry-attachments/')) {
    try {
      const parts = attachmentUrl.split('/enquiry-attachments/');
      if (parts[1]) {
        await client.storage.from('enquiry-attachments').remove([decodeURIComponent(parts[1])]);
      }
    } catch {
      // Ignore background cleanup errors
    }
  }
}
