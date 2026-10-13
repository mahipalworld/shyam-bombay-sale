'use client';

import React from 'react';
import { Order } from '@/types';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber.replace(/[^0-9]/g, '') || order.id.slice(-6)}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative print:max-w-none print:max-h-none print:shadow-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (Hidden when printing) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-[#F95721] tracking-wider">Tax Invoice</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-bold text-gray-700">{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-8 space-y-6 text-gray-900 print:p-0">
          {/* Header & Store Brand */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/sbs-wordmark.svg"
                alt="Shyam Bombay Sale"
                className="h-9 w-auto object-contain mb-2"
              />
              <p className="text-xs font-extrabold text-gray-900">Shyam Bombay Sale (SBS Store)</p>
              <p className="text-[11px] text-gray-500 max-w-xs mt-0.5 leading-relaxed">
                Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat — 390023
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                GSTIN: <span className="font-mono font-bold text-gray-700">24AAACS8765F1Z5</span>
              </p>
              <p className="text-[11px] text-gray-500">
                Phone: +91 92262 94797 | Email: shyambombaysale@gmail.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 text-[#F95721] font-black text-xs rounded-full uppercase tracking-wider">
                Official Receipt
              </span>
              <p className="text-sm font-black text-gray-900 mt-1 font-mono">{invoiceNumber}</p>
              <p className="text-xs text-gray-500">Date: <span className="font-medium text-gray-800">{formattedDate}</span></p>
              <p className="text-xs text-gray-500">Order ID: <span className="font-mono font-bold text-gray-800">{order.orderNumber}</span></p>
              <p className="text-xs text-gray-500">Payment: <span className="font-semibold text-gray-800">{order.paymentMethod}</span></p>
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Billed & Delivered To
              </span>
              <p className="text-xs font-black text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
              </p>
              <p className="text-[11px] text-gray-600 font-mono mt-1">📞 +91 {order.shippingAddress.phone.replace(/\D/g, '')}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Fulfillment Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>{order.status}</span>
              </span>
              {order.trackingNumber && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Tracking Code: <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-2.5">#</th>
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-3 pr-2">
                      <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">SKU: {item.productId.slice(0, 8)}</p>
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right font-medium text-gray-700">₹{item.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financials & Calculation */}
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1 text-[11px] text-gray-500 max-w-xs">
              <div className="flex items-center gap-1 text-gray-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
                <span>Verified Purchase</span>
              </div>
              <p>Prices are inclusive of applicable GST (CGST 9% + SGST 9%). This computer-generated invoice does not require a physical signature.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#00A859] font-semibold">
                  <span>Store Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>{order.deliveryCharge === 0 ? <span className="text-[#00A859] font-bold">FREE</span> : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
                <span>Grand Total</span>
                <span className="text-[#F95721] font-black">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-gray-200 pt-4 text-center text-[10px] text-gray-400">
            Thank you for shopping with Shyam Bombay Sale! For customer support, visit <span className="font-bold text-gray-600">sbsstore.in</span> or WhatsApp us at <span className="font-bold text-gray-600">+91 92262 94797</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
