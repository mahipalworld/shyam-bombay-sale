import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pclwoyqrlfyqfqojhmag.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbHdveXFybGZ5cWZxb2pobWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTY1OTEsImV4cCI6MjEwMzU5MjU5MX0.B8PwpDM2T2XEZdC5YjpWbq85IYbvuZ-EkLlyQ0LDlt8';
const BASE_URL = 'https://www.sbsstore.in';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const S3_DIRECT_MEDIA_BASE_URL = 'https://sbs-store-media-748439418595.s3.ap-south-1.amazonaws.com';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveProductImageUrl(img) {
  if (!img) return `${BASE_URL}/logo.png`;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const clean = img.startsWith('/') ? img.slice(1) : img;
  if (clean.startsWith('products/') || clean.startsWith('categories/') || clean.startsWith('banners/')) {
    return `${S3_DIRECT_MEDIA_BASE_URL}/${clean}`;
  }
  return `${BASE_URL}/${clean}`;
}

async function run() {
  console.log('Generating SEO Sitemap & Google Merchant Feed from Supabase...');

  const [{ data: products, error: pErr }, { data: categories, error: cErr }] = await Promise.all([
    supabase.from('products').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
  ]);

  if (pErr) console.warn('Products fetch warning:', pErr.message);
  if (cErr) console.warn('Categories fetch warning:', cErr.message);

  const safeProducts = products || [];
  const safeCategories = categories || [];
  console.log(`Fetched ${safeProducts.length} products and ${safeCategories.length} categories.`);

  const now = new Date().toISOString();

  // 1. GENERATE public/sitemap.xml
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Store Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/logo.png</image:loc>
      <image:title>SBS Store — Shyam Bombay Sale</image:title>
    </image:image>
  </url>
  <url>
    <loc>${BASE_URL}/about/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/shipping-policy/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/refund-policy/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Department & Category Hubs -->
`;

  for (const cat of safeCategories) {
    const catUrl = `${BASE_URL}/category/${cat.id}/`;
    sitemapXml += `  <url>
    <loc>${catUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>\n`;
  }

  sitemapXml += `\n  <!-- Product Catalog Items (${safeProducts.length} items) -->\n`;

  for (const p of safeProducts) {
    const prodUrl = `${BASE_URL}/product/${p.id}/`;
    const imgUrl = resolveProductImageUrl(p.image);
    sitemapXml += `  <url>
    <loc>${prodUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(p.name)}</image:title>
    </image:image>
  </url>\n`;
  }

  sitemapXml += `</urlset>\n`;

  const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Saved public/sitemap.xml with ${7 + safeCategories.length + safeProducts.length} URLs.`);

  // 2. GENERATE public/feed.xml (Google Merchant Center RSS 2.0 Feed)
  let feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SBS Store — Shyam Bombay Sale Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Daily household essentials, cleaning supplies, and kitchen utilities at wholesale and factory prices from Shyam Bombay Sale (SBS Store), Subhanpura, Vadodara, Gujarat.</description>
`;

  for (const p of safeProducts) {
    const prodUrl = `${BASE_URL}/product/${p.id}/`;
    const imgUrl = resolveProductImageUrl(p.image);
    const cleanDesc = (p.description || `${p.name} available at SBS Store (Shyam Bombay Sale) in Vadodara. 100% Quality Inspected.`).replace(/<[^>]*>?/gm, '');

    feedXml += `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(cleanDesc.slice(0, 990))}</g:description>
      <g:link>${prodUrl}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.in_stock !== false ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${Number(p.price || 0).toFixed(2)} INR</g:price>
      <g:brand>SBS Store</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>\n`;
  }

  feedXml += `  </channel>
</rss>\n`;

  const feedPath = path.join(projectRoot, 'public', 'feed.xml');
  fs.writeFileSync(feedPath, feedXml, 'utf8');
  console.log(`Saved public/feed.xml with ${safeProducts.length} merchant products.`);
}

run().catch((e) => {
  console.error('Fatal error generating SEO feeds:', e);
  process.exit(1);
});
