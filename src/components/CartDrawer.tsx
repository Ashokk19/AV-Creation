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
  Instagram,
  Check,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { CartItem, ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR, WHATSAPP_BUSINESS_NUMBER, isWhatsAppConfigured, INSTAGRAM_USERNAME } from '../lib/config';
import { validateCartForWhatsApp, getWhatsAppOrderUrl } from '../utils/whatsappOrder';
import {
  validateCartForInstagram,
  generateInstagramOrderMessage,
  getInstagramOrderUrls,
  copyOrderToClipboard,
} from '../utils/instagramOrder';

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
  const [orderInitiated, setOrderInitiated] = useState<'whatsapp' | 'instagram' | null>(null);
  const [copiedInstagramMessage, setCopiedInstagramMessage] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [instagramOrderSummary, setInstagramOrderSummary] = useState('');
  const [manualCopied, setManualCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showManualModal) {
          setShowManualModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showManualModal]);

  // Clear toast after timeout
  useEffect(() => {
    if (orderToast) {
      const timer = setTimeout(() => {
        setOrderToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [orderToast]);

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
    if (items.length === 0) return;
    const result = getWhatsAppOrderUrl(items);
    if (!result.url) {
      alert(result.error || 'Unable to generate WhatsApp order message.');
      return;
    }

    // Open WhatsApp order in new window/tab
    window.open(result.url, '_blank', 'noopener,noreferrer');
    setOrderInitiated('whatsapp');
    setOrderToast(null);
  };

  const handleInstagramOrder = async () => {
    if (items.length === 0) return;

    const validation = validateCartForInstagram(items);
    if (!validation.isValid) {
      alert(validation.errorMessage || 'Unable to generate Instagram order message.');
      return;
    }

    // 1. Dynamically generate the order summary from the current cart
    const message = generateInstagramOrderMessage(items);
    setInstagramOrderSummary(message);

    // 2. Automatically copy order summary to clipboard directly from user click
    let copied = false;
    try {
      copied = await copyOrderToClipboard(message);
    } catch {
      copied = false;
    }

    setCopiedInstagramMessage(copied);

    // 3. Open Instagram DM using existing account URL
    const urls = getInstagramOrderUrls();
    window.open(urls.directUrl, '_blank', 'noopener,noreferrer');
    setOrderInitiated('instagram');

    // 4. User experience feedback
    if (copied) {
      setOrderToast('Order details copied! Paste them in Instagram chat.');
    } else {
      // If clipboard access fails, display the generated order summary in a modal with a manual Copy button
      setShowManualModal(true);
      setManualCopied(false);
    }
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

        {/* Success Toast Notification */}
        {orderToast && (
          <div className="mx-6 mt-3.5 p-3 bg-emerald-950/95 border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs text-emerald-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">
                {orderToast}
              </span>
            </div>
            <button
              onClick={() => setOrderToast(null)}
              className="text-emerald-300 hover:text-white p-1 rounded hover:bg-emerald-900/40 transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
                <span className="text-[#E7A96B]">Confirmed via WhatsApp / Instagram</span>
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

            {/* Order Action Buttons: WhatsApp & Instagram */}
            <div className="space-y-2.5">
              <button
                onClick={handleWhatsAppOrder}
                disabled={!validation.isValid}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#222226] disabled:text-[#666] disabled:cursor-not-allowed text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Order via WhatsApp</span>
              </button>

              <button
                onClick={handleInstagramOrder}
                disabled={!validation.isValid}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <Instagram className="w-4 h-4" />
                <span>Order via Instagram (@{INSTAGRAM_USERNAME})</span>
              </button>

              <p className="text-[11px] text-[#71717A] text-center leading-relaxed">
                Choose WhatsApp or Instagram to send your prefilled order items directly to the studio. No online payment charged now — we confirm availability, finish options, and dispatch.
              </p>
            </div>

            {orderInitiated === 'whatsapp' && (
              <div className="p-3 bg-[#1C1C22] border border-emerald-500/30 rounded-lg text-center space-y-1">
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  WhatsApp window opened!
                </span>
                <p className="text-[10px] text-[#A1A1AA]">
                  Your cart remains saved until you wish to clear it.
                </p>
              </div>
            )}

            {orderInitiated === 'instagram' && (
              <div className="p-3 bg-[#1C1C22] border border-[#FD1D1D]/30 rounded-xl text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3EF]">
                    <Instagram className="w-4 h-4 text-[#F77737]" />
                    <span>Instagram Direct (@{INSTAGRAM_USERNAME})</span>
                  </div>
                  <button
                    onClick={() => {
                      setInstagramOrderSummary(generateInstagramOrderMessage(items));
                      setShowManualModal(true);
                      setManualCopied(false);
                    }}
                    className="text-[11px] text-[#E7A96B] hover:text-[#F0B87E] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
                <p className="text-[11px] text-[#D4D4D8] leading-relaxed">
                  {copiedInstagramMessage
                    ? `Your complete order details are copied to your clipboard! Paste them into your Instagram DM to @${INSTAGRAM_USERNAME}.`
                    : `Opening Instagram DM. Use the button below to copy your order summary or view the full details.`}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const msg = generateInstagramOrderMessage(items);
                      const success = await copyOrderToClipboard(msg);
                      if (success) {
                        setCopiedInstagramMessage(true);
                        setOrderToast('Order details copied! Paste them in Instagram chat.');
                      } else {
                        setInstagramOrderSummary(msg);
                        setShowManualModal(true);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#24242A] hover:bg-[#2E2E36] text-[#F5F3EF] rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 border border-[#34343C] transition-colors cursor-pointer"
                  >
                    {copiedInstagramMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Order Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#E7A96B]" />
                        <span>Copy Order Details</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getInstagramOrderUrls().directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-[#24242A] hover:bg-[#2E2E36] text-[#E7A96B] rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 border border-[#34343C] transition-colors cursor-pointer"
                  >
                    <span>Open Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Copy Modal for Instagram Order (shown if clipboard fails or when user clicks View Details) */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowManualModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Order Summary Modal"
        >
          <div
            className="relative w-full max-w-lg bg-[#18181B] border border-[#2E2E36] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F5F3EF] space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#2A2A32] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Instagram Order Details
                  </h3>
                  <span className="text-[11px] font-mono text-[#E7A96B]">
                    Send to @{INSTAGRAM_USERNAME}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#25252C] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Copy the order summary below and paste it directly into your Instagram chat with{' '}
                <strong className="text-[#F5F3EF]">@{INSTAGRAM_USERNAME}</strong>:
              </p>

              <pre className="w-full max-h-56 overflow-y-auto p-3.5 bg-[#101012] border border-[#27272D] rounded-xl text-xs font-mono text-[#D4D4D8] whitespace-pre-wrap leading-relaxed select-all">
                {instagramOrderSummary || generateInstagramOrderMessage(items)}
              </pre>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  const msg = instagramOrderSummary || generateInstagramOrderMessage(items);
                  const success = await copyOrderToClipboard(msg);
                  if (success) {
                    setManualCopied(true);
                    setOrderToast('Order details copied! Paste them in Instagram chat.');
                    setTimeout(() => setManualCopied(false), 3000);
                  }
                }}
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {manualCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Order Details</span>
                  </>
                )}
              </button>

              <a
                href={getInstagramOrderUrls().directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 bg-[#24242A] hover:bg-[#2E2E36] text-white font-medium text-xs rounded-xl border border-[#34343C] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Instagram DM</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E7A96B]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
