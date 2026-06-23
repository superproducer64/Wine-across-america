import { Platform } from 'react-native';

// Warm pinkish-beige blurhash used as a soft placeholder while label photos load.
// expo-image accepts a blurhash string directly on the `placeholder` prop.
export const LABEL_PHOTO_PLACEHOLDER = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

// Computes a per-wine placeholder from a local image URI.
// Returns a tiny base64 JPEG data URI (32×32 px, heavily compressed)
// which expo-image will display as a blurred preview while the full photo loads.
// Falls back to null on any error so callers can fall back to LABEL_PHOTO_PLACEHOLDER.
export async function computeLabelPhotoPlaceholder(imageUri: string): Promise<string | null> {
  try {
    const ImageManipulator = await import('expo-image-manipulator');
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 32, height: 32 } }],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
        compress: 0.1,
      }
    );
    if (!result.base64) return null;
    return `data:image/jpeg;base64,${result.base64}`;
  } catch {
    return null;
  }
}

// Computes a per-wine placeholder from a remote HTTPS URL.
// On web: draws the image onto a 32×32 canvas and exports as JPEG data URI.
//   Requires the server to allow cross-origin image loads (Supabase Storage does).
// On native: expo-image-manipulator can process remote http(s) URIs directly via
//   the platform image pipeline, so the same resize path is reused.
// Returns null on any error so callers fall back to LABEL_PHOTO_PLACEHOLDER.
export async function computeLabelPhotoPlaceholderFromUrl(
  url: string
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return _computeFromRemoteUrlWeb(url);
  }
  return computeLabelPhotoPlaceholder(url);
}

async function _computeFromRemoteUrlWeb(url: string): Promise<string | null> {
  try {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, 32, 32);
    return canvas.toDataURL('image/jpeg', 0.1);
  } catch {
    return null;
  }
}
