import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Send } from 'lucide-react';
import { ProductItem } from '../types';
import { ProductCard } from './ProductCard';

interface CollectionRowProps {
  id: string;
  title: string;
  subtitle?: string;
  items: ProductItem[];
  favorites: string[];
  onToggleFavorite: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onViewCategory?: (category: string) => void;
  onRequestCustom?: (categoryTitle?: string) => void;
  categorySlug?: string;
}

export const CollectionRow: React.FC<CollectionRowProps> = ({
  title,
  subtitle,
  items = [],
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onViewCategory,
  onRequestCustom,
  categorySlug,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -rowRef.current.clientWidth * 0.75 : rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const hasItems = items && items.length > 0;

  return (
    <section className="relative py-6 sm:py-8 border-b border-[#1A1A1E] last:border-0 group/section">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F3EF]">
              {title}
            </h2>
            <span className="text-xs font-mono text-[#71717A] bg-[#18181B] px-2 py-0.5 rounded border border-[#27272A]">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Actions: See All & Navigation Buttons */}
        <div className="flex items-center gap-3">
          {categorySlug && onViewCategory && (
            <button
              onClick={() => onViewCategory(categorySlug)}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#A1A1AA] hover:text-[#E7A96B] transition-colors cursor-pointer"
            >
              <span>Explore collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Carousel Arrow Controls (only if items present) */}
          {hasItems && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full border border-[#2A2A2E] bg-[#141416]/80 text-[#D4D4D8] transition-all ${
                  canScrollLeft
                    ? 'hover:bg-[#242428] hover:text-[#FFFFFF] cursor-pointer'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label={`Scroll ${title} carousel left`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full border border-[#2A2A2E] bg-[#141416]/80 text-[#D4D4D8] transition-all ${
                  canScrollRight
                    ? 'hover:bg-[#242428] hover:text-[#FFFFFF] cursor-pointer'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                aria-label={`Scroll ${title} carousel right`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {hasItems ? (
        /* Horizontal Carousel Container */
        <div className="relative">
          {/* Left Gradient Edge Mask */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-r from-[#101010] to-transparent" />
          )}

          {/* Scroll Track */}
          <div
            ref={rowRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectProduct}
              />
            ))}
          </div>

          {/* Right Gradient Edge Mask */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-l from-[#101010] to-transparent" />
          )}
        </div>
      ) : (
        /* Polished Empty State for Categories with 0 pieces */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-xl bg-[#141416] border border-[#222226] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#1C1C20] border border-[#28282E] flex items-center justify-center text-[#E7A96B] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#F5F3EF]">
                  Something exciting is taking shape for {title}
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  New creations in this collection will appear here once published from the studio.
                </p>
              </div>
            </div>

            {onRequestCustom && (
              <button
                onClick={() => onRequestCustom(title)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#E7A96B] hover:text-[#101010] bg-[#1E1E22] hover:bg-[#E7A96B] border border-[#E7A96B]/30 rounded-md transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Custom {title} Print</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
