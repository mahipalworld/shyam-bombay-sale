'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/components/views/HomeView';
import { CategoriesView } from '@/components/views/CategoriesView';
import { CartView } from '@/components/views/CartView';
import { WishlistView } from '@/components/views/WishlistView';
import { ProfileView } from '@/components/views/ProfileView';
import { AdminView } from '@/components/views/AdminView';
import { MyOrdersView } from '@/components/views/MyOrdersView';

import { Heart, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter, 
    selectedSubcategoryFilter,
    setSelectedSubcategoryFilter,
    setActiveTab,
    isHelpCenterOpen,
    setIsHelpCenterOpen,
    isRewardsOpen,
    setIsRewardsOpen,
    products,
    setSelectedProductDetail,
    toast 
  } = useStore();

  // Read URL query parameters (?tab=categories&category=...) on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const catParam = urlParams.get('category');
    const prodParam = urlParams.get('product');

    if (tabParam && ['home', 'categories', 'cart', 'wishlist', 'profile', 'orders', 'admin'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    if (catParam) {
      setSelectedCategoryFilter(catParam);
      if (!tabParam) setActiveTab('categories');
    }
    if (prodParam && products.length > 0) {
      const found = products.find((p) => p.id === prodParam);
      if (found) setSelectedProductDetail(found);
    }
  }, [products, setActiveTab, setSelectedCategoryFilter, setSelectedProductDetail]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'categories':
        return <CategoriesView />;
      case 'cart':
        return <CartView />;
      case 'wishlist':
        return <WishlistView />;
      case 'profile':
        return <ProfileView />;
      case 'orders':
        return <MyOrdersView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  const getHeaderTitle = () => {
    if (activeTab === 'admin') return 'Admin Dashboard';
    if (activeTab === 'orders') return 'My Orders';
    return undefined;
  };

  const showBackButton = activeTab === 'categories' || activeTab === 'cart' || activeTab === 'wishlist' || activeTab === 'orders';

  const handleBack = () => {
    if (activeTab === 'orders') {
      setActiveTab('profile');
    } else if (activeTab === 'categories') {
      setActiveTab('home');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#F95721] selection:text-white">
      {/* Top Header */}
      {activeTab !== 'admin' && (
        <Header 
          title={getHeaderTitle()} 
          showBack={showBackButton}
          onBack={handleBack}
        />
      )}

      {/* Main Content Area - Expands comfortably on Desktop and Mobile */}
      <main className={`flex-1 w-full ${activeTab === 'admin' ? 'w-full max-w-none px-0 py-0' : activeTab === 'categories' ? 'w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-6 py-0 sm:py-2 pb-0 md:pb-6 overflow-hidden' : activeTab === 'home' ? 'max-w-6xl mx-auto px-2 sm:px-4 md:px-8 pt-0.5 sm:pt-1.5 pb-36 sm:pb-40 md:pb-8' : 'max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-3 pb-36 sm:pb-40 md:pb-8'}`}>
        {activeTab === 'admin' ? (
          renderActiveView()
        ) : (
          <div key={activeTab} className="animate-page-enter w-full">
            {renderActiveView()}
          </div>
        )}
      </main>

      {/* Desktop Footer - Shown on home, cart, wishlist, profile */}
      {activeTab !== 'admin' && activeTab !== 'categories' && (
        <footer className="hidden md:block bg-[#111827] text-white pt-12 pb-8 mt-16 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
            <div className="grid grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/sbs-wordmark.svg"
                    alt="SBS Store — Shyam Bombay Sale"
                    className="h-7 w-auto object-contain flex-shrink-0"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Everyday Essentials</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Smart Products. Better Prices. Everyday essentials curated for a modern and smarter home by Shyam Bombay Sale (SBS Store).
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Links</h4>
                <ul className="space-y-1 text-gray-400">
                  <li><button onClick={() => { setSelectedCategoryFilter(null); setActiveTab('home'); }} className="py-1 inline-block hover:text-[#F95721] transition-colors">Home</button></li>
                  <li><button onClick={() => { setSelectedCategoryFilter(null); setActiveTab('categories'); }} className="py-1 inline-block hover:text-[#F95721] transition-colors">All Categories</button></li>
                  <li><button onClick={() => { setSelectedCategoryFilter('offers'); setActiveTab('categories'); }} className="py-1 inline-block hover:text-[#F95721] transition-colors">Today&apos;s Deals</button></li>
                  <li><button onClick={() => setActiveTab('wishlist')} className="py-1 inline-block hover:text-[#F95721] transition-colors">Wishlist</button></li>
                  {/* Crawlable anchor links for Google — do not replace with buttons */}
                  <li><a href="/about" className="py-1 inline-block hover:text-[#F95721] transition-colors">About Shyam Bombay Sale</a></li>
                  <li><a href="/contact" className="py-1 inline-block hover:text-[#F95721] transition-colors">Store Location &amp; Contact</a></li>
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Customer Support &amp; Legal</h4>
                <ul className="space-y-1 text-gray-400">
                  <li><button onClick={() => setIsHelpCenterOpen(true)} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Help Center &amp; Support</button></li>
                  <li><button onClick={() => setActiveTab('profile')} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Track Your Order</button></li>
                  <li><a href="/refund-policy" className="py-1 inline-block hover:text-[#F95721] transition-colors">Return &amp; Refund Policy</a></li>
                  <li><a href="/shipping-policy" className="py-1 inline-block hover:text-[#F95721] transition-colors">Shipping &amp; Delivery Policy</a></li>
                  <li><a href="/terms" className="py-1 inline-block hover:text-[#F95721] transition-colors">Terms &amp; Conditions</a></li>
                  <li><a href="/privacy" className="py-1 inline-block hover:text-[#F95721] transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">100% Secure Shopping</h4>
                <p className="text-gray-400 text-[11px]">
                  UPI, Netbanking, Credit/Debit Cards, Cash on Delivery with safe 256-bit encryption.
                </p>
                <div className="pt-2 flex items-center gap-2 text-gray-400">
                  <ShieldCheck className="w-5 h-5 text-[#00A859]" />
                  <span className="text-[11px] font-semibold text-gray-300">SBS Buyer Protection Guaranteed</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
              <div className="flex flex-wrap items-center gap-3">
                <p>© {new Date().getFullYear()} SBS Store — Shyam Bombay Sale. All rights reserved.</p>
                <span className="hidden md:inline text-gray-600">•</span>
                <a href="/terms" className="hover:text-[#F95721] transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-[#F95721] transition-colors">Privacy</a>
                <a href="/refund-policy" className="hover:text-[#F95721] transition-colors">Refunds</a>
                <a href="/shipping-policy" className="hover:text-[#F95721] transition-colors">Shipping</a>
              </div>
              <p className="flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 fill-[#F95721] text-[#F95721]" /> for Smart Living</p>
            </div>
          </div>
        </footer>
      )}

      {/* Bottom Floating Navigation with Integrated Docked Quick-Cart (Mobile Only) */}
      {activeTab !== 'admin' && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
