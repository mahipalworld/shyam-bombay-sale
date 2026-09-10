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
    default: 'SBS — Shyam Bombay Sale | Official Store & Online Shopping',
    template: '%s | SBS Store — Shyam Bombay Sale',
  },
  description:
    'Official website of SBS — Shyam Bombay Sale (Shyam Business Store). Shop smart everyday essentials: home, kitchen, household cleaning supplies, personal care, and more in Vadodara and across India.',
  keywords: [
    'Shyam Bombay Sale',
    'Shyam Bombay Sale Vadodara',
    'Shyam Bombay Sale Subhanpura',
    'SBS Store',
    'SBS',
    'Shyam Business Store',
    'household cleaning product dealer Vadodara',
    'kitchen essentials Vadodara',
    'home essentials store Vadodara',
    'sbsstore.in',
  ],
  authors: [{ name: 'Shyam Bombay Sale (SBS)' }],
  creator: 'Shyam Bombay Sale',
  publisher: 'Shyam Bombay Sale',
  applicationName: 'SBS Store',
  alternates: {
    canonical: 'https://www.sbsstore.in',
  },
  other: {
    'geo.region': 'IN-GJ',
    'geo.placename': 'Subhanpura, Vadodara, Gujarat',
    'geo.position': '22.3323;73.1612',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBS Store',
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'SBS — Shyam Bombay Sale | Official Store & Online Shopping',
    description:
      'SBS — Shyam Bombay Sale (Shyam Business Store) offers smart everyday essentials for home, kitchen, cleaning, and personal care. Genuine products, fair prices, delivered across India.',
    url: 'https://www.sbsstore.in',
    siteName: 'SBS — Shyam Bombay Sale',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS — Shyam Bombay Sale Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBS — Shyam Bombay Sale | Official Store & Online Shopping',
    description:
      'Smart everyday essentials for home, kitchen, cleaning, and personal care. Official website of SBS — Shyam Bombay Sale.',
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

// Structured data linking online brand with offline Google Business Profile
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.sbsstore.in/#website',
      'url': 'https://www.sbsstore.in/',
      'name': 'Shyam Bombay Sale | SBS Store',
      'alternateName': ['Shyam Bombay Sale', 'SBS Store', 'SBS', 'Shyam Business Store', 'sbsstore.in'],
      'description': 'Official website of Shyam Bombay Sale (SBS Store). Smart everyday essentials for home, kitchen, cleaning, and personal care.',
      'inLanguage': 'en-IN',
    },
    {
      '@type': ['Store', 'LocalBusiness', 'Organization'],
      '@id': 'https://www.sbsstore.in/#organization',
      'name': 'Shyam Bombay Sale',
      'alternateName': ['SBS', 'SBS Store', 'Shyam Business Store'],
      'url': 'https://www.sbsstore.in',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.sbsstore.in/logo.png',
        'width': 800,
        'height': 600,
      },
      'image': 'https://www.sbsstore.in/logo.png',
      'description': 'Shyam Bombay Sale (SBS) offers quality everyday essentials for home, kitchen, cleaning, and personal care with genuine products and fair prices.',
      'telephone': '+91-9226294797',
      'email': 'shyambombaysale@gmail.com',
      'hasMap': 'https://share.google/Pa5CkR6pMiRD0MMZm',
      'sameAs': [
        'https://www.google.com/search?kgmid=/g/11ymlwg3wd&q=Shyam+Bombay+sale',
      ],
      'priceRange': '₹',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura',
        'addressLocality': 'Vadodara',
        'addressRegion': 'Gujarat',
        'postalCode': '390023',
        'addressCountry': 'IN',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 22.3323,
        'longitude': 73.1612,
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          'opens': '10:00',
          'closes': '21:30',
        },
      ],
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
          'name': 'About',
          'item': 'https://www.sbsstore.in/about',
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Contact',
          'item': 'https://www.sbsstore.in/contact',
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
