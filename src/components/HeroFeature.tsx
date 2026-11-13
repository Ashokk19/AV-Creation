import React from 'react';
import { ArrowDown, ChevronRight, Eye, Send } from 'lucide-react';
import { ProductItem } from '../types';
import { formatPriceINR } from '../lib/config';
import {
  HeroImageType,
  DEFAULT_COMPANY_LOGO,
  HeroFrameSettings,
  DEFAULT_HERO_FRAME_SETTINGS,
} from '../services/settingsService';
import { HeroFrame } from './HeroFrame';

interface HeroFeatureProps {
  heroImageType?: HeroImageType;
  product?: ProductItem | null;
  customImageUrl?: string;
  companyLogoUrl?: string;
  heroFrame?: HeroFrameSettings;
  onExplore: () => void;
  onViewProduct?: (product: ProductItem) => void;
  onRequestCustom?: () => void;
}

export const HeroFeature: React.FC<HeroFeatureProps> = ({
  heroImageType = 'logo',
  product,
  customImageUrl,
  companyLogoUrl = DEFAULT_COMPANY_LOGO,
  heroFrame = DEFAULT_HERO_FRAME_SETTINGS,
  onExplore,
  onViewProduct,
  onRequestCustom,
}) => {
  const isLogoMode = heroImageType === 'logo' || (!product && !customImageUrl);
  const isCustomMode = heroImageType === 'custom' && Boolean(customImageUrl);
  const isProductMode = heroImageType === 'product' && Boolean(product);

  const effectiveLogo = companyLogoUrl || DEFAULT_COMPANY_LOGO;

  // Resolve visual details for HeroFrame
  const frameImage = isLogoMode
    ? effectiveLogo
    : isCustomMode
    ? customImageUrl || effectiveLogo
    : product?.imageUrls?.[0] || product?.imageUrl || product?.image_path || effectiveLogo;

  const frameTitle = isLogoMode
    ? 'AV Creations'
    : isCustomMode
    ? 'Studio Showcase'
    : product?.title || 'Featured Creation';

  const frameCategory = isLogoMode
    ? '3D Studio'
    : isCustomMode
    ? 'Bespoke Fabrication'
    : product?.categoryName || 'Catalogue';

  const framePrice = isProductMode ? product?.price ?? null : null;

  // For logo mode, ensure background glow keeps the transparent emblem radiant
  const resolvedFrameOptions: HeroFrameSettings = {
    ...heroFrame,
    backdrop: isLogoMode && heroFrame.backdrop === 'blur' ? 'glow' : heroFrame.backdrop,
  };

  return (
    <section className="relative w-full min-h-[88vh] flex items-center bg-[#101010] overflow-hidden pt-24 pb-16">
      {/* Subtle Background Lighting Orbs */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#E7A96B]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Grid: Responsive 2-column on >=860px; on <860px card moves above headline */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 min-[860px]:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Framed Card Visual Showcase: On <860px renders first (above headline), on >=860px sits on the right */}
          <div className="order-1 min-[860px]:order-2 min-[860px]:col-span-6 w-full flex items-center justify-center">
            <div className="w-full max-w-[520px] mx-auto min-[860px]:max-w-none">
              <HeroFrame
                image={frameImage}
                title={frameTitle}
                category={frameCategory}
                price={framePrice}
                options={resolvedFrameOptions}
                isLogo={isLogoMode}
                priority
              />
            </div>
          </div>

          {/* Hero Typography Content: On <860px renders second (below card) */}
          <div className="order-2 min-[860px]:order-1 min-[860px]:col-span-6 py-2 sm:py-6">
            {isProductMode && product ? (
              <>
                {/* Collection / Featured Label */}
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E7A96B] uppercase font-mono mb-4">
                  <span>FEATURED CREATION</span>
                  <span aria-hidden="true" className="text-[#555]">
                    ·
                  </span>
                  <span className="text-[#A6A6A6]">{product.categoryName}</span>
                  {product.price !== undefined && product.price !== null && (
                    <>
                      <span aria-hidden="true" className="text-[#555]">
                        ·
                      </span>
                      <span className="text-[#E7A96B] font-bold bg-[#E7A96B]/15 px-2 py-0.5 rounded border border-[#E7A96B]/30 font-mono">
                        {formatPriceINR(product.price)}
                      </span>
                    </>
                  )}
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.1] mb-5 [text-wrap:balance]">
                  Made by{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3EF] via-[#E7A96B] to-[#F5F3EF]">
                    Imagination.
                  </span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-8 max-w-xl font-normal">
                  {product.shortDescription ||
                    'From intricate details to everyday objects, discover what happens when creativity takes shape, layer by layer.'}
                </p>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={onExplore}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-all shadow-lg shadow-[#E7A96B]/15 hover:shadow-[#E7A96B]/25 active:scale-95 cursor-pointer"
                  >
                    <span>Explore Creations</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {onViewProduct && (
                    <button
                      onClick={() => onViewProduct(product)}
                      className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-[#F5F3EF] bg-[#1E1E22]/90 hover:bg-[#2A2A30] border border-[#303036] rounded-md transition-all hover:border-[#42424A] active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#A6A6A6]" />
                      <span>View Creation</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Company Logo & General Studio Hero Typography */
              <>
                {/* Studio Kicker */}
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E7A96B] uppercase font-mono mb-4">
                  <span>3D STUDIO CATALOGUE</span>
                  <span aria-hidden="true" className="text-[#555]">
                    ·
                  </span>
                  <span className="text-[#A6A6A6]">AV CREATIONS</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.1] mb-5 [text-wrap:balance]">
                  Made by{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3EF] via-[#E7A96B] to-[#F5F3EF]">
                    Imagination.
                  </span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-8 max-w-xl font-normal">
                  At AV Creations, we believe every great creation begins with an idea. Through 3D
                  printing, we turn those ideas into real objects that bring creativity, joy, and
                  character into everyday life.
                </p>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={onExplore}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-all shadow-lg shadow-[#E7A96B]/15 hover:shadow-[#E7A96B]/25 active:scale-95 cursor-pointer"
                  >
                    <span>Explore Creations</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {onRequestCustom && (
                    <button
                      onClick={onRequestCustom}
                      className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-[#F5F3EF] bg-[#1E1E22]/90 hover:bg-[#2A2A30] border border-[#303036] rounded-md transition-all hover:border-[#42424A] active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#E7A96B]" />
                      <span>Request Custom Print</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <button
        onClick={onExplore}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#737373] hover:text-[#F5F3EF] transition-colors cursor-pointer group"
        aria-label="Scroll to browse creations"
      >
        <span className="uppercase text-[10px] tracking-widest">Scroll to Browse</span>
        <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform text-[#E7A96B]" />
      </button>
    </section>
  );
};
