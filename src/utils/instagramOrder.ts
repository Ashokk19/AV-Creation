import { CartItem } from '../types';
import { INSTAGRAM_USERNAME, INSTAGRAM_DIRECT_URL, INSTAGRAM_PROFILE_URL, formatPriceINR } from '../lib/config';

export interface InstagramOrderValidation {
  isValid: boolean;
  errorMessage?: string;
  unpricedProducts: string[];
}

/**
 * Validates whether the cart can be checked out via Instagram.
 * Items without a fixed price are allowed and will automatically ask for a quote in the message.
 */
export function validateCartForInstagram(items: CartItem[]): InstagramOrderValidation {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Your cart is empty. Please add items before ordering.',
      unpricedProducts: [],
    };
  }

  const unpriced = items
    .filter((item) => item.product.price === null || item.product.price === undefined || isNaN(item.product.price))
    .map((item) => item.product.title);

  return {
    isValid: true,
    unpricedProducts: unpriced,
  };
}

/**
 * Builds the structured Instagram Direct Message text, handling both fixed-price
 * items and unpriced items ("please share the price").
 */
export function generateInstagramOrderMessage(items: CartItem[]): string {
  const lines: string[] = [
    "Hi! I'd like to place an order.",
    '',
    'Order Details:',
    '',
  ];

  let grandTotal = 0;
  let hasPricedItem = false;
  const unpricedTitles: string[] = [];

  items.forEach((item, index) => {
    const hasPrice =
      typeof item.product.price === 'number' && !isNaN(item.product.price);
    const colorNote = item.selectedColor ? ` (${item.selectedColor.name})` : '';
    lines.push(`${index + 1}. ${item.product.title}${colorNote}`);
    lines.push(`   - Quantity: ${item.quantity}`);

    if (hasPrice) {
      hasPricedItem = true;
      const unitPrice = item.product.price as number;
      const subtotal = unitPrice * item.quantity;
      grandTotal += subtotal;
      lines.push(`   - Price: ${formatPriceINR(unitPrice)}`);
      lines.push(`   - Subtotal: ${formatPriceINR(subtotal)}`);
    } else {
      unpricedTitles.push(item.product.title);
      lines.push('   - Price: Please share the price');
    }
    lines.push('');
  });

  if (unpricedTitles.length === 0) {
    lines.push(`Total: ${formatPriceINR(grandTotal)}`);
    lines.push('');
    lines.push('Please let me know how to proceed with the order.');
  } else if (hasPricedItem) {
    lines.push(
      `Known Items Total: ${formatPriceINR(grandTotal)} (+ quote needed for: ${unpricedTitles.join(', ')})`
    );
    lines.push('');
    lines.push('Please let me know the price for the unpriced item(s) and how to proceed with the order.');
  } else {
    lines.push('Total: Please share the price for the item(s) above.');
    lines.push('');
    lines.push('Please let me know the price and how to proceed with the order.');
  }

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
