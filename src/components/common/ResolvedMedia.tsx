'use client';

import React from 'react';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({ src, alt = '', className, ...props }) => {
  const { url, isLoading } = useMediaUrl(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src, url]);

  const isS3Key = Boolean(
    src && (
      src.includes('products/images/') || 
      src.includes('products/videos/') || 
      src.includes('products/thumbnails/') ||
      src.startsWith('products/')
    )
  );

  const targetSrc = url || (!isS3Key ? src : '');

  if (hasError || !targetSrc) {
    return (
      <div 
        className={`w-full h-full min-h-[90px] flex flex-col items-center justify-center bg-orange-50/60 rounded-xl p-2 text-center select-none ${className || ''}`}
        style={{ mixBlendMode: 'normal' }}
      >
        <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#F95721] mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <span className="text-[10px] font-black text-gray-700 leading-tight">SBS Store</span>
        <span className="text-[8px] font-bold text-[#F95721] uppercase tracking-wider">Quality Assured</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={targetSrc}
      alt={alt}
      onError={() => {
        setHasError(true);
      }}
      className={`${className || ''} ${isLoading ? 'opacity-70 blur-2xs' : 'opacity-100 transition-opacity duration-200'}`}
      loading="lazy"
      {...props}
    />
  );
};

interface ResolvedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export const ResolvedVideo = React.forwardRef<HTMLVideoElement, ResolvedVideoProps>(
  ({ src, className, ...props }, ref) => {
    const { url } = useMediaUrl(src);

    if (!url && !src) return null;

    return (
      <video
        ref={ref}
        src={url || src}
        className={className}
        playsInline
        {...props}
      />
    );
  }
);
ResolvedVideo.displayName = 'ResolvedVideo';
