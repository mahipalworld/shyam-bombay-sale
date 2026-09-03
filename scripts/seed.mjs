// SBS Store - Supabase Seed Script
// Run: node scripts/seed.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbHdveXFybGZ5cWZxb2pobWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTY1OTEsImV4cCI6MjEwMzU5MjU5MX0.B8PwpDM2T2XEZdC5YjpWbq85IYbvuZ-EkLlyQ0LDlt8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', subtitle: 'Mops, Brushes & more', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80', bg_color: '#EAF4FC', accent_color: '#0284C7', item_count: 24 },
  { id: 'kitchen', name: 'Kitchen', subtitle: 'Organisers, Tools & more', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', bg_color: '#FFF0E6', accent_color: '#EA580C', item_count: 38 },
  { id: 'personal-care', name: 'Personal Care', subtitle: 'Trimmers, Grooming & more', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80', bg_color: '#F3EFFC', accent_color: '#9333EA', item_count: 19 },
  { id: 'home-storage', name: 'Home & Storage', subtitle: 'Organise, Save Space & more', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80', bg_color: '#EBF5F0', accent_color: '#059669', item_count: 42 },
  { id: 'home', name: 'Home', subtitle: 'Decor, Lights, Utility & more', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', bg_color: '#FFF9E6', accent_color: '#D97706', item_count: 31 },
  { id: 'laundry', name: 'Laundry', subtitle: 'Baskets, Lines & more', image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80', bg_color: '#EDF5F9', accent_color: '#0891B2', item_count: 15 },
  { id: 'travel-outdoors', name: 'Travel & Outdoors', subtitle: 'Bottles, Bags, Accessories & more', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', bg_color: '#FDEEF2', accent_color: '#DB2777', item_count: 22 },
  { id: 'offers', name: 'Offers', subtitle: 'Best Deals, Combo Packs & more', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80', bg_color: '#FFF6E5', accent_color: '#EA580C', item_count: 50 },
];

const PRODUCTS = [
  { id: 'p1', name: 'Mini Washing Machine', category: 'laundry', price: 1499, original_price: 2499, discount_percentage: 40, rating: 4.6, review_count: 128, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 15, description: 'Compact portable ultrasonic mini washing machine with turbo spin technology. Perfect for quick washes, baby clothes, delicates, and travel essentials.', features: ['High-frequency vibration', 'Timer switch', 'USB Powered / Low Energy', 'Foldable & Compact'], is_trending: true, is_deal_of_day: true, is_best_seller: false },
  { id: 'p2', name: 'Packet Sealer', category: 'kitchen', price: 349, original_price: 599, discount_percentage: 42, rating: 4.5, review_count: 96, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 40, description: 'Handheld heat bag vacuum sealer machine for kitchen snacks, dry fruits, and food preservation. Keeps food fresh and airtight in seconds.', features: ['Instant 3s Heating', 'Magnetic Back for Fridge', 'Dual Mode (Sealing + Cutter)', 'Battery Operated'], is_trending: true, is_deal_of_day: false, is_best_seller: false },
  { id: 'p3', name: 'Rechargeable Trimmer', category: 'personal-care', price: 799, original_price: 1299, discount_percentage: 38, rating: 4.4, review_count: 154, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 25, description: 'Cordless high precision beard and hair trimmer with stainless steel self-sharpening blades, LED battery indicator, and fast USB charging.', features: ['120 mins Runtime', '4 Guide Combs Included', 'IPX7 Waterproof Head', 'Ultra Quiet Motor'], is_trending: true, is_deal_of_day: false, is_best_seller: true },
  { id: 'p4', name: 'Spin Mop with Bucket', category: 'cleaning', price: 799, original_price: 1299, discount_percentage: 38, rating: 4.6, review_count: 210, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 18, description: '360 degree rotating magic spin mop bucket system with dual wringer spinner, microfiber refill heads, and extendable steel handle.', features: ['360 Degree Rotating Head', '2 Microfiber Refills Included', 'Built-in Soap Dispenser', 'Drain Plug System'], is_trending: false, is_deal_of_day: false, is_best_seller: true },
  { id: 'p5', name: 'Microfiber Cleaning Cloth (Pack of 5)', category: 'cleaning', price: 199, original_price: 299, discount_percentage: 33, rating: 4.5, review_count: 153, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 80, description: 'Super absorbent, lint-free, scratch-free multi-color microfiber cleaning towels for home, kitchen counters, glass mirrors, and car detailing.', features: ['Super Soft Plush 300 GSM', 'Absorbs 8x its weight', 'Quick Drying', 'Machine Washable'], is_trending: false, is_deal_of_day: false, is_best_seller: true },
  { id: 'p6', name: 'Storage Box (20L)', category: 'home-storage', price: 449, original_price: 699, discount_percentage: 36, rating: 4.4, review_count: 87, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 30, description: 'Heavy duty transparent modular stackable organizer storage container box with side lock handles and dust-proof lid.', features: ['Stackable Design', 'Locking Latches', 'BPA Free Virgin Plastic', 'Clear Visibility'], is_trending: false, is_deal_of_day: false, is_best_seller: true },
  { id: 'p7', name: 'Non-Stick Frying Pan (24cm)', category: 'kitchen', price: 549, original_price: 999, discount_percentage: 45, rating: 4.7, review_count: 312, image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 22, description: 'Granite coated 3-layer induction base non-stick fry pan with heat-resistant ergonomic cool-touch bakelite handle.', features: ['Induction & Gas Compatible', 'PFOA Free Safe Coating', 'Even Heat Distribution', 'Easy Clean'], is_trending: false, is_deal_of_day: true, is_best_seller: false },
  { id: 'p8', name: 'Insulated Stainless Steel Bottle (Pink - 750ml)', category: 'travel-outdoors', price: 499, original_price: 799, discount_percentage: 38, rating: 4.8, review_count: 420, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 35, description: 'Double-walled vacuum insulated thermal flask with carrying strap. Keeps beverages cold for 24 hours and hot for 12 hours.', features: ['Food Grade 304 Steel', 'Leak-proof Cap', 'Sweat Free Body', 'Ergonomic Strap'], is_trending: true, is_deal_of_day: false, is_best_seller: false },
  { id: 'p9', name: 'Airtight Kitchen Container Set (Set of 4)', category: 'kitchen', price: 649, original_price: 1099, discount_percentage: 41, rating: 4.6, review_count: 190, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 20, description: 'Modular pantry food storage containers with silicone seal ring locking flip clips for cereal, flour, pulses, and dry snacks.', features: ['100% Airtight & Leakproof', 'Space Saving Modular', 'Dishwasher Safe', 'BPA Free'], is_trending: false, is_deal_of_day: false, is_best_seller: false },
  { id: 'p10', name: 'Foldable Laundry Hamper Basket', category: 'laundry', price: 399, original_price: 699, discount_percentage: 43, rating: 4.3, review_count: 110, image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80', in_stock: true, stock_count: 28, description: 'Ventilated breathable durable plastic laundry basket with soft grip handles for easy carrying and space-efficient storing.', features: ['Collapsible Frame', 'Reinforced Bottom', 'Moisture Resistant', 'Modern Pastel Tone'], is_trending: false, is_deal_of_day: false, is_best_seller: false },
];

async function seed() {
  console.log('Starting SBS Store seed...\n');

  // Upsert categories
  console.log('Seeding categories...');
  const { error: catErr } = await supabase.from('categories').upsert(CATEGORIES, { onConflict: 'id' });
  if (catErr) {
    console.error('Categories error:', catErr.message);
  } else {
    console.log(CATEGORIES.length + ' categories seeded OK');
  }

  // Upsert products
  console.log('\nSeeding products...');
  const { error: prodErr } = await supabase.from('products').upsert(PRODUCTS, { onConflict: 'id' });
  if (prodErr) {
    console.error('Products error:', prodErr.message);
  } else {
    console.log(PRODUCTS.length + ' products seeded OK');
  }

  // Verify counts
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('\nVerification: ' + catCount + ' categories, ' + prodCount + ' products in Supabase');
  console.log('Seed complete!');
}

seed().catch(console.error);
