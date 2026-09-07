'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types';
import { Search, X, Check } from 'lucide-react';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  selectedProductId?: string;
  onSelectProduct: (product: Product | null) => void;
  title?: string;
  subtitle?: string;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  selectedProductId,
  onSelectProduct,
  title = 'Select Product from Catalog',
  subtitle = 'Choose a product to connect real pricing, media, and details automatically.',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-r from-orange-50/40 to-amber-50/20">
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 leading-snug">
              {title}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search by product name, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:border-[#F95721] focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.id).length;
              const isSelected = selectedCategoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#F95721] text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-50">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto text-xl font-bold">
                🔍
              </div>
              <p className="text-xs font-bold text-gray-800">No products found</p>
              <p className="text-[11px] text-gray-500">
                Try a different search keyword or category filter
              </p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = selectedProductId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className={`pt-2 first:pt-0 pb-2 flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-orange-50/80 border border-orange-300 shadow-2xs'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <ResolvedImage
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 flex-wrap">
                        <span className="font-bold text-gray-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="line-through text-gray-400">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-semibold uppercase">
                          {p.category}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          p.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {p.inStock ? `${p.stockCount} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(p);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#F95721] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-[#F95721] hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onSelectProduct(null);
              onClose();
            }}
            className="text-gray-500 hover:text-red-600 font-bold px-3 py-1.5 rounded-xl transition-colors"
          >
            Clear Selected Product
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
