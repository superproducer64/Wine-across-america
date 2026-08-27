import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTopDescriptors, formatGrapeBlend, formatCardDate, buildWineCardData } from './wineCardData';
import { WineEntry } from '../../types';

function makeEntry(overrides: Partial<WineEntry> = {}): WineEntry {
  return {
    id: 'e1',
    user_id: 'u1',
    name: 'La Côte Pinot Noir',
    producer: 'Domaine de la Côte',
    vintage: 2021,
    country: 'USA',
    region: 'Sta. Rita Hills',
    subregion: '',
    appellation: '',
    grapes: [],
    grape_blends: null,
    price: [],
    tasting_date: '2026-03-14',
    location_name: 'Los Angeles, CA',
    location_geo: null,
    sweetness: 2, acidity: 7, tannin: 4, body: 5, alcohol: 6, intensity: 6, finish_length: 6,
    score_balance: 18, score_intensity: 17, score_complexity: 19, score_finish: 18, score_typicity: 18,
    technical_score: 90,
    free_notes: '',
    aromas_l1: [],
    aromas_l2: ['Blackcurrant', 'Vanilla', 'Wet stone', 'Rose'],
    aromas_other_note: null,
    custom_aromas: [],
    tags: [],
    want_another_glass: false,
    want_to_buy: false,
    terroir_soil: null,
    terroir_climate: null,
    terroir_visible: false,
    sig_sense_of_place: null, sig_story: null, sig_viticulture: null, sig_structure: null, sig_enjoyment: null,
    signature_score: null,
    label_photo_url: null,
    label_photo_blurhash: null,
    back_label_photo_url: null,
    created_at: '2026-03-14T00:00:00Z',
    updated_at: '2026-03-14T00:00:00Z',
    ...overrides,
  };
}

test('pickTopDescriptors takes aromas_l2 first, then custom_aromas, deduplicated, capped at 4', () => {
  const picked = pickTopDescriptors({
    aromas_l2: ['Lemon', 'Vanilla'],
    custom_aromas: ['Vanilla', 'Wet stone', 'Rose', 'Clove'],
  });
  assert.deepEqual(picked, ['Lemon', 'Vanilla', 'Wet stone', 'Rose']);
});

test('pickTopDescriptors returns an empty array when there are no descriptors', () => {
  assert.deepEqual(pickTopDescriptors({ aromas_l2: [], custom_aromas: [] }), []);
});

test('formatGrapeBlend prefers grape_blends with percentages over the flat grapes list', () => {
  const result = formatGrapeBlend({
    grape_blends: [{ name: 'Pinot Noir', percentage: 90 }, { name: 'Syrah', percentage: null }],
    grapes: ['Pinot Noir', 'Syrah'],
  });
  assert.equal(result, '90% Pinot Noir, Syrah');
});

test('formatGrapeBlend falls back to the flat grapes list when there is no blend', () => {
  const result = formatGrapeBlend({ grape_blends: null, grapes: ['Pinot Noir'] });
  assert.equal(result, 'Pinot Noir');
});

test('formatGrapeBlend returns null when there is no varietal data at all', () => {
  assert.equal(formatGrapeBlend({ grape_blends: null, grapes: [] }), null);
});

test('formatCardDate formats without shifting a day due to timezone', () => {
  assert.equal(formatCardDate('2026-03-14'), 'March 14, 2026');
});

test('buildWineCardData omits the PAA score when technical_score is 0', () => {
  const card = buildWineCardData(makeEntry({ technical_score: 0 }));
  assert.equal(card.paaScore, null);
});

test('buildWineCardData falls back through region, appellation, subregion in order', () => {
  const card = buildWineCardData(makeEntry({ region: '', appellation: 'Sta. Rita Hills AVA', subregion: 'Fallback' }));
  assert.equal(card.region, 'Sta. Rita Hills AVA');
});

test('buildWineCardData gracefully omits missing optional fields', () => {
  const card = buildWineCardData(makeEntry({
    producer: '', vintage: null, grape_blends: null, grapes: [], location_name: '', label_photo_url: null,
  }));
  assert.equal(card.producerVintage, null);
  assert.equal(card.grapeBlend, null);
  assert.equal(card.location, null);
  assert.equal(card.photoUrl, null);
});
