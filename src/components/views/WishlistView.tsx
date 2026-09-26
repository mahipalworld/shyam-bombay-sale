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
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const WishlistView: React.FC = () => {
  const { 
    wishlist, 
    removeFromWishlist, 
    addToCart, 
    setActiveTab, 
    setSelectedProductDetail,
    products,
    showToast 
  } = useStore();

  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    showToast('Price drop alerts enabled for your wishlist! 🔔');
  };

  const recommendedItems = products.slice(0, 4);

  if (wishlist.length === 0) {
    return (
      <div className="py-8 space-y-8 pb-40 md:pb-12 animate-fadeIn">
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-[#F95721]">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Your Wishlist is Empty</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm">
              Save items you love to revisit anytime and receive instant price drop alerts!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            Explore Catalog
          </button>
        </div>

        {/* You Might Also Like Recommendation Grid */}
        {recommendedItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900">You Might Also Like</h3>
                <p className="text-[11px] text-gray-500">Popular bestselling items picked for you</p>
              </div>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-xs font-bold text-[#F95721] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recommendedItems.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductDetail(prod)}
                  className="bg-white border border-gray-100 rounded-2xl p-2.5 shadow-subtle hover:shadow-card transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-xl bg-gray-50 p-2 overflow-hidden mb-2 relative">
                      <ResolvedImage
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                      {prod.discountPercentage > 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#F95721] text-white text-[11px] font-black rounded-md">
                          {prod.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#F95721] transition-colors">
                      {prod.name}
                    </h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xs font-black text-gray-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      addToCart(prod, 1, e.currentTarget);
                    }}
                    className="mt-2.5 w-full py-1.5 bg-[#FFF4EC] hover:bg-[#F95721] text-[#F95721] hover:text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6 pb-40 md:pb-12 animate-fadeIn">
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
          className="text-xs md:text-sm font-bold text-[#F95721] hover:underline"
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
                <ResolvedImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="mt-2.5 flex-1 flex flex-col justify-between">
                <div onClick={() => setSelectedProductDetail(product)} className="cursor-pointer">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#F95721] transition-colors">
                    {product.name}
                  </h3>

                  {/* Verified Quality Badge */}
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-[#00A859]">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Verified</span>
                  </div>

                  {/* Pricing Row */}
                  <div className="flex items-baseline flex-wrap gap-1.5 mt-1 sm:mt-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-[#F95721]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-[#EA580C] bg-[#FFF4EC] px-1.5 py-0.5 rounded">
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
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(10);
                    addToCart(product, 1);
                  }}
                  className="mt-3 w-full h-9 px-3 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] active:scale-98 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
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
          <div className="w-12 h-12 rounded-2xl bg-white text-[#F95721] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Heart className="w-6 h-6 fill-[#F95721]" />
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
              : 'bg-white border-[#F95721] text-[#F95721] hover:bg-orange-50'
          }`}
        >
          {notified ? 'Subscribed' : 'Notify Me'}
        </button>
      </div>
    </div>
  );
};
