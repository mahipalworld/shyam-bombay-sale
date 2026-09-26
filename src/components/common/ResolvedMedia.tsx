'use client';

import React from 'react';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  priority?: boolean;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({ 
  src, 
  alt = '', 
  className, 
  priority = false,
  loading,
  fetchPriority,
  ...props 
}) => {
  const { url, isLoading } = useMediaUrl(src);
  const [hasError, setHasError] = React.useState(false);
  const [fallbackSrc, setFallbackSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    setHasError(false);
    setFallbackSrc(null);
  }, [src, url]);

  const isS3Key = Boolean(
    src &&
    !src.startsWith('/') &&
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('data:') && (
      src.includes('products/images/') || 
      src.includes('products/videos/') || 
      src.includes('products/thumbnails/') ||
      src.startsWith('products/') ||
      src.startsWith('categories/') ||
      src.startsWith('banners/')
    )
  );

  const activeSrc = fallbackSrc || url || (!isS3Key ? src : '');

  const isSbsBrand = Boolean(
    (alt && alt.toLowerCase().includes('sbs')) || 
    (src && src.toLowerCase().includes('sbs'))
  );

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);

  const setImgRef = React.useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setIsImageLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsImageLoaded(true);
    }
  }, [activeSrc]);

  if (hasError || !activeSrc) {
    if (isSbsBrand) {
      return (
        <div className={`w-full h-full flex items-center justify-center p-1 bg-orange-50/80 rounded-lg select-none ${className || ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png?v=3"
            alt="SBS Store"
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-orange-50/60 rounded-lg p-1 text-center select-none overflow-hidden ${className || ''}`}
        style={{ mixBlendMode: 'normal' }}
      >
        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-white shadow-2xs flex items-center justify-center text-[#F95721] flex-shrink-0">
          <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
    );
  }

  const computedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const computedFetchPriority = fetchPriority ?? (priority ? 'high' : undefined);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Skeleton Shimmer Loader shown while image is loading */}
      {!isImageLoaded && !hasError && (
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-r from-gray-100 via-gray-200/50 to-gray-100 animate-pulse rounded-lg pointer-events-none" 
          aria-hidden="true"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={setImgRef}
        src={activeSrc}
        alt={alt}
        onLoad={() => setIsImageLoaded(true)}
        onError={() => {
          if (!fallbackSrc && activeSrc.endsWith('.webp')) {
            setFallbackSrc(activeSrc.replace(/\.webp$/, '.png'));
          } else if (isSbsBrand && !fallbackSrc) {
            setFallbackSrc('/logo.png?v=3');
          } else {
            setHasError(true);
          }
        }}
        className={`relative z-10 transition-opacity duration-300 ${className || ''}`}
        loading={computedLoading}
        fetchPriority={computedFetchPriority}
        decoding="async"
        {...props}
      />
    </div>
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
