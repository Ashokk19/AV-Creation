import React from 'react';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { ProductItem, CategoryRecord } from '../../types';
import { HeroImageType, HeroFrameSettings, DEFAULT_COMPANY_LOGO } from '../../services/settingsService';
import { getProductImages } from '../../utils/galleryLogic';
import { formatPriceINR } from '../../lib/config';

interface CatalogueCoverProps {
  heroImageType: HeroImageType;
  featuredProduct: ProductItem | null;
  customImageUrl?: string;
  companyLogoUrl?: string;
  heroFrame?: HeroFrameSettings;
  categories: CategoryRecord[];
  totalProducts: number;
  onOpenIndex: () => void;
  onStartBrowsing: () => void;
  onViewFeaturedProduct?: (product: ProductItem) => void;
  onRequestCustom: () => void;
}

export const CatalogueCover: React.FC<CatalogueCoverProps> = ({
  heroImageType,
  featuredProduct,
  customImageUrl,
  companyLogoUrl,
  heroFrame,
  categories,
  totalProducts,
  onOpenIndex,
  onStartBrowsing,
  onViewFeaturedProduct,
  onRequestCustom,
}) => {
  // Determine showcase image respecting Admin Store Settings (Company Logo / Catalogue Product / Custom Image)
  const showcaseImage = (() => {
    if (heroImageType === 'product' && featuredProduct) {
      const imgs = getProductImages(featuredProduct);
      return imgs[0] || DEFAULT_COMPANY_LOGO;
    }
    if (heroImageType === 'custom' && customImageUrl) {
      return customImageUrl;
    }
    return companyLogoUrl || DEFAULT_COMPANY_LOGO;
  })();

  const isLogo = heroImageType === 'logo' || (!customImageUrl && !featuredProduct);
  const focalX = heroFrame?.focalPoint?.x ?? 50;
  const focalY = heroFrame?.focalPoint?.y ?? 50;
  const effectiveFit =
    heroFrame?.fit === 'cover' && !isLogo ? 'object-cover' : 'object-contain';

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 select-none">
      {/* LEFT FOLIO: Edition Title & Studio Colophon */}
      <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[rgba(43,39,33,0.08)]">
        <div className="space-y-4 sm:space-y-5">
          {/* Edition Marker */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#784f2b] font-medium">
            <span>AV Creations · Studio Catalogue</span>
            <span>Vol. {new Date().getFullYear()}</span>
          </div>

          <div className="h-[1px] w-full bg-[rgba(43,39,33,0.12)]" />

          {/* Studio Wordmark + Emblem */}
          <div className="flex items-center gap-3 pt-1">
            <img
              src={companyLogoUrl || DEFAULT_COMPANY_LOGO}
              alt="AV Creations Studio Emblem"
              className="w-10 h-10 object-contain shrink-0"
              draggable={false}
            />
            <div>
              <p className="sb-display text-xl leading-none text-[#2b2721]">AV Creations</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.62)] mt-1">
                Precision 3D Printing &amp; Objects
              </p>
            </div>
          </div>

          {/* Primary Cover Headline */}
          <div className="pt-1 sm:pt-3">
            <h1 className="sb-display text-3xl sm:text-4xl lg:text-[42px] leading-[1.06] text-[#2b2721]">
              Made by <span className="italic text-[#9a6a3e]">Imagination.</span>
            </h1>
            <p className="sb-prose mt-3 text-[15px] sm:text-[17px] leading-[1.6] text-[rgba(43,39,33,0.78)] max-w-[38ch]">
              An interactive studio edition of bespoke lamps, tactile articulated toys, and architectural décor printed layer by layer.
            </p>
          </div>
        </div>

        {/* Bottom Catalogue Controls */}
        <div className="pt-5 space-y-4">
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-[rgba(43,39,33,0.64)] border-t border-[rgba(43,39,33,0.12)] pt-3">
            <span className="tabular-nums font-medium text-[#2b2721]">
              {totalProducts} {totalProducts === 1 ? 'Plate' : 'Plates'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {categories.length} {categories.length === 1 ? 'Chapter' : 'Chapters'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-interactive="true"
              onClick={totalProducts > 0 ? onStartBrowsing : onOpenIndex}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
            >
              <span>{totalProducts > 0 ? 'Browse Plates' : 'Open Index'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              data-interactive="true"
              onClick={onOpenIndex}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[rgba(43,39,33,0.22)] hover:border-[#2b2721] text-[#2b2721] text-xs uppercase tracking-[0.16em] rounded-sm transition-colors cursor-pointer bg-[rgba(255,253,247,0.65)]"
            >
              <Compass className="w-3.5 h-3.5 text-[#9a6a3e]" />
              <span>Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT FOLIO: Tipped-In Featured Showcase Plate */}
      <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[rgba(255,252,244,0.32)]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[rgba(43,39,33,0.56)]">
          <span>Frontispiece</span>
          <span>Cover Plate</span>
        </div>

        {/* Framed Tipped-In Visual */}
        <div
          data-interactive={heroImageType === 'product' && featuredProduct ? 'true' : undefined}
          onClick={() => {
            if (heroImageType === 'product' && featuredProduct && onViewFeaturedProduct) {
              onViewFeaturedProduct(featuredProduct);
            }
          }}
          className={`relative my-4 h-[210px] sm:h-[250px] md:h-auto md:flex-1 md:min-h-[240px] flex items-center justify-center rounded-sm border border-[rgba(43,39,33,0.16)] bg-[#f4efe3] overflow-hidden p-4 sm:p-6 shadow-[0_8px_24px_rgba(43,39,33,0.08)] ${
            heroImageType === 'product' && featuredProduct ? 'cursor-pointer group' : ''
          }`}
        >
          {/* Archival Corner Photo Mounts */}
          {heroFrame?.cornerBrackets !== false && (
            <>
              <span className="pointer-events-none absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-[#9a6a3e]" aria-hidden="true" />
              <span className="pointer-events-none absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-[#9a6a3e]" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-[#9a6a3e]" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-[#9a6a3e]" aria-hidden="true" />
            </>
          )}

          <img
            src={showcaseImage}
            alt={
              heroImageType === 'product' && featuredProduct
                ? featuredProduct.title
                : 'AV Creations Studio Showcase'
            }
            draggable={false}
            decoding="async"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
            className={`w-full h-full max-h-[260px] ${effectiveFit} transition-transform duration-500 ${
              heroImageType === 'product' && featuredProduct ? 'group-hover:scale-[1.03]' : ''
            } drop-shadow-[0_10px_18px_rgba(43,39,33,0.18)]`}
          />

          {/* Subtle archival caption strip for featured product */}
          {heroFrame?.infoTag !== false && heroImageType === 'product' && featuredProduct && (
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between px-2.5 py-1 bg-[rgba(250,247,239,0.9)] border border-[rgba(43,39,33,0.14)] text-[10px] uppercase tracking-[0.14em] text-[#2b2721]">
              <span className="truncate font-medium">{featuredProduct.title}</span>
              {featuredProduct.price != null && (
                <span className="tabular-nums font-medium text-[#784f2b] shrink-0 ml-2">
                  {formatPriceINR(featuredProduct.price)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Caption / Bespoke Link */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[rgba(43,39,33,0.12)] text-[11px] text-[rgba(43,39,33,0.68)]">
          <span className="italic">Turn page right to view index</span>
          <button
            type="button"
            data-interactive="true"
            onClick={onRequestCustom}
            className="inline-flex items-center gap-1 text-[#784f2b] hover:text-[#2b2721] underline underline-offset-4 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            <span>Custom Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
