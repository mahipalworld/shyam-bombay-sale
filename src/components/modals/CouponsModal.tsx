'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Ticket, Copy, Check } from 'lucide-react';

export const CouponsModal: React.FC = () => {
  const { coupons, isCouponsOpen, setIsCouponsOpen, applyCoupon, setActiveTab, showToast } = useStore();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!isCouponsOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    showToast(`Coupon ${code} copied & applied! 🏷️`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#00A859]" />
            <h2 className="text-base font-bold text-gray-900">Coupons & Offers</h2>
          </div>
          <button
            onClick={() => setIsCouponsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-gradient-to-r from-[#F2FBF6] to-[#EAF8F1] border border-[#A7E3BC] rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-subtle"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-[#00A859] tracking-wider font-mono">
                    {coupon.code}
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 mt-0.5">
                    {coupon.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="px-3 py-1.5 bg-[#00A859] hover:bg-[#00914c] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-gray-600">
                {coupon.description}
              </p>

              <div className="pt-2 border-t border-green-200/60 flex justify-between text-[10px] text-gray-500 font-medium">
                <span>Min. order ₹{coupon.minOrderValue}</span>
                <span>Valid till {coupon.expiresAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
