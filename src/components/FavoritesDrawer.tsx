import React, { useEffect } from 'react';
import { X, Trash2, Send, Bookmark, ChevronRight } from 'lucide-react';
import { ProductItem } from '../types';
import { PrintArtwork } from './3d-visuals/PrintArtwork';

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
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved creations drawer"
    >
      <div
        className="relative w-full max-w-md bg-[#141416] border-l border-[#242428] shadow-2xl h-full flex flex-col text-[#F5F3EF] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222226] bg-[#161618]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#E7A96B] fill-current" />
            <h2 className="text-base font-bold text-[#F5F3EF]">
              Saved Creations ({favorites.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1E1E22] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#2E2E34] transition-colors"
            aria-label="Close saved drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1E1E22] border border-[#2A2A30] flex items-center justify-center mx-auto text-[#71717A]">
                <Bookmark className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#F5F3EF]">
                No saved creations yet
              </p>
              <p className="text-xs text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                Click the bookmark icon on any 3D print while browsing to collect your favorite designs for future reference or custom ordering.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#18181C] border border-[#26262B] hover:border-[#383840] transition-colors group"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-16 h-16 rounded overflow-hidden bg-[#101012] shrink-0 cursor-pointer"
                  >
                    <PrintArtwork product={product} className="w-full h-full" />
                  </div>

                  {/* Info */}
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="text-xs font-bold text-[#F5F3EF] group-hover:text-[#E7A96B] transition-colors truncate">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
                      {product.categoryName}
                    </p>
                    <div className="text-[10px] font-mono text-[#E7A96B] mt-1">
                      {product.specs.material} · {product.specs.layerResolution}
                    </div>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => onRemoveFavorite(product)}
                    className="p-2 text-[#71717A] hover:text-red-400 rounded transition-colors"
                    title="Remove from saved"
                    aria-label={`Remove ${product.title} from saved`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {favorites.length > 0 && (
          <div className="p-6 border-t border-[#222226] bg-[#161618] space-y-3">
            <button
              onClick={() => {
                onInquireBatch(favorites);
                onClose();
              }}
              className="w-full py-3 px-4 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-semibold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inquire About All ({favorites.length}) Items</span>
            </button>

            <button
              onClick={onClearAll}
              className="w-full py-2 text-center text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors"
            >
              Clear saved collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
