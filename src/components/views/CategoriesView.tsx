'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { 
  ChevronRight,
  Search,
  X,
  Flame,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  Package
} from 'lucide-react';
import { Subcategory, Category } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const CategoriesView: React.FC = () => {
  const { 
    categories, 
    products, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    activeSubcategoryModal,
    setActiveSubcategoryModal
  } = useStore();

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    selectedCategoryFilter || categories[0]?.id || 'cleaning-products--chemicals'
  );

  // Search & Filter inside subcategory modal
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSortBy, setModalSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'discount'>('featured');
  const [modalInStockOnly, setModalInStockOnly] = useState(false);

  // References for scroll tracking and programmatic smooth scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const railButtonsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const leftRailRef = useRef<HTMLElement | null>(null);
  const rightPaneRef = useRef<HTMLElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const activeCategoryRef = useRef(activeCategoryId);
  activeCategoryRef.current = activeCategoryId;

  const formatItemCount = (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`;

  // Keep active category button visible inside the left rail
  const scrollLeftRailToActive = (catId: string) => {
    const rail = leftRailRef.current;
    const btn = railButtonsRef.current[catId];
    if (rail && btn) {
      const railRect = rail.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      if (btnRect.top < railRect.top + 20 || btnRect.bottom > railRect.bottom - 20) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // External trigger (e.g. from banner or quick actions), scroll right pane to it
  useEffect(() => {
    if (selectedCategoryFilter && sectionRefs.current[selectedCategoryFilter]) {
      setActiveCategoryId(selectedCategoryFilter);
      activeCategoryRef.current = selectedCategoryFilter;
      scrollLeftRailToActive(selectedCategoryFilter);

      const el = sectionRefs.current[selectedCategoryFilter];
      const container = rightPaneRef.current;
      if (el && container) {
        isProgrammaticScrollRef.current = true;
        const targetTop = Math.max(0, el.offsetTop - container.offsetTop);
        container.scrollTo({ top: targetTop, behavior: 'smooth' });
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 600);
      }
    }
  }, [selectedCategoryFilter]);

  // Robust Scroll-Spy: Accurately sync left sidebar as user scrolls down the right pane
  useEffect(() => {
    const container = rightPaneRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          // Anchor offset 70px below top of scrolling container
          const targetY = containerRect.top + 70;

          const categoryKeys = categories.map(c => c.id);
          let currentCatId = categoryKeys[0];

          for (const catId of categoryKeys) {
            const el = sectionRefs.current[catId];
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= targetY) {
                currentCatId = catId;
              }
            }
          }

          // If scrolled to the bottom of the container, activate the last category
          const isAtBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 40;
          if (isAtBottom && categoryKeys.length > 0) {
            currentCatId = categoryKeys[categoryKeys.length - 1];
          }

          if (currentCatId && currentCatId !== activeCategoryRef.current) {
            activeCategoryRef.current = currentCatId;
            setActiveCategoryId(currentCatId);
            scrollLeftRailToActive(currentCatId);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [categories]);

  // Smooth scroll to category section when left rail item is clicked
  const handleLeftRailClick = (catId: string) => {
    setActiveCategoryId(catId);
    activeCategoryRef.current = catId;
    setSelectedCategoryFilter(catId);
    scrollLeftRailToActive(catId);

    const el = sectionRefs.current[catId];
    const container = rightPaneRef.current;

    if (el && container) {
      isProgrammaticScrollRef.current = true;
      const targetTop = Math.max(0, el.offsetTop - container.offsetTop);
      container.scrollTo({ top: targetTop, behavior: 'smooth' });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    }
  };

  // Open Subcategory Product View
  const handleSubcategoryClick = (cat: Category, sub: Subcategory | null) => {
    setActiveSubcategoryModal({ category: cat, subcategory: sub });
    setModalSearchQuery('');
    setModalSortBy('featured');
    setModalInStockOnly(false);
  };

  // Products filtered for the active subcategory modal/drawer
  const modalFilteredProducts = useMemo(() => {
    if (!activeSubcategoryModal) return [];

    const { category, subcategory } = activeSubcategoryModal;

    return products.filter((p) => {
      // Category match
      if (category.id === 'offers') {
        if (p.discountPercentage < 38) return false;
      } else {
        if (p.category !== category.id) return false;
      }

      // Subcategory match
      if (subcategory && p.subcategory !== subcategory.id) {
        return false;
      }

      // In stock
      if (modalInStockOnly && !p.inStock) return false;

      // Search query
      if (modalSearchQuery.trim()) {
        const q = modalSearchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (modalSortBy === 'priceLow') return a.price - b.price;
      if (modalSortBy === 'priceHigh') return b.price - a.price;
      if (modalSortBy === 'rating') return b.rating - a.rating;
      if (modalSortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0;
    });
  }, [activeSubcategoryModal, products, modalInStockOnly, modalSearchQuery, modalSortBy]);

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-5 h-[calc(100dvh-120px)] sm:h-[calc(100vh-125px)] md:h-[calc(100vh-135px)] overflow-hidden animate-fadeIn select-none">
      {/* ==================================================== */}
      {/* LEFT COLUMN: BOUNDED MOBILE CATEGORY RAIL */}
      {/* ==================================================== */}
      <aside 
        ref={leftRailRef}
        className="w-[76px] sm:w-24 md:w-32 flex-shrink-0 bg-[#F4F5F7] rounded-2xl md:rounded-3xl border border-gray-200/70 overflow-y-auto no-scrollbar flex flex-col py-1.5 shadow-2xs h-full"
      >
        <div className="space-y-1 pb-4">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const isOffers = cat.id === 'offers';

            return (
              <button
                key={cat.id}
                ref={(el) => { railButtonsRef.current[cat.id] = el; }}
                onClick={() => handleLeftRailClick(cat.id)}
                className={`w-full py-2.5 px-1 flex flex-col items-center justify-center text-center transition-all duration-200 relative tap-active group ${
                  isActive 
                    ? 'bg-white text-gray-900 font-black shadow-2xs' 
                    : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 font-medium'
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 sm:w-1.5 bg-[#F95721] rounded-r-full" />
                )}

                {/* Category Icon / Thumbnail */}
                <div 
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden p-0.5 flex items-center justify-center transition-transform duration-200 border bg-white ${
                    isActive 
                      ? 'border-[#F95721] ring-2 ring-[#F95721]/20 scale-105' 
                      : 'border-gray-200/80 group-hover:scale-105'
                  }`}
                >
                  <ResolvedImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Category Title */}
                <span className={`text-[11px] sm:text-xs leading-tight mt-1.5 line-clamp-2 px-0.5 tracking-tight ${
                  isActive ? 'text-gray-900 font-black' : 'text-gray-600 font-semibold'
                }`}>
                  {cat.name}
                </span>

                {/* Optional Offers/Hot Pill */}
                {isOffers && (
                  <span className="mt-0.5 text-[9px] font-black uppercase text-[#F95721] bg-orange-100/90 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-[#F95721]" /> Hot
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ==================================================== */}
      {/* RIGHT COLUMN: BOUNDED SCROLLING SUB-CATEGORIES PANE */}
      {/* ==================================================== */}
      <main 
        ref={rightPaneRef}
        className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar space-y-6 sm:space-y-8 pr-0.5 pb-16"
      >
        {categories.map((cat, index) => {
          const categoryProducts = products.filter(p => {
            if (cat.id === 'offers') return p.discountPercentage >= 38;
            return p.category === cat.id;
          });
          const categoryProductCount = categoryProducts.length;
          const subcategories = cat.subcategories || [];

          return (
            <section
              key={cat.id}
              id={`category-section-${cat.id}`}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="scroll-mt-2 space-y-3"
            >
              {/* Category Header: Balanced, responsive typography with NO overlapping */}
              <div className="flex items-start justify-between gap-2 px-1 pt-1 pb-1 border-b border-gray-100">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base md:text-lg font-black text-gray-900 tracking-tight leading-snug">
                      {cat.name}
                    </h2>
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                      {categoryProductCount > 0 ? formatItemCount(categoryProductCount) : '0 items'}
                    </span>
                  </div>
                  {cat.subtitle && (
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                      {cat.subtitle}
                    </p>
                  )}
                </div>

                {categoryProductCount > 0 && (
                  <button
                    onClick={() => handleSubcategoryClick(cat, null)}
                    className="text-[11px] sm:text-xs font-bold text-[#F95721] hover:text-[#d44808] flex items-center gap-0.5 shrink-0 pt-0.5 tap-active"
                  >
                    <span>Explore All</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                )}
              </div>

              {/* CASE 1: Category HAS Subcategories Configured */}
              {subcategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* "All [Category]" Card if multiple subcategories exist */}
                  {subcategories.length > 1 && (
                    <button
                      onClick={() => handleSubcategoryClick(cat, null)}
                      className="bg-gradient-to-b from-orange-50/50 to-white rounded-2xl border border-orange-100/80 p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-2xs hover:shadow-subtle hover:border-orange-300 transition-all duration-200 tap-active group overflow-hidden relative"
                    >
                      <div className="w-full h-24 sm:h-28 rounded-xl bg-white p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                        <ResolvedImage
                          src={cat.image}
                          alt={`All ${cat.name}`}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="w-full text-center mt-2 space-y-1">
                        <h3 className="text-xs font-black text-gray-900 group-hover:text-[#F95721] line-clamp-1 leading-tight">
                          All {cat.name}
                        </h3>
                        <span className="inline-block text-[10px] text-[#F95721] font-extrabold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                          {categoryProductCount} Products →
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Individual Subcategory Cards with custom images */}
                  {subcategories.map((sub) => {
                    const subProductCount = categoryProducts.filter(p => p.subcategory === sub.id).length;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategoryClick(cat, sub)}
                        className="bg-white hover:bg-orange-50/20 rounded-2xl border border-gray-100 hover:border-orange-300 p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-2xs hover:shadow-subtle transition-all duration-200 tap-active group overflow-hidden relative"
                      >
                        <div className="w-full h-24 sm:h-28 rounded-xl bg-gray-50/80 group-hover:bg-white p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-all duration-300">
                          <ResolvedImage
                            src={sub.image || cat.image}
                            alt={sub.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        <div className="w-full text-center mt-2 space-y-1">
                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#F95721] line-clamp-1 leading-tight">
                            {sub.name}
                          </h3>
                          <span className="inline-block text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                            {subProductCount > 0 ? formatItemCount(subProductCount) : sub.subtitle || 'Explore'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : categoryProductCount > 0 ? (
                /* CASE 2: No subcategories configured, but category HAS products -> Show ProductCards directly! */
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {categoryProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                /* CASE 3: No products & no subcategories -> Friendly arriving soon banner */
                <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-2xs shrink-0 flex items-center justify-center border border-gray-100">
                    <ResolvedImage src={cat.image} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800">Fresh stock arriving soon</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      Our team is curating smart essentials for {cat.name}.
                    </p>
                  </div>
                </div>
              )}

              {/* Subtle divider between sections if not last */}
              {index < categories.length - 1 && (
                <div className="pt-2 border-b border-gray-100" />
              )}
            </section>
          );
        })}

        {/* Clean End of Categories Indicator */}
        <div className="pt-4 pb-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200/50">
            <Sparkles className="w-3 h-3 text-[#F95721]" /> You&apos;ve viewed all categories
          </span>
        </div>
      </main>

      {/* ==================================================== */}
      {/* SUBCATEGORY PRODUCTS MODAL / BOTTOM SHEET */}
      {/* ==================================================== */}
      {activeSubcategoryModal && (
        <div 
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
          onClick={() => setActiveSubcategoryModal(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 pb-[calc(1.25rem+var(--safe-bottom))] sm:pb-6 space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <span>{activeSubcategoryModal.category.name}</span>
                  {activeSubcategoryModal.subcategory && (
                    <>
                      <span>&gt;</span>
                      <span className="text-[#F95721] font-bold truncate">
                        {activeSubcategoryModal.subcategory.name}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {activeSubcategoryModal.subcategory ? activeSubcategoryModal.subcategory.name : `All ${activeSubcategoryModal.category.name}`}
                  <span className="text-xs font-bold text-gray-400 ml-2">
                    ({modalFilteredProducts.length} items)
                  </span>
                </h3>
              </div>

              <button
                onClick={() => setActiveSubcategoryModal(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Sort Bar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#F95721] focus:bg-white transition-all font-medium text-gray-900"
                />
                {modalSearchQuery && (
                  <button
                    onClick={() => setModalSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={modalSortBy}
                  onChange={(e) => setModalSortBy(e.target.value as any)}
                  className="text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-2.5 pr-6 rounded-xl appearance-none focus:outline-none focus:border-[#F95721] cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Discount</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Products Grid inside Modal */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5">
              {modalFilteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 py-1">
                  {modalFilteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">No products found</h4>
                  <p className="text-[11px] text-gray-500">
                    Try searching for different keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
