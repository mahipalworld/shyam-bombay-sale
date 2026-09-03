'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';

export const MobileBackHandler: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeSubcategoryModal,
    setActiveSubcategoryModal,
    selectedProductDetail,
    setSelectedProductDetail,
    isCheckoutOpen,
    setIsCheckoutOpen,
    selectedOrderForModal,
    setSelectedOrderForModal,
    isSearchOpen,
    setIsSearchOpen,
    isEditProfileOpen,
    setIsEditProfileOpen,
    isAddressesOpen,
    setIsAddressesOpen,
    isCouponsOpen,
    setIsCouponsOpen,
    isUserNotificationsModalOpen,
    setIsUserNotificationsModalOpen,
    orderListFilter,
    setOrderListFilter,
    showToast,
  } = useStore();

  const {
    isAuthModalOpen,
    closeAuthModal,
    isPhonePromptOpen,
    closePhonePrompt,
  } = useAuth();

  const lastBackPressTimeRef = useRef<number>(0);
  const isPopstateHandlingRef = useRef(false);

  // Track previous state of modal openings to push history entries when a new layer opens
  const prevStatesRef = useRef({
    productDetail: Boolean(selectedProductDetail),
    subcategoryModal: Boolean(activeSubcategoryModal),
    checkout: isCheckoutOpen,
    search: isSearchOpen,
    userNotifications: isUserNotificationsModalOpen,
    orderModal: Boolean(selectedOrderForModal),
    orderList: Boolean(orderListFilter),
    editProfile: isEditProfileOpen,
    addresses: isAddressesOpen,
    coupons: isCouponsOpen,
    authModal: isAuthModalOpen,
    phonePrompt: isPhonePromptOpen,
    tab: activeTab,
  });

  // Whenever a modal/screen OPENS, push an entry to browser history
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prev = prevStatesRef.current;
    const curr = {
      productDetail: Boolean(selectedProductDetail),
      subcategoryModal: Boolean(activeSubcategoryModal),
      checkout: isCheckoutOpen,
      search: isSearchOpen,
      userNotifications: isUserNotificationsModalOpen,
      orderModal: Boolean(selectedOrderForModal),
      orderList: Boolean(orderListFilter),
      editProfile: isEditProfileOpen,
      addresses: isAddressesOpen,
      coupons: isCouponsOpen,
      authModal: isAuthModalOpen,
      phonePrompt: isPhonePromptOpen,
      tab: activeTab,
    };

    // If change was triggered by popstate, simply update tracking and don't push duplicate history
    if (isPopstateHandlingRef.current) {
      prevStatesRef.current = curr;
      isPopstateHandlingRef.current = false;
      return;
    }

    // Did any modal or sub-view open?
    if (
      (!prev.productDetail && curr.productDetail) ||
      (!prev.subcategoryModal && curr.subcategoryModal) ||
      (!prev.checkout && curr.checkout) ||
      (!prev.search && curr.search) ||
      (!prev.userNotifications && curr.userNotifications) ||
      (!prev.orderModal && curr.orderModal) ||
      (!prev.orderList && curr.orderList) ||
      (!prev.editProfile && curr.editProfile) ||
      (!prev.addresses && curr.addresses) ||
      (!prev.coupons && curr.coupons) ||
      (!prev.authModal && curr.authModal) ||
      (!prev.phonePrompt && curr.phonePrompt) ||
      (prev.tab === 'home' && curr.tab !== 'home')
    ) {
      window.history.pushState({ sbsNav: true }, '');
    }

    prevStatesRef.current = curr;
  }, [
    selectedProductDetail,
    activeSubcategoryModal,
    isCheckoutOpen,
    isSearchOpen,
    isUserNotificationsModalOpen,
    selectedOrderForModal,
    orderListFilter,
    isEditProfileOpen,
    isAddressesOpen,
    isCouponsOpen,
    isAuthModalOpen,
    isPhonePromptOpen,
    activeTab,
  ]);

  // Global phone hardware & swipe back button listener (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.history.state) {
      window.history.replaceState({ sbsRoot: true }, '');
    }

    const handlePopState = () => {
      isPopstateHandlingRef.current = true;

      // 1. Priority 1: Topmost Product Detail Modal (closes product detail, keeps search results or subcategory drawer intact!)
      if (selectedProductDetail) {
        setSelectedProductDetail(null);
        return;
      }

      // 2. Priority 2: Full-screen transaction & account modals
      if (isCheckoutOpen) { setIsCheckoutOpen(false); return; }
      if (selectedOrderForModal) { setSelectedOrderForModal(null); return; }
      if (orderListFilter) { setOrderListFilter(null); return; }
      if (isEditProfileOpen) { setIsEditProfileOpen(false); return; }
      if (isAddressesOpen) { setIsAddressesOpen(false); return; }
      if (isCouponsOpen) { setIsCouponsOpen(false); return; }
      if (isAuthModalOpen) { closeAuthModal(); return; }
      if (isPhonePromptOpen) { closePhonePrompt(); return; }

      // 3. Priority 3: Search & Notifications Modal
      if (isUserNotificationsModalOpen) {
        setIsUserNotificationsModalOpen(false);
        return;
      }
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return;
      }

      // 4. Priority 4: Subcategory Products Drawer
      if (activeSubcategoryModal) {
        setActiveSubcategoryModal(null);
        return;
      }

      // 5. Priority 5: Tab level navigation (Categories / Cart / Wishlist / Profile -> Home)
      if (activeTab !== 'home') {
        setActiveTab('home');
        return;
      }

      // 6. Priority 6: Home root (Double back to exit protection)
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        window.history.back();
      } else {
        lastBackPressTimeRef.current = now;
        window.history.pushState({ sbsRoot: true }, '');
        showToast('Press back again to exit SBS Store', 'info');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    selectedProductDetail,
    activeSubcategoryModal,
    isCheckoutOpen,
    selectedOrderForModal,
    orderListFilter,
    isEditProfileOpen,
    isAddressesOpen,
    isCouponsOpen,
    isAuthModalOpen,
    isPhonePromptOpen,
    isSearchOpen,
    isUserNotificationsModalOpen,
    activeTab,
    setSelectedProductDetail,
    setActiveSubcategoryModal,
    setIsCheckoutOpen,
    setSelectedOrderForModal,
    setOrderListFilter,
    setIsEditProfileOpen,
    setIsAddressesOpen,
    setIsCouponsOpen,
    closeAuthModal,
    closePhonePrompt,
    setIsSearchOpen,
    setIsUserNotificationsModalOpen,
    setActiveTab,
    showToast,
  ]);

  return null;
};
