'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  ArrowLeft, 
  Shield, 
  Heart, 
  User, 
  Sparkles,
  LayoutGrid,
  LogOut,
  LogIn,
  Bell
} from 'lucide-react';


interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  const { 
    cart, 
    wishlist, 
    activeTab, 
    setActiveTab, 
    setIsSearchOpen, 
    setSelectedCategoryFilter,
    cartTotal,
    userNotifications,
    setIsUserNotificationsModalOpen
  } = useStore();
  const { authUser, openAuthModal, signOut } = useAuth();


  const [desktopSearchInput, setDesktopSearchInput] = useState('');
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifCount = userNotifications.filter(n => !n.read).length;

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (desktopSearchInput.trim()) {
      setIsSearchOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      {/* Top Banner on Desktop */}
      <div className="hidden md:block bg-gradient-to-r from-[#FFF5EE] via-[#FFF0E6] to-[#FFE8DC] border-b border-orange-100/60 py-1.5 px-4 text-center text-xs font-semibold text-gray-700">
        <span>✨ Free delivery on orders above ₹1,700 | Use code <strong className="text-[#F95721] font-bold">SBS100</strong> for Flat ₹100 Off</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack || (() => setActiveTab('home'))}
              className="p-1.5 -ml-1 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Brand Logo */}
          <div 
            onClick={() => {
              setSelectedCategoryFilter(null);
              setActiveTab('home');
            }} 
            className="cursor-pointer flex items-center gap-2 select-none group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=3"
              alt="SBS Logo"
              className="h-7 sm:h-8.5 w-auto object-contain group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="flex flex-col items-start justify-center leading-none">
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 group-hover:text-[#F95721] transition-colors">
                STORE
              </span>
              <span className="hidden sm:block text-[8.5px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">
                Smart Products • Better Prices
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-700">
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setActiveTab('home');
            }}
            className={`hover:text-[#F95721] transition-colors ${activeTab === 'home' ? 'text-[#F95721]' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setActiveTab('categories');
            }}
            className={`flex items-center gap-1 hover:text-[#F95721] transition-colors ${activeTab === 'categories' ? 'text-[#F95721]' : ''}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => {
              setSelectedCategoryFilter('offers');
              setActiveTab('categories');
            }}
            className="flex items-center gap-1 text-[#EA580C] hover:text-[#c44604] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today&apos;s Deals</span>
          </button>
        </nav>

        {/* Desktop Search Bar */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex flex-1 max-w-sm items-center gap-2 bg-gray-100 hover:bg-gray-100/90 rounded-2xl px-3.5 py-2 cursor-pointer border border-transparent hover:border-gray-200 transition-all text-gray-700"
        >
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600">Search essentials, trimmers, sealers...</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button (Accessible on both Mobile & Desktop) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 sm:p-2.5 text-gray-700 hover:text-[#F95721] hover:bg-orange-50 rounded-2xl transition-colors tap-active"
            aria-label="Search products"
          >
            <Search className="w-5 h-5 stroke-[2.2px]" />
          </button>

          {/* Customer Notifications Bell with unread badge */}
          <button
            onClick={() => setIsUserNotificationsModalOpen(true)}
            className="p-2 sm:p-2.5 text-gray-700 hover:text-[#F95721] hover:bg-orange-50 rounded-2xl transition-colors relative flex items-center tap-active"
            aria-label={unreadNotifCount > 0 ? `Notifications ${unreadNotifCount > 9 ? '9+' : unreadNotifCount}` : 'Notifications'}
          >
            <div className="relative">
              <Bell className="w-5 h-5 stroke-[2.2px]" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#F95721] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </div>
          </button>

          {/* Cart Icon with badge (Visible on Mobile & Desktop) */}
          <button
            id="header-cart-button"
            onClick={() => setActiveTab('cart')}
            className={`p-2 sm:p-2.5 rounded-2xl text-gray-700 hover:text-[#F95721] hover:bg-orange-50 transition-colors relative flex items-center tap-active ${
              activeTab === 'cart' ? 'text-[#F95721] bg-orange-50' : ''
            }`}
            aria-label={`Shopping Cart ₹${cartTotal.toLocaleString('en-IN')}${totalCartCount > 0 ? ` (${totalCartCount} items)` : ''}`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 stroke-[2.2px]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-[#F95721] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-bold ml-1.5">
              ₹{cartTotal.toLocaleString('en-IN')}
            </span>
          </button>

          {/* Wishlist Button (Desktop) */}
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`hidden md:flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-red-50 text-[#E53E3E]'
                : 'text-gray-700 hover:bg-gray-100 hover:text-[#E53E3E]'
            }`}
            aria-label="Wishlist"
          >
            <div className="relative">
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-[#E53E3E] text-[#E53E3E]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 bg-[#E53E3E] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden lg:inline">Wishlist</span>
          </button>

          {/* Auth: Profile button when logged in, Sign In when logged out */}
          {authUser ? (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-orange-50 text-[#F95721]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Profile"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F95721] to-[#E44813] text-white flex items-center justify-center text-[10px] font-black">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{authUser.name.split(' ')[0]}</span>
              </button>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#D43D0A] hover:bg-[#B83407] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
