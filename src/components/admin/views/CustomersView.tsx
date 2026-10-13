'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Award, 
  X, 
  RefreshCw, 
  Calendar, 
  Filter, 
  ShoppingCart,
  MessageCircle,
  ExternalLink,
  Crown,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Plus,
  Minus,
  Check
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  rewardPoints: number;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  recentOrderDate: string | null;
  recentOrderNumber: string | null;
  cartCount: number;
  wishlistCount: number;
  addressCount: number;
  savedAddresses: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    type: string;
    isDefault: boolean;
  }>;
}

export const CustomersView: React.FC = () => {
  const { adminOrders, orders, user: currentUser, showToast } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VIP' | 'REPEAT' | 'NEW' | 'ACTIVE_CART' | 'HAS_ADDRESS'>('ALL');
  const [sortBy, setSortBy] = useState<'SPEND_DESC' | 'ORDERS_DESC' | 'RECENT_DESC' | 'NAME_ASC'>('SPEND_DESC');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Reward points adjustment state
  const [pointsAdjustDelta, setPointsAdjustDelta] = useState('');
  const [pointsAdjustReason, setPointsAdjustReason] = useState('Store loyalty credit');
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  const fetchRealCustomers = async () => {
    try {
      // 1. Fetch customer profiles from Supabase
      const { data: dbProfiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profError) {
        console.warn('Could not fetch profiles via RLS:', profError.message);
      }

      // 2. Fetch addresses, carts, and wishlists
      const { data: dbAddresses } = await supabase.from('user_addresses').select('*');
      const { data: dbCarts } = await supabase.from('cart_items').select('id, user_id, quantity');
      const { data: dbWishlists } = await supabase.from('wishlist_items').select('id, user_id, product_id');

      const profilesMap = new Map<string, any>();

      if (dbProfiles && dbProfiles.length > 0) {
        dbProfiles.forEach(p => profilesMap.set(p.id, p));
      }

      if (currentUser && currentUser.id && !profilesMap.has(currentUser.id)) {
        profilesMap.set(currentUser.id, {
          id: currentUser.id,
          name: currentUser.name || 'Store User',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          reward_points: currentUser.rewardPoints || 0,
          created_at: new Date().toISOString(),
        });
      }

      // Aggregate customers from placed orders
      allOrdersList.forEach(o => {
        const custKey = o.userId || (o.shippingAddress?.phone ? `guest_${o.shippingAddress.phone}` : `guest_${o.id}`);
        if (!profilesMap.has(custKey)) {
          const existingByPhone = Array.from(profilesMap.values()).find(p => p.phone && o.shippingAddress?.phone && p.phone === o.shippingAddress.phone);
          if (!existingByPhone) {
            profilesMap.set(custKey, {
              id: custKey,
              name: o.shippingAddress?.name || 'Customer',
              email: '',
              phone: o.shippingAddress?.phone || '',
              reward_points: 0,
              created_at: o.createdAt || new Date().toISOString(),
            });
          }
        }
      });

      // Assemble enriched records
      const compiled: CustomerRecord[] = [];

      profilesMap.forEach((prof, userId) => {
        const userOrders = allOrdersList.filter(o => 
          (o.userId && o.userId === userId) || 
          (prof.phone && o.shippingAddress?.phone === prof.phone) ||
          (`guest_${o.id}` === userId)
        );

        const ordersCount = userOrders.length;
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const sortedOrders = [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const recentOrder = sortedOrders[0] || null;

        const userAddrs = (dbAddresses || []).filter((a: any) => a.user_id === userId).map((a: any) => ({
          id: a.id,
          street: a.street,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          type: a.type || 'HOME',
          isDefault: Boolean(a.is_default),
        }));

        const userCartItems = (dbCarts || []).filter((c: any) => c.user_id === userId);
        const cartCount = userCartItems.reduce((sum: number, c: any) => sum + (c.quantity || 1), 0);

        const userWishlistItems = (dbWishlists || []).filter((w: any) => w.user_id === userId);
        const wishlistCount = userWishlistItems.length;

        compiled.push({
          id: userId,
          name: prof.name || (prof.email ? prof.email.split('@')[0] : 'Customer'),
          email: prof.email || 'No email provided',
          phone: prof.phone || 'No phone provided',
          rewardPoints: prof.reward_points || 0,
          createdAt: prof.created_at || new Date().toISOString(),
          ordersCount,
          totalSpent,
          recentOrderDate: recentOrder?.createdAt || null,
          recentOrderNumber: recentOrder?.orderNumber || null,
          cartCount,
          wishlistCount,
          addressCount: userAddrs.length,
          savedAddresses: userAddrs,
        });
      });

      compiled.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(compiled);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealCustomers();
  }, [allOrdersList.length]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRealCustomers();
    showToast('Customer directory synced with database');
  };

  // Top CRM Analytics
  const totalCustomers = customers.length;
  const totalLtv = useMemo(() => customers.reduce((sum, c) => sum + c.totalSpent, 0), [customers]);
  const repeatBuyersCount = useMemo(() => customers.filter(c => c.ordersCount > 1).length, [customers]);
  const repeatRate = totalCustomers > 0 ? Math.round((repeatBuyersCount / totalCustomers) * 100) : 0;
  const avgSpendPerCustomer = totalCustomers > 0 ? Math.round(totalLtv / totalCustomers) : 0;

  // Filtered & Sorted Customer List
  const processedCustomers = useMemo(() => {
    const list = customers.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) return false;
      }

      // Filters
      if (activeFilter === 'VIP' && c.totalSpent < 3000) return false;
      if (activeFilter === 'REPEAT' && c.ordersCount <= 1) return false;
      if (activeFilter === 'NEW' && c.ordersCount > 0) return false;
      if (activeFilter === 'ACTIVE_CART' && c.cartCount === 0) return false;
      if (activeFilter === 'HAS_ADDRESS' && c.addressCount === 0) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'SPEND_DESC') return b.totalSpent - a.totalSpent;
      if (sortBy === 'ORDERS_DESC') return b.ordersCount - a.ordersCount;
      if (sortBy === 'RECENT_DESC') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [customers, searchQuery, activeFilter, sortBy]);

  // Direct WhatsApp Communication
  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    if (!formatted) {
      showToast('No valid phone number for WhatsApp', 'error');
      return;
    }
    const msg = `Hello *${name}*! 👋 Reaching out from *SBS Store (Shyam Bombay Sale)*. How may we assist you today?`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Adjust Customer Reward Points in Database
  const handleApplyPointsAdjustment = async () => {
    if (!selectedCustomer) return;
    const delta = parseInt(pointsAdjustDelta);
    if (isNaN(delta) || delta === 0) {
      showToast('Please enter a valid points amount', 'error');
      return;
    }

    setIsAdjustingPoints(true);
    const newTotal = Math.max(0, (selectedCustomer.rewardPoints || 0) + delta);

    try {
      await supabase
        .from('profiles')
        .update({ reward_points: newTotal })
        .eq('id', selectedCustomer.id);

      // Update local state
      setCustomers(prev =>
        prev.map(c => c.id === selectedCustomer.id ? { ...c, rewardPoints: newTotal } : c)
      );
      setSelectedCustomer(prev => prev ? { ...prev, rewardPoints: newTotal } : null);
      setPointsAdjustDelta('');
      showToast(`Adjusted ${delta > 0 ? `+${delta}` : delta} reward points for ${selectedCustomer.name}`);
    } catch {
      showToast('Unable to update points in database', 'error');
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 animate-fadeIn">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#F95721] uppercase tracking-wider">
              Customer Relationship Management
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
              {totalCustomers} Verified Profiles
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-500">
            Track customer shopping signals, lifetime value (LTV), address books, and loyalty reward balances.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-black rounded-2xl text-xs font-bold shadow-3xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95721]' : 'text-slate-500'}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* 2. Top CRM Intelligence Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Buyers</span>
            <Users className="w-4 h-4 text-[#F95721]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          <p className="text-[10px] text-slate-400">Registered store shoppers</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Spend</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{totalLtv.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">Total customer order value</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Repeat Rate</span>
            <Crown className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{repeatRate}%</p>
          <p className="text-[10px] text-slate-400">{repeatBuyersCount} buyers with 2+ orders</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average LTV</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700">₹{avgSpendPerCustomer.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">Per shopper lifetime basket</p>
        </div>
      </div>

      {/* 3. Search, Filter Chips & Sort Dropdown */}
      <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-3xl shadow-3xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3 py-2 text-xs outline-hidden focus:border-[#F95721] focus:bg-white transition-all text-slate-900 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
            >
              <option value="SPEND_DESC">Highest Spend (LTV)</option>
              <option value="ORDERS_DESC">Most Orders Placed</option>
              <option value="RECENT_DESC">Recently Registered</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { key: 'ALL', label: `All (${customers.length})` },
            { key: 'VIP', label: `VIP Buyers (> ₹3k)` },
            { key: 'REPEAT', label: `Repeat Shoppers (${repeatBuyersCount})` },
            { key: 'NEW', label: `New Guests` },
            { key: 'ACTIVE_CART', label: `Active Cart` },
            { key: 'HAS_ADDRESS', label: `Saved Addresses` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-white text-[#F95721] shadow-3xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Customer Cards Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-2 shadow-3xs">
            <RefreshCw className="w-6 h-6 text-[#F95721] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Connecting to customer directory database...</p>
          </div>
        ) : processedCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-3xs">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">No matching customer profiles found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                Try adjusting your search query or behavioral filter chip.
              </p>
            </div>
          </div>
        ) : (
          processedCustomers.map((cust) => {
            const isVip = cust.totalSpent >= 3000;
            const isRepeat = cust.ordersCount > 1;
            const initials = cust.name ? cust.name.slice(0, 2).toUpperCase() : 'CU';

            return (
              <div
                key={cust.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-3xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                {/* Left: Avatar + Customer Details + Badges */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-3xs ${
                    isVip 
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-500/20'
                      : isRepeat 
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 truncate">{cust.name}</h3>
                      {isVip && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" />
                          VIP
                        </span>
                      )}
                      {isRepeat && !isVip && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Repeat Buyer
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Joined {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </span>
                      {cust.email && cust.email !== 'No email provided' && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{cust.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics + 1-Click Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Shopping Stats */}
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-slate-900">
                      ₹{cust.totalSpent.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {cust.ordersCount} order{cust.ordersCount === 1 ? '' : 's'} • {cust.rewardPoints} pts
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Direct WhatsApp */}
                    {cust.phone && cust.phone !== 'No phone provided' && (
                      <button
                        onClick={() => openWhatsApp(cust.phone, cust.name)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200/60"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}

                    {/* Direct Phone Call */}
                    {cust.phone && cust.phone !== 'No phone provided' && (
                      <a
                        href={`tel:${cust.phone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/60"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4 text-slate-600" />
                      </a>
                    )}

                    {/* View Details Drawer */}
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE CUSTOMER CRM PROFILE DRAWER / MODAL */}
      {/* ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-200 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F95721] text-white font-black text-sm flex items-center justify-center shadow-3xs">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedCustomer.id.slice(0, 16)}...</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact & WhatsApp Bar */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedCustomer.phone}</span>
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </p>
              </div>

              {selectedCustomer.phone && selectedCustomer.phone !== 'No phone provided' && (
                <button
                  onClick={() => openWhatsApp(selectedCustomer.phone, selectedCustomer.name)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-3xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>

            {/* 3 Stats Overview */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-orange-50/80 p-2.5 rounded-2xl border border-orange-200/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Orders</span>
                <p className="text-base font-black text-[#F95721] mt-0.5">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Lifetime Spend</span>
                <p className="text-base font-black text-emerald-700 mt-0.5">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-purple-50/80 p-2.5 rounded-2xl border border-purple-200/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Reward Points</span>
                <p className="text-base font-black text-purple-700 mt-0.5">{selectedCustomer.rewardPoints}</p>
              </div>
            </div>

            {/* Reward Points Adjustment Tool */}
            <div className="p-3 bg-purple-50/60 border border-purple-200/70 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Adjust Loyalty Reward Points
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Balance: {selectedCustomer.rewardPoints}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="+50 or -20"
                  value={pointsAdjustDelta}
                  onChange={(e) => setPointsAdjustDelta(e.target.value)}
                  className="w-24 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Reason for adjustment"
                  value={pointsAdjustReason}
                  onChange={(e) => setPointsAdjustReason(e.target.value)}
                  className="flex-1 bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-hidden"
                />
                <button
                  type="button"
                  disabled={isAdjustingPoints}
                  onClick={handleApplyPointsAdjustment}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-3xs transition-all active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F95721]" />
                Saved Delivery Addresses ({selectedCustomer.savedAddresses.length})
              </span>
              {selectedCustomer.savedAddresses.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-400 italic">
                  No saved addresses in profile.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selectedCustomer.savedAddresses.map((addr) => (
                    <div key={addr.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-700">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{addr.type}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Order History Timeline */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                Customer Order History ({selectedCustomer.ordersCount})
              </span>
              {selectedCustomer.ordersCount === 0 ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-400 italic">
                  No purchase records yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                  {allOrdersList
                    .filter(o => o.userId === selectedCustomer.id || (selectedCustomer.phone && o.shippingAddress?.phone === selectedCustomer.phone))
                    .map(o => (
                      <div key={o.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">#{o.orderNumber}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {o.items?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">₹{o.total?.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
