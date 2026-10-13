'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MyOrdersView } from '@/components/views/MyOrdersView';
import { useStore } from '@/context/StoreContext';
import { OrderDetailsModal } from '@/components/modals/OrderDetailsModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { HelpCenterModal } from '@/components/modals/HelpCenterModal';

export default function OrdersPage() {
  const { setActiveTab, isHelpCenterOpen, setIsHelpCenterOpen } = useStore();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-[#F95721] selection:text-white">
      <Header
        title="My Orders"
        showBack={true}
        onBack={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            setActiveTab('home');
          }
        }}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-36 md:pb-12">
        <MyOrdersView />
      </main>

      <BottomNav />

      {/* Global Modals */}
      <OrderDetailsModal />
      <SearchModal />
      <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
    </div>
  );
}
