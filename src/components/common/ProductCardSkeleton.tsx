'use client';

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 flex flex-col justify-between shadow-subtle animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full rounded-xl bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200/50 to-gray-100 animate-pulse" />
      </div>

      {/* Details Skeleton */}
      <div className="mt-2.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Title 2-line placeholder */}
          <div className="h-3.5 bg-gray-200/80 rounded-md w-full" />
          <div className="h-3.5 bg-gray-150 rounded-md w-3/4" />
          
          {/* Verified badge placeholder */}
          <div className="h-2.5 bg-gray-100 rounded w-1/3 mt-1" />
          
          {/* Price placeholder */}
          <div className="h-4 bg-gray-200 rounded-md w-1/2 mt-1.5" />
        </div>

        {/* Add button placeholder */}
        <div className="h-8 sm:h-9 bg-gray-100 rounded-xl w-full mt-2" />
      </div>
    </div>
  );
};
