import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bookmark,
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
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const thumbnailRowRef = useRef<HTMLDivElement>(null);

  const galleryImages = getProductImages(product);
  const hasMultipleImages = galleryImages.length > 1;
  const currentImageUrl = galleryImages[activeImageIndex] || galleryImages[0] || '';

  const [bgCurrent, setBgCurrent] = useState<string>(currentImageUrl);
  const [bgPrevious, setBgPrevious] = useState<string | null>(null);

  useEffect(() => {
    if (currentImageUrl && currentImageUrl !== bgCurrent) {
      setBgPrevious(bgCurrent);
      setBgCurrent(currentImageUrl);
      const timer = setTimeout(() => {
        setBgPrevious(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentImageUrl, bgCurrent]);

  useEffect(() => {
    setQuantity(1);
    setActiveImageIndex(0);
    const initialImg = galleryImages[0] || '';
    setBgCurrent(initialImg);
    setBgPrevious(null);
  }, [product?.id]);

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

  const handleNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => calculateNextGalleryIndex(prev, galleryImages.length, 'next'));
  };

  const handlePrevImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => calculateNextGalleryIndex(prev, galleryImages.length, 'prev'));
  };

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
    hex: '#9a6a3e',
    filamentType: 'PLA+',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(43,39,33,0.65)] backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="relative w-full max-w-5xl bg-[#f7f3e9] border border-[rgba(43,39,33,0.2)] rounded-sm shadow-[0_30px_80px_rgba(43,39,33,0.35)] overflow-hidden my-auto text-[#2b2721] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(43,39,33,0.12)] bg-[#efe9da]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.68)]">
            <span className="text-[#784f2b] font-medium">{product.categoryName}</span>
            {hasMultipleImages && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#2b2721]">
                  <Images className="w-3 h-3 text-[#9a6a3e]" />
                  <span>{galleryImages.length} photos</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-sm border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#2b2721] text-[#faf7ef] border-[#2b2721]'
                  : 'bg-[#faf7ef] text-[rgba(43,39,33,0.68)] border-[rgba(43,39,33,0.2)] hover:text-[#2b2721]'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              title={isFavorite ? 'Saved in bookmarks' : 'Save to bookmarks'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#faf7ef] text-[rgba(43,39,33,0.68)] hover:text-[#2b2721] border border-[rgba(43,39,33,0.2)] transition-colors cursor-pointer"
              aria-label="Close dialog (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 lg:p-8 flex-1 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Preserved blurred photo stage behind uncropped sharp photo */}
              <div
                className="group relative aspect-[4/3] sm:aspect-[16/11] min-h-[320px] sm:min-h-[420px] max-h-[560px] w-full rounded-sm overflow-hidden border border-[rgba(43,39,33,0.18)] bg-[#141210] select-none touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {bgCurrent && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {bgPrevious && (
                      <img
                        src={bgPrevious}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{
                          filter: 'blur(45px) saturate(1.6) brightness(0.85)',
                          transform: 'scale(1.2)',
                        }}
                      />
                    )}
                    <img
                      key={bgCurrent}
                      src={bgCurrent}
                      alt=""
                      aria-hidden="true"
                      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                        bgPrevious ? 'animate-stage-fade' : ''
                      }`}
                      style={{
                        filter: 'blur(45px) saturate(1.6) brightness(0.85)',
                        transform: 'scale(1.2)',
                      }}
                    />
                  </div>
                )}

                <PrintArtwork
                  product={product}
                  activeColor={activeColor}
                  angle="primary"
                  overrideImageUrl={currentImageUrl}
                  fitMode="contain"
                  showBackdropBlur={false}
                  className="w-full h-full relative z-10"
                />

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[rgba(250,247,239,0.9)] hover:bg-white text-[#2b2721] border border-[rgba(43,39,33,0.22)] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 -ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[rgba(250,247,239,0.9)] hover:bg-white text-[#2b2721] border border-[rgba(43,39,33,0.22)] flex items-center justify-center shadow-lg transition-all cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 -mr-0.5" />
                    </button>

                    <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded bg-[#181614]/85 border border-white/15 text-[11px] font-mono text-[#faf7ef] flex items-center gap-1.5 shadow-md">
                      <span className="text-[#E7A96B] font-bold">{activeImageIndex + 1}</span>
                      <span className="text-white/50">/</span>
                      <span className="text-white/80">{galleryImages.length}</span>
                    </div>
                  </>
                )}
              </div>

              {hasMultipleImages && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.58)] px-0.5">
                    <span>Product Gallery ({galleryImages.length} Photos)</span>
                    <span className="text-[#784f2b]">Swipe or click thumbnail</span>
                  </div>

                  <div
                    ref={thumbnailRowRef}
                    className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
                  >
                    {galleryImages.map((imgUrl, idx) => {
                      const isSelected = activeImageIndex === idx;
                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-sm overflow-hidden border-2 transition-all cursor-pointer bg-[#f1ece0] ${
                            isSelected
                              ? 'border-[#784f2b] ring-1 ring-[#9a6a3e] opacity-100'
                              : 'border-[rgba(43,39,33,0.18)] opacity-65 hover:opacity-100'
                          }`}
                          aria-label={`View photo ${idx + 1}`}
                          aria-current={isSelected ? 'true' : 'false'}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.title} photo ${idx + 1}`}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#2b2721]/85 text-[#faf7ef] text-[9px] px-1 rounded-xs">
                              Cover
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="lg:col-span-5 flex flex-col space-y-5">
              <div>
                <h1 id="modal-product-title" className="sb-display text-3xl sm:text-4xl text-[#2b2721]">
                  {product.title}
                </h1>
                {product.subtitle && (
                  <p className="sb-prose italic text-base text-[rgba(43,39,33,0.68)] mt-1">
                    {product.subtitle}
                  </p>
                )}

                <div className="mt-3 flex items-baseline gap-2.5">
                  {product.price !== undefined && product.price !== null ? (
                    <>
                      <span className="sb-display text-3xl text-[#784f2b] tabular-nums">
                        {formatPriceINR(product.price)}
                      </span>
                      <span className="text-xs uppercase tracking-[0.14em] text-[rgba(43,39,33,0.56)]">
                        per piece
                      </span>
                    </>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.14em] px-2.5 py-1 bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] text-[#784f2b]">
                      Price on request
                    </span>
                  )}
                </div>
              </div>

              <div className="sb-prose text-base text-[rgba(43,39,33,0.84)] leading-relaxed border-t border-b border-[rgba(43,39,33,0.12)] py-4">
                <p>{product.storyDescription || product.shortDescription}</p>
              </div>

              {/* Quantity & Cart Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#faf7ef] border border-[rgba(43,39,33,0.2)] rounded-sm p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-sm hover:bg-[#ece7dc] text-[#2b2721] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sm text-[#2b2721]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-sm hover:bg-[#ece7dc] text-[#2b2721] flex items-center justify-center cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product, quantity, activeColor);
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] font-medium text-xs uppercase tracking-[0.18em] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart ({quantity})</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRequestOrder(product, activeColor)}
                  className="w-full py-2.5 px-4 bg-[#faf7ef] hover:bg-white border border-[rgba(43,39,33,0.22)] text-[#2b2721] font-medium text-xs uppercase tracking-[0.14em] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#9a6a3e]" />
                  <span>Request Custom Commission Brief</span>
                </button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[rgba(43,39,33,0.12)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="sb-display text-2xl text-[#2b2721]">Related Studio Plates</h3>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.56)]">
                  Curated Selection
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="flex items-center gap-3 p-2.5 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] hover:border-[#784f2b] cursor-pointer transition-colors group"
                  >
                    <div className="w-16 h-14 rounded-sm overflow-hidden bg-[#f1ece0] shrink-0">
                      <PrintArtwork product={rel} fitMode="contain" className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="sb-display text-lg text-[#2b2721] group-hover:text-[#784f2b] transition-colors truncate">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-[rgba(43,39,33,0.62)] truncate">
                        {rel.categoryName}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[rgba(43,39,33,0.48)] shrink-0" />
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
