'use client';

import React from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  ExternalLink,
  HelpCircle,
  Navigation,
  Sparkles
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Verified Google Maps place details resolved from https://maps.app.goo.gl/hnJ14BEoCfZR9bN27
  const STORE_NAME = 'Shyam Bombay sale';
  const VERIFIED_ADDRESS = 'Gotri, Vadodara, Gujarat 390016, India';
  const MAPS_SHORT_URL = 'https://maps.app.goo.gl/hnJ14BEoCfZR9bN27';
  const MAPS_EMBED_URL = 'https://maps.google.com/maps?q=22.3286672,73.1419469&hl=en&z=17&output=embed';
  const STORE_PHONE = '+91 92262 94797';
  const WHATSAPP_LINK = 'https://wa.me/919226294797?text=Hi%20SBS%20Store%2C%20I%20need%20assistance%20with%20my%20order.';

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn overflow-x-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col relative no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">Help Center</h2>
              <p className="text-[11px] text-gray-500">Need help? We&apos;re here for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          {/* Quick Contact Buttons Row */}
          <div>
            <span className="text-[11px] font-black uppercase text-[#F95721] tracking-wider block mb-2.5">
              Instant Contact Options
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp Direct Support */}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 active:scale-98 transition-all group shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 mb-2 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-emerald-950">WhatsApp</span>
                <span className="text-[10px] text-emerald-700 font-mono mt-0.5">{STORE_PHONE}</span>
                <span className="text-[9px] font-bold uppercase text-emerald-600 bg-white/80 px-2 py-0.5 rounded-full mt-1.5">
                  Fast Chat Support
                </span>
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${STORE_PHONE.replace(/\s+/g, '')}`}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 active:scale-98 transition-all group shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#F95721] text-white flex items-center justify-center shadow-md shadow-orange-200 mb-2 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-orange-950">Direct Call</span>
                <span className="text-[10px] text-orange-700 font-mono mt-0.5">{STORE_PHONE}</span>
                <span className="text-[9px] font-bold uppercase text-orange-600 bg-white/80 px-2 py-0.5 rounded-full mt-1.5">
                  10 AM – 9:30 PM
                </span>
              </a>
            </div>
          </div>

          {/* Physical Store Location Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#F95721] flex items-center justify-center border border-orange-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 leading-tight">Visit SBS Store</h3>
                  <p className="text-[11px] text-gray-500">Retail Outlet & Showroom</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Open Daily
              </span>
            </div>

            {/* Embedded Responsive Google Map */}
            <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
              <iframe
                title="SBS Store Physical Location"
                src={MAPS_EMBED_URL}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Verified Store Address */}
            <div className="space-y-2.5 text-xs text-gray-700 bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F95721] shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-gray-900 block text-xs">{STORE_NAME}</span>
                  <span className="text-gray-600 block text-[11px] mt-0.5">{VERIFIED_ADDRESS}</span>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Coordinates: 22.3286672° N, 73.1419469° E</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-200/60">
                <Clock className="w-4 h-4 text-[#F95721] shrink-0" />
                <span className="text-[11px] text-gray-600">Mon – Sun: 10:00 AM – 9:30 PM</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F95721] shrink-0" />
                <span className="font-mono text-[11px] text-gray-600">{STORE_PHONE}</span>
              </div>
            </div>

            {/* Get Directions Action Button */}
            <a
              href={MAPS_SHORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-98 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Useful Support Information */}
          <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3.5 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-center gap-2 text-orange-950 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F95721]" />
              <span>Order & Replacement Support</span>
            </div>
            <p>
              For replacement requests or questions regarding active orders, reach us on WhatsApp with your order reference number. Our support team responds promptly during working hours.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 text-center text-[11px] text-gray-500">
          SBS Store • Authentic Quality Products • Need assistance? Call {STORE_PHONE}
        </div>
      </div>
    </div>
  );
};
