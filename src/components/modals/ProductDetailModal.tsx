'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Share2, 
  Check,
  ShoppingCart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductDetail, 
    setSelectedProductDetail, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setIsCheckoutOpen,
    setActiveTab,
    showToast 
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedProductDetail) {
      setQuantity(1);
      setActiveImageIndex(0);
      setLightboxImage(null);
    }
  }, [selectedProductDetail?.id]);

  if (!selectedProductDetail) return null;
  const p = selectedProductDetail;
  const wishlisted = isInWishlist(p.id);

  // Collect all gallery images
  const allImages = p.images && p.images.length > 0 
    ? p.images 
    : [p.image];

  const currentImage = allImages[activeImageIndex] || p.image;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard! 📋');
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(p, quantity, e.currentTarget);
    setSelectedProductDetail(null);
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(p, quantity, e.currentTarget);
    setSelectedProductDetail(null);
    setActiveTab('cart');
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn"
        onClick={() => setSelectedProductDetail(null)}
      >
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Actions */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-[#F95721] hover:bg-orange-50 rounded-full transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(p)}
                className="p-2 text-gray-600 hover:text-[#E53E3E] hover:bg-red-50 rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlisted ? 'fill-[#E53E3E] text-[#E53E3E]' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 space-y-5">
            {/* Gallery Section */}
            <div className="space-y-3">
              {/* Main Image Stage */}
              <div className="relative aspect-square w-full rounded-2xl bg-[#F9FAFB] p-4 flex items-center justify-center border border-gray-100 overflow-hidden group">
                {/* Image Counter Badge */}
                {allImages.length > 1 && (
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-extrabold text-gray-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-gray-100">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                )}

                {/* Zoom / Lightbox Trigger */}
                <button
                  onClick={() => setLightboxImage(currentImage)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-600 hover:text-black flex items-center justify-center shadow-xs border border-gray-100 hover:scale-105 active:scale-95 transition-all"
                  title="View Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => setLightboxImage(currentImage)}
                />

                {/* Left/Right Arrow Controls (if multiple images) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 hover:text-[#F95721] flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 hover:text-[#F95721] flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 p-1 flex-shrink-0 border-2 overflow-hidden transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#F95721] ring-2 ring-orange-200 scale-105 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Brand */}
            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-[#F95721] uppercase bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                SBS Certified Quality
              </span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 leading-snug">
                {p.name}
              </h2>

              {/* Rating Row */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-xs font-bold text-gray-900">{p.rating}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {p.reviewCount} customer reviews
                </span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs font-semibold text-[#00A859]">
                  ● In Stock
                </span>
              </div>
            </div>

            {/* Pricing Row */}
            <div className="bg-[#FFF8F4] border border-[#FEDDC7] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-2xl font-black text-[#F95721]">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 line-through">
                    MRP ₹{p.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-[#EA580C] bg-white px-1.5 py-0.2 rounded border border-orange-200">
                    {p.discountPercentage}% OFF
                  </span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1 shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-xs font-extrabold text-gray-900 min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Product Highlights & Features */}
            <div className="space-y-2.5 text-xs bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                <Sparkles className="w-4 h-4 text-[#F95721]" />
                <h4>Product Highlights</h4>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium">{p.description}</p>
              {p.features && p.features.length > 0 && (
                <ul className="space-y-1.5 pt-1.5 border-t border-gray-200/60">
                  {p.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-[#00A859] flex-shrink-0 stroke-[2.5px]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* RICH VISUAL DESCRIPTION & SUPPORTING IMAGES STORY SECTION */}
            {p.descriptionBlocks && p.descriptionBlocks.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#F95721] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">In-Depth Visual Tour & Details</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Explore product capabilities and real-use demonstrations</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {p.descriptionBlocks.map((block, idx) => (
                    <div
                      key={block.id || idx}
                      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition-all overflow-hidden"
                    >
                      {/* Supporting Image */}
                      {block.image && (
                        <div 
                          className="relative aspect-video w-full bg-gray-50 overflow-hidden cursor-pointer group"
                          onClick={() => setLightboxImage(block.image!)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={block.image}
                            alt={block.title || `Visual detail ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-2.5 right-2.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Maximize2 className="w-2.5 h-2.5" /> Tap to expand
                          </span>
                        </div>
                      )}

                      {/* Text & Badge Info */}
                      <div className="p-3.5 sm:p-4 space-y-1.5">
                        {block.badge && (
                          <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-md">
                            {block.badge}
                          </span>
                        )}
                        {block.title && (
                          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                            {block.title}
                          </h4>
                        )}
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {block.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#F95721] mb-1" />
                <span className="text-[10px] font-bold text-gray-800">Fast Shipping</span>
                <span className="text-[9px] text-gray-400">2-4 Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-[#F95721] mb-1" />
                <span className="text-[10px] font-bold text-gray-800">7 Days Return</span>
                <span className="text-[9px] text-gray-400">Easy Replacement</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-[#F95721] mb-1" />
                <span className="text-[10px] font-bold text-gray-800">100% Genuine</span>
                <span className="text-[9px] text-gray-400">Quality Assured</span>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Actions: Add to Cart & Buy Now */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 sm:p-4 grid grid-cols-2 gap-2.5 shadow-lg">
            <button
              onClick={handleAddToCart}
              className="py-3.5 px-3 border-2 border-[#F95721] bg-orange-50/60 hover:bg-orange-100/80 active:scale-98 text-[#F95721] font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition-all"
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-3.5 px-3 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-float transition-all"
            >
              <Zap className="w-4 h-4 fill-white flex-shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged preview"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
