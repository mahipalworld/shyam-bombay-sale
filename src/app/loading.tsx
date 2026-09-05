import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center max-w-xs w-full text-center space-y-5">
        {/* SBS Official Logo */}
        <div className="relative flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png?v=3"
            alt="SBS Store"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm animate-pulse"
          />
        </div>

        {/* STORE typography */}
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-widest text-gray-900 uppercase">
            STORE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F95721] animate-ping" />
        </div>

        {/* Subtle animated loading progress bar */}
        <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#F95721] to-amber-400 rounded-full w-1/2"
            style={{
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          />
        </div>

        <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
          Smart Products • Better Prices
        </p>
      </div>
    </div>
  );
}
