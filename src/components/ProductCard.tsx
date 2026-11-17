import React, { useState } from 'react';
import { Bookmark, ShoppingBag } from 'lucide-react';
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
    <article
      className="group relative w-full max-w-[340px] rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] overflow-hidden transition-all duration-300 hover:border-[#784f2b] hover:shadow-[0_16px_34px_rgba(43,39,33,0.12)] cursor-pointer flex flex-col"
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
      {/* Visual Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1ece0] p-3">
        <PrintArtwork
          product={product}
          isHovered={isHovered}
          angle={isHovered ? 'detail' : 'primary'}
          fitMode="contain"
          className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-sm transition-colors border cursor-pointer ${
            isFavorite
              ? 'bg-[#2b2721] border-[#2b2721] text-[#faf7ef]'
              : 'bg-[rgba(250,247,239,0.88)] border-[rgba(43,39,33,0.18)] text-[rgba(43,39,33,0.68)] hover:text-[#2b2721]'
          }`}
          aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Save ${product.title} to favorites`}
          title={isFavorite ? 'Saved' : 'Save to bookmarks'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 border-t border-[rgba(43,39,33,0.12)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#784f2b]">
            {product.categoryName}
          </p>
          <h3 className="sb-display text-xl text-[#2b2721] line-clamp-1 mt-0.5 group-hover:text-[#784f2b] transition-colors">
            {product.title}
          </h3>
          {product.subtitle && (
            <p className="sb-prose text-xs text-[rgba(43,39,33,0.65)] line-clamp-1 mt-0.5">
              {product.subtitle}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[rgba(43,39,33,0.1)] flex items-center justify-between gap-2">
          <div>
            {product.price !== undefined && product.price !== null ? (
              <span className="sb-display text-xl text-[#2b2721] tabular-nums">
                {formatPriceINR(product.price)}
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#784f2b]">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#faf7ef] bg-[#2b2721] hover:bg-[#784f2b] rounded-sm transition-colors cursor-pointer"
              title={`Add ${product.title} to cart`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
