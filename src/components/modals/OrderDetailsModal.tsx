'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Clock,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Check
} from 'lucide-react';

export const OrderDetailsModal: React.FC = () => {
  const { selectedOrderForModal, setSelectedOrderForModal } = useStore();

  if (!selectedOrderForModal) return null;
  const order = selectedOrderForModal;

  const isUPI = order.paymentMethod.includes('UPI');
  const isPaymentConfirmed = order.paymentStatus === 'CUSTOMER_CONFIRMED' || order.paymentStatus === 'PAYMENT_VERIFIED';
  const isPaymentVerified = order.paymentStatus === 'PAYMENT_VERIFIED' || (!isUPI && order.paymentMethod !== 'COD');
  const isPaymentFailed = order.paymentStatus === 'PAYMENT_FAILED';

  // Format dates/times safely
  const formatTimeOrDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } catch {
      return isoStr;
    }
  };

  const orderPlacedTime = formatTimeOrDate(order.createdAt);
  const paymentConfirmedTime = formatTimeOrDate(order.paymentConfirmedAt);

  const timelineSteps = [
    {
      label: 'Order Placed',
      time: orderPlacedTime || 'Recorded',
      status: 'DONE',
      description: 'Order created in SBS system'
    },
    ...(isUPI ? [
      {
        label: 'Payment Confirmation Submitted',
        time: isPaymentConfirmed ? (paymentConfirmedTime || 'Submitted by customer') : 'Awaiting payment',
        status: isPaymentConfirmed ? 'DONE' : 'CURRENT',
        description: isPaymentConfirmed ? 'Customer clicked confirmation' : 'Transfer via UPI & click confirmation'
      },
      {
        label: 'Payment Verified',
        time: isPaymentVerified ? 'Verified by Admin ✓' : isPaymentFailed ? 'Verification Failed ⚠️' : isPaymentConfirmed ? 'Pending Admin Verification' : 'Waiting for payment',
        status: isPaymentVerified ? 'DONE' : isPaymentFailed ? 'FAILED' : isPaymentConfirmed ? 'CURRENT' : 'PENDING',
        description: isPaymentVerified ? 'GPay/UPI payment confirmed by store' : isPaymentFailed ? 'Payment could not be verified' : 'Store admin will verify on GPay'
      }
    ] : []),
    {
      label: 'Order Confirmed',
      time: (isPaymentVerified || order.status !== 'To Pay') ? 'Order Accepted' : 'Pending payment',
      status: (isPaymentVerified || order.status !== 'To Pay') ? 'DONE' : 'PENDING',
      description: 'Accepted and queued for dispatch'
    },
    {
      label: 'Processing / Packing',
      time: ['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'Packing at Warehouse' : 'Not started',
      status: ['Processing', 'Shipped', 'Delivered'].includes(order.status) ? (order.status === 'Processing' ? 'CURRENT' : 'DONE') : 'PENDING',
      description: 'Items being sanitized & packed'
    },
    {
      label: 'Shipped / In Transit',
      time: order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Dispatched soon',
      status: ['Shipped', 'Delivered'].includes(order.status) ? (order.status === 'Shipped' ? 'CURRENT' : 'DONE') : 'PENDING',
      description: order.estimatedDelivery ? `Est. delivery: ${order.estimatedDelivery}` : 'Handed over to courier'
    },
    {
      label: 'Delivered',
      time: order.status === 'Delivered' ? 'Delivered to Address' : 'Upcoming',
      status: order.status === 'Delivered' ? 'DONE' : 'PENDING',
      description: 'Package delivered to recipient'
    },
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Order Details</h2>
            <span className="text-[11px] text-gray-500 font-mono font-bold">{order.orderNumber}</span>
          </div>
          <button
            onClick={() => setSelectedOrderForModal(null)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Status & Payment Header Banner */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-3.5 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Order Status</span>
              <p className="text-base font-black text-[#F95721]">{order.status}</p>
              {order.paymentStatus && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${
                  order.paymentStatus === 'PAYMENT_VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                  order.paymentStatus === 'CUSTOMER_CONFIRMED' ? 'bg-amber-100 text-amber-900' :
                  order.paymentStatus === 'PAYMENT_FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.paymentStatus === 'PAYMENT_VERIFIED' && '✓ Payment Verified'}
                  {order.paymentStatus === 'CUSTOMER_CONFIRMED' && '⏳ Payment: Pending Admin Verification'}
                  {order.paymentStatus === 'PAYMENT_FAILED' && '✕ Payment Failed'}
                  {order.paymentStatus === 'PENDING' && '● Payment Pending'}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Amount</span>
              <p className="text-base font-black text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
              <span className="text-[10px] font-medium text-gray-500">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Detailed Timeline */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3 shadow-2xs">
            <h3 className="font-black text-gray-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F95721]" /> Order & Payment Timeline
            </h3>
            
            <div className="space-y-4 pl-1">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === 'DONE';
                const isCurrent = step.status === 'CURRENT';
                const isFailed = step.status === 'FAILED';

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`absolute left-2.5 top-5 w-0.5 h-8 ${
                          isDone ? 'bg-[#00A859]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold ${
                        isDone
                          ? 'bg-[#00A859] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#F95721] text-white animate-pulse'
                          : isFailed
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : isFailed ? '!' : '•'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-1">
                        <p className={`font-black text-xs ${isDone ? 'text-gray-900' : isCurrent ? 'text-[#F95721]' : isFailed ? 'text-red-600' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{step.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Purchased */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-2.5 shadow-2xs">
            <h3 className="font-bold text-gray-900">Items Ordered ({order.items.length})</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-1 shadow-2xs">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-[#F95721]" /> Shipping Address
            </h3>
            <p className="font-bold text-gray-800">{order.shippingAddress.name}</p>
            <p className="text-gray-600">{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
            <p className="text-gray-500 font-medium">📞 {order.shippingAddress.phone}</p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-gray-900 mb-1">Payment Summary</h3>
            <div className="flex justify-between text-gray-600">
              <span>Payment Mode</span>
              <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span className="text-[#00A859]">-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span>{order.deliveryCharge === 0 ? <span className="text-[#00A859] font-bold">FREE</span> : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-gray-900">
              <span>Total Payable</span>
              <span className="text-[#F95721]">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={() => setSelectedOrderForModal(null)}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
