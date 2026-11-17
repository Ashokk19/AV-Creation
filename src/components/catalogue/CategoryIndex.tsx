import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CategoryIndexEntry, CatalogueSpreadDescriptor } from '../../utils/cataloguePagination';
import { formatPriceINR } from '../../lib/config';

interface CategoryIndexProps {
  categoryEntries: CategoryIndexEntry[];
  spreads: CatalogueSpreadDescriptor[];
  onJumpToSpread: (spreadIndex: number) => void;
  onRequestCustom: () => void;
  isLoadingCatalog?: boolean;
}

export const CategoryIndex: React.FC<CategoryIndexProps> = ({
  categoryEntries,
  spreads,
  onJumpToSpread,
  onRequestCustom,
  isLoadingCatalog = false,
}) => {
  const productSpreads = spreads.filter((s) => s.type === 'product' && s.product);
  const highlightedPlates = productSpreads.slice(0, 7);

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 select-none">
      {/* LEFT FOLIO: Chapters by Category */}
      <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[rgba(43,39,33,0.08)] overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#784f2b]">
            <span>Table of Contents</span>
            <span>Folios</span>
          </div>
          <div className="h-[1px] w-full bg-[rgba(43,39,33,0.12)]" />

          <div>
            <h2 className="sb-display text-2xl sm:text-3xl text-[#2b2721]">
              Studio <span className="italic text-[#9a6a3e]">Chapters</span>
            </h2>
            <p className="sb-prose text-xs sm:text-sm text-[rgba(43,39,33,0.68)] mt-1">
              Select a chapter to turn directly to its opening plate.
            </p>
          </div>

          {isLoadingCatalog ? (
            <div className="py-8 text-xs italic text-[rgba(43,39,33,0.6)]">
              Preparing catalogue chapters...
            </div>
          ) : categoryEntries.length === 0 ? (
            <div className="py-5 space-y-3 border-t border-[rgba(43,39,33,0.12)]">
              <p className="sb-prose text-sm text-[rgba(43,39,33,0.75)] leading-relaxed">
                New limited runs are currently being prepared in our print studio. You can commission any custom 3D model or personalized gift today.
              </p>
              <button
                type="button"
                data-interactive="true"
                onClick={onRequestCustom}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Custom Print</span>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(43,39,33,0.11)] border-t border-b border-[rgba(43,39,33,0.12)] max-h-[250px] overflow-y-auto pr-1">
              {categoryEntries.map((entry, idx) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    data-interactive="true"
                    onClick={() => onJumpToSpread(entry.startSpreadIndex)}
                    className="w-full py-2.5 px-1.5 flex items-baseline justify-between gap-3 text-left hover:bg-[rgba(255,252,244,0.72)] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-baseline gap-2.5 min-w-0">
                      <span className="text-[10px] tabular-nums text-[rgba(43,39,33,0.48)]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="sb-display text-lg text-[#2b2721] group-hover:text-[#784f2b] truncate transition-colors">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.58)] shrink-0 tabular-nums">
                      <span>
                        {entry.count} {entry.count === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-[#9a6a3e]">
                        p.{String(entry.startSpreadIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-3 flex items-center justify-between text-[11px] text-[rgba(43,39,33,0.6)]">
          <span>Spread 02</span>
          {productSpreads.length > 0 && (
            <button
              type="button"
              data-interactive="true"
              onClick={() => onJumpToSpread(productSpreads[0].spreadIndex)}
              className="inline-flex items-center gap-1.5 text-[#784f2b] hover:text-[#2b2721] font-medium cursor-pointer"
            >
              <span>Turn to Plate 01</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT FOLIO: Selected Plate Directory */}
      <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[rgba(255,252,244,0.28)] overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.56)]">
            <span>Plate Directory</span>
            <span className="tabular-nums">{productSpreads.length} Editions</span>
          </div>
          <div className="h-[1px] w-full bg-[rgba(43,39,33,0.12)]" />

          {highlightedPlates.length === 0 ? (
            <div className="py-10 text-center space-y-2 border border-dashed border-[rgba(43,39,33,0.18)] rounded-sm p-5">
              <p className="sb-display text-xl text-[#2b2721]">Bespoke Additive Studio</p>
              <p className="sb-prose text-xs text-[rgba(43,39,33,0.68)] leading-relaxed">
                Catalog plates added in the Admin Portal automatically populate this ledger and generate new sketchbook pages.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(43,39,33,0.1)] max-h-[290px] overflow-y-auto pr-1">
              {highlightedPlates.map((spread) => {
                const prod = spread.product!;
                return (
                  <li key={spread.id}>
                    <button
                      type="button"
                      data-interactive="true"
                      onClick={() => onJumpToSpread(spread.spreadIndex)}
                      className="w-full py-2 px-1 flex items-center justify-between gap-3 text-left hover:bg-[rgba(255,252,244,0.75)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#9a6a3e] tabular-nums shrink-0">
                          Pl.{String(spread.plateNumber).padStart(2, '0')}
                        </span>
                        <span className="sb-prose text-sm text-[#2b2721] group-hover:text-[#784f2b] truncate">
                          {prod.title}
                        </span>
                      </div>
                      <span className="text-[11px] tabular-nums text-[rgba(43,39,33,0.65)] shrink-0">
                        {prod.price != null ? formatPriceINR(prod.price) : 'Quote'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {productSpreads.length > highlightedPlates.length && (
            <p className="text-[11px] italic text-[rgba(43,39,33,0.6)]">
              +{productSpreads.length - highlightedPlates.length} additional editions listed in the full ledger below the sketchbook.
            </p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-between text-[11px] text-[rgba(43,39,33,0.6)] border-t border-[rgba(43,39,33,0.1)]">
          <span>Use arrows or drag corner to flip</span>
          <span className="tabular-nums">Index</span>
        </div>
      </div>
    </div>
  );
};
