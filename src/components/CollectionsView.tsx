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
    if (selectedCategory === 'all') return 'Complete Studio Portfolio';
    return currentCategoryObj ? `${currentCategoryObj.name} Collection` : 'Studio Collection';
  };

  const getCategoryDescription = () => {
    if (selectedCategory === 'all') {
      return 'Curated additive manufacturing designs produced layer-by-layer at the AV Creation independent studio.';
    }
    return `Explore high-precision 3D prints crafted specifically for the ${currentCategoryObj?.name || 'studio'} collection.`;
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F3EF] pt-24 pb-20">
      {/* Editorial Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button
          onClick={onBackToDiscover}
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#E7A96B] transition-colors mb-6 font-mono cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover Home</span>
        </button>

        <div className="border-b border-[#222226] pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#E7A96B] uppercase">
                Curated Catalog
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F3EF] mt-1">
                {getCategoryTitle()}
              </h1>
              <p className="text-sm text-[#A1A1AA] mt-2 max-w-2xl leading-relaxed">
                {getCategoryDescription()}
              </p>
            </div>

            <div className="text-xs font-mono text-[#8E8E93] bg-[#161618] px-3.5 py-2 rounded border border-[#27272A] self-start md:self-auto">
              Showing <strong className="text-[#F5F3EF]">{filteredItems.length}</strong> of {allProducts.length} creations
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-[#141416] border border-[#242428] rounded-xl p-4 space-y-4">
          {/* Dynamic Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#E7A96B] text-[#101010] font-semibold shadow-sm'
                    : 'bg-[#1C1C20] text-[#A1A1AA] hover:text-[#F5F3EF] hover:bg-[#25252A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Filter Dropdowns & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#222226] text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#71717A] flex items-center gap-1 font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </span>

              {/* Function Type */}
              <div className="flex items-center gap-1 bg-[#1A1A1E] px-2.5 py-1 rounded border border-[#2A2A30]">
                <span className="text-[#8E8E93]">Type:</span>
                <select
                  value={selectedFunctionType}
                  onChange={(e) => setSelectedFunctionType(e.target.value as any)}
                  className="bg-transparent text-[#F5F3EF] focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#1A1A1E]">All Types</option>
                  <option value="functional" className="bg-[#1A1A1E]">Functional</option>
                  <option value="decorative" className="bg-[#1A1A1E]">Decorative</option>
                  <option value="hybrid" className="bg-[#1A1A1E]">Hybrid</option>
                </select>
              </div>

              {/* Material */}
              <div className="flex items-center gap-1 bg-[#1A1A1E] px-2.5 py-1 rounded border border-[#2A2A30]">
                <span className="text-[#8E8E93]">Filament:</span>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value as any)}
                  className="bg-transparent text-[#F5F3EF] focus:outline-none cursor-pointer"
                >
                  {materials.map((m) => (
                    <option key={m} value={m} className="bg-[#1A1A1E]">
                      {m === 'all' ? 'All Materials' : m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              {(selectedCategory !== 'all' || selectedFunctionType !== 'all' || selectedMaterial !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[#E7A96B] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-[#8E8E93]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1A1A1E] text-[#F5F3EF] px-2.5 py-1 rounded border border-[#2A2A30] focus:outline-none cursor-pointer"
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

      {/* Product Grid or Polished Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-[#141416] rounded-xl border border-[#242428] p-8 max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1C1C20] border border-[#28282E] flex items-center justify-center mx-auto text-[#E7A96B]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#F5F3EF]">
              Something exciting is taking shape.
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-md mx-auto">
              New creations will appear here soon. Our studio is continuously slicing and printing bespoke pieces.
            </p>
            {onRequestCustom && (
              <div className="pt-2">
                <button
                  onClick={onRequestCustom}
                  className="px-5 py-2.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Commission a Custom Print
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
