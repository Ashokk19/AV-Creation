/**
 * Centralized Configuration for AV Creation Studio
 */

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
const procEnv = typeof process !== 'undefined' && process.env ? process.env : undefined;

// Business WhatsApp Number (clean international format: digits only, e.g. 919876543210)
// Can be customized via VITE_WHATSAPP_NUMBER in .env
const rawWhatsApp = metaEnv?.VITE_WHATSAPP_NUMBER || procEnv?.VITE_WHATSAPP_NUMBER || '919876543210';
export const WHATSAPP_BUSINESS_NUMBER = rawWhatsApp.replace(/[^\d]/g, '');

/**
 * Validates if the business WhatsApp number is properly configured
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(WHATSAPP_BUSINESS_NUMBER && WHATSAPP_BUSINESS_NUMBER.length >= 10);
}

// Studio Instagram Configuration
// Default username: avcreations963
const rawInstagram = metaEnv?.VITE_INSTAGRAM_USERNAME || procEnv?.VITE_INSTAGRAM_USERNAME || 'avcreations963';
export const INSTAGRAM_USERNAME = rawInstagram.replace(/^@/, '').trim();
export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
export const INSTAGRAM_DIRECT_URL = `https://ig.me/m/${INSTAGRAM_USERNAME}`;

/**
 * Formats numeric price into Indian Rupees (INR) format: e.g. ₹350, ₹1,200
 * If price is null or undefined, returns "Price on request"
 */
export function formatPriceINR(price?: number | null, fallback = 'Price on request'): string {
  if (price === null || price === undefined || isNaN(price)) {
    return fallback;
  }

  // Format using Indian numbering system (lakhs/crores formatting)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}
