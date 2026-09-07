'use client';

import React from 'react';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({ src, alt = '', className, ...props }) => {
  const { url, isLoading } = useMediaUrl(src);
  const [hasError, setHasError] = React.useState(false);

  const fallbackSrc = '/icon-192x192.png?v=2';
  const effectiveSrc = hasError ? fallbackSrc : (url || src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      alt={alt}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={`${className || ''} ${isLoading ? 'opacity-70 blur-2xs' : 'opacity-100 transition-opacity duration-200'} ${hasError ? 'p-2 opacity-80' : ''}`}
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
