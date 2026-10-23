import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CartItem, ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR, WHATSAPP_BUSINESS_NUMBER, isWhatsAppConfigured } from '../lib/config';
import { validateCartForWhatsApp, getWhatsAppOrderUrl } from '../utils/whatsappOrder';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedColorName?: string) => void;
  onRemoveItem: (productId: string, selectedColorName?: string) => void;
  onClearCart: () => void;
  onSelectProduct: (product: ProductItem) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSelectProduct,
}) => {
  const [orderInitiated, setOrderInitiated] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation
  const validation = validateCartForWhatsApp(items);

  // Subtotal calculation (priced items only)
  const subtotal = items.reduce((acc, item) => {
    const price = typeof item.product.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0;
    return acc + price * item.quantity;
  }, 0);

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleWhatsAppOrder = () => {
    const result = getWhatsAppOrderUrl(items);
    if (!result.url) {
      alert(result.error || 'Unable to generate WhatsApp order message.');
      return;
    }

    // Open WhatsApp order in new window/tab
    window.open(result.url, '_blank', 'noopener,noreferrer');
    setOrderInitiated(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart drawer"
    >
      <div
        className="relative w-full max-w-md bg-[#141416] border-l border-[#242428] shadow-2xl h-full flex flex-col text-[#F5F3EF] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222226] bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E7A96B]/15 text-[#E7A96B] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F3EF]">
                Your Cart
              </h2>
              <span className="text-[11px] font-mono text-[#71717A]">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-[11px] text-[#71717A] hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
                title="Empty your cart"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#1E1E22] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#2E2E34] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unpriced Warning Alert (if any cart items lack price) */}
        {validation.unpricedProducts.length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-amber-300">
                Action Required: Custom Pricing
              </span>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                The following creation{validation.unpricedProducts.length > 1 ? 's have' : ' has'} no fixed catalogue price:
                <strong className="block text-white mt-0.5">{validation.unpricedProducts.join(', ')}</strong>
                Please remove {validation.unpricedProducts.length > 1 ? 'them' : 'it'} or submit an enquiry via the Custom Print section to request a quote.
              </p>
            </div>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1A1A1E] border border-[#2A2A30] flex items-center justify-center mx-auto text-[#71717A]">
                <ShoppingBag className="w-6 h-6 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#F5F3EF]">
                  Your cart is empty
                </p>
                <p className="text-xs text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                  Browse our handcrafted additive manufacturing designs and add items to easily order directly via WhatsApp.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
              >
                <span>Browse Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const colorKey = item.selectedColor ? item.selectedColor.name : 'default';
                const itemKey = `${item.product.id}-${colorKey}`;
                const hasPrice = typeof item.product.price === 'number' && !isNaN(item.product.price);
                const lineTotal = hasPrice ? item.product.price! * item.quantity : null;

                return (
                  <div
                    key={itemKey}
                    className="p-3.5 rounded-xl bg-[#18181C] border border-[#26262B] hover:border-[#383840] transition-colors space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div
                        onClick={() => {
                          onSelectProduct(item.product);
                          onClose();
                        }}
                        className="w-16 h-16 rounded-lg overflow-hidden bg-[#101012] shrink-0 border border-[#2D2D34] cursor-pointer hover:opacity-90 transition-opacity"
                        title="View product details"
                      >
                        <PrintArtwork product={item.product} className="w-full h-full" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onSelectProduct(item.product);
                              onClose();
                            }}
                            className="text-xs font-bold text-[#F5F3EF] hover:text-[#E7A96B] transition-colors cursor-pointer truncate"
                          >
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedColor?.name)}
                            className="text-[#71717A] hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Selected Color Finish */}
                        {item.selectedColor && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span className="text-[11px] text-[#A1A1AA] truncate">
                              {item.selectedColor.name}
                            </span>
                          </div>
                        )}

                        {/* Unit Price */}
                        <div className="mt-1.5 flex items-baseline gap-2">
                          {hasPrice ? (
                            <span className="text-xs font-mono font-semibold text-[#E7A96B]">
                              {formatPriceINR(item.product.price!)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                              Price on request
                            </span>
                          )}
                          <span className="text-[10px] text-[#71717A]">each</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Line Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#222226]">
                      <div className="flex items-center gap-1.5 bg-[#121214] border border-[#27272C] rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor?.name);
                            }
                          }}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F3EF] hover:bg-[#202026] rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono font-bold text-[#F5F3EF]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor?.name);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F3EF] hover:bg-[#202026] rounded cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] block font-mono">Line Subtotal</span>
                        <span className="text-xs font-mono font-bold text-[#F5F3EF]">
                          {lineTotal !== null ? formatPriceINR(lineTotal) : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal & WhatsApp Order CTA */}
        {items.length > 0 && (
          <div className="border-t border-[#222226] bg-[#161619] p-5 space-y-4">
            {/* Calculation Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Items Subtotal</span>
                <span className="font-mono text-[#F5F3EF] font-semibold">{formatPriceINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#71717A] text-[11px]">
                <span>Fulfillment & Packaging</span>
                <span className="text-[#E7A96B]">Confirmed via WhatsApp</span>
              </div>
              <div className="pt-2 border-t border-[#26262B] flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-[#F5F3EF] block">Total Order</span>
                  <span className="text-[10px] text-[#71717A]">Inclusive of all 3D print specs</span>
                </div>
                <span className="text-lg font-mono font-extrabold text-[#E7A96B]">
                  {formatPriceINR(subtotal)}
                </span>
              </div>
            </div>

            {/* Order via WhatsApp Action Button */}
            <div className="space-y-2">
              <button
                onClick={handleWhatsAppOrder}
                disabled={!validation.isValid}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#222226] disabled:text-[#666] disabled:cursor-not-allowed text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Order via WhatsApp</span>
              </button>

              <p className="text-[11px] text-[#71717A] text-center leading-relaxed">
                Clicking opens WhatsApp with your prefilled order items. No online payment is charged now. AV Creations studio will verify availability and confirm fulfillment.
              </p>
            </div>

            {orderInitiated && (
              <div className="p-2.5 bg-[#1C1C22] border border-[#2E2E36] rounded-lg text-center space-y-1">
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  WhatsApp window opened!
                </span>
                <p className="text-[10px] text-[#A1A1AA]">
                  Your cart remains saved until you wish to clear it.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
