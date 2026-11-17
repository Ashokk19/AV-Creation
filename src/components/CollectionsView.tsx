import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { ProductItem, ProductFunctionType, FilamentMaterial, CategoryRecord } from '../types';
import { filterProducts } from '../utils/filterLogic';
import { ProductCard } from './ProductCard';

interface CollectionsViewProps {
  initialCategory?: string;
  categories: CategoryRecord[];
  allProducts: ProductItem[];
  favorites: string[];
  onToggleFavorite: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem) => void;
  onBackToDiscover: () => void;
  onRequestCustom?: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  initialCategory = 'all',
  categories = [],
  allProducts = [],
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onBackToDiscover,
  onRequestCustom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFunctionType, setSelectedFunctionType] = useState<ProductFunctionType | 'all'>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<FilamentMaterial | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'name' | 'printTime'>('featured');

  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Creations' },
      ...categories.map((c) => ({ id: c.slug, label: c.name })),
    ];
  }, [categories]);

  const materials: (FilamentMaterial | 'all')[] = [
    'all',
    'PLA+ Silk',
    'Matte PLA',
    'Translucent PETG',
    'Resin High-Detail',
    'Wood Composite PLA',
    'Carbon Fiber PETG',
  ];

  const filteredItems = useMemo(() => {
    return filterProducts(allProducts, {
      category: selectedCategory as any,
      functionType: selectedFunctionType,
      material: selectedMaterial,
      sortBy: sortBy,
    });
  }, [allProducts, selectedCategory, selectedFunctionType, selectedMaterial, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFunctionType('all');
    setSelectedMaterial('all');
    setSortBy('featured');
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const getCategoryTitle = () => {
    if (selectedCategory === 'all') return 'Complete Studio Archive';
    return currentCategoryObj ? `${currentCategoryObj.name}` : 'Studio Collection';
  };

  const getCategoryDescription = () => {
    if (selectedCategory === 'all') {
      return 'Every active 3D printed edition produced at the AV Creations studio, organized for quick browsing and direct ordering.';
    }
    return `Explore high-precision 3D prints crafted for the ${currentCategoryObj?.name || 'studio'} chapter.`;
  };

  return (
    <div className="min-h-screen text-[#2b2721] pt-24 pb-20">
      {/* Chapter Header */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-8">
        <button
          onClick={onBackToDiscover}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[rgba(43,39,33,0.68)] hover:text-[#784f2b] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interactive Sketchbook</span>
        </button>

        <div className="border-b border-[rgba(43,39,33,0.14)] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a6a3e] mb-2">
              Studio Collections
            </p>
            <h1 className="sb-display text-4xl sm:text-5xl text-[#2b2721]">
              {getCategoryTitle()}
            </h1>
            <p className="sb-prose text-base sm:text-lg text-[rgba(43,39,33,0.74)] mt-2 max-w-2xl">
              {getCategoryDescription()}
            </p>
          </div>

          <div className="text-xs uppercase tracking-[0.16em] text-[rgba(43,39,33,0.7)] bg-[#faf7ef] px-4 py-2 border border-[rgba(43,39,33,0.16)] rounded-sm self-start md:self-auto shrink-0 tabular-nums">
            Showing <strong className="text-[#784f2b]">{filteredItems.length}</strong> of{' '}
            {allProducts.length} editions
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-8">
        <div className="bg-[#f7f3e9] border border-[rgba(43,39,33,0.16)] rounded-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#2b2721] text-[#faf7ef] border-[#2b2721]'
                    : 'bg-[#faf7ef] text-[rgba(43,39,33,0.72)] hover:text-[#2b2721] border-[rgba(43,39,33,0.16)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[rgba(43,39,33,0.12)] text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[rgba(43,39,33,0.6)] flex items-center gap-1.5 uppercase text-[11px] tracking-[0.14em]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#9a6a3e]" />
                <span>Filters</span>
              </span>

              <select
                value={selectedFunctionType}
                onChange={(e) => setSelectedFunctionType(e.target.value as any)}
                className="bg-[#faf7ef] text-[#2b2721] px-3 py-1.5 border border-[rgba(43,39,33,0.18)] rounded-sm text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by product type"
              >
                <option value="all">All Types</option>
                <option value="functional">Functional</option>
                <option value="decorative">Decorative</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value as any)}
                className="bg-[#faf7ef] text-[#2b2721] px-3 py-1.5 border border-[rgba(43,39,33,0.18)] rounded-sm text-xs focus:outline-none cursor-pointer"
                aria-label="Filter by filament material"
              >
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m === 'all' ? 'All Materials' : m}
                  </option>
                ))}
              </select>

              {(selectedCategory !== 'all' || selectedFunctionType !== 'all' || selectedMaterial !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#784f2b] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[rgba(43,39,33,0.6)] text-xs">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#faf7ef] text-[#2b2721] px-3 py-1.5 rounded-sm border border-[rgba(43,39,33,0.18)] text-xs focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Releases</option>
                <option value="name">Alphabetical</option>
                <option value="printTime">Print Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-[#f7f3e9] rounded-sm border border-[rgba(43,39,33,0.14)] p-8 max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] flex items-center justify-center mx-auto text-[#9a6a3e]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="sb-display text-3xl text-[#2b2721]">
              New editions coming soon.
            </h2>
            <p className="sb-prose text-base text-[rgba(43,39,33,0.74)] max-w-md mx-auto">
              No active items match those filters yet. Reset filters or commission a custom piece directly.
            </p>
            {onRequestCustom && (
              <div className="pt-2">
                <button
                  onClick={onRequestCustom}
                  className="px-6 py-3 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
                >
                  Commission a Custom Print
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((product) => (
              <div key={product.id} className="flex justify-center">
                <ProductCard
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
