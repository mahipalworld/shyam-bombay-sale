import { supabase } from './supabase';
import { Product, Category, Subcategory } from '@/types';

// Fallback empty arrays in case Supabase is unreachable during build
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cleaning-products--chemicals',
    name: 'Cleaning Products / Chemicals',
    subtitle: 'Everyday essentials',
    image: '/categories/cleaning-products--chemicals.png',
    bgColor: '#EAF4FC',
    accentColor: '#0284C7',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'kitchen-utility',
    name: 'Kitchen Utility',
    subtitle: 'Everyday essentials',
    image: '/categories/kitchen-utility.png',
    bgColor: '#F1F5F9',
    accentColor: '#475569',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'bathroom--laundry',
    name: 'Bathroom & Laundry',
    subtitle: 'Everyday essentials',
    image: '/categories/bathroom--laundry.png',
    bgColor: '#FDEEF2',
    accentColor: '#DB2777',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'cleaning-tools',
    name: 'Cleaning Tools',
    subtitle: 'Tools',
    image: '/categories/cleaning-tools.png',
    bgColor: '#FFF9E6',
    accentColor: '#D97706',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'bucket-and-plastics',
    name: 'Bucket and plastics',
    subtitle: 'Everyday essentials',
    image: '/categories/bucket-and-plastics.png',
    bgColor: '#FDEEF2',
    accentColor: '#DB2777',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'personal-care--grooming',
    name: 'Personal Care / Grooming',
    subtitle: 'Everyday essentials',
    image: '/categories/personal-care--grooming.png',
    bgColor: '#F3EFFC',
    accentColor: '#9333EA',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'small-appliances--gadgets',
    name: 'Small Appliances / Gadgets',
    subtitle: 'Everyday essentials',
    image: '/categories/small-appliances--gadgets.png',
    bgColor: '#FDEEF2',
    accentColor: '#DB2777',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
  {
    id: 'hardware--utility',
    name: 'Hardware / Utility',
    subtitle: 'Everyday essentials',
    image: '/categories/hardware--utility.png',
    bgColor: '#EAF4FC',
    accentColor: '#0284C7',
    itemCount: 0,
    subcategories: [],
    showOnHome: true,
  },
];

export function mapDbProduct(p: any): Product {
  const images = (p.images && Array.isArray(p.images) && p.images.length > 0) 
    ? p.images 
    : (p.image ? [p.image] : []);

  return {
    id: p.id,
    barcode: p.barcode || undefined,
    name: p.name || 'SBS Product',
    category: p.category || 'general',
    subcategory: p.subcategory || undefined,
    price: Number(p.price || 0),
    originalPrice: Number(p.original_price || p.price || 0),
    discountPercentage: Number(p.discount_percentage || 0),
    rating: Number(p.rating || 4.8),
    reviewCount: Number(p.review_count || 0),
    image: p.image || images[0] || '/logo.png',
    images: images.length > 0 ? images : ['/logo.png'],
    video: p.video || undefined,
    videos: p.videos || [],
    videoThumbnail: p.video_thumbnail || undefined,
    inStock: p.in_stock !== false,
    stockCount: Number(p.stock_count ?? 10),
    description: typeof p.description === 'string' ? p.description : '',
    descriptionBlocks: Array.isArray(p.description_blocks) ? p.description_blocks : [],
    features: Array.isArray(p.features) ? p.features : [],
    isTrending: Boolean(p.is_trending),
    isBestSeller: Boolean(p.is_best_seller),
    isDealOfDay: Boolean(p.is_deal_of_day),
    isFeatured: Boolean(p.is_featured),
    isSuperDeal: Boolean(p.is_super_deal),
    isTopRated: Boolean(p.is_top_rated),
    subtitle: p.subtitle || undefined,
    featureIcons: Array.isArray(p.feature_icons) ? p.feature_icons : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    shippingInfo: p.shipping_info || undefined,
    returnPolicy: p.return_policy || undefined,
  };
}

export function mapDbCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    subtitle: c.subtitle || 'Everyday essentials',
    image: c.image || '/logo.png',
    bgColor: c.bg_color || '#FFF0E6',
    accentColor: c.accent_color || '#F95721',
    itemCount: c.item_count || 0,
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
    showOnHome: c.show_on_home !== false,
  };
}

/**
 * Fetches all products from Supabase for static page pre-rendering
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error || !data) {
      console.warn('Supabase getAllProducts fallback:', error?.message);
      return [];
    }

    return data.map(mapDbProduct);
  } catch (err) {
    console.warn('Error fetching all products from Supabase:', err);
    return [];
  }
}

/**
 * Fetches a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbProduct(data);
  } catch (err) {
    console.warn(`Error fetching product ${id} from Supabase:`, err);
    return null;
  }
}

/**
 * Fetches all categories from Supabase
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return data.map(mapDbCategory);
  } catch (err) {
    console.warn('Error fetching categories from Supabase:', err);
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Fetches a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_CATEGORIES.find((c) => c.id === id);
      return fallback || null;
    }

    return mapDbCategory(data);
  } catch (err) {
    const fallback = FALLBACK_CATEGORIES.find((c) => c.id === id);
    return fallback || null;
  }
}

/**
 * Fetches all products belonging to a category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', categoryId)
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map(mapDbProduct);
  } catch (err) {
    console.warn(`Error fetching products for category ${categoryId}:`, err);
    return [];
  }
}
