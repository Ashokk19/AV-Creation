import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Info,
  Phone,
  ExternalLink,
  Instagram,
  Check,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { CartItem, ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR, INSTAGRAM_USERNAME } from '../lib/config';
import { validateCartForWhatsApp, getWhatsAppOrderUrl } from '../utils/whatsappOrder';
import {
  StoreSettings,
  getStoredWhatsAppSettings,
  fetchStoreSettings,
  SETTINGS_CHANGE_EVENT,
} from '../services/settingsService';
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
  const [orderErrorToast, setOrderErrorToast] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [instagramOrderSummary, setInstagramOrderSummary] = useState('');
  const [manualCopied, setManualCopied] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getStoredWhatsAppSettings());

  useEffect(() => {
    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setStoreSettings(customEvent.detail);
      } else {
        setStoreSettings(getStoredWhatsAppSettings());
      }
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
    fetchStoreSettings().then((fresh) => {
      setStoreSettings(fresh);
    });

    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
    };
  }, []);

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

  useEffect(() => {
    if (orderToast) {
      const timer = setTimeout(() => setOrderToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [orderToast]);

  useEffect(() => {
    if (orderErrorToast) {
      const timer = setTimeout(() => setOrderErrorToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [orderErrorToast]);

  if (!isOpen) return null;

  const validation = validateCartForWhatsApp(items, {
    isEnabled: storeSettings.whatsapp_enabled,
    number: storeSettings.whatsapp_number,
  });

  const subtotal = items.reduce((acc, item) => {
    const price = typeof item.product.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0;
    return acc + price * item.quantity;
  }, 0);

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleWhatsAppOrder = () => {
    if (items.length === 0 || !storeSettings.whatsapp_enabled) return;
    const result = getWhatsAppOrderUrl(items, storeSettings.whatsapp_number);
    if (!result.url) {
      setOrderErrorToast(result.error || 'Unable to generate WhatsApp order message.');
      return;
    }

    const a = document.createElement('a');
    a.href = result.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    setOrderInitiated('whatsapp');
    setOrderToast(null);
    setOrderErrorToast(null);
  };

  const handleInstagramOrder = async () => {
    if (items.length === 0) return;

    const igValidation = validateCartForInstagram(items);
    if (!igValidation.isValid) {
      setOrderErrorToast(igValidation.errorMessage || 'Unable to generate Instagram order message.');
      return;
    }

    const message = generateInstagramOrderMessage(items);
    setInstagramOrderSummary(message);

    let copied = false;
    try {
      copied = await copyOrderToClipboard(message);
    } catch {
      copied = false;
    }

    setCopiedInstagramMessage(copied);

    const urls = getInstagramOrderUrls();
    const a = document.createElement('a');
    a.href = urls.directUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    setOrderInitiated('instagram');
    setOrderErrorToast(null);

    if (copied) {
      setOrderToast('Order details copied! Paste them in Instagram chat.');
    } else {
      setShowManualModal(true);
      setManualCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[rgba(43,39,33,0.55)] backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart drawer"
    >
      <div
        className="relative w-full max-w-md bg-[#f7f3e9] border-l border-[rgba(43,39,33,0.2)] shadow-2xl h-full flex flex-col text-[#2b2721]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(43,39,33,0.12)] bg-[#efe9da]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] text-[#784f2b] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#2b2721]">
                Your Cart
              </h2>
              <span className="text-[11px] text-[rgba(43,39,33,0.6)] tabular-nums">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-[rgba(43,39,33,0.62)] hover:text-red-700 px-2 py-1 rounded-sm transition-colors cursor-pointer"
                title="Empty your cart"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm bg-[#faf7ef] text-[rgba(43,39,33,0.7)] hover:text-[#2b2721] border border-[rgba(43,39,33,0.18)] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Toast Notification */}
        {orderToast && (
          <div className="mx-6 mt-3.5 p-3 bg-emerald-50 border border-emerald-300 rounded-sm flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-medium">{orderToast}</span>
            </div>
            <button
              onClick={() => setOrderToast(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Inline Error Toast */}
        {orderErrorToast && (
          <div className="mx-6 mt-3.5 p-3 bg-red-50 border border-red-300 rounded-sm flex items-center justify-between text-xs text-red-900">
            <span>{orderErrorToast}</span>
            <button
              onClick={() => setOrderErrorToast(null)}
              className="text-red-700 p-1 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Informational Quote Notice for Unpriced Items */}
        {validation.unpricedProducts.length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-[#faf7ef] border border-[rgba(154,106,62,0.3)] rounded-sm flex items-start gap-2.5 text-xs text-[#2b2721]">
            <Info className="w-4 h-4 text-[#9a6a3e] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-medium block text-[#784f2b]">Quote Included in Your Order</span>
              <p className="text-[11px] leading-relaxed text-[rgba(43,39,33,0.75)]">
                <strong>{validation.unpricedProducts.join(', ')}</strong> {validation.unpricedProducts.length > 1 ? 'have' : 'has'} price on request — your order message will ask the studio for the price automatically.
              </p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-14 h-14 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] flex items-center justify-center mx-auto text-[#9a6a3e]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="sb-display text-2xl text-[#2b2721]">Your cart is empty</p>
                <p className="sb-prose text-sm text-[rgba(43,39,33,0.7)] max-w-xs mx-auto leading-relaxed">
                  Browse the sketchbook catalogue and add editions to order directly via{' '}
                  {storeSettings.whatsapp_enabled ? 'WhatsApp or Instagram' : 'Instagram'}.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] font-medium text-xs uppercase tracking-[0.16em] rounded-sm transition-colors cursor-pointer"
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
                    className="p-3.5 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => {
                          onSelectProduct(item.product);
                          onClose();
                        }}
                        className="w-16 h-16 rounded-sm overflow-hidden bg-[#f1ece0] shrink-0 border border-[rgba(43,39,33,0.14)] cursor-pointer"
                        title="View product details"
                      >
                        <PrintArtwork product={item.product} fitMode="contain" className="w-full h-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onSelectProduct(item.product);
                              onClose();
                            }}
                            className="sb-display text-lg text-[#2b2721] hover:text-[#784f2b] transition-colors cursor-pointer truncate"
                          >
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedColor?.name)}
                            className="text-[rgba(43,39,33,0.52)] hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                            title="Remove from cart"
                            aria-label={`Remove ${item.product.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          {hasPrice ? (
                            <span className="text-xs font-medium text-[#784f2b] tabular-nums">
                              {formatPriceINR(item.product.price!)}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                              Price on request
                            </span>
                          )}
                          <span className="text-[11px] text-[rgba(43,39,33,0.56)]">each</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(43,39,33,0.1)]">
                      <div className="flex items-center gap-1.5 bg-[#f7f3e9] border border-[rgba(43,39,33,0.18)] rounded-sm p-0.5">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor?.name);
                            }
                          }}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center text-[#2b2721] hover:bg-[#ece7dc] rounded-sm disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono font-semibold text-[#2b2721]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor?.name);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-[#2b2721] hover:bg-[#ece7dc] rounded-sm cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[rgba(43,39,33,0.56)] block">
                          Subtotal
                        </span>
                        <span className="text-sm font-medium text-[#2b2721] tabular-nums">
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

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[rgba(43,39,33,0.14)] bg-[#efe9da] p-5 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[rgba(43,39,33,0.72)]">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#2b2721] tabular-nums">
                  {validation.unpricedProducts.length > 0
                    ? subtotal > 0
                      ? `${formatPriceINR(subtotal)} + Quote`
                      : 'Price on Request'
                    : formatPriceINR(subtotal)}
                </span>
              </div>
              <div className="pt-2 border-t border-[rgba(43,39,33,0.12)] flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-medium text-[#2b2721] block">Total Order</span>
                  <span className="text-[11px] text-[rgba(43,39,33,0.6)]">
                    Confirmed via {storeSettings.whatsapp_enabled ? 'WhatsApp or Instagram' : 'Instagram'}
                  </span>
                </div>
                <span className="sb-display text-2xl text-[#784f2b] tabular-nums">
                  {validation.unpricedProducts.length > 0
                    ? subtotal > 0
                      ? `${formatPriceINR(subtotal)} + Quote`
                      : 'Ask Price'
                    : formatPriceINR(subtotal)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {storeSettings.whatsapp_enabled && (
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={!validation.isValid}
                  className="w-full py-3 px-4 bg-[#2b2721] hover:bg-[#3f5e42] disabled:opacity-40 disabled:cursor-not-allowed text-[#faf7ef] font-medium text-xs uppercase tracking-[0.16em] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Order via WhatsApp</span>
                </button>
              )}

              <button
                onClick={handleInstagramOrder}
                disabled={items.length === 0}
                className="w-full py-3 px-4 bg-[#784f2b] hover:bg-[#5e3d21] disabled:opacity-40 disabled:cursor-not-allowed text-[#faf7ef] font-medium text-xs uppercase tracking-[0.16em] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Order via Instagram (@{INSTAGRAM_USERNAME})</span>
              </button>

              <p className="text-[11px] text-[rgba(43,39,33,0.65)] text-center leading-relaxed">
                Send your prefilled order summary directly to the studio — no online payment charged until we confirm availability and dispatch.
              </p>
            </div>

            {orderInitiated === 'instagram' && (
              <div className="p-3 bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#2b2721]">
                    Instagram DM (@{INSTAGRAM_USERNAME})
                  </span>
                  <button
                    onClick={() => {
                      setInstagramOrderSummary(generateInstagramOrderMessage(items));
                      setShowManualModal(true);
                      setManualCopied(false);
                    }}
                    className="text-[11px] text-[#784f2b] underline cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
                <div className="flex items-center gap-2">
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
                    className="flex-1 py-1.5 px-3 bg-[#f7f3e9] hover:bg-white text-[#2b2721] rounded-sm text-[11px] font-medium flex items-center justify-center gap-1.5 border border-[rgba(43,39,33,0.18)] cursor-pointer"
                  >
                    {copiedInstagramMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Order Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#784f2b]" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getInstagramOrderUrls().directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-[#f7f3e9] hover:bg-white text-[#784f2b] rounded-sm text-[11px] font-medium flex items-center justify-center gap-1 border border-[rgba(43,39,33,0.18)] cursor-pointer"
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

      {/* Manual Copy Fallback Modal */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-60 bg-[rgba(43,39,33,0.72)] backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowManualModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Order Summary Modal"
        >
          <div
            className="relative w-full max-w-lg bg-[#f7f3e9] border border-[rgba(43,39,33,0.22)] rounded-sm shadow-2xl overflow-hidden p-6 text-[#2b2721] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[rgba(43,39,33,0.12)] pb-3">
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-[#784f2b]" />
                <div>
                  <h3 className="sb-display text-2xl text-[#2b2721]">Instagram Order Details</h3>
                  <span className="text-xs text-[#784f2b]">Send to @{INSTAGRAM_USERNAME}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-sm text-[rgba(43,39,33,0.6)] hover:text-[#2b2721] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="w-full max-h-56 overflow-y-auto p-3.5 bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] rounded-sm text-xs font-mono text-[#2b2721] whitespace-pre-wrap leading-relaxed select-all">
              {instagramOrderSummary || generateInstagramOrderMessage(items)}
            </pre>

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
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] font-medium text-xs uppercase tracking-[0.16em] rounded-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {manualCopied ? (
                  <>
                    <Check className="w-4 h-4" />
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
                className="w-full sm:w-auto py-2.5 px-4 bg-[#faf7ef] hover:bg-white text-[#2b2721] font-medium text-xs rounded-sm border border-[rgba(43,39,33,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Instagram DM</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#784f2b]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
