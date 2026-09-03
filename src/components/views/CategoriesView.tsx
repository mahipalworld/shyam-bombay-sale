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
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Subcategory, Category } from '@/types';

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
    selectedCategoryFilter || categories[0]?.id || 'cleaning'
  );

  // Search & Filter inside subcategory modal
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSortBy, setModalSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'discount'>('featured');
  const [modalInStockOnly, setModalInStockOnly] = useState(false);

  // References for scroll tracking and programmatic smooth scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const leftRailRef = useRef<HTMLElement | null>(null);
  const rightPaneRef = useRef<HTMLElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  // If selectedCategoryFilter is set externally (e.g. from banner or search), scroll to it
  useEffect(() => {
    if (selectedCategoryFilter && sectionRefs.current[selectedCategoryFilter]) {
      setActiveCategoryId(selectedCategoryFilter);
      const el = sectionRefs.current[selectedCategoryFilter];
      const container = rightPaneRef.current;
      if (el && container) {
        isProgrammaticScrollRef.current = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 800);
      }
    }
  }, [selectedCategoryFilter]);

  // Scroll-Spy: Track which category section is currently visible as user scrolls down the right pane
  useEffect(() => {
    const container = rightPaneRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const categoryKeys = categories.map(c => c.id);
      const containerRect = container.getBoundingClientRect();
      const viewportOffset = containerRect.top + 80;

      let currentVisibleCategory = categoryKeys[0];

      for (const catId of categoryKeys) {
        const el = sectionRefs.current[catId];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportOffset) {
            currentVisibleCategory = catId;
          }
        }
      }

      if (currentVisibleCategory && currentVisibleCategory !== activeCategoryId) {
        setActiveCategoryId(currentVisibleCategory);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategoryId]);

  // Smooth scroll to category section when left rail item is clicked
  const handleLeftRailClick = (catId: string) => {
    setActiveCategoryId(catId);
    setSelectedCategoryFilter(catId);

    const el = sectionRefs.current[catId];
    const container = rightPaneRef.current;

    if (el && container) {
      isProgrammaticScrollRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
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
    <div className="flex gap-2 sm:gap-3 md:gap-5 h-[calc(100dvh-120px)] sm:h-[calc(100vh-125px)] md:h-[calc(100vh-140px)] overflow-hidden animate-fadeIn select-none">
      {/* ==================================================== */}
      {/* LEFT COLUMN: BOUNDED MOBILE CATEGORY RAIL */}
      {/* ==================================================== */}
      <aside 
        ref={leftRailRef}
        className="w-[74px] sm:w-24 md:w-32 flex-shrink-0 bg-[#F4F5F7] rounded-2xl md:rounded-3xl border border-gray-200/70 overflow-y-auto no-scrollbar flex flex-col py-1.5 shadow-2xs h-full"
      >
        <div className="space-y-1 pb-4">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const isOffers = cat.id === 'offers';

            return (
              <button
                key={cat.id}
                onClick={() => handleLeftRailClick(cat.id)}
                className={`w-full py-2.5 px-1 flex flex-col items-center justify-center text-center transition-all duration-200 relative tap-active group ${
                  isActive 
                    ? 'bg-white text-gray-900 font-extrabold shadow-2xs' 
                    : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 font-medium'
                }`}
              >
                {/* Active Left Indicator Bar (Amazon-style) */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-[#F35C16] rounded-r-full" />
                )}

                {/* Category Icon / Thumbnail */}
                <div 
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden p-0.5 flex items-center justify-center transition-transform duration-200 border bg-white ${
                    isActive 
                      ? 'border-[#F35C16] ring-2 ring-[#F35C16]/20 scale-105' 
                      : 'border-gray-200/80 group-hover:scale-105'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>

                {/* Category Title */}
                <span className={`text-[10px] sm:text-xs leading-tight mt-1.5 line-clamp-2 px-0.5 tracking-tight ${
                  isActive ? 'text-gray-900 font-extrabold' : 'text-gray-600 font-semibold'
                }`}>
                  {cat.name}
                </span>

                {/* Optional Offers/Hot Pill */}
                {isOffers && (
                  <span className="mt-0.5 text-[8px] font-black uppercase text-[#F35C16] bg-orange-100/90 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-[#F35C16]" /> Hot
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
        className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar space-y-6 sm:space-y-8 pr-0.5 pb-12"
      >
        {categories.map((cat, index) => {
          const categoryProductCount = products.filter(p => {
            if (cat.id === 'offers') return p.discountPercentage >= 38;
            return p.category === cat.id;
          }).length;

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
              {/* Category Header: Clean, modern, never truncated */}
              <div className="flex items-center justify-between gap-2 px-0.5 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-gray-900 tracking-tight whitespace-nowrap">
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {categoryProductCount} items
                  </span>
                </div>

                <button
                  onClick={() => handleSubcategoryClick(cat, null)}
                  className="text-[11px] sm:text-xs font-extrabold text-[#F35C16] hover:text-[#d44808] flex items-center gap-0.5 flex-shrink-0 tap-active"
                >
                  <span>Explore All</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                </button>
              </div>

              {/* EXACTLY TWO SUBCATEGORIES PER ROW (2-COLUMN GRID) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* "All [Category]" Card */}
                <button
                  onClick={() => handleSubcategoryClick(cat, null)}
                  className="bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 text-center flex flex-col items-center justify-between shadow-2xs hover:shadow-subtle hover:border-orange-200 transition-all duration-200 tap-active group overflow-hidden"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100/60 mb-2 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
                      alt={`All ${cat.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="w-full text-center">
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#F35C16] line-clamp-2 leading-snug min-h-[30px] flex items-center justify-center text-center px-0.5">
                      All {cat.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {categoryProductCount} Products
                    </p>
                  </div>
                </button>

                {/* Individual Subcategories (2 per row) */}
                {subcategories.map((sub) => {
                  const subProductCount = products.filter(p => {
                    if (cat.id === 'offers') return p.discountPercentage >= 38 && p.subcategory === sub.id;
                    return p.category === cat.id && p.subcategory === sub.id;
                  }).length || sub.itemCount || 0;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubcategoryClick(cat, sub)}
                      className="bg-white rounded-2xl border border-gray-100 p-2 sm:p-2.5 text-center flex flex-col items-center justify-between shadow-2xs hover:shadow-subtle hover:border-orange-200 transition-all duration-200 tap-active group overflow-hidden"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100/60 mb-2 relative flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sub.image || cat.image}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      <div className="w-full text-center">
                        <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#F35C16] line-clamp-2 leading-snug min-h-[30px] flex items-center justify-center text-center px-0.5">
                          {sub.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {subProductCount > 0 ? `${subProductCount} Items` : 'Explore'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Subtle divider between sections if not last */}
              {index < categories.length - 1 && (
                <div className="pt-2 border-b border-gray-200/60" />
              )}
            </section>
          );
        })}

        {/* Clean End of Categories Indicator (No dark space or overscroll!) */}
        <div className="pt-4 pb-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200/50">
            <Sparkles className="w-3 h-3 text-[#F35C16]" /> You&apos;ve viewed all categories
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
            className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] flex flex-col"
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
                      <span className="text-[#F35C16] font-bold truncate">
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
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#F35C16] focus:bg-white transition-all font-medium text-gray-900"
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
                  className="text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-2.5 pr-6 rounded-xl appearance-none focus:outline-none focus:border-[#F35C16] cursor-pointer"
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
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#F35C16] flex items-center justify-center mx-auto">
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
