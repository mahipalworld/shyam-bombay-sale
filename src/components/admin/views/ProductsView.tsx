'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
import { Product } from '@/types';

interface ProductsViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (p: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { products, categories, deleteProduct, updateProduct, showToast, storeSettings, resetCatalogToDefault } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSub = p.subcategory && p.subcategory.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchSub) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Subcategory
      if (selectedSubcategory !== 'ALL' && p.subcategory !== selectedSubcategory) {
        return false;
      }

      // Stock Status
      if (stockStatusFilter === 'IN_STOCK' && p.stockCount <= storeSettings.lowStockThreshold) return false;
      if (stockStatusFilter === 'LOW_STOCK' && (p.stockCount > storeSettings.lowStockThreshold || p.stockCount === 0)) return false;
      if (stockStatusFilter === 'OUT_OF_STOCK' && p.stockCount > 0) return false;

      // Active/Draft
      if (activeFilter === 'ACTIVE' && !p.inStock) return false;
      if (activeFilter === 'DRAFT' && p.inStock) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedSubcategory, stockStatusFilter, activeFilter, storeSettings]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from store catalog?`)) {
      deleteProduct(id);
    }
  };

  const handleToggleStock = (p: Product) => {
    updateProduct(p.id, {
      inStock: !p.inStock
    });
    showToast(`Product set to ${!p.inStock ? 'Active / In Stock' : 'Out of Stock'}`);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Action & Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Product Catalog</h1>
          <p className="text-[11px] text-gray-500">
            {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} listed (Total {products.length} in store)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset / Sync Demo Catalog */}
          <button
            onClick={() => {
              if (confirm('Reload all 36+ demo products, rich image galleries, and sub-categories?')) {
                resetCatalogToDefault();
              }
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors border border-gray-200/80"
            title="Reload all 36+ full demo products with galleries"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync 36+ Products</span>
          </button>

          {/* Add Product Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by title, keyword, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#F35C16] shadow-2xs"
        />
      </div>

      {/* Category Horizontal Scrolling Filter Chips */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedSubcategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                setSelectedSubcategory('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap capitalize transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#F35C16] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Subcategory secondary pills bar if category selected */}
        {(() => {
          const activeCategoryObj = categories.find(c => c.id === selectedCategory);
          const activeSubcategories = activeCategoryObj?.subcategories || [];

          if (activeSubcategories.length === 0) return null;

          return (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pl-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                Sub-section:
              </span>
              <button
                onClick={() => setSelectedSubcategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedSubcategory === 'ALL'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All {activeCategoryObj?.name}
              </button>
              {activeSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedSubcategory === sub.id
                      ? 'bg-[#F35C16] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Stock Status Filter Sub-Bar */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 text-[11px] font-bold">
        {[
          { key: 'ALL', label: 'All Stock' },
          { key: 'IN_STOCK', label: 'In Stock' },
          { key: 'LOW_STOCK', label: 'Low Stock' },
          { key: 'OUT_OF_STOCK', label: 'Out of Stock' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStockStatusFilter(item.key as any)}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              stockStatusFilter === item.key
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-3 shadow-2xs col-span-full">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">No products match your criteria</p>
              <p className="text-[11px] text-gray-400">Try changing your filters or add a new product.</p>
            </div>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-[#F35C16] text-white text-xs font-bold rounded-2xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.stockCount <= storeSettings.lowStockThreshold && p.stockCount > 0;
            const isOut = p.stockCount === 0 || !p.inStock;

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs hover:border-gray-200 transition-all space-y-3"
              >
                {/* Top Row: Thumbnail + Info */}
                <div className="flex items-start gap-3">
                  {/* Large Product Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 p-1.5 flex items-center justify-center flex-shrink-0 border border-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    {p.isTrending && (
                      <span className="absolute -top-1.5 -left-1.5 text-[9px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full">
                        HOT
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate">
                          {p.category}
                        </span>
                        {p.subcategory && (
                          <span className="text-[10px] font-bold text-[#F35C16] bg-orange-50 px-2 py-0.5 rounded-md truncate border border-orange-200/60 capitalize">
                            {p.subcategory}
                          </span>
                        )}
                      </div>
                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOut 
                          ? 'bg-red-100 text-red-700' 
                          : isLow 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? `Low (${p.stockCount})` : `In Stock (${p.stockCount})`}
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-gray-900 line-clamp-1">{p.name}</h3>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-[#F35C16]">₹{p.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                      <span className="text-[10px] font-bold text-green-600">
                        {p.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock Gauge & Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Stock Bar */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Stock Units:</span>
                      <span className={isLow ? 'text-amber-600' : isOut ? 'text-red-600' : 'text-gray-900'}>
                        {p.stockCount} left
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-[#00A859]'
                        }`}
                        style={{ width: `${Math.min(100, (p.stockCount / 50) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onOpenEditModal(p)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
