'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { X } from 'lucide-react';

export const FloatingWhatsAppWidget: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { cart, activeTab, isCheckoutOpen } = useStore();

  useEffect(() => {
    // Show welcoming prompt after 2.5 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!dismissed) {
        setShowTooltip(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Hide in Admin view or during active full checkout flow
  if (activeTab === 'admin' || isCheckoutOpen) {
    return null;
  }

  // Check if docked quick-cart or mobile checkout bar is active at the bottom
  const isMobileBarActive =
    (cart.length > 0 && !['cart', 'admin', 'categories', 'profile'].includes(activeTab)) ||
    (activeTab === 'cart' && cart.length > 0);

  // Casual pre-filled inquiry message
  const casualMessage =
    'Hey SBS! 👋 I was browsing your website and had a quick question, can you help me out? [ref:web_floating]';

  const whatsappUrl = `https://wa.me/919829877766?text=${encodeURIComponent(casualMessage)}`;

  return (
    <div
      className={`fixed ${
        isMobileBarActive
          ? 'bottom-[140px] right-3.5 sm:bottom-6 sm:right-6'
          : 'bottom-20 right-3.5 sm:bottom-6 sm:right-6'
      } z-40 flex flex-col items-end pointer-events-auto transition-all duration-300 ease-in-out`}
    >
      {/* Friendly Speech Tooltip Bubble */}
      {showTooltip && !dismissed && (
        <div className="mb-2 bg-white/95 backdrop-blur-md text-gray-800 text-xs py-2 px-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-emerald-100 flex items-center gap-2.5 max-w-[260px] animate-slideUp">
          {/* Pulsing Green Online Indicator */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>

          <div className="leading-tight text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 text-[12px]">Need help?</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Online
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">Chat with us 👋</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
              setDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 ml-0.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Dismiss WhatsApp prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SBS Store on WhatsApp"
        className="group relative flex items-center justify-center w-[52px] h-[52px] sm:w-14 sm:h-14 bg-gradient-to-tr from-[#1EBE5D] to-[#25D366] hover:from-[#17a852] hover:to-[#22c35e] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.42)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Soft Radiating Radar Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 blur-xs pointer-events-none" />

        {/* Crisp Official Multi-Layer Vector WhatsApp Icon */}
        <svg
          className="relative w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White Speech Bubble with Tail */}
          <path
            fill="#FFFFFF"
            d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.656.77 5.132 2.1 7.225L2.5 29.5l6.475-2.05A13.432 13.432 0 0016 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5z"
          />
          {/* Sharp WhatsApp Green Handset */}
          <path
            fill="#25D366"
            d="M22.05 19.35c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.16-.16.35-.41.53-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.89-1.08-2.59-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.61.09-.93.44-.32.35-1.22 1.19-1.22 2.91s1.25 3.38 1.42 3.61c.18.23 2.46 3.76 5.96 5.27.83.36 1.48.57 1.99.73.84.27 1.6.23 2.2.14.67-.1 2.07-.85 2.36-1.66.29-.82.29-1.52.2-1.66-.09-.15-.32-.23-.67-.41z"
          />
        </svg>
      </a>
    </div>
  );
};
