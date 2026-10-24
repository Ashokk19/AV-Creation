import { getSupabaseClient, getProductImageUrl, isSupabaseConfigured } from '../lib/supabase';
import { CategoryRecord, ProductRecord, ProductItem } from '../types';

export const DEFAULT_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Tea Lights', slug: 'tea-lights' },
  { name: 'Clickers', slug: 'clickers' },
  { name: 'Pokemon', slug: 'pokemon' },
  { name: 'Wall Decors', slug: 'wall-decors' },
];

/**
 * Generate a clean URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Seed the 4 default categories in Supabase idempotently
 */
export async function seedDefaultCategories(): Promise<CategoryRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    return DEFAULT_CATEGORIES.map((c, i) => ({
      id: `cat-${c.slug}-${i}`,
      name: c.name,
      slug: c.slug,
      product_count: 0,
    }));
  }

  try {
    // 1. Fetch existing categories
    const { data: existing, error: fetchErr } = await client
      .from('categories')
      .select('*');

    if (fetchErr) {
      console.warn('Could not query categories table for seeding:', fetchErr.message);
      return [];
    }

    const existingSlugs = new Set((existing || []).map((c) => c.slug));
    const toInsert = DEFAULT_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));

    if (toInsert.length > 0) {
      const { data: inserted, error: insertErr } = await client
        .from('categories')
        .insert(toInsert)
        .select();

      if (insertErr) {
        console.warn('Notice on category seeding:', insertErr.message);
      } else if (inserted) {
        return [...(existing || []), ...inserted];
      }
    }

    return existing || [];
  } catch (err) {
    console.error('Error during category seeding:', err);
    return [];
  }
}

/**
 * Fetch all categories with computed product counts
 */
export async function fetchCategories(): Promise<CategoryRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    return DEFAULT_CATEGORIES.map((c, i) => ({
      id: `cat-${c.slug}`,
      name: c.name,
      slug: c.slug,
      product_count: 0,
    }));
  }

  try {
    const { data: categories, error } = await client
      .from('categories')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return [];
    }

    if (!categories || categories.length === 0) {
      // Seed default categories if none exist
      return await seedDefaultCategories();
    }

    // Query product counts per category
    const { data: products } = await client
      .from('products')
      .select('category_id');

    const counts: Record<string, number> = {};
    if (products) {
      for (const p of products) {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      }
    }

    return categories.map((cat) => ({
      ...cat,
      product_count: counts[cat.id] || 0,
    }));
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

/**
 * Create a new category with collision-safe slug
 */
export async function createCategory(name: string, customSlug?: string): Promise<CategoryRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Category name is required.');
  }

  let baseSlug = customSlug ? slugify(customSlug) : slugify(trimmedName);
  if (!baseSlug) baseSlug = 'category';

  // Check for slug collisions
  const { data: existing } = await client
    .from('categories')
    .select('slug')
    .ilike('slug', `${baseSlug}%`);

  let finalSlug = baseSlug;
  if (existing && existing.length > 0) {
    const slugs = new Set(existing.map((e) => e.slug));
    if (slugs.has(finalSlug)) {
      let counter = 2;
      while (slugs.has(`${baseSlug}-${counter}`)) {
        counter++;
      }
      finalSlug = `${baseSlug}-${counter}`;
    }
  }

  const { data, error } = await client
    .from('categories')
    .insert([{ name: trimmedName, slug: finalSlug }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create category');
  }

  return { ...data, product_count: 0 };
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, name: string, slug?: string): Promise<CategoryRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Category name is required.');
  }

  const finalSlug = slug ? slugify(slug) : slugify(trimmedName);

  const { data, error } = await client
    .from('categories')
    .update({ name: trimmedName, slug: finalSlug })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update category');
  }

  return data;
}

/**
 * Safe delete category: ensures no products are orphaned
 */
export async function deleteCategory(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  // Check if any products exist in this category
  const { count, error: countErr } = await client
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (countErr) {
    throw new Error(countErr.message);
  }

  if (count && count > 0) {
    throw new Error(
      `Cannot delete category: It contains ${count} product${count > 1 ? 's' : ''}. Please reassign or delete those products first.`
    );
  }

  const { error } = await client
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete category');
  }
}

/**
 * Fetch products from Supabase
 */
export async function fetchProducts(options?: {
  status?: 'active' | 'all';
  categoryId?: string;
  isFeatured?: boolean;
}): Promise<ProductRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  try {
    let query = client
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    } else if (!options?.status) {
      // Default to active for public catalogue
      query = query.eq('status', 'active');
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.isFeatured !== undefined) {
      query = query.eq('is_featured', options.isFeatured);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }

    return (data || []).map((p) => {
      let rawImages: string[] =
        Array.isArray(p.images) && p.images.length > 0
          ? p.images.filter(Boolean)
          : [];

      // Check client-side cached images if column wasn't present in DB
      if (rawImages.length === 0 && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`av_product_images_${p.id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              rawImages = parsed.filter(Boolean);
            }
          }
        } catch {
          // ignore
        }
      }

      if (rawImages.length === 0 && p.image_path) {
        rawImages = [p.image_path];
      }

      const imageUrls = rawImages.map((imgPath: string) => getProductImageUrl(imgPath));
      const primaryUrl = imageUrls[0] || getProductImageUrl(p.image_path);

      return {
        ...p,
        images: rawImages,
        image_urls: imageUrls,
        image_url: primaryUrl,
      };
    });
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

/**
 * Upload single image to Supabase Storage
 */
export async function uploadProductImage(file: File): Promise<string> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured. Cannot upload image.');
  }

  // Validate format
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!validTypes.includes(file.type.toLowerCase()) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    throw new Error('Invalid file format. Please upload a JPG, PNG, or WebP image.');
  }

  // Validate size (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('File size exceeds the 8MB limit. Please choose a smaller image.');
  }

  const fileExt = ext || 'webp';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniquePath = `products/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanBase}.${fileExt}`;

  const { error: uploadError } = await client.storage
    .from('product-images')
    .upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  return uniquePath;
}

/**
 * Upload multiple product images sequentially with progress reporting
 */
export async function uploadMultipleProductImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadedPaths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = await uploadProductImage(file);
    uploadedPaths.push(path);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return uploadedPaths;
}

/**
 * Create a new product in Supabase with multi-image support
 */
export async function createProduct(
  data: {
    name: string;
    short_description?: string;
    description?: string;
    category_id: string;
    price?: number | null;
    is_featured: boolean;
    status: 'active' | 'draft';
  },
  imageFiles?: File[] | File | null,
  existingImagePaths?: string[] | string,
  onProgress?: (completed: number, total: number) => void
): Promise<ProductRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  if (!data.name.trim()) {
    throw new Error('Product name is required.');
  }

  if (!data.category_id) {
    throw new Error('Category selection is required.');
  }

  // Normalize existing paths
  let finalImages: string[] = [];
  if (existingImagePaths) {
    if (Array.isArray(existingImagePaths)) {
      finalImages.push(...existingImagePaths.filter(Boolean));
    } else if (typeof existingImagePaths === 'string' && existingImagePaths.trim()) {
      finalImages.push(existingImagePaths.trim());
    }
  }

  // Normalize files
  const filesToUpload: File[] = [];
  if (imageFiles) {
    if (Array.isArray(imageFiles)) {
      filesToUpload.push(...imageFiles);
    } else {
      filesToUpload.push(imageFiles);
    }
  }

  if (filesToUpload.length > 0) {
    const newlyUploaded = await uploadMultipleProductImages(filesToUpload, onProgress);
    finalImages.push(...newlyUploaded);
  }

  if (finalImages.length === 0) {
    throw new Error('At least one product image is required.');
  }

  const primaryImagePath = finalImages[0];

  // Generate unique slug
  let baseSlug = slugify(data.name);
  if (!baseSlug) baseSlug = 'product';

  const { data: existing } = await client
    .from('products')
    .select('slug')
    .ilike('slug', `${baseSlug}%`);

  let finalSlug = baseSlug;
  if (existing && existing.length > 0) {
    const slugs = new Set(existing.map((e) => e.slug));
    if (slugs.has(finalSlug)) {
      let counter = 2;
      while (slugs.has(`${baseSlug}-${counter}`)) {
        counter++;
      }
      finalSlug = `${baseSlug}-${counter}`;
    }
  }

  const cleanPrice =
    data.price !== undefined && data.price !== null && !isNaN(Number(data.price)) && Number(data.price) >= 0
      ? Number(data.price)
      : null;

  const insertPayload: Record<string, any> = {
    name: data.name.trim(),
    slug: finalSlug,
    short_description: data.short_description?.trim() || null,
    description: data.description?.trim() || null,
    image_path: primaryImagePath,
    images: finalImages,
    category_id: data.category_id,
    price: cleanPrice,
    is_featured: Boolean(data.is_featured),
    status: data.status || 'active',
  };

  let created: any = null;
  const { data: insertResult, error } = await client
    .from('products')
    .insert([insertPayload])
    .select('*, category:categories(id, name, slug)')
    .single();

  if (error) {
    // If column doesn't exist yet in the database schema cache (PGRST204), fallback safely without `images`
    if (error.code === 'PGRST204' || error.message.includes('images')) {
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.images;
      const retry = await client
        .from('products')
        .insert([fallbackPayload])
        .select('*, category:categories(id, name, slug)')
        .single();
      if (retry.error) {
        throw new Error(retry.error.message || 'Failed to create product.');
      }
      created = retry.data;
    } else {
      throw new Error(error.message || 'Failed to create product.');
    }
  } else {
    created = insertResult;
  }

  // Persist images cache locally for immediate responsiveness
  if (created?.id && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`av_product_images_${created.id}`, JSON.stringify(finalImages));
    } catch {
      // ignore
    }
  }

  const resolvedUrls = finalImages.map((p) => getProductImageUrl(p));

  return {
    ...created,
    images: finalImages,
    image_urls: resolvedUrls,
    image_url: resolvedUrls[0] || getProductImageUrl(created.image_path),
  };
}

/**
 * Update an existing product with multi-image support
 */
export async function updateProduct(
  id: string,
  data: {
    name: string;
    short_description?: string;
    description?: string;
    category_id: string;
    price?: number | null;
    is_featured: boolean;
    status: 'active' | 'draft';
  },
  newImageFiles?: File[] | File | null,
  orderedImagePaths?: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<ProductRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  if (!data.name.trim()) {
    throw new Error('Product name is required.');
  }

  // Fetch current product to check previously saved images for safe cleanup
  let previousImages: string[] = [];
  try {
    const { data: currentProd } = await client
      .from('products')
      .select('image_path, images')
      .eq('id', id)
      .single();
    if (currentProd) {
      if (Array.isArray(currentProd.images) && currentProd.images.length > 0) {
        previousImages = currentProd.images;
      } else if (currentProd.image_path) {
        previousImages = [currentProd.image_path];
      }
    }
  } catch {
    // ignore
  }

  // Base list from ordered existing paths
  let finalImages: string[] = orderedImagePaths ? [...orderedImagePaths.filter(Boolean)] : [...previousImages];

  // Upload any new files
  const filesToUpload: File[] = [];
  if (newImageFiles) {
    if (Array.isArray(newImageFiles)) {
      filesToUpload.push(...newImageFiles);
    } else {
      filesToUpload.push(newImageFiles);
    }
  }

  if (filesToUpload.length > 0) {
    const uploadedPaths = await uploadMultipleProductImages(filesToUpload, onProgress);
    finalImages.push(...uploadedPaths);
  }

  if (finalImages.length === 0) {
    throw new Error('At least one product image is required.');
  }

  const primaryImagePath = finalImages[0];

  const cleanPrice =
    data.price !== undefined && data.price !== null && !isNaN(Number(data.price)) && Number(data.price) >= 0
      ? Number(data.price)
      : null;

  const updatePayload: Record<string, any> = {
    name: data.name.trim(),
    short_description: data.short_description?.trim() || null,
    description: data.description?.trim() || null,
    category_id: data.category_id,
    image_path: primaryImagePath,
    images: finalImages,
    price: cleanPrice,
    is_featured: Boolean(data.is_featured),
    status: data.status || 'active',
  };

  let updated: any = null;
  const { data: updateResult, error } = await client
    .from('products')
    .update(updatePayload)
    .eq('id', id)
    .select('*, category:categories(id, name, slug)')
    .single();

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes('images')) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.images;
      const retry = await client
        .from('products')
        .update(fallbackPayload)
        .eq('id', id)
        .select('*, category:categories(id, name, slug)')
        .single();
      if (retry.error) {
        throw new Error(retry.error.message || 'Failed to update product.');
      }
      updated = retry.data;
    } else {
      throw new Error(error.message || 'Failed to update product.');
    }
  } else {
    updated = updateResult;
  }

  // Persist images cache locally for immediate responsiveness
  if (id && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`av_product_images_${id}`, JSON.stringify(finalImages));
    } catch {
      // ignore
    }
  }

  // Safe cleanup: delete removed images that were previously saved but are no longer in finalImages
  const currentSet = new Set(finalImages);
  const orphaned = previousImages.filter(
    (oldPath) => !currentSet.has(oldPath) && !oldPath.startsWith('http') && !oldPath.startsWith('/')
  );
  if (orphaned.length > 0) {
    try {
      await client.storage.from('product-images').remove(orphaned);
    } catch {
      // safe ignore best-effort cleanup
    }
  }

  const resolvedUrls = finalImages.map((p) => getProductImageUrl(p));

  return {
    ...updated,
    images: finalImages,
    image_urls: resolvedUrls,
    image_url: resolvedUrls[0] || getProductImageUrl(updated.image_path),
  };
}

/**
 * Delete product from Supabase and cleanup all storage photos
 */
export async function deleteProduct(id: string, imagePaths?: string | string[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete product.');
  }

  if (id && typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`av_product_images_${id}`);
    } catch {
      // ignore
    }
  }

  // Best effort image cleanup
  const pathsToClean: string[] = [];
  if (imagePaths) {
    if (Array.isArray(imagePaths)) {
      pathsToClean.push(...imagePaths);
    } else {
      pathsToClean.push(imagePaths);
    }
  }

  const validBucketPaths = pathsToClean.filter(
    (p) => p && !p.startsWith('http') && !p.startsWith('/')
  );

  if (validBucketPaths.length > 0) {
    try {
      await client.storage.from('product-images').remove(validBucketPaths);
    } catch {
      // ignore
    }
  }
}

/**
 * Adapts a Supabase ProductRecord to the visual ProductItem
 * so all existing visual components (cards, carousels, modals)
 * render seamlessly with real product photography.
 */
export function mapProductRecordToItem(record: ProductRecord): ProductItem {
  const categoryName = record.category?.name || 'Creation';
  const categorySlug = record.category?.slug || 'creation';

  const rawImages: string[] =
    Array.isArray(record.images) && record.images.length > 0
      ? record.images.filter(Boolean)
      : record.image_path
      ? [record.image_path]
      : [];

  const imageUrls: string[] =
    Array.isArray(record.image_urls) && record.image_urls.length > 0
      ? record.image_urls
      : rawImages.map((img) => getProductImageUrl(img));

  const primaryImageUrl = imageUrls[0] || record.image_url || getProductImageUrl(record.image_path);

  return {
    id: record.id,
    slug: record.slug,
    title: record.name,
    subtitle: record.short_description || categoryName,
    category: categorySlug,
    categoryName: categoryName,
    categoryId: record.category_id,
    functionType: 'decorative',
    shortDescription: record.short_description || 'High-fidelity 3D printed creation by AV Creation.',
    storyDescription: record.description || record.short_description || 'Bespoke creation produced on calibrated studio CoreXY extruders.',
    price: record.price !== undefined && record.price !== null ? Number(record.price) : null,
    featured: record.is_featured,
    trending: record.is_featured,
    recentlyAdded: true,
    creationDate: record.created_at || new Date().toISOString(),
    status: record.status,
    image_path: record.image_path,
    imageUrl: primaryImageUrl,
    images: rawImages,
    imageUrls: imageUrls,
    primaryVisual: {
      accentGlow: '#E7A96B',
      style: 'dynamic-photo',
      description: record.name,
      aspectRatio: '4:3',
    },
    specs: {
      material: 'Studio PLA+ / PETG',
      layerResolution: '0.12–0.16 mm',
      infillDensity: '20% Gyroid',
      printTimeHours: 12,
      dimensions: {
        widthMm: 120,
        depthMm: 120,
        heightMm: 140,
      },
      weightGrams: 180,
      nozzleDiameter: '0.4 mm Hardened Brass',
    },
    availableColors: [
      { name: 'Warm Amber', hex: '#E7A96B', filamentType: 'PLA+' },
      { name: 'Obsidian Black', hex: '#202024', filamentType: 'Matte PLA' },
      { name: 'Ivory White', hex: '#F0EEE9', filamentType: 'Silk PLA' },
    ],
    customizable: true,
    tags: [categorySlug, '3d-print', 'av-creation'],
  };
}
