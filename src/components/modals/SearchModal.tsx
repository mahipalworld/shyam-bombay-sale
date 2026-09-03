'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, setSelectedProductDetail } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isSearchOpen) return null;

  const popularSearches = [
    'Washing Machine',
    'Packet Sealer',
    'Trimmer',
    'Spin Mop',
    'Microfiber Cloth',
    'Frying Pan',
    'Storage Box'
  ];

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            <div>
              <p className="text-xs text-gray-500 mb-3">
                Found <span className="font-bold text-gray-900">{filteredProducts.length}</span> results for &ldquo;{searchTerm}&rdquo;
              </p>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
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
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-bold text-gray-800">No products found</p>
                  <p className="text-xs text-gray-500">Try searching for &apos;washing&apos;, &apos;trimmer&apos;, or &apos;mop&apos;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
