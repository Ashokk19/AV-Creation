import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ProductItem } from '../types';
import { filterProducts } from '../utils/filterLogic';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR } from '../lib/config';

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
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(43,39,33,0.6)] backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-12"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search creations"
    >
      <div
        className="relative w-full max-w-2xl bg-[#f7f3e9] border border-[rgba(43,39,33,0.2)] rounded-sm shadow-2xl overflow-hidden mt-8 text-[#2b2721]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(43,39,33,0.12)] bg-[#efe9da]">
          <Search className="w-5 h-5 text-[#784f2b] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalogue by title, category, or material..."
            className="w-full bg-transparent text-sm sm:text-base text-[#2b2721] placeholder-[rgba(43,39,33,0.45)] focus:outline-none"
            aria-label="Search term input"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-sm text-[rgba(43,39,33,0.6)] hover:text-[#2b2721] cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[rgba(43,39,33,0.58)] border border-[rgba(43,39,33,0.2)] px-1.5 py-0.5 rounded-sm">
              ESC
            </span>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-12 text-[rgba(43,39,33,0.62)] sb-prose text-base">
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
                className="flex items-center justify-between p-3 rounded-sm hover:bg-[#faf7ef] border border-transparent hover:border-[rgba(43,39,33,0.18)] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-12 rounded-sm overflow-hidden bg-[#f1ece0] shrink-0 border border-[rgba(43,39,33,0.14)]">
                    <PrintArtwork product={product} fitMode="contain" className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="sb-display text-xl text-[#2b2721] group-hover:text-[#784f2b] transition-colors truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[rgba(43,39,33,0.62)]">
                      <span>{product.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#784f2b]">
                        {product.price != null ? formatPriceINR(product.price) : 'Quote'}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[rgba(43,39,33,0.5)] group-hover:text-[#784f2b] shrink-0" />
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-[rgba(43,39,33,0.12)] bg-[#efe9da] flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.62)]">
          <span>{results.length} results found</span>
          <span className="flex items-center gap-1">
            <span>Select a plate to inspect</span>
            <CornerDownLeft className="w-3 h-3 text-[#784f2b]" />
          </span>
        </div>
      </div>
    </div>
  );
};
