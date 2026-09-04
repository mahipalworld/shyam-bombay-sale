'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  showIOSGuide: boolean;
  setShowIOSGuide: (show: boolean) => void;
  triggerInstall: () => Promise<'installed' | 'dismissed' | 'ios' | 'unsupported'>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if running in standalone PWA window
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSSafari = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios|opios/.test(userAgent);
    setIsIOS(isIOSSafari);

    // 3. Register Service Worker on root mount and force check for update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update().catch(() => {});
          console.log('SBS Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.log('SBS Service Worker registration error:', err);
        });
    }

    // 4. Capture beforeinstallprompt event as early as possible
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__sbs_deferred_prompt = promptEvent;
    };

    // Check if already captured earlier
    if ((window as any).__sbs_deferred_prompt) {
      setDeferredPrompt((window as any).__sbs_deferred_prompt);
    }

    // 5. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__sbs_deferred_prompt = null;
      setShowIOSGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<'installed' | 'dismissed' | 'ios' | 'unsupported'> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__sbs_deferred_prompt : null);

    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choiceResult = await promptToUse.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') (window as any).__sbs_deferred_prompt = null;
          return 'installed';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        return 'unsupported';
      }
    } else if (isIOS && !isStandalone) {
      setShowIOSGuide(true);
      return 'ios';
    } else {
      return 'unsupported';
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: Boolean(deferredPrompt) || (isIOS && !isStandalone),
        isInstalled: isInstalled || isStandalone,
        isStandalone,
        isIOS,
        showIOSGuide,
        setShowIOSGuide,
        triggerInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
