# Pour Across America — Development Report
**Period:** April 25–26, 2026
**App:** Pour Across America (React Native / Expo / Supabase)

---

## Summary

| Date | Tasks Completed | Time Spent |
|------|----------------|------------|
| April 25 | 5 | ~1 hr 45 min |
| April 26 | 3 | ~5 hr 15 min |
| **Total** | **8** | **~7 hr** |

---

## April 25 — Feature Delivery

### 1. Responsive Design Across Screen Sizes
**Time:** ~30 min (12:19 AM – 12:30 AM UTC)

Implemented adaptive layout for phone, tablet, and desktop breakpoints throughout the app. Search results and content areas now center-align on wider screens, matching the sidebar navigation layout already in place.

- Breakpoints: phone < 600 px, tablet 600–1023 px, desktop ≥ 1024 px
- Search results constrained to `MAX_CONTENT_WIDTH` on wide screens
- Consistent `paddingLeft: SIDEBAR_WIDTH` applied to all content screens

---

### 2. Per-Glass & Per-Bottle Pricing Fields
**Time:** ~20 min (12:43 AM – 12:50 AM UTC)

Added two optional pricing inputs to the wine entry flow — one for per-glass price and one for per-bottle price. Fixed an edge case where entering `$0` was being treated as empty and rejected.

- Both fields are optional (no price is required to save an entry)
- Zero-value prices (`$0.00`) now save correctly
- Prices display on the Wine Detail card where entered

---

### 3. Label Photo Caching On-Device
**Time:** ~15 min (1:32 AM – 1:42 AM UTC)

Replaced the standard `Image` component with `expo-image` for wine label photos. Images are now cached on-device after the first load, eliminating repeated network requests when scrolling through the wine list.

- Uses `expo-image` with `contentFit="cover"` and disk caching
- Improves scroll performance on the History/Home screen

---

### 4. Grape Variety Defaults to 100%
**Time:** ~25 min (1:31 AM – 1:55 AM UTC)

When a user enters a single grape variety with no percentage specified, the app now defaults it to 100% automatically. Fixed the display of grape blend pills on the Wine Detail and wine card to handle this correctly.

- Single-variety entries now show "100%" without manual input
- Blend percentages display correctly on WineIdentityCard and ProWineCard

---

### 5. Load-More Pagination for Wine List
**Time:** ~15 min (1:43 AM UTC)

Added paginated loading to the wine history list. Instead of fetching all entries at once, the list loads in batches with a "Load More" button at the bottom, keeping initial load times fast.

- Default page size: 20 entries
- "Load More" appends the next batch without replacing existing results
- End-of-list state handled gracefully

---

## April 26 — Two-Tier User System & Bug Resolution

### 6. Sommelier Two-Tier User System
**Time:** ~1 hr 30 min (2:48 AM – 4:20 AM UTC)

Designed and built the full Sommelier upgrade path — a second user tier for professional sommeliers with approved credentials.

**What was built:**
- `user_role` column (`enthusiast` / `sommelier`) and `sommelier_status` column (`pending` / `approved` / `rejected`) added to `user_profiles`
- Cert upload flow in the Account screen — users upload a photo of their Level 3 certification (CMS, WSET, ISG, etc.)
- Cert images stored in a private `sommelier-certs` Supabase Storage bucket with scoped RLS policies
- Pending, Approved, and Rejected badge states displayed on the user's profile card
- Approved Sommeliers unlock terroir fields (soil type, climate) in the wine entry Step 5
- Approved Sommeliers display a "Verified" badge on their profile

**Database migrations:**
- `002_user_roles.sql` — schema changes and policy documentation
- INSERT/SELECT storage policies added for `sommelier-certs` bucket

---

### 7. Signup RLS & Web Race Condition Fixes
**Time:** ~3 hr 10 min (9:35 AM – 12:45 PM UTC)

Resolved a chain of three interconnected bugs that prevented user signup from completing reliably, particularly on web and React Native.

**Root causes identified and fixed:**

| # | Bug | Fix |
|---|-----|-----|
| 1 | New user profiles were not being created on signup | Moved profile creation from a database trigger to a client-side upsert immediately after `auth.signUp()` |
| 2 | React Native race condition: session not committed to SecureStore before the DB call | Added `await supabase.auth.getSession()` before the profile upsert to flush the session into memory |
| 3 | Web race condition: `SIGNED_IN` event fired before the upsert completed, showing a blank profile | Added retry logic (3 attempts × 1 s) in `authStore.loadProfile()` |
| 4 | Sommelier cert upload returned RLS violation | The `sommelier-certs` bucket had no INSERT policy for authenticated users — SQL policy added |

**Key learning documented:** In Supabase cloud, the `postgres` role does not bypass RLS. `SECURITY DEFINER` trigger functions owned by `postgres` are still subject to row-level security policies — permissive INSERT policies are required instead.

**Files changed:** `src/lib/supabase.ts`, `src/stores/authStore.ts`

---

### 8. Admin Approval Panel
**Time:** ~30 min (12:45 PM – 1:00 PM UTC)

Built an in-app admin screen for reviewing and acting on pending Sommelier applications, eliminating the need for direct database access to approve users.

**What was built:**
- `AdminScreen` — lists all pending applications with applicant name, email, submission date, and cert image
- Cert images load via signed URL (required for private Supabase Storage bucket, 1-hour TTL)
- **Approve** button: sets `sommelier_status = 'approved'` and `user_role = 'sommelier'`
- **Reject** button: sets `sommelier_status = 'rejected'` and resets `user_role = 'enthusiast'`
- Inline success/error banners after each decision
- Empty state when no applications are pending
- Access gated behind `is_creator = true` on the `user_profiles` table — the Admin Panel row only appears in Account for flagged users

**Files changed:** `src/screens/admin/AdminScreen.tsx`, `src/lib/supabase.ts`, `src/navigation/types.ts`, `src/navigation/MainNavigator.tsx`, `src/screens/settings/SettingsScreen.tsx`

---

## Database Changes This Period

| Migration / SQL | Purpose |
|----------------|---------|
| `002_user_roles.sql` | Added `user_role`, `sommelier_status`, `sommelier_cert_url` columns |
| Storage policy — INSERT | `users can upload sommelier certs` on `sommelier-certs` bucket |
| Storage policy — SELECT | `users can view sommelier certs` on `sommelier-certs` bucket |
| Ad-hoc SQL | `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_creator` |
| Ad-hoc SQL | `UPDATE user_profiles SET is_creator = true WHERE email = ...` |

---

## Confirmed Working (User-Verified)

- New user signup creates profile correctly on web and mobile
- Sommelier certification upload succeeds end-to-end
- Admin approval promotes the applicant to full Sommelier status
- Admin rejection resets applicant to Enthusiast
- `is_creator` admin flag gates the Admin Panel correctly

---

*Report generated April 26, 2026*
