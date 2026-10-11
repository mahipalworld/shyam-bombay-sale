'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { triggerConfetti } from '@/utils/confetti';
import { Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { ResolvedImage } from '@/components/common/ResolvedMedia';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  MessageCircle,
  Printer,
  ArrowRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const { orders, storeSettings, setActiveTab } = useStore();
  const { authUser, supabaseUser } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 1. Locate the order from local state or fallback to Supabase query
  useEffect(() => {
    let matchedOrder: Order | undefined;

    if (orderId) {
      matchedOrder = orders.find((o) => o.id === orderId);
    } else if (orderNumber) {
      matchedOrder = orders.find((o) => o.orderNumber === orderNumber);
    }

    if (!matchedOrder && orders.length > 0 && !orderId && !orderNumber) {
      // Pick most recent order if no query param provided
      matchedOrder = orders[0];
    }

    if (matchedOrder) {
      setOrder(matchedOrder);
      setLoading(false);
    } else if (orderId || orderNumber) {
      // Fetch directly from Supabase
      const fetchFromDb = async () => {
        try {
          let query = supabase.from('orders').select('*');
          if (orderId) {
            query = query.eq('id', orderId);
          } else if (orderNumber) {
            query = query.eq('order_number', orderNumber);
          }
          const { data, error } = await query.single();
          if (data && !error) {
            setOrder({
              id: data.id,
              orderNumber: data.order_number,
              createdAt: data.created_at || new Date().toISOString(),
              status: data.status || 'Processing',
              items: data.items || [],
              subtotal: data.subtotal || 0,
              discount: data.discount || 0,
              deliveryCharge: data.delivery_charge || 0,
              total: data.total || 0,
              shippingAddress: data.shipping_address || {},
              paymentMethod: data.payment_method || 'Online Payment',
              paymentStatus: data.payment_status || 'PAYMENT_VERIFIED',
              paymentConfirmedAt: data.payment_confirmed_at,
              whatsappConfirmedAt: data.whatsapp_confirmed_at,
              trackingNumber: data.tracking_number || `TRK-SBS-${Math.floor(100000 + Math.random() * 900000)}`,
              estimatedDelivery: data.estimated_delivery || '3-4 Business Days',
            });
          }
        } catch (e) {
          console.warn('Could not query order from database:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchFromDb();
    } else {
      setLoading(false);
    }
  }, [orderId, orderNumber, orders]);

  // 2. Trigger celebratory confetti on load
  useEffect(() => {
    try {
      triggerConfetti({ particleCount: 160, duration: 3200 });
    } catch {}
  }, []);

  const copyTrackingId = (trk: string) => {
    navigator.clipboard.writeText(trk);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // WhatsApp update deep link
  const rawPhone = (storeSettings?.contactPhone && !storeSettings.contactPhone.includes('99887')) ? storeSettings.contactPhone : '9226294797';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const whatsappMessage = order 
    ? `Hi SBS Team! 👋\n\nI have placed an order on sbsstore.in.\n\nOrder Number: ${order.orderNumber}\nAmount Paid: ₹${order.total.toLocaleString('en-IN')}\nPayment: ${order.paymentMethod}\n\nPlease share dispatch updates and courier tracking for my order. Thank you!`
    : `Hi SBS Team! 👋 I would like tracking updates for my recent order.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#F95721] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700 animate-pulse">Loading order confirmation...</p>
      </div>
    );
  }

  // Fallback if no order found
  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-[#F95721] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Record Not Found</h1>
        <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">
          We could not locate the requested order in this session. Don&apos;t worry, your orders are safely saved in your profile.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-[#F95721] text-white font-extrabold text-sm rounded-2xl shadow-xs hover:bg-[#E44813] transition-all"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const isPrepaid = order.paymentMethod.toLowerCase().includes('online') || 
                    order.paymentMethod.toLowerCase().includes('razorpay') || 
                    order.paymentMethod.toLowerCase().includes('upi') ||
                    order.paymentStatus === 'PAYMENT_VERIFIED';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=3"
              alt="SBS Store — Shyam Bombay Sale"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-sm font-black text-gray-900 group-hover:text-[#F95721] transition-colors tracking-tight">
              SBS STORE
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
              100% Verified Purchase
            </span>
            <Link
              href="/"
              className="text-xs font-bold text-gray-600 hover:text-[#F95721] px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      {/* Main Order Success Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-5">
        
        {/* Celebration Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-orange-100/60 to-transparent blur-2xl pointer-events-none" />

          {/* Animated Celebration Icon */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 text-[#00A859] flex items-center justify-center ring-8 ring-emerald-50/50 animate-bounce duration-1000">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00A859]" />
            Order Placed Successfully
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Thank you, {order.shippingAddress?.name?.split(' ')[0] || 'Valued Shopper'}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
            Your order has been received and registered at our Subhanpura, Vadodara hub. We are packing your items for swift dispatch.
          </p>

          {/* Order Details Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Order ID:</span>
              <span className="text-sm font-black text-gray-900">#{order.orderNumber}</span>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Tracking:</span>
              <span className="text-sm font-black text-[#F95721]">{order.trackingNumber || 'TRK-SBS-PENDING'}</span>
              <button
                onClick={() => copyTrackingId(order.trackingNumber || '')}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                title="Copy Tracking ID"
              >
                {copiedTracking ? <Check className="w-3.5 h-3.5 text-[#00A859]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 border ${
              isPrepaid 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-black">
                {isPrepaid ? '✓ Paid Online (Razorpay)' : '📦 Cash on Delivery (Due)'}
              </span>
            </div>
          </div>

          {/* Action Buttons: WhatsApp Updates & Tax Invoice */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 bg-[#00A859] hover:bg-[#00924e] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get Updates on WhatsApp</span>
            </a>

            <button
              onClick={handlePrintInvoice}
              className="w-full sm:w-auto px-5 py-3 bg-gray-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Pan-India Delivery Stepper */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-black text-gray-900">Delivery Status &amp; Timeline</h2>
              <p className="text-xs text-gray-400 mt-0.5">Estimated Delivery: {order.estimatedDelivery || '3-4 Business Days'}</p>
            </div>
            <span className="text-xs font-bold text-[#00A859] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ⚡ In Progress
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 text-center pt-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-[#00A859] text-white flex items-center justify-center shadow-xs mb-2">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-xs font-black text-gray-900 leading-tight">Order Confirmed</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{orderDate}</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#F95721] flex items-center justify-center border-2 border-[#F95721] mb-2 animate-pulse">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#F95721] leading-tight">Packing &amp; QC</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Vadodara Hub</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center opacity-60">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600 leading-tight">Dispatched</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Express Courier</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center opacity-60">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600 leading-tight">Delivered</span>
              <span className="text-[10px] text-gray-400 mt-0.5">At Your Door</span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Delivery Address & Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Delivery Address</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-1.5 text-xs text-gray-600">
              <p className="font-extrabold text-gray-900 text-sm">
                {order.shippingAddress?.name}
              </p>
              <p className="leading-relaxed">
                {order.shippingAddress?.street}
              </p>
              <p className="font-medium">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="font-bold text-gray-800 pt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F95721]" />
                {order.shippingAddress?.phone}
              </p>
            </div>
            <p className="text-[11px] text-gray-400 italic">
              * Delivery associate will contact you on this number prior to arrival.
            </p>
          </div>

          {/* Payment & Savings Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#00A859] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Payment Details</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Mode</span>
                <span className="font-bold text-gray-900">{order.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Status</span>
                <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  isPrepaid 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isPrepaid ? 'PAYMENT VERIFIED' : 'CASH DUE ON DELIVERY'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200/80">
                <span className="text-gray-900 font-black text-sm">Amount Paid</span>
                <span className="text-base font-black text-[#F95721]">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {isPrepaid && (
              <div className="bg-emerald-50 rounded-2xl p-2.5 flex items-center gap-2 text-emerald-800 text-xs font-bold border border-emerald-100">
                <Zap className="w-4 h-4 text-[#00A859] fill-[#00A859] flex-shrink-0" />
                <span>You saved an extra ₹20 with Instant Online Prepayment!</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Order Breakdown */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">
              Purchased Items ({order.items?.length || 0})
            </h2>
            <span className="text-xs font-bold text-gray-400">Tax Invoice Slip Included</span>
          </div>

          <div className="space-y-2.5">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/80 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <ResolvedImage
                      src={item.image || ''}
                      alt={item.name || ''}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black text-gray-900 flex-shrink-0">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discounts &amp; Offers</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="text-[#00A859] font-black">
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-lg text-[#F95721]">₹{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* SBS Store Guarantee & Support Card */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-5 border border-orange-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
              SBS Store Customer Assurance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100 space-y-1">
              <span className="font-black text-gray-900 block">7-Day Replacement</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Zero hassle exchange for defective or damaged items.
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100 space-y-1">
              <span className="font-black text-gray-900 block">Genuine Quality</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Direct factory sourcing, quality-checked before packing.
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-orange-100 space-y-1">
              <span className="font-black text-gray-900 block">Need Quick Help?</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Call/WhatsApp: <strong className="text-gray-900 font-bold">+91 9226294797</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#F95721] to-[#E44813] text-white font-black text-sm rounded-2xl shadow-float hover:brightness-105 active:scale-98 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping for Essentials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Hidden Printable Invoice Section for Browser Print / PDF Export */}
      <div id="print-invoice-area" className="hidden print:block print:p-8 bg-white text-black font-sans">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-invoice-area, #print-invoice-area * {
              visibility: visible;
            }
            #print-invoice-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
            }
          }
        `}</style>

        <div className="border-b-2 border-gray-900 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight">SHYAM BOMBAY SALE (SBS STORE)</h1>
            <p className="text-xs text-gray-600 mt-1">Subhanpura, Vadodara, Gujarat - 390023</p>
            <p className="text-xs text-gray-600">GSTIN / Official Portal: sbsstore.in | Contact: +91 9226294797</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded">TAX INVOICE</span>
            <p className="text-sm font-black mt-2">Invoice #{order.orderNumber}</p>
            <p className="text-xs text-gray-500">Date: {orderDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div>
            <p className="font-bold uppercase text-gray-500 mb-1">Billed &amp; Shipped To:</p>
            <p className="font-black text-sm">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p className="font-bold mt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase text-gray-500 mb-1">Order Information:</p>
            <p><strong>Tracking ID:</strong> {order.trackingNumber}</p>
            <p><strong>Payment Mode:</strong> {order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus || 'VERIFIED'}</p>
            <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery || '3-4 Business Days'}</p>
          </div>
        </div>

        <table className="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 bg-gray-100">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Item Description</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Price</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2.5 px-3">{index + 1}</td>
                <td className="py-2.5 px-3 font-bold">{item.name}</td>
                <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right">₹{item.price?.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-3 text-right font-bold">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Discounts &amp; Offers:</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping &amp; Delivery:</span>
              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-gray-900 text-sm font-black">
              <span>Total Amount:</span>
              <span>₹{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-500 flex justify-between items-center">
          <div>
            <p>This is a computer-generated invoice and requires no physical signature.</p>
            <p>For support or returns, visit https://www.sbsstore.in or WhatsApp +91 9226294797.</p>
          </div>
          <div className="text-right font-bold text-gray-700">
            <p>Authorized Signatory</p>
            <p className="text-[11px] font-black text-gray-900">SBS Store, Vadodara</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-[#F95721] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-gray-700">Confirming your order...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
