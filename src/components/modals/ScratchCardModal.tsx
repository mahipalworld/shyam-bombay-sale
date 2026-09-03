'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic discount code from Admin StoreContext
  const couponData = {
    code: scratchConfig?.code || 'SBS150',
    title: scratchConfig?.title || 'Flat ₹150 OFF',
    description: scratchConfig?.description || 'Valid on all orders above ₹499',
    discountAmount: scratchConfig?.discountAmount || 150,
  };

  if (!isOpen || storeSettings.enableScratchCard === false || scratchConfig?.enabled === false) {
    return null;
  }

  useEffect(() => {
    if (!isOpen) {
      setIsRevealed(false);
      setCopied(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 300) * dpr;
    canvas.height = (rect.height || 160) * dpr;
    ctx.scale(dpr, dpr);

    // Draw holographic silver/gold scratch foil
    const gradient = ctx.createLinearGradient(0, 0, rect.width || 300, rect.height || 160);
    gradient.addColorStop(0, '#E5E7EB');
    gradient.addColorStop(0.3, '#D1D5DB');
    gradient.addColorStop(0.5, '#F3F4F6');
    gradient.addColorStop(0.7, '#9CA3AF');
    gradient.addColorStop(1, '#D1D5DB');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width || 300, rect.height || 160);

    // Add playful text pattern & shimmer particles
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER / MOUSE ✨', (rect.width || 300) / 2, 65);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('🎁 Mystery Discount Inside', (rect.width || 300) / 2, 95);
  }, [isOpen]);

  const checkScratchPercentage = () => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    if (percentage > 40) {
      setIsRevealed(true);
      triggerConfetti();
      showToast('🎉 Surprise Discount Unlocked: SBS150!');
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    checkScratchPercentage();
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
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current || !e.touches[0]) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleApplyCoupon = () => {
    applyCoupon(couponData.code);
    triggerConfetti();
    onClose();
    setActiveTab('cart');
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(couponData.code);
    setCopied(true);
    showToast('Code copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

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
        <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-orange-200 bg-gradient-to-br from-[#FFF5EE] via-[#FFF0E6] to-[#FFEAD9] flex flex-col items-center justify-center p-4 shadow-inner select-none cursor-pointer">
          {/* Underneath Revealed Content */}
          <div className="space-y-1.5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#F95721] text-white flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <h4 className="text-2xl font-black text-[#F95721] tracking-tight">
              {couponData.title}
            </h4>
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-xl border border-orange-200/80 shadow-2xs">
              <span className="font-mono text-sm font-black text-gray-800 tracking-wider">
                {couponData.code}
              </span>
              <button
                onClick={handleCopy}
                className="text-gray-500 hover:text-[#F95721] transition-colors"
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
              onClick={handleApplyCoupon}
              className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-float active:scale-95 transition-all"
            >
              <span>Apply Code & Go to Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsRevealed(true);
                triggerConfetti();
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
