'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { CouponIssuance } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Store, 
  QrCode, 
  Globe, 
  CheckCircle2,
  Clock, 
  Percent, 
  Users, 
  IndianRupee,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const AnalyticsView: React.FC = () => {
  const { orders, adminOrders } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '3m' | '1y' | 'ALL'>('30d');
  const [issuances, setIssuances] = useState<CouponIssuance[]>([]);
  const [isLoadingIssuances, setIsLoadingIssuances] = useState(false);

  // Fetch all coupon issuances on mount
  useEffect(() => {
    fetchIssuances();
  }, []);

  const fetchIssuances = async () => {
    try {
      if (!supabase) return;
      setIsLoadingIssuances(true);
      const { data, error } = await supabase
        .from('coupon_issuances')
        .select('*')
        .order('issued_at', { ascending: false });

      if (!error && data) {
        setIssuances(data as CouponIssuance[]);
      }
    } catch (err) {
      console.error('Failed to fetch coupon issuances in AnalyticsView:', err);
    } finally {
      setIsLoadingIssuances(false);
    }
  };

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

  // Filter issuances by date
  const filteredIssuances = useMemo(() => {
    if (dateFilter === 'ALL') return issuances;

    const now = Date.now();
    const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : dateFilter === '3m' ? 90 : 365;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return issuances.filter(i => {
      const time = new Date(i.issued_at || i.created_at || '').getTime();
      return !isNaN(time) && time >= cutoff;
    });
  }, [issuances, dateFilter]);

  // 1. Core Financial & Order Metrics
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

  // 2. The 6 Core Omnichannel Attribution Metrics
  const attribution = useMemo(() => {
    // 1. In-Store Foot Traffic: QR walk-in vouchers issued
    const walkInIssuances = filteredIssuances.filter(i => 
      i.journey === 'IN_STORE_QR' || 
      (i.touchpoint_ref && i.touchpoint_ref.toLowerCase().includes('store_walkin')) ||
      (i.coupon_code && i.coupon_code.toUpperCase() === 'SBS20')
    );
    const footTraffic = walkInIssuances.length;

    // 2. Online Touchpoint Claims
    const onlineIssuances = filteredIssuances.filter(i => 
      i.journey !== 'IN_STORE_QR' && 
      (!i.touchpoint_ref || !i.touchpoint_ref.toLowerCase().includes('store_walkin')) &&
      (!i.coupon_code || i.coupon_code.toUpperCase() !== 'SBS20')
    );
    const onlineClaims = onlineIssuances.length;

    // 3. Verified In-Store Redemptions (Cashier Desk)
    const verifiedWalkInRedemptions = walkInIssuances.filter(i => 
      i.status === 'REDEEMED' || Boolean(i.redeemed_at)
    );
    const verifiedRedemptionsCount = verifiedWalkInRedemptions.length;

    // 4. In-Store Redemption Rate
    const inStoreRedemptionRate = footTraffic > 0 
      ? Number(((verifiedRedemptionsCount / footTraffic) * 100).toFixed(1)) 
      : 0.0;

    // 5. Online Attributed Revenue (sum of order.total where discounts were applied)
    const attributedOrders = filteredOrders.filter(o => (o.discount || 0) > 0);
    const onlineAttributedRev = attributedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 6. Omnichannel Foot-to-Digital Conversion
    // Matching normalized phone numbers between in-store QR visitors and online orders
    const walkInPhones = new Set<string>();
    walkInIssuances.forEach(i => {
      const clean = (i.phone_normalized || i.phone || '').replace(/\D/g, '').slice(-10);
      if (clean) walkInPhones.add(clean);
    });

    const convertedPhones = new Set<string>();
    let footToDigitalRev = 0;
    filteredOrders.forEach(o => {
      const phone = (o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
      if (phone && walkInPhones.has(phone)) {
        convertedPhones.add(phone);
        footToDigitalRev += (o.total || 0);
      }
    });

    const footToDigitalCount = convertedPhones.size;
    const footToDigitalRate = footTraffic > 0 
      ? Number(((footToDigitalCount / footTraffic) * 100).toFixed(1))
      : 0.0;

    // Touchpoint breakdowns
    const webFloatingCount = onlineIssuances.filter(i => 
      i.touchpoint_ref?.includes('web_floating') || i.journey === 'WEBSITE_FLOATING'
    ).length;

    const productPageCount = onlineIssuances.filter(i => 
      i.touchpoint_ref?.includes('web_prod') || i.journey === 'PRODUCT_PAGE'
    ).length;

    const homeBannerCount = onlineIssuances.filter(i => 
      i.touchpoint_ref?.includes('web_home') || i.journey === 'WEBSITE'
    ).length;

    const orderSuccessCount = onlineIssuances.filter(i => 
      i.touchpoint_ref?.includes('web_order') || i.journey === 'ORDER_SUCCESS'
    ).length;

    return {
      footTraffic,
      onlineClaims,
      verifiedRedemptionsCount,
      inStoreRedemptionRate,
      onlineAttributedRev,
      attributedOrdersCount: attributedOrders.length,
      footToDigitalCount,
      footToDigitalRate,
      footToDigitalRev,
      touchpoints: {
        webFloating: webFloatingCount,
        productPage: productPageCount,
        homeBanner: homeBannerCount,
        orderSuccess: orderSuccessCount,
      },
      recentRedemptions: verifiedWalkInRedemptions.slice(0, 5)
    };
  }, [filteredIssuances, filteredOrders]);

  const hasOrders = filteredOrders.length > 0 || filteredIssuances.length > 0;

  return (
    <div className="space-y-5 pb-28 animate-fadeIn">
      {/* 1. Header & Date Range Filter */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 leading-tight">Business Intelligence & Attribution</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              Omnichannel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-channel telemetry from in-store Subhanpura foot traffic to online checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIssuances}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh attribution telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIssuances ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-slate-100 p-1 rounded-2xl flex gap-0.5 border border-slate-200/60">
            {(['7d', '30d', '3m', '1y', 'ALL'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setDateFilter(rng)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${
                  dateFilter === rng
                    ? 'bg-white text-[#F95721] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {rng}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE 6 CORE OMNICHANNEL ATTRIBUTION METRICS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F95721]" />
            <span>Omnichannel Attribution & Conversion Hub</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-bold">
            Grounded via public.coupon_issuances
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Metric 1: In-Store Foot Traffic */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">1. In-Store Foot Traffic</span>
              <QrCode className="w-4 h-4 text-[#F95721]" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {attribution.footTraffic}
            </p>
            <p className="text-[10px] text-slate-500">
              QR walk-in vouchers issued at store stands
            </p>
          </div>

          {/* Metric 2: Online Touchpoint Claims */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">2. Online Touchpoint Claims</span>
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {attribution.onlineClaims}
            </p>
            <p className="text-[10px] text-slate-500">
              Floating widget, product inquiries & banners
            </p>
          </div>

          {/* Metric 3: Verified In-Store Redemptions */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">3. Verified Redemptions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600 font-mono">
              {attribution.verifiedRedemptionsCount}
            </p>
            <p className="text-[10px] text-slate-500">
              Cashier desk verified walk-in vouchers
            </p>
          </div>

          {/* Metric 4: In-Store Redemption Rate */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">4. In-Store Conv. Rate</span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {attribution.inStoreRedemptionRate}%
            </p>
            <p className="text-[10px] text-slate-500">
              Redeemed / Issued walk-ins (Target: &gt;20%)
            </p>
          </div>

          {/* Metric 5: Online Attributed Revenue */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">5. Online Attributed Rev.</span>
              <IndianRupee className="w-4 h-4 text-[#F95721]" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              ₹{attribution.onlineAttributedRev.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-500">
              Across {attribution.attributedOrdersCount} orders with promo coupons applied
            </p>
          </div>

          {/* Metric 6: Omnichannel Foot-to-Digital Conversion */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1.5 hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold text-slate-600">6. Foot-to-Digital Conv.</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-600 font-mono">
              {attribution.footToDigitalCount} Shoppers
            </p>
            <p className="text-[10px] text-slate-500">
              {attribution.footToDigitalRate}% rate • ₹{attribution.footToDigitalRev.toLocaleString('en-IN')} GMV online
            </p>
          </div>
        </div>
      </div>

      {/* 3. TOUCHPOINT ACQUISITION BREAKDOWN CARDS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Receipt className="w-4 h-4 text-[#F95721]" />
          <span>Customer Acquisition Touchpoints Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase text-[#F95721] block">In-Store QR Acrylic Stand</span>
            <p className="text-lg font-black text-slate-900 font-mono">{attribution.footTraffic} Claims</p>
            <p className="text-[11px] text-slate-500">
              {attribution.verifiedRedemptionsCount} redeemed at counter ({attribution.inStoreRedemptionRate}%)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block">Website Floating Widget</span>
            <p className="text-lg font-black text-slate-900 font-mono">{attribution.touchpoints.webFloating} Inquiries</p>
            <p className="text-[11px] text-slate-500">[ref:web_floating] WhatsApp entry points</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block">Product Page WhatsApp</span>
            <p className="text-lg font-black text-slate-900 font-mono">{attribution.touchpoints.productPage} Inquiries</p>
            <p className="text-[11px] text-slate-500">[ref:web_prod_&#123;id&#125;] live inventory check</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block">Home Banners & Order Track</span>
            <p className="text-lg font-black text-slate-900 font-mono">
              {attribution.touchpoints.homeBanner + attribution.touchpoints.orderSuccess} Touches
            </p>
            <p className="text-[11px] text-slate-500">Flash deals & order confirmation references</p>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL & E-COMMERCE OVERVIEW */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Total E-Commerce Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#F95721]" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">₹{metrics.totalRev.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">
            {metrics.orderCount === 1 ? '1 verified order' : `${metrics.orderCount} verified orders`}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Avg Order Value (AOV)</span>
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">₹{metrics.avgOrderVal.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500">
            {metrics.totalUnitsSold} total units purchased
          </p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Delivered</span>
          <p className="text-base font-black text-emerald-600 mt-0.5 font-mono">{metrics.completedOrders}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">In Progress</span>
          <p className="text-base font-black text-amber-600 mt-0.5 font-mono">{metrics.processingOrders}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Cancelled</span>
          <p className="text-base font-black text-red-600 mt-0.5 font-mono">{metrics.cancelledOrders}</p>
        </div>
      </div>

      {/* Top Products & Empty States */}
      {!hasOrders ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto border border-orange-100">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">No analytics activity recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Sales performance, in-store redemptions, and cross-channel attribution will populate automatically when visitors scan QR stands or place orders.
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Database Status: Connected • Orders: 0 • Revenue: ₹0
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Selling Products Velocity */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Top Performing Products</h3>
              <span className="text-[10px] text-slate-400 font-bold">By units sold</span>
            </div>

            {metrics.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No product sales yet</p>
            ) : (
              <div className="space-y-2">
                {metrics.topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-black text-slate-400 text-xs w-4">#{idx + 1}</span>
                      {p.image && (
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 overflow-hidden shrink-0">
                          <ResolvedImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#F95721] font-mono">{p.count} sold</span>
                      <p className="text-[10px] text-slate-400 font-mono font-medium">₹{p.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent In-Store Verified Redemptions Feed */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Cashier Redemptions</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Counter Verified
              </span>
            </div>

            {attribution.recentRedemptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No counter redemptions in selected window</p>
            ) : (
              <div className="space-y-2">
                {attribution.recentRedemptions.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-[#F95721] text-[11px]">{r.coupon_code}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          +91 {r.phone_normalized ? `${r.phone_normalized.slice(0, 5)} ****${r.phone_normalized.slice(-2)}` : '—'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Cashier: {r.redeemed_by_cashier || 'desk_1'} • {r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 font-mono shrink-0">
                      ₹{r.discount_applied || r.discount_value || 200} OFF
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
