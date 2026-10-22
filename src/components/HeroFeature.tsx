import React, { useState } from 'react';
import { ArrowDown, Layers, Sparkles, ChevronRight, Eye, Send } from 'lucide-react';
import { ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';

interface HeroFeatureProps {
  product?: ProductItem | null;
  onExplore: () => void;
  onViewProduct?: (product: ProductItem) => void;
  onRequestCustom?: () => void;
}

export const HeroFeature: React.FC<HeroFeatureProps> = ({
  product,
  onExplore,
  onViewProduct,
  onRequestCustom,
}) => {
  const [activeAngle, setActiveAngle] = useState<'primary' | 'sliced'>('primary');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const activeColor = product
    ? product.availableColors[selectedColorIndex] || product.availableColors[0]
    : undefined;

  return (
    <section className="relative w-full min-h-[92vh] flex items-center bg-[#101010] overflow-hidden pt-20 pb-12">
      {/* Background Visual Studio Canvas (Positioned Right / Center-Right) */}
      <div className="absolute inset-0 z-0 flex items-center justify-end pointer-events-auto">
        <div className="w-full md:w-[65%] lg:w-[58%] h-full relative transition-all duration-700 flex items-center justify-center">
          {product ? (
            <>
              <PrintArtwork
                product={product}
                activeColor={activeColor}
                angle={activeAngle}
                className="w-full h-full min-h-[480px]"
                priority
              />

              {/* Slicing / Angle Mode Floating Switcher (Desktop and Tablet) */}
              <div className="absolute bottom-6 right-6 md:right-12 z-20 hidden sm:flex items-center gap-2 bg-[#141416]/90 border border-[#26262A] p-1.5 rounded-lg backdrop-blur-md shadow-2xl">
                <button
                  onClick={() => setActiveAngle('primary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeAngle === 'primary'
                      ? 'bg-[#2A2A2E] text-[#F5F3EF] shadow-sm'
                      : 'text-[#A6A6A6] hover:text-[#F5F3EF]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Ambient Studio</span>
                </button>
                <button
                  onClick={() => setActiveAngle('sliced')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeAngle === 'sliced'
                      ? 'bg-[#2A2A2E] text-[#E7A96B] shadow-sm'
                      : 'text-[#A6A6A6] hover:text-[#F5F3EF]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Slice Layers</span>
                </button>
              </div>

              {/* Color Finish Picker */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="absolute top-24 right-6 md:right-12 z-20 hidden sm:flex items-center gap-2 bg-[#141416]/80 border border-[#26262A] px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span className="text-[11px] text-[#8E8E93] uppercase font-mono mr-1">Finish:</span>
                  {product.availableColors.map((color, idx) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        selectedColorIndex === idx
                          ? 'border-[#F5F3EF] scale-125 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={`Select ${color.name} finish`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Studio Hero Visual when Catalogue is Waiting for Products */
            <div className="relative w-full h-full flex items-center justify-center p-8 select-none">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                {/* Radiant backdrop aura */}
                <div className="absolute inset-0 bg-[#E7A96B]/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -inset-4 border border-[#E7A96B]/20 rounded-full animate-spin [animation-duration:30s]" />
                
                {/* 3D Studio Emblem Centerpiece */}
                <img
                  src="/assets/aistudio/Glossy_AV_Creations_Mascot_Emblem_e418bb80.png"
                  alt="AV Creations Studio Emblem"
                  className="w-72 h-72 sm:w-96 sm:h-96 object-contain drop-shadow-[0_20px_50px_rgba(231,169,107,0.35)] relative z-10 transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute bottom-4 z-20 px-3 py-1 rounded bg-[#161618]/90 border border-[#28282C] text-[11px] font-mono text-[#E7A96B] backdrop-blur-md">
                  COREXY EXTRUSION ENGINE · READY
                </div>
              </div>
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
          {product ? (
            <>
              {/* Collection / Featured Label */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E7A96B] uppercase font-mono mb-4">
                <span>FEATURED CREATION</span>
                <span aria-hidden="true" className="text-[#555]">·</span>
                <span className="text-[#A6A6A6]">{product.categoryName}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.08] mb-5 [text-wrap:balance]">
                Made by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F3EF] via-[#E7A96B] to-[#F5F3EF]">Imagination.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-6 max-w-xl font-normal">
                {product.shortDescription || 'From intricate details to everyday objects, discover what happens when creativity takes shape, layer by layer.'}
              </p>

              {/* Unboxed Metadata Strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-[#8E8E93] font-mono mb-8 py-2 border-y border-[#202022] max-w-lg">
                <span>{product.specs.layerResolution}</span>
                <span aria-hidden="true">·</span>
                <span>{product.specs.material}</span>
                <span aria-hidden="true">·</span>
                <span>{product.specs.printTimeHours}h print</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#E7A96B]">Dual-Axis Tolerance</span>
              </div>

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
            /* Polished Empty State when No Products in Database */
            <>
              {/* Studio Kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E7A96B] uppercase font-mono mb-4">
                <span>3D STUDIO CATALOGUE</span>
                <span aria-hidden="true" className="text-[#555]">·</span>
                <span className="text-[#A6A6A6]">AV CREATION</span>
              </div>

              {/* Required Empty State Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3EF] leading-[1.08] mb-5 [text-wrap:balance]">
                Something exciting is taking shape.
              </h1>

              {/* Required Empty State Subtitle */}
              <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed mb-6 max-w-xl font-normal">
                New creations will appear here soon. From custom ambient lighting to articulated kinetic models and precision home decor, explore our categories below or commission a custom print.
              </p>

              {/* Unboxed Studio Capability Strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-[#8E8E93] font-mono mb-8 py-2 border-y border-[#202022] max-w-lg">
                <span>0.08–0.16mm Layer Fidelity</span>
                <span aria-hidden="true">·</span>
                <span>Translucent PETG & Silk PLA</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#E7A96B]">Bespoke Fabrication</span>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] rounded-md transition-all shadow-lg shadow-[#E7A96B]/15 hover:shadow-[#E7A96B]/25 active:scale-95 cursor-pointer"
                >
                  <span>Browse Categories</span>
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
