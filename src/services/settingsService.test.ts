import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePhoneNumber,
  DEFAULT_STORE_SETTINGS,
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
  });
});
