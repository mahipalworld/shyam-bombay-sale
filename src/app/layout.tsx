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
    default: 'SBS — Shyam Business Store | Official Website',
    template: '%s | SBS Store',
  },
  description:
    'SBS — Shyam Business Store is your destination for smart everyday essentials: home, kitchen, cleaning, personal care, and more. Quality products, genuine service, delivered across India.',
  authors: [{ name: 'SBS — Shyam Business Store' }],
  creator: 'SBS — Shyam Business Store',
  publisher: 'SBS — Shyam Business Store',
  applicationName: 'SBS Store',
  alternates: {
    canonical: 'https://www.sbsstore.in',
  },
  other: {
    'geo.region': 'IN-GJ',
    'geo.placename': 'Vadodara, Gujarat',
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
    title: 'SBS — Shyam Business Store | Official Website',
    description:
      'SBS — Shyam Business Store offers smart everyday essentials for home, kitchen, cleaning, and personal care. Genuine products, fair prices, delivered across India.',
    url: 'https://www.sbsstore.in',
    siteName: 'SBS — Shyam Business Store',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS — Shyam Business Store Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBS — Shyam Business Store | Official Website',
    description:
      'Smart everyday essentials for home, kitchen, cleaning, and personal care. Official website of SBS — Shyam Business Store.',
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

// Structured data — Phase 1 (Brand Foundation).
// Address kept at city-level until location conflict is resolved (see implementation_plan.md §3B).
// Fake product ItemList removed — products are not ready.
// Update this when: (a) location is confirmed, (b) social profiles exist, (c) products launch.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.sbsstore.in/#website',
      'url': 'https://www.sbsstore.in/',
      'name': 'SBS — Shyam Business Store',
      'alternateName': ['SBS Store', 'sbsstore.in'],
      'description': 'Official website of SBS — Shyam Business Store. Smart everyday essentials for home, kitchen, cleaning, and personal care.',
      'inLanguage': 'en-IN',
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.sbsstore.in/#organization',
      'name': 'SBS — Shyam Business Store',
      'alternateName': 'SBS',
      'url': 'https://www.sbsstore.in',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.sbsstore.in/logo.png',
        'width': 800,
        'height': 600,
      },
      'image': 'https://www.sbsstore.in/logo.png',
      'description': 'SBS — Shyam Business Store offers quality everyday essentials for home, kitchen, cleaning, and personal care with genuine products and fair prices.',
      'telephone': '+91-9226294797',
      'email': 'shyambombaysale@gmail.com',
      // NOTE: Full streetAddress, postalCode, and geo coordinates withheld
      // pending resolution of location conflict (Gotri vs Laxmipura-Gorwa).
      // Add confirmed values here once verified.
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Vadodara',
        'addressRegion': 'Gujarat',
        'addressCountry': 'IN',
      },
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
