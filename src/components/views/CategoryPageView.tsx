'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Category, Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { ResolvedImage } from '@/components/common/ResolvedMedia';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Store, 
  ChevronDown, 
  SlidersHorizontal,
  PackageCheck,
  Search,
  X,
  Layers,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';

interface CategoryPageViewProps {
  category: Category;
  products: Product[];
  allCategories?: Category[];
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({ 
  category, 
  products,
  allCategories = []
}) => {
  const { cart, setActiveTab, setSelectedCategoryFilter, categories: storeCategories } = useStore();
  const [selectedSubcat, setSelectedSubcat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'priceLow' | 'priceHigh' | 'discount'>('default');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeCategoryList = allCategories.length > 0 ? allCategories : storeCategories;

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic subcategories extracted from category definition or product items
  const availableSubcategories = useMemo(() => {
    const list: { id: string; name: string; count: number }[] = [];
    const definedSubs = category.subcategories || [];

    if (definedSubs.length > 0) {
      definedSubs.forEach((sub) => {
        const count = products.filter((p) => p.subcategory === sub.id).length;
        if (count > 0) {
          list.push({ id: sub.id, name: sub.name, count });
        }
      });
    } else {
      const subMap = new Map<string, number>();
      products.forEach((p) => {
        if (p.subcategory) {
          subMap.set(p.subcategory, (subMap.get(p.subcategory) || 0) + 1);
        }
      });
      subMap.forEach((count, subId) => {
        const readableName = subId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        list.push({ id: subId, name: readableName, count });
      });
    }

    return list;
  }, [category, products]);

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    let list = [...products];

    // Subcategory Filter
    if (selectedSubcat !== 'all') {
      list = list.filter((p) => p.subcategory === selectedSubcat);
    }

    // In-Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'priceLow') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => b.discountPercentage - a.discountPercentage);
    }

    return list;
  }, [products, selectedSubcat, inStockOnly, searchQuery, sortBy]);

  const categoryFAQs = [
    {
      q: `What kinds of products are available under ${category.name}?`,
      a: `Under ${category.name}, SBS Store curates verified, durable everyday home and utility essentials at direct-from-factory wholesale and retail rates. All items are physical-inspected in our Subhanpura, Vadodara hub before dispatch.`,
    },
    {
      q: 'Do you offer same-day doorstep delivery in Vadodara?',
      a: 'Yes! We deliver across Subhanpura, Gorwa, Gotri, Alkapuri, Manjalpur, Karelibaug, and all neighborhoods in Vadodara. Same-day or next-day delivery is available for local orders, and fast courier shipping across Gujarat & India.',
    },
    {
      q: 'Can I visit the store in person to buy or inspect items?',
      a: 'Absolutely! Our physical showroom is located at Shop 1, Vrundvilla, Laxmipura Road, Subhanpura, Vadodara (Open all 7 days from 10:00 AM to 9:30 PM). You can walk in and purchase at the same honest prices.',
    },
    {
      q: 'What is the return and replacement policy?',
      a: 'All purchases from SBS Store (Shyam Bombay Sale) are backed by our 7-day hassle-free replacement warranty for defective or transit-damaged items.',
    },
  ];

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-[#F95721] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button 
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-700 transition-colors shrink-0 cursor-pointer"
              aria-label="Back to store"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/sbs-wordmark.svg"
                alt="SBS Store"
                className="h-6 sm:h-7 w-auto object-contain group-hover:scale-102 transition-transform"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Link to 2-Pane Split View */}
            <Link
              href={`/?tab=categories&category=${category.id}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-[#F95721] text-xs font-black transition-colors"
              title="Open full catalog in split-pane quick shopping mode"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split View Mode</span>
            </Link>

            {/* Shopping Cart Button */}
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

        {/* ------------------------------------------------------------- */}
        {/* HORIZONTAL SWIPEABLE CATEGORY RIBBON (Handy Window Shopping)   */}
        {/* ------------------------------------------------------------- */}
        {activeCategoryList.length > 0 && (
          <div className="border-t border-gray-100 bg-[#FBFBFC] py-2 px-3 sm:px-4">
            <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {activeCategoryList.map((cat) => {
                const isActive = cat.id === category.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}/`}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-white border-[#F95721] text-[#F95721] shadow-2xs ring-2 ring-orange-100'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-lg bg-orange-50/60 p-0.5 flex items-center justify-center shrink-0">
                      <ResolvedImage
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <span className="whitespace-nowrap">{cat.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F95721] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6 pb-20 space-y-5">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto pb-1" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#F95721] transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link href="/?tab=categories" className="hover:text-[#F95721] transition-colors shrink-0">Categories</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-gray-900 font-bold truncate">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div 
          className="rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-xs relative overflow-hidden"
          style={{ backgroundColor: category.bgColor || '#FFF0E6' }}
        >
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-2xs" 
                style={{ backgroundColor: category.accentColor || '#F95721' }}
              >
                SBS Department
              </span>
              <span className="text-[11px] font-bold text-gray-600 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                {products.length} Products Available
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {category.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-xl">
              Shop durable, tested everyday essentials at honest factory prices. Fast doorstep delivery across Vadodara & all India, or walk into our Subhanpura showroom.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs font-bold text-gray-800 flex-wrap">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 100% Quality Checked
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#F95721]" /> Fast Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-purple-700" /> Vadodara Retail Hub
              </span>
            </div>

            {/* Mobile Split View Button */}
            <div className="pt-2 sm:hidden">
              <Link
                href={`/?tab=categories&category=${category.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#F95721] border border-orange-200 text-xs font-black shadow-2xs tap-active"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Browse All Categories in Split View ⊞</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBCATEGORY QUICK-JUMP FILTER CHIPS                            */}
        {/* ------------------------------------------------------------- */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedSubcat('all')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-active ${
                selectedSubcat === 'all'
                  ? 'bg-[#F95721] text-white shadow-2xs font-black'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              All {category.name} ({products.length})
            </button>

            {availableSubcategories.map((sub) => {
              const isSelected = selectedSubcat === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcat(isSelected ? 'all' : sub.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 tap-active ${
                    isSelected
                      ? 'bg-[#F95721] text-white shadow-2xs font-black'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sub.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter & Live Search Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-100 shadow-2xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
          {/* In-category Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-hidden focus:border-[#F95721] focus:bg-white text-gray-900 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* In Stock Only Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors tap-active ${
                inStockOnly
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? 'text-white' : 'text-gray-400'}`} />
              <span>In Stock</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl pl-2.5 pr-7 py-1.5 appearance-none focus:outline-hidden focus:border-[#F95721] cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="discount">Biggest % Off</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {processedProducts.length > 0 ? (
          <div>
            <div className="text-xs font-bold text-gray-500 mb-2.5">
              Showing <span className="text-[#F95721] font-black">{processedProducts.length}</span> products
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {processedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} priority={idx < 4} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 space-y-3">
            <PackageCheck className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">No matching products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery 
                ? `No items in ${category.name} matched "${searchQuery}". Try a different keyword.` 
                : inStockOnly 
                  ? 'No items are currently in stock for this filter.'
                  : 'New stock is arriving soon for this section.'}
            </p>
            {(searchQuery || inStockOnly || selectedSubcat !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setInStockOnly(false);
                  setSelectedSubcat('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F95721]" />
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Local Vadodara Store & Hub Trust Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-gray-900 font-black text-sm">
            <Store className="w-4 h-4 text-[#F95721]" />
            <span>Visit SBS Store Showroom in Subhanpura, Vadodara</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <MapPin className="w-4 h-4 text-[#F95721] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900">Physical Store Address</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Shop 1, Vrundvilla, Ambedkar Nagar Society, Laxmipura Rd, Near Rami School, Subhanpura, Vadodara, Gujarat 390023.
                </p>
                <a
                  href="https://share.google/Pa5CkR6pMiRD0MMZm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#F95721] hover:underline inline-block mt-1"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <Phone className="w-4 h-4 text-[#00A859] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900">WhatsApp &amp; Phone Inquiries</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Need bulk orders or product confirmation? Contact our team directly.
                </p>
                <a
                  href="tel:+919226294797"
                  className="text-[11px] font-bold text-[#00A859] hover:underline inline-block mt-1"
                >
                  +91 92262 94797 (10:00 AM – 9:30 PM)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Category Narrative & Local Vadodara Guide */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-xs space-y-4">
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
              About {category.name} at SBS Store (Shyam Bombay Sale)
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              At SBS Store, we source quality everyday essentials directly from verified manufacturers, eliminating middleman markups so families in Vadodara and across India get genuine products at honest wholesale and retail prices. Whether you are stocking up for home maintenance or looking for smart utility gadgets, our catalog is curated for real durability.
            </p>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">
              Frequently Asked Questions
            </h3>
            {categoryFAQs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 text-xs font-bold text-gray-900 hover:text-[#F95721] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#F95721]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
