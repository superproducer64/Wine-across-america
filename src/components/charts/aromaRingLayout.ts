// Pure inner-ring layout math for AromaDonutChart, split out from the
// component so the "inner ring always renders all 14 fixed categories,
// never reflowing to fewer wedges" invariant can be unit-tested without
// rendering SVG/React Native.
import { AROMA_CATEGORIES } from '../../types';
import { Colors } from '../../theme';

// Angular gap (degrees) between adjacent wedges on both rings.
export const RING_GAP = 0.8;

// Curated per-category accent colors — each of the 14 categories gets its
// own distinct hue (not shared across a parent group) so adjacent wedges,
// including the Other → Citrus wrap, never read as the same color. Outer-
// ring items are tints of their category's color, which keeps the grouping
// cue intact.
export const CAT_TO_COLOR: Record<string, string> = {
  'citrus':          '#B89B3D',
  'orchard-fruit':   '#739442',
  'stone-fruit':     '#CB804D',
  'tropical-fruit':  '#A0B54A',
  'red-fruit':       '#B83D52',
  'black-fruit':     '#59346F',
  'floral':          '#BA6DA1',
  'herbal-green':    '#5A8943',
  'spice':           '#9F4C38',
  'oak-toast':       '#7D693B',
  'earthy':          '#4D5738',
  'mineral':         '#5C8099',
  'sweet-ripe':      '#B86176',
  'other':           '#938776',
};

export type CategoryRingSlot = {
  catId: string;
  label: string;
  emoji: string;
  color: string;
  selected: boolean;
  mid: number;
  sweep: number;
};

// Builds the inner ring's 14 fixed category slots, always all 14 in
// Appendix I order, at fixed equal-width angular positions. `aromasL1` only
// determines each slot's `selected` flag — it never changes how many slots
// exist or how wide any of them are, so `sweep` (and therefore every slot's
// position) is identical no matter which or how many categories are
// selected, including zero.
export function buildCategoryRingSlots(aromasL1: string[]): CategoryRingSlot[] {
  const totalCats = AROMA_CATEGORIES.length;
  const dataSpan = 360 - RING_GAP * totalCats;
  const sweep = totalCats > 0 ? dataSpan / totalCats : 0;
  let angle = 0;
  return AROMA_CATEGORIES.map(cat => {
    const mid = angle + sweep / 2;
    angle += sweep + RING_GAP;
    return {
      catId: cat.id,
      label: cat.label,
      emoji: cat.emoji,
      color: CAT_TO_COLOR[cat.id] ?? Colors.gold,
      selected: aromasL1.includes(cat.id),
      mid,
      sweep,
    };
  });
}
