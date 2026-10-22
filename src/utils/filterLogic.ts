import { ProductItem, CategoryRecord, ProductFunctionType, FilamentMaterial } from '../types';

export interface FilterOptions {
  category?: string;
  functionType?: ProductFunctionType | 'all';
  material?: FilamentMaterial | 'all';
  searchQuery?: string;
  sortBy?: 'featured' | 'newest' | 'name' | 'printTime';
}

/**
 * Filter products based on category, functional type, material, and search query.
 */
export function filterProducts(products: ProductItem[], options: FilterOptions): ProductItem[] {
  let filtered = [...products];

  // Category filter
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter(
      (p) => p.category === options.category || p.categoryId === options.category
    );
  }

  // Functional type filter
  if (options.functionType && options.functionType !== 'all') {
    filtered = filtered.filter((p) => p.functionType === options.functionType);
  }

  // Material filter
  if (options.material && options.material !== 'all') {
    filtered = filtered.filter((p) => p.specs.material === options.material);
  }

  // Search query
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.material.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (options.sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
      break;
    case 'name':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'printTime':
      filtered.sort((a, b) => b.specs.printTimeHours - a.specs.printTimeHours);
      break;
    case 'featured':
    default:
      // Featured first, then newest
      filtered.sort((a, b) => {
        if (a.featured === b.featured) {
          return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
        }
        return a.featured ? -1 : 1;
      });
      break;
  }

  return filtered;
}

/**
 * Group products for horizontal carousels by dynamic categories from Supabase.
 */
export function getCategoryCarousels(categories: CategoryRecord[], products: ProductItem[]) {
  const rows: {
    id: string;
    title: string;
    subtitle: string;
    items: ProductItem[];
  }[] = [];

  // 1. Featured Creations row (if any featured products exist)
  const featuredItems = products.filter((p) => p.featured);
  if (featuredItems.length > 0) {
    rows.push({
      id: 'featured',
      title: 'Featured Creations',
      subtitle: 'Highlighted studio designs currently producing in the workshop',
      items: featuredItems,
    });
  }

  // 2. Dynamic Category Rows for each category (including the 4 default categories)
  for (const cat of categories) {
    const categoryProducts = products.filter(
      (p) => p.category === cat.slug || p.categoryId === cat.id
    );

    let subtitle = `Curated designs in the ${cat.name} collection`;
    if (cat.slug === 'tea-lights') {
      subtitle = 'Translucent ambient glow vessels, lithophanes, and sculptural tea lights';
    } else if (cat.slug === 'clickers') {
      subtitle = 'Kinetic articulated fidget clickers, tactile mechanisms, and desk toys';
    } else if (cat.slug === 'pokemon') {
      subtitle = 'Detailed multi-part figures, low-poly pocket monsters, and collectibles';
    } else if (cat.slug === 'wall-decors') {
      subtitle = 'Parametric geometric wall art, relief panels, and architectural hangings';
    }

    rows.push({
      id: cat.slug,
      title: cat.name,
      subtitle: subtitle,
      items: categoryProducts,
    });
  }

  return rows;
}
