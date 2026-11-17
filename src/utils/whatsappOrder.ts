import { CartItem } from '../types';
import { WHATSAPP_BUSINESS_NUMBER, isWhatsAppConfigured, formatPriceINR } from '../lib/config';

export interface WhatsAppOrderValidation {
  isValid: boolean;
  errorMessage?: string;
  unpricedProducts: string[];
}

/**
 * Validates whether the cart can be checked out via WhatsApp
 */
export function validateCartForWhatsApp(
  items: CartItem[],
  options?: { isEnabled?: boolean; number?: string }
): WhatsAppOrderValidation {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Your cart is empty. Please add items before ordering.',
      unpricedProducts: [],
    };
  }

  if (options?.isEnabled === false) {
    return {
      isValid: false,
      errorMessage: 'WhatsApp ordering is currently disabled by the studio.',
      unpricedProducts: [],
    };
  }

  const effectiveNumber = options?.number ? options.number.replace(/[^\d]/g, '') : WHATSAPP_BUSINESS_NUMBER;
  if (!effectiveNumber || effectiveNumber.length < 10) {
    return {
      isValid: false,
      errorMessage: 'Studio WhatsApp order line is not configured. Please contact the administrator.',
      unpricedProducts: [],
    };
  }

  // Identify any items lacking a fixed numeric price (ordering still allowed)
  const unpriced = items
    .filter((item) => item.product.price === null || item.product.price === undefined || isNaN(item.product.price))
    .map((item) => item.product.title);

  return {
    isValid: true,
    unpricedProducts: unpriced,
  };
}

/**
 * Builds the structured WhatsApp order message, supporting both fixed-price items
 * and unpriced items where a price quote is requested.
 */
export function generateWhatsAppOrderMessage(items: CartItem[]): string {
  const lines: string[] = ['Hello AV Creations! I\'d like to order:\n'];

  let grandTotal = 0;
  let hasPricedItem = false;
  const unpricedTitles: string[] = [];

  items.forEach((item, index) => {
    const hasPrice =
      typeof item.product.price === 'number' && !isNaN(item.product.price);
    const colorNote = item.selectedColor ? ` (${item.selectedColor.name})` : '';

    if (hasPrice) {
      hasPricedItem = true;
      const unitPrice = item.product.price as number;
      const lineTotal = unitPrice * item.quantity;
      grandTotal += lineTotal;
      lines.push(
        `${index + 1}. ${item.product.title}${colorNote} — Qty: ${item.quantity} × ${formatPriceINR(unitPrice)} = ${formatPriceINR(lineTotal)}`
      );
    } else {
      unpricedTitles.push(item.product.title);
      lines.push(
        `${index + 1}. ${item.product.title}${colorNote} — Qty: ${item.quantity} (Please share the price)`
      );
    }
  });

  if (unpricedTitles.length === 0) {
    lines.push(`\nTotal: ${formatPriceINR(grandTotal)}`);
    lines.push('\nPlease confirm availability and delivery details.');
  } else if (hasPricedItem) {
    lines.push(
      `\nKnown Items Total: ${formatPriceINR(grandTotal)} (+ quote needed for: ${unpricedTitles.join(', ')})`
    );
    lines.push('\nPlease share the price for the unpriced item(s) and confirm availability and delivery details.');
  } else {
    lines.push('\nPlease share the price, availability, and delivery details.');
  }

  return lines.join('\n');
}

/**
 * Generates the full wa.me URL for the cart order using either the configured or dynamic number
 */
export function getWhatsAppOrderUrl(
  items: CartItem[],
  overrideNumber?: string
): { url: string; error?: string } {
  const effectiveNumber = overrideNumber ? overrideNumber.replace(/[^\d]/g, '') : WHATSAPP_BUSINESS_NUMBER;
  const validation = validateCartForWhatsApp(items, { isEnabled: true, number: effectiveNumber });
  if (!validation.isValid) {
    return { url: '', error: validation.errorMessage };
  }

  const message = generateWhatsAppOrderMessage(items);
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${effectiveNumber}?text=${encodedText}`;

  return { url };
}
