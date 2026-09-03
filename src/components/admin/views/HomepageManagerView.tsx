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
  Square,
  Save,
  Gift
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
    stories,
    addStory,
    updateStory,
    deleteStory,
    toggleStory,
    flashDealConfig,
    updateFlashDealConfig,
    showToast 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'sections' | 'stories' | 'hero' | 'categories' | 'subcategories' | 'trending' | 'deals' | 'bestsellers'>('stories');

  // Stories Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [storyForm, setStoryForm] = useState({
    title: '',
    subtitle: '',
    tag: 'Trending',
    media: '',
    productId: products[0]?.id || 'p1',
    productName: products[0]?.name || '',
    price: products[0]?.price || 499,
    originalPrice: products[0]?.originalPrice || 999,
    discount: '50% OFF',
    accentColor: '#F95721',
    bgGradient: 'from-orange-600 via-orange-950 to-black',
    enabled: true,
    order: 1,
  });

  const handleOpenAddStory = () => {
    setEditingStory(null);
    const p = products[0];
    setStoryForm({
      title: 'Quick Demo',
      subtitle: p ? p.name : 'Everyday Essential',
      tag: '🔥 10s Demo',
      media: p ? p.image : 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1000&auto=format&fit=crop&q=80',
      productId: p ? p.id : 'p1',
      productName: p ? p.name : 'Mini Washing Machine',
      price: p ? p.price : 499,
      originalPrice: p ? (p.originalPrice || p.price * 2) : 999,
      discount: '50% OFF',
      accentColor: '#F95721',
      bgGradient: 'from-orange-600 via-orange-950 to-black',
      enabled: true,
      order: stories.length + 1,
    });
    setIsStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: any) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      subtitle: story.subtitle,
      tag: story.tag,
      media: story.media,
      productId: story.productId,
      productName: story.productName,
      price: story.price,
      originalPrice: story.originalPrice,
      discount: story.discount,
      accentColor: story.accentColor || '#F95721',
      bgGradient: story.bgGradient || 'from-orange-600 via-orange-950 to-black',
      enabled: story.enabled !== false,
      order: story.order || 1,
    });
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim() || !storyForm.media.trim()) {
      showToast('Please provide a title and media image/video URL', 'error');
      return;
    }

    const payload = {
      title: storyForm.title.trim(),
      subtitle: storyForm.subtitle.trim(),
      tag: storyForm.tag.trim(),
      media: storyForm.media.trim(),
      type: 'image' as const,
      productId: storyForm.productId,
      productName: storyForm.productName,
      price: Number(storyForm.price) || 0,
      originalPrice: Number(storyForm.originalPrice) || 0,
      discount: storyForm.discount,
      accentColor: storyForm.accentColor,
      bgGradient: storyForm.bgGradient,
      enabled: storyForm.enabled,
      order: Number(storyForm.order) || 1,
    };

    if (editingStory) {
      updateStory(editingStory.id, payload);
    } else {
      addStory(payload);
    }
    setIsStoryModalOpen(false);
  };

  // Flash Deals local state
  const [flashForm, setFlashForm] = useState({
    enabled: flashDealConfig?.enabled !== false,
    title: flashDealConfig?.title || 'Deals of the Day',
    badgeText: flashDealConfig?.badgeText || 'LIVE FLASH SALE',
    discountText: flashDealConfig?.discountText || 'Up to 55% Off',
    productId: flashDealConfig?.productId || 'p3',
    productName: flashDealConfig?.productName || 'Portable Food Packet Sealer',
    dealPrice: flashDealConfig?.dealPrice || 199,
    originalPrice: flashDealConfig?.originalPrice || 499,
    productImage: flashDealConfig?.productImage || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
    hoursRemaining: flashDealConfig?.hoursRemaining || 5,
  });

  const handleSaveFlashDeal = (e: React.FormEvent) => {
    e.preventDefault();
    updateFlashDealConfig(flashForm);
  };

  const handleFlashProductChange = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (p) {
      setFlashForm((prev) => ({
        ...prev,
        productId: p.id,
        productName: p.name,
        productImage: p.image,
        dealPrice: p.price,
        originalPrice: p.originalPrice || Math.round(p.price * 1.5),
      }));
    }
  };

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
          { key: 'stories', label: 'Product Stories' },
          { key: 'sections', label: 'Layout & Order' },
          { key: 'hero', label: 'Hero Banners' },
          { key: 'deals', label: 'Flash Deals Hero' },
          { key: 'categories', label: 'Categories' },
          { key: 'subcategories', label: 'Curated Collections' },
          { key: 'trending', label: 'Trending Now' },
          { key: 'bestsellers', label: 'Best Sellers' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSubTab(item.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === item.key
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUB TAB: Product Stories Manager */}
      {activeSubTab === 'stories' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-900">Instagram-Style Product Stories ({stories.length})</h2>
              <p className="text-[10px] text-gray-500">Live stories at the top of the homepage</p>
            </div>
            <button
              onClick={handleOpenAddStory}
              className="px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Story</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stories.map((story) => (
              <div
                key={story.id}
                className={`bg-white border rounded-3xl p-3.5 shadow-2xs space-y-2.5 transition-all ${
                  story.enabled ? 'border-gray-100' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Story preview circular thumbnail */}
                  <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-[#F95721] to-pink-500 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full rounded-2xl bg-white p-0.5 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.media}
                        alt={story.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-[#F95721]">
                        {story.tag}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        ₹{story.price} ({story.discount})
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-gray-900 truncate">{story.title}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{story.subtitle || story.productName}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleStory(story.id)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                      story.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {story.enabled ? 'Active' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditStory(story)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                      title="Edit story"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete story "${story.title}"?`)) deleteStory(story.id);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                      title="Delete story"
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

      {/* SUB TAB 1: Section Ordering & Toggles */}
      {activeSubTab === 'sections' && (
        <div className="space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-950 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F95721] flex-shrink-0" />
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
              className="px-3 py-1.5 bg-[#F95721] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
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
                    <span className="text-[9px] font-bold bg-orange-100 text-[#F95721] px-1.5 py-0.2 rounded">
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
                      ? 'bg-orange-50/80 border-orange-300 text-[#F95721] shadow-2xs' 
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
            <Sparkles className="w-4 h-4 text-[#F95721] flex-shrink-0" />
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
                              ? 'bg-orange-50/80 border-orange-300 text-[#F95721] shadow-2xs'
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
                              ? 'bg-[#F95721] text-white shadow-2xs'
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
            <Flame className="w-4 h-4 text-[#F95721] flex-shrink-0" />
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
              className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F95721]"
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
                        <span className="px-2 py-0.5 bg-[#F95721] text-white text-[10px] font-bold rounded-full flex items-center gap-1">
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

      {/* SUB TAB: Flash Deals & Deals of the Day */}
      {activeSubTab === 'deals' && (
        <div className="space-y-4">
          {/* Hero Slide 2 Live Flash Deal Banner Config */}
          <form onSubmit={handleSaveFlashDeal} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>Hero Slide 2: Live Flash Deals Config</span>
                </h3>
                <p className="text-[10px] text-gray-500">
                  Control the ticking countdown timer and featured flash deal product on the home hero banner
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFlashForm({ ...flashForm, enabled: !flashForm.enabled })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  flashForm.enabled ? 'bg-[#00A859] text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {flashForm.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={flashForm.badgeText}
                  onChange={(e) => setFlashForm({ ...flashForm, badgeText: e.target.value })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold text-red-600"
                  placeholder="LIVE FLASH SALE"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Discount Label</label>
                <input
                  type="text"
                  value={flashForm.discountText}
                  onChange={(e) => setFlashForm({ ...flashForm, discountText: e.target.value })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold"
                  placeholder="Up to 55% Off"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Campaign Headline Title</label>
                <input
                  type="text"
                  value={flashForm.title}
                  onChange={(e) => setFlashForm({ ...flashForm, title: e.target.value })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                  placeholder="Deals of the Day"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Countdown Reset Hours</label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={flashForm.hoursRemaining}
                  onChange={(e) => setFlashForm({ ...flashForm, hoursRemaining: parseInt(e.target.value) || 4 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                />
              </div>
            </div>

            {/* Featured Product Selection */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">Select Featured Flash Deal Product</label>
              <select
                value={flashForm.productId}
                onChange={(e) => handleFlashProductChange(e.target.value)}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] bg-white font-bold text-gray-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Deal Price (₹)</label>
                <input
                  type="number"
                  value={flashForm.dealPrice}
                  onChange={(e) => setFlashForm({ ...flashForm, dealPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-black text-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Original Cutout Price (₹)</label>
                <input
                  type="number"
                  value={flashForm.originalPrice}
                  onChange={(e) => setFlashForm({ ...flashForm, originalPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Product Showcase Image URL</label>
              <input
                type="url"
                value={flashForm.productImage}
                onChange={(e) => setFlashForm({ ...flashForm, productImage: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Flash Deal Hero Settings</span>
            </button>
          </form>
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
                  ? 'bg-orange-50 border-[#F95721] text-[#F95721]'
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
                  ? 'bg-orange-50 border-[#F95721] text-[#F95721]'
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
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description Subtitle</label>
                <input
                  type="text"
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Banner Background Image URL</label>
                <input
                  type="url"
                  required
                  value={heroForm.image}
                  onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={heroForm.ctaText}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Link Destination</label>
                  <select
                    value={heroForm.ctaDestination}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaDestination: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
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
                  className="flex-1 py-2.5 bg-[#F95721] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Story Add/Edit Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full mx-auto p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingStory ? 'Edit Product Story' : 'Create New Product Story'}
              </h3>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Story Bubble Title *</label>
                  <input
                    type="text"
                    required
                    value={storyForm.title}
                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="Mini Washer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tag / Category</label>
                  <input
                    type="text"
                    value={storyForm.tag}
                    onChange={(e) => setStoryForm({ ...storyForm, tag: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="🔥 10s Demo"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Headline / Subtitle</label>
                <input
                  type="text"
                  value={storyForm.subtitle}
                  onChange={(e) => setStoryForm({ ...storyForm, subtitle: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  placeholder="Ultrasonic Turbo Spin Washes Delicate Clothes Fast"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Linked Catalog Product</label>
                <select
                  value={storyForm.productId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const p = products.find(prod => prod.id === selId);
                    setStoryForm({
                      ...storyForm,
                      productId: selId,
                      productName: p ? p.name : storyForm.productName,
                      price: p ? p.price : storyForm.price,
                      originalPrice: p ? (p.originalPrice || p.price * 2) : storyForm.originalPrice,
                      media: p && !storyForm.media ? p.image : storyForm.media,
                    });
                  }}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] bg-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Media Image/Demo URL *</label>
                <input
                  type="url"
                  required
                  value={storyForm.media}
                  onChange={(e) => setStoryForm({ ...storyForm, media: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={storyForm.price}
                    onChange={(e) => setStoryForm({ ...storyForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-xl px-2.5 py-2 outline-none focus:border-[#F95721] font-bold text-[#F95721]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cutout (₹)</label>
                  <input
                    type="number"
                    value={storyForm.originalPrice}
                    onChange={(e) => setStoryForm({ ...storyForm, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-xl px-2.5 py-2 outline-none focus:border-[#F95721] text-gray-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={storyForm.discount}
                    onChange={(e) => setStoryForm({ ...storyForm, discount: e.target.value })}
                    className="w-full border rounded-xl px-2.5 py-2 outline-none focus:border-[#F95721]"
                    placeholder="50% OFF"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F95721] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
