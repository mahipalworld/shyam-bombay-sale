'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Search, X, TrendingUp, Sparkles, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'rating';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, setSelectedProductDetail } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const popularSearches = [
    'Washing Machine',
    'Packet Sealer',
    'Trimmer',
    'Spin Mop',
    'Microfiber Cloth',
    'Frying Pan',
    'Storage Box'
  ];

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

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-start justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-b-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search smart products, essentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-900 w-full outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-bold text-[#F95721] hover:underline"
          >
            Cancel
          </button>
        </div>

        {/* Search Content */}
        <div className="p-4 space-y-4">
          {!searchTerm ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F95721]" /> Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchTerm(term)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 text-xs font-medium text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2.5">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Found <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
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

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={() => {
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
                        onClick={() => setSearchTerm(term)}
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
