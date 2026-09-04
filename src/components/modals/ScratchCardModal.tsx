'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { triggerConfetti } from '@/utils/confetti';
import { X, Sparkles, Check, Gift, Copy, ArrowRight } from 'lucide-react';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ isOpen, onClose }) => {
  const { scratchConfig, storeSettings, applyCoupon, showToast, setActiveTab } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastCheckTime = useRef(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic discount code from Admin StoreContext
  const couponData = {
    code: scratchConfig?.code || 'SBS150',
    title: scratchConfig?.title || 'Flat ₹150 OFF',
    description: scratchConfig?.description || 'Valid on all orders above ₹499',
    discountAmount: scratchConfig?.discountAmount || 150,
  };

  const isEnabled = storeSettings?.enableScratchCard !== false && scratchConfig?.enabled !== false;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 280;
      const height = rect.height || 150;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 to prevent excessive memory on mobile

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Draw holographic silver/gold scratch foil
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#E5E7EB');
      gradient.addColorStop(0.3, '#D1D5DB');
      gradient.addColorStop(0.5, '#F3F4F6');
      gradient.addColorStop(0.7, '#9CA3AF');
      gradient.addColorStop(1, '#D1D5DB');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add playful text pattern & shimmer particles
      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ SCRATCH WITH FINGER OR MOUSE ✨', width / 2, 60);
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText('🎁 Mystery Discount Inside', width / 2, 85);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setCopied(false);
      return;
    }

    const timer = setTimeout(() => {
      initCanvas();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, initCanvas]);

  const checkScratchPercentage = () => {
    if (isRevealed) return;
    const now = performance.now();
    // Throttle calculation to max once every 120ms to prevent CPU freeze on mobile
    if (now - lastCheckTime.current < 120) return;
    lastCheckTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      if (canvas.width <= 0 || canvas.height <= 0) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentCount = 0;
      let sampledCount = 0;

      // Sample every 32nd pixel (stride = 128 bytes) for ultra-fast, non-blocking check
      for (let i = 3; i < pixels.length; i += 128) {
        sampledCount++;
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }

      if (sampledCount > 0) {
        const percentage = (transparentCount / sampledCount) * 100;
        if (percentage > 35) {
          setIsRevealed(true);
          try {
            triggerConfetti();
          } catch { }
          showToast(`🎉 Surprise Discount Unlocked: ${couponData.code}!`);
        }
      }
    } catch {
      // If canvas security or getImageData is restricted, allow simple scratch reveal
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2, false);
      ctx.fill();

      checkScratchPercentage();
    } catch {
      // Safe fallback
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDrawing.current = true;
    if (e.touches && e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current || !e.touches || !e.touches[0]) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleApplyCoupon = () => {
    try {
      applyCoupon(couponData.code);
    } catch { }

    try {
      triggerConfetti();
    } catch { }

    onClose();
    setActiveTab('cart');
  };

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(couponData.code);
      }
    } catch { }
    setCopied(true);
    showToast('Code copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !isEnabled) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-5 md:p-6 shadow-2xl relative overflow-hidden border border-orange-100 flex flex-col items-center text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Close */}
        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F95721] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mystery Reward</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1 relative z-10">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            Scratch & Win Discount!
          </h3>
          <p className="text-xs text-gray-500">
            Scratch the foil card below to uncover your exclusive savings
          </p>
        </div>

        {/* Scratch Card Container */}
        <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden border-2 border-dashed border-orange-200 bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFEAD9] flex flex-col items-center justify-center p-4 shadow-inner select-none cursor-pointer">
          {/* Underneath Revealed Content */}
          <div className="space-y-1.5 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-[#F95721] text-white flex items-center justify-center shadow-xs">
              <Gift className="w-4 h-4" />
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-[#F95721] tracking-tight">
              {couponData.title}
            </h4>
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-xl border border-orange-200/80 shadow-2xs">
              <span className="font-mono text-sm font-black text-gray-800 tracking-wider">
                {couponData.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-gray-500 hover:text-[#F95721] transition-colors p-0.5"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">{couponData.description}</p>
          </div>

          {/* Canvas Foil Overlay */}
          {!isRevealed && (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-crosshair rounded-2xl touch-none"
            />
          )}
        </div>

        {/* Action Button */}
        <div className="w-full relative z-10 pt-1">
          {isRevealed ? (
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-float active:scale-95 transition-all"
            >
              <span>Apply Code & Go to Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsRevealed(true);
                try {
                  triggerConfetti();
                } catch { }
              }}
              className="text-xs font-bold text-gray-400 hover:text-[#F95721] transition-colors underline"
            >
              Skip scratch and reveal code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
