import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryRingSlots } from './aromaRingLayout';

// Appendix I order — kept in sync with AROMA_CATEGORY_META in src/types.
const ALL_14 = [
  'citrus', 'orchard-fruit', 'stone-fruit', 'tropical-fruit', 'red-fruit',
  'black-fruit', 'floral', 'herbal-green', 'spice', 'oak-toast', 'earthy',
  'mineral', 'sweet-ripe', 'other',
];

const SELECTION_COUNTS: Record<string, string[]> = {
  '0 selected':  [],
  '1 selected':  ['citrus'],
  '7 selected':  ALL_14.slice(0, 7),
  '14 selected': ALL_14,
};

// Regression coverage for the bug where the inner ring filtered categories
// down to only those with selections and stretched the remainder to fill
// 360° — it must always render all 14 fixed positions, unstretched, no
// matter how many (or how few) categories have any aromas logged.
test('inner ring always has exactly 14 slots, regardless of selection', () => {
  for (const [name, selection] of Object.entries(SELECTION_COUNTS)) {
    assert.equal(buildCategoryRingSlots(selection).length, 14, `expected 14 slots for ${name}`);
  }
});

test('per-slot arc width is identical across every selection count (never stretches to fill)', () => {
  const sweepPerRun = Object.entries(SELECTION_COUNTS).map(([name, selection]) => {
    const slots = buildCategoryRingSlots(selection);
    const sweeps = new Set(slots.map(s => s.sweep));
    assert.equal(sweeps.size, 1, `expected uniform sweep within ${name}, got ${[...sweeps]}`);
    return slots[0].sweep;
  });
  const distinctWidths = new Set(sweepPerRun);
  assert.equal(distinctWidths.size, 1, `expected the same sweep across all selection counts, got ${[...distinctWidths]}`);
});

test('slot order and category ids are stable and match Appendix I order regardless of selection', () => {
  for (const [name, selection] of Object.entries(SELECTION_COUNTS)) {
    const ids = buildCategoryRingSlots(selection).map(s => s.catId);
    assert.deepEqual(ids, ALL_14, `expected fixed Appendix I order for ${name}`);
  }
});

test('`selected` flag reflects exactly which categories were passed in, independent of ring position', () => {
  const partial = ['citrus', 'floral', 'earthy'];
  const slots = buildCategoryRingSlots(partial);
  for (const slot of slots) {
    assert.equal(slot.selected, partial.includes(slot.catId));
  }
  assert.equal(slots.filter(s => s.selected).length, partial.length);
});
