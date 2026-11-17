import React, { useEffect } from 'react';
import { X, Trash2, Send, Bookmark } from 'lucide-react';
import { ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';
import { formatPriceINR } from '../lib/config';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: ProductItem[];
  onRemoveFavorite: (product: ProductItem) => void;
  onClearAll: () => void;
  onSelectProduct: (product: ProductItem) => void;
  onInquireBatch: (products: ProductItem[]) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearAll,
  onSelectProduct,
  onInquireBatch,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[rgba(43,39,33,0.55)] backdrop-blur-xs flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved creations drawer"
    >
      <div
        className="relative w-full max-w-md bg-[#f7f3e9] border-l border-[rgba(43,39,33,0.2)] shadow-2xl h-full flex flex-col text-[#2b2721]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(43,39,33,0.12)] bg-[#efe9da]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-[#784f2b] fill-current" />
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#2b2721]">
              Saved Plates ({favorites.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#faf7ef] text-[rgba(43,39,33,0.7)] hover:text-[#2b2721] border border-[rgba(43,39,33,0.18)] transition-colors cursor-pointer"
            aria-label="Close saved drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] flex items-center justify-center mx-auto text-[#9a6a3e]">
                <Bookmark className="w-5 h-5" />
              </div>
              <p className="sb-display text-2xl text-[#2b2721]">No saved plates yet</p>
              <p className="sb-prose text-sm text-[rgba(43,39,33,0.7)] max-w-xs mx-auto leading-relaxed">
                Click the bookmark icon on any creation while paging through the catalogue to keep a shortlist.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-sm bg-[#faf7ef] border border-[rgba(43,39,33,0.16)] hover:border-[#784f2b] transition-colors group"
                >
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 rounded-sm overflow-hidden bg-[#f1ece0] shrink-0 cursor-pointer border border-[rgba(43,39,33,0.12)]"
                  >
                    <PrintArtwork product={product} fitMode="contain" className="w-full h-full" />
                  </div>

                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="sb-display text-lg text-[#2b2721] group-hover:text-[#784f2b] transition-colors truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[rgba(43,39,33,0.62)] truncate">
                      {product.categoryName}
                    </p>
                    <div className="text-xs font-medium text-[#784f2b] mt-0.5 tabular-nums">
                      {product.price != null ? formatPriceINR(product.price) : 'Quote on request'}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFavorite(product)}
                    className="p-2 text-[rgba(43,39,33,0.52)] hover:text-red-700 rounded-sm transition-colors cursor-pointer"
                    title="Remove from saved"
                    aria-label={`Remove ${product.title} from saved`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="p-6 border-t border-[rgba(43,39,33,0.14)] bg-[#efe9da] space-y-3">
            <button
              onClick={() => {
                onInquireBatch(favorites);
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] font-medium text-xs uppercase tracking-[0.18em] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inquire About All ({favorites.length}) Items</span>
            </button>

            <button
              onClick={onClearAll}
              className="w-full py-1.5 text-center text-xs uppercase tracking-[0.14em] text-[rgba(43,39,33,0.62)] hover:text-[#2b2721] transition-colors cursor-pointer"
            >
              Clear saved collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
