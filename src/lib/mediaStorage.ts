import { S3MediaItem, StorageStatus } from '@/types';
import { supabase } from '@/lib/supabase';

// Secure Render production backend
const PRODUCTION_BACKEND_URL = 'https://sbs-backend-8ryi.onrender.com';

/**
 * Returns the backend API URL dynamically based on current environment and hostname.
 * Automatically routes to the live Render backend on production domains (sbsstore.in, pages.dev).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host.includes('sbsstore.in') ||
      host.includes('pages.dev') ||
      (!host.includes('localhost') && !host.includes('127.0.0.1'))
    ) {
      return PRODUCTION_BACKEND_URL;
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || PRODUCTION_BACKEND_URL).replace(/\/+$/, '');
}

// In-memory cache for resolved delivery URLs (key -> { url, expiresAt })
const deliveryUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Helper to get authorization headers (Supabase Admin JWT if available and X-SBS-Admin-Role)
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    if (supabase) {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const refreshRes = await supabase.auth.refreshSession().catch(() => null);
        if (refreshRes?.data?.session) {
          session = refreshRes.data.session;
        }
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }
  } catch (err) {
    // Ignore auth retrieval error
  }

  if (typeof window !== 'undefined') {
    const adminRole = localStorage.getItem('sbs_admin_role') || 'OWNER';
    headers['X-SBS-Admin-Role'] = adminRole;
  }

  return headers;
}

/**
 * Checks connection health and status of the AWS S3 storage backend
 */
export async function checkStorageStatus(): Promise<StorageStatus> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/storage/status`);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      configured: Boolean(data.configured),
      status: data.status || 'not_configured',
      bucket: data.bucket || '',
      region: data.region || 'ap-south-1',
      cloudfrontEnabled: Boolean(data.cloudfrontEnabled),
      message: data.message || '',
    };
  } catch (err: any) {
    return {
      configured: false,
      status: 'error',
      bucket: 'sbs-store-media-748439418595',
      region: 'ap-south-1',
      message: err.message || 'Cannot reach storage backend',
    };
  }
}

/**
 * Resolves an S3 canonical key or direct URL into a secure delivery URL.
 * Transparently caches signed URLs for 55 minutes.
 */
export async function resolveMediaUrl(keyOrUrl?: string): Promise<string> {
  if (!keyOrUrl) return '';

  // If it's already an absolute or relative static URL (Unsplash, local asset, base64)
  if (
    keyOrUrl.startsWith('http://') ||
    keyOrUrl.startsWith('https://') ||
    keyOrUrl.startsWith('/') ||
    keyOrUrl.startsWith('data:')
  ) {
    return keyOrUrl;
  }

  // Check in-memory cache
  const cached = deliveryUrlCache.get(keyOrUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/storage/delivery-url?key=${encodeURIComponent(keyOrUrl)}`);
    if (!res.ok) {
      return keyOrUrl; // fallback
    }
    const data = await res.json();
    if (data.url) {
      // Cache for 55 minutes (token expires in 60 minutes)
      const expiresAt = Date.now() + (data.expiresIn ? (data.expiresIn - 300) * 1000 : 55 * 60 * 1000);
      deliveryUrlCache.set(keyOrUrl, { url: data.url, expiresAt });
      return data.url;
    }
    return keyOrUrl;
  } catch (err) {
    console.warn('Failed to resolve delivery URL for key:', keyOrUrl);
    return keyOrUrl;
  }
}

/**
 * Batch resolves multiple media keys in a single network request
 */
export async function batchResolveMediaUrls(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const keysToFetch: string[] = [];

  for (const key of keys) {
    if (!key) continue;
    if (
      key.startsWith('http://') ||
      key.startsWith('https://') ||
      key.startsWith('/') ||
      key.startsWith('data:')
    ) {
      result[key] = key;
      continue;
    }

    const cached = deliveryUrlCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      result[key] = cached.url;
    } else {
      keysToFetch.push(key);
    }
  }

  if (keysToFetch.length === 0) {
    return result;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/storage/delivery-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: keysToFetch }),
    });

    if (res.ok) {
      const data = await res.json();
      const resolved = data.urls || {};
      for (const [k, url] of Object.entries(resolved)) {
        const u = url as string;
        result[k] = u;
        deliveryUrlCache.set(k, { url: u, expiresAt: Date.now() + 55 * 60 * 1000 });
      }
    }
  } catch (err) {
    console.error('Batch delivery URLs failed:', err);
  }

  // Ensure every key has at least a fallback
  for (const key of keysToFetch) {
    if (!result[key]) result[key] = key;
  }

  return result;
}

/**
 * Uploads a file directly to AWS S3 using a short-lived presigned PUT URL with progress tracking
 */
export async function uploadMediaToS3(
  file: File,
  category: 'images' | 'videos' | 'thumbnails' = 'images',
  onProgress?: (percent: number) => void
): Promise<{ key: string; url: string }> {
  // 1. Validate file size & MIME
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    throw new Error('Unsupported file format. Please upload JPEG, PNG, WebP, AVIF, MP4, WebM, or MOV.');
  }

  if (isImage && file.size > 15 * 1024 * 1024) {
    throw new Error('Image exceeds 15MB limit. Please compress or choose a smaller file.');
  }

  if (isVideo && file.size > 250 * 1024 * 1024) {
    throw new Error('Video exceeds 250MB limit.');
  }

  // 2. Request short-lived presigned URL from secure backend
  const headers = await getAuthHeaders();
  const presignRes = await fetch(`${getApiBaseUrl()}/api/storage/presigned-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
    }),
  });

  if (!presignRes.ok) {
    const errorData = await presignRes.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get upload authorization (HTTP ${presignRes.status})`);
  }

  const { uploadUrl, key } = await presignRes.json();

  // 3. Direct streaming PUT to AWS S3 with percentage progress
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}. Please verify CORS or network.`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during direct S3 upload.'));
    xhr.onabort = () => reject(new Error('Upload aborted.'));

    xhr.send(file);
  });

  // 4. Resolve delivery URL and cache
  const deliveryUrl = await resolveMediaUrl(key);
  return { key, url: deliveryUrl };
}

/**
 * Lists S3 media files for the Admin Media Library
 */
export async function listS3Files(prefix: string = 'products/'): Promise<{
  items: S3MediaItem[];
  count: number;
  bucket: string;
  region: string;
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/api/storage/files?prefix=${encodeURIComponent(prefix)}`, {
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to list files (HTTP ${res.status})`);
  }

  const data = await res.json();
  return {
    items: data.items || [],
    count: data.count || 0,
    bucket: data.bucket || '',
    region: data.region || 'ap-south-1',
  };
}

/**
 * Deletes an S3 media file with safety checks
 */
export async function deleteS3File(key: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/api/storage/files`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete file (HTTP ${res.status})`);
  }

  // Clear cache
  deliveryUrlCache.delete(key);
  return true;
}
