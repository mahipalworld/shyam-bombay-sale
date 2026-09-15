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
    default: 'SBS Store — Shyam Bombay Sale | Official Online Shopping & Store Vadodara',
    template: '%s | SBS Store — Shyam Bombay Sale',
  },
  description:
    'SBS Store (Shyam Bombay Sale) — Official online shopping & retail store in Subhanpura, Vadodara. Shop smart everyday essentials: home, kitchenware, household cleaning supplies & personal care at factory prices with fast delivery across India.',
  keywords: [
    'SBS Store',
    'sbs store',
    'Shyam Bombay Sale',
    'shyam bombay sale',
    'Shyam Bombay Sale Vadodara',
    'SBS Store Vadodara',
    'SBS Vadodara',
    'Shyam Bombay Store',
    'SBS Subhanpura',
    'Shyam Bombay Sale Subhanpura',
    'SBS',
    'SBS online shopping',
    'Shyam Business Store',
    'household cleaning product dealer Vadodara',
    'household cleaning products Vadodara',
    'kitchen essentials Vadodara',
    'home essentials store Vadodara',
    'daily essentials online shopping India',
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
    title: 'SBS Store — Shyam Bombay Sale | Official Online Shopping Vadodara',
    description:
      'Official website of Shyam Bombay Sale (SBS Store). Shop smart everyday essentials for home, kitchen, cleaning, and personal care. Genuine products, fair prices in Vadodara & delivered across India.',
    url: 'https://www.sbsstore.in',
    siteName: 'SBS Store — Shyam Bombay Sale',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS Store — Shyam Bombay Sale Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBS Store — Shyam Bombay Sale | Official Online Shopping Vadodara',
    description:
      'Smart everyday essentials for home, kitchen, cleaning, and personal care. Official website of SBS Store — Shyam Bombay Sale.',
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

// Structured data linking online brand with offline Google Business Profile & Justdial listing
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.sbsstore.in/#website',
      'url': 'https://www.sbsstore.in/',
      'name': 'SBS Store — Shyam Bombay Sale',
      'alternateName': [
        'SBS Store',
        'Shyam Bombay Sale',
        'SBS',
        'SBS Vadodara',
        'Shyam Bombay Sale Vadodara',
        'Shyam Business Store',
        'sbsstore.in',
      ],
      'description':
        'Official website of SBS Store (Shyam Bombay Sale). Smart everyday essentials for home, kitchen, cleaning, and personal care in Vadodara and across India.',
      'inLanguage': 'en-IN',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://www.sbsstore.in/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': ['Store', 'LocalBusiness', 'Organization'],
      '@id': 'https://www.sbsstore.in/#organization',
      'name': 'Shyam Bombay Sale',
      'legalName': 'Shyam Bombay Sale',
      'alternateName': [
        'SBS Store',
        'SBS',
        'SBS Vadodara',
        'Shyam Bombay Sale Vadodara',
        'Shyam Business Store',
        'sbsstore.in',
      ],
      'url': 'https://www.sbsstore.in',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.sbsstore.in/logo.png',
        'width': 800,
        'height': 600,
      },
      'image': [
        'https://www.sbsstore.in/logo.png',
        'https://www.sbsstore.in/icon-512x512.png',
      ],
      'description':
        'Shyam Bombay Sale (SBS Store) offers quality everyday essentials for home, kitchen, cleaning, and personal care with genuine products and fair wholesale & retail prices in Subhanpura, Vadodara, Gujarat.',
      'telephone': '+91-9226294797',
      'email': 'shyambombaysale@gmail.com',
      'hasMap': 'https://share.google/Pa5CkR6pMiRD0MMZm',
      'sameAs': [
        'https://www.google.com/search?kgmid=/g/11ymlwg3wd&q=Shyam+Bombay+sale',
        'https://www.justdial.com/Vadodara/Shyam-Bombay-Sale-Subhanpura/0265PX265-X265-260124041911-U8Y6_BZDET',
      ],
      'priceRange': '₹',
      'currenciesAccepted': 'INR',
      'paymentAccepted': 'Cash, UPI, Credit Card, Debit Card, Net Banking',
      'areaServed': [
        { '@type': 'City', 'name': 'Vadodara' },
        { '@type': 'AdministrativeArea', 'name': 'Gujarat' },
        { '@type': 'Country', 'name': 'India' },
      ],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress':
          'Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura',
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
      '@type': 'FAQPage',
      '@id': 'https://www.sbsstore.in/#faq',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Where is Shyam Bombay Sale (SBS Store) located in Vadodara?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'Shyam Bombay Sale is located at Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat 390023. The physical store is open Monday through Sunday from 10:00 AM to 9:30 PM.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What products does SBS Store — Shyam Bombay Sale offer?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'SBS Store offers a comprehensive range of everyday essentials including household cleaning products, kitchen gadgets, organizers, home storage utilities, and personal care products at affordable factory-direct prices.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Can I order online from Shyam Bombay Sale for home delivery?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'Yes! You can shop directly online at sbsstore.in. We offer fast doorstep delivery across Vadodara and reliable shipping throughout Gujarat and all across India.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What payment methods are supported at SBS Store?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'SBS Store accepts all major payment methods including UPI (Google Pay, PhonePe, Paytm), Debit/Credit cards, Net Banking, and Cash on Delivery (COD) for eligible locations.',
          },
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
