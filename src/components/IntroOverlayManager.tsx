'use client';

import { useEffect } from 'react';

export function IntroOverlayManager() {
  useEffect(() => {
    const el = document.getElementById('sbs-intro-overlay');
    if (!el) return;

    if (!document.documentElement.classList.contains('sbs-play-intro')) {
      el.remove();
      return;
    }

    const timer = setTimeout(() => {
      const target = document.getElementById('sbs-intro-overlay');
      if (target) target.remove();
      document.documentElement.classList.remove('sbs-play-intro');
    }, 2050);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
