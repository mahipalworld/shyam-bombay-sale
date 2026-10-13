'use client';

import React, { useState } from 'react';
import { Order, OrderItem } from '@/types';
import { X, RotateCcw, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

interface ReturnRequestModalProps {
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    productName: string;
    productImage: string;
    reason: string;
    amount: number;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
  }) => Promise<void>;
}

const RETURN_REASONS = [
  'Item defective or not functioning',
  'Damaged during transit / broken seal',
  'Wrong item delivered',
  'Item not matching photos or description',
  'Quality not as expected',
  'Ordered by mistake / changed mind'
];

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ order, onClose, onSubmit }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [reason, setReason] = useState<string>(RETURN_REASONS[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!order) return null;

  const currentItem = order.items[selectedItemIndex] || order.items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        orderId: order.id,
        productName: currentItem.name,
        productImage: currentItem.image,
        reason: `${reason}${notes ? ` - ${notes}` : ''}`,
        amount: currentItem.price * currentItem.quantity,
        customerName: order.shippingAddress.name,
        customerPhone: order.shippingAddress.phone,
        customerAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">Request Return / Exchange</h2>
              <p className="text-[11px] text-gray-500">Order #{order.orderNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs text-gray-700">
          {/* Select Product to Return */}
          <div>
            <label className="block text-xs font-black text-gray-900 uppercase tracking-wider mb-2">
              Select Item to Return
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {order.items.map((it, idx) => {
                const isSelected = selectedItemIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItemIndex(idx)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#F95721] bg-orange-50/50 shadow-2xs ring-1 ring-[#F95721]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center border border-gray-100 shrink-0">
                      <ResolvedImage src={it.image} alt={it.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 line-clamp-1">{it.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {it.quantity} • ₹{it.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-black text-gray-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Picker */}
          <div>
            <label className="block text-xs font-black text-gray-900 uppercase tracking-wider mb-2">
              Reason for Return
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-[#F95721] transition-colors"
            >
              {RETURN_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-black text-gray-900 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us what went wrong with this product..."
              className="w-full bg-white border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:border-[#F95721] transition-colors resize-none"
            />
          </div>

          {/* Pickup Address Confirmation */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
              Doorstep Pickup Address
            </span>
            <p className="font-bold text-gray-900 text-xs">{order.shippingAddress.name}</p>
            <p className="text-[11px] text-gray-600 leading-snug">
              {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
            </p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ SBS reverse pickup associate will collect this from your doorstep.</p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] disabled:opacity-50 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Request...' : 'Submit Return Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
