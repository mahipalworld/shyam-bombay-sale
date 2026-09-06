'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Boxes, 
  Plus, 
  Minus, 
  AlertTriangle, 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  X,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Product } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const InventoryView: React.FC = () => {
  const { products, updateProduct, inventoryLogs, addInventoryLog, showToast, storeSettings } = useStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    if (activeTab === 'IN_STOCK' && p.stockCount <= storeSettings.lowStockThreshold) return false;
    if (activeTab === 'LOW_STOCK' && (p.stockCount > storeSettings.lowStockThreshold || p.stockCount === 0)) return false;
    if (activeTab === 'OUT_OF_STOCK' && p.stockCount > 0) return false;
    return true;
  });

  const lowStockItems = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold);

  const handleStockChange = (p: Product, delta: number) => {
    const nextCount = Math.max(0, p.stockCount + delta);
    updateProduct(p.id, {
      stockCount: nextCount,
      inStock: nextCount > 0
    });
    addInventoryLog(
      p.id, 
      delta, 
      delta > 0 ? 'add' : 'remove', 
      `Quick ${delta > 0 ? '+' : ''}${delta} stock adjustment from inventory panel`
    );
    showToast(`Updated stock for "${p.name}" to ${nextCount}`);
  };

  const handleBatchRestockLow = () => {
    lowStockItems.forEach(p => {
      handleStockChange(p, 20);
    });
    showToast(`Batch restocked ${lowStockItems.length} low-stock products with +20 units! 🎉`);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Stock & Inventory</h1>
          <p className="text-[11px] text-gray-500">Real-time unit levels & stock adjustments</p>
        </div>

        {/* Audit Log Trigger */}
        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <History className="w-3.5 h-3.5 text-gray-600" />
          <span>Audit History</span>
        </button>
      </div>

      {/* Low Stock Callout Card */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-950">
                  {lowStockItems.length} Low-Stock Alert{lowStockItems.length > 1 ? 's' : ''}
                </h3>
                <p className="text-[10px] text-amber-700">Stock is at or below threshold ({storeSettings.lowStockThreshold} units)</p>
              </div>
            </div>
            {/* Quick Batch Replenish Addon */}
            <button
              onClick={handleBatchRestockLow}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl shadow-xs whitespace-nowrap"
            >
              +20 Restock All
            </button>
          </div>
        </div>
      )}

      {/* Stock Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 text-[11px] font-bold">
        {[
          { key: 'ALL', label: 'All Items' },
          { key: 'IN_STOCK', label: 'In Stock' },
          { key: 'LOW_STOCK', label: 'Low Stock' },
          { key: 'OUT_OF_STOCK', label: 'Out of Stock' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === t.key
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter inventory by product name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F95721]"
        />
      </div>

      {/* Inventory Product Cards */}
      <div className="space-y-2.5">
        {filteredProducts.map((p) => {
          const isLow = p.stockCount <= storeSettings.lowStockThreshold && p.stockCount > 0;
          const isOut = p.stockCount === 0;

          return (
            <div
              key={p.id}
              className="bg-white border border-gray-100 rounded-3xl p-3.5 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-gray-900 truncate">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 capitalize">{p.category} • ₹{p.price}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                      isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock Warning' : 'Healthy Stock'}
                    </span>
                  </div>
                </div>

                {/* Stock Number Badge */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-xl font-black ${
                    isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'
                  }`}>
                    {p.stockCount}
                  </span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Units Left</p>
                </div>
              </div>

              {/* Fast Stock Increment / Decrement Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    disabled={p.stockCount <= 0}
                    onClick={() => handleStockChange(p, -1)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center text-xs disabled:opacity-30"
                    title="Remove 1 unit"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(p, 1)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center text-xs"
                    title="Add 1 unit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStockChange(p, 5)}
                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] text-[11px] font-bold rounded-xl border border-orange-200/60"
                  >
                    +5 Units
                  </button>
                  <button
                    onClick={() => handleStockChange(p, 20)}
                    className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-xl shadow-xs"
                  >
                    +20 Bulk
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Audit Logs Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-3 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#F95721]" />
                <h3 className="text-sm font-black text-gray-900">Inventory Change Audit Log</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {inventoryLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No stock movements logged yet.</p>
              ) : (
                inventoryLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{log.productName}</span>
                      <span className={`font-mono font-black text-xs flex items-center gap-0.5 ${
                        log.changeQuantity > 0 ? 'text-[#00A859]' : 'text-red-600'
                      }`}>
                        {log.changeQuantity > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">{log.reason}</p>
                    <p className="text-[9px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
