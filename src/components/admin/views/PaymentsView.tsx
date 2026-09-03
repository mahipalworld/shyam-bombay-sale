'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  DollarSign, 
  Smartphone,
  Banknote
} from 'lucide-react';
import { PaymentRecord } from '@/types';

export const PaymentsView: React.FC = () => {
  const { paymentRecords } = useStore();

  const [activeMethodFilter, setActiveMethodFilter] = useState<'ALL' | 'UPI' | 'Card' | 'Net Banking' | 'COD'>('ALL');

  const filteredPayments = paymentRecords.filter(p => {
    if (activeMethodFilter !== 'ALL' && p.method !== activeMethodFilter) return false;
    return true;
  });

  const totalCollected = paymentRecords
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Payments & Ledger</h1>
          <p className="text-[11px] text-gray-500">Transaction records & payment gateways</p>
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span className="font-bold">Total Settled Balance</span>
          <ShieldCheck className="w-4 h-4 text-[#00A859]" />
        </div>
        <p className="text-2xl font-black text-white">₹{totalCollected.toLocaleString('en-IN')}</p>
        <div className="flex items-center gap-3 pt-2 border-t border-gray-700/60 text-[10px] text-gray-300">
          <span>UPI: 65%</span>
          <span>•</span>
          <span>Cards: 20%</span>
          <span>•</span>
          <span>COD: 15%</span>
        </div>
      </div>

      {/* Payment Method Filters */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Methods' },
          { key: 'UPI', label: 'UPI (GPay/PhonePe)' },
          { key: 'Card', label: 'Cards' },
          { key: 'COD', label: 'Cash on Delivery' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMethodFilter(m.key as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeMethodFilter === m.key
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredPayments.map((pay) => {
          const isSuccess = pay.status === 'Success';
          const isPending = pay.status === 'Pending';
          const isRefunded = pay.status === 'Refunded';

          return (
            <div
              key={pay.id}
              className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black ${
                    pay.method === 'UPI' ? 'bg-purple-100 text-purple-700' : pay.method === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {pay.method === 'UPI' ? <Smartphone className="w-4 h-4" /> : pay.method === 'COD' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-900">{pay.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSuccess ? 'bg-green-100 text-green-700' : isPending ? 'bg-amber-100 text-amber-700' : isRefunded ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">Order Ref: {pay.orderId}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-gray-900">₹{pay.amount}</span>
                  <p className="text-[10px] text-gray-500 font-medium">{pay.method}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span>Customer: {pay.customerName}</span>
                <span>{new Date(pay.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
