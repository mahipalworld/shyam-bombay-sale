'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Home, LayoutGrid, ShoppingCart, Heart, User, ArrowRight, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, wishlist, cartSubtotal } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Only show docked quick-cart header when on Home or Wishlist with items in cart
  const showDockedCart = 
    cart.length > 0 && 
    activeTab !== 'cart' && 
    activeTab !== 'admin' && 
    activeTab !== 'categories' && 
    activeTab !== 'profile';

  const freeShippingThreshold = 1700;
  const isFreeDelivery = cartSubtotal >= freeShippingThreshold;
  const awayFromFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const previewItems = cart.slice(0, 3);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: totalCartCount },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : undefined },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center select-none pointer-events-none">
      {/* 1. Seamlessly Joined Compact Quick-Cart Header */}
      {showDockedCart && (
        <div className="w-full max-w-md px-3 pb-1.5 pointer-events-auto animate-slideUp">
          <div
            onClick={() => setActiveTab('cart')}
            className="w-full bg-[#18181B]/95 hover:bg-black text-white rounded-2xl shadow-xl backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col cursor-pointer active:scale-98 transition-all"
          >
            {/* Top 1px Free Delivery Progress Line */}
            <div className="w-full bg-white/10 h-0.5 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#F95721] via-amber-400 to-[#00A859] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="px-3 py-1.5 flex items-center justify-between gap-2">
              {/* Product Thumbnails + Total */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center -space-x-1.5 flex-shrink-0">
                  {previewItems.map((item, idx) => (
                    <div 
                      key={item.productId || idx}
                      className="w-6 h-6 rounded-md overflow-hidden bg-white p-0.5 border border-[#18181B] shadow-2xs flex-shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product?.image || ''}
                        alt={item.product?.name || 'Item'}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <div className="w-6 h-6 rounded-md bg-[#27272A] border border-[#18181B] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      +{cart.length - 3}
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-baseline gap-1.5 leading-tight">
                    <span className="text-xs font-black text-white">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      ({totalCartCount} {totalCartCount === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-300 truncate leading-none mt-0.5">
                    {isFreeDelivery ? (
                      <span className="text-[#00A859] font-black flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Free Express Delivery
                      </span>
                    ) : (
                      <span className="text-orange-200">
                        Add ₹{awayFromFree} for Free Delivery
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* View Cart Compact Pill Button */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#F95721] to-[#FF7038] text-white font-black text-[11px] shadow-xs flex-shrink-0">
                <span>View Cart</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5px]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Mobile Bottom Tabs Bar */}
      <div className="w-full bg-white/95 backdrop-blur-xl border-t border-gray-100/90 py-1.5 px-3 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pointer-events-auto">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={item.id === 'cart' ? 'bottom-nav-cart-button' : undefined}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 tap-active ${
                  isActive ? 'text-[#F95721]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#F95721] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${isActive ? 'text-[#F95721]' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-[#F95721]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
