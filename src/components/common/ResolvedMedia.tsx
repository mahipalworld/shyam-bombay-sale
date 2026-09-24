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

  if (hasError || !activeSrc) {
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt}
      onError={() => {
        if (!fallbackSrc && activeSrc.endsWith('.webp')) {
          setFallbackSrc(activeSrc.replace(/\.webp$/, '.png'));
        } else {
          setHasError(true);
        }
      }}
      className={`${className || ''} ${isLoading ? 'opacity-70 blur-2xs' : 'opacity-100 transition-opacity duration-200'}`}
      loading={computedLoading}
      fetchPriority={computedFetchPriority}
      decoding="async"
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
