'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  AlertCircle, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Clock, 
  Sparkles, 
  Search, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';
import { ReturnRequest, Order } from '@/types';
import { ResolvedImage } from '@/components/common/ResolvedMedia';

export const ReturnsView: React.FC = () => {
  const { returnRequests, updateReturnRequestStatus, orders, adminOrders, showToast } = useStore();
  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending' | 'Approved' | 'Refunded' | 'Rejected'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Refund processing & Pickup scheduling
  const [selectedReturnForRefund, setSelectedReturnForRefund] = useState<ReturnRequest | null>(null);
  const [refundTxnId, setRefundTxnId] = useState('');
  const [refundMethod, setRefundMethod] = useState<'UPI' | 'Bank Transfer' | 'Original Payment'>('UPI');

  const [selectedReturnForPickup, setSelectedReturnForPickup] = useState<ReturnRequest | null>(null);
  const [pickupCourier, setPickupCourier] = useState('Delhivery Surface');
  const [pickupTracking, setPickupTracking] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('Product received in original retail condition with all accessories intact.');

  // Find linked order for customer phone & address if not directly on return object
  const getOrderDetails = (orderId: string): Order | undefined => {
    return allOrdersList.find(o => o.id === orderId || o.orderNumber === orderId);
  };

  // KPI Calculations
  const totalClaims = returnRequests.length;
  const pendingCount = returnRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = returnRequests.filter(r => r.status === 'Approved').length;
  const refundedCount = returnRequests.filter(r => r.status === 'Refunded').length;
  const totalRefundedAmount = returnRequests
    .filter(r => r.status === 'Refunded')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered return claims
  const filteredRequests = useMemo(() => {
    return returnRequests.filter(r => {
      // 1. Status Filter
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ord = getOrderDetails(r.orderId);
        const matchId = r.id.toLowerCase().includes(q);
        const matchOrder = r.orderId.toLowerCase().includes(q) || (ord && ord.orderNumber.toLowerCase().includes(q));
        const matchCust = r.customerName.toLowerCase().includes(q);
        const matchProd = r.productName.toLowerCase().includes(q);
        const matchPhone = (r.customerPhone || ord?.shippingAddress?.phone || '').includes(q);
        if (!matchId && !matchOrder && !matchCust && !matchProd && !matchPhone) return false;
      }

      return true;
    });
  }, [returnRequests, filterStatus, searchQuery, allOrdersList]);

  // WhatsApp Customer Communication
  const sendWhatsAppUpdate = (ret: ReturnRequest) => {
    const ord = getOrderDetails(ret.orderId);
    const rawPhone = ret.customerPhone || ord?.shippingAddress?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    if (!formattedPhone) {
      showToast('No customer phone number available for WhatsApp update', 'error');
      return;
    }

    const orderNum = ord?.orderNumber || ret.orderId;
    let statusMsg = '';
    if (ret.status === 'Pending') {
      statusMsg = 'Your return request is currently under review by our executive team. We will update you shortly.';
    } else if (ret.status === 'Approved') {
      statusMsg = `Your return request has been *APPROVED*! Reverse pickup has been assigned via *${ret.pickupCourier || 'Express Courier'}* (AWB: ${ret.pickupTrackingNumber || 'To be generated'}). Our pickup executive will collect the package.`;
    } else if (ret.status === 'Refunded') {
      statusMsg = `Your refund of *₹${ret.amount}* has been processed successfully via *${ret.refundMethod || 'UPI'}*${ret.refundTxnId ? ` (UTR / Ref: ${ret.refundTxnId})` : ''}. Thank you for shopping with SBS Store!`;
    } else {
      statusMsg = `Your return request could not be processed at this time. Please contact customer support for further assistance.`;
    }

    const message = 
`Hello *${ret.customerName}*! 👋
This is an update from *SBS Store (Shyam Bombay Sale)* regarding your Return Claim for *${ret.productName}* on Order *#${orderNum}*.

📦 *Current Status:* ${ret.status}
💰 *Refund Amount:* ₹${ret.amount}
ℹ️ *Details:* ${statusMsg}

If you have any questions, feel free to reply directly to this message. 🙏`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleConfirmRefund = () => {
    if (!selectedReturnForRefund) return;
    updateReturnRequestStatus(selectedReturnForRefund.id, 'Refunded', {
      refundTxnId: refundTxnId.trim() || `UPI-SBS-${Date.now().toString().slice(-6)}`,
      refundMethod,
    });
    setSelectedReturnForRefund(null);
    setRefundTxnId('');
    showToast(`Refund of ₹${selectedReturnForRefund.amount} confirmed!`);
  };

  const handleConfirmPickup = () => {
    if (!selectedReturnForPickup) return;
    updateReturnRequestStatus(selectedReturnForPickup.id, 'Approved', {
      pickupCourier,
      pickupTrackingNumber: pickupTracking.trim() || `AWB-${Date.now().toString().slice(-6)}`,
      pickupStatus: 'Scheduled',
      inspectionNotes,
    });
    setSelectedReturnForPickup(null);
    setPickupTracking('');
    showToast('Reverse pickup courier scheduled & return approved!');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 animate-fadeIn">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#F95721] uppercase tracking-wider">
              Reverse Logistics & Claims
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              {pendingCount} Pending Review
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
            Returns & Refunds Manager
          </h1>
          <p className="text-xs text-slate-500">
            Process customer return claims, reverse courier pickups, and automated ledger refunds.
          </p>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Claims</span>
            <RotateCcw className="w-4 h-4 text-[#F95721]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalClaims}</p>
          <p className="text-[10px] text-slate-400">Lifetime store claims</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className={`text-2xl font-black ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {pendingCount}
          </p>
          <p className="text-[10px] text-slate-400">Awaiting executive approval</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">In-Transit / Pickup</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">{approvedCount}</p>
          <p className="text-[10px] text-slate-400">Approved & courier assigned</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-3xl shadow-3xs space-y-1">
          <div className="flex items-center justify-between text-white/80">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Refunded</span>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black">₹{totalRefundedAmount.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-white/80">{refundedCount} claims settled via UPI</p>
        </div>
      </div>

      {/* 3. Search & Status Filter Tabs */}
      <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-3xl shadow-3xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return by Customer Name, Phone, Order #, Return #, or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-3 py-2 text-xs outline-hidden focus:border-[#F95721] focus:bg-white transition-all text-slate-900 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { key: 'ALL', label: `All Claims (${returnRequests.length})` },
            { key: 'Pending', label: `Pending Review (${pendingCount})` },
            { key: 'Approved', label: `Approved / Pickup (${approvedCount})` },
            { key: 'Refunded', label: `Refund Settled (${refundedCount})` },
            { key: 'Rejected', label: `Rejected (${returnRequests.filter(r => r.status === 'Rejected').length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterStatus(t.key as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                filterStatus === t.key
                  ? 'bg-white text-[#F95721] shadow-3xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Returns List Canvas */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-3xs">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F95721] flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {searchQuery.trim() || filterStatus !== 'ALL' ? 'No matching return claims' : 'No return requests pending'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                {searchQuery.trim() || filterStatus !== 'ALL'
                  ? 'Try clearing the search query or changing your status filter.'
                  : 'Customer return requests submitted through their order dashboard will appear here automatically.'}
              </p>
            </div>
          </div>
        ) : (
          filteredRequests.map((ret) => {
            const ord = getOrderDetails(ret.orderId);
            const customerPhone = ret.customerPhone || ord?.shippingAddress?.phone || 'Not available';
            const customerAddress = ret.customerAddress || (ord?.shippingAddress ? `${ord.shippingAddress.street}, ${ord.shippingAddress.city}, ${ord.shippingAddress.state} - ${ord.shippingAddress.pincode}` : 'Address recorded on checkout');

            return (
              <div
                key={ret.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-3xs space-y-3.5 hover:border-slate-300 transition-all"
              >
                {/* Header: ID, Order #, Status & Refund Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900">Return #{ret.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">
                      Order #{ord?.orderNumber || ret.orderId}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ret.status === 'Refunded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ret.status === 'Approved'
                        ? 'bg-blue-100 text-blue-800'
                        : ret.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ret.status === 'Approved' ? 'Approved (Pickup Scheduled)' : ret.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Filed: {new Date(ret.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-[#F95721]">
                        ₹{ret.amount?.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">Refund Payable</p>
                    </div>
                  </div>
                </div>

                {/* Main Details Grid: Product Info + Customer Address + Reverse Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Column 1: Product & Claim Reason */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                      <ResolvedImage
                        src={ret.productImage}
                        alt={ret.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{ret.productName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Amount: ₹{ret.amount}</p>
                      <div className="mt-1.5 p-1.5 bg-amber-50/90 border border-amber-200/60 rounded-xl text-[10px] text-amber-950">
                        <span className="font-bold">Customer Reason:</span> {ret.reason}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Customer Contact & Pickup Address */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#F95721]" />
                        {ret.customerName}
                      </span>
                      <button
                        onClick={() => sendWhatsAppUpdate(ret)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-emerald-200/60 transition-colors"
                        title="Send WhatsApp update to customer"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{customerPhone}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-start gap-1 leading-snug">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate-2-lines">{customerAddress}</span>
                    </p>
                  </div>

                  {/* Column 3: Logistics & Reverse Tracking */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5 md:col-span-2 lg:col-span-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      Reverse Logistics Status
                    </span>

                    {ret.status === 'Approved' ? (
                      <div className="space-y-1 text-[11px]">
                        <p className="text-slate-700">
                          Courier: <span className="font-bold text-slate-900">{ret.pickupCourier || 'Delhivery Express'}</span>
                        </p>
                        <p className="text-slate-700 font-mono text-[10px]">
                          AWB / Tracking: <span className="font-bold text-blue-600">{ret.pickupTrackingNumber || 'Pending AWB'}</span>
                        </p>
                        {ret.inspectionNotes && (
                          <p className="text-[10px] text-slate-500 italic">"{ret.inspectionNotes}"</p>
                        )}
                      </div>
                    ) : ret.status === 'Refunded' ? (
                      <div className="space-y-1 text-[11px]">
                        <p className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Refund Completed via {ret.refundMethod || 'UPI'}
                        </p>
                        {ret.refundTxnId && (
                          <p className="text-[10px] text-slate-500 font-mono">
                            UTR / Ref: <span className="font-bold text-slate-800">{ret.refundTxnId}</span>
                          </p>
                        )}
                      </div>
                    ) : ret.status === 'Rejected' ? (
                      <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Claim Rejected by Store Manager
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Return Approval
                      </p>
                    )}
                  </div>
                </div>

                {/* Reverse Pickup Stepper Bar */}
                <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 hidden sm:flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claim Submitted</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${
                    ret.status === 'Approved' || ret.status === 'Refunded' ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    <Truck className="w-3.5 h-3.5" />
                    <span>Reverse Pickup</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${
                    ret.status === 'Approved' || ret.status === 'Refunded' ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Warehouse Inspection</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <div className={`flex items-center gap-1.5 ${
                    ret.status === 'Refunded' ? 'text-emerald-700 font-black' : 'text-slate-400'
                  }`}>
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Refund Credited</span>
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => sendWhatsAppUpdate(ret)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notify Customer</span>
                  </button>

                  {ret.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => updateReturnRequestStatus(ret.id, 'Rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition-colors"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReturnForPickup(ret);
                          setPickupTracking(`AWB-SBS-${Date.now().toString().slice(-6)}`);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-3xs transition-all active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Approve & Schedule Pickup</span>
                      </button>
                    </>
                  )}

                  {ret.status === 'Approved' && (
                    <button
                      onClick={() => {
                        setSelectedReturnForRefund(ret);
                        setRefundTxnId(`UPI-UTR-${Date.now().toString().slice(-8)}`);
                      }}
                      className="px-4 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Complete ₹{ret.amount} Refund</span>
                    </button>
                  )}

                  {ret.status === 'Refunded' && (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Settled & Restocked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: SCHEDULE REVERSE PICKUP & APPROVE RETURN */}
      {/* ========================================================= */}
      {selectedReturnForPickup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Approve & Schedule Pickup</h3>
                  <p className="text-[10px] text-slate-400">Return Claim #{selectedReturnForPickup.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReturnForPickup(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <p className="text-slate-500">Customer: <span className="font-bold text-slate-900">{selectedReturnForPickup.customerName}</span></p>
                <p className="text-slate-500 mt-0.5">Product: <span className="font-bold text-slate-900">{selectedReturnForPickup.productName}</span></p>
                <p className="text-slate-500 mt-0.5">Refund on Return: <span className="font-bold text-[#F95721]">₹{selectedReturnForPickup.amount}</span></p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assigned Reverse Courier
                </label>
                <select
                  value={pickupCourier}
                  onChange={(e) => setPickupCourier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
                >
                  <option value="Delhivery Surface">Delhivery Surface Reverse</option>
                  <option value="BlueDart Express">BlueDart Smart Reverse</option>
                  <option value="Shadowfax Local">Shadowfax Hyperlocal Pickup</option>
                  <option value="SBS Internal Driver">SBS In-Store Pickup Team</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  AWB / Reverse Tracking Number
                </label>
                <input
                  type="text"
                  value={pickupTracking}
                  onChange={(e) => setPickupTracking(e.target.value)}
                  placeholder="Enter courier AWB tracking code..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Warehouse Inspection Directive
                </label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Enter condition inspection checklist..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReturnForPickup(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPickup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                Confirm Pickup & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRM REFUND WITH UPI / BANK REFERENCE */}
      {/* ========================================================= */}
      {selectedReturnForRefund && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Process Customer Refund</h3>
                  <p className="text-[10px] text-slate-400">Order #{selectedReturnForRefund.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReturnForRefund(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200/70 text-center space-y-1">
              <p className="text-[11px] font-bold text-slate-600 uppercase">Refund Amount Payable</p>
              <p className="text-2xl font-black text-[#F95721]">₹{selectedReturnForRefund.amount?.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">Crediting to: <span className="font-bold text-slate-800">{selectedReturnForRefund.customerName}</span></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Bank Transfer', 'Original Payment'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRefundMethod(m)}
                      className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] border transition-all ${
                        refundMethod === m
                          ? 'bg-[#F95721] text-white border-[#F95721] shadow-3xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  UPI UTR / Bank Reference Transaction ID
                </label>
                <input
                  type="text"
                  value={refundTxnId}
                  onChange={(e) => setRefundTxnId(e.target.value)}
                  placeholder="e.g., 429381029381 (UPI Ref)"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This transaction ID will be stored in payment ledgers and can be shared with the customer.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReturnForRefund(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-4 py-2 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs rounded-xl shadow-xs shadow-orange-500/20 transition-all active:scale-95"
              >
                Confirm ₹{selectedReturnForRefund.amount} Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
