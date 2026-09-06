'use client';

import React from 'react';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({ src, alt = '', className, ...props }) => {
  const { url, isLoading } = useMediaUrl(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url || src}
      alt={alt}
      className={`${className || ''} ${isLoading ? 'opacity-70 blur-2xs' : 'opacity-100 transition-opacity duration-200'}`}
      loading="lazy"
      {...props}
    />
  );
};

interface ResolvedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export const ResolvedVideo: React.FC<ResolvedVideoProps> = ({ src, className, ...props }) => {
  const { url } = useMediaUrl(src);

  if (!url && !src) return null;

  return (
    <video
      src={url || src}
      className={className}
      playsInline
      {...props}
    />
  );
};
