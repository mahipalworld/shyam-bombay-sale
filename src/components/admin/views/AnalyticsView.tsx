'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Eye, 
  ShoppingCart, 
  ArrowUpRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const AnalyticsView: React.FC = () => {
  const { orders, adminOrders, products } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '3m' | '1y'>('30d');

  const totalRev = allOrdersList.reduce((sum, o) => sum + o.total, 0);
  const avgOrderVal = allOrdersList.length > 0 ? Math.round(totalRev / allOrdersList.length) : 0;

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header & Date Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Business Intelligence</h1>
          <p className="text-[11px] text-gray-500">Sales, catalog velocity & retention metrics</p>
        </div>

        <div className="bg-gray-100 p-1 rounded-2xl flex gap-0.5 border border-gray-200/60">
          {(['7d', '30d', '3m', '1y'] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => setDateFilter(rng)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all ${
                dateFilter === rng
                  ? 'bg-white text-[#F95721] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#F95721]" />
          </div>
          <p className="text-xl font-black text-gray-900">₹{(totalRev * 1.8).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#00A859] font-bold">+24.8% growth</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Avg Order Value</span>
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-black text-gray-900">₹{avgOrderVal || 850}</p>
          <p className="text-[10px] text-blue-600 font-bold">+₹120 vs last month</p>
        </div>
      </div>

      {/* Sales Trend Bar Chart */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900">Revenue Growth Trend</h3>
            <p className="text-[10px] text-gray-400">Monthly breakdown</p>
          </div>
          <span className="text-xs font-extrabold text-[#F95721]">+32% overall</span>
        </div>

        {/* CSS Bar Chart */}
        <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
          {[
            { label: 'Week 1', val: 40, amt: '₹14K' },
            { label: 'Week 2', val: 65, amt: '₹22K' },
            { label: 'Week 3', val: 50, amt: '₹18K' },
            { label: 'Week 4', val: 90, amt: '₹34K' },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[9px] font-extrabold text-gray-700">{bar.amt}</span>
              <div className="w-full max-w-[36px] bg-orange-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                <div 
                  className="bg-gradient-to-t from-[#F95721] to-[#FF8C5A] w-full rounded-t-xl transition-all duration-500"
                  style={{ height: `${bar.val}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Retention Ratios */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-gray-900">Customer Composition</h3>
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between font-bold text-[11px] mb-1">
              <span className="text-gray-700">Returning Customers (68%)</span>
              <span className="text-[#F95721]">High Loyalty</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#F95721] h-full w-[68%] rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-[11px] mb-1">
              <span className="text-gray-700">New Customer Acquisition (32%)</span>
              <span className="text-blue-600">+140 this month</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[32%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Performance Velocity */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-gray-900">Most Added to Cart</h3>
        <div className="space-y-2">
          {products.slice(0, 3).map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-black text-gray-400 text-xs w-4">#{idx + 1}</span>
                <ResolvedImage src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-contain bg-white p-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-500">₹{p.price}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-emerald-600">{(idx + 1) * 85 + 40} adds</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
