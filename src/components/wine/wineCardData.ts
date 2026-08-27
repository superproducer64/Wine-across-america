import { WineEntry } from '../../types';

export interface WineCardData {
  wineName: string;
  producerVintage: string | null;
  paaScore: number | null;
  region: string | null;
  descriptors: string[];
  grapeBlend: string | null;
  tastingDate: string;
  location: string | null;
  photoUrl: string | null;
}

export function pickTopDescriptors(
  entry: Pick<WineEntry, 'aromas_l2' | 'custom_aromas'>,
  max = 4
): string[] {
  const combined = [...(entry.aromas_l2 ?? []), ...(entry.custom_aromas ?? [])];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const d of combined) {
    const key = d.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(d.trim());
    if (result.length >= max) break;
  }
  return result;
}

export function formatGrapeBlend(entry: Pick<WineEntry, 'grape_blends' | 'grapes'>): string | null {
  if (entry.grape_blends && entry.grape_blends.length > 0) {
    return entry.grape_blends
      .map((g) => (g.percentage != null ? `${g.percentage}% ${g.name}` : g.name))
      .join(', ');
  }
  if (entry.grapes.length > 0) {
    return entry.grapes.join(', ');
  }
  return null;
}

export function formatCardDate(tastingDate: string): string {
  return new Date(tastingDate + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildWineCardData(entry: WineEntry): WineCardData {
  const region = [entry.region, entry.appellation, entry.subregion].filter(Boolean)[0] ?? null;
  return {
    wineName: entry.name || 'Untitled Wine',
    producerVintage: entry.producer
      ? `${entry.producer}${entry.vintage ? ` · ${entry.vintage}` : ''}`
      : entry.vintage
        ? String(entry.vintage)
        : null,
    paaScore: entry.technical_score > 0 ? entry.technical_score : null,
    region,
    descriptors: pickTopDescriptors(entry),
    grapeBlend: formatGrapeBlend(entry),
    tastingDate: formatCardDate(entry.tasting_date),
    location: entry.location_name || null,
    photoUrl: entry.label_photo_url,
  };
}
