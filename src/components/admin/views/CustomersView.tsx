'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
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
  Sparkles
} from 'lucide-react';
import { UserProfile } from '@/types';

export const CustomersView: React.FC = () => {
  const { user, addresses, orders, wishlist } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

  // Mock a directory of customers
  const customersList: UserProfile[] = [
    user,
    {
      id: 'usr_priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91 98223 11445',
      ordersCount: 8,
      wishlistCount: 3,
      couponsCount: 2,
      rewardPoints: 180,
    },
    {
      id: 'usr_rohit',
      name: 'Rohit Verma',
      email: 'rohit.verma@outlook.com',
      phone: '+91 97112 88990',
      ordersCount: 5,
      wishlistCount: 12,
      couponsCount: 4,
      rewardPoints: 95,
    },
    {
      id: 'usr_ananya',
      name: 'Ananya Gupta',
      email: 'ananya.g@yahoo.com',
      phone: '+91 99001 22334',
      ordersCount: 14,
      wishlistCount: 5,
      couponsCount: 1,
      rewardPoints: 420,
    }
  ];

  const filteredCustomers = customersList.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Customer Directory</h1>
          <p className="text-[11px] text-gray-500">{filteredCustomers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F35C16]"
        />
      </div>

      {/* Customer Cards */}
      <div className="space-y-3">
        {filteredCustomers.map((cust) => {
          const estimatedSpend = cust.ordersCount * 850;

          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs hover:border-gray-200 cursor-pointer transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-900">{cust.name}</h3>
                    <p className="text-[10px] text-gray-400">{cust.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#F35C16]">₹{estimatedSpend.toLocaleString('en-IN')}</span>
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Lifetime Value</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                <span className="flex items-center gap-1 font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                  {cust.ordersCount} Orders
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  {cust.wishlistCount} Wishlisted
                </span>
                <span className="flex items-center gap-1 font-bold text-purple-600">
                  <Award className="w-3.5 h-3.5" />
                  {cust.rewardPoints} Pts
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Profile Bottom Sheet Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F35C16] text-white font-black text-sm flex items-center justify-center">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-gray-400">Customer ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
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
              </div>
            </div>

            {/* Lifetime Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-orange-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Orders</span>
                <p className="text-sm font-black text-[#F35C16] mt-0.5">{selectedCustomer.ordersCount}</p>
              </div>
              <div className="bg-blue-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Total Spent</span>
                <p className="text-sm font-black text-blue-600 mt-0.5">₹{(selectedCustomer.ordersCount * 850).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-purple-50/80 p-2.5 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-500">Points</span>
                <p className="text-sm font-black text-purple-600 mt-0.5">{selectedCustomer.rewardPoints}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F35C16]" />
                Primary Shipping Address
              </span>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 leading-relaxed">
                {addresses[0] ? `${addresses[0].street}, ${addresses[0].city}, ${addresses[0].state} - ${addresses[0].pincode}` : 'Jaipur, Rajasthan'}
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-gray-800">Recent Order History</span>
              <div className="space-y-1.5">
                {orders.slice(0, 2).map(o => (
                  <div key={o.id} className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{o.orderNumber}</p>
                      <p className="text-[10px] text-gray-500">{o.items.length} items • ₹{o.total}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
