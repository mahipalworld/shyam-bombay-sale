'use client';

/**
 * Utility for managing Web Push & Browser Notifications for SBS Store
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
    console.error('Error requesting notification permission', err);
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

export async function triggerBrowserPushNotification(payload: PushNotificationPayload) {
  if (typeof window === 'undefined') return;

  const defaultIcon = '/icon-192x192.png';
  const defaultBadge = '/icon.svg';

  const notificationOptions: NotificationOptions & { image?: string } = {
    body: payload.body,
    icon: payload.icon || defaultIcon,
    badge: payload.badge || defaultBadge,
    image: payload.image,
    tag: payload.tag || `sbs-notif-${Date.now()}`,
    data: payload.data || { url: '/' },
    requireInteraction: false,
    silent: false,
  };

  // If Service Worker is ready, use registration.showNotification (recommended for PWAs & Android)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(payload.title, notificationOptions);
        return;
      }
    } catch {
      // fallback to window.Notification
    }
  }

  // Fallback to standard window.Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(payload.title, notificationOptions);
      notif.onclick = () => {
        window.focus();
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        notif.close();
      };
    } catch {
      // Ignored if window notifications not supported in environment
    }
  }
}
