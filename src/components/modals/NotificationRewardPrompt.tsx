'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  BellRing, 
  Sparkles, 
  X, 
  Coins, 
  CheckCircle2, 
  TrendingDown, 
  Truck, 
  Gift, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getNotificationPermissionState } from '@/utils/pushNotifications';

/**
 * 1. Embedded Card: Shown on Profile & Home views (just like the Install SBS App card)
 */
export const NotificationRewardCard: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'full' }) => {
  const { isNotificationRewardClaimed, claimNotificationReward, user } = useStore();
  const [permission, setPermission] = useState<string>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNotificationPermissionState().then(setPermission);
  }, [isNotificationRewardClaimed]);

  const isClaimedOrGranted = isNotificationRewardClaimed || permission === 'granted';

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimNotificationReward();
      const newPerm = await getNotificationPermissionState();
      setPermission(newPerm);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`rounded-2xl p-3.5 border transition-all ${
        isClaimedOrGranted
          ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border-emerald-200'
          : 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-orange-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
              isClaimedOrGranted ? 'bg-emerald-100 text-emerald-600' : 'bg-gradient-to-br from-[#F95721] to-[#FF7A3D] text-white'
            }`}>
              {isClaimedOrGranted ? <CheckCircle2 className="w-5 h-5" /> : <BellRing className="w-5 h-5 animate-bounce" />}
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-black text-gray-900 leading-tight flex items-center gap-1.5">
                <span>{isClaimedOrGranted ? 'Notifications & VIP Alerts Active' : 'Enable Alerts & Get 250 Points'}</span>
                {!isClaimedOrGranted && (
                  <span className="px-1.5 py-0.5 bg-amber-400/90 text-amber-950 font-black text-[9px] rounded-md flex items-center gap-0.5">
                    <Coins className="w-2.5 h-2.5" /> +250 Pts
                  </span>
                )}
              </h5>
              <p className="text-[10px] text-gray-600 truncate mt-0.5">
                {isClaimedOrGranted ? 'You receive live price drop alerts on your device.' : 'Get real-time flash sales, order tracking & 250 reward points.'}
              </p>
            </div>
          </div>

          {!isClaimedOrGranted ? (
            <button
              onClick={handleClaim}
              disabled={loading}
              className="px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-[11px] font-black rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
            >
              <Coins className="w-3 h-3 text-amber-300" />
              <span>{loading ? 'Enabling...' : 'Claim 250 Pts'}</span>
            </button>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full whitespace-nowrap flex-shrink-0">
              ✓ Active
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-4.5 border transition-all ${
      isClaimedOrGranted 
        ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-emerald-200/80 shadow-xs'
        : 'bg-gradient-to-br from-[#FFF5EE] via-white to-[#FFF0E6] border-[#FEDDC7] shadow-subtle'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
            isClaimedOrGranted 
              ? 'bg-emerald-100 text-[#00A859]' 
              : 'bg-gradient-to-br from-[#F95721] to-[#FF7A3D] text-white'
          }`}>
            {isClaimedOrGranted ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5px]" />
            ) : (
              <BellRing className="w-6 h-6 stroke-[2.2px] animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
                {isClaimedOrGranted ? '✓ On-Device Notifications Active' : '🔔 Enable Notifications & Claim 250 Points'}
              </h4>
              {!isClaimedOrGranted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-[10px] rounded-full shadow-xs">
                  <Coins className="w-3 h-3 text-amber-950" />
                  +250 Free Points
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-snug">
              {isClaimedOrGranted 
                ? 'Your device is registered for instant flash deal drops, price cuts, and live shipment tracking.'
                : 'Turn on notifications to get instant price drop alerts, secret flash sales, and claim 250 SBS reward points in your wallet.'}
            </p>
          </div>
        </div>

        {!isClaimedOrGranted ? (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#F95721] to-[#FF6F3D] hover:from-[#E44813] hover:to-[#F95721] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs hover:shadow-float active:scale-95 transition-all flex-shrink-0"
          >
            <Coins className="w-4 h-4 text-amber-200" />
            <span className="whitespace-nowrap">{loading ? 'Activating...' : 'Enable & Claim 250 Pts'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-emerald-100 text-[#00A859] text-[11px] font-extrabold rounded-xl whitespace-nowrap flex-shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VIP Alerts Active</span>
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * 2. High-Converting Pop-up Modal / Bottom Sheet Prompt
 */
export const NotificationRewardModal: React.FC = () => {
  const { 
    isNotificationRewardClaimed, 
    isNotificationPromptOpen, 
    setIsNotificationPromptOpen, 
    claimNotificationReward 
  } = useStore();

  const [loading, setLoading] = useState(false);
  const isGranted = (typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'granted') || (typeof window !== 'undefined' && localStorage.getItem('sbs_notif_reward_claimed') === 'true');

  if (!isNotificationPromptOpen || isNotificationRewardClaimed || isGranted) return null;

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimNotificationReward();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsNotificationPromptOpen(false);
    try {
      localStorage.setItem('sbs_notif_prompt_dismissed_at', Date.now().toString());
    } catch { }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-orange-100 animate-scale-in">
        {/* Top Header Background Banner */}
        <div className="relative bg-gradient-to-br from-[#F95721] via-[#FF6F3D] to-[#E44813] p-6 text-white text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-amber-400/20 rounded-full translate-y-6 -translate-x-6 blur-lg pointer-events-none" />

          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner mb-3.5 relative">
            <BellRing className="w-8 h-8 text-white animate-bounce" />
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full shadow-md flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> 250 Pts
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight leading-tight">
            Get Instant Updates & Claim 250 Points!
          </h3>
          <p className="text-xs text-white/90 font-medium mt-1">
            Never miss price drops, flash sales & live delivery updates
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-orange-50/70 border border-orange-100">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center flex-shrink-0 font-black">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">+250 SBS Reward Points</p>
              <p className="text-[11px] text-gray-600">Instantly credited to your wallet to save on checkout.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Flash Price Drop Alerts</p>
              <p className="text-[11px] text-gray-600">Get pinged the second hot items drop below 50% price.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Live Delivery Updates</p>
              <p className="text-[11px] text-gray-600">Real-time status when your order is out for delivery.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#F95721] to-[#FF6F3D] hover:from-[#E44813] hover:to-[#F95721] text-white font-extrabold text-sm rounded-2xl shadow-float active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Activating Alerts...' : 'Turn On & Claim 250 Points 🚀'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors text-center"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
