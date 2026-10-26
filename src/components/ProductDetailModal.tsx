import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bookmark,
  Layers,
  Sparkles,
  Send,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Images,
} from 'lucide-react';
import { ProductItem, ColorVariant } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR } from '../lib/config';
import {
  getProductImages,
  calculateNextGalleryIndex,
  detectSwipeDirection,
} from '../utils/galleryLogic';

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: ProductItem) => void;
  onRequestOrder: (product: ProductItem, selectedColor: ColorVariant) => void;
  onAddToCart?: (product: ProductItem, quantity: number, selectedColor: ColorVariant) => void;
  onSelectRelated: (product: ProductItem) => void;
  relatedProducts: ProductItem[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onRequestOrder,
  onAddToCart,
  onSelectRelated,
  relatedProducts,
}) => {
  const [activeAngle, setActiveAngle] = useState<'primary' | 'detail' | 'sliced'>('primary');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Touch swipe tracking state
  const touchStartXRef = useRef<number | null>(null);
  const thumbnailRowRef = useRef<HTMLDivElement>(null);

  // Extract all product photos in order
  const galleryImages = getProductImages(product);
  const hasMultipleImages = galleryImages.length > 1;

  // Reset state when product changes
  useEffect(() => {
    setActiveAngle('primary');
    setQuantity(1);
    setActiveImageIndex(0);
  }, [product?.id]);

  // Scroll active thumbnail into view smoothly
  useEffect(() => {
    if (thumbnailRowRef.current && hasMultipleImages) {
      const activeThumb = thumbnailRowRef.current.children[activeImageIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeImageIndex, hasMultipleImages]);

  // Gallery Navigation Handlers
  const handleNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => calculateNextGalleryIndex(prev, galleryImages.length, 'next'));
  };

  const handlePrevImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => calculateNextGalleryIndex(prev, galleryImages.length, 'prev'));
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultipleImages || touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const direction = detectSwipeDirection(touchStartXRef.current, touchEndX, 40);
    if (direction === 'left') {
      handleNextImage();
    } else if (direction === 'right') {
      handlePrevImage();
    }
    touchStartXRef.current = null;
  };

  // Handle ESC and Arrow keys for gallery navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasMultipleImages) {
        handleNextImage();
      } else if (e.key === 'ArrowLeft' && hasMultipleImages) {
        handlePrevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMultipleImages, galleryImages.length]);

  if (!isOpen || !product) return null;

  const activeColor = product.availableColors?.[0] || {
    name: 'Standard',
    hex: '#E7A96B',
    filamentType: 'PLA+',
  };
  const currentImageUrl = galleryImages[activeImageIndex] || galleryImages[0] || '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="relative w-full max-w-5xl bg-[#141416] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden my-auto text-[#F5F3EF] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222226] bg-[#161618]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <span>{product.categoryName}</span>
            {hasMultipleImages && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#F5F3EF]">
                  <Images className="w-3 h-3 text-[#E7A96B]" />
                  <span>{galleryImages.length} photos</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-full border transition-colors ${
                isFavorite
                  ? 'bg-[#E7A96B] text-[#101010] border-[#E7A96B]'
                  : 'bg-[#1E1E22] text-[#A1A1AA] border-[#2E2E34] hover:text-[#FFFFFF]'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              title={isFavorite ? 'Saved in favorites' : 'Save to favorites'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#1E1E22] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#2E2E34] hover:bg-[#28282E] transition-colors"
              aria-label="Close dialog (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-6 lg:p-8 flex-1 space-y-8">
          {/* Main Grid: Visual Canvas & Product Intel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Canvas Column (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Large Visual Viewport with Swipe & Arrow Controls */}
              <div
                className="group relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#27272A] bg-[#0E0E10] shadow-inner select-none touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <PrintArtwork
                  product={product}
                  activeColor={activeColor}
                  angle={activeAngle}
                  overrideImageUrl={currentImageUrl}
                  className="w-full h-full"
                />

                {/* Left & Right Gallery Navigation Arrows (Desktop / Tablet) */}
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#101012]/80 hover:bg-[#101012] text-[#F5F3EF] hover:text-[#E7A96B] border border-[#2D2D32] hover:border-[#E7A96B]/50 flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      aria-label="Previous photo"
                      title="Previous photo (Left Arrow)"
                    >
                      <ChevronLeft className="w-5 h-5 -ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#101012]/80 hover:bg-[#101012] text-[#F5F3EF] hover:text-[#E7A96B] border border-[#2D2D32] hover:border-[#E7A96B]/50 flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      aria-label="Next photo"
                      title="Next photo (Right Arrow)"
                    >
                      <ChevronRight className="w-5 h-5 -mr-0.5" />
                    </button>

                    {/* Gallery Photo Counter Badge */}
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded bg-[#101012]/80 border border-[#2D2D32] backdrop-blur-md text-[11px] font-mono text-[#F5F3EF] flex items-center gap-1.5 shadow-md">
                      <span className="text-[#E7A96B] font-bold">{activeImageIndex + 1}</span>
                      <span className="text-[#71717A]">/</span>
                      <span className="text-[#A1A1AA]">{galleryImages.length}</span>
                    </div>
                  </>
                )}

                {/* Perspective & Slicing Control Strip */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-[#141416]/90 border border-[#2A2A2E] p-1 rounded-md backdrop-blur-md">
                  <button
                    onClick={() => setActiveAngle('primary')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      activeAngle === 'primary' ? 'bg-[#2A2A30] text-[#F5F3EF]' : 'text-[#8E8E93] hover:text-[#F5F3EF]'
                    }`}
                  >
                    Studio
                  </button>
                  <button
                    onClick={() => setActiveAngle('detail')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      activeAngle === 'detail' ? 'bg-[#2A2A30] text-[#F5F3EF]' : 'text-[#8E8E93] hover:text-[#F5F3EF]'
                    }`}
                  >
                    Macro
                  </button>
                  <button
                    onClick={() => setActiveAngle('sliced')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeAngle === 'sliced' ? 'bg-[#2A2A30] text-[#E7A96B]' : 'text-[#8E8E93] hover:text-[#F5F3EF]'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Toolpaths</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Gallery Thumbnail Strip (Rendered only when multiple images exist) */}
              {hasMultipleImages && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] px-1">
                    <span>PRODUCT GALLERY ({galleryImages.length} PHOTOS)</span>
                    <span className="text-[#E7A96B]">Swipe or click thumbnail</span>
                  </div>

                  <div
                    ref={thumbnailRowRef}
                    className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {galleryImages.map((imgUrl, idx) => {
                      const isSelected = activeImageIndex === idx;
                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-[#0E0E10] ${
                            isSelected
                              ? 'border-[#E7A96B] ring-2 ring-[#E7A96B]/30 scale-[1.02] shadow-lg shadow-[#E7A96B]/10 opacity-100'
                              : 'border-[#27272A] opacity-60 hover:opacity-100 hover:border-[#3F3F46]'
                          }`}
                          aria-label={`View photo ${idx + 1}`}
                          aria-current={isSelected ? 'true' : 'false'}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.title} photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          {/* Primary marker on first thumbnail */}
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#101012]/85 text-[#E7A96B] text-[9px] font-mono px-1 py-0.2 rounded border border-[#E7A96B]/30 font-semibold">
                              Cover
                            </span>
                          )}

                          {/* Current selected check dot */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#E7A96B]/10 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Product Intel Column (5 Cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div>
                <h1 id="modal-product-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F3EF]">
                  {product.title}
                </h1>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  {product.subtitle}
                </p>

                {/* Pricing Display */}
                <div className="mt-3 flex items-baseline gap-2">
                  {product.price !== undefined && product.price !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-extrabold text-[#E7A96B]">
                        {formatPriceINR(product.price)}
                      </span>
                      <span className="text-xs text-[#71717A] font-mono">per piece</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1C1C20] border border-[#2E2E36] text-xs font-mono text-[#A1A1AA]">
                      <span>Price on request</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Storytelling Description */}
              <div className="space-y-3 text-sm text-[#D4D4D8] leading-relaxed">
                <p>{product.storyDescription}</p>
              </div>

              {/* Action Buttons: Add to Cart & Custom Commission */}
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 bg-[#18181A] border border-[#27272A] rounded-lg p-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded bg-[#141416] hover:bg-[#202026] text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sm text-[#F5F3EF]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded bg-[#141416] hover:bg-[#202026] text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center justify-center cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product, quantity, activeColor);
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart ({quantity})</span>
                    </button>
                  )}
                </div>

                {/* Custom Commission Alternative */}
                <button
                  type="button"
                  onClick={() => onRequestOrder(product, activeColor)}
                  className="w-full py-2.5 px-4 bg-[#1C1C20] hover:bg-[#26262C] border border-[#2C2C32] text-[#D4D4D8] hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Request Custom Commission Brief</span>
                </button>

                <p className="text-center text-[11px] text-[#71717A]">
                  Each piece is custom printed to order at our dedicated studio with verified tolerances.
                </p>
              </div>
            </div>
          </div>

          {/* Related Creations Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#222226]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#F5F3EF]">
                  Related Studio Works
                </h3>
                <span className="text-xs text-[#71717A] font-mono">Curated Selection</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#18181A] border border-[#27272A] hover:border-[#3E3E46] cursor-pointer transition-colors group"
                  >
                    <div className="w-16 h-14 rounded overflow-hidden bg-[#101012] shrink-0">
                      <PrintArtwork product={rel} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#F5F3EF] group-hover:text-[#E7A96B] transition-colors truncate">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
                        {rel.specs.material}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#F5F3EF] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
