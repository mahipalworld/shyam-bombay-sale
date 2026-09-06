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
  Clock,
  Calendar,
  Filter,
  ShoppingCart
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
  const { adminOrders, orders, user: currentUser } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WITH_ORDERS' | 'ACTIVE_CART' | 'WISHLIST_ACTIVE' | 'HAS_ADDRESS'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const fetchRealCustomers = async () => {
    try {
      // 1. Fetch genuine customer profiles from Supabase
      const { data: dbProfiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profError) {
        console.warn('Could not fetch profiles via RLS, using local store profiles:', profError.message);
      }

      // 2. Fetch genuine user addresses
      const { data: dbAddresses } = await supabase
        .from('user_addresses')
        .select('*');

      // 3. Fetch genuine user cart items
      const { data: dbCarts } = await supabase
        .from('cart_items')
        .select('id, user_id, quantity');

      // 4. Fetch genuine user wishlist items
      const { data: dbWishlists } = await supabase
        .from('wishlist_items')
        .select('id, user_id, product_id');

      // Build customer record map
      const profilesMap = new Map<string, any>();

      if (dbProfiles && dbProfiles.length > 0) {
        dbProfiles.forEach(p => {
          profilesMap.set(p.id, p);
        });
      }

      // If current logged-in user exists and has an ID, ensure they are in the directory
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

      // Also gather customers who may have placed orders with userId
      allOrdersList.forEach(o => {
        if (o.userId && !profilesMap.has(o.userId)) {
          profilesMap.set(o.userId, {
            id: o.userId,
            name: o.shippingAddress?.name || 'Customer',
            email: '',
            phone: o.shippingAddress?.phone || '',
            reward_points: 0,
            created_at: o.createdAt || new Date().toISOString(),
          });
        }
      });

      // Assemble enriched real customer objects
      const compiled: CustomerRecord[] = [];

      profilesMap.forEach((prof, userId) => {
        // Real orders belonging to this user
        const userOrders = allOrdersList.filter(o => 
          o.userId === userId || 
          (prof.phone && o.shippingAddress?.phone === prof.phone)
        );

        const ordersCount = userOrders.length;
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const sortedOrders = [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const recentOrder = sortedOrders[0] || null;

        // Real addresses
        const userAddrs = (dbAddresses || []).filter((a: any) => a.user_id === userId).map((a: any) => ({
          id: a.id,
          street: a.street,
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          type: a.type || 'HOME',
          isDefault: Boolean(a.is_default),
        }));

        // Real cart
        const userCartItems = (dbCarts || []).filter((c: any) => c.user_id === userId);
        const cartCount = userCartItems.reduce((sum: number, c: any) => sum + (c.quantity || 1), 0);

        // Real wishlist
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

      // Sort by creation date descending
      compiled.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomers(compiled);
    } catch (err) {
      console.error('Error fetching real customers:', err);
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
  };

  // Filtered customers based on search and active tab
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) return false;
      }

      // 2. Behavioral Filters
      if (activeFilter === 'WITH_ORDERS' && c.ordersCount === 0) return false;
      if (activeFilter === 'ACTIVE_CART' && c.cartCount === 0) return false;
      if (activeFilter === 'WISHLIST_ACTIVE' && c.wishlistCount === 0) return false;
      if (activeFilter === 'HAS_ADDRESS' && c.addressCount === 0) return false;

      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Customer Directory</h1>
          <p className="text-[11px] text-gray-500">
            {isLoading ? 'Connecting to database...' : `${customers.length} verified customer profiles in database`}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 hover:text-black rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95721]' : 'text-gray-500'}`} />
          <span>Sync DB</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, email, phone, or User ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F95721]"
        />
      </div>

      {/* Behavioral Filter Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: `All (${customers.length})` },
          { key: 'WITH_ORDERS', label: `With Orders (${customers.filter(c => c.ordersCount > 0).length})` },
          { key: 'ACTIVE_CART', label: `Active Cart (${customers.filter(c => c.cartCount > 0).length})` },
          { key: 'WISHLIST_ACTIVE', label: `Wishlist Active (${customers.filter(c => c.wishlistCount > 0).length})` },
          { key: 'HAS_ADDRESS', label: `Saved Address (${customers.filter(c => c.addressCount > 0).length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeFilter === f.key
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Customer List / Empty State */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2 shadow-2xs">
            <RefreshCw className="w-6 h-6 text-[#F95721] animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-700">Loading verified customer data from database...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2.5 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-800">
              {searchQuery.trim() || activeFilter !== 'ALL' ? 'No matching customers found' : 'No customer data yet'}
            </p>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              {searchQuery.trim() || activeFilter !== 'ALL'
                ? 'Try adjusting your search keywords or filter tab.'
                : 'Real registered customers and their shopping signals will appear here as users register on SBS Store.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const initials = cust.name ? cust.name.slice(0, 2).toUpperCase() : 'CU';

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs hover:border-gray-200 cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-gray-900">{cust.name}</h3>
                      <p className="text-[10px] text-gray-500">{cust.email}</p>
                      {cust.phone && cust.phone !== 'No phone provided' && (
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">{cust.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#F95721]">
                      ₹{cust.totalSpent.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Total Spent</p>
                  </div>
                </div>

                {/* Behavioral Signal Badges */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                  <span className="flex items-center gap-1 font-bold">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                    <span>{cust.ordersCount} Orders</span>
                  </span>

                  {cust.cartCount > 0 ? (
                    <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{cust.cartCount} in Cart</span>
                    </span>
                  ) : cust.wishlistCount > 0 ? (
                    <span className="flex items-center gap-1 font-bold text-red-500">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{cust.wishlistCount} Wishlisted</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      {cust.addressCount > 0 ? `${cust.addressCount} Saved Address` : 'New User'}
                    </span>
                  )}

                  <span className="flex items-center gap-1 font-bold text-purple-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>{cust.rewardPoints} Pts</span>
                  </span>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Profile Bottom Sheet Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F95721] text-white font-black text-sm flex items-center justify-center">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono">User ID: {selectedCustomer.id.slice(0, 12)}...</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:text-black"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] pt-1 border-t border-gray-200/60">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Registered: {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Real Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-orange-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Orders</span>
                <p className="text-sm font-black text-[#F95721] mt-0.5">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="bg-blue-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Total Spent</span>
                <p className="text-sm font-black text-blue-600 mt-0.5">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-purple-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Reward Pts</span>
                <p className="text-sm font-black text-purple-600 mt-0.5">{selectedCustomer.rewardPoints}</p>
              </div>
            </div>

            {/* Real Saved Addresses */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F95721]" />
                Saved Delivery Addresses ({selectedCustomer.savedAddresses.length})
              </span>
              {selectedCustomer.savedAddresses.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-400 italic">
                  No saved addresses in database yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selectedCustomer.savedAddresses.map((addr) => (
                    <div key={addr.id} className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{addr.type}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real Order History */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-gray-800">Order History ({selectedCustomer.ordersCount})</span>
              {selectedCustomer.ordersCount === 0 ? (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-400 italic">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                  {allOrdersList
                    .filter(o => o.userId === selectedCustomer.id || (selectedCustomer.phone && o.shippingAddress?.phone === selectedCustomer.phone))
                    .map(o => (
                      <div key={o.id} className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{o.orderNumber}</p>
                          <p className="text-[10px] text-gray-500">{o.items?.length || 0} items • ₹{o.total}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {o.status}
                        </span>
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
