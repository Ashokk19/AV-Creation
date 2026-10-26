import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTargetDimensions,
  formatFileSize,
  compressImageForUpload,
} from './imageOptimizer';

describe('imageOptimizer', () => {
  describe('calculateTargetDimensions', () => {
    it('maintains original dimensions when within bounds', () => {
      const { targetWidth, targetHeight } = calculateTargetDimensions(1200, 800, 1920, 1920);
      assert.equal(targetWidth, 1200);
      assert.equal(targetHeight, 800);
    });

    it('downsamples wide images preserving aspect ratio', () => {
      // 4000x2000 -> 2:1 ratio. Bound 1920 -> 1920x960
      const { targetWidth, targetHeight } = calculateTargetDimensions(4000, 2000, 1920, 1920);
      assert.equal(targetWidth, 1920);
      assert.equal(targetHeight, 960);
    });

    it('downsamples tall portrait images preserving aspect ratio', () => {
      // 2000x4000 -> 1:2 ratio. Bound 1920 -> 960x1920
      const { targetWidth, targetHeight } = calculateTargetDimensions(2000, 4000, 1920, 1920);
      assert.equal(targetWidth, 960);
      assert.equal(targetHeight, 1920);
    });

    it('handles square images properly', () => {
      const { targetWidth, targetHeight } = calculateTargetDimensions(3000, 3000, 1920, 1920);
      assert.equal(targetWidth, 1920);
      assert.equal(targetHeight, 1920);
    });

    it('handles zero or negative dimensions safely', () => {
      const { targetWidth, targetHeight } = calculateTargetDimensions(0, 0, 1920, 1920);
      assert.ok(targetWidth >= 1);
      assert.ok(targetHeight >= 1);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes, kilobytes, and megabytes cleanly', () => {
      assert.equal(formatFileSize(0), '0 B');
      assert.equal(formatFileSize(500), '500 B');
      assert.equal(formatFileSize(1024), '1.0 KB');
      assert.equal(formatFileSize(200 * 1024), '200.0 KB');
      assert.equal(formatFileSize(1.5 * 1024 * 1024), '1.50 MB');
    });
  });

  describe('compressImageForUpload non-browser fallback', () => {
    it('safely returns original file in Node.js test environment', async () => {
      const mockFile = new File(['test image data content'], 'test.png', { type: 'image/png' });
      const result = await compressImageForUpload(mockFile);
      assert.equal(result.file.name, 'test.png');
      assert.equal(result.isOptimized, false);
      assert.equal(result.originalSize, mockFile.size);
    });
  });
});
