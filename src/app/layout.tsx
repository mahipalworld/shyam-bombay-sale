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
  title: 'SBS STORE | Smart Products. Better Prices.',
  description: 'Shop smart everyday essentials for cleaning, kitchen, personal care, laundry, storage, and home at unbeatable prices.',
  keywords: ['SBS Store', 'Everyday essentials', 'Smart products', 'Mini washing machine', 'Packet sealer', 'Home products'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBS',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SBS STORE | Smart Products. Better Prices.',
    description: 'Shop smart everyday essentials at unbeatable prices with fast delivery.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F35C16',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FA] text-gray-900 min-h-screen antialiased selection:bg-[#F35C16] selection:text-white">
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
