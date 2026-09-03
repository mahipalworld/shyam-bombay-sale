'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Ticket, 
  Star, 
  Package, 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  LogOut,
  Phone,
  Mail,
  Award,
  LogIn,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Download,
  Check
} from 'lucide-react';
import { OrderStatus } from '@/types';
import { usePWA } from '@/context/PWAContext';
import { IOSInstallGuideModal } from '@/components/modals/IOSInstallGuideModal';

export const ProfileView: React.FC = () => {
  const { 
    user, 
    orders, 
    wishlist, 
    coupons, 
    setActiveTab, 
    setIsEditProfileOpen, 
    setIsAddressesOpen, 
    setIsCouponsOpen, 
    setOrderListFilter,
    showToast,
    isEmailAuthorizedAdmin,
    getEffectiveAdminRole
  } = useStore();
  const { authUser, supabaseUser, isGoogleAuth, isSuperAdmin, openAuthModal, signOut } = useAuth();
  const { isInstalled, showIOSGuide, setShowIOSGuide, triggerInstall } = usePWA();

  const [isLoggedOutModal, setIsLoggedOutModal] = useState(false);

  // Check Google Admin authorization
  const currentEmail = authUser?.email || supabaseUser?.email;
  const isAuthorizedAdmin = isGoogleAuth && isEmailAuthorizedAdmin(currentEmail);
  const activeAdminRole = isAuthorizedAdmin ? getEffectiveAdminRole(currentEmail) : null;

  // Display user info: real authUser if logged in, otherwise local profile
  const displayName = authUser?.name || user.name;
  const displayEmail = authUser?.email || user.email;
  const displayPhone = authUser?.phone || user.phone;
  const displayPoints = authUser?.reward_points ?? user.rewardPoints;

  // Count orders in different stages
  const toPayCount = orders.filter((o) => o.status === 'To Pay').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const returnsCount = orders.filter((o) => o.status === 'Returns').length;

  const handleStatusClick = (status: OrderStatus) => {
    setOrderListFilter(status);
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out successfully');
    setIsLoggedOutModal(false);
  };

  return (
    <div className="py-2 space-y-6 pb-28 md:pb-12 animate-fadeIn">
      {/* Guest Banner if not signed in */}
      {!authUser && (
        <div className="bg-gradient-to-r from-[#FFF5EE] via-[#FFEADB] to-[#FEDDC7] border border-orange-200 rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#F95721] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-gray-900">Sign in to your SBS Account</h3>
              <p className="text-xs text-gray-600">Sync your orders, wishlist & earn 250 welcome points.</p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Profile info & Order tracking stage pills) */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile Card */}
          <div className="bg-gradient-to-b from-[#FFF5EE] to-[#FFF0E6] border border-[#FEDDC7] rounded-3xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F95721] to-[#E44813] border-2 border-white shadow-xs flex items-center justify-center text-white text-lg font-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {/* User Details */}
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {displayName}
                  </h2>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {displayEmail}
                  </p>
                  {displayPhone && (
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {displayPhone}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => authUser ? setIsEditProfileOpen(true) : openAuthModal('login')}
                className="text-xs font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
              >
                <span>{authUser ? 'Edit' : 'Login'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Mini Stat Badges Row */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-orange-200/50">
              {/* Orders */}

              <div
                onClick={() => setOrderListFilter('ALL')}
                className="bg-white/80 backdrop-blur-xs rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFF4EC] text-[#F95721] flex items-center justify-center mb-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-900">{orders.length}</span>
                <span className="text-[10px] text-gray-500 font-medium">Orders</span>
              </div>

              {/* Wishlist */}
              <div
                onClick={() => setActiveTab('wishlist')}
                className="bg-white/80 backdrop-blur-xs rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#FDF2F4] text-[#E53E3E] flex items-center justify-center mb-1">
                  <Heart className="w-3.5 h-3.5 fill-[#E53E3E]" />
                </div>
                <span className="text-xs font-bold text-gray-900">{wishlist.length}</span>
                <span className="text-[10px] text-gray-500 font-medium">Wishlist</span>
              </div>

              {/* Coupons */}
              <div
                onClick={() => setIsCouponsOpen(true)}
                className="bg-white/80 backdrop-blur-xs rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#EBF7F0] text-[#00A859] flex items-center justify-center mb-1">
                  <Ticket className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-900">{coupons.length}</span>
                <span className="text-[10px] text-gray-500 font-medium">Coupons</span>
              </div>

              {/* SBS Rewards */}
              <div
                onClick={() => showToast(`You have ${user.rewardPoints} SBS Reward points!`)}
                className="bg-white/80 backdrop-blur-xs rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFF9E6] text-[#D97706] flex items-center justify-center mb-1">
                  <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                </div>
                <span className="text-xs font-bold text-gray-900">{user.rewardPoints}</span>
                <span className="text-[9px] text-gray-500 font-medium leading-none">Rewards</span>
              </div>
            </div>
          </div>

          {/* My Orders Status Row matching Screenshot 2 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">My Orders Status</h3>
              <button
                onClick={() => setOrderListFilter('ALL')}
                className="text-xs font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Order Stage Action Buttons */}
            <div className="grid grid-cols-5 gap-1.5 bg-white border border-gray-100 rounded-3xl p-3 shadow-subtle">
              {/* To Pay */}
              <button
                onClick={() => handleStatusClick('To Pay')}
                className="flex flex-col items-center gap-1.5 p-1 relative tap-active group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-700 group-hover:text-[#F95721] flex items-center justify-center transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {toPayCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F95721] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                      {toPayCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-700">To Pay</span>
              </button>

              {/* Processing */}
              <button
                onClick={() => handleStatusClick('Processing')}
                className="flex flex-col items-center gap-1.5 p-1 relative tap-active group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-700 group-hover:text-[#F95721] flex items-center justify-center transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  {processingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F95721] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                      {processingCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-700">Processing</span>
              </button>

              {/* Shipped */}
              <button
                onClick={() => handleStatusClick('Shipped')}
                className="flex flex-col items-center gap-1.5 p-1 relative tap-active group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-700 group-hover:text-[#F95721] flex items-center justify-center transition-colors">
                    <Truck className="w-5 h-5" />
                  </div>
                  {shippedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F95721] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                      {shippedCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-700">Shipped</span>
              </button>

              {/* Delivered */}
              <button
                onClick={() => handleStatusClick('Delivered')}
                className="flex flex-col items-center gap-1.5 p-1 relative tap-active group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-green-50 text-gray-700 group-hover:text-[#00A859] flex items-center justify-center transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-700">Delivered</span>
              </button>

              {/* Returns */}
              <button
                onClick={() => handleStatusClick('Returns')}
                className="flex flex-col items-center gap-1.5 p-1 relative tap-active group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 group-hover:bg-orange-50 text-gray-700 group-hover:text-[#F95721] flex items-center justify-center transition-colors">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-700">Returns</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Columns (Account Menu Navigation List matching Screenshot 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* PWA: Add SBS to Home Screen Card */}
          <div className={`rounded-3xl p-4 border transition-all ${
            isInstalled 
              ? 'bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/80 shadow-xs'
              : 'bg-gradient-to-br from-[#FFF5EE] via-white to-[#FFF0E6] border-[#FEDDC7] shadow-subtle'
          }`}>
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  isInstalled ? 'bg-emerald-100 text-[#00A859]' : 'bg-gradient-to-br from-[#F95721] to-[#FF7A3D] text-white'
                }`}>
                  {isInstalled ? (
                    <Check className="w-6 h-6 stroke-[2.5px]" />
                  ) : (
                    <Smartphone className="w-6 h-6 stroke-[2.2px]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <span>{isInstalled ? '✓ SBS App Installed' : '📱 Add SBS to Home Screen'}</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                    {isInstalled 
                      ? 'SBS is available from your home screen with full standalone app experience.'
                      : 'Install SBS like an app for faster access and a full-screen experience.'}
                  </p>
                </div>
              </div>

              {!isInstalled ? (
                <button
                  onClick={() => triggerInstall()}
                  className="px-3.5 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs hover:shadow-float active:scale-95 transition-all flex-shrink-0 tap-active"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">Install</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-100 text-[#00A859] text-[10px] font-extrabold rounded-full whitespace-nowrap flex-shrink-0">
                  Active
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-subtle divide-y divide-gray-50">
            {/* My Orders */}
            <div
              onClick={() => setOrderListFilter('ALL')}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4EC] text-[#F95721] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">My Orders</h4>
                  <p className="text-[11px] text-gray-500">Track, return or reorder items</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* My Wishlist */}
            <div
              onClick={() => setActiveTab('wishlist')}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-[#E53E3E] flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">My Wishlist</h4>
                  <p className="text-[11px] text-gray-500">View items you&apos;ve saved</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Coupons & Offers */}
            <div
              onClick={() => setIsCouponsOpen(true)}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] text-[#00A859] flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">Coupons & Offers</h4>
                  <p className="text-[11px] text-gray-500">View available coupons & offers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* SBS Rewards */}
            <div
              onClick={() => showToast(`You have ${user.rewardPoints} points! Earn 5% on every purchase.`)}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] text-[#D97706] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">SBS Rewards</h4>
                  <p className="text-[11px] text-gray-500">View your reward points & benefits</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Addresses */}
            <div
              onClick={() => setIsAddressesOpen(true)}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F3EFFC] text-[#9333EA] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">Addresses</h4>
                  <p className="text-[11px] text-gray-500">Manage your delivery addresses</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Payment Methods */}
            <div
              onClick={() => showToast('Payment methods saved: UPI (GPay/PhonePe), Saved Cards')}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FC] text-[#0284C7] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">Payment Methods</h4>
                  <p className="text-[11px] text-gray-500">Manage cards, UPI & wallets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Help Center */}
            <div
              onClick={() => showToast('SBS Customer Support: support@sbsstore.com | 1800-123-727')}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">Help Center</h4>
                  <p className="text-[11px] text-gray-500">FAQs, contact us</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Settings */}
            <div
              onClick={() => showToast('App version 1.0.0 (Latest)')}
              className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">Settings</h4>
                  <p className="text-[11px] text-gray-500">App settings and preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Merchant / Admin Dashboard (Only visible for Google-authenticated authorized admins) */}
            {isAuthorizedAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-orange-50/80 rounded-2xl cursor-pointer transition-colors bg-gradient-to-r from-orange-50/50 to-amber-50/30 border border-orange-200/70 text-left shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] text-white flex items-center justify-center shadow-xs shadow-orange-500/20 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs md:text-sm font-black text-gray-900">
                        Admin & Store Manager
                      </h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F95721] text-white">
                        {activeAdminRole || 'ADMIN'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Google Auth
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Manage catalog, roles, orders & store operations</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#F95721] group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Logout Button matching Screenshot 2 */}
          <button
            onClick={() => setIsLoggedOutModal(true)}
            className="w-full py-3.5 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-bold text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors tap-active shadow-subtle"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout from SBS Store</span>
          </button>
        </div>
      </div>

      {/* Confirm Logout Modal */}
      {isLoggedOutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Logout of SBS Store?</h3>
              <p className="text-xs text-gray-500 mt-1">You will need to sign back in to access your orders and wishlist.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsLoggedOutModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Install Guide Modal */}
      <IOSInstallGuideModal 
        isOpen={showIOSGuide} 
        onClose={() => setShowIOSGuide(false)} 
      />
    </div>
  );
};
