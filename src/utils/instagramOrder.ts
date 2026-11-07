import { CartItem } from '../types';
import { INSTAGRAM_USERNAME, INSTAGRAM_DIRECT_URL, INSTAGRAM_PROFILE_URL, formatPriceINR } from '../lib/config';

export interface InstagramOrderValidation {
  isValid: boolean;
  errorMessage?: string;
  unpricedProducts: string[];
}

/**
 * Validates whether the cart can be checked out via Instagram
 */
export function validateCartForInstagram(items: CartItem[]): InstagramOrderValidation {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Your cart is empty. Please add items before ordering.',
      unpricedProducts: [],
    };
  }

  // Check if any products lack a numeric price
  const unpriced = items
    .filter((item) => item.product.price === null || item.product.price === undefined || isNaN(item.product.price))
    .map((item) => item.product.title);

  if (unpriced.length > 0) {
    return {
      isValid: false,
      errorMessage: `The following item${unpriced.length > 1 ? 's do' : ' does'} not have a fixed price yet (${unpriced.join(', ')}). Please remove ${unpriced.length > 1 ? 'them' : 'it'} or request a custom commission.`,
      unpricedProducts: unpriced,
    };
  }

  return {
    isValid: true,
    unpricedProducts: [],
  };
}

/**
 * Builds the structured Instagram Direct Message text:
 *
 * Hi! I'd like to place an order.
 *
 * Order Details:
 *
 * 1. Articulated Dragon
 *    - Quantity: 2
 *    - Price: ₹300
 *    - Subtotal: ₹600
 *
 * 2. Lotus Lamp
 *    - Quantity: 1
 *    - Price: ₹450
 *    - Subtotal: ₹450
 *
 * Total: ₹1,050
 *
 * Please let me know how to proceed with the order.
 */
export function generateInstagramOrderMessage(items: CartItem[]): string {
  const lines: string[] = [
    "Hi! I'd like to place an order.",
    '',
    'Order Details:',
    '',
  ];

  let grandTotal = 0;

  items.forEach((item, index) => {
    const unitPrice = typeof item.product.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0;
    const subtotal = unitPrice * item.quantity;
    grandTotal += subtotal;

    const colorNote = item.selectedColor ? ` (${item.selectedColor.name})` : '';
    lines.push(`${index + 1}. ${item.product.title}${colorNote}`);
    lines.push(`   - Quantity: ${item.quantity}`);
    lines.push(`   - Price: ${formatPriceINR(unitPrice)}`);
    lines.push(`   - Subtotal: ${formatPriceINR(subtotal)}`);
    lines.push('');
  });

  lines.push(`Total: ${formatPriceINR(grandTotal)}`);
  lines.push('');
  lines.push('Please let me know how to proceed with the order.');

  return lines.join('\n');
}

/**
 * Returns the direct messaging and profile URLs for Instagram
 */
export function getInstagramOrderUrls(): {
  directUrl: string;
  webDirectUrl: string;
  profileUrl: string;
} {
  return {
    directUrl: INSTAGRAM_DIRECT_URL,
    webDirectUrl: `https://www.instagram.com/direct/t/${INSTAGRAM_USERNAME}/`,
    profileUrl: INSTAGRAM_PROFILE_URL,
  };
}

/**
 * Copies the formatted order text to the user's clipboard
 */
export async function copyOrderToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback using temporary textarea element
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
