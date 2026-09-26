'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  SlidersHorizontal, 
  PackageSearch, 
  Clock, 
  ArrowUpRight, 
  Tag
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'rating';

const RECENT_SEARCHES_KEY = 'sbs_recent_searches';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    products, 
    categories,
    setSelectedProductDetail,
    setSelectedCategoryFilter,
    setSelectedSubcategoryFilter,
    setActiveTab
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 8));
        }
      } catch {}
    }
  }, [isSearchOpen]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((t) => t !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const popularSearches = [
    'Washing Machine',
    'Packet Sealer',
    'Trimmer',
    'Spin Mop',
    'Microfiber Cloth',
    'Frying Pan',
    'Storage Box'
  ];

  // Trending category chips
  const trendingCategoryChips = useMemo(() => {
    return categories.slice(0, 6);
  }, [categories]);

  // Autocomplete suggestions (triggered after 2 characters typed)
  const suggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (query.length < 2) return [];

    const matches = new Set<string>();

    // 1. Matching categories
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(query)) {
        matches.add(c.name);
      }
    });

    // 2. Matching product names & subcategories
    products.forEach((p) => {
      if (p.name.toLowerCase().includes(query)) {
        matches.add(p.name);
      }
      if (p.subcategory && p.subcategory.toLowerCase().includes(query)) {
        matches.add(p.subcategory.replace(/--/g, ' & ').replace(/-/g, ' '));
      }
    });

    return Array.from(matches).slice(0, 5);
  }, [searchTerm, products, categories]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const query = searchTerm.toLowerCase().trim();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.toLowerCase().includes(query)) ||
        p.id.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );

    switch (sortBy) {
      case 'price_low':
        return [...matches].sort((a, b) => a.price - b.price);
      case 'price_high':
        return [...matches].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...matches].sort((a, b) => b.rating - a.rating);
      case 'relevance':
      default:
        return matches;
    }
  }, [products, searchTerm, sortBy]);

  const handleSelectSearchTerm = (term: string) => {
    setSearchTerm(term);
    saveRecentSearch(term);
  };

  const handleCategoryChipClick = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setSelectedSubcategoryFilter(null);
    setActiveTab('categories');
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-start justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-b-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim().length >= 2) {
                saveRecentSearch(searchTerm);
              }
            }} 
            className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-3.5 py-2.5"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search smart products, essentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-gray-900 w-full outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-black p-0.5"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-bold text-[#F95721] hover:underline flex-shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Search Content */}
        <div className="p-4 space-y-4">
          {!searchTerm ? (
            /* When Search is Focused but Empty: Show Recent Searches & Trending Category Chips */
            <div className="space-y-4">
              {/* 1. Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectSearchTerm(term)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-orange-50/70 border border-gray-200/80 hover:border-orange-200 text-xs font-semibold text-gray-700 hover:text-[#F95721] transition-all cursor-pointer shadow-2xs"
                      >
                        <span>{term}</span>
                        <button
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-gray-400 hover:text-red-500 p-0.5 -mr-1"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Trending Category Chips */}
              {trendingCategoryChips.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#F95721]" /> Trending Categories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trendingCategoryChips.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChipClick(cat.id)}
                        className="px-3 py-1.5 rounded-xl bg-orange-50/60 hover:bg-orange-100 border border-orange-200/80 text-xs font-bold text-gray-800 hover:text-[#F95721] transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{cat.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#F95721]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Popular Searches */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F95721]" /> Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSearchTerm(term)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 text-xs font-medium text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Trending Items Grid */}
              <div className="pt-1">
                <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trending Items
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {products.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={() => {
                        setSelectedProductDetail(p);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* When Query is Typed: Show Autocomplete Suggestions (>= 2 chars) + Product Results */
            <div className="space-y-3">
              {/* Autocomplete Suggestions Strip */}
              {searchTerm.trim().length >= 2 && suggestions.length > 0 && (
                <div className="bg-gray-50/90 border border-gray-200/70 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-2xs">
                  <div className="px-3.5 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1 bg-gray-100/60">
                    <Sparkles className="w-3 h-3 text-[#F95721]" /> Suggested Matches
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearchTerm(suggestion)}
                      className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-orange-50 hover:text-[#F95721] transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#F95721] flex-shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#F95721] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-500">
                  Found <span className="font-bold text-gray-900">{filteredProducts.length}</span> results for &ldquo;{searchTerm}&rdquo;
                </p>
              </div>

              {/* Sort Pills */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <button
                    onClick={() => setSortBy('relevance')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
                      sortBy === 'relevance'
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Relevance
                  </button>
                  <button
                    onClick={() => setSortBy('price_low')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
                      sortBy === 'price_low'
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => setSortBy('price_high')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
                      sortBy === 'price_high'
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
                      sortBy === 'rating'
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Top Rated
                  </button>
                </div>
              )}

              {/* Products 2-column mobile grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={() => {
                        saveRecentSearch(searchTerm);
                        setSelectedProductDetail(p);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-[#F95721] mx-auto flex items-center justify-center shadow-xs">
                    <PackageSearch className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900">No products found</p>
                    <p className="text-xs text-gray-500">
                      We couldn&apos;t find anything matching &ldquo;{searchTerm}&rdquo;
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                    {popularSearches.slice(0, 4).map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearchTerm(term)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-orange-50 text-[11px] font-semibold text-gray-700 hover:text-[#F95721] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-block mt-2 text-xs font-bold text-[#F95721] hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
