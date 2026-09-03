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
  RotateCcw
} from 'lucide-react';

export const OrderDetailsModal: React.FC = () => {
  const { selectedOrderForModal, setSelectedOrderForModal } = useStore();

  if (!selectedOrderForModal) return null;
  const order = selectedOrderForModal;

  const steps = [
    { label: 'Order Confirmed', time: new Date(order.createdAt).toLocaleDateString(), done: true },
    { label: 'Processing at Hub', time: 'Completed', done: order.status !== 'To Pay' },
    { label: 'Out for Delivery', time: order.trackingNumber || 'In transit', done: order.status === 'Shipped' || order.status === 'Delivered' },
    { label: 'Delivered', time: order.estimatedDelivery || 'Arriving soon', done: order.status === 'Delivered' },
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Order Details</h2>
            <span className="text-[11px] text-gray-500 font-mono">{order.orderNumber}</span>
          </div>
          <button
            onClick={() => setSelectedOrderForModal(null)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Order Status Badge Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500">Current Status</span>
              <p className="text-sm font-extrabold text-[#F95721]">{order.status}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500">Tracking Code</span>
              <p className="text-xs font-mono font-bold text-gray-800">{order.trackingNumber}</p>
            </div>
          </div>

          {/* Delivery Stepper Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-subtle">
            <h3 className="font-bold text-gray-900">Delivery Status</h3>
            <div className="space-y-4 pl-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-2.5 top-5 w-0.5 h-7 ${
                        step.done ? 'bg-[#00A859]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.done
                        ? 'bg-[#00A859] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className={`font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Purchased */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2.5 shadow-subtle">
            <h3 className="font-bold text-gray-900">Items Ordered ({order.items.length})</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center flex-shrink-0">
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
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1 shadow-subtle">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-[#F95721]" /> Shipping Address
            </h3>
            <p className="font-semibold text-gray-800">{order.shippingAddress.name}</p>
            <p className="text-gray-600">{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
            <p className="text-gray-500">{order.shippingAddress.phone}</p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1.5 shadow-subtle">
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
            <div className="border-t pt-2 flex justify-between font-bold text-sm text-gray-900">
              <span>Total Paid</span>
              <span className="text-[#F95721]">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={() => setSelectedOrderForModal(null)}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
