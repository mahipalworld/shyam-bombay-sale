'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageCircle, ArrowRight, Sparkles, Store, CheckCircle } from 'lucide-react';

const WABA_URL =
  'https://wa.me/919829877766?text=' +
  encodeURIComponent('Hi SBS, I am visiting your retail store! [ref:store_walkin]');

export default function WalkinRedirectPage() {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // 1. Log QR scan event asynchronously to Supabase
    async function recordScan() {
      try {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

        await supabase.from('qr_scans').insert({
          code: 'walkin',
          campaign: 'store_walkin',
          user_agent: userAgent,
          referrer: referrer,
          device_type: isMobile ? 'mobile' : 'desktop',
        });
        setTracked(true);
      } catch (err) {
        console.warn('QR scan logging notice:', err);
      }
    }

    recordScan();

    // 2. Perform instant redirect after short delay to ensure event dispatch
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.replace(WABA_URL);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-orange-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-amber-100/80 rounded-3xl p-8 shadow-xl shadow-amber-900/5 text-center relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Store Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6 text-white relative">
          <MessageCircle className="w-10 h-10 fill-current text-white" />
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
          <Store className="w-3.5 h-3.5 text-amber-700" />
          Shyam Bombay Sale • In-Store Visit
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connecting to WhatsApp...
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Opening WhatsApp to claim your exclusive{' '}
          <span className="font-semibold text-emerald-700">₹20 in-store voucher</span> on Shyam Bombay Sale assistant.
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
        </div>

        {/* Manual CTA Button in case auto-redirect is blocked by in-app browser */}
        <a
          href={WABA_URL}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-medium text-base shadow-lg shadow-emerald-600/25 transition-all duration-200"
        >
          <span>Open WhatsApp Now</span>
          <ArrowRight className="w-4 h-4" />
        </a>

        <p className="text-xs text-gray-400 mt-4">
          If WhatsApp does not open automatically, tap the button above.
        </p>

        {tracked && (
          <div className="mt-4 inline-flex items-center gap-1 text-[11px] text-gray-400">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Store visit verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
