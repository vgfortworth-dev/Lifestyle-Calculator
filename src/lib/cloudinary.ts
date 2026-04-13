const DEFAULT_RIASEC_WIDTH = 1400;
const DEFAULT_RIASEC_HEIGHT = 1200;

function normalizeCloudinaryPublicId(publicId: string) {
  return publicId.trim().replace(/^\/+|\/+$/g, '');
}

export function buildCloudinaryImageUrl(
  publicId: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'scale';
    gravity?: 'auto' | 'center' | 'faces';
  }
) {
  if (!publicId) return null;
  if (/^https?:\/\//i.test(publicId)) return publicId;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    if (import.meta.env.DEV) {
      console.warn(
        '[RIASEC] Missing VITE_CLOUDINARY_CLOUD_NAME. Cloudinary image URLs cannot be resolved.',
        { publicId }
      );
    }
    return null;
  }

  const normalizedPublicId = normalizeCloudinaryPublicId(publicId);
  if (!normalizedPublicId) {
    if (import.meta.env.DEV) {
      console.warn('[RIASEC] Empty Cloudinary public ID after normalization.', { publicId });
    }
    return null;
  }

  const width = options?.width ?? DEFAULT_RIASEC_WIDTH;
  const height = options?.height ?? DEFAULT_RIASEC_HEIGHT;
  const crop = options?.crop ?? 'fill';
  const gravity = options?.gravity ?? 'auto';

  const transformation = [
    'f_auto',
    'q_auto',
    `c_${crop}`,
    `g_${gravity}`,
    `w_${width}`,
    `h_${height}`,
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${normalizedPublicId}`;
}
