import { useEffect, useRef } from 'react';
import { computeLabelPhotoPlaceholderFromUrl } from '@/utils/imagePlaceholder';
import { updateWineEntry } from '@/lib/supabase';
import { useWineStore } from '@/stores/wineStore';

// Module-level set prevents duplicate work when the same wine entry appears
// in multiple mounted components (e.g. list + grid) at the same time.
const _inFlight = new Set<string>();

/**
 * Lazily backfills label_photo_blurhash for a wine entry that was saved before
 * the per-wine preview image feature was deployed.
 *
 * If the entry already has a blurhash, or has no label photo, this is a no-op.
 * Otherwise it computes a tiny 32×32 JPEG thumbnail from the remote label URL,
 * persists it to the database, and patches the local Zustand store so the UI
 * updates immediately without a full reload.
 *
 * On web: uses the Canvas API (crossOrigin-enabled) to resize the remote image.
 * On native: expo-image-manipulator handles the remote http(s) URI natively.
 */
export function useLazyBlurhashBackfill(entry: {
  id: string;
  label_photo_url?: string | null;
  label_photo_blurhash?: string | null;
}) {
  const patchEntryBlurhash = useWineStore((s) => s.patchEntryBlurhash);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    if (entry.label_photo_blurhash) return;
    if (!entry.label_photo_url) return;
    if (_inFlight.has(entry.id)) return;

    didRun.current = true;
    _inFlight.add(entry.id);

    const id = entry.id;
    const url = entry.label_photo_url;

    (async () => {
      let succeeded = false;
      try {
        const blurhash = await computeLabelPhotoPlaceholderFromUrl(url);
        if (!blurhash) return;

        const { error } = await updateWineEntry(id, { label_photo_blurhash: blurhash });
        if (error) {
          console.warn('[useLazyBlurhashBackfill] DB write failed for', id, error.message);
          return;
        }

        patchEntryBlurhash(id, blurhash);
        succeeded = true;
      } catch {
        // Silent — failure to backfill never degrades the UX
      } finally {
        _inFlight.delete(id);
        if (!succeeded) {
          // Allow a future mount of this component to retry
          didRun.current = false;
        }
      }
    })();
  }, [entry.id, entry.label_photo_url, entry.label_photo_blurhash, patchEntryBlurhash]);
}
