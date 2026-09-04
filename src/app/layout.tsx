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
    'Smart home essentials',
    'Kitchen gadgets online India',
    'Mini washing machine online',
    'Packet sealer machine',
    'Sunset lamp price',
    'Home cleaning products',
    'Affordable online shopping India',
    'Daily utility gadgets',
    'Online shopping Vadodara Gujarat'
  ],
  authors: [{ name: 'SBS Store (Shyam Bombay Sale)' }],
  creator: 'Shyam Bombay Sale',
  publisher: 'SBS Store',
  applicationName: 'SBS Store',
  alternates: {
    canonical: 'https://www.sbsstore.in',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBS Store',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
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
  maximumScale: 1,
  userScalable: false,
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
      'alternateName': ['Shyam Bombay Sale', 'SBS Store India'],
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
      'description': 'SBS Store offers high quality everyday smart utility, kitchen, cleaning, and lifestyle products at fair prices.',
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
      'priceRange': '₹99 - ₹2999',
      'currenciesAccepted': 'INR',
      'paymentAccepted': 'Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking',
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
