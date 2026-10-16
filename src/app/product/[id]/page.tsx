import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductById, getProductsByCategory } from '@/lib/catalog';
import { ProductPageView } from '@/components/views/ProductPageView';
import { ArrowLeft } from 'lucide-react';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Generate static HTML for every active product at build time
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({
    id: p.id,
  }));
}

// Dynamic SEO metadata per product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | SBS Store — Shyam Bombay Sale',
      description: 'The requested product could not be found at SBS Store.',
      robots: { index: false, follow: true },
    };
  }

  const categoryName = product.category
    .replace(/--/g, ' & ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const title = `${product.name} — Best Price & Genuine Quality | SBS Store Vadodara`;
  const description = product.description 
    ? `${product.name} at ₹${product.price} (MRP: ₹${product.originalPrice}). ${product.description.slice(0, 120)}... 100% Quality Inspected by SBS Store Subhanpura, Vadodara.`
    : `Buy ${product.name} at ₹${product.price} (MRP: ₹${product.originalPrice}). Genuine everyday essential in ${categoryName}. Verified quality by SBS Store Vadodara with fast delivery across India.`;

  const canonicalUrl = `https://www.sbsstore.in/product/${product.id}/`;
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `https://www.sbsstore.in${product.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} — ₹${product.price} | SBS Store`,
      description,
      url: canonicalUrl,
      siteName: 'SBS Store — Shyam Bombay Sale',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ₹${product.price} | SBS Store`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
          <h1 className="text-xl font-black text-gray-900">Product Not Found</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            This item may be temporarily out of stock or relocated. Explore all available everyday essentials on our storefront.
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

  const related = await getProductsByCategory(product.category);
  const filteredRelated = related.filter((p) => p.id !== product.id).slice(0, 4);

  // Clean schema.org/Product structured data — strictly compliant with no fake reviews
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://www.sbsstore.in/product/${product.id}/#product`,
    'name': product.name,
    'description': product.description || `${product.name} at SBS Store (Shyam Bombay Sale).`,
    'image': product.images && product.images.length > 0 ? product.images : [product.image],
    'sku': product.id,
    'mpn': product.barcode || product.id,
    'brand': {
      '@type': 'Brand',
      'name': 'SBS Store',
    },
    'category': product.category,
    'offers': {
      '@type': 'Offer',
      'url': `https://www.sbsstore.in/product/${product.id}/`,
      'priceCurrency': 'INR',
      'price': product.price,
      'priceValidUntil': '2027-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Shyam Bombay Sale',
        'url': 'https://www.sbsstore.in',
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'IN',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 7,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn',
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': '0',
          'currency': 'INR',
        },
        'shippingDestination': [
          {
            '@type': 'DefinedRegion',
            'addressCountry': 'IN',
          },
        ],
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 1,
            'unitCode': 'd',
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 1,
            'maxValue': 4,
            'unitCode': 'd',
          },
        },
      },
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
        'name': product.category,
        'item': `https://www.sbsstore.in/category/${product.category}/`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://www.sbsstore.in/product/${product.id}/`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageView product={product} relatedProducts={filteredRelated} />
    </>
  );
}
