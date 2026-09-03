'use client';

/**
 * Robust Web Push & Browser Notifications Engine for SBS Store
 */

export async function getNotificationPermissionState(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    url?: string;
    action?: string;
  };
}

export interface PushNotificationResult {
  success: boolean;
  permission: NotificationPermission | 'unsupported';
  method?: 'service_worker' | 'window_notification' | 'none';
  error?: string;
}

export async function triggerBrowserPushNotification(
  payload: PushNotificationPayload
): Promise<PushNotificationResult> {
  if (typeof window === 'undefined') {
    return { success: false, permission: 'unsupported', error: 'Window undefined' };
  }

  if (!('Notification' in window)) {
    console.warn('SBS Notifications: Notification API not supported in this browser.');
    return { success: false, permission: 'unsupported', error: 'Notification API unsupported' };
  }

  let currentPermission = Notification.permission;

  // If permission is default (not yet prompted), request it
  if (currentPermission === 'default') {
    try {
      currentPermission = await Notification.requestPermission();
    } catch {
      currentPermission = 'denied';
    }
  }

  if (currentPermission !== 'granted') {
    console.warn(`SBS Notifications: Notification permission is ${currentPermission}`);
    return { success: false, permission: currentPermission, error: `Permission is ${currentPermission}` };
  }

  const defaultIcon = '/icon-192x192.png';
  const defaultBadge = '/icon.svg';

  const notificationOptions: any = {
    body: payload.body,
    icon: payload.icon || defaultIcon,
    badge: payload.badge || defaultBadge,
    tag: payload.tag || `sbs-notif-${Date.now()}`,
    data: payload.data || { url: '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
  };

  if (payload.image) {
    notificationOptions.image = payload.image;
  }

  // 1. Attempt Service Worker showNotification (Best for PWAs, Android Chrome & Background tabs)
  if ('serviceWorker' in navigator) {
    try {
      // Use timeout race so we don't hang if SW is installing or not ready
      const swReadyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
      const registration = await Promise.race([swReadyPromise, timeoutPromise]);

      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(payload.title, notificationOptions);
        return { success: true, permission: 'granted', method: 'service_worker' };
      }
    } catch (swErr) {
      console.warn('SBS Notifications: Service Worker showNotification failed, falling back to window.Notification', swErr);
    }
  }

  // 2. Direct window.Notification Fallback (Desktop Chrome, Firefox, Edge, Safari)
  try {
    const notif = new Notification(payload.title, notificationOptions);
    notif.onclick = (e) => {
      e.preventDefault();
      window.focus();
      const targetUrl = payload.data?.url || '/';
      if (targetUrl && targetUrl !== '/') {
        window.location.href = targetUrl;
      }
      notif.close();
    };
    return { success: true, permission: 'granted', method: 'window_notification' };
  } catch (winErr: any) {
    console.error('SBS Notifications: Direct Notification error:', winErr);
    return { success: false, permission: 'granted', error: winErr?.message || 'Failed to display notification' };
  }
}
