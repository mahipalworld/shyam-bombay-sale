'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  LayoutTemplate, 
  Sparkles, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Search, 
  Tag, 
  Star, 
  Flame, 
  Image as ImageIcon,
  CheckSquare,
  Square
} from 'lucide-react';
import { HeroBannerItem, TodayDealItem, HomepageSection } from '@/types';

interface HomepageManagerViewProps {
  onOpenPreview: () => void;
}

export const HomepageManagerView: React.FC<HomepageManagerViewProps> = ({
  onOpenPreview,
}) => {
  const { 
    heroBanners, 
    setHeroBanners, 
    categories, 
    homepageCategories, 
    setHomepageCategories, 
    homepageSubcategories,
    setHomepageSubcategories,
    products, 
    trendingNowProducts, 
    setTrendingNowProducts, 
    todayDeals, 
    setTodayDeals, 
    bestSellersConfig, 
    setBestSellersConfig, 
    homepageSections, 
    setHomepageSections, 
    showToast 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'sections' | 'hero' | 'categories' | 'subcategories' | 'trending' | 'deals' | 'bestsellers'>('sections');

  // Hero banner modal state
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroBannerItem | null>(null);
  const [heroForm, setHeroForm] = useState({
    heading: '',
    description: '',
    image: '',
    ctaText: 'Shop Now',
    ctaDestination: 'cleaning',
    enabled: true
  });

  // Trending search
  const [trendingSearch, setTrendingSearch] = useState('');

  // Deal modal state
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealForm, setDealForm] = useState({
    productId: products[0]?.id || '',
    title: 'Deals of the Day',
    discount: 40,
    bannerImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    startDate: '2026-08-30',
    endDate: '2026-09-05',
    enabled: true
  });

  // Section Reordering & Toggles
  const handleToggleSection = (id: HomepageSection['id']) => {
    setHomepageSections(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
    showToast('Homepage section visibility updated');
  };

  const handleMoveSectionUp = (idx: number) => {
    if (idx <= 0) return;
    setHomepageSections(prev => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
      return arr;
    });
    showToast('Section order updated');
  };

  const handleMoveSectionDown = (idx: number) => {
    if (idx >= homepageSections.length - 1) return;
    setHomepageSections(prev => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
      return arr;
    });
    showToast('Section order updated');
  };

  // Hero Banners
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHero) {
      setHeroBanners(prev =>
        prev.map(b => b.id === editingHero.id ? { ...b, ...heroForm } : b)
      );
      showToast('Hero banner updated');
    } else {
      const newBanner: HeroBannerItem = {
        ...heroForm,
        id: `hb_${Date.now()}`
      };
      setHeroBanners(prev => [...prev, newBanner]);
      showToast('New hero banner created');
    }
    setIsHeroModalOpen(false);
  };

  // Trending Selection Toggle
  const handleToggleTrendingProduct = (prodId: string) => {
    setTrendingNowProducts(prev => {
      if (prev.includes(prodId)) {
        return prev.filter(id => id !== prodId);
      } else {
        return [...prev, prodId];
      }
    });
    showToast('Trending Now product selection updated');
  };

  // Category Selection Toggle
  const handleToggleCategory = (catId: string) => {
    setHomepageCategories(prev => {
      if (prev.includes(catId)) {
        if (prev.length <= 1) {
          showToast('Keep at least 1 category visible', 'error');
          return prev;
        }
        return prev.filter(id => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
    showToast('Homepage category visibility updated');
  };

  // Subcategory Selection Toggle for Curated Collections
  const handleToggleSubcategory = (categoryId: string, subcategoryId: string) => {
    setHomepageSubcategories(prev => {
      const exists = prev.some(item => item.categoryId === categoryId && item.subcategoryId === subcategoryId);
      if (exists) {
        if (prev.length <= 1) {
          showToast('Keep at least 1 curated collection active', 'error');
          return prev;
        }
        showToast('Subcategory removed from homepage collections');
        return prev.filter(item => !(item.categoryId === categoryId && item.subcategoryId === subcategoryId));
      } else {
        showToast('Subcategory added to homepage collections ✨');
        return [...prev, { categoryId, subcategoryId }];
      }
    });
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Homepage Manager</h1>
          <p className="text-[11px] text-gray-500">Live storefront merchandising and layouts</p>
        </div>

        {/* Live Customer Preview CTA */}
        <button
          onClick={onOpenPreview}
          className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-gray-900/20 active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4 text-orange-400" />
          <span>Preview Homepage</span>
        </button>
      </div>

      {/* Sub Tab Switcher Pills */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          { key: 'sections', label: 'Layout & Order' },
          { key: 'hero', label: 'Hero Banners' },
          { key: 'categories', label: 'Categories' },
          { key: 'subcategories', label: 'Curated Collections' },
          { key: 'trending', label: 'Trending Now' },
          { key: 'deals', label: 'Deals of Day' },
          { key: 'bestsellers', label: 'Best Sellers' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSubTab(item.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === item.key
                ? 'bg-white text-[#F35C16] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUB TAB 1: Section Ordering & Toggles */}
      {activeSubTab === 'sections' && (
        <div className="space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-950 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F35C16] flex-shrink-0" />
            <p className="text-[11px]">
              Drag or use Up/Down controls to alter the vertical layout order on the customer home screen.
            </p>
          </div>

          <div className="space-y-2">
            {homepageSections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`bg-white border rounded-3xl p-3.5 flex items-center justify-between gap-3 shadow-2xs transition-all ${
                  sec.enabled ? 'border-gray-100' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Up / Down Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveSectionUp(idx)}
                      className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:text-black disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === homepageSections.length - 1}
                      onClick={() => handleMoveSectionDown(idx)}
                      className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:text-black disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">{sec.name}</span>
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded">
                        Position #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {sec.enabled ? 'Active on customer storefront' : 'Disabled / Hidden'}
                    </p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sec.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {sec.enabled ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: Hero Banners */}
      {activeSubTab === 'hero' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-900">Hero Carousel Slides ({heroBanners.length})</h2>
            <button
              onClick={() => {
                setEditingHero(null);
                setHeroForm({
                  heading: 'Monsoon Essentials Sale',
                  description: 'Up to 50% off on all home utilities & cleaners.',
                  image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1000&auto=format&fit=crop&q=80',
                  ctaText: 'Shop Deals',
                  ctaDestination: 'cleaning',
                  enabled: true
                });
                setIsHeroModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#F35C16] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {heroBanners.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt={b.heading} className="w-16 h-14 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{b.heading}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{b.description}</p>
                    <span className="text-[9px] font-bold bg-orange-100 text-[#F35C16] px-1.5 py-0.2 rounded">
                      CTA: &quot;{b.ctaText}&quot; ➔ {b.ctaDestination}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.enabled ? 'Live Banner' : 'Disabled'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingHero(b);
                        setHeroForm({ ...b });
                        setIsHeroModalOpen(true);
                      }}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setHeroBanners(prev => prev.filter(item => item.id !== b.id));
                        showToast('Banner removed');
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: Homepage Categories Selector */}
      {activeSubTab === 'categories' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Select which categories appear on the homepage categories widget:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const isSelected = homepageCategories.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCategory(c.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-orange-50/80 border-orange-300 text-[#F35C16] shadow-2xs' 
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold capitalize truncate">{c.name}</p>
                    <span className="text-[9px] font-semibold text-gray-400">
                      {isSelected ? '✓ On Homepage' : '+ Click to show'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB: Curated Collections (Sub-Categories) Selector */}
      {activeSubTab === 'subcategories' && (
        <div className="space-y-4">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 text-xs text-orange-950 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F35C16] flex-shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Select which <b>Curated Sub-Sections</b> appear on the customer Homepage under the <b>&quot;Curated Collections&quot;</b> section.
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const subs = cat.subcategories || [];
              if (subs.length === 0) return null;

              return (
                <div key={cat.id} className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        style={{ backgroundColor: cat.bgColor || '#FFF9E6', color: cat.accentColor || '#D97706' }}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      >
                        {cat.name}
                      </span>
                      <span className="text-xs font-bold text-gray-700">{cat.subtitle}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {subs.length} Sub-Sections
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subs.map((sub) => {
                      const isFeatured = homepageSubcategories?.some(
                        item => item.categoryId === cat.id && item.subcategoryId === sub.id
                      );
                      const count = products.filter(
                        p => p.category === cat.id && p.subcategory === sub.id
                      ).length;

                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleToggleSubcategory(cat.id, sub.id)}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isFeatured
                              ? 'bg-orange-50/80 border-orange-300 text-[#F35C16] shadow-2xs'
                              : 'bg-gray-50/60 border-gray-100 text-gray-700 hover:bg-gray-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 border border-gray-200/60 shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sub.image || cat.image}
                                alt={sub.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-gray-900">{sub.name}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-1">{sub.subtitle || 'Explore collection'}</p>
                              <span className="text-[9px] font-bold text-gray-400">{count} products</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl whitespace-nowrap flex-shrink-0 ${
                            isFeatured
                              ? 'bg-[#F35C16] text-white shadow-2xs'
                              : 'bg-white border border-gray-200 text-gray-500'
                          }`}>
                            {isFeatured ? '✓ Featured' : '+ Feature'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 4: Trending Now Selection */}
      {activeSubTab === 'trending' && (
        <div className="space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-950 flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F35C16] flex-shrink-0" />
            <p className="text-[11px]">
              Check items to pin them into the customer <b>Trending Now</b> slider.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog items to feature in Trending..."
              value={trendingSearch}
              onChange={(e) => setTrendingSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F35C16]"
            />
          </div>

          <div className="space-y-2">
            {products
              .filter(p => !trendingSearch || p.name.toLowerCase().includes(trendingSearch.toLowerCase()))
              .map((p) => {
                const isSelected = trendingNowProducts.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleTrendingProduct(p.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-orange-50/70 border-orange-300 shadow-2xs' 
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 p-1 flex items-center justify-center border border-gray-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500">₹{p.price} • {p.category}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <span className="px-2 py-0.5 bg-[#F35C16] text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Trending</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                          + Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB TAB 5: Today's Deals */}
      {activeSubTab === 'deals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-900">Today&apos;s Deal Highlights</h2>
            <button
              onClick={() => setIsDealModalOpen(true)}
              className="px-3 py-1.5 bg-[#F35C16] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Deal</span>
            </button>
          </div>

          <div className="space-y-2">
            {todayDeals.map((deal) => {
              const matchedProd = products.find(p => p.id === deal.productId);
              return (
                <div key={deal.id} className="bg-white border border-gray-100 rounded-3xl p-3.5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-red-600 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {deal.title}
                    </span>
                    <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                      {deal.discount}% OFF
                    </span>
                  </div>

                  {matchedProd && (
                    <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={matchedProd.image} alt={matchedProd.name} className="w-10 h-10 rounded-xl object-contain bg-white p-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{matchedProd.name}</p>
                        <p className="text-[10px] text-gray-500">Deal Price: ₹{matchedProd.price}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Valid: {deal.startDate} to {deal.endDate}</span>
                    <span className="font-bold text-green-600">Active Campaign</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 6: Best Sellers Mode Engine */}
      {activeSubTab === 'bestsellers' && (
        <div className="space-y-3 bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-gray-900">Best Sellers Algorithm Mode</h3>
            <p className="text-[10px] text-gray-400">Choose how best-sellers are chosen for customers</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setBestSellersConfig(prev => ({ ...prev, mode: 'auto' }));
                showToast('Best sellers set to Automatic Algorithm');
              }}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                bestSellersConfig.mode === 'auto'
                  ? 'bg-orange-50 border-[#F35C16] text-[#F35C16]'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>⚡ Automatic</span>
                {bestSellersConfig.mode === 'auto' && <Check className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                Calculated automatically from sales volume & reviews.
              </p>
            </button>

            <button
              onClick={() => {
                setBestSellersConfig(prev => ({ ...prev, mode: 'manual' }));
                showToast('Best sellers set to Manual Selection');
              }}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                bestSellersConfig.mode === 'manual'
                  ? 'bg-orange-50 border-[#F35C16] text-[#F35C16]'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>🎯 Manual Pick</span>
                {bestSellersConfig.mode === 'manual' && <Check className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                Hand-picked high margin products by the admin.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Bottom Sheet Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full mx-auto p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingHero ? 'Edit Hero Banner' : 'New Hero Banner'}
              </h3>
              <button
                onClick={() => setIsHeroModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Banner Heading</label>
                <input
                  type="text"
                  required
                  value={heroForm.heading}
                  onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description Subtitle</label>
                <input
                  type="text"
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Banner Background Image URL</label>
                <input
                  type="url"
                  required
                  value={heroForm.image}
                  onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={heroForm.ctaText}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Link Destination</label>
                  <select
                    value={heroForm.ctaDestination}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaDestination: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsHeroModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F35C16] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
