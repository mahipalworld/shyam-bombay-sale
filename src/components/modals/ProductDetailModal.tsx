'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  Copy, 
  Tag, 
  Package, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  Award,
  Phone,
  MessageCircle,
  FileText
} from 'lucide-react';
import { ResolvedImage, ResolvedVideo } from '../common/ResolvedMedia';
import { getProductMediaList, ProductMediaItem } from '@/lib/productMedia';
import { PincodeChecker } from '../common/PincodeChecker';
import { Product } from '@/types';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductDetail, 
    setSelectedProductDetail, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveTab,
    coupons,
    products,
    showToast 
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  
  // Accordion expansion states
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null); // 'shipping' | 'return' | 'faq'
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProductDetail) {
      setQuantity(1);
      setActiveMediaIndex(0);
      setDragOffset(0);
      setIsDragging(false);
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = null;
      setLightboxImage(null);
      setIsDescExpanded(false);
      setOpenAccordion(null);
      setCopiedCoupon(null);
      setIsScrolled(false);
    }
  }, [selectedProductDetail?.id]);

  if (!selectedProductDetail) return null;
  const p = selectedProductDetail;
  const wishlisted = isInWishlist(p.id);

  // Canonical media list (Photos + Videos)
  const mediaList = getProductMediaList(p);
  const currentMedia: ProductMediaItem = mediaList[activeMediaIndex] || mediaList[0] || {
    id: `fallback_${p.id}`,
    type: 'image',
    url: p.image,
    isCover: true,
  };

  const handleNextMedia = () => {
    if (mediaList.length <= 1) return;
    setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrevMedia = () => {
    if (mediaList.length <= 1) return;
    setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  // Touch Swipe Handlers with Real-Time Finger Tracking & Animation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mediaList.length <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || mediaList.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      let offset = deltaX;
      // Damping resistance when dragging past boundaries
      if ((activeMediaIndex === 0 && deltaX > 0) || (activeMediaIndex === mediaList.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.35;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;
    const currentOffset = dragOffset;
    const elapsed = Date.now() - touchStartRef.current.time;
    const isHorizontal = isHorizontalSwipeRef.current;

    setIsDragging(false);
    setDragOffset(0);
    touchStartRef.current = null;
    isHorizontalSwipeRef.current = null;

    if (!isHorizontal) return;

    // Swipe threshold: 40px or fast flick (< 250ms with > 25px move)
    const isQuickFlick = elapsed < 250 && Math.abs(currentOffset) > 25;
    const isSwipePastThreshold = Math.abs(currentOffset) > 40;

    if (isSwipePastThreshold || isQuickFlick) {
      if (currentOffset < 0 && activeMediaIndex < mediaList.length - 1) {
        if ('vibrate' in navigator) navigator.vibrate(10);
        setActiveMediaIndex((prev) => prev + 1);
      } else if (currentOffset > 0 && activeMediaIndex > 0) {
        if ('vibrate' in navigator) navigator.vibrate(10);
        setActiveMediaIndex((prev) => prev - 1);
      }
    }
  };

  // Mouse Drag Handlers for Desktop Testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mediaList.length <= 1) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = true;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !touchStartRef.current || mediaList.length <= 1) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    let offset = deltaX;
    if ((activeMediaIndex === 0 && deltaX > 0) || (activeMediaIndex === mediaList.length - 1 && deltaX < 0)) {
      offset = deltaX * 0.35;
    }
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out ${p.name} on SBS Store for only ₹${p.price.toLocaleString('en-IN')}!`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: p.name,
          text: shareText,
          url: url,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard! 📋');
      }
    } catch {
      // User cancelled share or share dismissed safely
    }
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`Check out this deal on SBS Store: ${p.name} at ₹${p.price.toLocaleString('en-IN')}!\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      showToast(`Coupon ${code} copied! Apply at checkout 🏷️`);
      setTimeout(() => setCopiedCoupon(null), 2500);
    }
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(p, quantity, e.currentTarget);
    if ('vibrate' in navigator) navigator.vibrate(10);
    showToast(`Added ${quantity} item(s) to Cart! 🛒`, 'success');
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(p, quantity, e.currentTarget);
    if ('vibrate' in navigator) navigator.vibrate(10);
    setActiveTab('cart');
    setSelectedProductDetail(null);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setIsScrolled(scrollContainerRef.current.scrollTop > 80);
    }
  };

  const maxQty = Math.min(10, p.stockCount || 10);

  // Related products
  const relatedProducts = products
    .filter((item) => item.id !== p.id && (item.category === p.category || item.isTrending))
    .slice(0, 4);

  // Default specifications if none provided on product object
  const specs = p.specifications && p.specifications.length > 0 ? p.specifications : [
    { label: 'Brand', value: 'SBS Certified' },
    { label: 'Category', value: p.category },
    { label: 'Subcategory', value: p.subcategory || 'General' },
    { label: 'Condition', value: 'Brand New (100% Sealed)' },
    { label: 'Warranty', value: '6 Months Manufacturer Support' },
    { label: 'In The Box', value: '1x Main Unit, User Guide & Accessories' },
    { label: 'Dispatch Origin', value: 'Mumbai Central Hub, India' },
  ];

  // Highlights fallback
  const highlights = p.features && p.features.length > 0 ? p.features : [
    'Premium ergonomic design for effortless daily use',
    'Certified durability tested for high performance',
    'Zero maintenance & easy cleaning structure',
    'Compatible with Indian standards & genuine warranty',
  ];

  // Feature icon strip
  const featureIcons = p.featureIcons && p.featureIcons.length > 0 ? p.featureIcons : [
    { icon: '⚡', label: 'High Speed' },
    { icon: '🛡️', label: 'Verified Safe' },
    { icon: '🔋', label: 'Long Life' },
    { icon: '✨', label: 'Premium Build' },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn overflow-x-hidden"
        onClick={() => setSelectedProductDetail(null)}
      >
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col relative no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ======================================================== */}
          {/* 1. STICKY TOP APP BAR                                   */}
          {/* ======================================================== */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between transition-all sticky-gpu">
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {isScrolled && (
                <div className="min-w-0 flex-1 animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{p.name}</h3>
                  <p className="text-[11px] font-black text-[#F95721]">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  wishlisted 
                    ? 'bg-rose-50 text-rose-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5 pb-28">
            {/* ======================================================== */}
            {/* 2. PRODUCT GALLERY (4:3 Full-Bleed with swipe)          */}
            {/* ======================================================== */}
            <div className="space-y-3">
              <div 
                className="relative aspect-[4/3] w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200/70 select-none shadow-xs group cursor-grab active:cursor-grabbing touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Horizontal Sliding Carousel Track */}
                <div 
                  className="w-full h-full flex"
                  style={{
                    transform: `translateX(calc(-${activeMediaIndex * 100}% + ${dragOffset}px))`,
                    transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform',
                  }}
                >
                  {mediaList.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="w-full h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <ResolvedVideo
                            src={item.url}
                            poster={p.videoThumbnail || p.image}
                            autoPlay={activeMediaIndex === idx}
                            muted
                            loop
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center cursor-zoom-in p-2"
                          onClick={() => {
                            if (Math.abs(dragOffset) > 5) return;
                            setLightboxImage(item.url);
                          }}
                        >
                          <ResolvedImage
                            src={item.url}
                            alt={`${p.name} view ${idx + 1}`}
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Badges Top-Left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {p.isBestSeller && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-black rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> BESTSELLER
                    </span>
                  )}
                  {p.isDealOfDay && (
                    <span className="px-2.5 py-1 bg-[#F95721] text-white text-[11px] font-black rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Zap className="w-3 h-3" /> DEAL OF DAY
                    </span>
                  )}
                </div>

                {/* Counter Pill Top-Right */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-full">
                    {activeMediaIndex + 1} / {mediaList.length}
                  </span>
                </div>

                {/* Lightbox / Zoom hint Bottom-Right */}
                {currentMedia.type === 'image' && (
                  <button
                    onClick={() => setLightboxImage(currentMedia.url)}
                    className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-700 flex items-center justify-center shadow-xs hover:bg-white active:scale-95 transition-all"
                    title="Zoom Image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                {/* Animated Pagination Dots Bottom-Center */}
                {mediaList.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full pointer-events-none">
                    {mediaList.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeMediaIndex === idx
                            ? 'w-4 bg-[#F95721]'
                            : 'w-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Prev / Next Arrows */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevMedia();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-800 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all opacity-80 hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextMedia();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-800 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all opacity-80 hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {mediaList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {mediaList.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeMediaIndex === idx
                          ? 'border-[#F95721] ring-2 ring-orange-200 shadow-xs'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      ) : (
                        <ResolvedImage
                          src={item.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 3. PRODUCT TITLE, SUBTITLE & RATINGS                     */}
            {/* ======================================================== */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>{p.category}</span>
                {p.subcategory && (
                  <>
                    <span>•</span>
                    <span>{p.subcategory}</span>
                  </>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                {p.name}
              </h1>

              {p.subtitle ? (
                <p className="text-xs text-gray-600 leading-relaxed">{p.subtitle}</p>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed">
                  Authentic certified product backed by 100% SBS Quality Inspection and fast delivery.
                </p>
              )}

              {/* Rating Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1 bg-[#00A859] text-white px-2 py-0.5 rounded-md text-xs font-black">
                  <span>{p.rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {p.reviewCount.toLocaleString('en-IN')} Ratings
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 4. PRICE STACK & OFFERS BADGE                            */}
            {/* ======================================================== */}
            <div className="p-3.5 bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/30 border border-orange-200/70 rounded-2xl space-y-2">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                {p.originalPrice > p.price && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    ₹{p.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {p.discountPercentage > 0 && (
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#F95721] to-[#E44813] text-white text-xs font-black rounded-lg shadow-xs">
                    {p.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                <span>Inclusive of all taxes</span>
                <div className="flex items-center gap-1 text-[#00A859] font-bold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free Express Delivery</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 5. 3 TRUST PILLARS                                       */}
            {/* ======================================================== */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#F95721]" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">7 Days Return</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                <Truck className="w-4 h-4 text-[#00A859]" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">Cash on Delivery</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">Secure Payments</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 6. QUANTITY STEPPER                                      */}
            {/* ======================================================== */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200/80 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Quantity</span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {p.stockCount && p.stockCount < 10 ? `Only ${p.stockCount} left in stock` : 'In Stock & Ready to Dispatch'}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 flex items-center justify-center transition-all active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center font-black text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="w-9 h-9 rounded-lg bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-[#F95721] flex items-center justify-center transition-all active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 7. AVAILABLE OFFERS & COUPONS CHIPS                      */}
            {/* ======================================================== */}
            {coupons && coupons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#F95721]" />
                    Available Offers & Discounts
                  </span>
                  <span className="text-[11px] text-gray-400">Tap code to copy</span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-2.5 min-w-[210px] flex-shrink-0 cursor-pointer hover:bg-emerald-50 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                          {coupon.code}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#00A859] flex items-center gap-1">
                          {copiedCoupon === coupon.code ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1 truncate">
                        {coupon.description || (coupon.discountType === 'PERCENT' ? `Get ${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. PINCODE DELIVERY ESTIMATOR                            */}
            {/* ======================================================== */}
            <PincodeChecker />

            {/* ======================================================== */}
            {/* 9. PRODUCT HIGHLIGHTS                                    */}
            {/* ======================================================== */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2.5 shadow-subtle">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F95721]" />
                Product Highlights
              </h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ======================================================== */}
            {/* 10. 4-ITEM FEATURE ICON STRIP                            */}
            {/* ======================================================== */}
            <div className="grid grid-cols-4 gap-2">
              {featureIcons.map((f, i) => (
                <div key={i} className="bg-orange-50/50 border border-orange-100 rounded-2xl p-2.5 text-center flex flex-col items-center gap-1 shadow-2xs">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-1">{f.label}</span>
                </div>
              ))}
            </div>

            {/* ======================================================== */}
            {/* 11. DETAILED DESCRIPTION (WITH READ MORE)                */}
            {/* ======================================================== */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2 shadow-subtle">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F95721]" />
                Product Description
              </h3>
              <div className={`text-xs text-gray-600 leading-relaxed space-y-2 ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                <p>{p.description}</p>
                {p.descriptionBlocks && p.descriptionBlocks.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {p.descriptionBlocks.map((block, idx) => (
                      <div key={idx} className="bg-gray-50 p-2.5 rounded-xl space-y-1">
                        {block.title && <h4 className="font-bold text-gray-900 text-xs">{block.title}</h4>}
                        <p className="text-xs text-gray-600">{block.text}</p>
                        {block.image && (
                          <div className="aspect-video w-full rounded-lg overflow-hidden mt-1">
                            <ResolvedImage src={block.image} alt={block.title || 'Feature'} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-extrabold text-[#F95721] hover:underline flex items-center gap-1 pt-1"
              >
                <span>{isDescExpanded ? 'Read Less' : 'Read More'}</span>
                {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* ======================================================== */}
            {/* 12. SPECIFICATIONS TABLE                                 */}
            {/* ======================================================== */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2.5 shadow-subtle">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#F95721]" />
                Product Specifications
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                {specs.map((spec, i) => (
                  <div key={i} className={`flex py-2 px-3 ${i % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}`}>
                    <span className="w-2/5 font-bold text-gray-600">{spec.label}</span>
                    <span className="w-3/5 font-semibold text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 13. ACCORDIONS: Shipping, Return & Refund, FAQs          */}
            {/* ======================================================== */}
            <div className="space-y-2">
              {/* Shipping & Delivery Accordion */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#00A859]" />
                    <span className="text-xs font-black text-gray-900">Shipping & Delivery Guidelines</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="p-3.5 pt-0 text-xs text-gray-600 border-t border-gray-100 space-y-1.5 animate-fadeIn">
                    <p>• Orders are dispatched within <strong>24 business hours</strong> from our central hub.</p>
                    <p>• Fast delivery typically takes <strong>3 to 5 business days</strong> across major Indian pin codes.</p>
                    <p>• Real-time SMS and WhatsApp tracking links are sent as soon as the courier picks up the order.</p>
                  </div>
                )}
              </div>

              {/* Return & Refund Policy Accordion */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('return')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#F95721]" />
                    <span className="text-xs font-black text-gray-900">7 Days Return & Replacement Policy</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openAccordion === 'return' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'return' && (
                  <div className="p-3.5 pt-0 text-xs text-gray-600 border-t border-gray-100 space-y-1.5 animate-fadeIn">
                    <p>• If you receive a defective or damaged product, request a replacement within <strong>7 days</strong> of delivery.</p>
                    <p>• Quick WhatsApp support: Share photos/unboxing clip for instant claim approval.</p>
                    <p>• 100% money back guarantee if reverse pickup is not serviced in your area.</p>
                  </div>
                )}
              </div>

              {/* FAQ Accordion */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('faq')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-gray-900">Frequently Asked Questions</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openAccordion === 'faq' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'faq' && (
                  <div className="p-3.5 pt-0 text-xs text-gray-600 border-t border-gray-100 space-y-2.5 animate-fadeIn">
                    <div>
                      <p className="font-bold text-gray-900">Q: Is Cash on Delivery (COD) available?</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">Yes, COD is available for all serviceable Indian pincodes.</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Q: What if the product arrives damaged?</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">We provide an instant 7-day hassle-free replacement with zero additional shipping charges.</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Q: How do I contact customer support?</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">You can chat directly with our WhatsApp team or visit the Help Center in your Profile.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 14. FAST & SAFE DELIVERY ASSURANCE (2x2 Grid)           */}
            {/* ======================================================== */}
            <div className="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 border border-orange-200/60 rounded-3xl p-4 space-y-3">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F95721]" />
                Fast & Safe Delivery Promise
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-100 text-[#F95721] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Sanitized Pack</span>
                    <span className="text-gray-500">Tamper-evident box</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-100 text-[#F95721] flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Express Dispatch</span>
                    <span className="text-gray-500">Shipped under 24h</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-100 text-[#F95721] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Live Tracking</span>
                    <span className="text-gray-500">SMS & WhatsApp</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-100 text-[#F95721] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Quality Checked</span>
                    <span className="text-gray-500">100% Genuine product</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 15. SHARE WITH FRIENDS (WhatsApp Quick Share)            */}
            {/* ======================================================== */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Share with Friends & Family</span>
                  <span className="text-[11px] text-gray-600">Send this direct link via WhatsApp</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
              >
                Share
              </button>
            </div>

            {/* ======================================================== */}
            {/* 16. YOU MAY ALSO LIKE (Related Products Grid)            */}
            {/* ======================================================== */}
            {relatedProducts.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    You May Also Like
                  </h3>
                  <span className="text-[11px] font-bold text-[#F95721]">Similar Items</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedProductDetail(item);
                        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                      }}
                      className="bg-white border border-gray-200/80 rounded-2xl p-2.5 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-2 relative">
                        <ResolvedImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        {item.discountPercentage > 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#F95721] text-white text-[10px] font-black rounded-md">
                            {item.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-[#F95721] transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-gray-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 17. STICKY BOTTOM ACTION BAR (Price Stack + 2 CTAs)      */}
          {/* ======================================================== */}
          <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-3 shadow-lg sticky-gpu safe-bottom">
            {/* Price Column */}
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-gray-900 tracking-tight">
                  ₹{(p.price * quantity).toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span className="text-[11px] text-gray-500 font-semibold">({quantity} pcs)</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 flex-1 max-w-[280px]">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-2 bg-white hover:bg-orange-50 text-[#F95721] border-2 border-[#F95721] font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3 px-2 bg-gradient-to-r from-[#F95721] to-[#E44813] hover:from-[#E44813] hover:to-[#D43D0A] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-200 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-2xl max-h-[85vh] w-full flex items-center justify-center">
            <ResolvedImage
              src={lightboxImage}
              alt="Zoomed View"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
