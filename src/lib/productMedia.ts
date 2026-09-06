import { Product } from '@/types';

export interface ProductMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string; // S3 canonical key or direct URL
  isCover?: boolean;
}

/**
 * Returns a single, ordered list of all media items for a product.
 * Preserves the exact ordering saved by the admin:
 * Cover image (or primary) -> subsequent gallery images -> product demo videos.
 */
export function getProductMediaList(product: Product): ProductMediaItem[] {
  const items: ProductMediaItem[] = [];
  const seenKeys = new Set<string>();

  // 1. Primary cover image
  const primaryImg = product.image;
  if (primaryImg && !seenKeys.has(primaryImg)) {
    seenKeys.add(primaryImg);
    items.push({
      id: `img_cover_${product.id}`,
      type: 'image',
      url: primaryImg,
      isCover: true,
    });
  }

  // 2. Additional gallery images in exact array order
  if (Array.isArray(product.images)) {
    product.images.forEach((imgUrl, idx) => {
      if (imgUrl && !seenKeys.has(imgUrl)) {
        seenKeys.add(imgUrl);
        items.push({
          id: `img_${idx}_${product.id}`,
          type: 'image',
          url: imgUrl,
          isCover: items.length === 0,
        });
      }
    });
  }

  // 3. Primary video if attached
  if (product.video && !seenKeys.has(product.video)) {
    seenKeys.add(product.video);
    items.push({
      id: `vid_primary_${product.id}`,
      type: 'video',
      url: product.video,
    });
  }

  // 4. Additional videos in exact array order
  if (Array.isArray(product.videos)) {
    product.videos.forEach((vidUrl, idx) => {
      if (vidUrl && !seenKeys.has(vidUrl)) {
        seenKeys.add(vidUrl);
        items.push({
          id: `vid_${idx}_${product.id}`,
          type: 'video',
          url: vidUrl,
        });
      }
    });
  }

  return items;
}
