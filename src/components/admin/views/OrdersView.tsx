'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  CreditCard,
  Phone
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrdersViewProps {
  onOpenOrderDetails: (o: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onOpenOrderDetails,
}) => {
  const { orders, user } = useStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.shippingAddress.name.toLowerCase().includes(q);
      const matchPhone = o.shippingAddress.phone.toLowerCase().includes(q);
      if (!matchNum && !matchCustomer && !matchPhone) return false;
    }

    // Tabs
    if (activeTab === 'Pending' && o.status !== 'To Pay' && o.status !== 'Processing') return false;
    if (activeTab === 'Shipped' && o.status !== 'Shipped') return false;
    if (activeTab === 'Delivered' && o.status !== 'Delivered') return false;
    if (activeTab === 'Returns' && o.status !== 'Returns') return false;

    return true;
  });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Order Management</h1>
          <p className="text-[11px] text-gray-500">{filteredOrders.length} customer orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'Pending', label: 'Pending / Active' },
          { key: 'Shipped', label: 'In Transit' },
          { key: 'Delivered', label: 'Delivered' },
          { key: 'Returns', label: 'Returns' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by order # (e.g. SBS-98231), customer name, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F95721]"
        />
      </div>

      {/* Order Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-800">No orders found</p>
            <p className="text-[11px] text-gray-400">Try switching tabs or clear your search term.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';
            const isShipped = ord.status === 'Shipped';
            const isReturn = ord.status === 'Returns';

            return (
              <div
                key={ord.id}
                onClick={() => onOpenOrderDetails(ord)}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs hover:border-gray-200 cursor-pointer transition-all space-y-3"
              >
                {/* Top Row: Order Number & Status Badge */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">{ord.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDelivered 
                          ? 'bg-green-100 text-green-700' 
                          : isShipped 
                          ? 'bg-blue-100 text-blue-700' 
                          : isReturn
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-[#F95721]'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#F95721]">₹{ord.total}</span>
                    <p className="text-[10px] text-gray-500 font-medium">{ord.paymentMethod}</p>
                  </div>
                </div>

                {/* Middle: Customer & Item Summary */}
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">{ord.shippingAddress.name}</p>
                    <p className="text-[11px] text-gray-500 truncate max-w-[220px]">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''} ({ord.items.map(i => i.name).join(', ')})
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Thumbnails Strip */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-xl bg-gray-50 p-1 flex items-center justify-center border border-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
