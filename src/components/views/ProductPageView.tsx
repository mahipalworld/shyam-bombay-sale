'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { ResolvedImage } from '@/components/common/ResolvedMedia';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Store, 
  Zap, 
  Sparkles, 
  ChevronRight,
  ChevronDown,
  Check,
  Maximize2,
  ChevronLeft,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface ProductPageViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export const ProductPageView: React.FC<ProductPageViewProps> = ({ 
  product, 
  relatedProducts = [] 
}) => {
  const { 
    cart, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveTab, 
    setIsCheckoutOpen,
    setSelectedProductDetail
  } = useStore();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Mobile Touch Swipe Drag State
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Accordion state for mobile details
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');

  const wishlisted = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.productId === product.id || item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const images = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/logo.png'];
  }, [product.image, product.images]);

  const activeImage = images[activeMediaIndex] || images[0];

  // Mobile Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || images.length <= 1) return;
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
      if ((activeMediaIndex === 0 && deltaX > 0) || (activeMediaIndex === images.length - 1 && deltaX < 0)) {
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

    const isQuickFlick = elapsed < 250 && Math.abs(currentOffset) > 25;
    const isSwipePastThreshold = Math.abs(currentOffset) > 40;

    if (isSwipePastThreshold || isQuickFlick) {
      if (currentOffset < 0 && activeMediaIndex < images.length - 1) {
        if ('vibrate' in navigator) navigator.vibrate(10);
        setActiveMediaIndex((prev) => prev + 1);
      } else if (currentOffset > 0 && activeMediaIndex > 0) {
        if ('vibrate' in navigator) navigator.vibrate(10);
        setActiveMediaIndex((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://www.sbsstore.in/product/${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on SBS Store (Shyam Bombay Sale) at ₹${product.price}!`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignored
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const categoryName = product.category
    .replace(/--/g, ' & ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-[#F95721] selection:text-white">
      {/* Lightbox Zoom Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <img
            src={lightboxImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
              aria-label="Back to store"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/sbs-wordmark.svg"
                alt="SBS Store"
                className="h-6 sm:h-7 w-auto object-contain group-hover:scale-102 transition-transform"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-600 transition-colors"
              title="Share product"
              aria-label="Share product"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <Link
              href="/"
              onClick={() => setActiveTab('cart')}
              className="relative w-9 h-9 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200/80 flex items-center justify-center text-[#F95721] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F95721] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE EXPERIENCE (< md): Matches ProductDetailModal Native App Experience */}
      {/* ========================================================================= */}
      <div className="md:hidden flex-1 flex flex-col bg-white pb-28">
        {/* Full-Bleed Fluid Image Swipe Carousel */}
        <div 
          className="relative w-full aspect-square bg-white border-b border-gray-100 overflow-hidden select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {product.discountPercentage > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-[#008744] text-white text-[11px] font-black shadow-xs tracking-wide">
                {product.discountPercentage}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> BESTSELLER
              </span>
            )}
          </div>

          {/* Counter Pill Top-Right */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-full">
              {activeMediaIndex + 1} / {images.length}
            </span>
          </div>

          {/* Zoom Hint Button */}
          <button
            onClick={() => setLightboxImage(activeImage)}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-gray-700 flex items-center justify-center shadow-md active:scale-95 transition-all"
            aria-label="Zoom Image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Animated Pagination Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeMediaIndex === idx ? 'w-4 bg-[#F95721]' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sliding Track */}
          <div
            className="w-full h-full flex"
            style={{
              transform: isDragging
                ? `translateX(calc(-${activeMediaIndex * 100}% + ${dragOffset}px))`
                : `translateX(-${activeMediaIndex * 100}%)`,
              transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="w-full h-full flex-shrink-0 flex items-center justify-center p-6 bg-white"
                onClick={() => setLightboxImage(img)}
              >
                <ResolvedImage
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Info Body */}
        <div className="p-4 space-y-4">
          {/* Breadcrumb / Department */}
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <Link href={`/category/${product.category}`} className="text-[#F95721] hover:underline">
              {categoryName}
            </Link>
            <span className="text-gray-400">SKU: {product.id.slice(-6)}</span>
          </div>

          {/* Product Title */}
          <h1 className="text-lg font-black text-gray-900 leading-snug tracking-tight">
            {product.name}
          </h1>

          {/* Verified Quality Check Pill */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#00A859] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Verified Genuine</span>
            </span>
            <span className="text-xs font-medium text-gray-500">
              100% Quality Checked by SBS Store
            </span>
          </div>

          {/* Price Stack Card */}
          <div className="p-4 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/20 border border-orange-200/70 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm font-semibold text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#F95721] to-[#E44813] text-white text-xs font-black rounded-lg shadow-xs">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 font-medium pt-0.5">
              <span>Inclusive of all taxes</span>
              <div className="flex items-center gap-1.5 text-[#00A859] font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>Fast Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Trust Guarantees 4-Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-gray-800">100% Original</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-bold text-gray-800">7-Day Replacement</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Truck className="w-4 h-4 text-[#F95721] shrink-0" />
              <span className="font-bold text-gray-800">Express Shipping</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Store className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-bold text-gray-800">Vadodara Pickup</span>
            </div>
          </div>

          {/* Accordion 1: Description & Details */}
          {product.description && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between text-xs font-bold text-gray-900"
              >
                <span>About this Item</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openAccordion === 'desc' ? 'rotate-180 text-[#F95721]' : ''}`} />
              </button>
              {openAccordion === 'desc' && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 whitespace-pre-line">
                  {product.description}
                </div>
              )}
            </div>
          )}

          {/* Accordion 2: Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between text-xs font-bold text-gray-900"
              >
                <span>Product Specifications</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openAccordion === 'specs' ? 'rotate-180 text-[#F95721]' : ''}`} />
              </button>
              {openAccordion === 'specs' && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-1.5">
                  {product.specifications.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 text-xs">
                      <span className="text-gray-500 font-medium">{s.label}</span>
                      <span className="text-gray-900 font-bold text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Direct Help */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00A859] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-900 block">Questions about this product?</span>
                <span className="text-gray-600 text-[11px]">Chat with SBS store staff</span>
              </div>
            </div>
            <a
              href={`https://wa.me/919226294797?text=Hi%20SBS%20Store%2C%20I%20have%20a%20question%20about%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#00A859] text-white font-bold text-xs rounded-xl shadow-2xs"
            >
              Chat
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXPERIENCE (>= md): Expansive 2-Column Layout that User Liked      */}
      {/* ========================================================================= */}
      <main className="hidden md:block flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 pb-1" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href={`/category/${product.category}`} className="hover:text-[#F95721] transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 font-bold truncate max-w-md">{product.name}</span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-2 gap-8 lg:gap-10 bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-xs">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div 
              onClick={() => setLightboxImage(activeImage)}
              className="aspect-square w-full rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden relative group cursor-zoom-in"
            >
              {product.discountPercentage > 0 && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-[#008744] text-white text-xs font-black shadow-xs tracking-wide">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200/70 shadow-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#E53E3E] text-[#E53E3E]' : 'text-gray-500'}`} />
              </button>

              <ResolvedImage
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                priority
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-2 overflow-hidden flex-shrink-0 transition-all ${
                      activeMediaIndex === idx ? 'border-[#F95721] shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ResolvedImage src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#F95721] uppercase tracking-wider">
                  {categoryName}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SBS Verified Genuine</span>
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/20 border border-orange-200/70 space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base font-semibold text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="px-2.5 py-0.5 bg-[#F95721] text-white text-xs font-black rounded-md">
                      SAVE {product.discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Inclusive of all taxes</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Fast Delivery across India
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-l-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {quantityInCart > 0 && (
                  <span className="text-xs font-semibold text-emerald-700">
                    ({quantityInCart} currently in cart)
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full h-12 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#F95721] font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{justAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F95721] to-[#E44813] hover:brightness-105 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Value Props Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-gray-900 block">100% Genuine</span>
                    <span className="text-gray-500">Quality Tested</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-gray-900 block">7-Day Easy Return</span>
                    <span className="text-gray-500">Hassle-free replacement</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <Truck className="w-4 h-4 text-[#F95721] shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-gray-900 block">Fast Dispatch</span>
                    <span className="text-gray-500">Vadodara &amp; Pan-India</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <Store className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-gray-900 block">Store Pickup</span>
                    <span className="text-gray-500">Subhanpura, Vadodara</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Assistance */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A859] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">Need help with this item?</span>
                  <span className="text-gray-600 text-[11px]">Chat with SBS team on WhatsApp</span>
                </div>
              </div>
              <a
                href={`https://wa.me/919226294797?text=Hi%20SBS%20Store%2C%20I%20have%20a%20question%20about%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#00A859] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0"
              >
                Chat Now
              </a>
            </div>
          </div>
        </div>

        {/* Specifications & Overview */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Product Overview &amp; Specifications
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Everyday utility tested by Shyam Bombay Sale (SBS Store).
            </p>
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="font-semibold text-gray-500">{spec.label}</span>
                    <span className="font-bold text-gray-900 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Action Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-lg flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
          <span className="text-lg font-black text-gray-900">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="w-full h-11 rounded-xl bg-orange-50 active:bg-orange-100 text-[#F95721] font-black text-xs border border-orange-200 flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{justAdded ? 'Added!' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F95721] to-[#E44813] active:brightness-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
