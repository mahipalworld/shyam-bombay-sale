'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Bell, 
  Star, 
  ShoppingBag,
  CheckCircle2 
} from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { 
    wishlist, 
    removeFromWishlist, 
    addToCart, 
    setActiveTab, 
    setSelectedProductDetail,
    showToast 
  } = useStore();

  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    showToast('Price drop alerts enabled for your wishlist! 🔔');
  };

  if (wishlist.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 pb-24 animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-[#E53E3E]">
          <Heart className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-sm">
            Save items you love to revisit anytime and receive instant price drop alerts!
          </p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="px-8 py-3.5 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-xs md:text-sm font-bold rounded-xl shadow-float transition-all tap-active"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6 pb-28 md:pb-12 animate-fadeIn">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            My Wishlist <span className="text-gray-500 font-medium text-lg">({wishlist.length})</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 font-medium">
            Items you love, all in one place
          </p>
        </div>
        <button
          onClick={() => showToast('All wishlist items synced!')}
          className="text-xs md:text-sm font-bold text-[#F35C16] hover:underline"
        >
          Manage
        </button>
      </div>

      {/* Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
        {wishlist.map((item) => {
          const product = item.product;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-3 sm:p-3.5 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all relative group"
            >
              {/* Remove / Delete Button (Top Right) */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-xs border border-gray-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                aria-label="Remove from wishlist"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Product Image Area */}
              <div
                onClick={() => setSelectedProductDetail(product)}
                className="cursor-pointer aspect-square w-full rounded-xl sm:rounded-2xl bg-[#F9FAFB] flex items-center justify-center p-2.5 overflow-hidden relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="mt-2.5 flex-1 flex flex-col justify-between">
                <div onClick={() => setSelectedProductDetail(product)} className="cursor-pointer">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#F35C16] transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-semibold text-gray-800">{product.rating}</span>
                    <span className="text-gray-400">({product.reviewCount})</span>
                  </div>

                  {/* Pricing Row */}
                  <div className="flex items-baseline flex-wrap gap-1.5 mt-1 sm:mt-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-[#F35C16]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#EA580C] bg-[#FFF4EC] px-1.5 py-0.5 rounded">
                      {product.discountPercentage}% OFF
                    </span>
                  </div>

                  {/* In Stock Badge */}
                  <div className="mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]" />
                    <span className="text-[11px] font-semibold text-[#00A859]">
                      In Stock
                    </span>
                  </div>
                </div>

                {/* Single Clean Full-Width Add to Cart Button */}
                <button
                  onClick={() => addToCart(product, 1)}
                  className="mt-3 w-full h-9 px-3 bg-gradient-to-r from-[#F35C16] to-[#FA7035] hover:from-[#E04F0E] hover:to-[#F35C16] active:scale-98 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Drop Alert Notification Banner matching Screenshot */}
      <div className="bg-[#FFF6F0] border border-[#FEDDC7] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#F35C16] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Heart className="w-6 h-6 fill-[#F35C16]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Price drop on items?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
              We&apos;ll notify you when items in your wishlist get a discount or promo coupon!
            </p>
          </div>
        </div>

        <button
          onClick={handleNotifyMe}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl border flex-shrink-0 transition-all ${
            notified
              ? 'bg-[#EBF7F0] border-[#A7E3BC] text-[#00A859]'
              : 'bg-white border-[#F35C16] text-[#F35C16] hover:bg-orange-50'
          }`}
        >
          {notified ? 'Subscribed' : 'Notify Me'}
        </button>
      </div>
    </div>
  );
};
