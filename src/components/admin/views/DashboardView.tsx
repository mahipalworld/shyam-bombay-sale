'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown,
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
  CheckCircle2,
  RefreshCw,
  Eye,
  RotateCcw,
  ShieldAlert,
  Percent,
  Activity,
  Flame,
  Check
} from 'lucide-react';
import { AdminActiveTab } from '../AdminMobileNav';
import { Product, Order } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

interface DashboardViewProps {
  onNavigateToTab: (tab: AdminActiveTab) => void;
  onOpenAddProduct: () => void;
  onOpenOrderDetails: (o: Order) => void;
}

interface ChartDataPoint {
  label: string;
  subLabel: string;
  revenue: number;
  ordersCount: number;
  x: number;
  y: number;
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
    showToast,
    refreshOrders,
    returnRequests
  } = useStore();

  const allOrdersList = useMemo(() => {
    return adminOrders && adminOrders.length > 0 ? adminOrders : orders;
  }, [adminOrders, orders]);

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChartPoint, setActiveChartPoint] = useState<ChartDataPoint | null>(null);

  // Supabase real profiles state
  const [dbProfilesCount, setDbProfilesCount] = useState<number | null>(null);
  const [dbNewProfilesWeek, setDbNewProfilesWeek] = useState<number>(0);

  // Auto-refresh orders and fetch profiles on mount
  useEffect(() => {
    refreshOrders();
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (!error && profiles) {
        setDbProfilesCount(profiles.length);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const newCount = profiles.filter(p => {
          const t = new Date(p.created_at).getTime();
          return !isNaN(t) && t >= sevenDaysAgo;
        }).length;
        setDbNewProfilesWeek(newCount);
      }
    } catch (err) {
      console.warn('Unable to load Supabase profiles count for dashboard:', err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      await fetchCustomerStats();
      showToast('Dashboard metrics synced with live store data');
    } catch {
      showToast('Synced with local store cache', 'info');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // --- DATE RANGES & COMPARISONS ---
  const { currentOrders, previousOrders, comparisonLabel } = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    let currentStart = 0;
    let currentEnd = now;
    let prevStart = 0;
    let prevEnd = 0;
    let compLabel = '';

    if (dateRange === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      currentStart = startOfToday.getTime();
      currentEnd = now;

      const startOfYesterday = new Date(startOfToday.getTime() - oneDay);
      prevStart = startOfYesterday.getTime();
      prevEnd = startOfToday.getTime() - 1;
      compLabel = 'vs yesterday';
    } else if (dateRange === '7d') {
      currentStart = now - 7 * oneDay;
      currentEnd = now;
      prevStart = now - 14 * oneDay;
      prevEnd = currentStart;
      compLabel = 'vs previous 7 days';
    } else {
      currentStart = now - 30 * oneDay;
      currentEnd = now;
      prevStart = now - 60 * oneDay;
      prevEnd = currentStart;
      compLabel = 'vs previous 30 days';
    }

    const cur = allOrdersList.filter(o => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= currentStart && t <= currentEnd;
    });

    const prev = allOrdersList.filter(o => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= prevStart && t <= prevEnd;
    });

    return { currentOrders: cur, previousOrders: prev, comparisonLabel: compLabel };
  }, [allOrdersList, dateRange]);

  // Current & comparative revenues
  const displayRevenue = useMemo(() => {
    return currentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [currentOrders]);

  const previousRevenue = useMemo(() => {
    return previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [previousOrders]);

  const revenueGrowth = useMemo(() => {
    if (previousRevenue === 0) {
      return displayRevenue > 0 ? 100 : 0;
    }
    return Math.round(((displayRevenue - previousRevenue) / previousRevenue) * 100);
  }, [displayRevenue, previousRevenue]);

  // Total store lifetime revenue
  const lifetimeRevenue = useMemo(() => {
    return allOrdersList.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [allOrdersList]);

  // Orders metrics & dispatch rates
  const displayOrders = currentOrders.length;
  const dispatchedOrdersCount = useMemo(() => {
    return currentOrders.filter(o => o.status === 'Delivered' || o.status === 'Shipped').length;
  }, [currentOrders]);

  const dispatchRate = useMemo(() => {
    if (displayOrders === 0) return 0;
    return Math.round((dispatchedOrdersCount / displayOrders) * 100);
  }, [displayOrders, dispatchedOrdersCount]);

  const pendingOrdersCount = useMemo(() => {
    return currentOrders.filter(o => o.status === 'Processing' || o.status === 'To Pay').length;
  }, [currentOrders]);

  // Customer Analytics (Unique customer aggregation)
  const customerAnalytics = useMemo(() => {
    const customerMap = new Map<string, { id: string; ordersCount: number; firstOrderTime: number }>();
    
    allOrdersList.forEach(o => {
      const key = o.userId || (o.shippingAddress?.phone ? `ph_${o.shippingAddress.phone}` : `order_${o.id}`);
      const t = new Date(o.createdAt).getTime();
      const existing = customerMap.get(key);
      if (existing) {
        existing.ordersCount += 1;
        if (!isNaN(t) && t < existing.firstOrderTime) existing.firstOrderTime = t;
      } else {
        customerMap.set(key, {
          id: key,
          ordersCount: 1,
          firstOrderTime: isNaN(t) ? Date.now() : t,
        });
      }
    });

    const uniqueOrderCustomersCount = customerMap.size;
    const effectiveTotalCustomers = Math.max(
      dbProfilesCount ?? 0,
      uniqueOrderCustomersCount + (user?.id ? 1 : 0)
    );

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newFromOrdersWeek = Array.from(customerMap.values()).filter(c => c.firstOrderTime >= sevenDaysAgo).length;
    const effectiveNewThisWeek = Math.max(dbNewProfilesWeek, newFromOrdersWeek);

    const repeatBuyers = Array.from(customerMap.values()).filter(c => c.ordersCount > 1).length;
    const repeatRate = uniqueOrderCustomersCount > 0 
      ? Math.round((repeatBuyers / uniqueOrderCustomersCount) * 100) 
      : 0;

    return {
      total: effectiveTotalCustomers,
      newThisWeek: effectiveNewThisWeek,
      repeatBuyers,
      repeatRate,
    };
  }, [allOrdersList, dbProfilesCount, dbNewProfilesWeek, user]);

  // Catalog Health
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockCount > 0 && p.stockCount <= storeSettings.lowStockThreshold);
  }, [products, storeSettings.lowStockThreshold]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => p.stockCount === 0 || !p.inStock);
  }, [products]);

  const totalInventoryUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  }, [products]);

  // Operational Pulse Metrics
  const pendingPaymentCount = useMemo(() => {
    return allOrdersList.filter(o => o.paymentStatus === 'PENDING' || o.status === 'To Pay').length;
  }, [allOrdersList]);

  const pendingReturnsCount = useMemo(() => {
    return returnRequests.filter(r => r.status === 'Pending').length;
  }, [returnRequests]);

  const averageOrderValue = useMemo(() => {
    if (displayOrders > 0) return Math.round(displayRevenue / displayOrders);
    if (allOrdersList.length > 0) return Math.round(lifetimeRevenue / allOrdersList.length);
    return 0;
  }, [displayOrders, displayRevenue, allOrdersList.length, lifetimeRevenue]);

  // Real Top Performing Products from Genuine Order Line Items
  const topPerformingProducts = useMemo(() => {
    const salesMap = new Map<string, { unitsSold: number; totalSales: number }>();

    // Count items across all orders
    allOrdersList.forEach(o => {
      o.items?.forEach(item => {
        const pId = item.productId;
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const existing = salesMap.get(pId) || { unitsSold: 0, totalSales: 0 };
        salesMap.set(pId, {
          unitsSold: existing.unitsSold + qty,
          totalSales: existing.totalSales + (price * qty),
        });
      });
    });

    const hasAnyRealSales = salesMap.size > 0;

    // Map each catalog product with actual sales metrics
    const enriched = products.map(p => {
      const sales = salesMap.get(p.id) || { unitsSold: 0, totalSales: 0 };
      return {
        product: p,
        unitsSold: sales.unitsSold,
        totalSales: sales.totalSales,
      };
    });

    if (hasAnyRealSales) {
      enriched.sort((a, b) => b.unitsSold - a.unitsSold || b.totalSales - a.totalSales);
    } else {
      // Fallback to stock availability or catalog order
      enriched.sort((a, b) => (b.product.reviewCount || 0) - (a.product.reviewCount || 0));
    }

    return {
      items: enriched.slice(0, 4),
      hasRealSales: hasAnyRealSales,
    };
  }, [allOrdersList, products]);

  // --- DYNAMIC REVENUE TRAJECTORY CHART GENERATOR ---
  const chartData = useMemo(() => {
    const svgWidth = 500;
    const svgHeight = 130;
    const padTop = 16;
    const padBottom = 26;
    const padLeft = 20;
    const padRight = 20;

    const usableWidth = svgWidth - padLeft - padRight;
    const usableHeight = svgHeight - padTop - padBottom;

    interface Bucket {
      label: string;
      subLabel: string;
      startTime: number;
      endTime: number;
      revenue: number;
      ordersCount: number;
    }

    const now = new Date();
    const buckets: Bucket[] = [];

    if (dateRange === 'today') {
      // 6 time buckets across today: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
      const slotDuration = 4 * 60 * 60 * 1000;
      const slotLabels = ['4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'];
      const slotSubLabels = ['00:00 - 04:00', '04:00 - 08:00', '08:00 - 12:00', '12:00 - 16:00', '16:00 - 20:00', '20:00 - 24:00'];

      for (let i = 0; i < 6; i++) {
        const slotStart = startOfToday + i * slotDuration;
        const slotEnd = slotStart + slotDuration - 1;
        buckets.push({
          label: slotLabels[i],
          subLabel: slotSubLabels[i],
          startTime: slotStart,
          endTime: slotEnd,
          revenue: 0,
          ordersCount: 0,
        });
      }
    } else if (dateRange === '7d') {
      // 7 calendar days up to today
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
        const dayStart = d.getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;
        const isCurrentDay = i === 0;
        buckets.push({
          label: isCurrentDay ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`,
          subLabel: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          startTime: dayStart,
          endTime: dayEnd,
          revenue: 0,
          ordersCount: 0,
        });
      }
    } else {
      // 30 days broken into 5 intervals (6 days each)
      for (let i = 4; i >= 0; i--) {
        const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 6, 0, 0, 0, 0);
        const dEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 6, 23, 59, 59, 999);
        const label = i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${(i + 1) * 6}d ago`;
        buckets.push({
          label,
          subLabel: `${dStart.getDate()} ${dStart.toLocaleDateString('en-IN', { month: 'short' })} - ${dEnd.getDate()} ${dEnd.toLocaleDateString('en-IN', { month: 'short' })}`,
          startTime: dStart.getTime(),
          endTime: dEnd.getTime(),
          revenue: 0,
          ordersCount: 0,
        });
      }
    }

    // Populate bucket revenues from real orders
    allOrdersList.forEach(o => {
      const t = new Date(o.createdAt).getTime();
      if (isNaN(t)) return;
      const b = buckets.find(bucket => t >= bucket.startTime && t <= bucket.endTime);
      if (b) {
        b.revenue += (o.total || 0);
        b.ordersCount += 1;
      }
    });

    const maxRevenue = Math.max(...buckets.map(b => b.revenue), 1000);

    // Compute coordinate points
    const points: ChartDataPoint[] = buckets.map((b, idx) => {
      const x = padLeft + (idx / (buckets.length - 1)) * usableWidth;
      const y = (svgHeight - padBottom) - (b.revenue / maxRevenue) * usableHeight;
      return {
        label: b.label,
        subLabel: b.subLabel,
        revenue: b.revenue,
        ordersCount: b.ordersCount,
        x,
        y,
      };
    });

    // Create SVG Path string
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      // Smooth cubic bezier control points
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${cur.x} ${cur.y}`;
    }

    const baselineY = svgHeight - padBottom;
    const areaD = `${pathD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    const hasAnySalesInPeriod = buckets.some(b => b.revenue > 0);

    return {
      points,
      pathD,
      areaD,
      baselineY,
      maxRevenue,
      hasAnySalesInPeriod,
    };
  }, [allOrdersList, dateRange]);

  // Quick Restock helper
  const handleQuickRestock = (p: Product) => {
    updateProduct(p.id, {
      stockCount: (p.stockCount || 0) + 15,
      inStock: true
    });
    showToast(`Replenished +15 units for "${p.name}"`);
  };

  const periodTitle = dateRange === 'today' 
    ? "Today's Sales" 
    : dateRange === '7d' 
      ? '7-Day Revenue' 
      : '30-Day Revenue';

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* 1. Header Greeting, Live Status & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#F95721] uppercase tracking-wider">
              SBS Executive Suite
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Store
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mt-0.5">
            {greeting}, Store Admin 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time business performance from verified orders and catalog inventory.
          </p>
        </div>

        {/* Date Filter Pills & Refresh Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Sync metrics with live database"
            className="p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-all hover:text-gray-900 active:scale-95 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F95721]' : ''}`} />
          </button>

          <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200/60">
            {(['today', '7d', '30d'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => {
                  setDateRange(rng);
                  setActiveChartPoint(null);
                }}
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
      </div>

      {/* 2. Key Metrics 4-Column Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-gradient-to-br from-[#F95721] to-[#E44813] text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-1.5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-white/80">
            <span className="text-xs font-bold uppercase tracking-wider truncate">{periodTitle}</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">₹{displayRevenue.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md font-bold inline-flex items-center gap-0.5">
              {revenueGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3" />
                  +{revenueGrowth}%
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  {revenueGrowth}%
                </>
              )}
            </span>
            <span className="text-white/80 text-[11px] truncate">{comparisonLabel}</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{displayOrders}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate">
            {displayOrders > 0 ? (
              <>
                <span className={dispatchRate >= 75 ? "text-[#00A859] font-bold" : "text-amber-600 font-bold"}>
                  {dispatchRate}%
                </span>
                <span className="truncate">dispatched ({pendingOrdersCount} pending)</span>
              </>
            ) : (
              <span className="text-gray-400 text-[11px]">
                {allOrdersList.length} lifetime orders
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Active Customers (Real aggregated directory) */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">
            {customerAnalytics.total.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate">
            {customerAnalytics.newThisWeek > 0 ? (
              <>
                <span className="text-[#00A859] font-bold">+{customerAnalytics.newThisWeek}</span>
                <span>new this week</span>
              </>
            ) : (
              <span>
                {customerAnalytics.repeatBuyers > 0 
                  ? `${customerAnalytics.repeatBuyers} repeat buyers` 
                  : `${customerAnalytics.total} registered buyers`}
              </span>
            )}
          </div>
        </div>

        {/* Metric 4: Catalog Products & Real Inventory Health */}
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-1.5 hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{products.length}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium truncate">
            {lowStockProducts.length > 0 || outOfStockProducts.length > 0 ? (
              <span className="text-amber-600 font-bold truncate">
                {lowStockProducts.length} low • {outOfStockProducts.length} out of stock
              </span>
            ) : (
              <span className="text-emerald-600 font-bold truncate">
                {totalInventoryUnits.toLocaleString('en-IN')} units in stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Pulse / Quick Action KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/70 p-3.5 sm:p-4 rounded-3xl shadow-2xs">
        <div 
          onClick={() => onNavigateToTab('orders')}
          className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 cursor-pointer transition-all shadow-3xs"
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Average Order Value</p>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
            ₹{averageOrderValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-gray-400">Per customer checkout</p>
        </div>

        <div 
          onClick={() => onNavigateToTab('orders')}
          className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 cursor-pointer transition-all shadow-3xs"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Action</p>
            {pendingPaymentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className={`text-base sm:text-lg font-black mt-0.5 ${pendingPaymentCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {pendingPaymentCount} Order{pendingPaymentCount === 1 ? '' : 's'}
          </p>
          <p className="text-[10px] text-gray-400">Awaiting verification / pay</p>
        </div>

        <div 
          onClick={() => onNavigateToTab('orders')}
          className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 cursor-pointer transition-all shadow-3xs"
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Return Requests</p>
          <p className={`text-base sm:text-lg font-black mt-0.5 ${pendingReturnsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {pendingReturnsCount} Pending
          </p>
          <p className="text-[10px] text-gray-400">Customer reverse pickups</p>
        </div>

        <div 
          onClick={() => onNavigateToTab('inventory')}
          className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 cursor-pointer transition-all shadow-3xs"
        >
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock Health</p>
          <p className={`text-base sm:text-lg font-black mt-0.5 ${outOfStockProducts.length > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} Depleted` : '100% Active'}
          </p>
          <p className="text-[10px] text-gray-400">{totalInventoryUnits} total items on shelf</p>
        </div>
      </div>

      {/* 4. Low Stock Alert Warning Banner (If any) */}
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

      {/* 5. Middle Section: Revenue Trajectory & Quick Business Actions (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic Real-Data Revenue Trajectory SVG Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-gray-900">Revenue Trajectory</h3>
                {chartData.hasAnySalesInPeriod && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#F95721] border border-orange-200/50">
                    Live Velocity
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {dateRange === 'today' 
                  ? 'Hourly order sales breakdown across today' 
                  : dateRange === '7d' 
                    ? 'Daily sales trajectory for the last 7 calendar days' 
                    : 'Weekly revenue aggregation for past 30 days'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-base sm:text-lg font-extrabold text-[#F95721]">
                ₹{displayRevenue.toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-gray-400">Period Total ({displayOrders} orders)</p>
            </div>
          </div>

          {/* Active Data Point Hover Inspector */}
          {activeChartPoint && (
            <div className="bg-orange-50/80 border border-orange-200/70 px-3 py-1.5 rounded-2xl flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{activeChartPoint.label}</span>
                <span className="text-gray-500 text-[11px]">({activeChartPoint.subLabel})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[#F95721]">₹{activeChartPoint.revenue.toLocaleString('en-IN')}</span>
                <span className="text-[11px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                  {activeChartPoint.ordersCount} order{activeChartPoint.ordersCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )}

          {/* Dynamic SVG Area Chart */}
          <div className="h-36 sm:h-44 w-full pt-2 relative">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox="0 0 500 130" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="realChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F95721" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F95721" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line 
                x1="20" 
                y1="16" 
                x2="480" 
                y2="16" 
                stroke="#F3F4F6" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <line 
                x1="20" 
                y1="60" 
                x2="480" 
                y2="60" 
                stroke="#F3F4F6" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <line 
                x1="20" 
                y1={chartData.baselineY} 
                x2="480" 
                y2={chartData.baselineY} 
                stroke="#E5E7EB" 
                strokeWidth="1" 
              />

              {/* Dynamic Area Fill */}
              <path
                d={chartData.areaD}
                fill="url(#realChartGradient)"
              />

              {/* Dynamic Line Stroke */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#F95721"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {chartData.points.map((pt, idx) => {
                const isActive = activeChartPoint?.label === pt.label;
                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveChartPoint(pt)}
                    onClick={() => setActiveChartPoint(pt)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? "6.5" : pt.revenue > 0 ? "5" : "3.5"}
                      fill={isActive ? "#FFFFFF" : "#F95721"}
                      stroke={isActive ? "#F95721" : "#FFFFFF"}
                      strokeWidth={isActive ? "3" : "2"}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {!chartData.hasAnySalesInPeriod && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xs border border-gray-200 px-3.5 py-1.5 rounded-2xl shadow-xs text-center">
                  <p className="text-xs font-bold text-gray-700">No customer orders placed in this time slot</p>
                  <p className="text-[10px] text-gray-400">Baseline remains calibrated for incoming orders</p>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Bottom X-Axis Labels */}
          <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-2 border-t border-gray-100">
            {chartData.points.map((pt, idx) => (
              <span 
                key={idx} 
                onClick={() => setActiveChartPoint(pt)}
                className={`cursor-pointer hover:text-[#F95721] transition-colors ${
                  activeChartPoint?.label === pt.label ? 'text-[#F95721] font-black' : ''
                }`}
              >
                {pt.label}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900">Quick Business Actions</h3>
            <p className="text-xs text-gray-400">Fast shortcuts to essential administrative workflows</p>
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
              <span className="text-xs font-bold text-gray-900">Orders ({allOrdersList.length})</span>
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

      {/* 6. Bottom Section: Recent Orders & Genuine Top Performing Products (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders Feed */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div>
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

            <div className="space-y-2.5 mt-3">
              {allOrdersList.length === 0 ? (
                <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F95721] flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">No customer orders placed yet</p>
                  <p className="text-[11px] text-gray-400">
                    Once a customer checks out, the live dispatch queue will populate here automatically.
                  </p>
                </div>
              ) : (
                allOrdersList.slice(0, 4).map((o) => {
                  const orderDate = new Date(o.createdAt);
                  const isToday = !isNaN(orderDate.getTime()) && orderDate.toDateString() === new Date().toDateString();
                  const timeDisplay = isNaN(orderDate.getTime()) 
                    ? 'Recent' 
                    : isToday 
                      ? `Today, ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : orderDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                  return (
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
                              o.status === 'Delivered' 
                                ? 'bg-green-100 text-green-700' 
                                : o.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-orange-100 text-[#F95721]'
                            }`}>
                              {o.status}
                            </span>
                            {o.paymentMethod && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                {o.paymentMethod}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {o.shippingAddress?.name ? `${o.shippingAddress.name} • ` : ''}
                            {o.items?.map(i => i.name).join(', ') || 'Items ordered'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-extrabold text-gray-900">
                          ₹{o.total?.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {timeDisplay}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Real Top Performing Catalog Items */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-gray-900">Top Performing Items</h3>
                  {topPerformingProducts.hasRealSales ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Calculated from Sales
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Catalog Velocity
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {topPerformingProducts.hasRealSales 
                    ? 'Products with highest units ordered across store history' 
                    : 'Store catalog inventory ready for fulfillment'}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('products')}
                className="text-xs font-bold text-[#F95721] hover:underline flex items-center gap-0.5"
              >
                <span>Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {topPerformingProducts.items.map((item, idx) => {
                const p = item.product;
                const isLowStock = p.stockCount <= storeSettings.lowStockThreshold;

                return (
                  <div
                    key={p.id}
                    className="bg-gray-50/60 border border-gray-100 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-gray-400 w-4 text-center">#{idx + 1}</span>
                      <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                        <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">
                          ₹{p.price?.toLocaleString('en-IN')} • {p.stockCount} in stock
                          {item.unitsSold > 0 && (
                            <span className="text-emerald-700 font-bold ml-1">
                              • {item.unitsSold} sold (₹{item.totalSales.toLocaleString('en-IN')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isLowStock ? (
                      <button
                        onClick={() => handleQuickRestock(p)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 flex-shrink-0 shadow-xs active:scale-95"
                      >
                        <span>+15 Restock</span>
                      </button>
                    ) : item.unitsSold > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-shrink-0">
                        High Demand
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
                        Active In Stock
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
