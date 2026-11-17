import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bookmark, Expand, Sparkles } from 'lucide-react';
import { ProductItem, ColorVariant } from '../../types';
import { getProductImages } from '../../utils/galleryLogic';
import { formatPriceINR } from '../../lib/config';
import { PrintArtwork } from '../3d-visuals/PrintArtwork';

interface ProductPageProps {
  product: ProductItem;
  plateNumber: number;
  isFavorite: boolean;
  onToggleFavorite: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem, quantity: number, selectedColor?: ColorVariant) => void;
  onRequestCustom: (product: ProductItem) => void;
  /** True when rendered inside hidden curl strips or optical loupe lens */
  passiveSnapshot?: boolean;
  /** Sync thumbnail selection from parent spread if desired */
  activePhotoIndexOverride?: number;
  onPhotoIndexChange?: (idx: number) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  plateNumber,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onRequestCustom,
  passiveSnapshot = false,
  activePhotoIndexOverride,
  onPhotoIndexChange,
}) => {
  const images = getProductImages(product);
  const [internalPhotoIdx, setInternalPhotoIdx] = useState(0);

  useEffect(() => {
    setInternalPhotoIdx(0);
  }, [product.id]);

  const activePhotoIdx =
    typeof activePhotoIndexOverride === 'number'
      ? Math.min(activePhotoIndexOverride, Math.max(0, images.length - 1))
      : Math.min(internalPhotoIdx, Math.max(0, images.length - 1));

  const currentImage = images[activePhotoIdx] || '';

  const handleSelectPhoto = (idx: number) => {
    setInternalPhotoIdx(idx);
    onPhotoIndexChange?.(idx);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 select-none">
      {/* LEFT FOLIO: Full-Resolution Uncropped Product Photograph Plate */}
      <div className="relative p-5 sm:p-7 lg:p-9 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[rgba(43,39,33,0.08)]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[rgba(43,39,33,0.6)]">
          <span className="truncate max-w-[70%]">{product.categoryName}</span>
          <span className="tabular-nums text-[#784f2b] font-medium">
            Plate {String(plateNumber).padStart(2, '0')}
          </span>
        </div>

        {/* Crisp Paper Stage preserving full uncropped image (object-contain) */}
        <div className="relative my-3 h-[230px] sm:h-[270px] md:h-auto md:flex-1 md:min-h-[260px] flex items-center justify-center rounded-sm border border-[rgba(43,39,33,0.14)] bg-[#f4efe3] p-3 sm:p-5 overflow-hidden shadow-[0_6px_18px_rgba(43,39,33,0.06)]">
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.title}
              draggable={false}
              decoding="async"
              fetchPriority={!passiveSnapshot ? 'high' : 'low'}
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[270px] object-contain drop-shadow-[0_10px_20px_rgba(43,39,33,0.16)]"
            />
          ) : (
            <PrintArtwork product={product} fitMode="contain" className="w-full h-full max-h-[240px]" />
          )}

          {images.length > 1 && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-sm bg-[rgba(250,247,239,0.88)] border border-[rgba(43,39,33,0.14)] text-[10px] tabular-nums text-[#2b2721]">
              {activePhotoIdx + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Multi-Photo Thumbnail Strip + Full Gallery Trigger */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {images.length > 1 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {images.slice(0, 5).map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  data-interactive={!passiveSnapshot ? 'true' : undefined}
                  onClick={() => !passiveSnapshot && handleSelectPhoto(idx)}
                  className={`w-10 h-10 rounded-sm border overflow-hidden shrink-0 bg-[#f4efe3] transition-all cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-[#784f2b] ring-1 ring-[#9a6a3e]'
                      : 'border-[rgba(43,39,33,0.18)] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1} of ${product.title}`}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] italic text-[rgba(43,39,33,0.56)]">
              Studio photograph
            </span>
          )}

          <button
            type="button"
            data-interactive={!passiveSnapshot ? 'true' : undefined}
            onClick={() => !passiveSnapshot && onSelectProduct(product)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#2b2721] hover:text-[#784f2b] border border-[rgba(43,39,33,0.18)] hover:border-[#784f2b] rounded-sm bg-[rgba(255,253,247,0.7)] transition-colors cursor-pointer shrink-0"
          >
            <Expand className="w-3 h-3" />
            <span>Inspect</span>
          </button>
        </div>
      </div>

      {/* RIGHT FOLIO: Editorial Description, Price & Actions */}
      <div className="relative p-5 sm:p-7 lg:p-9 flex flex-col justify-between bg-[rgba(255,252,244,0.28)]">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#784f2b] font-medium">
              {product.categoryName}
            </span>
            <button
              type="button"
              data-interactive={!passiveSnapshot ? 'true' : undefined}
              onClick={() => !passiveSnapshot && onToggleFavorite(product)}
              className={`p-1.5 rounded-sm border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#2b2721] border-[#2b2721] text-[#faf7ef]'
                  : 'border-[rgba(43,39,33,0.18)] text-[rgba(43,39,33,0.65)] hover:text-[#2b2721] hover:border-[#2b2721]'
              }`}
              aria-label={isFavorite ? `Remove ${product.title} from saved` : `Save ${product.title}`}
              title={isFavorite ? 'Saved in bookmarks' : 'Bookmark this creation'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="h-[1px] w-full bg-[rgba(43,39,33,0.12)]" />

          {/* Title & Subtitle */}
          <div>
            <h2 className="sb-display text-2xl sm:text-3xl leading-[1.08] text-[#2b2721] [text-wrap:balance]">
              {product.title}
            </h2>
            {product.subtitle && (
              <p className="sb-prose italic text-sm sm:text-base text-[rgba(43,39,33,0.68)] mt-1 line-clamp-1">
                {product.subtitle}
              </p>
            )}
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-2.5 pt-0.5">
            {product.price !== undefined && product.price !== null ? (
              <>
                <span className="sb-display text-2xl sm:text-[28px] text-[#784f2b] tabular-nums">
                  {formatPriceINR(product.price)}
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.55)]">
                  per piece
                </span>
              </>
            ) : (
              <span className="text-xs uppercase tracking-[0.16em] text-[#784f2b] border border-[rgba(154,106,62,0.3)] px-2.5 py-1 rounded-sm">
                Custom Quote on Request
              </span>
            )}
          </div>

          {/* Story / Description */}
          <p className="sb-prose text-sm sm:text-[15.5px] leading-[1.6] text-[rgba(43,39,33,0.8)] line-clamp-5">
            {product.storyDescription || product.shortDescription}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-4 mt-3 border-t border-[rgba(43,39,33,0.12)] space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-interactive={!passiveSnapshot ? 'true' : undefined}
              onClick={() => !passiveSnapshot && onAddToCart(product, 1, product.availableColors[0])}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              data-interactive={!passiveSnapshot ? 'true' : undefined}
              onClick={() => !passiveSnapshot && onSelectProduct(product)}
              className="px-3.5 py-2.5 border border-[rgba(43,39,33,0.24)] hover:border-[#2b2721] text-[#2b2721] text-xs uppercase tracking-[0.16em] rounded-sm transition-colors cursor-pointer bg-[rgba(255,253,247,0.7)]"
            >
              Details
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[rgba(43,39,33,0.62)]">
            <button
              type="button"
              data-interactive={!passiveSnapshot ? 'true' : undefined}
              onClick={() => !passiveSnapshot && onRequestCustom(product)}
              className="inline-flex items-center gap-1 hover:text-[#784f2b] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#9a6a3e]" />
              <span>Request custom size or colour</span>
            </button>
            <span className="tabular-nums">Plate {String(plateNumber).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
