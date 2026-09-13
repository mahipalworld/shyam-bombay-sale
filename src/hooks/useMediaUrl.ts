'use client';

import { useState, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/mediaStorage';

function isS3Key(str?: string): boolean {
  if (!str) return false;
  const clean = str.startsWith('/') ? str.slice(1) : str;
  return clean.startsWith('products/images/') || 
         clean.startsWith('products/videos/') || 
         clean.startsWith('products/thumbnails/') ||
         clean.startsWith('products/');
}

export function useMediaUrl(keyOrUrl?: string): { url: string; isLoading: boolean } {
  const isS3 = isS3Key(keyOrUrl);
  const isDirect = !keyOrUrl || (!isS3 && (
    keyOrUrl.startsWith('http://') || 
    keyOrUrl.startsWith('https://') || 
    keyOrUrl.startsWith('/') || 
    keyOrUrl.startsWith('data:')
  ));

  const [url, setUrl] = useState<string>(isDirect ? (keyOrUrl || '') : '');
  const [isLoading, setIsLoading] = useState<boolean>(!isDirect);

  useEffect(() => {
    if (!keyOrUrl) {
      setUrl('');
      setIsLoading(false);
      return;
    }

    if (isDirect) {
      setUrl(keyOrUrl);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const cleanKey = keyOrUrl.startsWith('/') ? keyOrUrl.slice(1) : keyOrUrl;
    resolveMediaUrl(cleanKey).then((resolved) => {
      if (isMounted) {
        setUrl(resolved);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [keyOrUrl, isDirect]);

  return { url, isLoading };
}
