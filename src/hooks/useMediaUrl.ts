'use client';

import { useState, useEffect } from 'react';
import { S3_DIRECT_MEDIA_BASE_URL } from '@/lib/mediaStorage';

function isS3Key(str?: string): boolean {
  if (!str) return false;
  const clean = str.startsWith('/') ? str.slice(1) : str;
  return clean.startsWith('products/images/') || 
         clean.startsWith('products/videos/') || 
         clean.startsWith('products/thumbnails/') ||
         clean.startsWith('products/') ||
         clean.startsWith('categories/') ||
         clean.startsWith('banners/');
}

export function computeDirectMediaUrl(keyOrUrl?: string): string {
  if (!keyOrUrl) return '';
  if (
    keyOrUrl.startsWith('http://') ||
    keyOrUrl.startsWith('https://') ||
    keyOrUrl.startsWith('/') ||
    keyOrUrl.startsWith('data:')
  ) {
    return keyOrUrl;
  }

  const cleanKey = keyOrUrl.startsWith('/') ? keyOrUrl.slice(1) : keyOrUrl;
  const cfDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
  if (cfDomain) {
    return `https://${cfDomain}/${cleanKey}`;
  }

  return `${S3_DIRECT_MEDIA_BASE_URL}/${cleanKey}`;
}

export function useMediaUrl(keyOrUrl?: string): { url: string; isLoading: boolean } {
  const [url, setUrl] = useState<string>(() => computeDirectMediaUrl(keyOrUrl));

  useEffect(() => {
    setUrl(computeDirectMediaUrl(keyOrUrl));
  }, [keyOrUrl]);

  return { url, isLoading: false };
}

