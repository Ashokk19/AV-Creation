import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ChevronDown, ShoppingBag, Expand, BookOpen } from 'lucide-react';
import { CategoryRecord, ColorVariant, ProductItem } from '../../types';
import { HeroFrameSettings, HeroImageType } from '../../services/settingsService';
import { buildCatalogueBookPlan } from '../../utils/cataloguePagination';
import { MengToSketchbookAdapter, SketchbookSpreadItem } from '../../integrations/threeui/MengToSketchbookAdapter';
import { CatalogueCover } from './CatalogueCover';
import { CategoryIndex } from './CategoryIndex';
import { ProductPage } from './ProductPage';
import { formatPriceINR } from '../../lib/config';
import { getProductImages } from '../../utils/galleryLogic';

interface CataloguePageProps {
  categories: CategoryRecord[];
  products: ProductItem[];
  isLoadingCatalog?: boolean;
  heroImageType: HeroImageType;
  heroProduct: ProductItem | null;
  heroCustomImageUrl?: string;
  companyLogoUrl?: string;
  heroFrame?: HeroFrameSettings;
  favorites: string[];
  onToggleFavorite: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem, quantity: number, selectedColor?: ColorVariant) => void;
  onRequestCustom: (prefill?: string) => void;
  onOpenFullCollections?: (categorySlug?: string) => void;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  categories,
  products,
  isLoadingCatalog = false,
  heroImageType,
  heroProduct,
  heroCustomImageUrl,
  companyLogoUrl,
  heroFrame,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onRequestCustom,
}) => {
  const [activeSpreadIndex, setActiveSpreadIndex] = useState(0);
  const [photoIndexByProductId, setPhotoIndexByProductId] = useState<Record<string, number>>({});
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('all');
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1025px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktopViewport(e.matches);
    setIsDesktopViewport(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const bookPlan = useMemo(
    () => buildCatalogueBookPlan(categories, products),
    [categories, products]
  );

  // Clamp spread index cleanly if catalog size changes after admin updates
  useEffect(() => {
    if (activeSpreadIndex >= bookPlan.totalSpreads) {
      setActiveSpreadIndex(Math.max(0, bookPlan.totalSpreads - 1));
    }
  }, [activeSpreadIndex, bookPlan.totalSpreads]);

  const jumpToSpread = useCallback(
    (index: number, scrollIntoView = false) => {
      const clamped = Math.max(0, Math.min(bookPlan.totalSpreads - 1, index));
      setActiveSpreadIndex(clamped);
      if (scrollIntoView) {
        const el = document.getElementById('sketchbook');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [bookPlan.totalSpreads]
  );

  const spreads: SketchbookSpreadItem[] = useMemo(() => {
    return bookPlan.spreads.map((descriptor) => {
      if (descriptor.type === 'cover') {
        return {
          id: descriptor.id,
          title: descriptor.title,
          subtitle: descriptor.subtitle,
          render: () => (
            <CatalogueCover
              heroImageType={heroImageType}
              featuredProduct={heroProduct}
              customImageUrl={heroCustomImageUrl}
              companyLogoUrl={companyLogoUrl}
              heroFrame={heroFrame}
              categories={categories}
              totalProducts={bookPlan.totalPlates}
              onOpenIndex={() => jumpToSpread(1)}
              onStartBrowsing={() =>
                jumpToSpread(bookPlan.firstProductSpreadIndex ?? 1)
              }
              onViewFeaturedProduct={(p) => {
                const match = bookPlan.spreads.find(
                  (s) => s.type === 'product' && s.product?.id === p.id
                );
                if (match) {
                  jumpToSpread(match.spreadIndex);
                } else {
                  onSelectProduct(p);
                }
              }}
              onRequestCustom={() => onRequestCustom()}
            />
          ),
        };
      }

      if (descriptor.type === 'index') {
        return {
          id: descriptor.id,
          title: descriptor.title,
          subtitle: descriptor.subtitle,
          render: () => (
            <CategoryIndex
              categoryEntries={bookPlan.categoryEntries}
              spreads={bookPlan.spreads}
              onJumpToSpread={(idx) => jumpToSpread(idx)}
              onRequestCustom={() => onRequestCustom()}
              isLoadingCatalog={isLoadingCatalog}
            />
          ),
        };
      }

      const product = descriptor.product!;
      const isFav = favorites.includes(product.id);
      return {
        id: descriptor.id,
        title: product.title,
        subtitle: product.categoryName,
        render: (passiveSnapshot = false) => (
          <ProductPage
            product={product}
            plateNumber={descriptor.plateNumber || 1}
            isFavorite={isFav}
            onToggleFavorite={onToggleFavorite}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onRequestCustom={(p) => onRequestCustom(p.title)}
            passiveSnapshot={passiveSnapshot}
            activePhotoIndexOverride={photoIndexByProductId[product.id] ?? 0}
            onPhotoIndexChange={(photoIdx) =>
              setPhotoIndexByProductId((prev) => ({
                ...prev,
                [product.id]: photoIdx,
              }))
            }
          />
        ),
      };
    });
  }, [
    bookPlan,
    heroImageType,
    heroProduct,
    heroCustomImageUrl,
    companyLogoUrl,
    heroFrame,
    categories,
    favorites,
    photoIndexByProductId,
    isLoadingCatalog,
    jumpToSpread,
    onToggleFavorite,
    onSelectProduct,
    onAddToCart,
    onRequestCustom,
  ]);

  const productSpreads = useMemo(
    () => bookPlan.spreads.filter((s) => s.type === 'product' && s.product),
    [bookPlan.spreads]
  );

  const filteredLedgerSpreads = useMemo(() => {
    if (ledgerCategoryFilter === 'all') return productSpreads;
    return productSpreads.filter((s) => s.categorySlug === ledgerCategoryFilter);
  }, [productSpreads, ledgerCategoryFilter]);

  return (
    <>
      {/* SECTION 1: INTERACTIVE 3D SKETCHBOOK PRODUCT CATALOGUE */}
      <section
        id="sketchbook"
        className="sb-hero-section pt-24 sm:pt-28 pb-12 px-3 sm:px-6 lg:px-10 relative"
      >
        {isDesktopViewport && (
          <>
            <img
              src="/assets/sketchbook/botany-left.png"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="sb-botany l"
            />
            <img
              src="/assets/sketchbook/botany-right.png"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="sb-botany r"
            />
          </>
        )}

        {/* Editorial Top Kicker */}
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[rgba(43,39,33,0.68)] text-center mb-4 sm:mb-6">
          AV Creations · 3D Printing Studio · Interactive Product Catalogue
        </p>

        {/* Quick Chapter Jump Strip */}
        <div className="w-full max-w-[960px] flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => jumpToSpread(0)}
            className={`px-3 py-1 text-[11px] uppercase tracking-[0.14em] rounded-sm border transition-colors cursor-pointer whitespace-nowrap ${
              activeSpreadIndex === 0
                ? 'bg-[#2b2721] text-[#faf7ef] border-[#2b2721]'
                : 'bg-[rgba(250,247,239,0.72)] text-[rgba(43,39,33,0.72)] border-[rgba(43,39,33,0.16)] hover:border-[#2b2721]'
            }`}
          >
            Cover
          </button>
          <button
            type="button"
            onClick={() => jumpToSpread(1)}
            className={`px-3 py-1 text-[11px] uppercase tracking-[0.14em] rounded-sm border transition-colors cursor-pointer whitespace-nowrap ${
              activeSpreadIndex === 1
                ? 'bg-[#2b2721] text-[#faf7ef] border-[#2b2721]'
                : 'bg-[rgba(250,247,239,0.72)] text-[rgba(43,39,33,0.72)] border-[rgba(43,39,33,0.16)] hover:border-[#2b2721]'
            }`}
          >
            Index
          </button>

          {bookPlan.categoryEntries.map((entry) => {
            const isActiveChapter =
              activeSpreadIndex >= entry.startSpreadIndex &&
              activeSpreadIndex < entry.startSpreadIndex + entry.count;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => jumpToSpread(entry.startSpreadIndex)}
                className={`px-3 py-1 text-[11px] uppercase tracking-[0.14em] rounded-sm border transition-colors cursor-pointer whitespace-nowrap ${
                  isActiveChapter
                    ? 'bg-[#784f2b] text-[#faf7ef] border-[#784f2b]'
                    : 'bg-[rgba(250,247,239,0.72)] text-[rgba(43,39,33,0.72)] border-[rgba(43,39,33,0.16)] hover:border-[#784f2b]'
                }`}
              >
                {entry.name} ({entry.count})
              </button>
            );
          })}
        </div>

        {/* Exact ThreeUI Sketchbook Viewport */}
        <MengToSketchbookAdapter
          spreads={spreads}
          activeIndex={activeSpreadIndex}
          onIndexChange={setActiveSpreadIndex}
          headingFont="instrument-serif"
          bodyFont="newsreader"
          headingWeight="400"
          bodyWeight="400"
          primaryColor="#2b2721"
          headingSize={30}
          bodySize={20}
          headingLetterSpacing={0.01}
        />

        {/* Downward Scroll Cue to Editorial Ledger */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('plates');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="mt-5 p-2 text-[rgba(43,39,33,0.55)] hover:text-[#2b2721] transition-colors cursor-pointer"
          aria-label="Scroll to full editorial plate index"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      <div className="sb-rule" aria-hidden="true" />

      {/* SECTION 2: EDITORIAL PLATE LEDGER (Dynamic Catalogue Index) */}
      <section
        id="plates"
        className="max-w-[1080px] mx-auto px-5 sm:px-8 lg:px-12 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.58)] mb-2">
              Catalogue Index
            </p>
            <h2 className="sb-display text-3xl sm:text-4xl text-[#2b2721]">
              All Studio <span className="italic text-[#9a6a3e]">Plates</span>
            </h2>
          </div>

          {bookPlan.categoryEntries.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setLedgerCategoryFilter('all')}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] rounded-sm border transition-colors cursor-pointer ${
                  ledgerCategoryFilter === 'all'
                    ? 'bg-[#2b2721] text-[#faf7ef] border-[#2b2721]'
                    : 'bg-[rgba(250,247,239,0.7)] text-[rgba(43,39,33,0.72)] border-[rgba(43,39,33,0.16)] hover:border-[#2b2721]'
                }`}
              >
                All ({productSpreads.length})
              </button>
              {bookPlan.categoryEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setLedgerCategoryFilter(entry.slug)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] rounded-sm border transition-colors cursor-pointer ${
                    ledgerCategoryFilter === entry.slug
                      ? 'bg-[#784f2b] text-[#faf7ef] border-[#784f2b]'
                      : 'bg-[rgba(250,247,239,0.7)] text-[rgba(43,39,33,0.72)] border-[rgba(43,39,33,0.16)] hover:border-[#784f2b]'
                  }`}
                >
                  {entry.name} ({entry.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoadingCatalog ? (
          <div className="py-12 border-t border-b border-[rgba(43,39,33,0.14)] text-center sb-prose text-base text-[rgba(43,39,33,0.68)]">
            Loading live catalogue plates from AV Creations studio...
          </div>
        ) : filteredLedgerSpreads.length === 0 ? (
          <div className="py-12 px-6 border border-[rgba(43,39,33,0.14)] bg-[rgba(250,247,239,0.6)] rounded-sm text-center space-y-3">
            <p className="sb-display text-2xl text-[#2b2721]">
              Studio Catalogue Ready for Editions
            </p>
            <p className="sb-prose text-base text-[rgba(43,39,33,0.72)] max-w-lg mx-auto">
              No active plates are published in this view yet. Commission a bespoke 3D print below or sign into the Admin Portal to publish new creations.
            </p>
            <button
              type="button"
              onClick={() => onRequestCustom()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
            >
              Commission a Custom Print
            </button>
          </div>
        ) : (
          <ol className="list-none m-0 p-0 border-t border-[rgba(43,39,33,0.14)]">
            {filteredLedgerSpreads.map((spread) => {
              const prod = spread.product!;
              const thumb = getProductImages(prod)[0] || '';
              const isCurrent = activeSpreadIndex === spread.spreadIndex;

              return (
                <li key={spread.id}>
                  <div
                    className="sb-plate-row"
                    aria-current={isCurrent ? 'true' : 'false'}
                  >
                    <span className="text-xs tabular-nums text-[rgba(43,39,33,0.52)]">
                      {String(spread.plateNumber).padStart(2, '0')}
                    </span>

                    <div
                      onClick={() => jumpToSpread(spread.spreadIndex, true)}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                    >
                      {thumb && (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border border-[rgba(43,39,33,0.14)] bg-[#f4efe3] overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="sb-display text-xl sm:text-2xl text-[#2b2721] group-hover:text-[#784f2b] truncate transition-colors">
                          {prod.title}
                        </h3>
                        <p className="text-xs text-[rgba(43,39,33,0.64)] truncate">
                          {prod.categoryName}
                          {prod.price != null ? ` · ${formatPriceINR(prod.price)}` : ' · Price on request'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => jumpToSpread(spread.spreadIndex, true)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] rounded-sm border transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#784f2b] text-[#faf7ef] border-[#784f2b]'
                            : 'bg-[rgba(255,253,247,0.75)] text-[#2b2721] border-[rgba(43,39,33,0.2)] hover:border-[#2b2721]'
                        }`}
                        title={`Turn sketchbook to Plate ${spread.plateNumber}`}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span className="hidden md:inline">
                          {isCurrent ? 'Open' : 'Turn to Page'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(prod)}
                        className="p-2 text-[rgba(43,39,33,0.68)] hover:text-[#2b2721] border border-[rgba(43,39,33,0.18)] hover:border-[#2b2721] rounded-sm bg-[rgba(255,253,247,0.75)] transition-colors cursor-pointer"
                        aria-label={`Inspect ${prod.title}`}
                        title="Inspect full details & photos"
                      >
                        <Expand className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(prod, 1, prod.availableColors[0])}
                        className="p-2 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] rounded-sm transition-colors cursor-pointer"
                        aria-label={`Add ${prod.title} to cart`}
                        title="Add to cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
};
