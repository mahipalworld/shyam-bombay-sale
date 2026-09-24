/**
 * Client-side high-performance image compression and WebP converter.
 * Compresses raw high-res photos (PNG, JPEG, HEIC, etc.) into modern WebP
 * before upload, drastically reducing file size while preserving crisp visual detail.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
}

export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // If not an image or is SVG / GIF / WebP already under 200KB, return as-is
  if (!file.type.startsWith('image/')) {
    return file;
  }
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }
  if (file.type === 'image/webp' && file.size < 200 * 1024) {
    return file;
  }

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Build clean webp filename
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const compressedFile = new File([blob], cleanName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          // If compression resulted in a larger file (rare, e.g. already tiny jpeg), keep smaller
          if (compressedFile.size > file.size && file.type === 'image/webp') {
            resolve(file);
          } else {
            resolve(compressedFile);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original on error
    };

    img.src = objectUrl;
  });
}
