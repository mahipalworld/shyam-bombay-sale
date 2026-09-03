import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductStories } from '@/components/ProductStories';
import { ScratchCardModal } from '@/components/modals/ScratchCardModal';
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Timer,
  Gift,
  Zap,
  Flame
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    products, 
    categories, 
    homepageCategories, 
    homepageSubcategories,
    flashDealConfig,
    storeSettings,
    setActiveTab, 
    setSelectedCategoryFilter, 
    setSelectedSubcategoryFilter,
    setSelectedProductDetail
  } = useStore();

  const [activeCategoryPill, setActiveCategoryPill] = React.useState<string>('all');
  const [activeHeroSlide, setActiveHeroSlide] = React.useState(0);
  const [isScratchModalOpen, setIsScratchModalOpen] = React.useState(false);
  const [isHeroPaused, setIsHeroPaused] = React.useState(false);
  const [countdown, setCountdown] = React.useState({ 
    hours: flashDealConfig?.hoursRemaining || 4, 
    minutes: 18, 
    seconds: 42 
  });
  
  const subcategoryScrollRef = React.useRef<HTMLDivElement>(null);
  const touchStartXRef = React.useRef<number | null>(null);
  const touchEndXRef = React.useRef<number | null>(null);
  const isMouseDownRef = React.useRef(false);

  // Live Flash Deal Countdown Timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: flashDealConfig?.hoursRemaining || 4, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashDealConfig?.hoursRemaining]);

  // Auto-slide Hero Carousel with pause
  React.useEffect(() => {
    if (isHeroPaused) return;
    const heroTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, [isHeroPaused]);

  // Touch & Mouse Swipe Handlers
  const handleHeroTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
    setIsHeroPaused(true);
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleHeroTouchEnd = () => {
    setIsHeroPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      setActiveHeroSlide((prev) => (prev + 1) % 3);
    } else if (distance < -45) {
      setActiveHeroSlide((prev) => (prev - 1 + 3) % 3);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleHeroMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = null;
    setIsHeroPaused(true);
  };

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    touchEndXRef.current = e.clientX;
  };

  const handleHeroMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsHeroPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      setActiveHeroSlide((prev) => (prev + 1) % 3);
    } else if (distance < -45) {
      setActiveHeroSlide((prev) => (prev - 1 + 3) % 3);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleHeroPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroSlide((prev) => (prev - 1 + 3) % 3);
  };

  const handleHeroNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroSlide((prev) => (prev + 1) % 3);
  };

  const visibleCategories = categories.filter((cat) => {
    if (cat.showOnHome !== undefined) return cat.showOnHome;
    if (homepageCategories && homepageCategories.length > 0) return homepageCategories.includes(cat.id);
    return true;
  });

  // Prepare active featured subcategories list with minPrice
  const featuredSubcategoryItems = React.useMemo(() => {
    if (!homepageSubcategories || homepageSubcategories.length === 0) return [];
    
    const list: {
      categoryId: string;
      cat: typeof categories[0];
      sub: NonNullable<typeof categories[0]['subcategories']>[0];
      productCount: number;
      minPrice: number | null;
    }[] = [];

    homepageSubcategories.forEach((item) => {
      const parentCat = categories.find((c) => c.id === item.categoryId);
      if (!parentCat || !parentCat.subcategories) return;
      const subMatch = parentCat.subcategories.find((s) => s.id === item.subcategoryId);
      if (!subMatch) return;

      const subProducts = products.filter(
        (p) => p.category === item.categoryId && p.subcategory === item.subcategoryId
      );
      const count = subProducts.length;
      const minPrice = count > 0 ? Math.min(...subProducts.map((p) => p.price)) : null;

      list.push({
        categoryId: item.categoryId,
        cat: parentCat,
        sub: subMatch,
        productCount: count,
        minPrice,
      });
    });

    return list;
  }, [homepageSubcategories, categories, products]);

  // Unique parent categories for filter chips
  const availableCategoryPills = React.useMemo(() => {
    const seen = new Set<string>();
    const list: typeof categories[0][] = [];
    featuredSubcategoryItems.forEach((item) => {
      if (!seen.has(item.categoryId)) {
        seen.add(item.categoryId);
        list.push(item.cat);
      }
    });
    return list;
  }, [featuredSubcategoryItems]);

  const filteredSubcategoryItems = React.useMemo(() => {
    if (activeCategoryPill === 'all') return featuredSubcategoryItems;
    return featuredSubcategoryItems.filter((item) => item.categoryId === activeCategoryPill);
  }, [featuredSubcategoryItems, activeCategoryPill]);

  const scrollSubcategories = (direction: 'left' | 'right') => {
    if (subcategoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      subcategoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const trendingProducts = products.filter((p) => p.isTrending || p.id === 'p1' || p.id === 'p2');
  const bestSellers = products.filter((p) => p.isBestSeller || p.id === 'p4' || p.id === 'p5' || p.id === 'p6');

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setSelectedSubcategoryFilter(null);
    setActiveTab('categories');
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setSelectedSubcategoryFilter(subcategoryId);
    setActiveTab('categories');
  };

  const handleHeroProductClick = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSelectedProductDetail(found);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 animate-fadeIn">
      {/* 1. Instagram-Style Product Stories Bar */}
      <section className="pt-1">
        <ProductStories />
      </section>

      {/* 2. Interactive Multi-Slide Hero Banner with Touch/Mouse Swipe & Arrow Controls */}
      <section className="relative">
        <div 
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => {
            setIsHeroPaused(false);
            isMouseDownRef.current = false;
          }}
          onTouchStart={handleHeroTouchStart}
          onTouchMove={handleHeroTouchMove}
          onTouchEnd={handleHeroTouchEnd}
          onMouseDown={handleHeroMouseDown}
          onMouseMove={handleHeroMouseMove}
          onMouseUp={handleHeroMouseUp}
          className="group/hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFEAD9] border border-[#FFE2D1] p-5 sm:p-7 md:p-10 shadow-sm min-h-[220px] sm:min-h-[260px] flex flex-col justify-between select-none cursor-grab active:cursor-grabbing transition-all"
        >
          {/* Decorative background glow circle */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Previous / Next Arrow Controls */}
          <button
            onClick={handleHeroPrev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleHeroNext}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide 0: Smart Products. Better Prices. */}
          {activeHeroSlide === 0 && (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeIn">
              <div className="max-w-md space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-[#F95721] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Special Everyday Collection
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  Smart Products. <br />
                  <span className="text-[#F95721]">Better Prices.</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium line-clamp-2">
                  Everyday essentials designed for a smarter, cleaner, and easier you.
                </p>
                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#F95721] hover:bg-[#E44813] text-white text-xs md:text-sm font-bold rounded-xl shadow-float active:scale-95 transition-all"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsScratchModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-3 bg-white/90 hover:bg-white text-gray-800 text-xs md:text-sm font-bold rounded-xl border border-orange-200 shadow-2xs transition-all tap-active"
                  >
                    <Gift className="w-3.5 h-3.5 text-[#F95721]" />
                    <span>Scratch & Win</span>
                  </button>
                </div>
              </div>

              {/* Collage Image Showcase */}
              <div className="relative flex items-center justify-center md:justify-end mt-1 md:mt-0">
                <div className="relative w-full max-w-[320px] h-40 md:h-52 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80"
                    alt="Washing Machine"
                    onClick={() => handleHeroProductClick('p1')}
                    className="w-24 sm:w-28 md:w-34 h-24 sm:h-28 md:h-34 object-contain rounded-2xl drop-shadow-xl transform -rotate-6 hover:scale-105 active:scale-95 transition-transform bg-white/90 p-2 cursor-pointer tap-active"
                    title="View Mini Washing Machine"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80"
                    alt="Trimmer"
                    onClick={() => handleHeroProductClick('p4')}
                    className="w-22 sm:w-26 md:w-30 h-24 sm:h-28 md:h-34 object-contain -ml-6 rounded-2xl drop-shadow-xl transform rotate-6 hover:scale-105 active:scale-95 transition-transform bg-white/90 p-2 cursor-pointer tap-active"
                    title="View Cordless Trimmer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Slide 1: Live Flash Deals Countdown */}
          {activeHeroSlide === 1 && (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeIn">
              <div className="max-w-md space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-black shadow-xs animate-pulse">
                    <Flame className="w-3.5 h-3.5" /> {flashDealConfig?.badgeText || 'LIVE FLASH SALE'}
                  </span>
                  <span className="text-xs font-black text-gray-700">{flashDealConfig?.discountText || 'Up to 55% Off'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  {flashDealConfig?.title || 'Deals of the Day'} <br />
                  <span className="text-[#F95721]">Limited Time Only</span>
                </h2>

                {/* Live Countdown Ticker */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Timer className="w-4 h-4 text-[#F95721]" /> Ends in:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-white">
                    <span className="bg-gray-900 px-2 py-1 rounded-lg">
                      {String(countdown.hours).padStart(2, '0')}h
                    </span>
                    <span className="text-gray-800 font-bold">:</span>
                    <span className="bg-gray-900 px-2 py-1 rounded-lg">
                      {String(countdown.minutes).padStart(2, '0')}m
                    </span>
                    <span className="text-gray-800 font-bold">:</span>
                    <span className="bg-[#F95721] px-2 py-1 rounded-lg">
                      {String(countdown.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter('offers');
                      setActiveTab('categories');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#F95721] hover:bg-[#E44813] text-white text-xs md:text-sm font-bold rounded-xl shadow-float active:scale-95 transition-all"
                  >
                    <span>Claim Flash Deals</span>
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flash Deal Visual Hero */}
              <div className="relative flex items-center justify-center md:justify-end">
                <div 
                  onClick={() => handleHeroProductClick(flashDealConfig?.productId || 'p3')}
                  className="bg-white/95 rounded-2xl p-4 shadow-xl border border-orange-200 max-w-[260px] w-full flex flex-col items-center cursor-pointer group tap-active"
                >
                  <span className="self-start text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    {flashDealConfig?.discountText || '55% OFF'}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flashDealConfig?.productImage || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80'}
                    alt={flashDealConfig?.productName || 'Flash Deal Item'}
                    className="w-28 h-28 object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-xs font-extrabold text-gray-900 text-center line-clamp-1">
                    {flashDealConfig?.productName || 'Portable Food Packet Sealer'}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-[#F95721]">₹{flashDealConfig?.dealPrice || 199}</span>
                    <span className="text-[10px] text-gray-400 line-through">₹{flashDealConfig?.originalPrice || 499}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Smart Lightings & Ambience */}
          {activeHeroSlide === 2 && (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeIn">
              <div className="max-w-md space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-purple-600 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Room Aesthetic Upgrade
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  Smart Sunset & <br />
                  <span className="text-purple-600">Ambient Lightings</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                  Transform any room into a cozy, aesthetic sanctuary from just ₹149.
                </p>
                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter('home');
                      setSelectedSubcategoryFilter('lightings');
                      setActiveTab('categories');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-float active:scale-95 transition-all"
                  >
                    <span>Explore Lightings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sunset Lamp Showcase */}
              <div className="relative flex items-center justify-center md:justify-end">
                <div 
                  onClick={() => handleHeroProductClick('p2')}
                  className="bg-white/95 rounded-2xl p-4 shadow-xl border border-purple-200 max-w-[260px] w-full flex flex-col items-center cursor-pointer group tap-active"
                >
                  <span className="self-start text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                    Bestseller
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80"
                    alt="Sunset Lamp"
                    className="w-28 h-28 object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-xs font-extrabold text-gray-900 text-center line-clamp-1">
                    Romantic Sunset Projection Lamp
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-purple-600">₹399</span>
                    <span className="text-[10px] text-gray-400 line-through">₹799</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dots Carousel Navigation */}
          <div className="relative z-10 flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeHeroSlide === idx
                    ? 'w-6 bg-[#F95721]'
                    : 'w-2 bg-orange-200/80 hover:bg-orange-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scratch & Win Modal */}
      <ScratchCardModal
        isOpen={isScratchModalOpen}
        onClose={() => setIsScratchModalOpen(false)}
      />

      {/* Feature / Trust Badges Strip */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {/* Free Express Delivery */}
        <div className="bg-gradient-to-b from-orange-50/50 via-white to-white border border-orange-100/70 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 shadow-xs hover:shadow-sm hover:border-orange-200 transition-all group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-100/80 text-[#F95721] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-900 leading-snug">
              <span className="sm:hidden">Free Delivery</span>
              <span className="hidden sm:inline">Free Express Delivery</span>
            </h4>
            <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight">
              <span className="sm:hidden">Above ₹1,700</span>
              <span className="hidden sm:inline">On all orders above ₹1,700</span>
            </p>
          </div>
        </div>

        {/* 7 Days Easy Return */}
        <div className="bg-gradient-to-b from-emerald-50/50 via-white to-white border border-emerald-100/70 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 shadow-xs hover:shadow-sm hover:border-emerald-200 transition-all group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-100/80 text-[#00A859] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-900 leading-snug">
              <span className="sm:hidden">7 Days Return</span>
              <span className="hidden sm:inline">7 Days Easy Return</span>
            </h4>
            <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight">
              <span className="sm:hidden">Easy replacement</span>
              <span className="hidden sm:inline">Hassle-free replacement</span>
            </p>
          </div>
        </div>

        {/* SBS Quality Certified */}
        <div className="bg-gradient-to-b from-blue-50/50 via-white to-white border border-blue-100/70 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 shadow-xs hover:shadow-sm hover:border-blue-200 transition-all group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-100/80 text-[#0284C7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-900 leading-snug">
              <span className="sm:hidden">100% Genuine</span>
              <span className="hidden sm:inline">SBS Quality Certified</span>
            </h4>
            <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight">
              <span className="sm:hidden">Quality verified</span>
              <span className="hidden sm:inline">100% Genuine products</span>
            </p>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-xs text-gray-500 hidden sm:block">Explore all daily life and home categories</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSelectedSubcategoryFilter(null);
              setActiveTab('categories');
            }}
            className="text-xs md:text-sm font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-2 group tap-active"
            >
              <div 
                style={{ backgroundColor: cat.bgColor }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center p-2.5 border border-black/5 group-hover:scale-105 transition-transform shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="text-[11px] md:text-xs font-bold text-gray-800 text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Quick-Commerce Aisles & Subcategories Capsule Carousel */}
      {featuredSubcategoryItems.length > 0 && (
        <section className="space-y-3.5 bg-gradient-to-b from-orange-50/50 via-[#FFF9F5]/40 to-transparent p-4 sm:p-5 -mx-3 sm:-mx-4 md:mx-0 rounded-3xl border border-orange-100/60 shadow-2xs">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-orange-100/90 text-[#F95721] flex items-center justify-center flex-shrink-0 text-sm sm:text-base shadow-xs">
                ✨
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight">
                    Explore Curated Aisles
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-orange-500/10 text-[#F95721] text-[10px] font-extrabold uppercase tracking-wide">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Swipe through curated spaces, smart utilities & collections
                </p>
              </div>
            </div>

            {/* Carousel Controls & See All */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop Scroll Arrows */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => scrollSubcategories('left')}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200/90 text-gray-700 hover:bg-orange-50 hover:text-[#F95721] hover:border-orange-200 shadow-xs flex items-center justify-center transition-all active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollSubcategories('right')}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200/90 text-gray-700 hover:bg-orange-50 hover:text-[#F95721] hover:border-orange-200 shadow-xs flex items-center justify-center transition-all active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setSelectedSubcategoryFilter(null);
                  setActiveTab('categories');
                }}
                className="text-xs md:text-sm font-bold text-[#F95721] hover:text-[#E44813] flex items-center gap-0.5 ml-1 hover:underline"
              >
                <span>All Aisles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {availableCategoryPills.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => {
                  setActiveCategoryPill('all');
                  subcategoryScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                  activeCategoryPill === 'all'
                    ? 'bg-[#F95721] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeCategoryPill === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {featuredSubcategoryItems.length}
                </span>
              </button>

              {availableCategoryPills.map((cat) => {
                const count = featuredSubcategoryItems.filter((i) => i.categoryId === cat.id).length;
                const isActive = activeCategoryPill === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategoryPill(cat.id);
                      subcategoryScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Swipeable Capsule Cards Row */}
          <div
            ref={subcategoryScrollRef}
            className="flex items-stretch gap-3 md:gap-3.5 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth"
          >
            {filteredSubcategoryItems.map((item) => (
              <div
                key={`${item.categoryId}-${item.sub.id}`}
                onClick={() => handleSubcategoryClick(item.categoryId, item.sub.id)}
                className="group relative flex-shrink-0 w-[126px] sm:w-[145px] md:w-[155px] flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-3xl bg-white border border-gray-100 hover:border-orange-300 shadow-2xs hover:shadow-card transition-all duration-300 cursor-pointer tap-active select-none"
              >
                {/* Ambient Category Pastel Top Glow */}
                <div
                  style={{ backgroundColor: item.cat.bgColor || '#FFF0E6' }}
                  className="absolute top-0 inset-x-0 h-24 rounded-t-3xl opacity-50 group-hover:opacity-80 transition-opacity"
                />

                {/* Top Badge: Parent Category Name */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <span
                    style={{ color: item.cat.accentColor || '#EA580C' }}
                    className="text-[9px] font-black uppercase tracking-wider line-clamp-1 text-center bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-black/5 shadow-2xs"
                  >
                    {item.cat.name}
                  </span>
                </div>

                {/* Floating Bubble Avatar */}
                <div className="relative z-10 my-2">
                  <div
                    style={{ borderColor: `${item.cat.accentColor || '#F95721'}30` }}
                    className="w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl sm:rounded-3xl bg-white p-2.5 shadow-xs border flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.sub.image || item.cat.image}
                      alt={item.sub.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                </div>

                {/* Subcategory Name & Price / Item Badge */}
                <div className="relative z-10 w-full text-center space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-2 leading-tight min-h-[30px] sm:min-h-[34px] flex items-center justify-center group-hover:text-[#F95721] transition-colors">
                    {item.sub.name}
                  </h3>

                  <div className="flex items-center justify-center">
                    {item.minPrice ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#F95721] bg-orange-50/90 border border-orange-200/70 px-2 py-0.5 rounded-full">
                        From ₹{item.minPrice}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.productCount} items
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Most loved products this week</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs md:text-sm font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Today's Deals Section (Promo Cards matching Screenshot) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Today&apos;s Deals</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Special flash discounts and combos</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter('offers');
              setActiveTab('categories');
            }}
            className="text-xs md:text-sm font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deal Card 1: Daily Essentials */}
          <div
            onClick={() => handleCategoryClick('cleaning')}
            className="cursor-pointer bg-gradient-to-r from-[#FFF5EC] to-[#FFEFE4] border border-[#FEDDC7] rounded-3xl p-5 flex items-center justify-between hover:shadow-card transition-all tap-active"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flash Deal</span>
              <h3 className="text-2xl md:text-3xl font-black text-[#F95721]">40% OFF</h3>
              <p className="text-sm font-bold text-gray-900">On Daily Essentials</p>
              <p className="text-xs text-gray-500">Limited time only!</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F95721] pt-1">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="w-28 h-28 md:w-32 md:h-32 bg-white/80 rounded-2xl p-2.5 flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80"
                alt="Daily Essentials Deal"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Deal Card 2: Personal Care */}
          <div
            onClick={() => handleCategoryClick('personal-care')}
            className="cursor-pointer bg-gradient-to-r from-[#FFF5EC] to-[#FFEFE4] border border-[#FEDDC7] rounded-3xl p-5 flex items-center justify-between hover:shadow-card transition-all tap-active"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Offer</span>
              <h3 className="text-2xl md:text-3xl font-black text-[#F95721]">35% OFF</h3>
              <p className="text-sm font-bold text-gray-900">On Personal Care</p>
              <p className="text-xs text-gray-500">Hurry, Limited Stock!</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F95721] pt-1">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="w-28 h-28 md:w-32 md:h-32 bg-white/80 rounded-2xl p-2.5 flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&auto=format&fit=crop&q=80"
                alt="Personal Care Deal"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Customer top picks with 4.5+ star reviews</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs md:text-sm font-bold text-[#F95721] flex items-center gap-0.5 hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
