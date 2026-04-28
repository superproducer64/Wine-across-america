# Pour Across America — Build Report
**Date:** April 27, 2026
**App:** Pour Across America (React Native / Expo SDK 51 / Supabase)
**Platform targets:** iOS (TestFlight via EAS Build) + Web (port 5000)

---

## Summary

| Task | Area | Time Spent |
|------|------|------------|
| Price glass/bottle pill slider | UX Improvement | ~20 min |
| Tasting date calendar picker | UX Improvement | ~25 min |
| Aromas "Other" free-form text input | Feature | ~20 min |
| **Total** | | **~1 hr 5 min** |

---

## Task 1 — Price Glass/Bottle Pill Slider
**Time:** ~20 min

Replaced the two stacked price input rows ("Per glass" / "Per bottle") with a compact animated pill toggle that shows only one input at a time, saving vertical space on the wine entry form.

### Before → After

**Before:** Two separate rows, each with an Amount + Currency field:
```
Per glass
[ Amount    ] [ USD ]

Per bottle
[ Amount    ] [ USD ]
```

**After:** A single animated pill toggle + one price row:
```
┌──────────────────────┐
│ ● Glass  │  Bottle   │
└──────────────────────┘
[ Amount              ] [ USD ]
```

### Technical Implementation

**Animation (`src/screens/entry/steps/Step1Basics.tsx`)**
- `priceMode` state: `'glass' | 'bottle'`, defaults to `'glass'`
- `priceAnim` — `Animated.Value(0)` (0 = glass, 1 = bottle)
- `handlePriceMode()` — updates state and fires `Animated.spring()` with `tension: 280, friction: 28` for a snappy, natural feel
- `useNativeDriver: true` for 60fps performance on device

**Pill layout**
- Outer container measures its own width via `onLayout` → stores in `toggleWidth` state
- Animated indicator: `width = (toggleWidth - 4) / 2`, positioned absolutely, slides via `translateX` interpolation between `2` and `(toggleWidth - 4) / 2 + 2`
- Both option `Pressable` elements are `zIndex: 1` so they receive taps above the sliding indicator
- `alignSelf: 'flex-start'` keeps the pill compact rather than full-width
- Gold (`Colors.gold`) indicator background; active label uses `Fonts.dmSansMedium`, inactive uses `Fonts.dmSansRegular` at muted color

**Data integrity**
- Both glass and bottle prices are stored independently in `draft.price[]` — switching modes does not clear the other type's value
- Legacy untyped price entries (old single-price format) are handled via the existing `getPriceEntry()` fallback

**Files changed:**
- `src/screens/entry/steps/Step1Basics.tsx`

---

## Task 2 — Tasting Date Calendar Picker
**Time:** ~25 min

Replaced the free-form `YYYY-MM-DD` text input for Tasting Date with a custom calendar date picker component. The picker works identically on web and native with no additional packages required.

### User Flow

1. Tapping the date field opens a modal overlay with a full month calendar
2. **‹** and **›** arrows navigate months backward and forward
3. Tapping a day selects it, closes the modal, and updates the field
4. The field displays the date in natural language: *"April 27, 2026"*
5. Tapping outside the calendar dismisses without changing the value

### Component: `DatePickerInput` (`src/components/ui/DatePickerInput.tsx`) *(new)*

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `label` | `string?` | Optional uppercase label above the field |
| `value` | `string` | ISO date string `YYYY-MM-DD` or `''` |
| `onChange` | `(value: string) => void` | Called on day selection |
| `placeholder` | `string?` | Shown when no date is selected |

**Calendar grid logic**
- `buildGrid()` — computes `firstDow` (day of week for the 1st), fills leading `null` cells, then days 1–N, then trailing `null` cells to fill the last row to 7 columns
- Grid rendered as `Math.ceil(cells.length / 7)` rows × 7 columns
- `toISO(year, month, day)` — zero-pads month and day for consistent `YYYY-MM-DD` output
- `parseDate()` — appends `T12:00:00` to avoid UTC offset issues causing off-by-one-day display errors

**Visual indicators**
| State | Style |
|-------|-------|
| Selected day | Filled gold circle (34×34, `borderRadius: 17`) |
| Today | Gold ring border (`borderWidth: 1.5, borderColor: Colors.gold`) |
| Normal day | Transparent, `Colors.ink` text |
| Empty cell | `color: 'transparent'` (no text) |

**Modal**
- React Native `Modal` with `animationType: 'fade'` and `transparent: true`
- Backdrop is `TouchableWithoutFeedback` → `setOpen(false)` on tap
- Sheet: `maxWidth: 360`, centered, gold/ink nav arrows, `Fonts.playfairSemiBold` month title

**Storage format**
- Saves as `YYYY-MM-DD` — identical to the previous free-text format, so no database migration or existing data changes are required

**Files changed:**
- `src/components/ui/DatePickerInput.tsx` *(new)*
- `src/screens/entry/steps/Step1Basics.tsx` — replaced `TextInput` with `DatePickerInput`

---

## Task 3 — Aromas "Other" Free-Form Text Input
**Time:** ~20 min

Added a multiline free-text field specifically under the **✨ Other** aroma category, allowing users to describe unusual or uncatalogued aromas that aren't covered by the existing chip options.

### User Flow

1. User taps **✨ Other** in the aroma categories — category highlights and expands
2. Existing subcategory chips appear (Petrol, Rubber, Smoke, Butter, Cream)
3. Below the chips, a labelled text box appears: **"Describe other aromas"**
4. Placeholder: *"e.g. wet slate, incense, beeswax…"*
5. Typed text is saved live to the draft
6. The **Selected** summary card at the bottom shows the note prefixed with ✨

### Technical Implementation

**Type: `src/types/index.ts`**
- `aromas_other_note: string | null` added to `WineEntry` interface
- Automatically propagates to `WineEntryDraft` via the existing `Omit<WineEntry, …>` alias — no separate draft type change needed

**Store: `src/stores/entryDraftStore.ts`**
- `aromas_other_note: null` added to `makeDefaultDraft()`
- New `setAromasOtherNote(note: string)` setter: saves non-empty strings, converts empty string to `null`
- Interface updated with `setAromasOtherNote: (note: string) => void`

**UI: `src/screens/entry/steps/Step3Aromas.tsx`**
- `RNTextInput` imported from React Native (aliased to avoid conflict with the shared `TextInput` component)
- `cat.id === 'other'` guard — the text box only renders under the Other category block, not any other expanded category
- Input: multiline, `numberOfLines: 3`, `textAlignVertical: 'top'`, `minHeight: 80`
- Styled with a bordered card matching the app's surface/border palette
- Summary section updated: `{draft.aromas_other_note ? <Text>✨ {draft.aromas_other_note}</Text> : null}`

**Database**
- `aromas_other_note` column must be added to `wine_entries` (one-time migration):

```sql
ALTER TABLE public.wine_entries
ADD COLUMN IF NOT EXISTS aromas_other_note TEXT;
```

**Files changed:**
- `src/types/index.ts`
- `src/stores/entryDraftStore.ts`
- `src/screens/entry/steps/Step3Aromas.tsx`

---

## Database Changes — April 27

| Column | Table | Type | Purpose |
|--------|-------|------|---------|
| `aromas_other_note` | `wine_entries` | `TEXT` | Stores free-form other aroma description |

---

## Pending SQL (Run in Supabase Dashboard)

```sql
ALTER TABLE public.wine_entries
ADD COLUMN IF NOT EXISTS aromas_other_note TEXT;
```

---

## End-of-Day Status

| Feature | Status |
|---------|--------|
| Price glass/bottle pill slider | Working |
| Tasting date calendar picker | Working |
| Aromas "Other" free-form text | Working |
| All existing features | Unaffected |

---

*Report generated April 27, 2026*
