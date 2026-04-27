# Pour Across America — Evening Build Report
**Date:** April 26, 2026 (Evening Session)
**App:** Pour Across America (React Native / Expo SDK 51 / Supabase)
**Platform targets:** iOS (TestFlight via EAS Build) + Web (port 5000)

---

## Summary

| Task | Area | Time Spent |
|------|------|------------|
| Apple Sign In + EAS Build configuration | Feature / DevOps | ~45 min |
| Show/hide password toggle | UX Polish | ~15 min |
| Admin panel pending application badge | Feature | ~20 min |
| Push notifications — admin alerts on new applications | Feature | ~45 min |
| Rejection reason form + applicant display | Feature | ~30 min |
| **Total** | | **~2 hr 35 min** |

---

## Task 1 — Apple Sign In + EAS Build Configuration
**Time:** ~45 min

Implemented native Apple Sign In for iOS users and set up the EAS Build configuration required for TestFlight distribution.

### What Was Built

**Apple Sign In (`src/lib/supabase.ts`)**
- `generateAppleNonce()` — generates a SHA-256 cryptographic nonce using `expo-crypto`
- `signInWithApple()` — full Apple credential flow: request credentials → hash nonce → exchange with Supabase auth → return session
- Apple identity token passed to `supabase.auth.signInWithIdToken()` with the hashed nonce for server-side verification

**Login screen (`src/screens/auth/LoginScreen.tsx`)**
- `AppleAuthentication.AppleAuthenticationButton` added, visible on iOS only (`Platform.OS === 'ios'`)
- Styled with a divider between the Apple button and the email form

**EAS Build (`eas.json`)**
- `development`, `preview`, and `production` build profiles created
- Bundle ID: `com.pouracrossamerica.app`
- `autoIncrement: true` set for production builds

**`app.json`**
- `expo-apple-authentication` plugin added
- `usesAppleSignIn: true` declared for iOS entitlements

**Packages installed:**
- `expo-crypto` (for secure nonce generation)

**Files changed:**
- `src/lib/supabase.ts`
- `src/screens/auth/LoginScreen.tsx`
- `app.json`
- `eas.json` *(new)*

**Pending (user action required):**
Fill in `eas.json` submit section with Apple Developer credentials:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "YOUR_APPLE_ID@email.com",
      "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
      "appleTeamId": "YOUR_TEAM_ID"
    }
  }
}
```

---

## Task 2 — Show/Hide Password Toggle
**Time:** ~15 min

Added an eye icon toggle to every password field across the app so users can reveal or conceal their typed password.

### What Was Built

**`src/components/ui/TextInput.tsx`**
- When `secureTextEntry` prop is passed, a `👁` / `👁‍🗨` icon button renders at the right edge of the input
- Toggle state is local to the component — no prop changes needed at call sites
- Applies automatically to all screens using the shared `TextInput` component (Login, Signup, Change Password)

**Files changed:**
- `src/components/ui/TextInput.tsx`

---

## Task 3 — Admin Panel Pending Application Badge
**Time:** ~20 min

Added a red notification badge to the Admin Panel row in the Account screen so admins know at a glance when applications are waiting.

### What Was Built

**`src/lib/supabase.ts`**
- `getPendingSommelierCount()` — counts profiles with `sommelier_status = 'pending'`

**`src/screens/settings/SettingsScreen.tsx`**
- `useFocusEffect` re-fetches the count each time the Account screen comes into focus
- If `pendingCount > 0`, a red circular badge with the count appears on the Admin Panel row
- Badge disappears when the queue is cleared

**Files changed:**
- `src/lib/supabase.ts`
- `src/screens/settings/SettingsScreen.tsx`

---

## Task 4 — Push Notifications: Admin Alerts on New Applications
**Time:** ~45 min

When a user submits a Sommelier application, every admin receives an instant push notification — even if the app is closed.

### Architecture

```
User submits application
        │
        ▼
submitSommelierApplication()
        │
        ▼
notifyAdminsOfNewApplication()
        │
        ├── query user_profiles WHERE is_creator = true AND push_token IS NOT NULL
        │
        └── POST to https://exp.host/--/api/v2/push/send
                  │
                  ▼
            Push notification delivered to all admin devices
```

### What Was Built

**`src/hooks/usePushNotifications.ts`** *(new)*
- Runs on app open (native only — skipped on web)
- Requests notification permissions via `Notifications.requestPermissionsAsync()`
- Retrieves the Expo push token via `Notifications.getExpoPushTokenAsync()`
- Calls `savePushToken()` to persist the token to the user's profile
- Android notification channel configured: `Pour Across America`, max importance, gold light color
- `Notifications.setNotificationHandler` configured for foreground alert + sound + badge

**`src/lib/supabase.ts`**
- `savePushToken(userId, token)` — upserts push token to `user_profiles`
- `notifyAdminsOfNewApplication(applicantName)` — fetches all admin tokens and POSTs a batch to the Expo Push API
- Notification payload:
  - Title: *🎓 New Sommelier Application*
  - Body: *"[Name] has submitted their certification for review."*
  - `data: { screen: 'Admin' }` for future deep-link support

**`submitSommelierApplication()`** updated:
- Accepts optional third parameter `applicantName`
- Fires `notifyAdminsOfNewApplication()` immediately after a successful DB update (fire-and-forget)

**`src/navigation/RootNavigator.tsx`**
- `usePushNotifications()` hook called at the root; automatically registers the token whenever a user session is active

**`app.json`**
- `expo-notifications` plugin added with gold accent color (`#C4847A`)

**Database change required (one-time SQL):**
```sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;
```

**Files changed:**
- `src/hooks/usePushNotifications.ts` *(new)*
- `src/lib/supabase.ts`
- `src/screens/settings/SettingsScreen.tsx`
- `src/screens/auth/SignupScreen.tsx`
- `src/navigation/RootNavigator.tsx`
- `app.json`

**Note:** Push notifications are native-only. They will be fully active after the first TestFlight build is installed on a real device.

---

## Task 5 — Rejection Reason Form + Applicant Display
**Time:** ~30 min

Admins can now explain why a Sommelier application was rejected. The reason is stored in the database and displayed directly to the applicant in their Account screen.

### Admin Flow

1. Admin taps **Reject**
2. An inline form slides open below the cert image:
   - Label: *"Reason for rejection"*
   - Text input (multiline, auto-focused, red border)
   - Hint: *"This message will be visible to the applicant."*
   - **Cancel** — dismisses without action
   - **Confirm Rejection** — submits with or without a reason (reason is optional)
3. Application removed from the queue; success banner shown

### Applicant View

When an application is rejected with a reason, a red-bordered card appears on the applicant's Account screen between their profile header and the reapply form:

```
┌─────────────────────────────────────┐
│ REASON FOR REJECTION                │
│ Certificate image unclear — please  │
│ resubmit with better lighting.      │
└─────────────────────────────────────┘
```

If no reason was provided, the card is simply not shown.

### Technical Changes

**`src/lib/supabase.ts`**
- `updateSommelierStatus(userId, decision, rejectionReason?)` — extended with optional third param
- Saves `sommelier_rejection_reason` on reject; clears it (`null`) on approve

**`src/types/index.ts`**
- `UserProfile` interface extended: `sommelier_rejection_reason: string | null`

**Database change required (one-time SQL):**
```sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS sommelier_rejection_reason TEXT;
```

**Files changed:**
- `src/screens/admin/AdminScreen.tsx`
- `src/screens/settings/SettingsScreen.tsx`
- `src/lib/supabase.ts`
- `src/types/index.ts`

---

## Database Changes — April 26 Evening

| Column | Table | Type | Purpose |
|--------|-------|------|---------|
| `push_token` | `user_profiles` | `TEXT` | Stores Expo push token for native push delivery |
| `sommelier_rejection_reason` | `user_profiles` | `TEXT` | Admin rejection message shown to applicant |

---

## Pending SQL (Run in Supabase Dashboard)

```sql
-- Push notifications
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Rejection reason
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS sommelier_rejection_reason TEXT;
```

---

## End-of-Day Status

| Feature | Status |
|---------|--------|
| Apple Sign In (iOS) | Built — requires TestFlight to test |
| Show/hide password toggle | Working |
| Admin badge — pending application count | Working |
| Push notifications — admin alerts | Built — active on native after EAS build |
| Rejection reason form (admin) | Working |
| Rejection reason display (applicant) | Working |
| EAS Build configuration | Ready — Apple credentials needed in `eas.json` |

---

*Report generated April 26, 2026 — Evening Session*
