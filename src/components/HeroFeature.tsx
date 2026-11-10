import React from 'react';
import { ArrowDown, ChevronRight, Eye, Send, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR } from '../lib/config';
import { HeroImageType, DEFAULT_COMPANY_LOGO } from '../services/settingsService';

interface HeroFeatureProps {
  heroImageType?: HeroImageType;
  product?: ProductItem | null;
  customImageUrl?: string;
  companyLogoUrl?: string;
  onExplore: () => void;
  onViewProduct?: (product: ProductItem) => void;
  onRequestCustom?: () => void;
}

export const HeroFeature: React.FC<HeroFeatureProps> = ({
  heroImageType = 'logo',
  product,
  customImageUrl,
  companyLogoUrl = DEFAULT_COMPANY_LOGO,
  onExplore,
  onViewProduct,
  onRequestCustom,
}) => {
  const isLogoMode = heroImageType === 'logo' || (!product && !customImageUrl);
  const isCustomMode = heroImageType === 'custom' && Boolean(customImageUrl);
  const isProductMode = heroImageType === 'product' && Boolean(product);

  const effectiveLogo = companyLogoUrl || DEFAULT_COMPANY_LOGO;

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-[#101010] overflow-hidden pt-24 pb-14">
      {/* Background Visual Studio Canvas (Positioned Right / Center-Right) */}
      <div className="absolute inset-0 z-0 flex items-center justify-end pointer-events-auto">
        <div className="w-full md:w-[65%] lg:w-[58%] h-full relative transition-all duration-700 flex items-center justify-center p-4 sm:p-8">
          {/* Mode 1: Company Logo (Default) */}
          {isLogoMode && (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 select-none">
              <div className="relative max-w-lg w-full flex flex-col items-center justify-center">
                {/* Ambient radiant aura */}
                <div className="absolute inset-0 bg-[#E7A96B]/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -inset-4 border border-[#E7A96B]/20 rounded-full animate-spin [animation-duration:35s]" />

                {/* Company Logo Display Card (Blended with dark studio aesthetic) */}
                <div className="relative z-10 w-full max-w-[460px] p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#18181D]/80 via-[#131316]/90 to-[#0F0F12]/95 border border-[#2A2A33] shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col items-center text-center transition-all duration-500 hover:border-[#E7A96B]/40 group">
                  <div className="w-full py-4 sm:py-6 flex items-center justify-center relative">
                    {/* Ambient backlight glow directly behind the logo mark */}
                    <div className="absolute inset-0 bg-[#E7A96B]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E7A96B]/20 transition-all duration-700" />
                    <img
                      src={effectiveLogo}
                      alt="AV Creations 3D Studio Logo"
                      className="relative z-10 w-full h-auto max-h-64 sm:max-h-76 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#E7A96B] font-semibold tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#E7A96B] animate-pulse" />
                    <span>3D STUDIO · ADDITIVE CRAFT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Custom Uploaded Hero Showcase Image */}
          {isCustomMode && (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 select-none">
              <div className="relative max-w-xl w-full flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[#E7A96B]/15 rounded-3xl blur-3xl animate-pulse" />
                <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-[#141416] border border-[#2E2E36] shadow-2xl">
                  <img
                    src={customImageUrl}
                    alt="AV Creations Studio Showcase"
                    className="w-full h-auto max-h-[520px] object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Product Showcase */}
          {isProductMode && product && (
            <div className="w-full h-full flex items-center justify-center">
              <PrintArtwork
                product={product}
                activeColor={product.availableColors?.[0]}
                angle="primary"
                className="w-full h-full min-h-[480px]"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Vignette Overlays: Left heavy gradient for typography contrast */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#101010] via-[#101010]/90 to-transparent w-full md:w-[70%]" />
      <div className="absolute inset-x-0 bottom-0 h-32 z-10 pointer-events-none bg-gradient-to-t from-[#101010] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 z-10 pointer-events-none bg-gradient-to-b from-[#101010] to-transparent" />

      {/* Hero Typography Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl md:max-w-2xl py-8">
          {/* Product Mode Typography */}
          {isProductMode && product ? (
            <>
              {/* Collection / Featured Label */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E7A96B] uppercase font-mono mb-4">
                <span>FEATURED CREATION</span>
                <span aria-hidden="true" className="text-[#555]">·</span>
                <span className="text-[#A6A6A6]">{product.categoryName}</span>
                {product.price !== undefined && product.price !== null && (
                  <>
                    <span aria-hidden="true" className="text-[#555]">·</span>
                    <span className="text-[#E7A96B] font-bold bg-[#E7A96B]/15 px-2 py-0.5 rounded border border-[#E7A96B]/30 font-mono">
                      {formatPriceINR(product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.08] mb-5 [text-wrap:balance]">
                Made by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3EF] via-[#E7A96B] to-[#F5F3EF]">Imagination.</span>
              </h1>

              {/* Description without specifications metadata strip */}
              <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-8 max-w-xl font-normal">
                {product.shortDescription || 'From intricate details to everyday objects, discover what happens when creativity takes shape, layer by layer.'}
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
                <span aria-hidden="true" className="text-[#555]">·</span>
                <span className="text-[#A6A6A6]">AV CREATIONS</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.08] mb-5 [text-wrap:balance]">
                Made by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3EF] via-[#E7A96B] to-[#F5F3EF]">Imagination.</span>
              </h1>

              {/* Description without specifications metadata strip */}
              <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-8 max-w-xl font-normal">
                At AV Creations, we believe every great creation begins with an idea. Through 3D printing, we turn those ideas into real objects that bring creativity, joy, and character into everyday life.
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
