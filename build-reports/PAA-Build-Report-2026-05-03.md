# Pour Across America — Build Report
**Period:** May 1, 2026 → May 3, 2026  
**Project:** Pour Across America — Wine Intelligence App  
**Platform:** React Native / Expo SDK 51 · Supabase Backend · GPT-4o Vision  
**Status:** iOS live in TestFlight · Startup crash diagnosed and fixed · New build submitted

---

## Summary

| # | Item | Est. Hours |
|---|---|:---:|
| 1 | Apple submission credentials configured | 0.25 h |
| 2 | Bundle ID and ASC App ID synchronized to Replit Launch values | 0.25 h |
| 3 | iOS build hardening — deployment target, team ID, notifications config | 0.25 h |
| 4 | Apple Sign In prebuild fix — `usesAppleSignIn` replaced with direct entitlements | 0.25 h |
| 5 | Root cause investigation — `tar` version conflict crashing prebuild | 1.5 h |
| 6 | First successful TestFlight build and submission confirmed | 0.25 h |
| 7 | TestFlight tester onboarding initiated | 0.25 h |
| 8 | Startup crash diagnosed from TestFlight crash report | 1.0 h |
| 9 | Startup crash fix — notifications handler moved; plugin restored | 0.5 h |
| | **Total** | **4.5 h** |

Nine work items across the reporting window. Work covered the full arc from first App Store submission through three build failures, root-cause investigation of a deep dependency conflict, first successful TestFlight delivery, tester onboarding, and a production crash fix from a live device report.

---

## Work Delivered

### 1. Apple Submission Credentials Configured
**Commit:** `5576901` · May 2 · **~0.25 h**  
**File:** `eas.json`

Added the three credentials required for Replit's Expo Launch to submit to App Store Connect:

| Field | Value |
|---|---|
| Apple ID | `nu2u@sbcglobal.net` |
| ASC App ID | `6765561268` |
| Apple Team ID | `4JZRW3MPP2` |

The `submit.production.ios` block in `eas.json` is now complete and will be picked up automatically on every production build triggered through Replit.

---

### 2. Bundle ID and ASC App ID Synchronized to Replit Launch Values
**Commit:** `0abeabf` · May 2 · **~0.25 h**  
**File:** `app.json`

Analysis of the Replit Expo Launch build pipeline revealed that the platform overrides the bundle identifier at build time via its `expo:manifest` injection step. The local `app.json` was out of sync on two fields:

| Field | Was | Corrected to |
|---|---|---|
| iOS Bundle ID | `com.pouracrossamerica.app` | `app.replit.pouracrossamerica` |
| ASC App ID (eas.json) | `1366898531` | `6765561268` |

Also added `ITSAppUsesNonExemptEncryption: false` to `infoPlist` to satisfy Apple's export compliance requirement without a manual declaration step during review.

---

### 3. iOS Build Hardening — Deployment Target, Team ID, Notifications
**Commit:** `c9d2b68` · May 2 · **~0.25 h**  
**File:** `app.json`

Three additional hardening changes applied ahead of build attempts:

- **`appleTeamId: "4JZRW3MPP2"`** added to the `ios` section — ensures the value is present locally before Replit's manifest injection runs, preventing a timing gap during prebuild
- **`deploymentTarget` raised from `"15.1"` to `"16.0"`** — Xcode 26 (the build image Apple now requires) has known prebuild failures with targets below 16.0 on several packages
- **`sounds: []` removed** from the `expo-notifications` plugin config — an empty array in this field can crash the notifications config plugin during prebuild on certain Expo CLI versions

---

### 4. Apple Sign In Prebuild Fix — Direct Entitlements
**Commit:** `97c0aec` · May 2 · **~0.25 h**  
**File:** `app.json`

`usesAppleSignIn: true` in `app.json` triggers the `expo-apple-authentication` config plugin during prebuild. With Expo SDK 51 and Xcode 26 this plugin was a suspected cause of the repeated "Could not find the Xcode project file" failure.

**Fix:** Removed `usesAppleSignIn: true` and replaced it with a direct entitlements declaration:

```json
"entitlements": {
  "com.apple.developer.applesignin": ["Default"]
}
```

This writes the Sign In with Apple capability directly into the Xcode project without invoking the plugin's prebuild hook. Apple Sign In functionality in `LoginScreen.tsx` is unaffected at runtime — the change is build-time only.

---

### 5. Root Cause Found — `tar` Version Conflict Crashing Prebuild
**Commit:** `50aec2c` · May 2 · **~1.5 h**  
**File:** `package.json`

After four consecutive build failures at step 6 (`xcode:configure` — "Could not find the Xcode project file"), investigation moved from `app.json` configuration to the prebuild process itself. Running `expo prebuild --platform ios` locally surfaced the actual error hidden by the build system:

```
Cannot read properties of undefined (reading 'extract')
✖ Failed to create the native directory
```

Stack trace analysis traced the crash to `@expo/cli/build/src/utils/npm.js` line 174:

```js
await pipeline(stream, transformStream, _tar().default.extract({...}))
```

`_tar().default` resolved to `undefined`. Investigation of the `tar` module's export shape revealed:

- `tar` v7.5.13 sets `__esModule: true` on its CommonJS exports but has **no `.default` property**
- `@expo/cli`'s `_interopRequireDefault` wrapper sees `__esModule: true` and passes the object through unwrapped — leaving `tar.default` as `undefined`
- `@expo/cli` declares `"tar": "^6.0.5"` in its own `package.json` — tar v6 does not have `__esModule: true` and works correctly

**Root cause in `package.json`:**

```json
"overrides": {
  "tar": "^7.5.11"   ← was forcing tar v7 across the entire dependency tree
}
```

**Fix:**

```json
"overrides": {
  "tar": "^6.2.1"   ← aligned with @expo/cli's requirement
}
```

After `npm install`, both `@expo/cli/node_modules/tar` and `cacache/node_modules/tar` resolved to v6.2.1. Local prebuild confirmed:

```
✔ Created native directory
✔ Finished prebuild
```

This single change was the resolution for all three prior "Xcode project not found" build failures.

---

### 6. First Successful TestFlight Build and Submission
**May 2, 2026 (evening CST) · ~0.25 h**

With the tar fix in place, the Expo Launch build pipeline ran all 18 steps to completion for the first time:

| Step | Result |
|---|---|
| Prebuild Expo project | ✅ |
| Configure Xcode project | ✅ |
| Synchronize Xcode native targets | ✅ |
| Synchronize Xcode entitlements | ✅ |
| Export Expo app | ✅ |
| Configure iOS credentials | ✅ |
| Install iOS dependencies (pod-install) | ✅ |
| Create iOS build (Fastlane) | ✅ |
| Store iOS build | ✅ |
| Submit to App Store | ✅ |

Binary delivered to App Store Connect under app ID `6765561268`, bundle identifier `app.replit.pouracrossamerica`, version `1.0.0 (1)`.

---

### 7. TestFlight Tester Onboarding
**May 2–3, 2026 · ~0.25 h**

Internal test team invited via TestFlight. Email invitations sent from App Store Connect. App available for installation on devices running iOS 26+.

---

### 8. Startup Crash Diagnosed from TestFlight Crash Report
**May 3, 2026 · ~1.0 h**  
**Crash report:** `DF34F1C0-10C3-4915-BBD1-B77FB43581A3`

A tester reported an immediate crash on launch. Crash report retrieved from Xcode Organizer and analysed.

**Device:** iPhone 11 (iPhone12,1) · iOS 26.3 (23D127)  
**Time to crash:** 0.38 seconds after launch  
**Exception:** `EXC_CRASH (SIGABRT)` — Termination Reason: SIGNAL 6

**Key frames from the Last Exception Backtrace:**

```
#2  PourAcrossAmerica  RCTFatal (RCTAssert.m:147)
#3  PourAcrossAmerica  -[RCTExceptionsManager reportFatal:...]
#8  PourAcrossAmerica  -[RCTModuleMethod invokeWithBridge:module:arguments:]
#9  PourAcrossAmerica  invokeInner (RCTNativeModule.mm:196)
```

This is the standard React Native crash path for an **unhandled JavaScript exception in a release build** — a JS error is caught by React Native's global handler, passed to `RCTExceptionsManager`, escalated to `RCTFatal`, and thrown as a terminating Objective-C exception.

The 0.38-second crash window pointed to module-level code executing at import time. Tracing the import chain from `App.tsx` → `RootNavigator` → `usePushNotifications`:

```ts
// src/hooks/usePushNotifications.ts — line 8 (outside any function)
Notifications.setNotificationHandler({
  handleNotification: async () => ({ ... }),
});
```

`Notifications.setNotificationHandler` was called at **module scope** — executing the instant the file was imported, before any component mounted. Because `expo-notifications` had been removed from the `app.json` plugins array during the earlier prebuild troubleshooting, the native iOS notification module was not registered in the binary. Calling it immediately threw a JS exception → `RCTFatal` → abort.

---

### 9. Startup Crash Fix — Notifications Handler Moved; Plugin Restored
**Commit:** `b4879dd` · May 3, 2026 · **~0.5 h**  
**Files:** `src/hooks/usePushNotifications.ts` · `app.json`

**Fix 1 — `usePushNotifications.ts`:**  
Moved `Notifications.setNotificationHandler` out of module scope and into a `useEffect` with a `Platform.OS !== 'web'` guard:

```ts
// Before — runs at import time, crashes if native module not registered
Notifications.setNotificationHandler({ ... });

// After — runs only after component mounts, only on native platforms
useEffect(() => {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({ ... });
}, []);
```

**Fix 2 — `app.json`:**  
`expo-notifications` restored to the plugins array. It was safe to add back because the actual prebuild crash (tar v7) had already been resolved — removing the plugin was an incorrect workaround.

New build submitted. Web version re-published with both fixes.

---

## Build Failure Timeline

| Attempt | Failed at | Root cause identified |
|---|---|:---:|
| Build 1 | Step 6 — Configure Xcode project | Not yet |
| Build 2 | Step 6 — Configure Xcode project | Not yet |
| Build 3 | Step 6 — Configure Xcode project | Not yet |
| Build 4 | Step 6 — Configure Xcode project | ✅ `tar` v7 override |
| **Build 5** | **— completed —** | ✅ TestFlight delivery |

---

## Files Changed

| File | Change |
|---|---|
| `eas.json` | Apple ID, ASC App ID, Team ID added to `submit.production.ios` |
| `app.json` | Bundle ID corrected · ASC App ID corrected · `appleTeamId` added · `deploymentTarget` raised to 16.0 · `ITSAppUsesNonExemptEncryption: false` added · `usesAppleSignIn` replaced with `entitlements` · `expo-notifications` plugin removed then restored · `sounds: []` removed |
| `package.json` | `overrides.tar` changed from `^7.5.11` to `^6.2.1` |
| `src/hooks/usePushNotifications.ts` | `Notifications.setNotificationHandler` moved from module scope into `useEffect` with Platform guard |

---

## Deployments & Submissions

| Time (CST) | Type | Notes |
|---|---|---|
| May 2, evening | iOS TestFlight — Build 5 | First successful submission · bundle `app.replit.pouracrossamerica` · v1.0.0 (1) |
| May 2, evening | Web publish | Live at `.replit.app` domain |
| May 3 | TestFlight invitations sent | Internal test team onboarding |
| May 3 | iOS — Build 6 submitted | Startup crash fix · `expo-notifications` restored |
| May 3 | Web publish | Startup crash fix live |

---

## Technical Notes

- **`tar` v7 / `@expo/cli` incompatibility:** tar v7 sets `__esModule: true` on its CJS exports but exports no `.default` property. `@expo/cli`'s CommonJS interop wrapper (`_interopRequireDefault`) passes objects with `__esModule: true` through unwrapped, leaving `tar.default` undefined and crashing on `tar.default.extract(...)`. The root package in the project had an `overrides` entry forcing tar v7; removing it and pinning to v6 resolved the entire chain of prebuild failures.
- **Module-level native calls are fatal in release builds:** In development, unhandled JS errors display a red screen. In release (TestFlight/App Store) builds, React Native calls `RCTFatal`, which throws an uncaught Objective-C exception and terminates the process. Any native module call at module scope — outside a function or effect — will crash on launch if the module is not registered.
- **Replit Expo Launch manifest injection:** Replit overrides `bundleIdentifier`, `appleTeamId`, and certain `infoPlist` fields at build time via `launching expo:manifest`. Local `app.json` values for those fields must be kept in sync to avoid stale config being passed to prebuild before the injection step runs.
- **`expo-notifications` plugin and prebuild:** Removing the plugin from `app.json` does not remove the package from the binary — the native code is still linked. However, the native module's AppDelegate integration (required for background notification handling) is not configured. Calling any `Notifications.*` method in a release build without the plugin will throw a JS exception.
