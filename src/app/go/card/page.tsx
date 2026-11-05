'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageCircle, ArrowRight, Sparkles, Contact, CheckCircle, Phone } from 'lucide-react';

const WABA_URL =
  'https://wa.me/919829877766?text=' +
  encodeURIComponent('Hi SBS, connecting from your business card! [ref:biz_card]');

export default function BusinessCardRedirectPage() {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // 1. Log QR scan event asynchronously to Supabase
    async function recordScan() {
      try {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

        await supabase.from('qr_scans').insert({
          code: 'card',
          campaign: 'biz_card',
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-amber-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-orange-100/80 rounded-3xl p-8 shadow-xl shadow-orange-900/5 text-center relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Store Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F95721] to-[#FF6B35] flex items-center justify-center shadow-lg shadow-orange-500/25 mb-6 text-white relative">
          <MessageCircle className="w-10 h-10 fill-current text-white" />
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold mb-3">
          <Contact className="w-3.5 h-3.5 text-orange-700" />
          Shyam Bombay Sale • Official Business Card
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connecting to WhatsApp...
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Opening WhatsApp to connect directly with{' '}
          <span className="font-semibold text-[#F95721]">Shyam Bombay Sale</span> for inquiries, catalog, or support.
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F95721] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F95721] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F95721] animate-bounce" />
        </div>

        {/* Manual CTA Button in case auto-redirect is blocked by in-app browser */}
        <a
          href={WABA_URL}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F95721] to-[#FF6B35] hover:opacity-95 active:scale-[0.98] text-white font-medium text-base shadow-lg shadow-orange-500/25 transition-all duration-200"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Open WhatsApp Now</span>
          <ArrowRight className="w-4 h-4" />
        </a>

        <p className="text-xs text-gray-400 mt-4">
          Subhanpura, Vadodara • +91 98298 77766 • sbsstore.in
        </p>

        {tracked && (
          <div className="mt-4 inline-flex items-center gap-1 text-[11px] text-gray-400">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Card scan verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
