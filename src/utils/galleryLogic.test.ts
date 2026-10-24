import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageFile,
  validateImageFiles,
  getProductImages,
  getPrimaryImage,
  reorderImages,
  removeImageAtIndex,
  calculateNextGalleryIndex,
  detectSwipeDirection,
} from './galleryLogic';

describe('galleryLogic', () => {
  describe('validateImageFile', () => {
    test('accepts valid jpg, png, and webp files within 8MB', () => {
      assert.equal(validateImageFile({ name: 'lamp.jpg', type: 'image/jpeg', size: 1024 }).valid, true);
      assert.equal(validateImageFile({ name: 'dragon.png', type: 'image/png', size: 5 * 1024 * 1024 }).valid, true);
      assert.equal(validateImageFile({ name: 'vessel.webp', type: 'image/webp', size: 2 * 1024 * 1024 }).valid, true);
    });

    test('rejects unsupported file formats like pdf or gif or exe', () => {
      const res = validateImageFile({ name: 'document.pdf', type: 'application/pdf', size: 1024 });
      assert.equal(res.valid, false);
      assert.match(res.error || '', /unsupported format/i);
    });

    test('rejects files exceeding 8MB', () => {
      const res = validateImageFile({ name: 'huge.png', type: 'image/png', size: 9 * 1024 * 1024 });
      assert.equal(res.valid, false);
      assert.match(res.error || '', /exceeds the 8MB limit/i);
    });
  });

  describe('validateImageFiles', () => {
    test('validates an entire list of files', () => {
      const files = [
        { name: '1.jpg', type: 'image/jpeg', size: 1000 },
        { name: '2.png', type: 'image/png', size: 2000 },
      ];
      assert.equal(validateImageFiles(files).valid, true);

      const invalidBatch = [
        { name: '1.jpg', type: 'image/jpeg', size: 1000 },
        { name: 'bad.exe', type: 'application/x-msdownload', size: 2000 },
      ];
      assert.equal(validateImageFiles(invalidBatch).valid, false);
    });
  });

  describe('getProductImages & getPrimaryImage', () => {
    test('prefers imageUrls when available', () => {
      const product = {
        imageUrls: ['https://cdn/1.jpg', 'https://cdn/2.jpg'],
        image_path: 'products/old.jpg',
      };
      assert.deepEqual(getProductImages(product), ['https://cdn/1.jpg', 'https://cdn/2.jpg']);
      assert.equal(getPrimaryImage(product), 'https://cdn/1.jpg');
    });

    test('falls back to images array if imageUrls not provided', () => {
      const product = {
        images: ['path/1.jpg', 'path/2.jpg'],
        image_path: 'path/1.jpg',
      };
      assert.deepEqual(getProductImages(product), ['path/1.jpg', 'path/2.jpg']);
      assert.equal(getPrimaryImage(product), 'path/1.jpg');
    });

    test('falls back to single image_path or imageUrl for legacy products', () => {
      const product = {
        image_path: 'products/single.jpg',
      };
      assert.deepEqual(getProductImages(product), ['products/single.jpg']);
      assert.equal(getPrimaryImage(product), 'products/single.jpg');
    });

    test('returns empty array when product has no images', () => {
      assert.deepEqual(getProductImages(null), []);
      assert.equal(getPrimaryImage(null), '');
    });
  });

  describe('reorderImages', () => {
    test('moves item from source to destination position', () => {
      const list = ['A', 'B', 'C', 'D'];
      const moved = reorderImages(list, 0, 2);
      assert.deepEqual(moved, ['B', 'C', 'A', 'D']);
    });

    test('moves item backward correctly', () => {
      const list = ['A', 'B', 'C', 'D'];
      const moved = reorderImages(list, 3, 0);
      assert.deepEqual(moved, ['D', 'A', 'B', 'C']);
    });

    test('handles out of bounds indices safely', () => {
      const list = ['A', 'B'];
      assert.deepEqual(reorderImages(list, -1, 1), ['A', 'B']);
      assert.deepEqual(reorderImages(list, 0, 5), ['A', 'B']);
    });
  });

  describe('removeImageAtIndex', () => {
    test('removes item at given index without mutating original', () => {
      const list = ['A', 'B', 'C'];
      const updated = removeImageAtIndex(list, 1);
      assert.deepEqual(updated, ['A', 'C']);
      assert.deepEqual(list, ['A', 'B', 'C']); // pure
    });

    test('when first image is removed, next image becomes primary at index 0', () => {
      const list = ['Photo 1', 'Photo 2', 'Photo 3'];
      const updated = removeImageAtIndex(list, 0);
      assert.equal(updated[0], 'Photo 2');
    });
  });

  describe('calculateNextGalleryIndex', () => {
    test('increments index with cyclic wrap', () => {
      assert.equal(calculateNextGalleryIndex(0, 3, 'next'), 1);
      assert.equal(calculateNextGalleryIndex(1, 3, 'next'), 2);
      assert.equal(calculateNextGalleryIndex(2, 3, 'next'), 0); // wrap
    });

    test('decrements index with cyclic wrap', () => {
      assert.equal(calculateNextGalleryIndex(0, 3, 'prev'), 2); // wrap backward
      assert.equal(calculateNextGalleryIndex(2, 3, 'prev'), 1);
    });

    test('returns 0 if only 1 image', () => {
      assert.equal(calculateNextGalleryIndex(0, 1, 'next'), 0);
    });
  });

  describe('detectSwipeDirection', () => {
    test('detects swipe left (drag from right to left -> next)', () => {
      assert.equal(detectSwipeDirection(200, 100, 40), 'left');
    });

    test('detects swipe right (drag from left to right -> prev)', () => {
      assert.equal(detectSwipeDirection(100, 200, 40), 'right');
    });

    test('ignores micro movements below threshold', () => {
      assert.equal(detectSwipeDirection(100, 110, 40), null);
    });
  });
});
