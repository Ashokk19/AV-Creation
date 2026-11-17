import { CategoryRecord, ProductItem } from '../types';

export type CatalogueSpreadType = 'cover' | 'index' | 'product';

export interface CategoryIndexEntry {
  id: string;
  name: string;
  slug: string;
  count: number;
  startSpreadIndex: number;
  firstPlateNumber: number;
  lastPlateNumber: number;
}

export interface CatalogueSpreadDescriptor {
  spreadIndex: number;
  type: CatalogueSpreadType;
  id: string;
  title: string;
  subtitle: string;
  plateNumber?: number;
  categorySlug?: string;
  product?: ProductItem;
}

export interface CatalogueBookPlan {
  spreads: CatalogueSpreadDescriptor[];
  categoryEntries: CategoryIndexEntry[];
  totalSpreads: number;
  totalPlates: number;
  firstProductSpreadIndex: number | null;
}

/**
 * Dynamically builds the Sketchbook pagination plan from live categories and products.
 * Adapts to any product count (0, < 9, = 9, or > 9) without fixed page limits.
 *
 * Structure:
 *  - Spread 0: Cover & Featured Showcase Folio
 *  - Spread 1: Editorial Category & Plate Index
 *  - Spread 2..N+1: One open two-page spread per active product (`Plate 01`..`Plate N`)
 */
export function buildCatalogueBookPlan(
  categories: CategoryRecord[],
  products: ProductItem[]
): CatalogueBookPlan {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Order products grouped cleanly by category order first (so turning pages flows chapter-by-chapter),
  // appending any uncategorized / extra category items afterward.
  const orderedProducts: ProductItem[] = [];
  const seenProductIds = new Set<string>();

  for (const cat of safeCategories) {
    const matches = safeProducts.filter((p) => p.category === cat.slug || p.categoryId === cat.id);
    for (const prod of matches) {
      if (!seenProductIds.has(prod.id)) {
        seenProductIds.add(prod.id);
        orderedProducts.push(prod);
      }
    }
  }

  for (const prod of safeProducts) {
    if (!seenProductIds.has(prod.id)) {
      seenProductIds.add(prod.id);
      orderedProducts.push(prod);
    }
  }

  const spreads: CatalogueSpreadDescriptor[] = [
    {
      spreadIndex: 0,
      type: 'cover',
      id: 'cover',
      title: 'AV Creations — Studio Catalogue',
      subtitle: 'Made by Imagination',
    },
    {
      spreadIndex: 1,
      type: 'index',
      id: 'editorial-index',
      title: 'Editorial Index',
      subtitle:
        orderedProducts.length > 0
          ? `${orderedProducts.length} Editions Across ${Math.max(1, safeCategories.length)} Collections`
          : 'Curated Collections & Bespoke Commissions',
    },
  ];

  // Append 1 spread per product dynamically
  orderedProducts.forEach((product, idx) => {
    const plateNumber = idx + 1;
    const spreadIndex = 2 + idx;
    spreads.push({
      spreadIndex,
      type: 'product',
      id: `product-${product.id}`,
      title: product.title,
      subtitle: product.categoryName || product.subtitle || 'Studio Edition',
      plateNumber,
      categorySlug: product.category,
      product,
    });
  });

  // Compute Category Index entries mapping cleanly to exact starting spread
  const categoryEntries: CategoryIndexEntry[] = [];
  for (const cat of safeCategories) {
    const catSpreads = spreads.filter(
      (s) => s.type === 'product' && (s.categorySlug === cat.slug || s.product?.categoryId === cat.id)
    );
    if (catSpreads.length > 0) {
      const first = catSpreads[0];
      const last = catSpreads[catSpreads.length - 1];
      categoryEntries.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: catSpreads.length,
        startSpreadIndex: first.spreadIndex,
        firstPlateNumber: first.plateNumber || 1,
        lastPlateNumber: last.plateNumber || catSpreads.length,
      });
    }
  }

  // Also ensure any orphaned category in products (not listed in categories array) gets an index entry
  for (const s of spreads) {
    if (s.type !== 'product' || !s.product) continue;
    const exists = categoryEntries.some((e) => e.slug === s.product!.category);
    if (!exists) {
      const siblingSpreads = spreads.filter(
        (other) => other.type === 'product' && other.product?.category === s.product!.category
      );
      const first = siblingSpreads[0];
      const last = siblingSpreads[siblingSpreads.length - 1];
      categoryEntries.push({
        id: s.product.categoryId || s.product.category,
        name: s.product.categoryName || s.product.category,
        slug: s.product.category,
        count: siblingSpreads.length,
        startSpreadIndex: first.spreadIndex,
        firstPlateNumber: first.plateNumber || 1,
        lastPlateNumber: last.plateNumber || 1,
      });
    }
  }

  return {
    spreads,
    categoryEntries,
    totalSpreads: spreads.length,
    totalPlates: orderedProducts.length,
    firstProductSpreadIndex: orderedProducts.length > 0 ? 2 : null,
  };
}
