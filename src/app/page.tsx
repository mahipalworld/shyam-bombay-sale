'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FloatingQuickCart } from '@/components/FloatingQuickCart';
import { HomeView } from '@/components/views/HomeView';
import { CategoriesView } from '@/components/views/CategoriesView';
import { CartView } from '@/components/views/CartView';
import { WishlistView } from '@/components/views/WishlistView';
import { ProfileView } from '@/components/views/ProfileView';
import { AdminView } from '@/components/views/AdminView';

// Modals
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import { CheckoutModal } from '@/components/modals/CheckoutModal';
import { OrderDetailsModal } from '@/components/modals/OrderDetailsModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { OrdersListModal } from '@/components/modals/OrdersListModal';
import { AddressesModal } from '@/components/modals/AddressesModal';
import { CouponsModal } from '@/components/modals/CouponsModal';
import { CustomerNotificationsModal } from '@/components/modals/CustomerNotificationsModal';
import { NotificationRewardModal } from '@/components/modals/NotificationRewardPrompt';
import { HelpCenterModal } from '@/components/modals/HelpCenterModal';
import { RewardsModal } from '@/components/modals/RewardsModal';
import { CheckCircle2, AlertCircle, Info, Heart, ShoppingBag, ShieldCheck } from 'lucide-react';

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
    toast 
  } = useStore();

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
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  const getHeaderTitle = () => {
    if (activeTab === 'admin') return 'Admin Dashboard';
    return undefined;
  };

  const showBackButton = activeTab === 'categories' || activeTab === 'cart' || activeTab === 'wishlist';

  const handleBack = () => {
    if (activeTab === 'categories') {
      if (selectedSubcategoryFilter) {
        setSelectedSubcategoryFilter(null);
      } else {
        setActiveTab('home');
      }
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
      <main className={`flex-1 w-full ${activeTab === 'admin' ? 'w-full max-w-none px-0 py-0' : activeTab === 'categories' ? 'max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-1 sm:py-2' : 'max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-3'}`}>
        {renderActiveView()}
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
                    src="/logo.png?v=3"
                    alt="SBS — Shyam Business Store"
                    className="h-8 w-auto object-contain flex-shrink-0 bg-white/10 p-1 rounded-lg"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Everyday Essentials</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Smart Products. Better Prices. Everyday essentials curated for a modern and smarter home.
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
                  <li><a href="/about" className="py-1 inline-block hover:text-[#F95721] transition-colors">About SBS</a></li>
                  <li><a href="/contact" className="py-1 inline-block hover:text-[#F95721] transition-colors">Contact Us</a></li>
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Customer Support</h4>
                <ul className="space-y-1 text-gray-400">
                  <li><button onClick={() => setIsHelpCenterOpen(true)} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Help Center & Support</button></li>
                  <li><button onClick={() => setActiveTab('profile')} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Track Your Order</button></li>
                  <li><button onClick={() => setIsHelpCenterOpen(true)} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Return & Refund Policy</button></li>
                  <li><button onClick={() => setIsHelpCenterOpen(true)} className="py-1 inline-block hover:text-[#F95721] transition-colors text-left">Store Location & Directions</button></li>
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

            <div className="pt-6 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
              <p>© {new Date().getFullYear()} SBS Store. All rights reserved.</p>
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


      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white ${
            toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'info'
              ? 'bg-blue-600'
              : 'bg-gray-900/95 backdrop-blur-md'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-200" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-200" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductDetailModal />
      <CheckoutModal />
      <OrderDetailsModal />
      <EditProfileModal />
      <SearchModal />
      <OrdersListModal />
      <AddressesModal />
      <CouponsModal />
      <CustomerNotificationsModal />
      <NotificationRewardModal />
      <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
      <RewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />
    </div>
  );
}
