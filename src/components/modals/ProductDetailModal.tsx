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
  CheckCircle2, 
  HelpCircle, 
  Play, 
  Award,
  MessageCircle,
  FileText,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ResolvedImage, ResolvedVideo } from '../common/ResolvedMedia';
import { getProductMediaList, ProductMediaItem } from '@/lib/productMedia';
import { PincodeChecker } from '../common/PincodeChecker';
import { Product } from '@/types';

const SPEC_QUICK_PRESETS = [
  { label: 'Brand', value: 'SBS Certified' },
  { label: 'Model / SKU', value: 'SBS-2026-PRO' },
  { label: 'Condition', value: 'Brand New (100% Sealed)' },
  { label: 'Warranty', value: '6 Months Replacement Warranty' },
  { label: 'In The Box', value: '1x Main Unit, User Guide & Accessories' },
  { label: 'Material', value: 'Food Grade Stainless Steel & BPA-Free' },
  { label: 'Dimensions (L x W x H)', value: '22 x 14 x 8 cm' },
  { label: 'Item Weight', value: '380 grams' },
  { label: 'Capacity / Volume', value: '1.5 Litres' },
  { label: 'Color / Finish', value: 'Matte Pastel Slate' },
  { label: 'Power / Wattage', value: '45W Turbo Motor' },
  { label: 'Battery Backup', value: 'Up to 120 Mins Continuous Use' },
  { label: 'Charging Type', value: 'USB Type-C Fast Charging' },
  { label: 'Dispatch Origin', value: 'Mumbai Central Hub, India' },
  { label: 'Country of Origin', value: 'India' },
];

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductDetail, 
    setSelectedProductDetail, 
    productDetailStack,
    popProductDetail,
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveTab,
    coupons,
    products,
    showToast,
    updateProduct
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
  const [isScrolledPastImage, setIsScrolledPastImage] = useState(false);
  const [detailJustAdded, setDetailJustAdded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Specifications Inline Editor State
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [editingSpecsList, setEditingSpecsList] = useState<{ label: string; value: string }[]>([]);
  const [isSavingSpecs, setIsSavingSpecs] = useState(false);

  useEffect(() => {
    if (selectedProductDetail) {
      setQuantity(1);
      setActiveMediaIndex(0);
      setDragOffset(0);
      setIsDragging(false);
      setIsEditingSpecs(false);
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = null;
      setLightboxImage(null);
      setIsDescExpanded(false);
      setOpenAccordion(null);
      setCopiedCoupon(null);
      setIsScrolled(false);
      setIsScrolledPastImage(false);
      setDetailJustAdded(false);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('product', selectedProductDetail.id);
        window.history.replaceState({ product: selectedProductDetail.id }, '', url.toString());
      }
    } else if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('product')) {
        url.searchParams.delete('product');
        window.history.replaceState({}, '', url.toString());
      }
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

  const getProductShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?product=${encodeURIComponent(p.id)}`;
  };

  const handleShare = async () => {
    const productUrl = getProductShareUrl();
    const shareText = `Check out ${p.name} on SBS Store for only ₹${p.price.toLocaleString('en-IN')}!`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: p.name,
          text: shareText,
          url: productUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
        showToast('Product link copied to clipboard! 📋');
      }
    } catch {
      // User cancelled share or dismissed safely
    }
  };

  const handleWhatsAppShare = () => {
    const productUrl = getProductShareUrl();
    const text = encodeURIComponent(`Check out this deal on SBS Store: ${p.name} at ₹${p.price.toLocaleString('en-IN')}!\n${productUrl}`);
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
    setDetailJustAdded(true);
    if ('vibrate' in navigator) navigator.vibrate(12);
    showToast(`Added ${quantity} item(s) to Cart! 🛒`, 'success');
    setTimeout(() => setDetailJustAdded(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(p, quantity, e.currentTarget);
    if ('vibrate' in navigator) navigator.vibrate(10);
    setActiveTab('cart');
    setSelectedProductDetail(null);
  };

  // Back button navigation: pops previous product from history stack if available, or closes modal to home
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else if (productDetailStack.length > 0) {
      popProductDetail();
    } else {
      setSelectedProductDetail(null);
    }
  };

  const handleCloseAll = () => {
    setSelectedProductDetail(null);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const top = scrollContainerRef.current.scrollTop;
      setIsScrolled(top > 80);
      setIsScrolledPastImage(top > 250);
    }
  };

  const maxQty = Math.min(10, p.stockCount || 10);

  // Related products
  const relatedProducts = products
    .filter((item) => item.id !== p.id && (item.category === p.category || item.isTrending))
    .slice(0, 4);

  // Filter highlights: only keep genuine custom bullet points entered by the merchant
  // Filter out any legacy boilerplate defaults or auto-injected specification attributes
  const isDummyOrInjectedHighlight = (text: string) => {
    const lower = text.toLowerCase().trim();
    if (
      lower.includes('virgin plastic') ||
      lower.includes('pastel slate') ||
      lower.includes('6 months replacement') ||
      lower.includes('premium ergonomic design') ||
      lower.includes('certified durability tested') ||
      lower.includes('zero maintenance') ||
      lower.includes('compatible with indian standards') ||
      lower.includes('matte pastel slate') ||
      lower.includes('food grade stainless steel & bpa-free') ||
      lower.startsWith('material:') ||
      lower.startsWith('color:') ||
      lower.startsWith('warranty:') ||
      lower.startsWith('capacity:') ||
      lower.startsWith('dimensions:') ||
      lower.startsWith('weight:') ||
      lower.startsWith('dispatch origin:') ||
      lower.startsWith('country of origin:') ||
      lower.startsWith('brand:') ||
      lower.startsWith('condition:') ||
      lower.startsWith('in the box:')
    ) {
      return true;
    }
    return false;
  };

  const highlights = (p.features || [])
    .map((h) => (typeof h === 'string' ? h.trim() : ''))
    .filter((h) => h.length > 0 && !isDummyOrInjectedHighlight(h));

  // Filter description: only show if user actually added a real description (hide boilerplate default)
  const cleanDescription = (p.description || '').trim();
  const isPlaceholderDescription = cleanDescription === 'Everyday home essential from SBS Store.' || cleanDescription.toLowerCase() === 'everyday home essential from sbs store.';
  const hasDescriptionBlocks = Boolean(p.descriptionBlocks && p.descriptionBlocks.length > 0);
  const hasValidDescription = (cleanDescription.length > 0 && !isPlaceholderDescription) || hasDescriptionBlocks;

  // Specifications
  const specs = (p.specifications && p.specifications.length > 0) ? p.specifications : [
    { label: 'Brand', value: 'SBS Certified' },
    { label: 'Category', value: p.category.replace(/--/g, ' & ').replace(/-/g, ' ') },
    { label: 'Subcategory', value: (p.subcategory || 'General').replace(/--/g, ' & ').replace(/-/g, ' ') },
    { label: 'Condition', value: 'Brand New (100% Sealed)' },
    { label: 'Warranty', value: '6 Months Manufacturer Support' },
    { label: 'In The Box', value: '1x Main Unit, User Guide & Accessories' },
    { label: 'Dispatch Origin', value: 'Mumbai Central Hub, India' },
  ];

  const handleStartEditSpecs = () => {
    setEditingSpecsList(specs.map(s => ({ ...s })));
    setIsEditingSpecs(true);
  };

  const handleCancelEditSpecs = () => {
    setIsEditingSpecs(false);
  };

  const handleUpdateEditingSpec = (index: number, field: 'label' | 'value', val: string) => {
    setEditingSpecsList(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: val };
      }
      return next;
    });
  };

  const handleMoveEditingSpec = (index: number, direction: 'up' | 'down') => {
    setEditingSpecsList(prev => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleDeleteEditingSpec = (index: number) => {
    setEditingSpecsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewSpecRow = () => {
    setEditingSpecsList(prev => [...prev, { label: '', value: '' }]);
  };

  const handleAddPresetToEditing = (preset: { label: string; value: string }) => {
    setEditingSpecsList(prev => {
      const exists = prev.some(s => s.label.toLowerCase() === preset.label.toLowerCase());
      if (exists) {
        showToast(`"${preset.label}" is already in specifications`, 'info');
        return prev;
      }
      return [...prev, { label: preset.label, value: preset.value }];
    });
  };

  const handleSaveSpecs = async () => {
    if (!p) return;
    const cleaned = editingSpecsList
      .map(s => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter(s => s.label.length > 0 || s.value.length > 0);

    setIsSavingSpecs(true);
    try {
      updateProduct(p.id, { specifications: cleaned });
      showToast('Product specifications updated successfully! ✨', 'success');
      setIsEditingSpecs(false);
    } catch (err) {
      console.error('Failed to save specifications:', err);
      showToast('Failed to save specifications', 'error');
    } finally {
      setIsSavingSpecs(false);
    }
  };

  // Feature icon strip (optional - only shown if specified on product)
  const featureIcons = p.featureIcons && p.featureIcons.length > 0 ? p.featureIcons : [];

  return (
    <>
      {/* 
        Full-Page Mobile Experience & Centered Dialogue on Desktop:
        On mobile: fills 100% of height and width (h-full h-dvh), rounded-none, flush with top.
        NO upside blank space showing home page behind it!
      */}
      <div 
        className="fixed inset-0 z-[100] bg-white sm:bg-black/60 sm:backdrop-blur-xs flex sm:items-center justify-center overflow-x-hidden animate-fadeIn"
        onClick={handleCloseAll}
      >
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="bg-white w-full h-full h-dvh sm:h-auto sm:max-h-[92vh] sm:max-w-lg rounded-none sm:rounded-3xl shadow-2xl flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ======================================================== */}
          {/* 1. STICKY TOP APP BAR                                   */}
          {/* ======================================================== */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between transition-all sticky-gpu">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              <button
                onClick={handleBack}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer active:scale-95"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5px]" />
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
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer active:scale-95"
                title="Share Product"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer active:scale-95 ${
                  wishlisted 
                    ? 'bg-rose-50 text-rose-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              {/* Desktop Close Button */}
              <button
                onClick={handleCloseAll}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5 pb-28">
            {/* ======================================================== */}
            {/* 2. PRODUCT GALLERY (Seamless Pure White Canvas)         */}
            {/* Pure white background with mix-blend-multiply eliminates */}
            {/* any 'box inside a box' white border artifact!          */}
            {/* ======================================================== */}
            <div className="space-y-3">
              <div 
                className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden select-none group cursor-grab active:cursor-grabbing touch-pan-y"
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
                  className="w-full h-full flex bg-white"
                  style={{
                    transform: `translateX(calc(-${activeMediaIndex * 100}% + ${dragOffset}px))`,
                    transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform',
                  }}
                >
                  {mediaList.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="w-full h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden bg-white"
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
                          className="w-full h-full flex items-center justify-center cursor-zoom-in p-4 bg-white"
                          onClick={() => {
                            if (Math.abs(dragOffset) > 5) return;
                            setLightboxImage(item.url);
                          }}
                        >
                          <ResolvedImage
                            src={item.url}
                            alt={`${p.name} view ${idx + 1}`}
                            className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Badges Top-Left */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {p.isBestSeller && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> BESTSELLER
                    </span>
                  )}
                  {p.isDealOfDay && (
                    <span className="px-2.5 py-1 bg-[#F95721] text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Zap className="w-3 h-3" /> DEAL OF DAY
                    </span>
                  )}
                  {p.discountPercentage > 20 && !p.isDealOfDay && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-xs">
                      {p.discountPercentage}% OFF
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
                    className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-gray-700 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-800 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextMedia();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md text-gray-800 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row (seamless white cards with right gradient fade) */}
              {mediaList.length > 1 && (
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 pr-8">
                    {mediaList.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 bg-white transition-all cursor-pointer ${
                          activeMediaIndex === idx
                            ? 'border-[#F95721] ring-2 ring-orange-200 shadow-xs'
                            : 'border-gray-200/80 opacity-70 hover:opacity-100 hover:border-gray-300'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white p-1">
                            <ResolvedImage
                              src={item.url}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Subtle right gradient fade indicating more thumbnails */}
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 3. PRODUCT TITLE, SUBTITLE & RATINGS                     */}
            {/* ======================================================== */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <span className="text-[#F95721]">{p.category.replace(/--/g, ' & ').replace(/-/g, ' ')}</span>
                {p.subcategory && (
                  <>
                    <span>•</span>
                    <span>{p.subcategory.replace(/--/g, ' & ').replace(/-/g, ' ')}</span>
                  </>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-snug tracking-tight">
                {p.name}
              </h1>

              {/* Only show custom subtitle if provided by seller */}
              {p.subtitle && p.subtitle.trim() && (
                <p className="text-xs text-gray-600 leading-relaxed">{p.subtitle.trim()}</p>
              )}

              {/* Verified Product Badge */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#00A859] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>Verified Genuine</span>
                </span>
                <span className="text-xs font-medium text-gray-500">
                  100% Quality Checked by SBS Store
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 4. PRICE STACK & OFFERS BADGE                            */}
            {/* ======================================================== */}
            <div className="p-4 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/20 border border-orange-200/70 rounded-2xl space-y-2.5">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
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

              <div className="flex items-center justify-between text-xs text-gray-600 font-medium pt-0.5">
                <span>Inclusive of all taxes</span>
                <div className="flex items-center gap-1.5 text-[#00A859] font-bold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free Express Delivery Available</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 5. 3 TRUST PILLARS                                       */}
            {/* ======================================================== */}
            <div className="grid grid-cols-3 gap-2.5 py-0.5">
              <div className="bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#F95721]" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">7 Days Return</span>
              </div>
              <div className="bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-[#00A859]" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">Cash on Delivery</span>
              </div>
              <div className="bg-gray-50/80 border border-gray-200/70 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-gray-800 leading-tight">SBS Certified</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 6. QUANTITY STEPPER                                      */}
            {/* ======================================================== */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl">
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
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center font-black text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="w-9 h-9 rounded-lg bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-[#F95721] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Page Action Buttons (Always accessible right below product options) */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-3 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer ${
                  detailJustAdded
                    ? 'bg-[#00A859] text-white border-2 border-[#00A859] scale-[1.02] shadow-emerald-200'
                    : 'bg-white hover:bg-orange-50 text-[#F95721] border-2 border-[#F95721]'
                }`}
              >
                {detailJustAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>✓ Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3 px-3 bg-gradient-to-r from-[#F95721] to-[#E44813] hover:from-[#E44813] hover:to-[#D43D0A] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-200 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
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

                <div className="relative">
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pr-8">
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
                  {/* Subtle right gradient fade indicating more coupons */}
                  <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. PINCODE DELIVERY ESTIMATOR                            */}
            {/* ======================================================== */}
            <PincodeChecker />

            {/* ======================================================== */}
            {/* 9. PRODUCT HIGHLIGHTS (ONLY SHOWN IF ADDED BY SELLER)    */}
            {/* ======================================================== */}
            {highlights.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-subtle">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F95721]" />
                  Product Highlights
                </h3>
                <ul className="space-y-2.5">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-[#00A859] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ======================================================== */}
            {/* 10. OPTIONAL FEATURE ICON STRIP (SHOWN ONLY IF SET)      */}
            {/* ======================================================== */}
            {featureIcons.length > 0 && (
              <div className={`grid gap-2 ${featureIcons.length === 1 ? 'grid-cols-1' : featureIcons.length === 2 ? 'grid-cols-2' : featureIcons.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {featureIcons.map((f, i) => (
                  <div key={i} className="bg-orange-50/50 border border-orange-100 rounded-2xl p-2.5 text-center flex flex-col items-center gap-1 shadow-2xs">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-1">{f.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ======================================================== */}
            {/* 11. DETAILED DESCRIPTION (ONLY SHOWN IF ADDED BY SELLER) */}
            {/* ======================================================== */}
            {hasValidDescription && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2.5 shadow-subtle">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F95721]" />
                  Product Description
                </h3>
                <div className={`text-xs text-gray-600 leading-relaxed space-y-2.5 ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                  {cleanDescription && !isPlaceholderDescription && (
                    <p className="whitespace-pre-line">{cleanDescription}</p>
                  )}
                  {hasDescriptionBlocks && (
                    <div className="space-y-3 pt-1">
                      {p.descriptionBlocks!.map((block, idx) => (
                        <div key={idx} className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl space-y-1.5">
                          {block.title && <h4 className="font-bold text-gray-900 text-xs">{block.title}</h4>}
                          {block.text && <p className="text-xs text-gray-600">{block.text}</p>}
                          {block.image && (
                            <div className="aspect-video w-full rounded-lg overflow-hidden mt-1.5 bg-white">
                              <ResolvedImage src={block.image} alt={block.title || 'Feature'} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {(cleanDescription.length > 180 || hasDescriptionBlocks) && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs font-extrabold text-[#F95721] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <span>{isDescExpanded ? 'Read Less' : 'Read More'}</span>
                    {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 12. SPECIFICATIONS TABLE & INLINE EDITOR                 */}
            {/* ======================================================== */}
            {!isEditingSpecs ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#F95721]" />
                    Product Specifications
                  </h3>
                  <button
                    type="button"
                    onClick={handleStartEditSpecs}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F95721] hover:text-[#E44813] bg-orange-50 hover:bg-orange-100/80 px-2.5 py-1 rounded-lg border border-orange-200/80 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Edit product specifications"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Specs</span>
                  </button>
                </div>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                  {specs.map((spec, i) => (
                    <div key={i} className={`flex py-2.5 px-3 ${i % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}`}>
                      <span className="w-2/5 font-bold text-gray-600">{spec.label}</span>
                      <span className="w-3/5 font-semibold text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-[#F95721]/30 rounded-2xl p-3.5 space-y-3 shadow-md animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#F95721]" />
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      Edit Specifications
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCancelEditSpecs}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSpecs}
                      disabled={isSavingSpecs}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#F95721] hover:bg-[#E44813] rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSpecs ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Add Common Attribute:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {SPEC_QUICK_PRESETS.map((preset) => {
                      const isAdded = editingSpecsList.some(
                        (s) => s.label.toLowerCase() === preset.label.toLowerCase()
                      );
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleAddPresetToEditing(preset)}
                          className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-orange-50 text-[#F95721] border-orange-200/80 hover:bg-orange-100'
                          }`}
                          disabled={isAdded}
                        >
                          + {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specifications List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {editingSpecsList.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-gray-50/90 p-2 rounded-xl border border-gray-200/70 text-xs"
                    >
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => handleUpdateEditingSpec(i, 'label', e.target.value)}
                        placeholder="Label"
                        className="w-2/5 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:border-[#F95721]"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleUpdateEditingSpec(i, 'value', e.target.value)}
                        placeholder="Value"
                        className="w-3/5 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#F95721]"
                      />
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveEditingSpec(i, 'up')}
                          disabled={i === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEditingSpec(i, 'down')}
                          disabled={i === editingSpecsList.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEditingSpec(i)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Row Button */}
                <button
                  type="button"
                  onClick={handleAddNewSpecRow}
                  className="w-full py-2 border-2 border-dashed border-orange-200 hover:border-[#F95721] rounded-xl text-xs font-bold text-[#F95721] hover:bg-orange-50/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Specification Field</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* 13. ACCORDIONS: Shipping, Return & Refund, FAQs          */}
            {/* ======================================================== */}
            <div className="space-y-2">
              {/* Shipping & Delivery Accordion */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
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
                    <p>• Real-time SMS and WhatsApp tracking links are sent as soon as courier picks up the parcel.</p>
                  </div>
                )}
              </div>

              {/* Return & Refund Policy Accordion */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('return')}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
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
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
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
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Share
              </button>
            </div>

            {/* ======================================================== */}
            {/* 16. YOU MAY ALSO LIKE (Related Products Grid)            */}
            {/* Seamless white product cards without grey box border     */}
            {/* ======================================================== */}
            {relatedProducts.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F95721]" />
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
                      <div className="aspect-square w-full rounded-xl bg-white border border-gray-100 overflow-hidden mb-2 relative flex items-center justify-center p-2">
                        <ResolvedImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                        {item.discountPercentage > 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#F95721] text-white text-[10px] font-black rounded-md shadow-xs">
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
          {/* Appears once user scrolls past main product image        */}
          {/* ======================================================== */}
          <div className={`sticky bottom-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3 shadow-lg sticky-gpu safe-bottom transition-all duration-300 ${
            isScrolledPastImage 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : 'translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'
          }`}>
            {/* Price Column */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900 tracking-tight">
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
                className={`flex-1 py-3 px-2 font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer ${
                  detailJustAdded
                    ? 'bg-[#00A859] text-white border-2 border-[#00A859] scale-[1.02] shadow-emerald-200'
                    : 'bg-white hover:bg-orange-50 text-[#F95721] border-2 border-[#F95721]'
                }`}
              >
                {detailJustAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>✓ Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3 px-2 bg-gradient-to-r from-[#F95721] to-[#E44813] hover:from-[#E44813] hover:to-[#D43D0A] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-200 active:scale-95 transition-all cursor-pointer"
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
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer"
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
