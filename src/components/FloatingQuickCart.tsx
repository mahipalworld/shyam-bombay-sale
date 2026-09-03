'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, ArrowRight, Sparkles, Truck } from 'lucide-react';

export const FloatingQuickCart: React.FC = () => {
  const { cart, activeTab, setActiveTab, cartSubtotal } = useStore();

  // Don't show if cart is empty or user is on Cart, Admin, Categories, or Profile view
  if (
    cart.length === 0 || 
    activeTab === 'cart' || 
    activeTab === 'admin' || 
    activeTab === 'categories' || 
    activeTab === 'profile'
  ) {
    return null;
  }

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 1700;
  const isFreeDelivery = cartSubtotal >= freeShippingThreshold;
  const awayFromFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  // Preview first 3 cart items
  const previewItems = cart.slice(0, 3);

  return (
    <div className="fixed bottom-[74px] md:bottom-6 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none animate-slideUp">
      <button
        onClick={() => setActiveTab('cart')}
        className="pointer-events-auto max-w-md w-full bg-[#18181B]/95 hover:bg-black text-white rounded-2xl sm:rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/15 overflow-hidden flex flex-col group active:scale-98 transition-all duration-200"
      >
        {/* Top Mini Delivery Progress Bar */}
        <div className="w-full bg-white/10 h-1 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#F95721] via-amber-400 to-[#00A859] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Pill Content */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 w-full">
          {/* Left: Stacked Product Thumbnails */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center -space-x-2 flex-shrink-0">
              {previewItems.map((item, idx) => (
                <div 
                  key={item.productId || idx}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white p-0.5 border-2 border-[#18181B] shadow-xs flex-shrink-0"
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
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#27272A] border-2 border-[#18181B] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                  +{cart.length - 3}
                </div>
              )}
            </div>

            {/* Price & Items Summary */}
            <div className="min-w-0 text-left pl-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">
                  ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-300 truncate leading-tight mt-0.5">
                {isFreeDelivery ? (
                  <span className="text-[#00A859] font-black flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> FREE Express Delivery!
                  </span>
                ) : (
                  <span className="text-orange-200">
                    Add ₹{awayFromFree.toLocaleString('en-IN')} for Free Delivery
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Modern View Cart CTA */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#F95721] to-[#FF7038] hover:from-[#E44813] hover:to-[#F95721] text-white font-black text-xs flex-shrink-0 shadow-md shadow-orange-600/30 group-hover:translate-x-0.5 transition-all">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>
    </div>
  );
};
