'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductDetailModal } from '@/components/modals/ProductDetailModal';
import { CheckoutModal } from '@/components/modals/CheckoutModal';
import { OrderDetailsModal } from '@/components/modals/OrderDetailsModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { AddressesModal } from '@/components/modals/AddressesModal';
import { CouponsModal } from '@/components/modals/CouponsModal';
import { CustomerNotificationsModal } from '@/components/modals/CustomerNotificationsModal';
import { NotificationRewardModal } from '@/components/modals/NotificationRewardPrompt';
import { HelpCenterModal } from '@/components/modals/HelpCenterModal';
import { RewardsModal } from '@/components/modals/RewardsModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const GlobalModals: React.FC = () => {
  const {
    isHelpCenterOpen,
    setIsHelpCenterOpen,
    isRewardsOpen,
    setIsRewardsOpen,
    toast,
  } = useStore();

  return (
    <>
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[99999] animate-bounce-subtle pointer-events-none">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-white text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-600/95 backdrop-blur-md'
                : toast.type === 'info'
                ? 'bg-blue-600/95 backdrop-blur-md'
                : 'bg-gray-900/95 backdrop-blur-md'
            }`}
          >
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

      {/* Global Application Modals */}
      <ProductDetailModal />
      <CheckoutModal />
      <OrderDetailsModal />
      <EditProfileModal />
      <SearchModal />
      <AddressesModal />
      <CouponsModal />
      <CustomerNotificationsModal />
      <NotificationRewardModal />
      <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
      <RewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />
    </>
  );
};
