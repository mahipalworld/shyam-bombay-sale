'use client';

import { useState, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/mediaStorage';

export function useMediaUrl(keyOrUrl?: string): { url: string; isLoading: boolean } {
  const isDirect = !keyOrUrl || 
    keyOrUrl.startsWith('http://') || 
    keyOrUrl.startsWith('https://') || 
    keyOrUrl.startsWith('/') || 
    keyOrUrl.startsWith('data:');

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

    resolveMediaUrl(keyOrUrl).then((resolved) => {
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
