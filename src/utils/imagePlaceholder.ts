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
