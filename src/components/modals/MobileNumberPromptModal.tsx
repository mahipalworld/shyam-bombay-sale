'use client';

import React, { useState } from 'react';
import { Phone, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, X, MessageSquare, Truck, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export const MobileNumberPromptModal: React.FC = () => {
  const { isPhonePromptOpen, authUser, savePhoneNumber, dismissPhonePrompt } = useAuth();
  const { showToast } = useStore();

  const [digits, setDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPhonePromptOpen || !authUser) return null;

  // Sanitize and handle phone input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    let val = e.target.value;

    // Remove non-digit characters
    let clean = val.replace(/\D/g, '');

    // If user pasted with 91 country code, strip it
    if (clean.length === 12 && clean.startsWith('91')) {
      clean = clean.slice(2);
    } else if (clean.length === 11 && clean.startsWith('0')) {
      clean = clean.slice(1);
    }

    // Limit to 10 digits
    clean = clean.slice(0, 10);
    setDigits(clean);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^[6-9]/.test(digits)) {
      setError('Indian mobile numbers should start with 6, 7, 8, or 9');
      return;
    }

    setLoading(true);
    const fullPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    const { error: err } = await savePhoneNumber(fullPhone);

    setLoading(false);
    if (err) {
      setError(err || 'Failed to save mobile number. Please try again.');
    } else {
      showToast('Mobile number added successfully! Welcome to SBS Store.');
    }
  };

  const formattedDisplay = digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={dismissPhonePrompt}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-orange-100">
        
        {/* Close / Dismiss */}
        <button
          onClick={dismissPhonePrompt}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Skip for now"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="bg-gradient-to-br from-[#F35C16] via-[#EA580C] to-[#C2410C] px-6 pt-7 pb-8 text-white relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-orange-200" />
              <span>1-Step Profile Setup</span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight">
            Add Your Mobile Number
          </h2>
          <p className="text-orange-100 text-xs md:text-sm mt-1.5 leading-relaxed">
            Welcome, <span className="font-bold text-white">{authUser.name || 'Shopper'}</span>! Link your mobile for fast order delivery updates & SMS tracking.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 -mt-3 bg-white rounded-t-3xl relative">

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="flex flex-col items-center text-center p-2.5 bg-orange-50/60 rounded-2xl border border-orange-100/60">
              <Truck className="w-4 h-4 text-[#F35C16] mb-1" />
              <span className="text-[10px] font-bold text-gray-800 leading-tight">Order Tracking</span>
              <span className="text-[9px] text-gray-500">Live SMS status</span>
            </div>
            <div className="flex flex-col items-center text-center p-2.5 bg-green-50/60 rounded-2xl border border-green-100/60">
              <MessageSquare className="w-4 h-4 text-[#00A859] mb-1" />
              <span className="text-[10px] font-bold text-gray-800 leading-tight">WhatsApp Alerts</span>
              <span className="text-[9px] text-gray-500">Instant dispatch info</span>
            </div>
            <div className="flex flex-col items-center text-center p-2.5 bg-amber-50/60 rounded-2xl border border-amber-100/60">
              <Gift className="w-4 h-4 text-[#D97706] mb-1" />
              <span className="text-[10px] font-bold text-gray-800 leading-tight">250 Points</span>
              <span className="text-[9px] text-gray-500">Welcome bonus</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} noValidate className="space-y-4">
            
            {/* Phone Input with locked +91 */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Mobile Number <span className="text-[#F35C16]">*</span>
              </label>
              
              <div className="relative flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#F35C16] focus-within:ring-4 focus-within:ring-[#F35C16]/10 transition-all bg-gray-50/70 focus-within:bg-white overflow-hidden shadow-xs">
                
                {/* Locked +91 India Badge */}
                <div className="flex items-center gap-1.5 px-3.5 py-3 bg-gray-100/90 border-r border-gray-200 select-none shrink-0">
                  <span className="text-base" role="img" aria-label="India Flag">🇮🇳</span>
                  <span className="text-xs font-extrabold text-gray-800 tracking-tight">+91</span>
                </div>

                {/* Number Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder="9876543210"
                  value={digits}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-3 text-sm md:text-base font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal tracking-wider"
                  maxLength={10}
                />

                {/* 10 Digits Checkmark */}
                {digits.length === 10 && /^[6-9]/.test(digits) && (
                  <div className="pr-3 text-green-600 animate-in zoom-in-50">
                    <CheckCircle2 className="w-5 h-5 fill-green-100" />
                  </div>
                )}
              </div>

              {/* Helper/Error */}
              {error ? (
                <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                  <span>⚠️ {error}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-between">
                  <span>Enter 10-digit Indian mobile number</span>
                  <span className="font-semibold text-gray-500">{digits.length}/10</span>
                </p>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading || digits.length < 10}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#F35C16] to-[#e04a08] hover:from-[#e04a08] hover:to-[#c83e05] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving details...</span>
                </span>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Skip for now */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={dismissPhonePrompt}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                I&apos;ll add this later
              </button>
            </div>

          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>Your number is secure & only used for order communication.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
