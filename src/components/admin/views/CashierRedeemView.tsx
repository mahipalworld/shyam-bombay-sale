'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CustomerLookupResult, 
  CouponIssuance, 
  RedeemCouponResult 
} from '@/types';
import { 
  Store, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  User, 
  Receipt, 
  Tag, 
  RefreshCw, 
  Copy, 
  IndianRupee
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CashierRedeemView: React.FC = () => {
  const { showToast, coupons } = useStore();
  const { authUser, supabaseUser } = useAuth();

  // Cashier Identity
  const cashierIdentifier = authUser?.email || supabaseUser?.email || 'cashier_desk_1';

  // Input states
  const [phoneInput, setPhoneInput] = useState('');
  const [couponCode, setCouponCode] = useState('SBS20');
  const [billAmount, setBillAmount] = useState<string>('1299');

  // Async query states
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Results
  const [lookupResult, setLookupResult] = useState<CustomerLookupResult | null>(null);
  const [customerVouchers, setCustomerVouchers] = useState<CouponIssuance[]>([]);
  const [redemptionResult, setRedemptionResult] = useState<RedeemCouponResult | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<CouponIssuance[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Phone normalization
  const normalizedPhone = useMemo(() => {
    const digits = phoneInput.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }, [phoneInput]);

  const isValidPhone = normalizedPhone.length === 10;

  // Active coupon definition from store
  const targetCouponDef = useMemo(() => {
    const clean = couponCode.trim().toUpperCase();
    return coupons.find(c => c.code.toUpperCase() === clean) || null;
  }, [coupons, couponCode]);

  // Load shift history on mount
  useEffect(() => {
    fetchRecentRedemptions();
  }, []);

  const fetchRecentRedemptions = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('coupon_issuances')
        .select('*')
        .eq('status', 'REDEEMED')
        .order('redeemed_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentRedemptions(data as CouponIssuance[]);
      }
    } catch (e) {
      console.error('Error fetching recent redemptions:', e);
    }
  };

  // 1. Customer & Voucher Lookup
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidPhone) {
      showToast('Please enter a valid 10-digit customer mobile number', 'error');
      return;
    }

    setIsLookingUp(true);
    setRedemptionResult(null);

    try {
      if (!supabase) {
        showToast('Supabase client not connected', 'error');
        return;
      }

      // Parallel fetch: Customer Profile RPC + Active Coupon Issuances
      const [customerRes, vouchersRes] = await Promise.all([
        supabase.rpc('lookup_customer_by_phone', { phone_input: normalizedPhone }),
        supabase
          .from('coupon_issuances')
          .select('*')
          .eq('phone_normalized', normalizedPhone)
          .order('issued_at', { ascending: false })
      ]);

      if (customerRes.data) {
        setLookupResult(customerRes.data as CustomerLookupResult);
      } else {
        setLookupResult({ found: false, reason: 'not_found' });
      }

      if (vouchersRes.data) {
        setCustomerVouchers(vouchersRes.data as CouponIssuance[]);
      } else {
        setCustomerVouchers([]);
      }

      setHasSearched(true);
      showToast('Customer data & vouchers loaded');
    } catch (err: any) {
      console.error('Lookup failed:', err);
      showToast('Error looking up customer: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Bill calculations
  const parsedBill = parseFloat(billAmount) || 0;
  const minRequiredOrder = targetCouponDef?.minOrderValue ?? 999;
  const isThresholdMet = parsedBill >= minRequiredOrder;
  const discountValue = targetCouponDef?.discountType === 'PERCENT'
    ? Math.round((parsedBill * (targetCouponDef.value || 0)) / 100)
    : (targetCouponDef?.value ?? 200);
  const netPayable = Math.max(0, parsedBill - (isThresholdMet ? discountValue : 0));

  // Determine current voucher status
  const matchingIssuance = customerVouchers.find(
    v => v.coupon_code.toUpperCase() === couponCode.trim().toUpperCase()
  );
  const isAlreadyRedeemed = matchingIssuance?.status === 'REDEEMED' || Boolean(matchingIssuance?.redeemed_at);

  // 2. Atomic Redemption Action
  const handleRedeem = async () => {
    if (!isValidPhone) {
      showToast('Invalid customer phone number', 'error');
      return;
    }
    if (!couponCode.trim()) {
      showToast('Enter valid coupon code', 'error');
      return;
    }
    if (!isThresholdMet) {
      showToast(`Bill amount must be at least ₹${minRequiredOrder} to redeem this voucher`, 'error');
      return;
    }

    setIsRedeeming(true);

    try {
      if (!supabase) {
        showToast('Supabase client not connected', 'error');
        return;
      }

      const { data, error } = await supabase.rpc('redeem_in_store_coupon', {
        p_phone: normalizedPhone,
        p_coupon_code: couponCode.trim().toUpperCase(),
        p_cashier_id: cashierIdentifier
      });

      if (error) {
        const failure: RedeemCouponResult = {
          success: false,
          error: error.code || 'rpc_error',
          message: error.message || 'Redemption request failed'
        };
        setRedemptionResult(failure);
        showToast(failure.message, 'error');
        return;
      }

      const res = data as RedeemCouponResult;
      setRedemptionResult(res);

      if (res.success) {
        showToast(`Voucher ${res.coupon_code} redeemed successfully! Applied ₹${res.discount_value} OFF`, 'success');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        // Refresh vouchers & recent redemptions
        fetchRecentRedemptions();
        // Re-query issuances
        const { data: updatedVouchers } = await supabase
          .from('coupon_issuances')
          .select('*')
          .eq('phone_normalized', normalizedPhone);
        if (updatedVouchers) setCustomerVouchers(updatedVouchers as CouponIssuance[]);
      } else {
        showToast(res.message || 'Coupon cannot be redeemed', 'error');
      }
    } catch (err: any) {
      console.error('Redeem exception:', err);
      showToast('Redemption transaction failed', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleResetForNextCustomer = () => {
    setPhoneInput('');
    setCouponCode('SBS20');
    setBillAmount('1299');
    setLookupResult(null);
    setCustomerVouchers([]);
    setRedemptionResult(null);
    setHasSearched(false);
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00A859] to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 leading-tight">In-Store Cashier Redemption Desk</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Live Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atomic in-store voucher verification, double-redemption blocking & digital audit logging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Cashier Terminal</span>
            <span className="text-xs font-black text-slate-800 font-mono">{cashierIdentifier}</span>
          </div>
          <button
            onClick={handleResetForNextCustomer}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            Next Customer
          </button>
        </div>
      </div>

      {/* 2. Main Cashier Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleLookup} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Receipt className="w-4 h-4 text-[#F95721]" />
              <span>Step 1: Enter Customer & Voucher Details</span>
            </h2>

            {/* Customer Mobile Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="98298 77766"
                  maxLength={14}
                  className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#F95721] focus:outline-hidden transition-all"
                  required
                />
                {isValidPhone && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Normalized to canonical 10-digit Indian mobile format: {normalizedPhone || '—'}
              </p>
            </div>

            {/* Coupon Code Input & Quick Picker */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Coupon Voucher Code *
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick Pick:</span>
                  <button
                    type="button"
                    onClick={() => setCouponCode('SBS20')}
                    className="px-2 py-0.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#F95721] text-[10px] font-black font-mono transition-colors"
                  >
                    SBS20 (₹200 OFF)
                  </button>
                </div>
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="SBS20"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-[#F95721] font-mono uppercase focus:bg-white focus:border-[#F95721] focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Bill Amount Input for Counter Calculation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Register Gross Bill Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="1299"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#F95721] focus:outline-hidden transition-all"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1.5 px-1">
                <span className="text-slate-400">
                  Required Minimum Order: <strong className="text-slate-700">₹{minRequiredOrder}</strong>
                </span>
                <span className={`font-bold ${isThresholdMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isThresholdMet ? '✓ Minimum Order Met' : `⚠️ Add ₹${minRequiredOrder - parsedBill} more to qualify`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={isLookingUp || !isValidPhone}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isLookingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Profile & Vouchers...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lookup Customer & Vouchers</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Customer Profile Result Card */}
          {hasSearched && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 animate-slideUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verified Customer Identity
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  lookupResult?.found ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {lookupResult?.found ? `Found in ${lookupResult.source}` : 'New In-Store Walk-in'}
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {lookupResult?.customer?.name || 'Walk-In Customer'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    +91 {normalizedPhone}
                  </p>
                </div>
                {lookupResult?.customer?.reward_points !== undefined && (
                  <div className="ml-auto text-right bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-800 block uppercase">Loyalty Points</span>
                    <span className="text-xs font-black text-amber-900">{lookupResult.customer.reward_points} pts</span>
                  </div>
                )}
              </div>

              {lookupResult?.order_summary && lookupResult.order_summary.total_orders > 0 && (
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Order History:</span>
                    <span>{lookupResult.order_summary.total_orders} lifetime order(s)</span>
                  </div>
                  {lookupResult.order_summary.recent_order && (
                    <p className="text-[11px] text-slate-500">
                      Recent: Order #{lookupResult.order_summary.recent_order.order_number} (₹{lookupResult.order_summary.recent_order.total}) • {lookupResult.order_summary.recent_order.status}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Voucher Card & Bill Calculation */}
        <div className="lg:col-span-5 space-y-4">
          {/* Bill Calculation Box */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Counter Bill Summary</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Register Subtotal:</span>
                <span className="font-bold text-slate-900 font-mono">₹{parsedBill.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[#00A859] font-bold">
                <span>Voucher Discount ({couponCode}):</span>
                <span className="font-mono">
                  {isThresholdMet ? `-₹${discountValue.toFixed(2)}` : '₹0.00'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Net Payable at Cash Counter:</span>
                <span className="text-base text-emerald-600 font-mono">₹{netPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Voucher Card Inspection */}
            <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200/80 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#F95721] font-mono tracking-wider">
                  {couponCode}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  isAlreadyRedeemed 
                    ? 'bg-red-100 text-red-700' 
                    : matchingIssuance 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAlreadyRedeemed 
                    ? 'ALREADY REDEEMED' 
                    : matchingIssuance 
                    ? 'CLAIMED & ACTIVE' 
                    : 'VALID IN-STORE OFFER'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {targetCouponDef?.title || 'In-Store Walk-In Welcome Voucher'}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Flat ₹{targetCouponDef?.value || 200} OFF on billing above ₹{minRequiredOrder}. One-time per customer.
              </p>
              {matchingIssuance?.issued_at && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <Clock className="w-3 h-3" />
                  <span>Claimed: {new Date(matchingIssuance.issued_at).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Primary Atomic Redemption Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRedeem}
                disabled={isRedeeming || isAlreadyRedeemed || !isThresholdMet || !isValidPhone}
                className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
                  isAlreadyRedeemed
                    ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                    : !isThresholdMet
                    ? 'bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200'
                    : 'bg-[#00A859] hover:bg-[#008f4c] text-white shadow-emerald-500/20'
                }`}
              >
                {isRedeeming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Atomic Lock & Redemption...</span>
                  </>
                ) : isAlreadyRedeemed ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Blocked: Voucher Already Redeemed</span>
                  </>
                ) : !isThresholdMet ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Minimum ₹{minRequiredOrder} Required</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Redeem Voucher (₹{discountValue} OFF)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback: Success Confirmation Card */}
          {redemptionResult && redemptionResult.success && (
            <div className="bg-emerald-50 border-2 border-emerald-500/50 rounded-3xl p-5 text-emerald-950 space-y-3 shadow-lg shadow-emerald-500/10 animate-slideUp">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <h4 className="font-black text-sm uppercase tracking-wide">
                  Voucher Redeemed Successfully!
                </h4>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher:</span>
                  <span className="font-bold text-[#F95721]">{redemptionResult.coupon_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Applied:</span>
                  <span className="font-bold text-emerald-600">₹{redemptionResult.discount_value} OFF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Redeemed At:</span>
                  <span>{new Date(redemptionResult.redeemed_at).toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier ID:</span>
                  <span className="truncate max-w-[150px]">{redemptionResult.redeemed_by_cashier}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`SBS Store Redemption: ${redemptionResult.coupon_code} - ₹${redemptionResult.discount_value} OFF - Phone: ${redemptionResult.phone} - Cashier: ${redemptionResult.redeemed_by_cashier}`);
                    showToast('Redemption summary copied to clipboard');
                  }}
                  className="flex-1 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForNextCustomer}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Next Customer</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback: Already Redeemed Warning Card */}
          {((redemptionResult && !redemptionResult.success && redemptionResult.error === 'already_redeemed') || isAlreadyRedeemed) && (
            <div className="bg-red-50 border-2 border-red-500/50 rounded-3xl p-5 text-red-950 space-y-3 shadow-lg shadow-red-500/10 animate-slideUp">
              <div className="flex items-center gap-2.5 text-red-600">
                <XCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-black text-sm uppercase tracking-wide">
                  Voucher Already Redeemed
                </h4>
              </div>

              <p className="text-xs text-red-800 leading-relaxed">
                This coupon code was previously claimed and redeemed for customer phone <strong>+91 {normalizedPhone}</strong>. Per-customer usage limit is 1. Double redemption is strictly prohibited.
              </p>

              {(matchingIssuance?.redeemed_at || (redemptionResult && !redemptionResult.success && redemptionResult.redeemed_at)) && (
                <div className="bg-white/90 rounded-2xl p-3 text-xs space-y-1 font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Redemption Date:</span>
                    <strong>{new Date(matchingIssuance?.redeemed_at || (redemptionResult as any)?.redeemed_at).toLocaleDateString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Redemption Time:</span>
                    <strong>{new Date(matchingIssuance?.redeemed_at || (redemptionResult as any)?.redeemed_at).toLocaleTimeString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed By:</span>
                    <strong className="truncate max-w-[150px]">{matchingIssuance?.redeemed_by_cashier || (redemptionResult as any)?.redeemed_by_cashier || 'cashier'}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Recent Shift Redemptions Audit Log */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Recent Counter Redemptions (Shift Audit Log)
            </h3>
          </div>
          <button
            onClick={fetchRecentRedemptions}
            className="text-[10px] text-[#F95721] hover:underline font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Log</span>
          </button>
        </div>

        {recentRedemptions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No in-store redemptions recorded in current session yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Customer Phone</th>
                  <th className="py-2.5 px-3">Coupon</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRedemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {r.redeemed_at ? new Date(r.redeemed_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      +91 {r.phone_normalized ? `${r.phone_normalized.slice(0, 5)} ****${r.phone_normalized.slice(-2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-black text-[#F95721]">
                      {r.coupon_code}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">
                      ₹{r.discount_applied || r.discount_value} OFF
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                      {r.redeemed_by_cashier || 'desk_1'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                        Redeemed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
