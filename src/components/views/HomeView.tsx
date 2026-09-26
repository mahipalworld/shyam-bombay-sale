'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductStories } from '@/components/ProductStories';
import { ScratchCardModal } from '@/components/modals/ScratchCardModal';
import { NotificationRewardCard } from '@/components/modals/NotificationRewardPrompt';
import { ResolvedImage } from '@/components/common/ResolvedMedia';
import { Product, QuickActionItem, HeroBannerItem, TodayDealItem } from '@/types';
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
  Flame,
  Star,
  ExternalLink,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ChevronDown,
  HelpCircle,
  Store
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    products, 
    categories, 
    homepageCategories, 
    homepageSubcategories,
    heroBanners,
    quickActions,
    todayDeals,
    trendingNowProducts,
    bestSellersConfig,
    homepageSections,
    flashDealConfig,
    storeSettings,
    setActiveTab, 
    setSelectedCategoryFilter, 
    setSelectedSubcategoryFilter,
    setSelectedProductDetail,
    recentlyViewedIds
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
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
  
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

  // Categories Filtered by Homepage Settings (resilient to deleted test category IDs)
  const visibleCategories = React.useMemo(() => {
    if (homepageCategories && homepageCategories.length > 0) {
      const filtered = categories.filter((cat) => homepageCategories.includes(cat.id) && cat.showOnHome !== false);
      if (filtered.length > 0) return filtered;
    }
    // Graceful fallback: Show all active categories that have not explicitly disabled home visibility
    return categories.filter((cat) => cat.showOnHome !== false);
  }, [categories, homepageCategories]);

  const visibleCategoryIds = React.useMemo(
    () => new Set(visibleCategories.map(c => c.id)),
    [visibleCategories]
  );

  // Active Hero Slides: user-configured heroBanners plus live Flash Deal slide if enabled
  const activeSlides = React.useMemo(() => {
    const slides: {
      type: 'banner' | 'flash';
      banner?: HeroBannerItem;
      product?: Product | null;
    }[] = [];

    // User configured hero banners
    const liveBanners = heroBanners.filter((b) => b.enabled !== false);
    liveBanners.forEach((b) => {
      const prod = b.productId ? products.find(p => p.id === b.productId) : null;
      slides.push({
        type: 'banner',
        banner: b,
        product: prod || null
      });
    });

    // Flash Deal slide if flash deals enabled
    if (storeSettings.enableFlashDeals !== false && flashDealConfig?.enabled !== false) {
      const flashProd = (flashDealConfig?.productId ? products.find(p => p.id === flashDealConfig.productId) : null) || products[0] || null;
      if (flashProd) {
        slides.push({
          type: 'flash',
          product: flashProd
        });
      }
    }

    // Fallback if no slides exist
    if (slides.length === 0) {
      const defaultProd = products[0] || null;
      slides.push({
        type: 'banner',
        banner: {
          id: 'default_banner',
          heading: 'Everyday Essentials Sale',
          description: 'Smart products, better prices directly from SBS.',
          image: defaultProd?.image || '/icon-512x512.png?v=2',
          ctaText: 'Shop Now',
          ctaDestination: 'cleaning',
          enabled: true
        },
        product: defaultProd
      });
    }

    return slides;
  }, [heroBanners, flashDealConfig, storeSettings.enableFlashDeals, products]);

  const slideCount = activeSlides.length;

  // Auto-slide Hero Carousel
  React.useEffect(() => {
    if (isHeroPaused || slideCount <= 1) return;
    const heroTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, [isHeroPaused, slideCount]);

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
      setActiveHeroSlide((prev) => (prev + 1) % slideCount);
    } else if (distance < -45) {
      setActiveHeroSlide((prev) => (prev - 1 + slideCount) % slideCount);
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
      setActiveHeroSlide((prev) => (prev + 1) % slideCount);
    } else if (distance < -45) {
      setActiveHeroSlide((prev) => (prev - 1 + slideCount) % slideCount);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleHeroPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const handleHeroNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHeroSlide((prev) => (prev + 1) % slideCount);
  };

  // Curated Aisles Subcategories List (Scoped to active visible categories)
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
      // Must be part of active visible categories
      if (visibleCategoryIds.size > 0 && !visibleCategoryIds.has(item.categoryId)) {
        return;
      }

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
  }, [homepageSubcategories, categories, products, visibleCategoryIds]);

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

  // Trending Products (Database Driven)
  const trendingProducts = React.useMemo(() => {
    if (trendingNowProducts && trendingNowProducts.length > 0) {
      const customList = trendingNowProducts
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      if (customList.length > 0) return customList;
    }
    const filtered = products.filter((p) => p.isTrending || p.isFeatured);
    if (filtered.length > 0) return filtered.slice(0, 8);
    return products.slice(0, 8);
  }, [products, trendingNowProducts]);

  // Best Sellers (Database Driven)
  const bestSellers = React.useMemo(() => {
    if (bestSellersConfig?.mode === 'manual' && bestSellersConfig.manualProductIds?.length > 0) {
      const customList = bestSellersConfig.manualProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      if (customList.length > 0) return customList;
    }
    const filtered = products.filter((p) => p.isBestSeller || (p.rating >= 4.5 && p.reviewCount >= 5));
    if (filtered.length > 0) return filtered.slice(0, 8);
    return products.slice(4, 12).length > 0 ? products.slice(4, 12) : products.slice(0, 8);
  }, [products, bestSellersConfig]);

  // Active Deals (Deduplicated)
  const activeTodayDeals = React.useMemo(() => {
    if (todayDeals && todayDeals.length > 0) {
      const enabled = todayDeals.filter(d => d.enabled !== false);
      const seen = new Set<string>();
      return enabled.filter(d => {
        const key = d.productId || d.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return [];
  }, [todayDeals]);

  // Recently Viewed Products
  const recentlyViewedProducts = React.useMemo(() => {
    if (!recentlyViewedIds || recentlyViewedIds.length === 0) return [];
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 6);
  }, [recentlyViewedIds, products]);

  // Navigation Handlers
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

  const handleProductClick = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSelectedProductDetail(found);
    }
  };

  const handleQuickActionClick = (qa: QuickActionItem) => {
    if (qa.actionType === 'category') {
      handleCategoryClick(qa.actionValue);
    } else if (qa.actionType === 'product') {
      handleProductClick(qa.actionValue);
    } else if (qa.actionType === 'tab') {
      if (qa.actionValue === 'offers') {
        setSelectedCategoryFilter('offers');
        setActiveTab('categories');
      } else if (qa.actionValue === 'rewards') {
        setIsScratchModalOpen(true);
      } else {
        setActiveTab(qa.actionValue);
      }
    } else if (qa.actionType === 'url') {
      if (qa.actionValue.startsWith('http')) {
        window.open(qa.actionValue, '_blank');
      } else {
        window.location.href = qa.actionValue;
      }
    }
  };

  // Section 1: Hero Carousel Renderer — Modern, high-converting compact mobile & desktop banner
  const renderHeroSection = () => {
    const currentSlide = activeSlides[activeHeroSlide] || activeSlides[0];
    if (!currentSlide) return null;

    return (
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
          className="group/hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF6EF] via-[#FFF0E6] to-[#FFE8DA] border border-[#FFDEC9] p-3.5 sm:p-5 md:p-8 shadow-subtle min-h-[175px] sm:min-h-[220px] md:min-h-[250px] flex flex-col justify-between select-none cursor-grab active:cursor-grabbing transition-all"
        >
          {/* Decorative background glow */}
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Previous / Next Controls (Desktop) */}
          {slideCount > 1 && (
            <>
              <button
                onClick={handleHeroPrev}
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleHeroNext}
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-all active:scale-90"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Render Active Slide — Balanced Horizontal Layout */}
          {currentSlide.type === 'flash' ? (
            /* Flash Deal Slide with Live Countdown */
            <div 
              onClick={() => {
                const targetProd = currentSlide.product || (flashDealConfig?.productId ? products.find(p => p.id === flashDealConfig.productId) : null) || products[0];
                if (targetProd) setSelectedProductDetail(targetProd);
              }}
              className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6 animate-fadeIn cursor-pointer"
            >
              <div className="flex-1 min-w-0 pr-1 space-y-1.5 sm:space-y-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-black shadow-2xs animate-pulse">
                    <Flame className="w-3 h-3" /> {flashDealConfig?.badgeText || 'FLASH DEAL'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-[#EA580C] bg-orange-100/80 px-2 py-0.5 rounded-full">
                    {flashDealConfig?.discountText || 'Up to 55% Off'}
                  </span>
                </div>

                <h2 className="text-base sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight line-clamp-2">
                  {flashDealConfig?.title || (currentSlide.product ? currentSlide.product.name : 'Deal of the Day')}
                </h2>

                {/* Live Countdown Ticker */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-[#F95721]" /> Ends in:
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-black text-white">
                    <span className="bg-gray-900 px-1.5 py-0.5 rounded">
                      {String(countdown.hours).padStart(2, '0')}h
                    </span>
                    <span className="text-gray-700 font-bold">:</span>
                    <span className="bg-gray-900 px-1.5 py-0.5 rounded">
                      {String(countdown.minutes).padStart(2, '0')}m
                    </span>
                    <span className="text-gray-700 font-bold">:</span>
                    <span className="bg-[#F95721] px-1.5 py-0.5 rounded">
                      {String(countdown.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 flex items-center gap-2">
                  <span className="text-base sm:text-xl font-black text-[#F95721]">
                    ₹{flashDealConfig?.dealPrice || currentSlide.product?.price || products[0]?.price || 99}
                  </span>
                  {(currentSlide.product?.originalPrice || flashDealConfig?.originalPrice || (products[0]?.originalPrice ?? 0)) > (flashDealConfig?.dealPrice || currentSlide.product?.price || products[0]?.price || 99) && (
                    <span className="text-[11px] sm:text-xs text-gray-400 font-medium line-through">
                      ₹{currentSlide.product ? currentSlide.product.originalPrice : (flashDealConfig?.originalPrice || products[0]?.originalPrice || 199)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetProd = currentSlide.product || (flashDealConfig?.productId ? products.find(p => p.id === flashDealConfig.productId) : null) || products[0];
                      if (targetProd) setSelectedProductDetail(targetProd);
                    }}
                    className="ml-auto sm:ml-2 inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    <span>Claim</span>
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Flash Deal Floating Image Stage */}
              <div className="flex-shrink-0 relative w-28 sm:w-40 md:w-52 h-28 sm:h-40 md:h-52 flex items-center justify-center">
                <ResolvedImage
                  src={currentSlide.product ? currentSlide.product.image : (flashDealConfig?.productImage || products[0]?.image || '/icon-192x192.png?v=2')}
                  alt={currentSlide.product ? currentSlide.product.name : (flashDealConfig?.productName || products[0]?.name || 'Flash Deal')}
                  priority={true}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ) : (
            /* Database Configured Hero Banner Slide */
            <div 
              onClick={() => {
                if (currentSlide.product) {
                  setSelectedProductDetail(currentSlide.product);
                } else if (currentSlide.banner?.ctaDestination) {
                  handleCategoryClick(currentSlide.banner.ctaDestination);
                } else {
                  setActiveTab('categories');
                }
              }}
              className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6 animate-fadeIn cursor-pointer"
            >
              <div className="flex-1 min-w-0 pr-1 space-y-1.5 sm:space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 text-xs font-bold text-[#F95721] shadow-2xs">
                  <Sparkles className="w-3 h-3" /> 
                  {currentSlide.banner?.badgeText || 'Special Collection'}
                </span>
                <h2 className="text-base sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight line-clamp-2">
                  {currentSlide.product ? currentSlide.product.name : currentSlide.banner?.heading}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 font-medium line-clamp-2">
                  {currentSlide.banner?.description || (currentSlide.product ? currentSlide.product.description : 'Smart everyday utilities at factory rates.')}
                </p>
                <div className="pt-1 sm:pt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentSlide.product) {
                        setSelectedProductDetail(currentSlide.product);
                      } else if (currentSlide.banner?.ctaDestination) {
                        handleCategoryClick(currentSlide.banner.ctaDestination);
                      } else {
                        setActiveTab('categories');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    <span>{currentSlide.banner?.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsScratchModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold rounded-xl border border-orange-200 shadow-2xs transition-all tap-active"
                  >
                    <Gift className="w-3 h-3 text-[#F95721]" />
                    <span className="hidden sm:inline">Scratch &amp; Win</span>
                    <span className="sm:hidden">Rewards</span>
                  </button>
                </div>
              </div>

              {/* Floating Product Image Stage */}
              <div className="flex-shrink-0 relative w-28 sm:w-40 md:w-52 h-28 sm:h-40 md:h-52 flex items-center justify-center">
                <ResolvedImage
                  src={currentSlide.product ? currentSlide.product.image : (currentSlide.banner?.image || '/icon-512x512.png?v=2')}
                  alt={currentSlide.banner?.heading || 'Featured Banner'}
                  priority={true}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
                {currentSlide.product && (
                  <div className="absolute bottom-1 bg-gray-900/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    ₹{currentSlide.product.price}
                    {currentSlide.product.originalPrice && (
                      <span className="line-through text-gray-400 ml-1 text-[9px]">
                        ₹{currentSlide.product.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dots Carousel Navigation */}
          {slideCount > 1 && (
            <div className="relative z-10 flex justify-center items-center gap-1 mt-2 sm:mt-3">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroSlide(idx)}
                  className="w-6 h-6 flex items-center justify-center p-1 cursor-pointer tap-active"
                  aria-label={`Slide ${idx + 1}`}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 block ${
                      activeHeroSlide === idx
                        ? 'w-5 bg-[#F95721]'
                        : 'w-2 bg-orange-200/80 hover:bg-orange-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // Section 2: Quick Actions Bar Renderer
  const renderQuickActionsSection = () => {
    const liveActions = quickActions.filter(qa => qa.enabled !== false);
    if (liveActions.length === 0) return null;

    return (
      <section className="py-1 relative">
        <div className="relative">
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 pr-8 select-none">
            {liveActions.map((qa) => (
              <button
                key={qa.id}
                onClick={() => handleQuickActionClick(qa)}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white border border-gray-100 hover:border-orange-200 rounded-2xl shadow-2xs hover:shadow-xs transition-all active:scale-95 group text-left"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50/80 border border-orange-100/80 flex items-center justify-center flex-shrink-0 overflow-hidden text-base group-hover:scale-105 transition-transform">
                  {qa.image ? (
                    <ResolvedImage src={qa.image} alt={qa.label} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span>{qa.icon || '⚡'}</span>
                  )}
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 truncate">{qa.label}</span>
                    {qa.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-50 text-red-600 border border-red-200">
                        {qa.badge}
                      </span>
                    )}
                  </div>
                  {qa.subtitle && (
                    <p className="text-[11px] text-gray-500 line-clamp-1">{qa.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {/* Subtle right gradient fade indicating more items */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </section>
    );
  };

  // Section 3: Feature / Trust Badges Micro-Ticker Strip (Compact Modern Strip)
  const renderTrustSection = () => {
    return (
      <section className="py-0.5 relative">
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 pr-8 select-none">
            {/* 100% Genuine */}
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-200/80 text-blue-900 rounded-xl text-[11px] font-black shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0076D7]" />
              <span>100% Genuine</span>
            </div>

            {/* 7-Day Return */}
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 rounded-xl text-[11px] font-black shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-[#00A859]" />
              <span>7-Day Return</span>
            </div>

            {/* Justdial Verified */}
            <a
              href="https://www.justdial.com/Vadodara/Shyam-Bombay-Sale-Subhanpura/0265PX265-X265-260124041911-U8Y6_BZDET"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#0076D7]/10 hover:bg-[#0076D7]/20 border border-[#0076D7]/30 text-[#0076D7] rounded-xl text-[11px] font-black shadow-2xs transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-[#0076D7] text-[#0076D7]" />
              <span>Justdial Verified</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            {/* Free Delivery */}
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50/80 border border-orange-200/80 text-orange-950 rounded-xl text-[11px] font-black shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-[#F95721]" />
              <span>Free Delivery &gt;₹{storeSettings?.freeDeliveryThreshold ?? 499}</span>
            </div>
          </div>
          {/* Subtle right gradient fade indicating more badges */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </section>
    );
  };

  // Section 4: Shop by Category — Clean Non-Truncating 2-Row Grid
  const renderCategoriesSection = () => {
    if (visibleCategories.length === 0) return null;

    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
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

        {/* 2-Row Grid with clean auto-wrapping multi-line titles — No Ellipsis Truncation */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3.5 py-1">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-1.5 group tap-active w-full select-none"
            >
              <div 
                style={{ backgroundColor: cat.bgColor || '#FFF5EE' }}
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center p-2 border border-black/5 group-hover:scale-105 transition-transform shadow-xs overflow-hidden"
              >
                <ResolvedImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-800 text-center leading-tight capitalize line-clamp-2 max-w-full break-words min-h-[26px] flex items-center justify-center">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  };

  // Section 5: Curated Aisles
  const renderAislesSection = () => {
    if (featuredSubcategoryItems.length === 0) return null;

    return (
      <section className="space-y-3.5 bg-gradient-to-b from-orange-50/50 via-[#FFF9F5]/40 to-transparent p-4 sm:p-5 -mx-3 sm:-mx-4 md:mx-0 rounded-3xl border border-orange-100/60 shadow-2xs">
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

          <div className="flex items-center gap-2 flex-shrink-0">
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

        {availableCategoryPills.length > 1 && (
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 pr-8">
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
            {/* Subtle right gradient fade indicating more pills */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FFF8F3] to-transparent" />
          </div>
        )}

        <div
          ref={subcategoryScrollRef}
          className="flex items-stretch gap-3 md:gap-3.5 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth"
        >
          {filteredSubcategoryItems.map((item) => (
            <div
              key={`${item.categoryId}-${item.sub.id}`}
              onClick={() => handleSubcategoryClick(item.categoryId, item.sub.id)}
              className="group relative flex-shrink-0 w-[42vw] min-w-[126px] sm:w-[145px] md:w-[155px] flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-3xl bg-white border border-gray-100 hover:border-orange-300 shadow-2xs hover:shadow-card transition-all duration-300 cursor-pointer tap-active select-none"
            >
              <div
                style={{ backgroundColor: item.cat.bgColor || '#FFF0E6' }}
                className="absolute top-0 inset-x-0 h-24 rounded-t-3xl opacity-50 group-hover:opacity-80 transition-opacity"
              />

              <div className="relative z-10 w-full flex items-center justify-center">
                <span
                  style={{ color: item.cat.accentColor || '#EA580C' }}
                  className="text-[10px] font-black uppercase tracking-wider line-clamp-1 text-center bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-black/5 shadow-2xs"
                >
                  {item.cat.name}
                </span>
              </div>

              <div className="relative z-10 my-2">
                <div
                  style={{ borderColor: `${item.cat.accentColor || '#F95721'}30` }}
                  className="w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl sm:rounded-3xl bg-white p-2.5 shadow-xs border flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
                >
                  <ResolvedImage
                    src={item.sub.image || item.cat.image}
                    alt={item.sub.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>

              <div className="relative z-10 w-full text-center space-y-1.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-2 leading-tight min-h-[30px] sm:min-h-[34px] flex items-center justify-center group-hover:text-[#F95721] transition-colors">
                  {item.sub.name}
                </h3>

                <div className="flex items-center justify-center">
                  {item.minPrice ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[#F95721] bg-orange-50/90 border border-orange-200/70 px-2 py-0.5 rounded-full">
                      From ₹{item.minPrice}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.productCount} {item.productCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Section 6: Trending Now
  const renderTrendingSection = () => {
    if (trendingProducts.length === 0) return null;

    return (
      <section className="lazy-section">
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
          {trendingProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>
    );
  };

  // Section 7: Today's Deals
  const renderDealsSection = () => {
    if (activeTodayDeals.length === 0) return null;

    return (
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
          {activeTodayDeals.map((deal) => {
            const prod = products.find(p => p.id === deal.productId);
            return (
              <div
                key={deal.id}
                onClick={() => {
                  if (prod) setSelectedProductDetail(prod);
                  else {
                    setSelectedCategoryFilter('offers');
                    setActiveTab('categories');
                  }
                }}
                className="cursor-pointer bg-gradient-to-r from-[#FFF5EC] to-[#FFEFE4] border border-[#FEDDC7] rounded-3xl p-5 flex items-center justify-between hover:shadow-card transition-all tap-active"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flash Deal</span>
                  <span className="text-2xl md:text-3xl font-black text-[#F95721] block">{deal.discount}% OFF</span>
                  <p className="text-sm font-bold text-gray-900">{deal.title || (prod ? prod.name : 'Special Offer')}</p>
                  {prod && (
                    <p className="text-xs font-bold text-gray-600">Special Price: ₹{prod.price}</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F95721] pt-1">
                    Shop Deal <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white/80 rounded-2xl p-2.5 flex items-center justify-center shadow-xs overflow-hidden">
                  <ResolvedImage
                    src={deal.bannerImage || prod?.image || '/icon-192x192.png?v=2'}
                    alt={deal.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // Section 8: Best Sellers
  const renderBestSellersSection = () => {
    if (bestSellers.length === 0) return null;

    return (
      <section className="lazy-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Customer top picks • 100% Verified Quality</p>
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
    );
  };

  // Dynamic Section Dispatcher mapped to admin ordered homepageSections
  const renderSectionById = (sectionId: string) => {
    switch (sectionId) {
      case 'stories':
        return (
          <section key="stories" className="pt-0">
            <ProductStories />
          </section>
        );
      case 'hero':
        return <React.Fragment key="hero">{renderHeroSection()}</React.Fragment>;
      case 'quick_actions':
        return <React.Fragment key="quick_actions">{renderQuickActionsSection()}</React.Fragment>;
      case 'trust':
        return <React.Fragment key="trust">{renderTrustSection()}</React.Fragment>;
      case 'categories':
        return <React.Fragment key="categories">{renderCategoriesSection()}</React.Fragment>;
      case 'aisles':
        return <React.Fragment key="aisles">{renderAislesSection()}</React.Fragment>;
      case 'trending':
        return <React.Fragment key="trending">{renderTrendingSection()}</React.Fragment>;
      case 'deals':
        return <React.Fragment key="deals">{renderDealsSection()}</React.Fragment>;
      case 'bestsellers':
        return <React.Fragment key="bestsellers">{renderBestSellersSection()}</React.Fragment>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Primary Semantic H1 for Google Ranking — Exact Match: SBS Store & Shyam Bombay Sale */}
      <h1 className="sr-only">
        SBS Store — Shyam Bombay Sale | Official Online Shopping &amp; Retail Store Vadodara
      </h1>

      <div className="space-y-4 md:space-y-6 pb-40 md:pb-12 animate-fadeIn">
        {/* Dynamic Sections in order configured in admin panel */}
        {homepageSections
          .filter((sec) => sec.enabled !== false)
          .map((sec) => renderSectionById(sec.id))}

      {/* Scratch & Win Modal */}
      <ScratchCardModal
        isOpen={isScratchModalOpen}
        onClose={() => setIsScratchModalOpen(false)}
      />

      {/* Recently Viewed Products Strip */}
      {recentlyViewedProducts.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👁️</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">Recently Viewed</h2>
                <p className="text-[11px] text-gray-500">Pick up where you left off</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Notification Reward Card */}
      <section>
        <NotificationRewardCard variant="compact" />
      </section>

      {/* Comprehensive Brand & Local SEO Overview Section (Targeting 'SBS Store' & 'Shyam Bombay Sale') */}
      <section id="store-overview" className="lazy-section mt-8 pt-8 border-t border-gray-200/80 space-y-6">
        {/* Brand Banner Card */}
        <div className="p-5 sm:p-7 md:p-8 bg-gradient-to-br from-[#FFF5EE] via-white to-[#FFF0E6] rounded-3xl border border-orange-100/90 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100/80 pb-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-xs font-extrabold text-[#F95721]">
                <Store className="w-3.5 h-3.5" /> Official Brand &amp; Retail Store
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                Shyam Bombay Sale (SBS Store)
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-medium leading-relaxed">
                Vadodara’s trusted destination for smart everyday essentials, household cleaning products, kitchenware, and daily home utilities at honest factory &amp; wholesale rates.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://share.google/Pa5CkR6pMiRD0MMZm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 shadow-xs hover:border-[#F95721] transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F95721]" />
                <span>Google Maps</span>
              </a>
              <a
                href="https://www.justdial.com/Vadodara/Shyam-Bombay-Sale-Subhanpura/0265PX265-X265-260124041911-U8Y6_BZDET"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0076D7]/10 hover:bg-[#0076D7]/20 border border-[#0076D7]/30 rounded-xl text-xs font-bold text-[#0076D7] shadow-xs transition-all"
              >
                <span>Justdial Verified</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://wa.me/919226294797?text=Hi%20Shyam%20Bombay%20Sale%2C%20I%20have%20an%20inquiry%20from%20sbsstore.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00A859] hover:bg-[#008f4c] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Key Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-white/80 rounded-2xl border border-gray-100 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                <MapPin className="w-4 h-4 text-[#F95721]" />
                <span>Subhanpura Offline Showroom</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Shop in person at <strong>Shop 1, Vrundvilla, Laxmipura Road, Near Rami School, Subhanpura, Vadodara 390023</strong>. Open 7 days a week (10 AM to 9:30 PM).
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-gray-100 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                <Truck className="w-4 h-4 text-[#00A859]" />
                <span>Express Doorstep Delivery</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Order anytime online on <strong>sbsstore.in</strong> with quick delivery throughout Vadodara and safe courier shipping all over Gujarat and India.
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-gray-100 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span>100% Genuine Quality</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every cleaning tool, kitchen essential, and organizer is verified for quality, honest wholesale pricing, and backed by our easy 7-day return guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Section for Google Rich Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#F95721]" />
                Frequently Asked Questions about SBS Store
              </h3>
              <p className="text-xs text-gray-500">
                Everything you need to know about shopping with Shyam Bombay Sale online and offline.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                q: 'Where is Shyam Bombay Sale (SBS Store) located in Vadodara?',
                a: 'Shyam Bombay Sale is conveniently located at Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat 390023. Our physical retail showroom is open 7 days a week from 10:00 AM to 9:30 PM. You are welcome to visit, inspect products in person, and purchase directly.',
              },
              {
                q: 'What types of products are available at SBS Store — Shyam Bombay Sale?',
                a: 'SBS Store specializes in smart everyday essentials across key categories: Household Cleaning Products (spin mops, microfiber wipes, sweepers), Smart Kitchen Essentials (choppers, sealers, cookware, storage jars), Home Utilities & Organizers, and Personal Grooming Accessories. All products are curated for everyday durability at direct factory rates.',
              },
              {
                q: 'Can I order online from Shyam Bombay Sale for doorstep delivery?',
                a: 'Yes! You can order directly right here on sbsstore.in. We provide prompt local doorstep delivery across all areas of Vadodara (Subhanpura, Laxmipura, Gotri, Alkapuri, Manjalpur, Karelibaug, etc.) as well as reliable nationwide shipping across India with live order tracking.',
              },
              {
                q: 'What payment and buyer protection policies does SBS Store offer?',
                a: 'SBS Store accepts UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit Cards, and Cash on Delivery (COD) for eligible areas. All purchases are backed by 100% Genuine SBS Quality verification and our 7-day hassle-free return and replacement policy.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-gray-900 hover:text-[#F95721] active:bg-orange-50/40 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex-1 pr-2">{faq.q}</span>
                    <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#F95721]' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile-First Trust & Info Footer */}
      <footer className="mt-8 pt-8 pb-4 border-t border-gray-100/80 space-y-6">
        {/* Brand & Value Proposition */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F95721] to-[#FF7A45] text-white font-black text-sm flex items-center justify-center shadow-xs">
              SBS
            </span>
            <span className="text-base font-black text-gray-900 tracking-tight">
              {storeSettings?.storeName || 'Shyam Bombay Sale'}
            </span>
          </div>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Your destination for smart everyday utilities, kitchen innovations, and lifestyle essentials at wholesale prices.
          </p>
        </div>

        {/* Quick Help & Contact Cards */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={storeSettings?.contactPhone ? `https://wa.me/${storeSettings.contactPhone.replace(/\D/g, '')}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/60 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00A859] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-500 block">WhatsApp Us</span>
              <span className="text-xs font-black text-emerald-800 truncate block">Chat Support</span>
            </div>
          </a>

          <a
            href={`tel:${storeSettings?.contactPhone || '919876543210'}`}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-100 hover:bg-orange-100/60 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F95721] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-500 block">Helpline</span>
              <span className="text-xs font-black text-[#F95721] truncate block">
                {storeSettings?.contactPhone || '+91 98765 43210'}
              </span>
            </div>
          </a>
        </div>

        {/* Trust Badges Row */}
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500 font-semibold border-t border-b border-gray-100 py-3">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" /> 100% Genuine</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#F95721]" /> Fast Delivery</span>
          <span>•</span>
          <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5 text-[#0284C7]" /> 7-Day Returns</span>
        </div>

        {/* Operating Hours & Location */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-gray-500 text-center px-4">
          <span className="flex items-center gap-1 justify-center">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{storeSettings?.businessHours || '10:00 AM - 09:30 PM'}</span>
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a
            href="https://share.google/Pa5CkR6pMiRD0MMZm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 justify-center hover:text-[#F95721] text-gray-600 transition-colors group"
            title="View verified store on Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F95721] shrink-0" />
            <span className="underline underline-offset-2 decoration-gray-300 group-hover:decoration-[#F95721] max-w-md">
              {storeSettings?.address || 'Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat 390023'}
            </span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center pt-1">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} {storeSettings?.storeName || 'Shyam Bombay Sale'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
};
