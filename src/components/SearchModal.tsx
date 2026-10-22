import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ProductItem } from '../types';
import { filterProducts } from '../utils/filterLogic';
import { PrintArtwork } from './3d-visuals/PrintArtwork';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = filterProducts(allProducts, { searchQuery: query });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search creations"
    >
      <div
        className="relative w-full max-w-2xl bg-[#141416] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden mt-6 text-[#F5F3EF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#242428] bg-[#161618]">
          <Search className="w-5 h-5 text-[#E7A96B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, lamp, dragon, planter, material (PETG, PLA)..."
            className="w-full bg-transparent text-sm sm:text-base text-[#F5F3EF] placeholder-[#666] focus:outline-none"
            aria-label="Search term input"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#71717A] hover:text-[#FFFFFF]"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-mono text-[#71717A] border border-[#2A2A30] px-1.5 py-0.5 rounded">
              ESC
            </span>
          )}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-12 text-[#71717A] text-xs">
              No creations matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1E1E22] border border-transparent hover:border-[#2C2C32] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-12 rounded overflow-hidden bg-[#101012] shrink-0">
                    <PrintArtwork product={product} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#F5F3EF] group-hover:text-[#E7A96B] transition-colors truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                      <span>{product.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#E7A96B]">{product.specs.material}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#71717A] group-hover:text-[#F5F3EF] shrink-0 font-mono">
                  <span className="hidden sm:inline">{product.specs.layerResolution}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="px-5 py-3 border-t border-[#222226] bg-[#161618] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
          <span>{results.length} results found</span>
          <span className="flex items-center gap-1">
            <span>Press Enter to select</span>
            <CornerDownLeft className="w-3 h-3 text-[#E7A96B]" />
          </span>
        </div>
      </div>
    </div>
  );
};
