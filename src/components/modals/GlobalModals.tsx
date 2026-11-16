'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

// Lazy-load all modals dynamically so zero modal JS is loaded on initial page visit
const ProductDetailModal = dynamic(
  () => import('@/components/modals/ProductDetailModal').then((m) => m.ProductDetailModal),
  { ssr: false }
);
const CheckoutModal = dynamic(
  () => import('@/components/modals/CheckoutModal').then((m) => m.CheckoutModal),
  { ssr: false }
);
const OrderDetailsModal = dynamic(
  () => import('@/components/modals/OrderDetailsModal').then((m) => m.OrderDetailsModal),
  { ssr: false }
);
const EditProfileModal = dynamic(
  () => import('@/components/modals/EditProfileModal').then((m) => m.EditProfileModal),
  { ssr: false }
);
const SearchModal = dynamic(
  () => import('@/components/modals/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
const AddressesModal = dynamic(
  () => import('@/components/modals/AddressesModal').then((m) => m.AddressesModal),
  { ssr: false }
);
const CouponsModal = dynamic(
  () => import('@/components/modals/CouponsModal').then((m) => m.CouponsModal),
  { ssr: false }
);
const CustomerNotificationsModal = dynamic(
  () => import('@/components/modals/CustomerNotificationsModal').then((m) => m.CustomerNotificationsModal),
  { ssr: false }
);
const NotificationRewardModal = dynamic(
  () => import('@/components/modals/NotificationRewardPrompt').then((m) => m.NotificationRewardModal),
  { ssr: false }
);
const HelpCenterModal = dynamic(
  () => import('@/components/modals/HelpCenterModal').then((m) => m.HelpCenterModal),
  { ssr: false }
);
const RewardsModal = dynamic(
  () => import('@/components/modals/RewardsModal').then((m) => m.RewardsModal),
  { ssr: false }
);

export const GlobalModals: React.FC = () => {
  const {
    isHelpCenterOpen,
    setIsHelpCenterOpen,
    isRewardsOpen,
    setIsRewardsOpen,
    selectedProductDetail,
    isCheckoutOpen,
    selectedOrderForModal,
    isEditProfileOpen,
    isSearchOpen,
    isAddressesOpen,
    isCouponsOpen,
    isUserNotificationsModalOpen,
    isNotificationPromptOpen,
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
                ? 'bg-red-600/95 shadow-red-900/20'
                : toast.type === 'info'
                ? 'bg-blue-600/95 shadow-blue-900/20'
                : 'bg-gray-900/95 shadow-gray-900/20'
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

      {/* On-Demand Dynamic Application Modals */}
      {selectedProductDetail && <ProductDetailModal />}
      {isCheckoutOpen && <CheckoutModal />}
      {selectedOrderForModal && <OrderDetailsModal />}
      {isEditProfileOpen && <EditProfileModal />}
      {isSearchOpen && <SearchModal />}
      {isAddressesOpen && <AddressesModal />}
      {isCouponsOpen && <CouponsModal />}
      {isUserNotificationsModalOpen && <CustomerNotificationsModal />}
      {isNotificationPromptOpen && <NotificationRewardModal />}
      {isHelpCenterOpen && <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />}
      {isRewardsOpen && <RewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />}
    </>
  );
};
