'use client';

import React, { useState, useEffect } from 'react';
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
  Phone,
  ShieldCheck,
  Check,
  X,
  MessageCircle,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrdersViewProps {
  onOpenOrderDetails: (o: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onOpenOrderDetails,
}) => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, refreshOrders } = useStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

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
    if (activeTab === 'Needs Verification' && o.paymentStatus !== 'CUSTOMER_CONFIRMED') return false;
    if (activeTab === 'Shipped' && o.status !== 'Shipped') return false;
    if (activeTab === 'Delivered' && o.status !== 'Delivered') return false;
    if (activeTab === 'Returns' && o.status !== 'Returns') return false;

    return true;
  });

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Order Management</h1>
          <p className="text-[11px] text-gray-500">{filteredOrders.length} customer orders</p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 hover:text-black rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95721]' : 'text-gray-500'}`} />
          <span>Sync Cloud</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'Needs Verification', label: '⚡ Verify UPI' },
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
          placeholder="Search by order # (e.g. SBS-1024), customer name, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#F95721]"
        />
      </div>

      {/* Order Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2 shadow-2xs col-span-full">
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
            const isCancelled = ord.status === 'Cancelled';
            const isUPI = ord.paymentMethod.includes('UPI');

            return (
              <div
                key={ord.id}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs hover:border-gray-200 transition-all space-y-3"
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
                          : isReturn || isCancelled
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
                    <span className="text-sm font-black text-[#F95721]">₹{ord.total.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-gray-500 font-medium">{ord.paymentMethod}</p>
                  </div>
                </div>

                {/* Customer & Item Summary */}
                <div 
                  onClick={() => onOpenOrderDetails(ord)}
                  className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">{ord.shippingAddress.name} <span className="text-gray-400 font-normal">({ord.shippingAddress.phone})</span></p>
                    <p className="text-[11px] text-gray-500 truncate max-w-[220px]">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''} ({ord.items.map(i => i.name).join(', ')})
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                {/* UPI Verification Box (Rule 6 Admin verification controls) */}
                {isUPI && (
                  <div className={`rounded-2xl p-3 text-xs space-y-2 border ${
                    ord.paymentStatus === 'CUSTOMER_CONFIRMED'
                      ? 'bg-amber-50/80 border-amber-200'
                      : ord.paymentStatus === 'PAYMENT_VERIFIED'
                      ? 'bg-emerald-50/80 border-emerald-200'
                      : ord.paymentStatus === 'PAYMENT_FAILED'
                      ? 'bg-red-50/80 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-gray-900">
                        <Smartphone className="w-3.5 h-3.5 text-[#F95721]" />
                        <span>Payment: </span>
                        <span className={`font-black ${
                          ord.paymentStatus === 'PAYMENT_VERIFIED' ? 'text-emerald-700' :
                          ord.paymentStatus === 'CUSTOMER_CONFIRMED' ? 'text-amber-800' :
                          ord.paymentStatus === 'PAYMENT_FAILED' ? 'text-red-700' :
                          'text-gray-700'
                        }`}>
                          {ord.paymentStatus === 'PAYMENT_VERIFIED' && 'Verified ✓'}
                          {ord.paymentStatus === 'CUSTOMER_CONFIRMED' && 'Pending Verification'}
                          {ord.paymentStatus === 'PAYMENT_FAILED' && 'Payment Failed ✕'}
                          {(!ord.paymentStatus || ord.paymentStatus === 'PENDING') && 'Pending Transfer'}
                        </span>
                      </div>
                      <span className="font-black text-gray-900">₹{ord.total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-[10px] text-gray-600 space-y-0.5">
                      {ord.paymentConfirmedAt && (
                        <p>Customer confirmed: <b>{formatTime(ord.paymentConfirmedAt)}</b></p>
                      )}
                      {ord.whatsappConfirmedAt && (
                        <p>WhatsApp confirmation: <b>{formatTime(ord.whatsappConfirmedAt)}</b></p>
                      )}
                    </div>

                    {/* Admin Verification Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateOrderPaymentStatus(ord.id, 'PAYMENT_VERIFIED')}
                        className={`flex-1 py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all ${
                          ord.paymentStatus === 'PAYMENT_VERIFIED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{ord.paymentStatus === 'PAYMENT_VERIFIED' ? 'Verified' : 'Verify Payment'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateOrderPaymentStatus(ord.id, 'PAYMENT_FAILED')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all ${
                          ord.paymentStatus === 'PAYMENT_FAILED'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 hover:bg-red-200 text-red-800'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Mark Failed</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Quick Updater */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[10px] font-bold text-gray-500">Order Step:</span>
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-gray-800 outline-none focus:border-[#F95721]"
                  >
                    <option value="To Pay">To Pay</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped / In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
