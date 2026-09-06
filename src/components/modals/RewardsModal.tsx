'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  Award, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  CheckCircle2, 
  ShoppingBag,
  Bell
} from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const { user, storeSettings, rewardTransactions, setActiveTab } = useStore();

  if (!isOpen) return null;

  const points = user.rewardPoints || 0;
  const threshold = storeSettings.rewardPointsThreshold || 100;
  const discountAmount = storeSettings.rewardDiscountAmount || 50;
  const progressPct = Math.min(100, Math.round((points / threshold) * 100));
  const isRedeemable = points >= threshold;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">SBS Rewards Club</h2>
              <p className="text-[11px] text-gray-500">Earn points on every action & redeem for cash OFF</p>
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

        <div className="p-5 space-y-5">
          {/* Main Points Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-[#F95721] p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-100 bg-white/20 px-2 py-0.5 rounded-full">
                  Available Balance
                </span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-4xl font-black tracking-tight">{points}</span>
                  <span className="text-sm font-bold text-orange-100">Points</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Redemption Progress Bar */}
            <div className="mt-4 pt-3 border-t border-white/20 relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Next Milestone: {threshold} pts</span>
                <span>₹{discountAmount} OFF</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-orange-100 pt-0.5">
                {isRedeemable 
                  ? `🎉 You have unlocked ₹${discountAmount} OFF! Apply at checkout.`
                  : `Earn ${Math.max(0, threshold - points)} more points to unlock ₹${discountAmount} discount at checkout.`
                }
              </p>
            </div>
          </div>

          {/* How to Earn Points Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Ways to Earn Points
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-3 space-y-1">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">Shop Catalog</h4>
                <p className="text-[10px] text-gray-600 leading-snug">
                  Earn 5% of order value back in points on every delivery.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 space-y-1">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">Enable Alerts</h4>
                <p className="text-[10px] text-gray-600 leading-snug">
                  Get instant 250 bonus points for enabling device notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Points Transaction History */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Points History ({rewardTransactions.length})
              </h3>
              <span className="text-[10px] text-gray-400">Database Synced</span>
            </div>

            {rewardTransactions.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center space-y-1 bg-gray-50/50">
                <Gift className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-700">No points activity yet</p>
                <p className="text-[10px] text-gray-400">
                  Place an order or enable notifications to start earning SBS rewards!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs max-h-64 overflow-y-auto">
                {rewardTransactions.map((tx) => {
                  const isPositive = tx.points > 0;
                  return (
                    <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isPositive 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isPositive ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        isPositive 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {isPositive ? `+${tx.points}` : tx.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
          <span className="text-[10px] text-gray-500 font-medium">100 Points = ₹50 Instant Checkout Discount</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveTab('home');
            }}
            className="px-4 py-2 bg-[#F95721] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E44813] transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};
