# Shareable Wine Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Card" action on the Wine Detail screen that renders a branded 1080×1920 wine card image from a real tasting entry, and lets the user send it to a PAA member in-app (via the existing messaging system) or share it externally through the native OS share sheet.

**Architecture:** A pure data-shaping module (`wineCardData.ts`) turns a `WineEntry` into card-ready fields; a presentational `WineCardTemplate` component renders those fields at fixed 1080×1920 pixel dimensions using Fraunces/Work Sans; a new `ShareCardScreen` captures that component to a PNG via `react-native-view-shot` and offers two share paths — `expo-sharing`'s native share sheet, or a new `ShareCardToMemberModal` that uploads the PNG to Supabase Storage and sends it as a message attachment through the existing Phase 8 messaging tables.

**Tech Stack:** React Native + Expo, TypeScript, Supabase (Postgres + Storage), `react-native-view-shot` 3.8.0, `expo-sharing` ~12.0.1, `@expo-google-fonts/fraunces` + `@expo-google-fonts/work-sans` (new deps), `tsx --test` / `node:test` for pure-logic tests.

Full design spec: [`docs/superpowers/specs/2026-08-19-wine-share-card-design.md`](../specs/2026-08-19-wine-share-card-design.md)

## Global Constraints

- Story variant only for v1: card canvas is exactly 1080×1920.
- Design tokens (exact): background `#F6F1E7`, primary ink `#2B2420`, hero accent `#B5502E`, secondary accent `#6B7156`, footer/watermark `#2B2420` @ 35% opacity.
- Hero font: Fraunces weight 900. Supporting font: Work Sans (400/500/600). These are new, card-scoped fonts — do not change `src/theme/index.ts`'s existing `Fonts` (Playfair Display / DM Sans stays the app-wide default elsewhere).
- No user name/handle appears anywhere on the card, ever (privacy default).
- Missing optional fields (no photo, no varietal blend, no descriptors) are omitted from layout — never a placeholder or an error.
- PAA score on the card is `entry.technical_score` (never `entry.signature_score`).
- Captured PNG must be at least 1080px wide, not a resized/blurry screenshot.
- Supabase project id for all migrations and SQL verification: `wldcernnxtzhkpqfjamk`.
- This repo has no RN component/e2e test harness — only pure-logic files get automated tests (`tsx --test`, `node:test`, matching `src/components/charts/aromaRingLayout.test.ts`). UI tasks are verified manually via `expo start`; say so plainly in each such task rather than fabricating a test that doesn't exist in this codebase.
- Package manager is Yarn (`yarn.lock` is authoritative) — use `yarn add`, not `npm install`.

---

### Task 1: Wine card data-shaping module

**Files:**
- Create: `src/components/wine/wineCardData.ts`
- Test: `src/components/wine/wineCardData.test.ts`

**Interfaces:**
- Consumes: `WineEntry` from `../../types` (relative import — `tsx --test` does not resolve the `@/*` path alias; `src/components/charts/aromaRingLayout.ts` already establishes this relative-import convention for testable pure-logic files).
- Produces (for Task 3 and Task 6 to consume):
  ```ts
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
  export function pickTopDescriptors(entry: Pick<WineEntry, 'aromas_l2' | 'custom_aromas'>, max?: number): string[];
  export function formatGrapeBlend(entry: Pick<WineEntry, 'grape_blends' | 'grapes'>): string | null;
  export function formatCardDate(tastingDate: string): string;
  export function buildWineCardData(entry: WineEntry): WineCardData;
  ```

- [ ] **Step 1: Write the failing test file**

Create `src/components/wine/wineCardData.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx --test src/components/wine/wineCardData.test.ts`
Expected: FAIL — `wineCardData.ts` does not exist yet (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/components/wine/wineCardData.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx tsx --test src/components/wine/wineCardData.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/wine/wineCardData.ts src/components/wine/wineCardData.test.ts
git commit -m "Add wine card data-shaping module with tests"
```

---

### Task 2: Add Fraunces and Work Sans fonts

**Files:**
- Modify: `package.json`
- Modify: `App.tsx`

**Interfaces:**
- Produces (for Task 3 to consume as literal `fontFamily` strings): `Fraunces_900Black`, `WorkSans_400Regular`, `WorkSans_500Medium`, `WorkSans_600SemiBold` — verified exact export names from `@expo-google-fonts/fraunces@0.4.1` and `@expo-google-fonts/work-sans@0.4.2` (confirmed by inspecting each package's `index.js`; Fraunces has no optical-size-specific export variants despite being a variable font).

- [ ] **Step 1: Install the packages**

Run: `yarn add @expo-google-fonts/fraunces @expo-google-fonts/work-sans`

Expected: `package.json` gains both under `dependencies`, `yarn.lock` updates.

- [ ] **Step 2: Wire the fonts into `App.tsx`**

In `App.tsx`, add imports after the existing `@expo-google-fonts/dm-sans` import (currently lines 10-13):

```tsx
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_900Black } from '@expo-google-fonts/fraunces';
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
} from '@expo-google-fonts/work-sans';
```

Then extend the `useFonts` call (currently lines 69-75) from:

```tsx
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });
```

to:

```tsx
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    Fraunces_900Black,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
  });
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual verification**

This repo has no component test harness, so verify by running the app: `expo start`, open it on a device/simulator, and confirm the app still boots past the splash screen without a font-loading error (nothing renders Fraunces/Work Sans yet — that's Task 3).

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock App.tsx
git commit -m "Add Fraunces and Work Sans fonts for the wine share card"
```

---

### Task 3: WineCardTemplate component

**Files:**
- Create: `src/components/wine/WineCardTemplate.tsx`

**Interfaces:**
- Consumes: `buildWineCardData` from `./wineCardData` (Task 1), `WineEntry` from `@/types`, font family strings from Task 2.
- Produces (for Task 6 to consume): `WineCardTemplate({ entry }: { entry: WineEntry })`, plus exported constants `CARD_WIDTH = 1080` and `CARD_HEIGHT = 1920`.

- [ ] **Step 1: Write the component**

Create `src/components/wine/WineCardTemplate.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { WineEntry } from '@/types';
import { buildWineCardData } from './wineCardData';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

const CardColors = {
  paper: '#F6F1E7',
  ink: '#2B2420',
  heroAccent: '#B5502E',
  secondaryAccent: '#6B7156',
};

const CardFonts = {
  fraunces: 'Fraunces_900Black',
  workSansRegular: 'WorkSans_400Regular',
  workSansMedium: 'WorkSans_500Medium',
  workSansSemiBold: 'WorkSans_600SemiBold',
};

interface Props {
  entry: WineEntry;
}

export function WineCardTemplate({ entry }: Props) {
  const card = buildWineCardData(entry);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Tasting Note</Text>

      <View style={styles.gap40} />

      <Text style={styles.wineName}>{card.wineName}</Text>

      {card.producerVintage ? (
        <>
          <View style={styles.gap28} />
          <Text style={styles.producerVintage}>{card.producerVintage}</Text>
        </>
      ) : null}

      {card.photoUrl ? (
        <>
          <View style={styles.gap40} />
          <Image source={{ uri: card.photoUrl }} style={styles.photo} contentFit="cover" />
        </>
      ) : null}

      <View style={styles.gap56} />
      <View style={styles.divider} />
      <View style={styles.gap56} />

      {card.paaScore != null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{card.paaScore}</Text>
          <View style={styles.scoreLabelCol}>
            <Text style={styles.scoreOutOf}>/ 100</Text>
            <View style={styles.gap10} />
            <Text style={styles.scoreLabel}>PAA Score</Text>
          </View>
        </View>
      )}

      <View style={styles.gap56} />
      <View style={styles.divider} />
      <View style={styles.gap56} />

      {card.region ? (
        <>
          <Text style={styles.fieldLabel}>Region</Text>
          <View style={styles.gap12} />
          <Text style={styles.fieldValue}>{card.region}</Text>
          <View style={styles.gap48} />
        </>
      ) : null}

      {card.descriptors.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>Notes</Text>
          <View style={styles.gap16} />
          <View style={styles.pillRow}>
            {card.descriptors.map((d) => (
              <View key={d} style={styles.pill}>
                <Text style={styles.pillText}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.spacer} />

      <View style={styles.tier3Row}>
        {[card.grapeBlend, card.tastingDate, card.location]
          .filter((v): v is string => Boolean(v))
          .map((val, i, arr) => (
            <React.Fragment key={val}>
              <Text style={styles.tier3Text}>{val}</Text>
              {i < arr.length - 1 ? <View style={styles.tier3Dot} /> : null}
            </React.Fragment>
          ))}
      </View>

      <View style={styles.gap48} />
      <View style={styles.footerDivider} />
      <View style={styles.gap32} />

      <View style={styles.footerRow}>
        <Text style={styles.footerWordmark}>Pour Across America</Text>
        <Text style={styles.footerLine}>Download on the App Store</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: CardColors.paper,
    paddingTop: 96,
    paddingBottom: 64,
    paddingHorizontal: 88,
  },
  gap10: { height: 10 },
  gap12: { height: 12 },
  gap16: { height: 16 },
  gap28: { height: 28 },
  gap32: { height: 32 },
  gap40: { height: 40 },
  gap48: { height: 48 },
  gap56: { height: 56 },
  eyebrow: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 24,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  wineName: {
    fontFamily: CardFonts.fraunces,
    fontSize: 88,
    lineHeight: 92,
    color: CardColors.ink,
  },
  producerVintage: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 36,
    color: CardColors.ink,
    opacity: 0.72,
  },
  photo: {
    width: '100%',
    height: 480,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: CardColors.secondaryAccent,
    opacity: 0.28,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
  },
  scoreNumber: {
    fontFamily: CardFonts.fraunces,
    fontSize: 260,
    lineHeight: 213,
    color: CardColors.heroAccent,
  },
  scoreLabelCol: {
    paddingBottom: 30,
  },
  scoreOutOf: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 32,
    color: CardColors.heroAccent,
    opacity: 0.85,
  },
  scoreLabel: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  fieldLabel: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  fieldValue: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 34,
    color: CardColors.ink,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: CardColors.secondaryAccent,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 26,
    color: CardColors.ink,
  },
  spacer: { flex: 1 },
  tier3Row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 24,
  },
  tier3Text: {
    fontFamily: CardFonts.workSansRegular,
    fontSize: 24,
    color: CardColors.ink,
    opacity: 0.55,
  },
  tier3Dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CardColors.ink,
    opacity: 0.4,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: CardColors.ink,
    opacity: 0.15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerWordmark: {
    fontFamily: CardFonts.fraunces,
    fontSize: 28,
    color: CardColors.ink,
    opacity: 0.35,
    letterSpacing: 1,
  },
  footerLine: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 22,
    color: CardColors.ink,
    opacity: 0.35,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/wine/WineCardTemplate.tsx
git commit -m "Add WineCardTemplate presentational component"
```

---

### Task 4: Messaging schema — attachment support

**Files:**
- Modify: `src/lib/supabase.ts`

**Interfaces:**
- Produces (for Task 5, 7, 9 to consume):
  ```ts
  export type DirectMessage = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    attachment_url: string | null;
    read: boolean;
    created_at: string;
  };
  export function sendMessage(
    senderId: string,
    recipientId: string,
    content: string,
    attachmentUrl?: string | null
  ): Promise<{ error: string | null }>;
  ```

- [ ] **Step 1: Apply the migration**

Call `apply_migration` (project_id `wldcernnxtzhkpqfjamk`) with:

- `name`: `add_message_attachment_url`
- `query`:
```sql
alter table public.messages add column attachment_url text null;

alter table public.messages drop constraint messages_content_check;

alter table public.messages add constraint messages_content_check
  check (
    char_length(content) <= 2000
    and (attachment_url is not null or char_length(content) > 0)
  );
```

- [ ] **Step 2: Verify the constraint change with a rolled-back transaction**

Call `execute_sql` (project_id `wldcernnxtzhkpqfjamk`) with:

```sql
begin;
do $$
declare
  uid1 uuid;
  uid2 uuid;
begin
  select id into uid1 from auth.users limit 1;
  select id into uid2 from auth.users where id <> uid1 limit 1;

  begin
    insert into public.messages (sender_id, recipient_id, content, attachment_url)
    values (uid1, uid2, '', null);
    raise exception 'expected constraint violation did not occur';
  exception when check_violation then
    raise notice 'ok: empty content without attachment correctly rejected';
  end;

  insert into public.messages (sender_id, recipient_id, content, attachment_url)
  values (uid1, uid2, '', 'https://example.com/card.png');
  raise notice 'ok: empty content with attachment accepted';
end $$;
rollback;
```

Expected: both `raise notice` lines appear in the response and no row is left behind (the transaction is rolled back).

- [ ] **Step 3: Update `DirectMessage` type and `sendMessage`**

In `src/lib/supabase.ts`, replace the `DirectMessage` type (currently lines 789-796):

```ts
export type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
};
```

with:

```ts
export type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url: string | null;
  read: boolean;
  created_at: string;
};
```

Then replace `sendMessage` (currently lines 806-817):

```ts
export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    content,
  });
  return { error: error?.message ?? null };
}
```

with:

```ts
export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string,
  attachmentUrl?: string | null
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    content,
    attachment_url: attachmentUrl ?? null,
  });
  return { error: error?.message ?? null };
}
```

(This is backward-compatible: the two existing call sites in `ComposeMessageScreen.tsx` and `MessageDetailScreen.tsx` call `sendMessage` with 3 arguments and are unaffected.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "Add attachment_url support to messages table and sendMessage"
```

---

### Task 5: Wine card storage bucket + upload helper

**Files:**
- Modify: `src/lib/supabase.ts`

**Interfaces:**
- Produces (for Task 7 to consume):
  ```ts
  export function uploadWineCard(
    userId: string,
    entryId: string,
    imageUri: string
  ): Promise<{ url: string | null; error: string | null }>;
  ```

- [ ] **Step 1: Apply the migration**

Call `apply_migration` (project_id `wldcernnxtzhkpqfjamk`) with:

- `name`: `create_wine_cards_storage_bucket`
- `query`:
```sql
insert into storage.buckets (id, name, public)
values ('wine-cards', 'wine-cards', true)
on conflict (id) do nothing;

create policy "wine_cards_public_read"
  on storage.objects for select
  using (bucket_id = 'wine-cards');

create policy "wine_cards_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'wine-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "wine_cards_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'wine-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

- [ ] **Step 2: Verify the bucket and policies exist**

Call `execute_sql` (project_id `wldcernnxtzhkpqfjamk`) with:

```sql
select id, public from storage.buckets where id = 'wine-cards';
select policyname, cmd from pg_policies where tablename = 'objects' and schemaname = 'storage' and policyname like 'wine_cards_%';
```

Expected: one bucket row (`wine-cards`, `public = true`) and three policy rows (`wine_cards_public_read` / SELECT, `wine_cards_owner_insert` / INSERT, `wine_cards_owner_delete` / DELETE).

- [ ] **Step 3: Add `uploadWineCard`**

In `src/lib/supabase.ts`, add this function immediately after `uploadAvatar` (currently ends at line 740, right before the `// ─── User Search ───` comment on line 742):

```ts
// ─── Wine Card Upload ───────────────────────────────────────────────────────

export async function uploadWineCard(
  userId: string,
  entryId: string,
  imageUri: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const path = `${userId}/${entryId}-${Date.now()}.png`;

    const { error } = await supabase.storage
      .from('wine-cards')
      .upload(path, blob, { contentType: 'image/png', upsert: false });

    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('wine-cards').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e: unknown) {
    return { url: null, error: String(e) };
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "Add wine-cards storage bucket and uploadWineCard helper"
```

---

### Task 6: ShareCardScreen — render, capture, external share

**Files:**
- Create: `src/screens/share/ShareCardScreen.tsx`

**Interfaces:**
- Consumes: `WineCardTemplate`, `CARD_WIDTH`, `CARD_HEIGHT` from `@/components/wine/WineCardTemplate` (Task 3); `useWineStore` from `@/stores/wineStore`; `MainStackParamList` from `@/navigation/types` (this task assumes the `ShareCard: { entryId: string }` route already exists — added in Task 8, but this file can be written and typechecked once Task 8's type is in place; if Task 8 hasn't landed yet, typecheck this file last or do Task 8 first).
- Produces (for Task 7 and Task 8 to consume): `ShareCardScreen`, a screen component taking route param `{ entryId: string }`, which passes `cardUri: string` and `entry: WineEntry` down to `ShareCardToMemberModal`.

- [ ] **Step 1: Write the screen**

Create `src/screens/share/ShareCardScreen.tsx`:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { WineCardTemplate, CARD_WIDTH, CARD_HEIGHT } from '@/components/wine/WineCardTemplate';
import { ShareCardToMemberModal } from '@/components/wine/ShareCardToMemberModal';
import { useWineStore } from '@/stores/wineStore';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ShareCard'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - Spacing.xl * 2, 420);
const CARD_ASPECT = CARD_WIDTH / CARD_HEIGHT;

export function ShareCardScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const { entries } = useWineStore();
  const { user } = useAuthStore();
  const entry = entries.find((e) => e.id === entryId) ?? null;

  const cardRef = useRef<View>(null);
  const [cardUri, setCardUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(true);
  const [captureError, setCaptureError] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [externalError, setExternalError] = useState('');

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    setCapturing(true);
    setCaptureError('');
    // Give the off-screen template a frame to finish its first paint before capturing.
    const timer = setTimeout(async () => {
      try {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
        if (!cancelled) setCardUri(uri);
      } catch {
        if (!cancelled) setCaptureError('Could not generate the card image.');
      } finally {
        if (!cancelled) setCapturing(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [entry]);

  const handleShareExternally = async () => {
    if (!cardUri) return;
    setExternalError('');
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setExternalError('Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(cardUri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      // user cancelled — do nothing
    }
  };

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Wine not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Share Card</Text>
        <View style={styles.navBtn} />
      </View>

      <View style={styles.previewArea}>
        <View style={[styles.previewFrame, { width: PREVIEW_WIDTH, height: PREVIEW_WIDTH / CARD_ASPECT }]}>
          {cardUri ? (
            <Image source={{ uri: cardUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <ActivityIndicator color={Colors.gold} />
              <Text style={styles.capturingText}>Preparing your card…</Text>
            </View>
          )}
        </View>
        {captureError ? <Text style={styles.errorText}>{captureError}</Text> : null}
      </View>

      {/* Off-screen, full-resolution instance used only as the capture target. */}
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={cardRef} collapsable={false}>
          <WineCardTemplate entry={entry} />
        </View>
      </View>

      {externalError ? <Text style={styles.errorText}>{externalError}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnPrimary, (!cardUri || capturing) && styles.actionBtnDisabled]}
          onPress={() => setShowMemberModal(true)}
          disabled={!cardUri || capturing}
        >
          <Text style={styles.actionBtnPrimaryText}>Send to PAA member</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, (!cardUri || capturing) && styles.actionBtnDisabled]}
          onPress={handleShareExternally}
          disabled={!cardUri || capturing}
        >
          <Text style={styles.actionBtnText}>Share externally</Text>
        </Pressable>
      </View>

      {cardUri && user && (
        <ShareCardToMemberModal
          visible={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          entry={entry}
          senderId={user.id}
          cardImageUri={cardUri}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: { paddingVertical: 6, paddingHorizontal: 4, minWidth: 56 },
  navBtnText: { fontFamily: Fonts.dmSansRegular, fontSize: 16, color: Colors.gold },
  navTitle: { fontFamily: Fonts.playfair, fontSize: 16, color: Colors.ink },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  previewFrame: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  capturingText: { fontFamily: Fonts.dmSans, fontSize: 13, color: Colors.inkMuted },
  offscreen: {
    position: 'absolute',
    top: 0,
    left: -100000,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.red,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  backLink: { padding: Spacing.md },
  backLinkText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold },
  actions: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold, letterSpacing: 0.3 },
  actionBtnPrimaryText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold, letterSpacing: 0.3 },
});
```

Note: the on-screen preview shows the *captured PNG* (via `<Image>`), not a live scaled copy of `WineCardTemplate` — this avoids RN `transform: scale` origin/positioning pitfalls entirely. The off-screen instance (positioned at `left: -100000`) is the only thing `captureRef` targets, and it always renders at the true 1080×1920 size, so the capture is never a resize of a smaller render.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors related to this file once Task 7 and Task 8 have also landed (this file references `ShareCardToMemberModal` from Task 7 and the `ShareCard` route type from Task 8 — if doing these tasks in order, do Task 8 before typechecking this one, or accept transient errors until Task 8 lands).

- [ ] **Step 3: Commit**

```bash
git add src/screens/share/ShareCardScreen.tsx
git commit -m "Add ShareCardScreen with capture and external share"
```

---

### Task 7: ShareCardToMemberModal — in-app send via messaging

**Files:**
- Create: `src/components/wine/ShareCardToMemberModal.tsx`

**Interfaces:**
- Consumes: `searchUserByEmail`, `uploadWineCard` (Task 5), `sendMessage` (Task 4) from `@/lib/supabase`; `WineEntry` from `@/types`.
- Produces (for Task 6 to consume): `ShareCardToMemberModal({ visible, onClose, entry, senderId, cardImageUri }: Props)`.

- [ ] **Step 1: Write the modal**

Create `src/components/wine/ShareCardToMemberModal.tsx`:

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { searchUserByEmail, uploadWineCard, sendMessage } from '@/lib/supabase';
import { WineEntry } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  entry: WineEntry;
  senderId: string;
  cardImageUri: string;
}

interface FoundUser {
  id: string;
  email: string;
  display_name: string | null;
}

export function ShareCardToMemberModal({ visible, onClose, entry, senderId, cardImageUri }: Props) {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundUser[]>([]);
  const [selected, setSelected] = useState<FoundUser | null>(null);
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchDone, setSearchDone] = useState(false);

  const reset = () => {
    setEmail('');
    setResults([]);
    setSelected(null);
    setCaption('');
    setStatus('idle');
    setSearchDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    setStatus('idle');
    setSearchDone(false);

    const { data, error } = await searchUserByEmail(email.trim());
    setSearching(false);
    setSearchDone(true);

    if (error || !data) return;

    const filtered = (data as FoundUser[]).filter((u) => u.id !== senderId);
    setResults(filtered);
  };

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    setStatus('idle');

    const { url, error: uploadError } = await uploadWineCard(senderId, entry.id, cardImageUri);
    if (uploadError || !url) {
      setSending(false);
      setStatus('error');
      return;
    }

    const { error: sendError } = await sendMessage(senderId, selected.id, caption.trim(), url);

    setSending(false);

    if (sendError) {
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1800);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Send to a Member</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.winePreview}>
              <Text style={styles.winePreviewLabel}>Sharing card for</Text>
              <Text style={styles.winePreviewName}>
                {entry.name || 'Untitled Wine'}
                {entry.vintage ? ` ${entry.vintage}` : ''}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Enter recipient's email</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setSearchDone(false);
                  setResults([]);
                  setSelected(null);
                  setStatus('idle');
                }}
                placeholder="friend@example.com"
                placeholderTextColor={Colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <Pressable
                style={[styles.searchBtn, searching && styles.searchBtnDisabled]}
                onPress={handleSearch}
                disabled={searching || !email.trim()}
              >
                {searching ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>Find</Text>
                )}
              </Pressable>
            </View>

            {searchDone && results.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No Pour Across America member found with that email.
                </Text>
              </View>
            )}

            {results.map((foundUser) => {
              const isSelected = selected?.id === foundUser.id;
              return (
                <Pressable
                  key={foundUser.id}
                  style={[styles.userRow, isSelected && styles.userRowSelected]}
                  onPress={() => setSelected(isSelected ? null : foundUser)}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(foundUser.display_name ?? foundUser.email)[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{foundUser.display_name ?? 'App Member'}</Text>
                    <Text style={styles.userEmail}>{foundUser.email}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}

            {selected && status !== 'success' && (
              <>
                <Text style={styles.inputLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Say something about this wine…"
                  placeholderTextColor={Colors.inkFaint}
                  multiline
                  maxLength={2000}
                />
              </>
            )}

            {status === 'success' && (
              <View style={[styles.feedback, styles.feedbackSuccess]}>
                <Text style={styles.feedbackText}>
                  🍷 Card sent to {selected?.display_name ?? selected?.email}!
                </Text>
              </View>
            )}
            {status === 'error' && (
              <View style={[styles.feedback, styles.feedbackError]}>
                <Text style={styles.feedbackText}>Something went wrong. Please try again.</Text>
              </View>
            )}

            {selected && status !== 'success' && (
              <Pressable
                style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color={Colors.ink} size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>
                    Send to {selected.display_name ?? selected.email}
                  </Text>
                )}
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: { fontFamily: Fonts.playfair, fontSize: 20, color: Colors.ink },
  closeBtn: { padding: Spacing.sm },
  closeBtnText: { fontFamily: Fonts.dmSansRegular, fontSize: 16, color: Colors.inkMuted },
  body: { padding: Spacing.xl, gap: Spacing.lg },
  winePreview: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 3,
    marginBottom: Spacing.sm,
  },
  winePreviewLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  winePreviewName: { fontFamily: Fonts.playfair, fontSize: 18, color: Colors.white, lineHeight: 24 },
  inputLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  searchRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.white,
  },
  searchBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.white },
  noResults: { paddingVertical: Spacing.md },
  noResultsText: { fontFamily: Fonts.dmSans, fontSize: 14, color: Colors.inkMuted, textAlign: 'center' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  userRowSelected: { borderColor: Colors.gold, backgroundColor: Colors.goldPale },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontFamily: Fonts.playfair, fontSize: 17, color: Colors.ink },
  userInfo: { flex: 1 },
  userName: { fontFamily: Fonts.dmSansRegular, fontSize: 15, color: Colors.ink },
  userEmail: { fontFamily: Fonts.dmSans, fontSize: 12, color: Colors.inkMuted },
  checkmark: { fontFamily: Fonts.dmSansMedium, fontSize: 18, color: Colors.gold },
  captionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.white,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  feedback: { borderRadius: Radius.md, padding: Spacing.md },
  feedbackSuccess: { backgroundColor: '#EBF7F0', borderWidth: 0.5, borderColor: Colors.green },
  feedbackError: { backgroundColor: Colors.redLight, borderWidth: 0.5, borderColor: Colors.red },
  feedbackText: { fontFamily: Fonts.dmSansRegular, fontSize: 14, color: Colors.inkMid, textAlign: 'center' },
  sendBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 15, color: Colors.ink },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (assuming Task 4 and Task 5 have landed).

- [ ] **Step 3: Commit**

```bash
git add src/components/wine/ShareCardToMemberModal.tsx
git commit -m "Add ShareCardToMemberModal for in-app card sharing"
```

---

### Task 8: Navigation wiring

**Files:**
- Modify: `src/navigation/types.ts`
- Modify: `src/navigation/MainNavigator.tsx`
- Modify: `src/screens/detail/WineDetailScreen.tsx`

**Interfaces:**
- Produces: `MainStackParamList['ShareCard'] = { entryId: string }`, reachable via `navigation.navigate('ShareCard', { entryId })` from any screen typed against `MainStackParamList`.

- [ ] **Step 1: Add the route type**

In `src/navigation/types.ts`, change:

```ts
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  WineDetail: { entryId: string };
  SharedWineDetail: { snapshot: Record<string, unknown>; senderName: string };
```

to:

```ts
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  WineDetail: { entryId: string };
  ShareCard: { entryId: string };
  SharedWineDetail: { snapshot: Record<string, unknown>; senderName: string };
```

- [ ] **Step 2: Register the screen**

In `src/navigation/MainNavigator.tsx`, add the import after the `WineDetailScreen` import (currently line 11):

```tsx
import { WineDetailScreen } from '@/screens/detail/WineDetailScreen';
import { ShareCardScreen } from '@/screens/share/ShareCardScreen';
```

Then add a `<Stack.Screen>` entry right after the `WineDetail` screen registration (currently lines 142-146):

```tsx
      <Stack.Screen
        name="WineDetail"
        component={WineDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ShareCard"
        component={ShareCardScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
```

- [ ] **Step 3: Add the nav-bar button on Wine Detail**

In `src/screens/detail/WineDetailScreen.tsx`, in the nav bar's right-side button group (currently lines 322-335), add a "Card" button between Edit and Share:

```tsx
        <View style={styles.navRight}>
          {/* Edit button */}
          {!confirmDelete && (
            <Pressable onPress={handleEditEntry} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Edit</Text>
            </Pressable>
          )}

          {/* Share card button */}
          {!confirmDelete && (
            <Pressable
              onPress={() => navigation.navigate('ShareCard', { entryId: entry.id })}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>Card</Text>
            </Pressable>
          )}

          {/* Share button */}
          {!confirmDelete && (
            <Pressable onPress={handleShare} style={styles.navBtn}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          )}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors — this is the point where Task 6 and Task 7's mutual dependency on the `ShareCard` route type resolves cleanly.

- [ ] **Step 5: Manual verification**

Run `expo start`, open a wine's detail screen, and confirm:
- A "Card" button appears in the nav bar between Edit and Share.
- Tapping it navigates to the Share Card screen with a slide-up animation.
- The screen shows a loading spinner briefly, then a rendered card preview matching the approved design (wine name, PAA score, region, descriptor pills, tier-3 row, footer).

- [ ] **Step 6: Commit**

```bash
git add src/navigation/types.ts src/navigation/MainNavigator.tsx src/screens/detail/WineDetailScreen.tsx
git commit -m "Wire ShareCard screen into navigation and Wine Detail nav bar"
```

---

### Task 9: Render attachments in the messaging UI

**Files:**
- Modify: `src/screens/messages/MessageDetailScreen.tsx`
- Modify: `src/screens/messages/InboxScreen.tsx`

**Interfaces:**
- Consumes: `DirectMessage.attachment_url` (Task 4).

- [ ] **Step 1: Render an image bubble in `MessageDetailScreen`**

In `src/screens/messages/MessageDetailScreen.tsx`, replace the message bubble rendering (currently lines 135-149):

```tsx
              messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <View key={m.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
                        {m.content}
                      </Text>
                    </View>
                    <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                      {formatTimestamp(m.created_at)}
                    </Text>
                  </View>
                );
              })
```

with:

```tsx
              messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <View key={m.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      {m.attachment_url ? (
                        <Image source={{ uri: m.attachment_url }} style={styles.bubbleImage} resizeMode="cover" />
                      ) : null}
                      {m.content ? (
                        <Text
                          style={[
                            styles.bubbleText,
                            mine && styles.bubbleTextMine,
                            m.attachment_url ? styles.bubbleTextWithImage : undefined,
                          ]}
                        >
                          {m.content}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                      {formatTimestamp(m.created_at)}
                    </Text>
                  </View>
                );
              })
```

Then add two new styles to the `StyleSheet.create` call (after `bubbleTextMine`, currently lines 280-282):

```ts
  bubbleTextMine: {
    color: Colors.ink,
  },
  bubbleImage: {
    width: 220,
    aspectRatio: 1080 / 1920,
    borderRadius: Radius.md,
  },
  bubbleTextWithImage: {
    marginTop: 8,
  },
```

- [ ] **Step 2: Fix the conversation preview text in `InboxScreen`**

In `src/screens/messages/InboxScreen.tsx`, inside `ConversationRow` (currently lines 40-81), replace:

```tsx
  const unread = conversation.unreadCount > 0;
  const mineLast = conversation.lastMessage.sender_id === currentUserId;
  return (
```

with:

```tsx
  const unread = conversation.unreadCount > 0;
  const mineLast = conversation.lastMessage.sender_id === currentUserId;
  const previewText =
    conversation.lastMessage.content ||
    (conversation.lastMessage.attachment_url ? '📷 Wine card' : '');
  return (
```

And replace the preview `<Text>` (currently lines 65-71):

```tsx
          <Text
            style={[styles.rowPreview, unread && styles.rowPreviewUnread]}
            numberOfLines={2}
          >
            {mineLast ? 'You: ' : ''}
            {conversation.lastMessage.content}
          </Text>
```

with:

```tsx
          <Text
            style={[styles.rowPreview, unread && styles.rowPreviewUnread]}
            numberOfLines={2}
          >
            {mineLast ? 'You: ' : ''}
            {previewText}
          </Text>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/screens/messages/MessageDetailScreen.tsx src/screens/messages/InboxScreen.tsx
git commit -m "Render wine card attachments in message bubbles and inbox previews"
```

---

### Task 10: End-to-end verification against acceptance criteria

**Files:** none (manual QA pass — this repo has no e2e harness).

> **2026-09-06 update:** After Tasks 1–9 shipped, client review determined the card design should be `VivinoStyleCard` (existing wine-detail card: Playfair Display / DM Sans, star rating, style-axis sliders, food pairings, variable height) rather than the `WineCardTemplate` this task was originally written against (Fraunces / Work Sans, fixed 1080×1920 canvas, PAA-score layout). `ShareCardScreen` and `ShareSheet`'s "Share on Social" both now capture `VivinoStyleCard`. Steps 3 and 4 below are written for the old template and no longer apply as stated — see the strikethrough notes. `WineCardTemplate.tsx` itself is unused but left in place.

- [x] **Step 1: Real-data render check** — confirmed via TestFlight (build 50): card fields (price, wine name, star rating, technical score, style sliders, pairings, flags) match real entry data.

- [ ] **Step 2: Missing-field graceful omission check**

Open a wine entry with no `label_photo_url` and no `grape_blends`/`grapes`. Confirm the card renders without a photo slot and without a grape/varietal segment — no broken image, no crash, no empty gap left behind. *(Not yet verified.)*

- [ ] ~~**Step 3: Font rendering check**~~ — moot: card is now `VivinoStyleCard`, which intentionally uses the app's default Playfair Display / DM Sans, not Fraunces/Work Sans.

- [ ] ~~**Step 4: Resolution check**~~ — moot: `VivinoStyleCard` has no fixed 1080px-wide canvas; it captures at the device's natural preview width. Re-scope if a minimum export resolution is still wanted for the new design.

- [x] **Step 5: External share check** — confirmed via TestFlight (build 50): "Share on Social" opens Instagram Stories with the correct `VivinoStyleCard` image attached.

- [x] **Step 6: In-app share check** — confirmed via TestFlight (build 50): "Send to PAA member" sends successfully with the correct card design ("Send to members is also correct").

- [x] **Step 7: Privacy check** — confirmed via screenshot: no username/display name/handle appears on the rendered card image itself.

- [ ] **Step 8: Cross-platform check** — iOS confirmed above; Android not yet re-verified against the current build (the photo-upload fix was confirmed on Android earlier, but not this card design specifically).

- [ ] **Step 9: Final commit** — fixes for this pass landed in `67546ee`, `fff9f37`, `f732dcb` on `claude/pour-across-america-app-WUTLG`. Remaining open items above (Step 2, Step 8) still need a pass before this task can be closed.
