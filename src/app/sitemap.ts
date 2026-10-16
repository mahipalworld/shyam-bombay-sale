import { MetadataRoute } from 'next';
import { getAllProducts, getAllCategories } from '@/lib/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.sbsstore.in';
  const now = new Date();

  // 1. Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping-policy/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Category pages
  const categories = await getAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.id}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // 3. Product pages
  const products = await getAllProducts();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/product/${p.id}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
