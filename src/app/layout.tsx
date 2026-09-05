import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/modals/AuthModal';
import { MobileNumberPromptModal } from '@/components/modals/MobileNumberPromptModal';
import { MobileBackHandler } from '@/components/MobileBackHandler';
import { FlyToCartAnimation } from '@/components/FlyToCartAnimation';
import { PWAProvider } from '@/context/PWAContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sbsstore.in'),
  title: {
    default: 'SBS STORE | Smart Products. Better Prices.',
    template: '%s | SBS Store',
  },
  description:
    'Shop smart everyday home, kitchen, cleaning, personal care, and storage essentials at unbeatable prices. Fast delivery across India, genuine products & easy 7-day returns.',
  keywords: [
    'SBS Store',
    'Shyam Bombay Sale',
    'sbsstore.in',
    'sbsshop',
    'SBS Vadodara',
    'SBS Store Vadodara',
    'Smart home essentials India',
    'Kitchen gadgets online India',
    'Mini washing machine portable',
    'Packet sealer machine handheld',
    'Sunset lamp price India',
    'Home cleaning products online',
    'Affordable online shopping India',
    'Daily utility gadgets',
    'Online shopping Vadodara Gujarat',
    'Cash on delivery shopping store',
    'Best home organizers online'
  ],
  authors: [{ name: 'SBS Store (Shyam Bombay Sale)' }],
  creator: 'Shyam Bombay Sale',
  publisher: 'SBS Store',
  applicationName: 'SBS Store',
  alternates: {
    canonical: 'https://www.sbsstore.in',
  },
  other: {
    'geo.region': 'IN-GJ',
    'geo.placename': 'Vadodara, Gujarat',
    'geo.position': '22.3072;73.1812',
    'ICBM': '22.3072, 73.1812',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBS Store',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
  },
  openGraph: {
    title: 'SBS STORE | Smart Products. Better Prices.',
    description:
      'Discover smart everyday essentials for home, kitchen, cleaning, and personal care with fast delivery and great discounts across India.',
    url: 'https://www.sbsstore.in',
    siteName: 'SBS Store',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS Store - Shyam Bombay Sale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBS STORE | Smart Products. Better Prices.',
    description:
      'Shop smart everyday essentials for cleaning, kitchen, and home at unbeatable prices on SBS Store.',
    images: ['https://www.sbsstore.in/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#F95721',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.sbsstore.in/#website',
      'url': 'https://www.sbsstore.in/',
      'name': 'SBS Store',
      'alternateName': ['Shyam Bombay Sale', 'SBS Store India', 'sbsstore.in'],
      'description': 'Smart Products. Better Prices. Everyday essentials shopping online.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://www.sbsstore.in/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': ['Store', 'OnlineStore'],
      '@id': 'https://www.sbsstore.in/#organization',
      'name': 'SBS Store (Shyam Bombay Sale)',
      'url': 'https://www.sbsstore.in',
      'logo': 'https://www.sbsstore.in/logo.png',
      'image': 'https://www.sbsstore.in/logo.png',
      'description': 'SBS Store offers high quality everyday smart utility, kitchen, cleaning, and lifestyle products at fair prices with fast nationwide delivery.',
      'telephone': '+91-9226294797',
      'email': 'shyambombaysale@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Shyam Bombay Sale, Laxmipura, Gorwa',
        'addressLocality': 'Vadodara',
        'addressRegion': 'Gujarat',
        'postalCode': '390023',
        'addressCountry': 'IN',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 22.3072,
        'longitude': 73.1812,
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'opens': '09:00',
          'closes': '21:00',
        },
      ],
      'priceRange': '₹99 - ₹2999',
      'currenciesAccepted': 'INR',
      'paymentAccepted': 'Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://www.sbsstore.in/#breadcrumbs',
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
          'name': 'Categories',
          'item': 'https://www.sbsstore.in/?category=all',
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Special Deals',
          'item': 'https://www.sbsstore.in/?category=offers',
        },
      ],
    },
    {
      '@type': 'ItemList',
      '@id': 'https://www.sbsstore.in/#popular-products',
      'name': 'Bestsellers & Smart Everyday Essentials',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'item': {
            '@type': 'Product',
            'name': 'Mini Washing Machine',
            'image': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
            'description': 'Compact portable ultrasonic mini washing machine with turbo spin technology.',
            'sku': 'SBS-P1-WASH',
            'brand': {
              '@type': 'Brand',
              'name': 'SBS Store',
            },
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': '4.6',
              'reviewCount': '128',
            },
            'offers': {
              '@type': 'Offer',
              'url': 'https://www.sbsstore.in/',
              'priceCurrency': 'INR',
              'price': '1499',
              'priceValidUntil': '2027-12-31',
              'itemCondition': 'https://schema.org/NewCondition',
              'availability': 'https://schema.org/InStock',
              'seller': {
                '@type': 'Organization',
                'name': 'SBS Store',
              },
            },
          },
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'item': {
            '@type': 'Product',
            'name': 'Romantic Sunset Projection Lamp',
            'image': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
            'description': '360-degree rotation aesthetic ambient sunset projection mood lamp.',
            'sku': 'SBS-P2-LAMP',
            'brand': {
              '@type': 'Brand',
              'name': 'SBS Store',
            },
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': '4.8',
              'reviewCount': '95',
            },
            'offers': {
              '@type': 'Offer',
              'url': 'https://www.sbsstore.in/',
              'priceCurrency': 'INR',
              'price': '399',
              'priceValidUntil': '2027-12-31',
              'itemCondition': 'https://schema.org/NewCondition',
              'availability': 'https://schema.org/InStock',
              'seller': {
                '@type': 'Organization',
                'name': 'SBS Store',
              },
            },
          },
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'item': {
            '@type': 'Product',
            'name': 'Portable Food Packet Sealer',
            'image': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
            'description': '2-in-1 handheld heat sealer and bag cutter with magnetic base.',
            'sku': 'SBS-P3-SEALER',
            'brand': {
              '@type': 'Brand',
              'name': 'SBS Store',
            },
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': '4.5',
              'reviewCount': '210',
            },
            'offers': {
              '@type': 'Offer',
              'url': 'https://www.sbsstore.in/',
              'priceCurrency': 'INR',
              'price': '199',
              'priceValidUntil': '2027-12-31',
              'itemCondition': 'https://schema.org/NewCondition',
              'availability': 'https://schema.org/InStock',
              'seller': {
                '@type': 'Organization',
                'name': 'SBS Store',
              },
            },
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#F8F9FA] text-gray-900 min-h-screen antialiased selection:bg-[#F95721] selection:text-white">
        <PWAProvider>
          <AuthProvider>
            <StoreProvider>
              <MobileBackHandler />
              <FlyToCartAnimation />
              {children}
              <AuthModal />
              <MobileNumberPromptModal />
            </StoreProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
