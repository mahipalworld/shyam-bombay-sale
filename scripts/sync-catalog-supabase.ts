import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_STORIES, 
  INITIAL_SCRATCH_CONFIG, 
  INITIAL_FLASH_DEAL_CONFIG 
} from '../src/data/initialData';

const SUPABASE_URL = 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbHdveXFybGZ5cWZxb2pobWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTY1OTEsImV4cCI6MjEwMzU5MjU5MX0.B8PwpDM2T2XEZdC5YjpWbq85IYbvuZ-EkLlyQ0LDlt8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncAll() {
  console.log('🚀 Starting Full Cloud Database Synchronization...');

  // 1. Sync Categories
  console.log(`Syncing ${INITIAL_CATEGORIES.length} Categories...`);
  for (const cat of INITIAL_CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      subtitle: cat.subtitle,
      image: cat.image,
      bg_color: cat.bgColor,
      accent_color: cat.accentColor,
      item_count: cat.itemCount,
      subcategories: cat.subcategories || [],
    });
    if (error) console.error(`Error syncing category ${cat.id}:`, error);
  }
  console.log('✅ Categories Synced.');

  // 2. Sync Products
  console.log(`Syncing ${INITIAL_PRODUCTS.length} Products...`);
  for (const p of INITIAL_PRODUCTS) {
    const { error } = await supabase.from('products').upsert({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || null,
      price: p.price,
      original_price: p.originalPrice,
      discount_percentage: p.discountPercentage,
      rating: p.rating,
      review_count: p.reviewCount,
      image: p.image,
      images: p.images || [p.image],
      in_stock: p.inStock,
      stock_count: p.stockCount,
      description: p.description,
      description_blocks: p.descriptionBlocks || [],
      features: p.features || [],
      is_trending: Boolean(p.isTrending),
      is_best_seller: Boolean(p.isBestSeller),
      is_deal_of_day: Boolean(p.isDealOfDay),
      is_featured: Boolean(p.isFeatured),
      is_super_deal: Boolean(p.isSuperDeal),
      is_top_rated: Boolean(p.isTopRated),
    });
    if (error) console.error(`Error syncing product ${p.id}:`, error);
  }
  console.log('✅ Products Synced.');

  // 3. Sync Coupons
  console.log(`Syncing ${INITIAL_COUPONS.length} Coupons...`);
  for (const c of INITIAL_COUPONS) {
    const { error } = await supabase.from('coupons').upsert({
      id: c.id,
      code: c.code,
      title: c.title,
      discount_type: c.discountType,
      value: c.value,
      min_order_value: c.minOrderValue,
      max_discount: c.maxDiscount || null,
      expires_at: c.expiresAt,
      description: c.description,
    });
    if (error) console.error(`Error syncing coupon ${c.id}:`, error);
  }
  console.log('✅ Coupons Synced.');

  // 4. Sync Store Settings & Features (Stories, Scratch, Flash Deal)
  console.log('Syncing Store Features & Configs...');
  await supabase.from('store_settings').upsert({
    id: 'stories',
    data: INITIAL_STORIES
  });
  await supabase.from('store_settings').upsert({
    id: 'scratch_config',
    data: INITIAL_SCRATCH_CONFIG
  });
  await supabase.from('store_settings').upsert({
    id: 'flash_deal_config',
    data: INITIAL_FLASH_DEAL_CONFIG
  });
  console.log('✅ Store Settings Synced.');

  console.log('🎉 ALL CATALOG & SETTINGS DATA SYNCED TO SUPABASE CLOUD DATABASE SUCCESSFULLY!');
}

syncAll().catch(console.error);
