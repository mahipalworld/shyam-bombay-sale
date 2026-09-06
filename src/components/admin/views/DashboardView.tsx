'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Calendar,
  LayoutTemplate,
  Tag,
  Boxes,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { AdminActiveTab } from '../AdminMobileNav';
import { Product, Order } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

interface DashboardViewProps {
  onNavigateToTab: (tab: AdminActiveTab) => void;
  onOpenAddProduct: () => void;
  onOpenOrderDetails: (o: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
  onOpenAddProduct,
  onOpenOrderDetails,
}) => {
  const { 
    orders, 
    adminOrders,
    products, 
    user, 
    storeSettings, 
    updateProduct,
    showToast 
  } = useStore();

  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('today');

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Metrics
  const totalRevenue = allOrdersList.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold);
  const topSellingProducts = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 4);

  // Dynamic multipliers for time ranges
  const rangeMultiplier = dateRange === 'today' ? 0.35 : dateRange === '7d' ? 0.75 : 1.0;
  const displayRevenue = Math.round(totalRevenue * rangeMultiplier);
  const displayOrders = Math.round(allOrdersList.length * rangeMultiplier);

  // Quick Restock helper
  const handleQuickRestock = (p: Product) => {
    updateProduct(p.id, {
      stockCount: p.stockCount + 15,
      inStock: true
    });
    showToast(`Replenished +15 units for "${p.name}"`);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* 1. Header Greeting & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-xs">
        <div>
          <span className="text-[11px] font-black text-[#F95721] uppercase tracking-wider">SBS Executive Suite</span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
            {greeting}, Store Admin 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Here is what is happening in your store today.</p>
        </div>

        {/* Date Filter Pills */}
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200/60 self-start sm:self-auto">
          {(['today', '7d', '30d'] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => setDateRange(rng)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all uppercase ${
                dateRange === rng
                  ? 'bg-white text-[#F95721] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics 4-Column Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-gradient-to-br from-[#F95721] to-[#E44813] text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-1.5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-white/80">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Sales</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">₹{displayRevenue.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md font-bold">+18.4%</span>
            <span>vs yesterday</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{displayOrders}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="text-[#00A859] font-bold">100%</span>
            <span>dispatch rate</span>
          </div>
        </div>

        {/* Metric 3: Active Customers */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{user ? '1,420' : '0'}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="text-[#00A859] font-bold">+12</span>
            <span>new this week</span>
          </div>
        </div>

        {/* Metric 4: Catalog Products */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{products.length}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className={lowStockProducts.length > 0 ? "text-orange-500 font-bold" : "text-emerald-600 font-bold"}>
              {lowStockProducts.length}
            </span>
            <span>low stock</span>
          </div>
        </div>
      </div>

      {/* 3. Low Stock Alert Warning Banner (If any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Running Low in Stock
              </p>
              <p className="text-xs text-amber-800">Replenish inventory to avoid missing potential customer sales</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('inventory')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs self-end sm:self-auto"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* 4. Middle Section: Revenue Chart & Quick Business Actions (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Interactive SVG Chart (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">Revenue Trajectory</h3>
              <p className="text-xs text-gray-400">Past performance and sales trends</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#F95721]">₹{displayRevenue}</span>
              <p className="text-[10px] text-gray-400">Period Total</p>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="h-36 sm:h-44 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F95721" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#F95721" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Area Fill */}
              <path
                d="M 0 100 Q 80 40 160 75 T 340 30 T 500 20 L 500 120 L 0 120 Z"
                fill="url(#chartGradient)"
              />
              {/* Line Stroke */}
              <path
                d="M 0 100 Q 80 40 160 75 T 340 30 T 500 20"
                fill="none"
                stroke="#F95721"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Data Dots */}
              <circle cx="0" cy="100" r="4" fill="#F95721" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="160" cy="75" r="4" fill="#F95721" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="340" cy="30" r="4" fill="#F95721" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="20" r="5" fill="#F95721" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-400 pt-2 border-t border-gray-100">
            <span>Monday</span>
            <span>Wednesday</span>
            <span>Friday</span>
            <span>Today</span>
          </div>
        </div>

        {/* Quick Operational Actions (Takes 1 col on lg) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900">Quick Business Actions</h3>
            <p className="text-xs text-gray-400">Shortcuts to essential workflows</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenAddProduct}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 text-[#F95721] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F95721] text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900">Add Product</span>
            </button>

            <button
              onClick={() => onNavigateToTab('orders')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 text-blue-600 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900">Orders</span>
            </button>

            <button
              onClick={() => onNavigateToTab('categories')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-purple-600 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900">Categories</span>
            </button>

            <button
              onClick={() => onNavigateToTab('homepage')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-600 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00A859] text-white flex items-center justify-center shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900">Homepage</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Recent Orders & Top Performing Products (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders Feed */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">Recent Customer Orders</h3>
              <p className="text-xs text-gray-400">Live order processing stream</p>
            </div>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-bold text-[#F95721] hover:underline flex items-center gap-0.5"
            >
              <span>View All ({allOrdersList.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {allOrdersList.slice(0, 4).map((o) => (
              <div
                key={o.id}
                onClick={() => onOpenOrderDetails(o)}
                className="bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-[#F95721] flex items-center justify-center flex-shrink-0 font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900">{o.orderNumber}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#F95721]'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {o.items.map(i => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-extrabold text-gray-900">₹{o.total}</span>
                  <p className="text-[10px] text-gray-400">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Catalog Items */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">Top Performing Items</h3>
              <p className="text-xs text-gray-400">High velocity store inventory</p>
            </div>
            <button
              onClick={() => onNavigateToTab('products')}
              className="text-xs font-bold text-[#F95721] hover:underline flex items-center gap-0.5"
            >
              <span>Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topSellingProducts.map((p, idx) => (
              <div
                key={p.id}
                className="bg-gray-50/60 border border-gray-100 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-black text-gray-400 w-4 text-center">#{idx + 1}</span>
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-500">₹{p.price} • {p.stockCount} in stock</p>
                  </div>
                </div>

                {p.stockCount <= storeSettings.lowStockThreshold ? (
                  <button
                    onClick={() => handleQuickRestock(p)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 flex-shrink-0 shadow-xs"
                  >
                    <span>+15 Restock</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
                    High Demand
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
