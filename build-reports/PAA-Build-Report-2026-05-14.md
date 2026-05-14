# Pour Across America — Build Report
**Period:** May 3, 2026 → May 14, 2026  
**Project:** Pour Across America — Wine Intelligence App  
**Platform:** React Native / Expo SDK 51 · Supabase Backend · GPT-4o Vision  
**Status:** Web app live at wine-across-america.replit.app · iOS live in TestFlight

---

## Summary

| # | Item | Est. Hours |
|---|---|:---:|
| 1 | Geo-tagging added to Step 1 wine entry form | 0.5 h |
| 2 | Geo-tag web support broken — root cause identified | 0.25 h |
| 3 | Geo-tag logic extracted to shared utility; web + native both working | 0.5 h |
| 4 | Client wine list showing empty — root cause investigated | 1.0 h |
| 5 | Error state and retry button added to wine list | 0.5 h |
| | **Total** | **2.75 h** |

Five work items across the reporting window. Work covered two client-reported issues and one proactive reliability improvement. All changes are live on the web app; an iOS TestFlight build is ready to submit when scheduled.

---

## Work Delivered

### 1. Geo-Tagging Added to Step 1 Wine Entry Form
**Commit:** `babb68e` · May 14 · **~0.5 h**  
**File:** `src/screens/entry/steps/Step1Basics.tsx`

The client requested that geo-tagging (automatic location detection) be available on the first page of the wine entry flow. Previously, a location field existed on Step 1 but required manual text entry. A "📍 Use my location" button was added inline with the Location field label.

**Behaviour:**
- Tapping the button requests location permission, retrieves GPS coordinates, and reverse-geocodes them to a human-readable venue/city/state string that fills the text field automatically
- The field remains fully editable after auto-fill
- A spinner shows while the location is being detected
- An inline error message appears if permission is denied or detection fails

---

### 2. Geo-Tag Web Support Broken — Root Cause Identified
**May 14 · ~0.25 h**

After delivery, a discrepancy was identified: geo-tagging worked on Step 5 (last page) but not on Step 1 in the web browser. The root cause was a difference in implementation:

| | Step 5 (working) | Step 1 (broken) |
|---|---|---|
| Web | `navigator.geolocation` — browser's native API | Blocked with "GPS not available on web" error |
| Native (iPhone) | `expo-location` | `expo-location` |

Step 1 had been written to short-circuit on web entirely, while Step 5 had a full implementation using `navigator.geolocation` on web and the Nominatim API for reverse geocoding.

---

### 3. Geo-Tag Logic Extracted to Shared Utility — Web and Native Both Working
**Commit:** `ea13d70` · May 14 · **~0.5 h**  
**Files:** `src/utils/detectLocation.ts` · `src/screens/entry/steps/Step1Basics.tsx` · `src/screens/entry/steps/Step5NotesAndTerroir.tsx`

The working geo-detection logic from Step 5 was extracted into a shared utility so both steps use identical, tested code. The duplicate implementation in Step 5 was removed.

**`src/utils/detectLocation.ts` — shared logic:**

```
Web path:
  navigator.geolocation.getCurrentPosition()
  → Nominatim reverse-geocode API (restaurant/venue name, city, state)

Native path:
  expo-location.requestForegroundPermissionsAsync()
  → expo-location.getCurrentPositionAsync()
  → expo-location.reverseGeocodeAsync()
```

Both Step 1 and Step 5 now call `detectLocation()` from the shared utility. Geo-tagging works identically in all environments — web browser, Expo Go, and TestFlight.

---

### 4. Client Wine List Showing Empty — Root Cause Investigated
**May 14 · ~1.0 h**  
**Files reviewed:** `src/stores/wineStore.ts` · `src/screens/home/HomeScreen.tsx` · `src/lib/supabase.ts` · `src/stores/authStore.ts` · `src/navigation/RootNavigator.tsx` · `supabase/migrations/001_initial_schema.sql`

A client reported that her saved wine list appeared completely empty on the web app (wine-across-america.replit.app). Investigation covered:

**Ruled out:**
- Missing Supabase environment variables — both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` confirmed present as secrets
- RLS policy errors — `wine_entries_owner_all` policy correctly scoped to `auth.uid() = user_id`
- Deployment build command — `.env.local` written correctly before `expo export`

**Root cause identified — silent failure in `wineStore.loadEntries`:**

```ts
// Before fix — error swallowed silently, entries stays []
if (!error && data) {
  set({ entries: data, ... });
} else {
  set({ loading: false });   // ← no error surfaced to UI
}
```

When the Supabase query fails for any reason (expired session token, network issue, etc.) the store sets `loading: false` and leaves `entries` as an empty array. The UI renders an identical state to a user who genuinely has no wines — no way for the client to know something went wrong.

**Most likely immediate cause:** Expired auth session. The fix for the client was to sign out from Settings and sign back in, which forces a fresh authenticated session and re-triggers the wine list load.

---

### 5. Error State and Retry Button Added to Wine List
**Commit:** `e4ec1f4` · May 14 · **~0.5 h**  
**Files:** `src/stores/wineStore.ts` · `src/screens/home/HomeScreen.tsx`

Two changes were made to prevent this type of silent failure from affecting clients again:

**`wineStore.ts` — `loadError` field added:**

```ts
// After fix — error stored and surfaced
} else {
  set({
    loading: false,
    loadError: error?.message ?? 'Could not load your wine list. Please try again.',
  });
}
```

**`HomeScreen.tsx` — error state displayed with retry:**

When `loadError` is set, the wine list area now shows:
- A clear message explaining something went wrong
- A "Try again" button (gold pill) that re-triggers `loadEntries`

The `entries.length === 0` guard in `useEffect` was also removed. This guard was intended to avoid re-fetching on back-navigation but had the side effect of preventing a reload in error recovery scenarios. Wine entries now always refresh when the home screen mounts with an authenticated user.

---

## Client Issues Resolved

| Issue | Status | Resolution |
|---|---|---|
| "Geo-tag doesn't work on first page of entry" | ✅ Resolved | Shared utility — web + native both working |
| "Can't see my saved wine list" | ✅ Resolved | Sign out / sign back in; error state added for future occurrences |

---

## Files Changed

| File | Change |
|---|---|
| `src/utils/detectLocation.ts` | **New file** — shared geo-detection utility (web + native) |
| `src/screens/entry/steps/Step1Basics.tsx` | Geo-tag button added; switched from broken web impl to shared utility |
| `src/screens/entry/steps/Step5NotesAndTerroir.tsx` | Duplicate `detectLocation` / `reverseGeocodeWeb` removed; imports shared utility |
| `src/stores/wineStore.ts` | `loadError` field added; error surfaced instead of swallowed |
| `src/screens/home/HomeScreen.tsx` | Error state + retry button; `entries.length === 0` guard removed |

---

## Deployments

| Date | Type | Notes |
|---|---|---|
| May 14 | Web publish | Geo-tag on Step 1 |
| May 14 | Web publish | Error state + retry on wine list |
| May 14 | Web publish | Shared geo utility — web geo-tag fixed |

---

## Technical Notes

- **`navigator.geolocation` vs `expo-location`:** On web, `expo-location` APIs are not available — they wrap native iOS/Android location modules. Web geo-detection must use the browser's `navigator.geolocation` API. The `detectLocation` utility handles this branching at runtime via `Platform.OS === 'web'`.
- **Nominatim reverse geocoding:** The Expo SDK's `reverseGeocodeAsync` is not available on web. Nominatim (`nominatim.openstreetmap.org/reverse`) is used as the web reverse-geocode provider — it is free, requires no API key, and returns structured address data including venue names (restaurant, cafe, bar), neighbourhood, city, and country.
- **Silent Supabase errors:** The Supabase JS client does not throw on query failure — it returns `{ data: null, error: PostgrestError }`. Any code path that only checks `if (!error && data)` will silently leave the UI in a default/empty state. All data-loading functions should store and surface the error value.
- **Expo Go limitations:** Expo Go supports the full wine logging, search, camera, and geo-tagging features of the app. Push notifications are not functional in Expo Go and require a TestFlight or production build. The published web link (wine-across-america.replit.app) is the recommended option for client demos — no installation required.
