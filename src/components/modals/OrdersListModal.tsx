'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { X, ChevronRight, ShoppingBag } from 'lucide-react';
import { OrderStatus } from '@/types';

export const OrdersListModal: React.FC = () => {
  const { 
    orders, 
    orderListFilter, 
    setOrderListFilter, 
    setSelectedOrderForModal,
    setActiveTab 
  } = useStore();

  if (!orderListFilter) return null;

  const filteredOrders = orderListFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === orderListFilter);

  const tabs: (OrderStatus | 'ALL')[] = ['ALL', 'To Pay', 'Processing', 'Shipped', 'Delivered', 'Returns'];

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Orders</h2>
            <p className="text-[11px] text-gray-500">Track and manage past purchases</p>
          </div>
          <button
            onClick={() => setOrderListFilter(null)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Tab Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-3 border-b border-gray-100 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setOrderListFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                orderListFilter === tab
                  ? 'bg-[#F95721] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="p-4 space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrderForModal(order);
                }}
                className="bg-white border border-gray-100 hover:border-orange-200 rounded-2xl p-4 space-y-3 shadow-subtle cursor-pointer transition-all tap-active"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-900">{order.orderNumber}</span>
                    <p className="text-[10px] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#F95721] border border-orange-200">
                    {order.status}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3 overflow-hidden">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-11 h-11 rounded-xl bg-gray-50 border-2 border-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <p className="text-[10px] text-gray-500">{order.items.length} item(s)</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Total: <strong className="text-gray-900">₹{order.total.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-xs font-bold text-[#F95721] flex items-center gap-0.5">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-gray-800">No orders in this stage</p>
              <p className="text-xs text-gray-500">Check other stages or start a new order.</p>
              <button
                onClick={() => {
                  setOrderListFilter(null);
                  setActiveTab('home');
                }}
                className="px-4 py-2 bg-[#F95721] text-white text-xs font-bold rounded-xl"
              >
                Explore Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
