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
  Gift,
  Zap,
  Layers,
  ShoppingBag,
  Cloud,
  Lock,
  Video,
  Film,
  Play,
  RefreshCw,
  Upload,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HeroBannerItem, TodayDealItem, HomepageSection, QuickActionItem, Product, S3MediaItem } from '@/types';
import { ProductSelectorModal } from '@/components/admin/ProductSelectorModal';
import { ResolvedImage, ResolvedVideo } from '@/components/common/ResolvedMedia';
import { uploadMediaToS3, listS3Files } from '@/lib/mediaStorage';

interface HomepageManagerViewProps {
  onOpenPreview: () => void;
}

export const HomepageManagerView: React.FC<HomepageManagerViewProps> = ({
  onOpenPreview,
}) => {
  const { 
    heroBanners, 
    setHeroBanners, 
    saveHeroBanners,
    categories, 
    homepageCategories, 
    setHomepageCategories, 
    saveHomepageCategories,
    homepageSubcategories,
    setHomepageSubcategories,
    saveHomepageSubcategories,
    quickActions,
    setQuickActions,
    saveQuickActions,
    products, 
    trendingNowProducts, 
    setTrendingNowProducts, 
    saveTrendingNowProducts,
    todayDeals, 
    setTodayDeals, 
    saveTodayDeals,
    bestSellersConfig, 
    setBestSellersConfig, 
    saveBestSellersConfig,
    homepageSections, 
    setHomepageSections,
    saveHomepageSections,
    stories,
    addStory,
    updateStory,
    deleteStory,
    toggleStory,
    flashDealConfig,
    updateFlashDealConfig,
    showToast 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'stories' | 'sections' | 'hero' | 'deals' | 'quick_actions' | 'categories' | 'subcategories' | 'trending' | 'bestsellers'>('stories');

  // Product Selector Modal State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productPickerTarget, setProductPickerTarget] = useState<'hero' | 'flash' | 'story' | 'quick_action' | null>(null);

  // Stories Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [isUploadingStoryVideo, setIsUploadingStoryVideo] = useState(false);
  const [storyVideoUploadPct, setStoryVideoUploadPct] = useState<number | null>(null);
  const [isStoryS3LibraryOpen, setIsStoryS3LibraryOpen] = useState(false);
  const [storyS3Items, setStoryS3Items] = useState<S3MediaItem[]>([]);
  const [isLoadingStoryS3Library, setIsLoadingStoryS3Library] = useState(false);
  const [storyS3Filter, setStoryS3Filter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('VIDEO');
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  const [storyForm, setStoryForm] = useState<{
    title: string;
    subtitle: string;
    tag: string;
    media: string;
    type: 'image' | 'video';
    productId: string;
    productName: string;
    price: number;
    originalPrice: number;
    discount: string;
    accentColor: string;
    bgGradient: string;
    enabled: boolean;
    order: number;
  }>({
    title: '',
    subtitle: '',
    tag: 'Trending',
    media: '',
    type: 'video',
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

  const handleUploadStoryVideoToS3 = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      showToast('Please select a valid video file (MP4, WebM, MOV)', 'error');
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      showToast('Video exceeds 250MB limit', 'error');
      return;
    }

    setIsUploadingStoryVideo(true);
    setStoryVideoUploadPct(0);

    try {
      const item = await uploadMediaToS3(file, 'videos', (pct: number) => {
        setStoryVideoUploadPct(pct);
      });

      setStoryForm((prev) => ({
        ...prev,
        media: item.key,
        type: 'video',
      }));
      showToast('Story video uploaded directly to AWS S3! 🎥☁️');
    } catch (err: any) {
      showToast(`AWS S3 upload failed: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsUploadingStoryVideo(false);
      setStoryVideoUploadPct(null);
    }
  };

  const openStoryS3Picker = async (filter: 'ALL' | 'IMAGE' | 'VIDEO' = 'VIDEO') => {
    setStoryS3Filter(filter);
    setIsStoryS3LibraryOpen(true);
    setIsLoadingStoryS3Library(true);
    try {
      const res = await listS3Files(filter === 'VIDEO' ? 'videos/' : '');
      setStoryS3Items(res.items || []);
    } catch (err) {
      setStoryS3Items([]);
    } finally {
      setIsLoadingStoryS3Library(false);
    }
  };

  const handleOpenAddStory = () => {
    setEditingStory(null);
    const p = products[0];
    setStoryForm({
      title: 'Quick Demo',
      subtitle: p ? p.name : 'Everyday Essential',
      tag: '🔥 10s Demo',
      media: '',
      type: 'video',
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
    setShowUrlFallback(false);
    setIsStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: any) => {
    setEditingStory(story);
    const isVid = story.type === 'video' || story.media?.match(/\.(mp4|webm|mov|m4v)$/i) || story.media?.includes('/videos/');
    setStoryForm({
      title: story.title,
      subtitle: story.subtitle,
      tag: story.tag,
      media: story.media,
      type: isVid ? 'video' : 'image',
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
    setShowUrlFallback(!story.media?.includes('videos/') && !story.media?.includes('products/') && story.media?.startsWith('http'));
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title.trim() || !storyForm.media.trim()) {
      showToast('Please upload an AWS S3 video or provide media for this story', 'error');
      return;
    }

    const isVid = storyForm.type === 'video' || storyForm.media.match(/\.(mp4|webm|mov|m4v)$/i) || storyForm.media.includes('/videos/');

    const payload = {
      title: storyForm.title.trim(),
      subtitle: storyForm.subtitle.trim(),
      tag: storyForm.tag.trim(),
      media: storyForm.media.trim(),
      type: (isVid ? 'video' : 'image') as 'image' | 'video',
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

  // Hero banner modal state
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroBannerItem | null>(null);
  const [heroForm, setHeroForm] = useState<{
    productId?: string;
    heading: string;
    description: string;
    image: string;
    ctaText: string;
    ctaDestination: string;
    badgeText?: string;
    discountText?: string;
    enabled: boolean;
  }>({
    productId: undefined,
    heading: '',
    description: '',
    image: '',
    ctaText: 'Shop Now',
    ctaDestination: 'cleaning',
    badgeText: '',
    discountText: '',
    enabled: true
  });

  // Quick Action modal state
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [editingQuickAction, setEditingQuickAction] = useState<QuickActionItem | null>(null);
  const [quickActionForm, setQuickActionForm] = useState<Omit<QuickActionItem, 'id'>>({
    label: '',
    subtitle: '',
    icon: '⚡',
    image: '',
    badge: '',
    actionType: 'category',
    actionValue: 'cleaning',
    enabled: true,
    order: 1
  });

  // Trending search
  const [trendingSearch, setTrendingSearch] = useState('');

  // Section Reordering & Toggles
  const handleToggleSection = (id: HomepageSection['id']) => {
    const updated = homepageSections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    saveHomepageSections(updated);
    showToast('Homepage section visibility updated');
  };

  const handleMoveSectionUp = (idx: number) => {
    if (idx <= 0) return;
    const arr = [...homepageSections];
    const temp = arr[idx];
    arr[idx] = arr[idx - 1];
    arr[idx - 1] = temp;
    saveHomepageSections(arr);
    showToast('Section order updated');
  };

  const handleMoveSectionDown = (idx: number) => {
    if (idx >= homepageSections.length - 1) return;
    const arr = [...homepageSections];
    const temp = arr[idx];
    arr[idx] = arr[idx + 1];
    arr[idx + 1] = temp;
    saveHomepageSections(arr);
    showToast('Section order updated');
  };

  // Hero Banners
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHero) {
      const updated = heroBanners.map(b => b.id === editingHero.id ? { ...b, ...heroForm } : b);
      saveHeroBanners(updated);
      showToast('Hero banner updated');
    } else {
      const newBanner: HeroBannerItem = {
        ...heroForm,
        id: `hb_${Date.now()}`
      };
      const updated = [...heroBanners, newBanner];
      saveHeroBanners(updated);
      showToast('New hero banner created');
    }
    setIsHeroModalOpen(false);
  };

  const handleDeleteHero = (id: string) => {
    if (confirm('Delete this banner?')) {
      const updated = heroBanners.filter(item => item.id !== id);
      saveHeroBanners(updated);
      showToast('Banner removed');
    }
  };

  // Quick Action Handlers
  const handleSaveQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActionForm.label.trim()) {
      showToast('Please enter a label for this Quick Action', 'error');
      return;
    }

    if (editingQuickAction) {
      const updated = quickActions.map(qa => 
        qa.id === editingQuickAction.id ? { ...qa, ...quickActionForm } : qa
      );
      saveQuickActions(updated);
      showToast('Quick action updated');
    } else {
      const newQA: QuickActionItem = {
        ...quickActionForm,
        id: `qa_${Date.now()}`
      };
      const updated = [...quickActions, newQA];
      saveQuickActions(updated);
      showToast('New quick action created');
    }
    setIsQuickActionModalOpen(false);
  };

  const handleToggleQuickAction = (id: string) => {
    const updated = quickActions.map(qa => 
      qa.id === id ? { ...qa, enabled: !qa.enabled } : qa
    );
    saveQuickActions(updated);
    showToast('Quick action visibility updated');
  };

  const handleMoveQuickActionUp = (idx: number) => {
    if (idx <= 0) return;
    const arr = [...quickActions];
    const temp = arr[idx];
    arr[idx] = arr[idx - 1];
    arr[idx - 1] = temp;
    saveQuickActions(arr);
  };

  const handleMoveQuickActionDown = (idx: number) => {
    if (idx >= quickActions.length - 1) return;
    const arr = [...quickActions];
    const temp = arr[idx];
    arr[idx] = arr[idx + 1];
    arr[idx + 1] = temp;
    saveQuickActions(arr);
  };

  const handleDeleteQuickAction = (id: string) => {
    if (confirm('Delete this quick action?')) {
      const updated = quickActions.filter(qa => qa.id !== id);
      saveQuickActions(updated);
      showToast('Quick action deleted');
    }
  };

  // Trending Selection Toggle
  const handleToggleTrendingProduct = (prodId: string) => {
    const next = trendingNowProducts.includes(prodId)
      ? trendingNowProducts.filter(id => id !== prodId)
      : [...trendingNowProducts, prodId];
    saveTrendingNowProducts(next);
    showToast('Trending Now product selection updated');
  };

  // Category Selection Toggle
  const handleToggleCategory = (catId: string) => {
    let next: string[];
    if (homepageCategories.includes(catId)) {
      if (homepageCategories.length <= 1) {
        showToast('Keep at least 1 category visible', 'error');
        return;
      }
      next = homepageCategories.filter(id => id !== catId);
    } else {
      next = [...homepageCategories, catId];
    }
    saveHomepageCategories(next);
    showToast('Homepage category visibility updated');
  };

  // Subcategory Selection Toggle for Curated Collections
  const handleToggleSubcategory = (categoryId: string, subcategoryId: string) => {
    const exists = homepageSubcategories.some(item => item.categoryId === categoryId && item.subcategoryId === subcategoryId);
    let next: { categoryId: string; subcategoryId: string }[];
    if (exists) {
      if (homepageSubcategories.length <= 1) {
        showToast('Keep at least 1 curated collection active', 'error');
        return;
      }
      next = homepageSubcategories.filter(item => !(item.categoryId === categoryId && item.subcategoryId === subcategoryId));
      showToast('Subcategory removed from homepage collections');
    } else {
      next = [...homepageSubcategories, { categoryId, subcategoryId }];
      showToast('Subcategory added to homepage collections ✨');
    }
    saveHomepageSubcategories(next);
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
          { key: 'quick_actions', label: 'Quick Actions' },
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
                  <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-[#F95721] to-pink-500 flex-shrink-0 overflow-hidden relative">
                    <div className="w-full h-full rounded-2xl bg-white p-0.5 overflow-hidden flex items-center justify-center relative">
                      {story.type === 'video' || story.media?.match(/\.(mp4|webm|mov|m4v)$/i) || story.media?.includes('/videos/') ? (
                        <>
                          <ResolvedVideo
                            src={story.media}
                            className="w-full h-full object-cover rounded-xl"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <ResolvedImage
                          src={story.media}
                          alt={story.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-[#F95721]">
                        {story.tag}
                      </span>
                      {(story.type === 'video' || story.media?.match(/\.(mp4|webm|mov|m4v)$/i) || story.media?.includes('/videos/')) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-0.5">
                          <Film className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
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

      {/* SUB TAB: Section Ordering & Toggles */}
      {activeSubTab === 'sections' && (
        <div className="space-y-3">
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-950 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F95721] flex-shrink-0" />
            <p className="text-[11px]">
              Use Up/Down controls to rearrange vertical order on the customer home screen. Changes auto-save to database.
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
                        #{idx + 1}
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

      {/* SUB TAB: Hero Banners */}
      {activeSubTab === 'hero' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-900">Hero Carousel Slides ({heroBanners.length})</h2>
              <p className="text-[10px] text-gray-500">Pick products directly from catalog without manual entry</p>
            </div>
            <button
              onClick={() => {
                setEditingHero(null);
                setHeroForm({
                  productId: undefined,
                  heading: 'Monsoon Essentials Sale',
                  description: 'Up to 50% off on all home utilities & cleaners.',
                  image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1000&auto=format&fit=crop&q=80',
                  ctaText: 'Shop Deals',
                  ctaDestination: 'cleaning',
                  badgeText: '',
                  discountText: '',
                  enabled: true
                });
                setIsHeroModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {heroBanners.map((b) => {
              const linkedProduct = b.productId ? products.find(p => p.id === b.productId) : null;
              return (
                <div
                  key={b.id}
                  className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                      <ResolvedImage 
                        src={linkedProduct ? linkedProduct.image : b.image} 
                        alt={b.heading} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {linkedProduct ? linkedProduct.name : b.heading}
                        </h4>
                        {linkedProduct && (
                          <span className="text-[9px] font-bold bg-green-50 text-green-700 px-1.5 py-0.2 rounded border border-green-200">
                            Synced
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{b.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold bg-orange-100 text-[#F95721] px-1.5 py-0.2 rounded">
                          CTA: &quot;{b.ctaText}&quot; ➔ {b.ctaDestination}
                        </span>
                        {linkedProduct && (
                          <span className="text-[9px] font-bold text-gray-600">
                            Live Price: ₹{linkedProduct.price}
                          </span>
                        )}
                      </div>
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
                          setHeroForm({ 
                            productId: b.productId,
                            heading: b.heading,
                            description: b.description,
                            image: b.image,
                            ctaText: b.ctaText,
                            ctaDestination: b.ctaDestination,
                            badgeText: b.badgeText || '',
                            discountText: b.discountText || '',
                            enabled: b.enabled !== false
                          });
                          setIsHeroModalOpen(true);
                        }}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHero(b.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

            {/* Catalog Product Selection with Modal */}
            <div className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F95721]" />
                  <span>Catalog Product Selection</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setProductPickerTarget('flash');
                    setIsProductPickerOpen(true);
                  }}
                  className="px-2.5 py-1 bg-[#F95721] hover:bg-[#E44813] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                >
                  <Search className="w-3 h-3" />
                  <span>Browse & Pick Product</span>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white border border-orange-200/80 rounded-xl p-2.5">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                  <ResolvedImage
                    src={flashForm.productImage}
                    alt={flashForm.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-gray-900 truncate">{flashForm.productName}</p>
                  <p className="text-[10px] text-gray-500">
                    Product ID: <span className="font-bold text-gray-700">{flashForm.productId}</span> • Catalog MRP: ₹{flashForm.originalPrice}
                  </p>
                </div>
              </div>
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
                <label className="block font-bold text-gray-800 mb-1">Original Cutout MRP (₹)</label>
                <input
                  type="number"
                  value={flashForm.originalPrice}
                  onChange={(e) => setFlashForm({ ...flashForm, originalPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] text-gray-400"
                />
              </div>
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

      {/* SUB TAB: Quick Actions Manager */}
      {activeSubTab === 'quick_actions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-900">Quick Actions Bar ({quickActions.length})</h2>
              <p className="text-[10px] text-gray-500">Fast action navigation shortcuts directly below the hero carousel</p>
            </div>
            <button
              onClick={() => {
                setEditingQuickAction(null);
                setQuickActionForm({
                  label: 'Flash Deals',
                  subtitle: 'Up to 60% off',
                  icon: '⚡',
                  image: '',
                  badge: 'HOT',
                  actionType: 'tab',
                  actionValue: 'offers',
                  enabled: true,
                  order: quickActions.length + 1
                });
                setIsQuickActionModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Quick Action</span>
            </button>
          </div>

          <div className="space-y-2">
            {quickActions.map((qa, idx) => (
              <div
                key={qa.id}
                className={`bg-white border rounded-3xl p-3.5 flex items-center justify-between gap-3 shadow-2xs transition-all ${
                  qa.enabled ? 'border-gray-100' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Up / Down Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveQuickActionUp(idx)}
                      className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:text-black disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === quickActions.length - 1}
                      onClick={() => handleMoveQuickActionDown(idx)}
                      className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:text-black disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon / Image preview */}
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-base">
                    {qa.image ? (
                      <ResolvedImage src={qa.image} alt={qa.label} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span>{qa.icon || '⚡'}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-900 truncate">{qa.label}</span>
                      {qa.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-50 text-red-600 border border-red-200">
                          {qa.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-1">
                      Target: <span className="font-bold text-gray-700 capitalize">{qa.actionType}</span> ➔ {qa.actionValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleQuickAction(qa.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      qa.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {qa.enabled ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingQuickAction(qa);
                      setQuickActionForm({
                        label: qa.label,
                        subtitle: qa.subtitle || '',
                        icon: qa.icon || '⚡',
                        image: qa.image || '',
                        badge: qa.badge || '',
                        actionType: qa.actionType,
                        actionValue: qa.actionValue,
                        enabled: qa.enabled,
                        order: qa.order || idx + 1
                      });
                      setIsQuickActionModalOpen(true);
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteQuickAction(qa.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB: Homepage Categories Selector */}
      {activeSubTab === 'categories' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Select which categories appear on the homepage categories widget. Exactly selected items will be rendered on customer homepage:
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
                    <ResolvedImage src={c.image} alt={c.name} className="w-full h-full object-cover rounded" />
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
              Select which <b>Curated Sub-Sections</b> appear on the customer Homepage under the <b>&quot;Curated Aisles&quot;</b> section.
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
                              <ResolvedImage
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

      {/* SUB TAB: Trending Now Selection */}
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
                        <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
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

      {/* SUB TAB: Best Sellers Mode Engine */}
      {activeSubTab === 'bestsellers' && (
        <div className="space-y-3 bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-gray-900">Best Sellers Algorithm Mode</h3>
            <p className="text-[10px] text-gray-400">Choose how best-sellers are chosen for customers</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                saveBestSellersConfig({ ...bestSellersConfig, mode: 'auto' });
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
                saveBestSellersConfig({ ...bestSellersConfig, mode: 'manual' });
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

      {/* Hero Banner Add/Edit Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full mx-auto p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Catalog Product Selection with Modal */}
            <div className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F95721]" />
                  <span>Link to Catalog Product (Auto-sync)</span>
                </span>
                {heroForm.productId && (
                  <button
                    type="button"
                    onClick={() => setHeroForm(prev => ({ ...prev, productId: undefined }))}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Clear Link
                  </button>
                )}
              </div>

              {heroForm.productId ? (
                <div className="flex items-center gap-2.5 bg-white border border-orange-200 rounded-xl p-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                    <ResolvedImage
                      src={heroForm.image}
                      alt={heroForm.heading}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {products.find(p => p.id === heroForm.productId)?.name || heroForm.heading}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      ID: {heroForm.productId} • Live Price: ₹{products.find(p => p.id === heroForm.productId)?.price || '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductPickerTarget('hero');
                      setIsProductPickerOpen(true);
                    }}
                    className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-[#F95721] rounded-lg text-[10px] font-bold"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setProductPickerTarget('hero');
                    setIsProductPickerOpen(true);
                  }}
                  className="w-full py-2 bg-white hover:bg-orange-50 border border-dashed border-orange-300 rounded-xl text-[#F95721] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Select Product from Catalog</span>
                </button>
              )}
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
                  placeholder="e.g. Everyday Essentials Sale"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description Subtitle</label>
                <input
                  type="text"
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  placeholder="e.g. Up to 40% off on premium home cleaning tools"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Background Image URL</label>
                <input
                  type="url"
                  required
                  value={heroForm.image}
                  onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  placeholder="https://..."
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
                  <label className="block font-bold text-gray-700 mb-1">Link Category</label>
                  <select
                    value={heroForm.ctaDestination}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaDestination: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] bg-white"
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

      {/* Quick Action Add/Edit Modal */}
      {isQuickActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full mx-auto p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingQuickAction ? 'Edit Quick Action' : 'Create Quick Action'}
              </h3>
              <button
                onClick={() => setIsQuickActionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Label *</label>
                  <input
                    type="text"
                    required
                    value={quickActionForm.label}
                    onChange={(e) => setQuickActionForm({ ...quickActionForm, label: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="e.g. Flash Deals"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={quickActionForm.badge || ''}
                    onChange={(e) => setQuickActionForm({ ...quickActionForm, badge: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="HOT, NEW, 50% OFF"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subtitle / Hint</label>
                <input
                  type="text"
                  value={quickActionForm.subtitle || ''}
                  onChange={(e) => setQuickActionForm({ ...quickActionForm, subtitle: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  placeholder="e.g. Up to 60% off"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Action Type</label>
                  <select
                    value={quickActionForm.actionType}
                    onChange={(e) => {
                      const type = e.target.value as QuickActionItem['actionType'];
                      setQuickActionForm({ 
                        ...quickActionForm, 
                        actionType: type,
                        actionValue: type === 'category' ? (categories[0]?.id || 'cleaning') : 
                                     type === 'product' ? (products[0]?.id || 'p1') : 
                                     type === 'tab' ? 'offers' : ''
                      });
                    }}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] bg-white"
                  >
                    <option value="category">Category Filter</option>
                    <option value="product">Specific Product</option>
                    <option value="tab">Store Tab/Feature</option>
                    <option value="url">Direct Link/Route</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Value</label>
                  {quickActionForm.actionType === 'category' ? (
                    <select
                      value={quickActionForm.actionValue}
                      onChange={(e) => setQuickActionForm({ ...quickActionForm, actionValue: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : quickActionForm.actionType === 'tab' ? (
                    <select
                      value={quickActionForm.actionValue}
                      onChange={(e) => setQuickActionForm({ ...quickActionForm, actionValue: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] bg-white"
                    >
                      <option value="offers">Offers / Deals</option>
                      <option value="orders">My Orders</option>
                      <option value="wishlist">Wishlist</option>
                      <option value="rewards">Scratch Cards & Rewards</option>
                    </select>
                  ) : quickActionForm.actionType === 'product' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProductPickerTarget('quick_action');
                        setIsProductPickerOpen(true);
                      }}
                      className="w-full py-2 bg-orange-50 border border-orange-200 rounded-xl text-[#F95721] font-bold text-xs truncate px-2 text-center"
                    >
                      {products.find(p => p.id === quickActionForm.actionValue)?.name || 'Pick Product...'}
                    </button>
                  ) : (
                    <input
                      type="text"
                      value={quickActionForm.actionValue}
                      onChange={(e) => setQuickActionForm({ ...quickActionForm, actionValue: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                      placeholder="e.g. /offers"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={quickActionForm.icon || ''}
                    onChange={(e) => setQuickActionForm({ ...quickActionForm, icon: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="⚡"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom Image URL</label>
                  <input
                    type="url"
                    value={quickActionForm.image || ''}
                    onChange={(e) => setQuickActionForm({ ...quickActionForm, image: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickActionModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F95721] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Quick Action
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

              {/* Linked Product with Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">Linked Catalog Product</label>
                  <button
                    type="button"
                    onClick={() => {
                      setProductPickerTarget('story');
                      setIsProductPickerOpen(true);
                    }}
                    className="text-[10px] font-bold text-[#F95721] hover:underline flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    <span>Browse Products</span>
                  </button>
                </div>
                <div className="p-2 bg-gray-50 border rounded-xl flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">
                      {products.find(p => p.id === storyForm.productId)?.name || storyForm.productName}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      ₹{storyForm.price} • ID: {storyForm.productId}
                    </p>
                  </div>
                </div>
              </div>

              {/* AWS S3 Video & Media Upload Section */}
              <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Cloud className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">AWS S3 Story Video</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Lock className="w-2 h-2" /> ap-south-1
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">Direct streaming upload to AWS S3 bucket</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openStoryS3Picker('VIDEO')}
                    className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-100/50 text-purple-700 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Browse S3</span>
                  </button>
                </div>

                {storyForm.media ? (
                  <div className="bg-white border border-purple-200 rounded-2xl p-2.5 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden relative flex-shrink-0 flex items-center justify-center shadow-xs">
                        {storyForm.type === 'video' || storyForm.media.match(/\.(mp4|webm|mov|m4v)$/i) || storyForm.media.includes('/videos/') ? (
                          <>
                            <ResolvedVideo
                              src={storyForm.media}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              autoPlay
                              loop
                            />
                            <div className="absolute top-1 right-1 bg-purple-600/90 text-white rounded p-0.5">
                              <Film className="w-2.5 h-2.5" />
                            </div>
                          </>
                        ) : (
                          <ResolvedImage
                            src={storyForm.media}
                            alt="Story media"
                            className="w-full h-full object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {storyForm.type === 'video' || storyForm.media.includes('videos/') ? '🎥 AWS S3 Video' : '🖼️ S3 Media'}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-700 truncate font-semibold" title={storyForm.media}>
                          {storyForm.media.split('/').pop()}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono truncate">
                          {storyForm.media}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                      <label className="flex-1 text-center py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload New Video</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          disabled={isUploadingStoryVideo}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadStoryVideoToS3(file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openStoryS3Picker('VIDEO')}
                        className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] rounded-xl transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoryForm({ ...storyForm, media: '', type: 'video' })}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        title="Remove video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group ${
                    isUploadingStoryVideo
                      ? 'border-purple-400 bg-purple-50/80 pointer-events-none'
                      : 'border-purple-300 hover:border-purple-500 bg-white/70 hover:bg-white'
                  }`}>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      disabled={isUploadingStoryVideo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadStoryVideoToS3(file);
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 flex items-center justify-center transition-transform">
                      {isUploadingStoryVideo ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {isUploadingStoryVideo ? `Uploading Video to AWS S3 (${storyVideoUploadPct ?? 0}%)...` : 'Upload Story Video to AWS S3'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        MP4, WebM, MOV up to 250MB • Private S3 Storage
                      </p>
                    </div>
                  </label>
                )}

                {/* Optional Fallback URL Toggle (retained as requested: "or reamian it same but put aws option in it") */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {showUrlFallback ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{showUrlFallback ? 'Hide direct URL input' : 'Or enter custom/external URL (optional)'}</span>
                  </button>

                  {showUrlFallback && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <input
                        type="text"
                        value={storyForm.media}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isVid = val.match(/\.(mp4|webm|mov|m4v)$/i) || val.includes('/videos/');
                          setStoryForm({ 
                            ...storyForm, 
                            media: val,
                            type: isVid ? 'video' : 'image'
                          });
                        }}
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] text-xs font-mono"
                        placeholder="s3 canonical key or https://..."
                      />
                    </div>
                  )}
                </div>
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

      {/* S3 Media Library Picker Modal for Stories */}
      {isStoryS3LibraryOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Select Media from AWS S3 Bucket</h3>
                  <p className="text-[10px] text-gray-500">Pick any video or media already stored in your S3 bucket</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStoryS3LibraryOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStoryS3Filter('VIDEO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    storyS3Filter === 'VIDEO' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Videos Only
                </button>
                <button
                  type="button"
                  onClick={() => setStoryS3Filter('IMAGE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    storyS3Filter === 'IMAGE' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Images Only
                </button>
                <button
                  type="button"
                  onClick={() => setStoryS3Filter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    storyS3Filter === 'ALL' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  All Media
                </button>
              </div>

              <button
                type="button"
                onClick={() => openStoryS3Picker(storyS3Filter)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh S3 list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStoryS3Library ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-[260px]">
              {isLoadingStoryS3Library ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                  <p className="text-xs font-bold">Scanning AWS S3 bucket objects...</p>
                </div>
              ) : storyS3Items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                  <Package className="w-8 h-8 stroke-1 text-gray-300" />
                  <p className="text-xs font-bold">No media files found in your S3 bucket yet.</p>
                  <p className="text-[10px] text-gray-400">Upload a video directly using the upload button.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {storyS3Items
                    .filter((item) => {
                      if (storyS3Filter === 'IMAGE') return item.type === 'image';
                      if (storyS3Filter === 'VIDEO') return item.type === 'video';
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.key}
                        onClick={() => {
                          setStoryForm((prev) => ({
                            ...prev,
                            media: item.key,
                            type: item.type === 'video' ? 'video' : 'image',
                          }));
                          showToast(`${item.type === 'video' ? 'Video' : 'Media'} selected from AWS S3! 🎥`);
                          setIsStoryS3LibraryOpen(false);
                        }}
                        className="group border border-gray-200 hover:border-purple-500 rounded-2xl p-2 cursor-pointer transition-all hover:shadow-md bg-white flex flex-col justify-between"
                      >
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                          {item.type === 'image' ? (
                            <ResolvedImage
                              src={item.key}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                              <ResolvedVideo
                                src={item.key}
                                className="w-full h-full object-cover opacity-70"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white drop-shadow-md" />
                              </div>
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-700 truncate mt-1.5" title={item.name}>
                          {item.name}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStoryS3LibraryOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Product Selector Modal */}
      <ProductSelectorModal
        isOpen={isProductPickerOpen}
        onClose={() => {
          setIsProductPickerOpen(false);
          setProductPickerTarget(null);
        }}
        products={products}
        categories={categories}
        onSelectProduct={(product: Product | null) => {
          if (!product) return;
          if (productPickerTarget === 'hero') {
            setHeroForm(prev => ({
              ...prev,
              productId: product.id,
              heading: product.name,
              description: product.description ? product.description.slice(0, 90) : `Exclusive deal on ${product.name}`,
              image: product.image,
              ctaDestination: product.category,
              discountText: product.discountPercentage ? `${product.discountPercentage}% OFF` : undefined,
              badgeText: 'BEST VALUE',
            }));
          } else if (productPickerTarget === 'flash') {
            setFlashForm(prev => ({
              ...prev,
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              dealPrice: product.price,
              originalPrice: product.originalPrice || Math.round(product.price * 1.5),
              discountText: product.discountPercentage ? `Up to ${product.discountPercentage}% Off` : prev.discountText,
            }));
          } else if (productPickerTarget === 'story') {
            const hasVideo = !!product.video;
            setStoryForm(prev => ({
              ...prev,
              productId: product.id,
              productName: product.name,
              price: product.price,
              originalPrice: product.originalPrice || Math.round(product.price * 1.5),
              discount: product.discountPercentage ? `${product.discountPercentage}% OFF` : '50% OFF',
              media: hasVideo ? (product.video || '') : product.image,
              type: hasVideo ? 'video' : 'image',
              subtitle: product.description ? product.description.slice(0, 80) : prev.subtitle,
            }));
          } else if (productPickerTarget === 'quick_action') {
            setQuickActionForm(prev => ({
              ...prev,
              actionType: 'product',
              actionValue: product.id,
              label: prev.label || product.name.slice(0, 16),
              subtitle: prev.subtitle || `₹${product.price}`,
              image: product.image,
            }));
          }
          setIsProductPickerOpen(false);
          setProductPickerTarget(null);
        }}
        selectedProductId={
          productPickerTarget === 'hero' ? heroForm.productId :
          productPickerTarget === 'flash' ? flashForm.productId :
          productPickerTarget === 'story' ? storyForm.productId :
          productPickerTarget === 'quick_action' ? quickActionForm.actionValue : undefined
        }
      />
    </div>
  );
};

