import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePhoneNumber,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_HERO_FRAME_SETTINGS,
  validateHeroFrameSettings,
} from './settingsService';

describe('settingsService', () => {
  test('sanitizePhoneNumber strips non-numeric characters', () => {
    assert.equal(sanitizePhoneNumber('+91 98765 43210'), '919876543210');
    assert.equal(sanitizePhoneNumber('+91-987-654-3210'), '919876543210');
    assert.equal(sanitizePhoneNumber('(022) 1234567890'), '0221234567890');
    assert.equal(sanitizePhoneNumber('919876543210'), '919876543210');
  });

  test('DEFAULT_STORE_SETTINGS has valid enabled flag and number', () => {
    assert.equal(DEFAULT_STORE_SETTINGS.whatsapp_enabled, true);
    assert.ok(DEFAULT_STORE_SETTINGS.whatsapp_number.length >= 10);
    assert.equal(DEFAULT_STORE_SETTINGS.hero_image_type, 'logo');
    assert.ok(DEFAULT_STORE_SETTINGS.company_logo_url.includes('AV_Creations_Logo_with_3D_Printer_Icon'));
    assert.equal(DEFAULT_STORE_SETTINGS.hero_frame.style, 'card');
    assert.equal(DEFAULT_STORE_SETTINGS.hero_frame.fit, 'contain');
    assert.equal(DEFAULT_STORE_SETTINGS.hero_frame.aspectRatio, '4/5');
  });

  test('validateHeroFrameSettings clamps out-of-range numbers and sanitizes enums', () => {
    const sanitized = validateHeroFrameSettings({
      style: 'invalid_style',
      fit: 'cover',
      focalPoint: { x: 150, y: -20 },
      aspectRatio: '16/9',
      backdrop: 'unknown_backdrop',
      radius: 999,
      padding: -50,
      blur: 120,
    });

    assert.equal(sanitized.style, 'card'); // falls back to default
    assert.equal(sanitized.fit, 'cover');
    assert.equal(sanitized.focalPoint.x, 100); // clamped to 100
    assert.equal(sanitized.focalPoint.y, 0); // clamped to 0
    assert.equal(sanitized.aspectRatio, '16/9');
    assert.equal(sanitized.backdrop, 'blur'); // falls back to default
    assert.equal(sanitized.radius, 40); // clamped to max 40
    assert.equal(sanitized.padding, 0); // clamped to min 0
    assert.equal(sanitized.blur, 60); // clamped to max 60
  });
});

