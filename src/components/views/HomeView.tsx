'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight, ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    products, 
    categories, 
    homepageCategories, 
    homepageSubcategories,
    setActiveTab, 
    setSelectedCategoryFilter,
    setSelectedSubcategoryFilter,
    setSelectedProductDetail
  } = useStore();

  const visibleCategories = categories.filter((cat) => {
    if (cat.showOnHome !== undefined) return cat.showOnHome;
    if (homepageCategories && homepageCategories.length > 0) return homepageCategories.includes(cat.id);
    return true;
  });

  // Prepare active featured subcategories list
  const featuredSubcategoryItems = React.useMemo(() => {
    if (!homepageSubcategories || homepageSubcategories.length === 0) return [];
    
    const list: {
      categoryId: string;
      cat: typeof categories[0];
      sub: NonNullable<typeof categories[0]['subcategories']>[0];
      productCount: number;
    }[] = [];

    homepageSubcategories.forEach((item) => {
      const parentCat = categories.find((c) => c.id === item.categoryId);
      if (!parentCat || !parentCat.subcategories) return;
      const subMatch = parentCat.subcategories.find((s) => s.id === item.subcategoryId);
      if (!subMatch) return;

      const count = products.filter(
        (p) => p.category === item.categoryId && p.subcategory === item.subcategoryId
      ).length;

      list.push({
        categoryId: item.categoryId,
        cat: parentCat,
        sub: subMatch,
        productCount: count,
      });
    });

    return list;
  }, [homepageSubcategories, categories, products]);

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
    <div className="space-y-8 pb-24 md:pb-12 animate-fadeIn">
      {/* Hero Banner matching Screenshot */}
      <section className="pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFE8DC] border border-[#FFE2D1] p-6 md:p-10 shadow-sm">
          {/* Decorative background circle */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-[#F35C16] shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> Special Everyday Collection
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Smart Products. <br />
                <span className="text-[#F35C16]">Better Prices.</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium">
                Everyday essentials designed for a smarter and easier you.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-xs md:text-sm font-bold rounded-xl shadow-float active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('offers');
                    setActiveTab('categories');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-white/80 hover:bg-white text-gray-800 text-xs md:text-sm font-bold rounded-xl border border-orange-200/80 transition-all"
                >
                  <span>View Offers</span>
                </button>
              </div>
            </div>

            {/* Collage Image Showcase - Clickable products */}
            <div className="relative flex items-center justify-center md:justify-end mt-2 md:mt-0">
              <div className="relative w-full max-w-[340px] h-44 md:h-56 flex items-center justify-center">
                {/* Mini washing machine */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80"
                  alt="Washing Machine"
                  onClick={() => handleHeroProductClick('p1')}
                  className="w-28 md:w-36 h-28 md:h-36 object-contain rounded-2xl drop-shadow-xl transform -rotate-6 hover:scale-105 active:scale-95 transition-transform bg-white/90 p-2 cursor-pointer tap-active"
                  title="View Mini Washing Machine"
                />
                {/* Trimmer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80"
                  alt="Trimmer"
                  onClick={() => handleHeroProductClick('p4')}
                  className="w-24 md:w-32 h-28 md:h-36 object-contain -ml-6 rounded-2xl drop-shadow-xl transform rotate-6 hover:scale-105 active:scale-95 transition-transform bg-white/90 p-2 cursor-pointer tap-active"
                  title="View Cordless Trimmer"
                />
                {/* Sealer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80"
                  alt="Sealer"
                  onClick={() => handleHeroProductClick('p3')}
                  className="w-24 md:w-28 h-24 md:h-28 object-contain -ml-4 rounded-2xl drop-shadow-xl transform -rotate-3 hover:scale-105 active:scale-95 transition-transform bg-white/90 p-2 hidden sm:block cursor-pointer tap-active"
                  title="View Packet Sealer"
                />
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <span className="w-6 h-1.5 rounded-full bg-[#F35C16]" />
            <span className="w-2 h-1.5 rounded-full bg-orange-200" />
            <span className="w-2 h-1.5 rounded-full bg-orange-200" />
          </div>
        </div>
      </section>

      {/* Feature / Trust Badges Strip */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {/* Free Express Delivery */}
        <div className="bg-gradient-to-b from-orange-50/50 via-white to-white border border-orange-100/70 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3.5 shadow-xs hover:shadow-sm hover:border-orange-200 transition-all group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-100/80 text-[#F35C16] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
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
            className="text-xs md:text-sm font-bold text-[#F35C16] flex items-center gap-0.5 hover:underline"
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

      {/* Curated Collections / Sub-Categories Showcase Section */}
      {featuredSubcategoryItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Curated Collections</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Handpicked spaces, aesthetics & smart utilities</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategoryFilter(null);
                setSelectedSubcategoryFilter(null);
                setActiveTab('categories');
              }}
              className="text-xs md:text-sm font-bold text-[#F35C16] flex items-center gap-0.5 hover:underline"
            >
              Explore All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
            {featuredSubcategoryItems.map((item) => (
              <div
                key={`${item.categoryId}-${item.sub.id}`}
                onClick={() => handleSubcategoryClick(item.categoryId, item.sub.id)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-orange-300/80 shadow-2xs hover:shadow-card transition-all duration-300 p-4 flex flex-col justify-between tap-active"
              >
                {/* Background ambient gradient glow */}
                <div 
                  style={{ backgroundColor: item.cat.bgColor || '#FFF9E6' }}
                  className="absolute inset-0 opacity-40 group-hover:opacity-75 transition-opacity"
                />

                <div className="relative z-10 space-y-3">
                  {/* Category Pill + Count Badge */}
                  <div className="flex items-center justify-between gap-1">
                    <span 
                      style={{ color: item.cat.accentColor || '#D97706', borderColor: `${item.cat.accentColor || '#D97706'}30` }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 border backdrop-blur-xs"
                    >
                      {item.cat.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                      {item.productCount} Item{item.productCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Subcategory Visual Hero Image */}
                  <div className="w-full h-28 sm:h-32 rounded-2xl overflow-hidden bg-white/90 p-2 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.sub.image || item.cat.image}
                      alt={item.sub.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 pt-1">
                    <h3 className="text-sm md:text-base font-extrabold text-gray-900 group-hover:text-[#F35C16] transition-colors line-clamp-1">
                      {item.sub.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {item.sub.subtitle || 'Explore popular picks'}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA Row */}
                <div className="relative z-10 pt-3 mt-2 border-t border-gray-100/80 flex items-center justify-between text-xs font-bold text-[#F35C16]">
                  <span>Shop Collection</span>
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#F35C16] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
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
            className="text-xs md:text-sm font-bold text-[#F35C16] flex items-center gap-0.5 hover:underline"
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
            className="text-xs md:text-sm font-bold text-[#F35C16] flex items-center gap-0.5 hover:underline"
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
              <h3 className="text-2xl md:text-3xl font-black text-[#F35C16]">40% OFF</h3>
              <p className="text-sm font-bold text-gray-900">On Daily Essentials</p>
              <p className="text-xs text-gray-500">Limited time only!</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F35C16] pt-1">
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
              <h3 className="text-2xl md:text-3xl font-black text-[#F35C16]">35% OFF</h3>
              <p className="text-sm font-bold text-gray-900">On Personal Care</p>
              <p className="text-xs text-gray-500">Hurry, Limited Stock!</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F35C16] pt-1">
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
            className="text-xs md:text-sm font-bold text-[#F35C16] flex items-center gap-0.5 hover:underline"
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
