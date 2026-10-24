/**
 * Pure helper functions for product gallery handling, image validation,
 * reordering, and mobile swipe calculations.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_IMAGE_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Validates a single image file object for MIME type, extension, and file size.
 */
export function validateImageFile(file: { name: string; type: string; size: number }): ImageValidationResult {
  const fileType = (file.type || '').toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  const isTypeValid = SUPPORTED_IMAGE_MIME_TYPES.includes(fileType) || SUPPORTED_EXTENSIONS.includes(ext);
  if (!isTypeValid) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Please upload JPG, PNG, or WebP images only.`,
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" (${sizeMb} MB) exceeds the 8MB limit. Please compress or choose a smaller image.`,
    };
  }

  return { valid: true };
}

/**
 * Validates a batch of files. Returns true if all valid, or the first error encountered.
 */
export function validateImageFiles(files: { name: string; type: string; size: number }[]): ImageValidationResult {
  if (!files || files.length === 0) {
    return { valid: true };
  }

  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Extracts and normalizes the ordered list of image URLs or paths for a product.
 * Falls back gracefully to single image fields for 100% backward compatibility.
 */
export function getProductImages(product?: {
  image_path?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  imageUrls?: string[] | null;
} | null): string[] {
  if (!product) return [];

  // Prefer resolved imageUrls array if populated
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const filtered = product.imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0);
    if (filtered.length > 0) return filtered;
  }

  // Next check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const filtered = product.images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    if (filtered.length > 0) return filtered;
  }

  // Fallback to single primary image fields
  const single = product.imageUrl || product.image_url || product.image_path;
  if (single && typeof single === 'string' && single.trim().length > 0) {
    return [single.trim()];
  }

  return [];
}

/**
 * Returns the primary thumbnail for a product (always the first item in order).
 */
export function getPrimaryImage(product?: {
  image_path?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  imageUrls?: string[] | null;
} | null): string {
  const images = getProductImages(product);
  return images.length > 0 ? images[0] : '';
}

/**
 * Pure immutable reorder of an array: moves item from `fromIndex` to `toIndex`.
 */
export function reorderImages<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (!Array.isArray(items)) return [];
  if (fromIndex < 0 || fromIndex >= items.length) return [...items];
  if (toIndex < 0 || toIndex >= items.length) return [...items];
  if (fromIndex === toIndex) return [...items];

  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Pure immutable removal of an item at a specific index.
 */
export function removeImageAtIndex<T>(items: T[], index: number): T[] {
  if (!Array.isArray(items)) return [];
  if (index < 0 || index >= items.length) return [...items];
  return items.filter((_, i) => i !== index);
}

/**
 * Calculates next or previous gallery index with cyclic wrapping.
 */
export function calculateNextGalleryIndex(
  currentIndex: number,
  totalImages: number,
  direction: 'prev' | 'next'
): number {
  if (totalImages <= 1) return 0;

  if (direction === 'next') {
    return (currentIndex + 1) % totalImages;
  } else {
    return (currentIndex - 1 + totalImages) % totalImages;
  }
}

/**
 * Computes swipe direction based on touch start and touch end X coordinates.
 * Returns 'left' (next) when swiped from right to left,
 * Returns 'right' (prev) when swiped from left to right,
 * Returns null if below minimum threshold (default 40px).
 */
export function detectSwipeDirection(
  touchStartX: number,
  touchEndX: number,
  minThreshold: number = 40
): 'left' | 'right' | null {
  const deltaX = touchStartX - touchEndX;
  if (Math.abs(deltaX) < minThreshold) {
    return null;
  }
  return deltaX > 0 ? 'left' : 'right';
}
