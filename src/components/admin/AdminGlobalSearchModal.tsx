'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Search, 
  X, 
  Package, 
  ShoppingBag, 
  Users, 
  Layers, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Product, Order, Category } from '@/types';
import { AdminActiveTab } from './AdminMobileNav';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: AdminActiveTab) => void;
  onOpenProductEdit?: (p: Product) => void;
  onOpenOrderDetails?: (o: Order) => void;
}

export const AdminGlobalSearchModal: React.FC<AdminGlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenProductEdit,
  onOpenOrderDetails,
}) => {
  const { products, orders, adminOrders, categories, user } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedProducts = products.filter(
      p => p.name.toLowerCase().includes(q) || 
           p.category.toLowerCase().includes(q) ||
           (p.description && p.description.toLowerCase().includes(q))
    );

    const matchedOrders = allOrdersList.filter(
      o => o.orderNumber.toLowerCase().includes(q) ||
           (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
           o.items.some(i => i.name.toLowerCase().includes(q)) ||
           (o.shippingAddress?.name && o.shippingAddress.name.toLowerCase().includes(q)) ||
           (o.shippingAddress?.phone && o.shippingAddress.phone.includes(q))
    );

    const matchedCategories = categories.filter(
      c => c.name.toLowerCase().includes(q) ||
           c.subtitle.toLowerCase().includes(q)
    );

    const customerCandidates: Array<{ id: string; name: string; email: string; phone: string }> = [
      { id: user.id, name: user.name, email: user.email, phone: user.phone }
    ];
    allOrdersList.forEach(o => {
      if (o.shippingAddress?.name && !customerCandidates.some(c => c.phone && c.phone === o.shippingAddress?.phone)) {
        customerCandidates.push({
          id: o.userId || `guest_${o.id}`,
          name: o.shippingAddress.name,
          email: '',
          phone: o.shippingAddress.phone || '',
        });
      }
    });

    const matchedCustomers = customerCandidates.filter(
      u => (u.name && u.name.toLowerCase().includes(q)) ||
           (u.email && u.email.toLowerCase().includes(q)) ||
           (u.phone && u.phone.includes(q))
    );

    return {
      products: matchedProducts,
      orders: matchedOrders,
      categories: matchedCategories,
      customers: matchedCustomers,
      totalCount: matchedProducts.length + matchedOrders.length + matchedCategories.length + matchedCustomers.length
    };
  }, [query, products, orders, adminOrders, categories, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-start p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full mx-auto p-4 space-y-3 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Search Input Header */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search products, orders, customers, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-100/90 focus:bg-white border border-transparent focus:border-[#F95721] text-xs font-semibold rounded-2xl pl-9 pr-8 py-2.5 outline-none transition-all placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:text-black flex items-center justify-center flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!query && (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-800">Quick Global Search</p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                Search across the entire SBS Store system for items, orders, or customers.
              </p>
            </div>
          )}

          {searchResults && searchResults.totalCount === 0 && (
            <div className="py-8 text-center space-y-1 text-gray-500 text-xs">
              <p className="font-bold">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-gray-400">Try searching for &quot;mop&quot;, &quot;SBS-98231&quot;, or &quot;cleaning&quot;.</p>
            </div>
          )}

          {/* Products Results */}
          {searchResults && searchResults.products.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#F95721]" />
                  Products ({searchResults.products.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateToTab('products');
                    onClose();
                  }}
                  className="text-[11px] font-bold text-[#F95721] flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {searchResults.products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onOpenProductEdit) onOpenProductEdit(p);
                      else onNavigateToTab('products');
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ResolvedImage src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-contain bg-white p-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-500">₹{p.price} • {p.stockCount} in stock</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#F95721] bg-orange-100 px-2 py-0.5 rounded-full">
                      Edit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {searchResults && searchResults.orders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                  Orders ({searchResults.orders.length})
                </span>
                <button
                  onClick={() => {
                    onNavigateToTab('orders');
                    onClose();
                  }}
                  className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {searchResults.orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      if (onOpenOrderDetails) onOpenOrderDetails(o);
                      else onNavigateToTab('orders');
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{o.orderNumber}</p>
                      <p className="text-[10px] text-gray-500">{o.items.length} items • ₹{o.total}</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Results */}
          {searchResults && searchResults.categories.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Categories ({searchResults.categories.length})
              </span>

              <div className="grid grid-cols-2 gap-2">
                {searchResults.categories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigateToTab('categories');
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 line-clamp-1">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
