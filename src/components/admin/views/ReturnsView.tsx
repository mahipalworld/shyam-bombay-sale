'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  AlertCircle, 
  Package, 
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReturnRequest } from '@/types';

export const ReturnsView: React.FC = () => {
  const { returnRequests, updateReturnRequestStatus, showToast } = useStore();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending' | 'Approved' | 'Refunded' | 'Rejected'>('ALL');

  const filteredRequests = returnRequests.filter(r => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Returns & Refunds</h1>
          <p className="text-[11px] text-gray-500">{returnRequests.length} return claims</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'Pending', label: 'Pending Review' },
          { key: 'Approved', label: 'Approved' },
          { key: 'Refunded', label: 'Refunded' },
          { key: 'Rejected', label: 'Rejected' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterStatus(t.key as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              filterStatus === t.key
                ? 'bg-white text-[#F95721] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Returns List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-800">No return requests found</p>
            <p className="text-[11px] text-gray-400">All customer return requests are up to date.</p>
          </div>
        ) : (
          filteredRequests.map((ret) => (
            <div
              key={ret.id}
              className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900">Return #{ret.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ret.status === 'Refunded'
                        ? 'bg-purple-100 text-purple-700'
                        : ret.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : ret.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ret.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">Order ID: {ret.orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#F95721]">₹{ret.amount}</span>
                  <p className="text-[10px] text-gray-500 font-medium">Refund Amount</p>
                </div>
              </div>

              {/* Product & Customer Details */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ret.productImage} alt={ret.productName} className="w-12 h-12 rounded-2xl object-contain bg-gray-50 p-1 border border-gray-100" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{ret.productName}</p>
                  <p className="text-[10px] text-gray-500">Customer: {ret.customerName}</p>
                  <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Reason: {ret.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                {ret.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => updateReturnRequestStatus(ret.id, 'Rejected')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateReturnRequestStatus(ret.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xs"
                    >
                      Approve Return
                    </button>
                  </>
                )}

                {ret.status === 'Approved' && (
                  <button
                    onClick={() => updateReturnRequestStatus(ret.id, 'Refunded')}
                    className="px-3.5 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Process ₹{ret.amount} Refund</span>
                  </button>
                )}

                {ret.status === 'Refunded' && (
                  <span className="text-[11px] font-bold text-[#00A859] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Refund credited via UPI</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
