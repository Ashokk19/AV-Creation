import React, { useState } from 'react';
import { Bookmark, ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR } from '../lib/config';

interface ProductCardProps {
  product: ProductItem;
  isFavorite: boolean;
  onToggleFavorite: (product: ProductItem) => void;
  onSelect: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex-none w-[280px] sm:w-[320px] md:w-[340px] rounded-lg bg-[#18181A] border border-[#27272A] overflow-hidden transition-all duration-300 ease-out hover:border-[#3F3F46] hover:shadow-2xl hover:shadow-black/70 hover:scale-[1.03] z-10 hover:z-20 cursor-pointer flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`View details for ${product.title}`}
    >
      {/* Visual Canvas Area (Consistent 4:3 Aspect Ratio) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111113]">
        <PrintArtwork
          product={product}
          isHovered={isHovered}
          angle={isHovered ? 'detail' : 'primary'}
          className="w-full h-full"
        />

        {/* Favorite Button (Accessible in top right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-3 right-3 z-30 p-2 rounded-full transition-all backdrop-blur-md ${
            isFavorite
              ? 'bg-[#E7A96B] text-[#101010] shadow-md'
              : 'bg-[#101010]/70 text-[#D4D4D8] hover:text-[#FFFFFF] hover:bg-[#101010]'
          }`}
          aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Save ${product.title} to favorites`}
          title={isFavorite ? 'Saved in favorites' : 'Save to favorites'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Subtle Category unboxed watermark */}
        <div className="absolute top-3 left-3 z-20 text-[10px] uppercase font-mono tracking-wider text-[#A1A1AA] bg-[#101010]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-[#27272A]">
          {product.categoryName}
        </div>

        {/* Hover Information Overlay on Desktop */}
        <div
          className={`absolute inset-0 z-20 bg-gradient-to-t from-[#101010] via-[#101010]/85 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-xs text-[#D4D4D8] line-clamp-2 mb-3 leading-relaxed">
            {product.shortDescription}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
            <div className="text-[11px] font-mono text-[#E7A96B]">
              {product.specs.layerResolution} · {product.specs.printTimeHours}h
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5F3EF] group-hover:text-[#E7A96B] transition-colors">
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer (Always visible for mobile & baseline discoverability) */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-[#161618]">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F3EF] tracking-tight line-clamp-1 group-hover:text-[#E7A96B] transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>
        </div>

        {/* Price and Add to Cart Action */}
        <div className="mt-2.5 flex items-center justify-between">
          <div>
            {product.price !== undefined && product.price !== null ? (
              <span className="text-sm font-mono font-bold text-[#E7A96B]">
                {formatPriceINR(product.price)}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#A1A1AA] italic bg-[#1E1E22] px-2 py-0.5 rounded border border-[#2D2D32]">
                Price on request
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#101010] bg-[#E7A96B] hover:bg-[#F2BA82] active:scale-95 rounded-md transition-all cursor-pointer shadow-xs"
              title={product.price != null ? `Add ${product.title} to cart` : 'Add creation to cart'}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Clean unboxed metadata footer */}
        <div className="mt-2.5 pt-2 border-t border-[#222226] flex items-center justify-between text-[11px] text-[#71717A] font-mono">
          <span className="truncate max-w-[170px]">{product.specs.material}</span>
          <span className="text-[#A1A1AA]">{product.specs.dimensions.heightMm}mm H</span>
        </div>
      </div>
    </div>
  );
};
