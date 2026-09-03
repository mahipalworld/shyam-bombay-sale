'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RotateCcw, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Receipt, 
  Printer, 
  Share2,
  PackageCheck
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
}) => {
  const { updateOrderStatus, showToast } = useStore();

  if (!order) return null;

  const timelineSteps: { key: OrderStatus | 'Placed'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'Placed', label: 'Placed', icon: Clock },
    { key: 'To Pay', label: 'Payment', icon: CreditCard },
    { key: 'Processing', label: 'Preparing', icon: PackageCheck },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'To Pay': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Returns': return 2;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">{order.orderNumber}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                order.status === 'Delivered' 
                  ? 'bg-green-100 text-green-700' 
                  : order.status === 'Shipped' 
                  ? 'bg-blue-100 text-blue-700' 
                  : order.status === 'Returns'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-orange-100 text-[#F35C16]'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 text-gray-600 hover:text-black flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Visual Step Timeline */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5 space-y-3">
            <h4 className="font-extrabold text-gray-800 text-[11px]">Fulfillment Progress Timeline</h4>
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
              
              {timelineSteps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const Icon = st.icon;

                return (
                  <div key={st.label} className="flex flex-col items-center relative z-10 space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#F35C16] text-white ring-4 ring-orange-200 shadow-xs'
                        : isPassed
                        ? 'bg-[#00A859] text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-[#F35C16]' : isPassed ? 'text-gray-800' : 'text-gray-400'}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Status Transition Action */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-gray-800 block text-xs">Update Live Order Status</span>
              <span className="text-[10px] text-gray-400">Notifies customer instantly</span>
            </div>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
              className="bg-white border-2 border-orange-300 text-[#F35C16] font-extrabold text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-xs"
            >
              <option value="To Pay">To Pay</option>
              <option value="Processing">Processing / Preparing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Returns">Returns</option>
            </select>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-gray-900 text-xs">Ordered Products ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ₹{item.price} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-gray-900 text-xs flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#F35C16]" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-gray-500 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{order.shippingAddress.phone}</span>
              </p>
            </div>

            <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Payment Mode</span>
                <p className="font-bold text-gray-800 text-xs">{order.paymentMethod}</p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Tracking Code</span>
                <p className="font-mono text-[11px] font-bold text-[#F35C16]">{order.trackingNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Payment & Bill Summary */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-bold text-gray-900 text-xs">Financial Summary</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#00A859] font-semibold">
                  <span>Discount Applied</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-sm text-gray-900">
                <span>Total Collected</span>
                <span className="text-[#F35C16]">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <button
            onClick={() => showToast('Printing Order Slip / Dispatch Label')}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-800 font-bold rounded-2xl flex items-center justify-center gap-1 text-xs hover:bg-gray-100 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Print Invoice Slip</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
