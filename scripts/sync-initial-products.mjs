import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbHdveXFybGZ5cWZxb2pobWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTY1OTEsImV4cCI6MjEwMzU5MjU5MX0.B8PwpDM2T2XEZdC5YjpWbq85IYbvuZ-EkLlyQ0LDlt8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sync() {
  const { data: rawProds, error } = await supabase.from('products').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }

  const mapped = rawProds.map(p => ({
    id: p.id,
    barcode: p.barcode || undefined,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory || undefined,
    price: Number(p.price),
    originalPrice: Number(p.original_price),
    discountPercentage: p.discount_percentage,
    rating: Number(p.rating),
    reviewCount: p.review_count,
    image: p.image,
    images: (p.images && p.images.length > 0) ? p.images : [p.image],
    video: p.video || undefined,
    videos: (p.videos && p.videos.length > 0) ? p.videos : [],
    videoThumbnail: p.video_thumbnail || undefined,
    inStock: Boolean(p.in_stock),
    stockCount: p.stock_count,
    description: p.description,
    descriptionBlocks: p.description_blocks || undefined,
    features: p.features || [],
    isTrending: Boolean(p.is_trending),
    isBestSeller: Boolean(p.is_best_seller),
    isDealOfDay: Boolean(p.is_deal_of_day),
    isFeatured: Boolean(p.is_featured),
    isSuperDeal: Boolean(p.is_super_deal),
    isTopRated: Boolean(p.is_top_rated),
    subtitle: p.subtitle || undefined,
    featureIcons: (p.feature_icons && p.feature_icons.length > 0) ? p.feature_icons : undefined,
    specifications: (p.specifications && p.specifications.length > 0) ? p.specifications : undefined,
    faqs: (p.faqs && p.faqs.length > 0) ? p.faqs : undefined,
    shippingInfo: p.shipping_info || undefined,
    returnPolicy: p.return_policy || undefined,
  }));

  const initialDataPath = path.resolve('src/data/initialData.ts');
  let content = fs.readFileSync(initialDataPath, 'utf8');

  const productsTs = 'export const INITIAL_PRODUCTS: Product[] = ' + JSON.stringify(mapped, null, 2) + ';\n';
  content = content.replace(/export const INITIAL_PRODUCTS: Product\[\] = \[\];/, productsTs);

  fs.writeFileSync(initialDataPath, content, 'utf8');
  console.log(`Successfully synced ${mapped.length} real products into src/data/initialData.ts!`);
}

sync().catch(console.error);
