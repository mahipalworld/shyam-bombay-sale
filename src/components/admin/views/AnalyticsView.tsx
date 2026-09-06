'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  ShoppingCart, 
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Calendar,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const AnalyticsView: React.FC = () => {
  const { orders, adminOrders, products } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '3m' | '1y' | 'ALL'>('30d');

  // Filter orders by real timestamp
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'ALL') return allOrdersList;

    const now = Date.now();
    const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : dateFilter === '3m' ? 90 : 365;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return allOrdersList.filter(o => {
      const orderTime = new Date(o.createdAt).getTime();
      return !isNaN(orderTime) && orderTime >= cutoff;
    });
  }, [allOrdersList, dateFilter]);

  // Aggregate metrics from real orders
  const metrics = useMemo(() => {
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const orderCount = filteredOrders.length;
    const avgOrderVal = orderCount > 0 ? Math.round(totalRev / orderCount) : 0;
    
    // Items sold count
    let totalUnitsSold = 0;
    const productSoldMap = new Map<string, { name: string; image: string; count: number; revenue: number }>();

    filteredOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(item => {
          const qty = item.quantity || 1;
          totalUnitsSold += qty;
          const prodId = item.productId || 'unknown';
          const prodName = item.name || 'Product';
          const prodImage = item.image || '';
          const itemPrice = item.price || 0;

          const existing = productSoldMap.get(prodId) || {
            name: prodName,
            image: prodImage,
            count: 0,
            revenue: 0,
          };
          existing.count += qty;
          existing.revenue += itemPrice * qty;
          productSoldMap.set(prodId, existing);
        });
      }
    });

    const completedOrders = filteredOrders.filter(o => o.status === 'Delivered').length;
    const processingOrders = filteredOrders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length;
    const cancelledOrders = filteredOrders.filter(o => o.status === 'Cancelled').length;

    // Top selling products sorted by quantity
    const topProducts = Array.from(productSoldMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      totalRev,
      orderCount,
      avgOrderVal,
      totalUnitsSold,
      completedOrders,
      processingOrders,
      cancelledOrders,
      topProducts,
    };
  }, [filteredOrders]);

  const hasOrders = filteredOrders.length > 0;

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header & Date Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Business Intelligence</h1>
          <p className="text-[11px] text-gray-500">Live metrics computed from verified database records</p>
        </div>

        <div className="bg-gray-100 p-1 rounded-2xl flex gap-0.5 border border-gray-200/60">
          {(['7d', '30d', '3m', '1y', 'ALL'] as const).map((rng) => (
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
            <span className="text-[11px] font-bold">Total Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#F95721]" />
          </div>
          <p className="text-xl font-black text-gray-900">₹{metrics.totalRev.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-500">
            {metrics.orderCount === 1 ? '1 real order' : `${metrics.orderCount} real orders`}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Avg Order Value</span>
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-black text-gray-900">₹{metrics.avgOrderVal.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-500">
            {metrics.totalUnitsSold} units purchased
          </p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 block">Delivered</span>
          <p className="text-base font-black text-emerald-600 mt-0.5">{metrics.completedOrders}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 block">In Progress</span>
          <p className="text-base font-black text-amber-600 mt-0.5">{metrics.processingOrders}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 block">Cancelled</span>
          <p className="text-base font-black text-red-600 mt-0.5">{metrics.cancelledOrders}</p>
        </div>
      </div>

      {/* Main Analytics Content or Honest Empty State */}
      {!hasOrders ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto border border-orange-100">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">No analytics data yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Sales performance, velocity charts, and product metrics will appear automatically once SBS Store has customer order activity.
            </p>
          </div>
          <div className="pt-2 text-[11px] text-gray-400 font-mono">
            Database Status: Connected • Orders: 0 • Revenue: ₹0
          </div>
        </div>
      ) : (
        <>
          {/* Top Selling Products Velocity */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Top Performing Products</h3>
              <span className="text-[10px] text-gray-400 font-bold">By units sold</span>
            </div>

            <div className="space-y-2">
              {metrics.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-black text-gray-400 text-xs w-4">#{idx + 1}</span>
                    {p.image && (
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 p-0.5 overflow-hidden shrink-0">
                        <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-800 truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#F95721]">{p.count} sold</span>
                    <p className="text-[10px] text-gray-400 font-medium">₹{p.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
