import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getCategoryById, getProductsByCategory } from '@/lib/catalog';
import { CategoryPageView } from '@/components/views/CategoryPageView';
import { ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryById(params.id);

  if (!category) {
    return {
      title: 'Category Not Found | SBS Store — Shyam Bombay Sale',
      description: 'The requested category could not be found.',
      robots: { index: false, follow: true },
    };
  }

  const title = `${category.name} — Buy Online at Factory Prices | SBS Store Vadodara`;
  const description = `Shop ${category.name} at SBS Store (Shyam Bombay Sale). Everyday household essentials, cleaning supplies & utilities in Subhanpura, Vadodara. Fast delivery across India.`;
  const canonicalUrl = `https://www.sbsstore.in/category/${category.id}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'SBS Store — Shyam Bombay Sale',
      type: 'website',
      images: [
        {
          url: category.image.startsWith('http') ? category.image : `https://www.sbsstore.in${category.image}`,
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryById(params.id);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
          <h1 className="text-xl font-black text-gray-900">Category Not Found</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The category you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    );
  }

  const [products, allCategories] = await Promise.all([
    getProductsByCategory(category.id),
    getAllCategories(),
  ]);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://www.sbsstore.in/category/${category.id}/#webpage`,
    'url': `https://www.sbsstore.in/category/${category.id}/`,
    'name': `${category.name} — SBS Store`,
    'description': `Shop ${category.name} at SBS Store (Shyam Bombay Sale), Vadodara.`,
    'isPartOf': {
      '@id': 'https://www.sbsstore.in/#website',
    },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': products.slice(0, 20).map((p, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'url': `https://www.sbsstore.in/product/${p.id}/`,
        'name': p.name,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.sbsstore.in/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': category.name,
        'item': `https://www.sbsstore.in/category/${category.id}/`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageView category={category} products={products} allCategories={allCategories} />
    </>
  );
}
