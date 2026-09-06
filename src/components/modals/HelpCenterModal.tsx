'use client';

import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Clock, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Orders & Delivery',
    question: 'How fast does SBS Store deliver my order?',
    answer: 'Orders in Maharashtra typically arrive within 1-2 business days. Across other regions in India, standard delivery takes 3-5 business days. You will receive live tracking updates via WhatsApp and SMS.'
  },
  {
    category: 'Orders & Delivery',
    question: 'How can I track my shipment?',
    answer: 'Go to your Profile tab and tap "My Orders", or check the tracking link sent to your registered mobile number and WhatsApp once your package is dispatched.'
  },
  {
    category: 'Payments & Pricing',
    question: 'What payment methods are supported?',
    answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), debit & credit cards, net banking, and Cash on Delivery (COD) for eligible pin codes.'
  },
  {
    category: 'Returns & Replacements',
    question: 'What is your return & replacement policy?',
    answer: 'We provide a 7-day hassle-free replacement guarantee for damaged, defective, or incorrect items. Just message us on WhatsApp with a short photo or video of the product.'
  },
  {
    category: 'SBS Rewards',
    question: 'How do SBS Rewards points work?',
    answer: 'You earn points on purchases and for enabling notifications. Once you reach 100 points, you can instantly redeem ₹50 OFF directly at checkout!'
  },
  {
    category: 'Store Visit',
    question: 'Can I visit and purchase directly at the SBS physical store?',
    answer: 'Yes! You are always welcome to visit our physical showroom to browse products in person. See the Store Location section below for full directions.'
  }
];

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">Help Center & Support</h2>
              <p className="text-[11px] text-gray-500">We&apos;re here to assist you 7 days a week</p>
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
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp Direct Support */}
            <a
              href="https://wa.me/919226294797?text=Hi%20SBS%20Store%2C%20I%20need%20assistance%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 active:scale-98 transition-all group shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 mb-2 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-emerald-950">Chat on WhatsApp</span>
              <span className="text-[10px] text-emerald-700 font-mono mt-0.5">+91 9226294797</span>
              <span className="text-[9px] font-bold uppercase text-emerald-600 bg-white/80 px-2 py-0.5 rounded-full mt-1.5">
                Fast Response
              </span>
            </a>

            {/* Direct Phone Call */}
            <a
              href="tel:+919226294797"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 active:scale-98 transition-all group shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#F95721] text-white flex items-center justify-center shadow-md shadow-orange-200 mb-2 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-orange-950">Call Customer Care</span>
              <span className="text-[10px] text-orange-700 font-mono mt-0.5">+91 9226294797</span>
              <span className="text-[9px] font-bold uppercase text-orange-600 bg-white/80 px-2 py-0.5 rounded-full mt-1.5">
                10 AM - 9 PM
              </span>
            </a>
          </div>

          {/* Physical Store Location Card (Issue 11) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-400/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Shyam Bombay Sale Store</h3>
                  <p className="text-[11px] text-slate-300">Visit our retail outlet in person</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Open Daily
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-white/5 rounded-2xl p-3 border border-white/10">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Shyam Bombay Sale, Near Main Market, Maharashtra, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Mon – Sun: 10:00 AM – 9:30 PM</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-mono">+91 9226294797</span>
              </p>
            </div>

            {/* Google Maps Directions Action Button */}
            <a
              href="https://maps.app.goo.gl/hnJ14BEoCfZR9bN27"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-98 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Support FAQs Accordion */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#F95721] uppercase tracking-wider block">
                          {faq.category}
                        </span>
                        <span className="text-xs font-bold text-gray-900 mt-0.5 block">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#F95721]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-0 text-xs text-gray-600 leading-relaxed animate-fadeIn">
                        <p className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 text-center text-[11px] text-gray-500">
          SBS Store • Authentic Quality Products • Need special assistance? Call +91 9226294797
        </div>
      </div>
    </div>
  );
};
