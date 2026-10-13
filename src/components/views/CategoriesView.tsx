'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { 
  Search, 
  X, 
  Flame, 
  ArrowUpDown, 
  Sparkles, 
  Package, 
  Layers, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { Subcategory, Category, Product } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const CategoriesView: React.FC = () => {
  const { 
    categories, 
    products, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter 
  } = useStore();

  // Active Category in view (highlighted in Left Rail)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    return selectedCategoryFilter || categories[0]?.id || '';
  });

  // Active Subcategory in view (for quick-jump chip highlight)
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>('all');

  // Storewide search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'discount'>('featured');

  // DOM Refs for independent scrolling and scroll-spy
  const leftRailRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const leftRailButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const subcatChipsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isProgrammaticScrollRef = useRef(false);

  // Sync with external selectedCategoryFilter changes (e.g. from banner or quick action)
  useEffect(() => {
    if (selectedCategoryFilter && selectedCategoryFilter !== activeCategoryId) {
      handleCategoryClick(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  // Center active category button in the left rail
  const centerLeftRailButton = (catId: string) => {
    const btn = leftRailButtonsRef.current[catId];
    if (btn && leftRailRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Center active subcategory chip in the top chip bar
  const centerSubcatChip = (subId: string) => {
    const chip = subcatChipsRef.current[subId];
    if (chip) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Helper to filter and sort products for a given category
  const getProcessedProductsForCategory = (cat: Category) => {
    let list = products.filter((p) => {
      if (cat.id === 'offers') {
        return p.discountPercentage >= 38;
      }
      return p.category === cat.id;
    });

    // In-Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      return 0; // featured
    });

    return list;
  };

  // Active category object currently highlighted
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  // Products for the active category
  const activeCategoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return getProcessedProductsForCategory(activeCategory);
  }, [activeCategory, products, inStockOnly, searchQuery, sortBy]);

  // Jump smoothly to a category section when clicked in Left Rail
  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    setSelectedCategoryFilter(catId);
    setActiveSubcategoryId('all');
    centerLeftRailButton(catId);

    const targetEl = document.getElementById(`category-section-${catId}`);
    if (targetEl && rightPaneRef.current) {
      isProgrammaticScrollRef.current = true;
      const paneRect = rightPaneRef.current.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const currentScrollTop = rightPaneRef.current.scrollTop;
      const offsetTop = targetRect.top - paneRect.top + currentScrollTop - 4;

      rightPaneRef.current.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth'
      });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 650);
    }
  };

  // Jump smoothly to a subcategory section when a chip is clicked
  const handleSubcategoryChipClick = (subId: string) => {
    setActiveSubcategoryId(subId);
    centerSubcatChip(subId);

    if (!rightPaneRef.current) return;

    if (subId === 'all') {
      const catEl = document.getElementById(`category-section-${activeCategoryId}`);
      if (catEl) {
        isProgrammaticScrollRef.current = true;
        const paneRect = rightPaneRef.current.getBoundingClientRect();
        const targetRect = catEl.getBoundingClientRect();
        const offsetTop = targetRect.top - paneRect.top + rightPaneRef.current.scrollTop - 4;
        rightPaneRef.current.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
        setTimeout(() => { isProgrammaticScrollRef.current = false; }, 600);
      }
      return;
    }

    const targetSection = document.getElementById(`subcat-section-${activeCategoryId}-${subId}`);
    if (targetSection) {
      isProgrammaticScrollRef.current = true;
      const paneRect = rightPaneRef.current.getBoundingClientRect();
      const targetRect = targetSection.getBoundingClientRect();
      const currentScrollTop = rightPaneRef.current.scrollTop;
      const offsetTop = targetRect.top - paneRect.top + currentScrollTop - 48; // account for sticky header

      rightPaneRef.current.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth'
      });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    }
  };

  // Live Scroll-Spy: Accurately syncs Left Rail & Top Subcategory Chips as user continuously scrolls through all categories
  useEffect(() => {
    const pane = rightPaneRef.current;
    if (!pane) return;

    let ticking = false;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!pane) return;
          const paneRect = pane.getBoundingClientRect();
          const scrollAnchorY = paneRect.top + 90;

          let currentCatId = activeCategoryId;

          // 1. Determine active category based on section position
          for (const cat of categories) {
            const sectionEl = document.getElementById(`category-section-${cat.id}`);
            if (sectionEl) {
              const rect = sectionEl.getBoundingClientRect();
              if (rect.top <= scrollAnchorY && rect.bottom > scrollAnchorY) {
                currentCatId = cat.id;
                break;
              }
            }
          }

          // If scrolled near bottom of the entire pane, highlight last category
          const isAtBottom = pane.scrollHeight - pane.scrollTop - pane.clientHeight <= 40;
          if (isAtBottom && categories.length > 0) {
            currentCatId = categories[categories.length - 1].id;
          }

          if (currentCatId && currentCatId !== activeCategoryId) {
            setActiveCategoryId(currentCatId);
            centerLeftRailButton(currentCatId);
          }

          // 2. Determine active subcategory within the active category
          const currentCatObj = categories.find(c => c.id === currentCatId);
          if (currentCatObj?.subcategories && currentCatObj.subcategories.length > 0) {
            let currentSubId = 'all';
            for (const sub of currentCatObj.subcategories) {
              const subEl = document.getElementById(`subcat-section-${currentCatId}-${sub.id}`);
              if (subEl) {
                const rect = subEl.getBoundingClientRect();
                if (rect.top <= scrollAnchorY + 40) {
                  currentSubId = sub.id;
                }
              }
            }
            if (currentSubId !== activeSubcategoryId) {
              setActiveSubcategoryId(currentSubId);
              centerSubcatChip(currentSubId);
            }
          } else {
            if (activeSubcategoryId !== 'all') {
              setActiveSubcategoryId('all');
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    pane.addEventListener('scroll', handleScroll, { passive: true });
    return () => pane.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategoryId, activeSubcategoryId, products, inStockOnly, searchQuery]);

  // Total matching products across entire store for empty state verification
  const totalStorewideMatches = useMemo(() => {
    return categories.reduce((total, cat) => {
      return total + getProcessedProductsForCategory(cat).length;
    }, 0);
  }, [categories, products, inStockOnly, searchQuery, sortBy]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="w-full h-[calc(100dvh-52px-64px)] sm:h-[calc(100dvh-58px-64px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden bg-white rounded-none sm:rounded-2xl border-0 sm:border border-gray-100 shadow-2xs">
      
      {/* ========================================================================= */}
      {/* 1. TOP PINNED TOOLBAR: SEARCH, IN-STOCK TOGGLE & SORT CONTROLS             */}
      {/* ========================================================================= */}
      <div className="shrink-0 bg-white border-b border-gray-200/90 px-2.5 sm:px-4 py-2 sm:py-2.5 z-40 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across categories & products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#F95721] focus:bg-white transition-all font-medium text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* In Stock Only Toggle Pill */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`shrink-0 px-2.5 sm:px-3 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors tap-active ${
              inStockOnly
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title="Show only products currently in stock"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-white' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">In Stock Only</span>
            <span className="sm:hidden">In Stock</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-2.5 pr-7 rounded-xl appearance-none focus:outline-none focus:border-[#F95721] cursor-pointer shadow-2xs"
            >
              <option value="featured">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Biggest % Off</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPLIT LAYOUT: INDEPENDENT LEFT CATEGORY RAIL + RIGHT CONTINUOUS PANE   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ----------------------------------------------------------------------- */}
        {/* A. LEFT CATEGORY RAIL (Blinkit / Zepto Style)                          */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          ref={leftRailRef}
          className="w-[82px] sm:w-[94px] md:w-56 lg:w-64 shrink-0 bg-[#F8F9FA] border-r border-gray-200/90 overflow-y-auto overscroll-contain no-scrollbar py-1 md:py-2 select-none"
        >
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const isOffers = cat.id === 'offers';
            const catCount = products.filter((p) => 
              isOffers ? p.discountPercentage >= 38 : p.category === cat.id
            ).length;

            return (
              <button
                key={cat.id}
                ref={(el) => { leftRailButtonsRef.current[cat.id] = el; }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative w-full transition-all duration-150 tap-active ${
                  isActive 
                    ? 'bg-white shadow-2xs' 
                    : 'hover:bg-white/60 text-gray-600'
                } ${
                  /* Mobile: vertical icon+label. Desktop: horizontal row */
                  'p-2 sm:p-2.5 md:p-3 md:mx-2 md:w-[calc(100%-16px)] md:rounded-2xl md:my-1 md:flex md:items-center md:gap-3 flex flex-col items-center justify-center text-center'
                }`}
              >
                {/* Active Orange Vertical Indicator Bar (Left Edge) */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#F95721] rounded-r-full md:left-0 md:top-2 md:bottom-2" />
                )}

                {/* Category Thumbnail */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-2xl p-1 flex items-center justify-center shrink-0 transition-all ${
                  isActive 
                    ? 'bg-orange-50/70 border-2 border-orange-300 ring-2 ring-orange-100 shadow-2xs' 
                    : 'bg-white border border-gray-200 shadow-2xs'
                }`}>
                  <ResolvedImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Mobile Category Name + Mini Badge */}
                <div className="md:hidden mt-1 w-full px-0.5">
                  <span className={`text-[10px] sm:text-[11px] leading-tight line-clamp-2 break-words ${
                    isActive ? 'font-black text-[#F95721]' : 'font-semibold text-gray-700'
                  }`}>
                    {cat.name}
                  </span>

                  {isOffers && (
                    <span className="inline-flex items-center gap-0.5 mt-0.5 text-[8px] font-black uppercase tracking-wider text-[#F95721] bg-orange-100 px-1 py-0.2 rounded-full">
                      <Flame className="w-2 h-2 fill-current" /> Hot
                    </span>
                  )}
                </div>

                {/* Desktop Category Details (Horizontal Layout) */}
                <div className="hidden md:flex flex-1 items-center justify-between min-w-0 text-left">
                  <div className="min-w-0 pr-1">
                    <p className={`text-xs truncate ${
                      isActive ? 'font-black text-[#F95721]' : 'font-bold text-gray-800'
                    }`}>
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                      {isOffers ? 'Exclusive Deals' : `${catCount} items`}
                    </p>
                  </div>

                  {isOffers ? (
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 bg-orange-100 text-[#F95721] shrink-0">
                      <Flame className="w-2.5 h-2.5 fill-current" /> Deal
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-[#F95721] translate-x-0.5' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* B. RIGHT PRODUCTS PANE CONTAINER (Pinned Chips + Continuous Catalog)   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* PINNED SUB-CATEGORY QUICK-JUMP CHIP BAR (Stays pinned above right pane, updates to current category) */}
          {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && activeCategoryProducts.length > 0 && (
            <div className="shrink-0 bg-white border-b border-gray-100 py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shadow-2xs z-30">
              {/* "All" Pill */}
              <button
                ref={(el) => { subcatChipsRef.current['all'] = el; }}
                onClick={() => handleSubcategoryChipClick('all')}
                className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 tap-active ${
                  activeSubcategoryId === 'all'
                    ? 'bg-[#F95721] text-white shadow-2xs font-black'
                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All {activeCategory.name} ({activeCategoryProducts.length})</span>
              </button>

              {/* Subcategory Pills */}
              {activeCategory.subcategories.map((sub) => {
                const isChipActive = activeSubcategoryId === sub.id;
                const subCount = activeCategoryProducts.filter((p) => p.subcategory === sub.id).length;
                if (subCount === 0 && searchQuery.trim()) return null;

                return (
                  <button
                    key={sub.id}
                    ref={(el) => { subcatChipsRef.current[sub.id] = el; }}
                    onClick={() => handleSubcategoryChipClick(sub.id)}
                    className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 tap-active ${
                      isChipActive
                        ? 'bg-[#F95721] text-white shadow-2xs font-black'
                        : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isChipActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}>
                      {subCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* RIGHT PRODUCTS SCROLL PANE (Continuous Catalog Across All Categories) */}
          <div 
            ref={rightPaneRef}
            className="flex-1 overflow-y-auto overscroll-contain bg-white p-2 sm:p-3 md:p-5 space-y-6 no-scrollbar relative"
          >
            {totalStorewideMatches > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {categories.map((cat) => {
                  const catProducts = getProcessedProductsForCategory(cat);
                  
                  // Hide empty sections when user is actively searching with a query
                  if (catProducts.length === 0 && (searchQuery.trim() || inStockOnly)) {
                    return null;
                  }

                  const subList = cat.subcategories || [];
                  const knownSubIds = new Set(subList.map((s) => s.id));
                  const unassignedItems = catProducts.filter(
                    (p) => !p.subcategory || !knownSubIds.has(p.subcategory)
                  );

                  return (
                    <div
                      key={cat.id}
                      id={`category-section-${cat.id}`}
                      className="scroll-mt-4 space-y-3.5"
                    >
                      {/* Clean Sticky Category Header Banner (SOLID white bg & z-20 to completely occlude scrolling products) */}
                      <div className="sticky top-0 z-20 bg-white py-2 px-2.5 sm:px-3.5 border-b border-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 border border-orange-200/80 p-0.5 flex items-center justify-center shrink-0">
                            <ResolvedImage
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h2 className="text-xs sm:text-sm md:text-base font-black text-gray-900 tracking-tight truncate">
                                {cat.name}
                              </h2>
                              <span className="text-[10px] sm:text-xs font-black text-[#F95721] bg-orange-50 border border-orange-200/80 px-2 py-0.2 rounded-full shrink-0">
                                {catProducts.length} items
                              </span>
                            </div>
                            {cat.subtitle && (
                              <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
                                {cat.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {cat.id === 'offers' && (
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-orange-100 text-[#F95721] shrink-0">
                            <Flame className="w-2.5 h-2.5 fill-current" /> Up to 75% OFF
                          </span>
                        )}
                      </div>

                      {/* Products Grid or Empty Category Placeholder */}
                      {catProducts.length > 0 ? (
                        subList.length > 0 ? (
                          <div className="space-y-4 pt-1">
                            {subList.map((sub) => {
                              const subItems = catProducts.filter((p) => p.subcategory === sub.id);
                              if (subItems.length === 0) return null;

                              return (
                                <div
                                  key={sub.id}
                                  id={`subcat-section-${cat.id}-${sub.id}`}
                                  className="scroll-mt-10 space-y-2"
                                >
                                  {/* Subcategory Section Sub-Header */}
                                  <div className="flex items-center justify-between pt-1 pb-1 border-b border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-3.5 bg-[#F95721] rounded-full" />
                                      <h3 className="text-xs sm:text-sm font-black text-gray-800 tracking-tight">
                                        {sub.name}
                                      </h3>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.2 rounded-full">
                                      {subItems.length} items
                                    </span>
                                  </div>

                                  {/* Responsive Product Grid: 2 columns mobile, 3-4 desktop */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
                                    {subItems.map((product) => (
                                      <ProductCard key={product.id} product={product} />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Unassigned products in this category */}
                            {unassignedItems.length > 0 && (
                              <div
                                id={`subcat-section-${cat.id}-unassigned`}
                                className="scroll-mt-10 space-y-2 pt-1"
                              >
                                <div className="flex items-center justify-between pt-1 pb-1 border-b border-gray-100">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-3.5 bg-[#F95721] rounded-full" />
                                    <h3 className="text-xs sm:text-sm font-black text-gray-800 tracking-tight">
                                      More {cat.name} Essentials
                                    </h3>
                                  </div>
                                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.2 rounded-full">
                                    {unassignedItems.length} items
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
                                  {unassignedItems.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Flat Category Products Grid (e.g. Offers) */
                          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5 pt-1">
                            {catProducts.map((product) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        )
                      ) : (
                        /* Empty Category Placeholder (Guarantees category section exists in DOM to prevent scroll flicker/shake) */
                        <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl p-6 sm:p-8 text-center space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto border border-orange-100">
                            <Package className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-800">
                            No products currently in {cat.name}
                          </p>
                          <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                            New stock arriving soon! Browse other essentials above or below.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* End of Store Catalog Indicator (Zero dead space at the bottom) */}
                <div className="py-3 text-center border-t border-gray-100">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200/60 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#F95721]" /> You&apos;ve viewed all SBS Store essentials
                  </span>
                </div>
              </div>
            ) : (
              /* =================================================================== */
              /* EMPTY STATE IF NO STOREWIDE MATCHES                                 */
              /* =================================================================== */
              <div className="py-10 px-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto border border-orange-100 shadow-2xs">
                  <Package className="w-6 h-6 stroke-[1.75px]" />
                </div>

                <div className="max-w-sm mx-auto space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-gray-900">
                    No products found
                  </h3>
                  <p className="text-xs text-gray-500">
                    {searchQuery 
                      ? `No products in the catalog matched "${searchQuery}".` 
                      : inStockOnly 
                        ? 'No items are currently marked in stock.' 
                        : 'No items currently available.'}
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F95721]" />
                    Reset Search &amp; Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
