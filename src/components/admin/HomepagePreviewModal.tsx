'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Smartphone, Sparkles, Star, ShoppingBag, ShieldCheck, ChevronRight } from 'lucide-react';

interface HomepagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HomepagePreviewModal: React.FC<HomepagePreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    heroBanners, 
    homepageSections, 
    categories, 
    homepageCategories, 
    products, 
    trendingNowProducts, 
    todayDeals, 
    bestSellersConfig,
    storeSettings
  } = useStore();

  if (!isOpen) return null;

  const activeBanners = heroBanners.filter(b => b.enabled);
  const activeCategories = categories.filter(c => homepageCategories.includes(c.id));
  
  // Trending products
  const trendingList = products.filter(p => trendingNowProducts.includes(p.id));

  // Best sellers
  const bestSellersList = bestSellersConfig.mode === 'manual'
    ? products.filter(p => bestSellersConfig.manualProductIds.includes(p.id))
    : products.filter(p => p.isBestSeller || p.rating >= 4.5);

  const isSectionEnabled = (id: string) => {
    const sec = homepageSections.find(s => s.id === id);
    return sec ? sec.enabled : true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-sm flex flex-col max-h-[95vh] space-y-2">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-white px-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold">Customer Store Live Preview</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iPhone Frame Simulator */}
        <div className="bg-gray-900 p-2.5 rounded-[40px] shadow-2xl border-4 border-gray-700 overflow-hidden flex flex-col flex-1 max-h-[85vh]">
          {/* Phone Speaker & Notch */}
          <div className="w-28 h-4 bg-black rounded-b-xl mx-auto mb-1 flex items-center justify-center">
            <div className="w-10 h-1.5 bg-gray-800 rounded-full" />
          </div>

          {/* Internal Mobile Screen */}
          <div className="bg-[#F8F9FA] rounded-[28px] overflow-y-auto flex-1 p-3 space-y-4 text-gray-900 text-xs">
            {/* Store Top Bar */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl shadow-xs border border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[#F95721] text-sm">{storeSettings.logo || 'SBS'}</span>
                <span className="font-bold text-gray-800 text-xs tracking-tight">STORE</span>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                Free Delivery ₹{storeSettings.freeDeliveryThreshold}+
              </span>
            </div>

            {/* 1. Hero Banner Section */}
            {isSectionEnabled('hero') && activeBanners.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activeBanners[0].image} 
                  alt={activeBanners[0].heading} 
                  className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay" 
                />
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                    Featured Deal
                  </span>
                  <h3 className="text-sm font-black leading-snug">{activeBanners[0].heading}</h3>
                  <p className="text-[11px] text-white/90 leading-tight line-clamp-2">{activeBanners[0].description}</p>
                  <button className="mt-1 px-3 py-1 bg-white text-[#F95721] text-[10px] font-black rounded-lg shadow-sm">
                    {activeBanners[0].ctaText || 'Shop Now'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Categories Carousel */}
            {isSectionEnabled('categories') && activeCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-gray-900">Popular Categories</span>
                  <span className="text-[10px] text-[#F95721] font-bold">See All</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {activeCategories.map((c) => (
                    <div key={c.id} className="flex flex-col items-center text-center space-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/60 p-1 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 leading-tight line-clamp-1">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Today's Deals */}
            {isSectionEnabled('deals') && todayDeals.filter(d => d.enabled).length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-red-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {todayDeals[0].title}
                  </span>
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    {todayDeals[0].discount}% OFF
                  </span>
                </div>
                <p className="text-[10px] text-gray-600">Limited time daily promotional price drops.</p>
              </div>
            )}

            {/* 4. Trending Now */}
            {isSectionEnabled('trending') && trendingList.length > 0 && (
              <div className="space-y-2">
                <span className="font-extrabold text-xs text-gray-900">Trending Now 🔥</span>
                <div className="grid grid-cols-2 gap-2">
                  {trendingList.slice(0, 2).map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs space-y-1">
                      <div className="w-full h-20 bg-gray-50 rounded-xl p-1 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-bold text-gray-800 text-[11px] line-clamp-1">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#F95721]">₹{p.price}</span>
                        <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Best Sellers */}
            {isSectionEnabled('bestsellers') && bestSellersList.length > 0 && (
              <div className="space-y-2">
                <span className="font-extrabold text-xs text-gray-900">Best Sellers ⭐</span>
                <div className="grid grid-cols-2 gap-2">
                  {bestSellersList.slice(0, 2).map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs space-y-1">
                      <div className="w-full h-20 bg-gray-50 rounded-xl p-1 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-bold text-gray-800 text-[11px] line-clamp-1">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#F95721]">₹{p.price}</span>
                        <span className="text-[10px] text-green-600 font-bold">{p.discountPercentage}% OFF</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Trust Info */}
            {isSectionEnabled('trust') && (
              <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-around text-center text-[10px] text-gray-600 font-bold">
                <div>🚚 Fast Delivery</div>
                <div>🔒 100% Genuine</div>
                <div>⚡ COD Available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
