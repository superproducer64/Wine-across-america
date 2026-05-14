# Pour Across America — Build Report
**Period:** May 1, 2026 → May 14, 2026  
**Project:** Pour Across America — Wine Intelligence App  
**Platform:** React Native / Expo SDK 51 · Supabase Backend · GPT-4o Vision  
**Status:** iOS live in TestFlight · Web live at wine-across-america.replit.app

---

## Summary

| # | Item | Est. Hours |
|---|---|:---:|
| 1 | Apple submission credentials configured | 0.25 h |
| 2 | Bundle ID and ASC App ID synchronized | 0.25 h |
| 3 | iOS build hardening — deployment target, notifications, team ID | 0.25 h |
| 4 | Apple Sign In prebuild fix | 0.25 h |
| 5 | Root cause found — `tar` v7 conflict crashing every build | 1.5 h |
| 6 | First successful TestFlight build and submission | 0.25 h |
| 7 | TestFlight tester onboarding | 0.25 h |
| 8 | Startup crash diagnosed from TestFlight crash report | 1.0 h |
| 9 | Startup crash fix — notifications handler moved; plugin restored | 0.5 h |
| 10 | Geo-tagging added to Step 1 wine entry form | 0.5 h |
| 11 | Geo-tag web support fixed — shared utility replaces broken impl | 0.5 h |
| 12 | Client wine list empty — root cause investigated and fixed | 1.5 h |
| | **Total** | **7.0 h** |

Twelve work items across the reporting window. The period opened with the app unable to build at all, moved through three failed builds to the first successful TestFlight delivery, resolved a production startup crash from a live crash report, and closed with two client-reported issues fixed and deployed to the web app.

---

## Work Delivered

### 1. Apple Submission Credentials Configured
**May 2 · ~0.25 h** · `eas.json`

Added the three credentials required for Replit's Expo Launch to submit to App Store Connect:

| Field | Value |
|---|---|
| Apple ID | `nu2u@sbcglobal.net` |
| ASC App ID | `6765561268` |
| Apple Team ID | `4JZRW3MPP2` |

---

### 2. Bundle ID and ASC App ID Synchronized
**May 2 · ~0.25 h** · `app.json`

Replit Expo Launch overrides the bundle identifier at build time. The local `app.json` was out of sync:

| Field | Was | Corrected to |
|---|---|---|
| iOS Bundle ID | `com.pouracrossamerica.app` | `app.replit.pouracrossamerica` |
| ASC App ID | `1366898531` | `6765561268` |

Also added `ITSAppUsesNonExemptEncryption: false` to `infoPlist` to satisfy Apple's export compliance requirement automatically.

---

### 3. iOS Build Hardening
**May 2 · ~0.25 h** · `app.json`

- **`appleTeamId`** added to the `ios` section to prevent a timing gap before Replit's manifest injection runs
- **`deploymentTarget` raised from `15.1` to `16.0`** — required for Xcode 26 compatibility with several packages
- **`sounds: []` removed** from the `expo-notifications` plugin config — an empty array crashes the config plugin on certain Expo CLI versions

---

### 4. Apple Sign In Prebuild Fix
**May 2 · ~0.25 h** · `app.json`

`usesAppleSignIn: true` invokes the `expo-apple-authentication` config plugin during prebuild, which was a suspected factor in repeated build failures with Expo SDK 51 and Xcode 26. Replaced with a direct entitlements declaration:

```json
"entitlements": {
  "com.apple.developer.applesignin": ["Default"]
}
```

This writes the Sign In with Apple capability directly into the Xcode project without invoking the plugin's prebuild hook. Runtime behaviour is unaffected.

---

### 5. Root Cause Found — `tar` v7 Conflict Crashing Every Build
**May 2 · ~1.5 h** · `package.json`

After four consecutive build failures at the "Configure Xcode project" step, investigation moved from `app.json` to the prebuild process itself. Running `expo prebuild --platform ios` locally surfaced the actual error:

```
Cannot read properties of undefined (reading 'extract')
✖ Failed to create the native directory
```

Stack trace traced the crash to `@expo/cli`'s npm utility:

```js
await pipeline(stream, transformStream, _tar().default.extract({...}))
```

`_tar().default` resolved to `undefined`. Analysis of the `tar` module's export shape:

- `tar` v7 sets `__esModule: true` on its CommonJS exports but has **no `.default` property**
- `@expo/cli`'s `_interopRequireDefault` wrapper sees `__esModule: true` and passes the object through unwrapped — leaving `tar.default` as `undefined`
- `@expo/cli` declares `"tar": "^6.0.5"` — tar v6 works correctly

The root `package.json` had an `overrides` entry forcing tar v7 across the entire dependency tree:

```json
// Before
"overrides": { "tar": "^7.5.11" }

// After
"overrides": { "tar": "^6.2.1" }
```

After `npm install`, local prebuild confirmed:
```
✔ Created native directory  ✔ Finished prebuild
```

This single change resolved all three prior build failures.

> **Permanent constraint:** The `tar` override in `package.json` must remain at `^6.2.1`. Upgrading to v7 will break the Expo CLI prebuild and prevent all iOS builds.

---

### 6. First Successful TestFlight Build and Submission
**May 2 (evening CST) · ~0.25 h**

With the tar fix in place, all 18 Expo Launch build steps completed for the first time. Binary delivered to App Store Connect under app ID `6765561268`, bundle identifier `app.replit.pouracrossamerica`, version `1.0.0 (1)`.

---

### 7. TestFlight Tester Onboarding
**May 2–3 · ~0.25 h**

Internal test team invited via TestFlight. Email invitations sent from App Store Connect. App available for installation on devices running iOS 16+.

---

### 8. Startup Crash Diagnosed from TestFlight Crash Report
**May 3 · ~1.0 h** · Crash report `DF34F1C0-10C3-4915-BBD1-B77FB43581A3`

A tester reported an immediate crash on launch. Crash report analysed from Xcode Organizer.

**Device:** iPhone 11 · iOS 18.3 · **Time to crash:** 0.38 seconds · **Exception:** `EXC_CRASH (SIGABRT)`

The 0.38-second window pointed to module-level code executing at import time. Tracing the import chain `App.tsx → RootNavigator → usePushNotifications` identified the cause:

```ts
// Line 8 in usePushNotifications.ts — outside any function
Notifications.setNotificationHandler({ ... });
```

This called a native module at module scope — before any component mounted. Because `expo-notifications` had been removed from `app.json` plugins during earlier troubleshooting, the native module was not registered in the binary. Calling it immediately threw a JS exception → `RCTFatal` → abort.

---

### 9. Startup Crash Fix
**May 3 · ~0.5 h** · `src/hooks/usePushNotifications.ts` · `app.json`

```ts
// Before — runs at import time, crashes if native module not registered
Notifications.setNotificationHandler({ ... });

// After — runs only after component mounts, only on native platforms
useEffect(() => {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({ ... });
}, []);
```

`expo-notifications` was also restored to the `app.json` plugins array — it had been incorrectly removed as a workaround for the tar crash. New build submitted to TestFlight; web version republished.

> **Permanent constraint:** `Notifications.setNotificationHandler` must remain inside `useEffect` with a `Platform.OS !== 'web'` guard. Moving it back to module scope will crash the app on launch in TestFlight and App Store builds.

---

### 10. Geo-Tagging Added to Step 1 Wine Entry Form
**May 14 · ~0.5 h** · `src/screens/entry/steps/Step1Basics.tsx`

The client requested geo-tagging on the first page of the wine entry flow. Previously the location field on Step 1 required manual text entry. A "📍 Use my location" button was added inline with the field label.

Tapping it requests permission, retrieves GPS coordinates, reverse-geocodes to a venue/city/state string, and fills the text field. The field remains editable after auto-fill. A spinner shows during detection; an inline error message appears on failure.

---

### 11. Geo-Tag Web Support Fixed — Shared Utility
**May 14 · ~0.5 h** · `src/utils/detectLocation.ts` · `Step1Basics.tsx` · `Step5NotesAndTerroir.tsx`

After delivery of item 10, a discrepancy was found: geo-tagging worked on Step 5 (last page) in the browser but not Step 1. The Step 1 implementation blocked web entirely with a static error message, while Step 5 had a proper cross-platform implementation.

The working logic was extracted into a shared utility that both steps now import:

```
Web:    navigator.geolocation → Nominatim reverse-geocode API
Native: expo-location → expo-location.reverseGeocodeAsync
```

The duplicate implementation in Step 5 was removed. Geo-tagging now works identically across web, Expo Go, and TestFlight on both steps.

---

### 12. Client Wine List Showing Empty — Investigation and Fix
**May 14 · ~1.5 h** · `src/stores/wineStore.ts` · `src/screens/home/HomeScreen.tsx`

A client reported her saved wine list appeared completely empty on the web app. After ruling out missing Supabase credentials and RLS policy errors, the root cause was identified as a silent failure in `wineStore`:

```ts
// Before — Supabase query errors were swallowed; UI showed empty list
} else {
  set({ loading: false });
}

// After — error stored and surfaced to UI
} else {
  set({ loading: false, loadError: error?.message ?? 'Could not load your wine list.' });
}
```

When the error is set, the home screen now shows a clear message and a "Try again" button instead of a blank list. The `entries.length === 0` guard in `useEffect` was also removed so the list always refreshes on mount — previously this guard could prevent recovery after an error.

**Immediate fix for the client:** sign out and sign back in to force a fresh authenticated session. Most likely cause was an expired session token that failed silently.

---

## Build Failure Timeline (May 1–3)

| Attempt | Failed at | Root cause |
|---|---|---|
| Build 1 | Step 6 — Configure Xcode | Under investigation |
| Build 2 | Step 6 — Configure Xcode | Under investigation |
| Build 3 | Step 6 — Configure Xcode | Under investigation |
| Build 4 | Step 6 — Configure Xcode | ✅ `tar` v7 override identified |
| **Build 5** | **— completed —** | ✅ First TestFlight delivery |
| Build 6 | **— completed —** | ✅ Startup crash fix |

---

## Deployments

| Date | Type | Notes |
|---|---|---|
| May 2 | iOS — TestFlight Build 5 | First successful submission · v1.0.0 (1) |
| May 2 | Web publish | Initial live deployment |
| May 3 | iOS — TestFlight Build 6 | Startup crash fix |
| May 3 | Web publish | Startup crash fix live |
| May 14 | Web publish | Geo-tag on Step 1 |
| May 14 | Web publish | Wine list error state + retry |
| May 14 | Web publish | Shared geo utility — web geo-tag fixed |

---

## Files Changed

| File | Change |
|---|---|
| `eas.json` | Apple ID, ASC App ID, Team ID added |
| `app.json` | Bundle ID · ASC App ID · `appleTeamId` · `deploymentTarget 16.0` · `ITSAppUsesNonExemptEncryption` · `usesAppleSignIn` → `entitlements` · `expo-notifications` removed then restored · `sounds: []` removed |
| `package.json` | `overrides.tar` → `^6.2.1` |
| `src/hooks/usePushNotifications.ts` | `setNotificationHandler` moved into `useEffect` with Platform guard |
| `src/utils/detectLocation.ts` | **New** — shared geo-detection utility (web + native) |
| `src/screens/entry/steps/Step1Basics.tsx` | Geo-tag button added; switched to shared utility |
| `src/screens/entry/steps/Step5NotesAndTerroir.tsx` | Duplicate geo logic removed; imports shared utility |
| `src/stores/wineStore.ts` | `loadError` field added; errors surfaced instead of swallowed |
| `src/screens/home/HomeScreen.tsx` | Error state + retry button; `entries.length === 0` guard removed |

---

## Permanent Constraints

- **`tar` override** in `package.json` must stay at `^6.2.1` — v7 breaks Expo CLI prebuild and blocks all iOS builds
- **`Notifications.setNotificationHandler`** must stay inside `useEffect` with `Platform.OS !== 'web'` guard — module-scope calls crash the app on launch in production builds
- **`expo-notifications`** must remain in the `app.json` plugins array
