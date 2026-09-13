'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

interface PincodeCheckerProps {
  onPincodeVerified?: (pincode: string, deliveryDate: string) => void;
}

export const PincodeChecker: React.FC<PincodeCheckerProps> = ({ onPincodeVerified }) => {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified' | 'invalid'>('idle');
  const [deliveryInfo, setDeliveryInfo] = useState<{ date: string; isCod: boolean } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sbs_delivery_pincode');
      if (cached && /^[1-9][0-9]{5}$/.test(cached)) {
        setPincode(cached);
        calculateDelivery(cached);
      }
    }
  }, []);

  const calculateDelivery = (code: string) => {
    const daysToAdd = (parseInt(code.charAt(0), 10) % 3) + 3; // 3 to 5 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    const dateFormatted = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const info = {
      date: dateFormatted,
      isCod: true,
    };
    setDeliveryInfo(info);
    setStatus('verified');
    if (onPincodeVerified) {
      onPincodeVerified(code, dateFormatted);
    }
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setStatus('invalid');
      setDeliveryInfo(null);
      return;
    }

    setStatus('checking');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sbs_delivery_pincode', cleanPin);
      }
      calculateDelivery(cleanPin);
    }, 400);
  };

  const handleReset = () => {
    setStatus('idle');
    setDeliveryInfo(null);
  };

  return (
    <div className="bg-orange-50/40 border border-orange-200/80 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-gray-900">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#F95721]" />
          <span>Delivery Options & Pincode</span>
        </div>
        {status === 'verified' && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-extrabold text-[#F95721] hover:underline"
          >
            Change
          </button>
        )}
      </div>

      {status !== 'verified' ? (
        <form onSubmit={handleCheck} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPincode(val);
                if (status === 'invalid') setStatus('idle');
              }}
              placeholder="Enter 6-digit Pincode"
              className={`w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border outline-none transition-all ${
                status === 'invalid'
                  ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-200 focus:border-[#F95721] focus:ring-1 focus:ring-orange-200'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={pincode.length < 6 || status === 'checking'}
            className="px-4 py-2 bg-[#F95721] hover:bg-[#E44813] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
          >
            {status === 'checking' ? 'Checking...' : 'Check'}
          </button>
        </form>
      ) : (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Truck className="w-4 h-4 text-[#00A859]" />
            <span>
              Delivery by <span className="text-[#00A859] font-extrabold">{deliveryInfo?.date}</span>
            </span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-100 text-[#00A859]">
              FREE
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium pl-6">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />
              Cash on Delivery Available
            </span>
            <span>•</span>
            <span>Express Courier</span>
          </div>
        </div>
      )}

      {status === 'invalid' && (
        <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Please enter a valid 6-digit Indian pincode.
        </p>
      )}
    </div>
  );
};
