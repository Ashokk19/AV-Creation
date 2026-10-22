import React, { useState, useEffect } from 'react';
import { X, Bookmark, Layers, Sparkles, Send, Ruler, Clock, Weight, Cpu, ChevronRight } from 'lucide-react';
import { ProductItem, ColorVariant } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: ProductItem) => void;
  onRequestOrder: (product: ProductItem, selectedColor: ColorVariant) => void;
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
  onSelectRelated,
  relatedProducts,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeAngle, setActiveAngle] = useState<'primary' | 'detail' | 'sliced'>('primary');

  // Reset state when product changes
  useEffect(() => {
    setSelectedColorIndex(0);
    setActiveAngle('primary');
  }, [product?.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const activeColor = product.availableColors[selectedColorIndex] || product.availableColors[0];

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
            <span aria-hidden="true">·</span>
            <span className="text-[#E7A96B]">{product.specs.layerResolution}</span>
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
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#27272A] bg-[#0E0E10] shadow-inner">
                <PrintArtwork
                  product={product}
                  activeColor={activeColor}
                  angle={activeAngle}
                  className="w-full h-full"
                />

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

              {/* Material & Color Swatch Visualizer */}
              <div className="bg-[#18181A] border border-[#27272A] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    Filament Finishes
                  </span>
                  <span className="text-xs font-mono text-[#E7A96B]">
                    {activeColor.name} ({activeColor.filamentType})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.availableColors.map((color, idx) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-all ${
                        selectedColorIndex === idx
                          ? 'border-[#E7A96B] bg-[#222226] text-[#F5F3EF]'
                          : 'border-[#2D2D32] bg-[#141416] text-[#A1A1AA] hover:border-[#3E3E46]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/30"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
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
              </div>

              {/* Storytelling Description */}
              <div className="space-y-3 text-sm text-[#D4D4D8] leading-relaxed">
                <p>{product.storyDescription}</p>
              </div>

              {/* Additive Manufacturing Technical Blueprint */}
              <div className="bg-[#18181A] border border-[#27272A] rounded-lg p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] border-b border-[#242428] pb-2">
                  Additive Print Specifications
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Clock className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>Print Time: <strong className="text-[#F5F3EF]">{product.specs.printTimeHours} hrs</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Layers className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>Layer: <strong className="text-[#F5F3EF]">{product.specs.layerResolution}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Weight className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>Weight: <strong className="text-[#F5F3EF]">{product.specs.weightGrams}g</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Cpu className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>Nozzle: <strong className="text-[#F5F3EF]">{product.specs.nozzleDiameter}</strong></span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-[#A1A1AA] pt-1 border-t border-[#222226]">
                    <Ruler className="w-3.5 h-3.5 text-[#E7A96B]" />
                    <span>
                      Dimensions: <strong className="text-[#F5F3EF]">{product.specs.dimensions.widthMm} × {product.specs.dimensions.depthMm} × {product.specs.dimensions.heightMm} mm</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => onRequestOrder(product, activeColor)}
                  className="w-full py-3.5 px-5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-semibold text-sm rounded-md transition-all shadow-lg shadow-[#E7A96B]/15 hover:shadow-[#E7A96B]/25 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Custom Print of This Design</span>
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
