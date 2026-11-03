'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { X, Ticket, Copy, Check, Store, MapPin } from 'lucide-react';

export const CouponsModal: React.FC = () => {
  const { coupons, isCouponsOpen, setIsCouponsOpen, applyCoupon, showToast } = useStore();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!isCouponsOpen) return null;

  const handleApplyOnline = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (applyCoupon(code)) {
      showToast(`Coupon ${code} applied! 🏷️`);
    }
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInStoreCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`In-Store voucher ${code} copied! Present at Shyam Bombay Sale, Subhanpura to redeem.`);
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
          {coupons.map((coupon) => {
            const isStoreOnly = (coupon.channelApplicability || coupon.channel) === 'PHYSICAL_STORE_ONLY';

            return (
              <div
                key={coupon.id}
                className={`border rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-subtle ${
                  isStoreOnly
                    ? 'bg-gradient-to-r from-purple-50/70 to-indigo-50/60 border-purple-200'
                    : 'bg-gradient-to-r from-[#F2FBF6] to-[#EAF8F1] border-[#A7E3BC]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-extrabold tracking-wider font-mono ${
                        isStoreOnly ? 'text-purple-700' : 'text-[#00A859]'
                      }`}>
                        {coupon.code}
                      </span>
                      {isStoreOnly && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          In-Store Only • Subhanpura
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 mt-1">
                      {coupon.title}
                    </h3>
                  </div>

                  {isStoreOnly ? (
                    <button
                      onClick={() => handleInStoreCopy(coupon.code)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5" />
                          <span>Save Code</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyOnline(coupon.code)}
                      className="px-3 py-1.5 bg-[#00A859] hover:bg-[#00914c] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
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
                  )}
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {coupon.description}
                </p>

                {isStoreOnly && (
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-800 bg-white/80 p-2 rounded-xl border border-purple-200/60 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Redeem at Shyam Bombay Sale, Subhanpura, Vadodara cash counter</span>
                  </div>
                )}

                <div className={`pt-2 border-t flex justify-between text-[10px] font-medium ${
                  isStoreOnly ? 'border-purple-200/60 text-purple-900/70' : 'border-green-200/60 text-gray-500'
                }`}>
                  <span>Min. order ₹{coupon.minOrderValue}</span>
                  <span>Valid till {coupon.expiresAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
