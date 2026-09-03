'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Sparkles, Check } from 'lucide-react';

interface StoryItem {
  id: string;
  productId: string;
  title: string;
  tag: string;
  thumbnail: string;
  videoImage: string;
  badge: string;
  headline: string;
  bullet1: string;
  bullet2: string;
}

const STORIES_DATA: StoryItem[] = [
  {
    id: 's1',
    productId: 'p1',
    title: 'Mini Washer',
    tag: '10s Demo',
    thumbnail: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1000&auto=format&fit=crop&q=80',
    badge: '🔥 10-Second Quick Clean',
    headline: 'Ultrasonic Turbo Spin Washes Delicate Clothes Fast',
    bullet1: 'Forward & reverse dual rotation eliminates stains',
    bullet2: 'Foldable body packs into any travel bag',
  },
  {
    id: 's2',
    productId: 'p4',
    title: 'Precision Trimmer',
    tag: 'Grooming',
    thumbnail: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=1000&auto=format&fit=crop&q=80',
    badge: '⚡ Zero Cut Titanium Blade',
    headline: 'Cordless Precision Detailer For Hair & Beard',
    bullet1: '120 minutes continuous run on 1 charge',
    bullet2: 'Vintage bronze sculpted grip',
  },
  {
    id: 's3',
    productId: 'p3',
    title: 'Mini Sealer',
    tag: 'Snack Hack',
    thumbnail: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1000&auto=format&fit=crop&q=80',
    badge: '🍿 2-in-1 Seal & Cut',
    headline: 'Airtight Sealing Keeps Chips & Snacks Crispy Forever',
    bullet1: 'Magnetic back sticks to refrigerator door',
    bullet2: 'No pre-heating needed, instant thermal seal',
  },
  {
    id: 's4',
    productId: 'p2',
    title: 'Sunset Lamp',
    tag: 'Mood Light',
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80',
    badge: '✨ Aesthetic Bedroom Glow',
    headline: '16 Million Color Sunset Projection With Remote',
    bullet1: '360° rotatable aluminum halo head',
    bullet2: 'Perfect for photoshoots & evening ambiance',
  },
  {
    id: 's5',
    productId: 'p7',
    title: 'Granite Pan',
    tag: 'Non-Stick',
    thumbnail: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=1000&auto=format&fit=crop&q=80',
    badge: '🍳 Zero Oil Cooking',
    headline: '5-Layer German Granite Coating Frying Pan',
    bullet1: 'Wipes clean in 1 paper napkin swipe',
    bullet2: 'Induction & gas stove compatible base',
  },
  {
    id: 's6',
    productId: 'p8',
    title: 'Spin Mop',
    tag: 'Clean Hack',
    thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80',
    videoImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
    badge: '🧹 360° Effortless Spin',
    headline: 'Microfiber Floor & Ceiling Mop with Squeegee',
    bullet1: 'Picks up fine dust and hair without bending',
    bullet2: 'Extendable telescopic lightweight handle',
  },
];

export const ProductStories: React.FC = () => {
  const { stories, storeSettings, products, addToCart, setSelectedProductDetail } = useStore();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeStories = stories.filter((s) => s.enabled);

  if (storeSettings.enableStories === false || activeStories.length === 0) {
    return null;
  }

  const activeStory = activeStoryIndex !== null ? activeStories[activeStoryIndex] : null;
  const activeProduct = activeStory ? products.find((p) => p.id === activeStory.productId) : null;

  // Auto-progress timer for active story
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    setProgress(0);
    const intervalTime = 50; // update every 50ms
    const totalDuration = 5500; // 5.5s per story
    const step = (intervalTime / totalDuration) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < activeStories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
          }
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeStoryIndex, isPaused, activeStories.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < STORIES_DATA.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
        setProgress(0);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handleStoryAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeProduct) {
      addToCart(activeProduct, 1, e.currentTarget);
    }
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProduct) {
      setActiveStoryIndex(null);
      setSelectedProductDetail(activeProduct);
    }
  };

  return (
    <>
      {/* Horizontal Story Bubble Strip */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 -mx-1 px-1 select-none">
        {activeStories.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => setActiveStoryIndex(idx)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group tap-active focus:outline-none"
          >
            {/* Gradient Ring Outer Frame */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-[#F95721] via-[#F59E0B] to-[#EC4899] shadow-xs group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-50 flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.media}
                  alt={story.title}
                  className="w-full h-full object-contain p-1 mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                />
                {/* Micro play badge */}
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#F95721] text-white flex items-center justify-center text-[8px] font-black shadow-xs">
                  ▶
                </div>
              </div>
            </div>

            {/* Title & Tag */}
            <span className="text-[11px] font-bold text-gray-800 line-clamp-1 max-w-[70px] text-center leading-tight">
              {story.title}
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen Interactive Story Viewer Overlay */}
      {activeStory && (
        <div
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fadeIn"
          onClick={() => setActiveStoryIndex(null)}
        >
          <div
            className="relative w-full max-w-md h-[95vh] sm:h-[90vh] bg-gray-950 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Top Multi-Segment Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
              {activeStories.map((s, i) => (
                <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{
                      width:
                        i < (activeStoryIndex ?? 0)
                          ? '100%'
                          : i === activeStoryIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Header Bar */}
            <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 p-0.5 backdrop-blur-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeStory.media}
                    alt={activeStory.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{activeStory.title}</h4>
                  <span className="text-[10px] text-white/70">{activeStory.tag}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStoryIndex(null)}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Visual Content */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeStory.media}
                alt={activeStory.title}
                className="w-full h-full object-cover brightness-95"
              />

              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Left & Right Tap Zones to navigate */}
              <div
                className="absolute inset-y-16 left-0 w-1/3 cursor-pointer z-20"
                onClick={handlePrev}
              />
              <div
                className="absolute inset-y-16 right-0 w-1/3 cursor-pointer z-20"
                onClick={handleNext}
              />

              {/* Desktop Prev/Next Buttons */}
              {activeStoryIndex !== null && activeStoryIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeStoryIndex !== null && activeStoryIndex < activeStories.length - 1 && (
                <button
                  onClick={handleNext}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Story Info & Action Bar */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-5 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
              {/* Highlight Badge & Headline */}
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F95721] text-white shadow-xs">
                  {activeStory.tag}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {activeStory.subtitle || activeStory.productName}
                </h3>
                <div className="space-y-0.5 text-xs text-white/80">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span>Special Price: ₹{activeStory.price} ({activeStory.discount})</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Row */}
              <div className="flex items-center gap-2 pt-1">
                {activeProduct && (
                  <button
                    onClick={handleStoryAddToCart}
                    className="flex-1 py-3 px-4 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-95 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart — ₹{activeProduct.price}</span>
                  </button>
                )}
                {activeProduct && (
                  <button
                    onClick={handleViewProduct}
                    className="py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl backdrop-blur-xs transition-all"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
