'use client';

import React from 'react';

export const SkeletonProductCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col justify-between shadow-subtle animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full rounded-xl bg-gray-100 mb-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
      </div>

      {/* Info Skeletons */}
      <div className="space-y-2 mt-1">
        {/* Title line 1 & 2 */}
        <div className="h-3.5 bg-gray-100 rounded-md w-4/5" />
        <div className="h-3 bg-gray-100 rounded-md w-3/5" />

        {/* Rating */}
        <div className="h-3 bg-gray-100 rounded-md w-1/3 mt-1" />

        {/* Price row */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 bg-gray-100 rounded-md w-16" />
          <div className="h-3 bg-gray-100 rounded-md w-10" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-9 w-full bg-gray-100 rounded-xl mt-3" />
    </div>
  );
};
