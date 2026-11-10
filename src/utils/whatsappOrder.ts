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
 * Builds the exact structured WhatsApp message required:
 *
 * Hello AV Creations! I'd like to order:
 *
 * 1. Lotus Lamp — Qty: 2 × ₹350 = ₹700
 * 2. Articulated Dragon — Qty: 1 × ₹500 = ₹500
 *
 * Total: ₹1,200
 *
 * Please confirm availability and delivery details.
 */
export function generateWhatsAppOrderMessage(items: CartItem[]): string {
  const lines: string[] = ['Hello AV Creations! I\'d like to order:\n'];

  let grandTotal = 0;

  items.forEach((item, index) => {
    const unitPrice = item.product.price || 0;
    const lineTotal = unitPrice * item.quantity;
    grandTotal += lineTotal;

    const colorNote = item.selectedColor ? ` (${item.selectedColor.name})` : '';
    lines.push(
      `${index + 1}. ${item.product.title}${colorNote} — Qty: ${item.quantity} × ${formatPriceINR(unitPrice)} = ${formatPriceINR(lineTotal)}`
    );
  });

  lines.push(`\nTotal: ${formatPriceINR(grandTotal)}`);
  lines.push('\nPlease confirm availability and delivery details.');

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
