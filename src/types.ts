export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  product_count?: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  image_path: string;
  image_url?: string;
  images?: string[];
  image_urls?: string[];
  category_id: string;
  price?: number | null;
  is_featured: boolean;
  status: 'active' | 'draft';
  created_at?: string;
  updated_at?: string;
  category?: CategoryRecord;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  notes?: string | null;
  created_at?: string;
}

export type ProductCategory =
  | 'ambient-lighting'
  | 'articulated-collectible'
  | 'home-living'
  | 'miniature-worlds'
  | 'custom-creations'
  | 'tea-lights'
  | 'clickers'
  | 'pokemon'
  | 'wall-decors'
  | string;

export type ProductFunctionType = 'decorative' | 'functional' | 'hybrid';

export type FilamentMaterial =
  | 'PLA+ Silk'
  | 'Matte PLA'
  | 'Translucent PETG'
  | 'Resin High-Detail'
  | 'Wood Composite PLA'
  | 'Carbon Fiber PETG';

export interface ColorVariant {
  id?: string;
  name: string;
  hex: string;
  filamentType: string;
}

export interface TechnicalSpecs {
  material: string;
  layerResolution: string;
  infillDensity: string;
  printTimeHours: number;
  dimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  weightGrams: number;
  nozzleDiameter: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string; // slug
  categoryName: string;
  categoryId: string;
  functionType: ProductFunctionType;
  shortDescription: string;
  storyDescription: string;
  price?: number | null;
  featured: boolean;
  trending: boolean;
  recentlyAdded: boolean;
  creationDate: string;
  status: 'active' | 'draft';
  image_path: string;
  imageUrl?: string;
  images?: string[];
  imageUrls?: string[];
  primaryVisual: {
    accentGlow: string;
    style: string;
    description: string;
    aspectRatio: '16:9' | '4:3' | '1:1';
  };
  specs: TechnicalSpecs;
  availableColors: ColorVariant[];
  customizable: boolean;
  tags: string[];
}

export interface CustomInquiry {
  fullName: string;
  email: string;
  phone?: string;
  projectCategory: string;
  referenceUrlOrNotes?: string;
  estimatedDimensions: string;
  materialPreference: string;
  description: string;
  quantity: number;
  targetTimeline: 'flexible' | '2-3-weeks' | 'urgent-1-week';
}

export interface CustomerEnquiry {
  id: string;
  customer_name: string;
  email: string;
  phone?: string | null;
  project_category?: string | null;
  description: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  reference_link?: string | null;
  dimensions?: string | null;
  material_preference?: string | null;
  quantity: number;
  target_timeline?: string | null;
  status: 'new' | 'in_progress' | 'completed';
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  selectedColor?: ColorVariant;
}
