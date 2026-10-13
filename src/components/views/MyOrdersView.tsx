'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  Repeat, 
  FileText, 
  MessageCircle, 
  ExternalLink, 
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';
import { InvoiceModal } from '@/components/modals/InvoiceModal';
import { ReturnRequestModal } from '@/components/modals/ReturnRequestModal';

export const MyOrdersView: React.FC = () => {
  const { 
    orders, 
    products, 
    addToCart, 
    setActiveTab, 
    setSelectedOrderForModal, 
    updateOrderStatus, 
    createReturnRequest, 
    refreshOrders,
    showToast,
    storeSettings,
    orderListFilter,
    setOrderListFilter
  } = useStore();

  const [activeTab, setActiveTabFilter] = useState<string>(orderListFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Sync external filter changes (e.g. from Profile status pills)
  useEffect(() => {
    if (orderListFilter) {
      setActiveTabFilter(orderListFilter);
    }
  }, [orderListFilter]);

  // Modals state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const copyOrderNumber = (orderNum: string, id: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderId(id);
    showToast(`Copied Order #${orderNum}`, 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Re-order all items from this order into cart
  const handleReorder = (order: Order) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      // Find active product from catalog or create a fallback item
      const product = products.find((p) => p.id === item.productId) || {
        id: item.productId,
        name: item.name,
        price: item.price,
        originalPrice: item.price,
        discountPercentage: 0,
        image: item.image,
        category: 'general',
        inStock: true,
        stockCount: 99,
        rating: 5,
        reviewCount: 1,
        description: item.name
      };
      addToCart(product, item.quantity);
      addedCount += item.quantity;
    });

    showToast(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to your cart! 🛒`, 'success');
    setActiveTab('cart');
  };

  // WhatsApp Support Helper
  const openWhatsAppSupport = (order: Order) => {
    const rawPhone = (storeSettings?.contactPhone && !storeSettings.contactPhone.includes('99887')) 
      ? storeSettings.contactPhone 
      : '9226294797';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `Hello SBS Support! 👋\nI need assistance with my Order *#${order.orderNumber}* (Status: ${order.status}, Total: ₹${order.total}). Could you please help?`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Customer Cancel Order Action
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, 'Cancelled');
      showToast('Order has been cancelled successfully', 'info');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        const matchesItem = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesNum && !matchesItem) return false;
      }

      // Tab filter
      if (activeTab === 'ALL') return true;
      if (activeTab === 'To Pay' && o.status === 'To Pay') return true;
      if (activeTab === 'Processing' && o.status === 'Processing') return true;
      if (activeTab === 'Shipped' && o.status === 'Shipped') return true;
      if (activeTab === 'Delivered' && o.status === 'Delivered') return true;
      if (activeTab === 'Returns' && o.status === 'Returns') return true;
      if (activeTab === 'Cancelled' && o.status === 'Cancelled') return true;

      return false;
    });
  }, [orders, searchQuery, activeTab]);

  // Tab counters
  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      'To Pay': orders.filter(o => o.status === 'To Pay').length,
      Processing: orders.filter(o => o.status === 'Processing').length,
      Shipped: orders.filter(o => o.status === 'Shipped').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length,
      Returns: orders.filter(o => o.status === 'Returns').length,
      Cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };
  }, [orders]);

  // 4-Step Tracker Evaluator
  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'To Pay':
        return { step: 1, label: 'Awaiting Payment', isCurrent: 1 };
      case 'Processing':
        return { step: 2, label: 'Order Confirmed & Preparing', isCurrent: 2 };
      case 'Shipped':
        return { step: 3, label: 'In Transit / Out for Delivery', isCurrent: 3 };
      case 'Delivered':
        return { step: 4, label: 'Delivered', isCurrent: 4 };
      case 'Returns':
        return { step: 2, label: 'Return in Progress', isCurrent: 2 };
      case 'Cancelled':
        return { step: 0, label: 'Cancelled', isCurrent: 0 };
      default:
        return { step: 1, label: 'Placed', isCurrent: 1 };
    }
  };

  return (
    <div className="space-y-5 pb-28 animate-fadeIn max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 p-4 sm:p-5 rounded-3xl border border-orange-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F95721] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">My Orders</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track packages, print GST invoices, reorder items & manage replacements.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-black rounded-2xl text-xs font-bold shadow-2xs active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F95721]' : 'text-gray-500'}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Order ID (e.g. SBS-1024) or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 outline-none focus:border-[#F95721] shadow-2xs transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter Tab Pills */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'To Pay', label: 'To Pay' },
          { key: 'Processing', label: 'Processing' },
          { key: 'Shipped', label: 'In Transit' },
          { key: 'Delivered', label: 'Delivered' },
          { key: 'Returns', label: 'Returns' },
          { key: 'Cancelled', label: 'Cancelled' },
        ].map((t) => {
          const count = counts[t.key as keyof typeof counts] || 0;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setActiveTabFilter(t.key);
                setOrderListFilter(t.key === 'ALL' ? null : t.key as any);
              }}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-[#F95721] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-orange-100 text-[#F95721]' : 'bg-gray-200/80 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-gray-900">
              {orders.length === 0 ? 'No orders placed yet' : 'No orders found matching filter'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {orders.length === 0 
                ? 'Your order history will appear here once you place an order. Explore our catalog of essentials and deals today!'
                : 'Try selecting a different status tab or clearing your search query.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('categories')}
            className="px-6 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-black text-xs rounded-2xl inline-flex items-center gap-2 shadow-md shadow-orange-500/25 active:scale-95 transition-all"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const isShipped = order.status === 'Shipped';
            const isCancelled = order.status === 'Cancelled';
            const isReturn = order.status === 'Returns';
            const isToPay = order.status === 'To Pay';
            const isProcessing = order.status === 'Processing';

            const progress = getStepProgress(order.status);
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200/80 hover:border-orange-200 rounded-3xl p-4 sm:p-5 shadow-2xs transition-all space-y-4"
              >
                {/* 1. Header Row: Order Number, Date, Status Pill & Price */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">{order.orderNumber}</span>
                      <button
                        onClick={() => copyOrderNumber(order.orderNumber, order.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isDelivered ? 'bg-emerald-100 text-emerald-800' :
                        isShipped ? 'bg-blue-100 text-blue-800' :
                        isCancelled ? 'bg-red-100 text-red-800' :
                        isReturn ? 'bg-purple-100 text-purple-800' :
                        isToPay ? 'bg-amber-100 text-amber-800' :
                        'bg-orange-100 text-[#F95721]'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">Placed on {formattedDate}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-gray-500 font-semibold">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* 2. Visual 4-Step Tracking Stepper (for active / non-cancelled orders) */}
                {!isCancelled && (
                  <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span className="text-[11px] text-gray-500">Live Delivery Status</span>
                      <span className="text-[11px] font-black text-[#F95721]">{progress.label}</span>
                    </div>

                    {/* Progress Bar & Dots */}
                    <div className="relative pt-2 pb-1">
                      {/* Connecting Background Line */}
                      <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full" />
                      {/* Connecting Active Fill Line */}
                      <div 
                        className="absolute top-4 left-4 h-1 bg-gradient-to-r from-[#F95721] to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: progress.step === 1 ? '15%' :
                                 progress.step === 2 ? '45%' :
                                 progress.step === 3 ? '75%' : '100%'
                        }}
                      />

                      {/* 4 Step Milestones */}
                      <div className="relative flex justify-between">
                        {[
                          { step: 1, label: 'Placed', icon: Clock },
                          { step: 2, label: 'Packed', icon: Package },
                          { step: 3, label: 'Shipped', icon: Truck },
                          { step: 4, label: 'Delivered', icon: CheckCircle2 },
                        ].map((s) => {
                          const isDone = progress.step >= s.step;
                          const isCurrent = progress.step === s.step;
                          const IconComp = s.icon;

                          return (
                            <div key={s.step} className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all ${
                                isDone 
                                  ? 'bg-[#F95721] text-white shadow-xs' 
                                  : 'bg-white border-2 border-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-orange-200 animate-pulse' : ''}`}>
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 ${
                                isDone ? 'text-gray-900 font-extrabold' : 'text-gray-400 font-medium'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="pt-1.5 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Courier Tracking Code:</span>
                        <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Items Summary Preview */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                        <ResolvedImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <span className="text-xs font-black text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 4. Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  {/* Left Action Buttons: WhatsApp & Invoice */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openWhatsAppSupport(order)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                      title="Need assistance with this order"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Help</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      title="Download GST Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>Invoice</span>
                    </button>
                  </div>

                  {/* Right Action Buttons: Re-order, Return, Cancel, Full Details */}
                  <div className="flex items-center gap-2">
                    {/* Customer Cancellation Option */}
                    {(isToPay || isProcessing) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>{cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                      </button>
                    )}

                    {/* Customer Return Request Option */}
                    {isDelivered && (
                      <button
                        onClick={() => setSelectedReturnOrder(order)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                        <span>Return / Exchange</span>
                      </button>
                    )}

                    {/* Buy Again (1-tap Reorder) */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Buy Again</span>
                    </button>

                    {/* View Details modal */}
                    <button
                      onClick={() => setSelectedOrderForModal(order)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                      title="View Full Order Timeline & Address"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Return Request Modal */}
      <ReturnRequestModal
        order={selectedReturnOrder}
        onClose={() => setSelectedReturnOrder(null)}
        onSubmit={async (data) => {
          await createReturnRequest(data);
          setSelectedReturnOrder(null);
        }}
      />
    </div>
  );
};
