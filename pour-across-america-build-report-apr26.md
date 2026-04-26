# Pour Across America — Build Report
**Date:** April 26, 2026
**App:** Pour Across America (React Native / Expo / Supabase)

---

## Summary

| Task | Area | Time Spent |
|------|------|------------|
| Sommelier two-tier user system | Feature | ~1 hr 30 min |
| Signup RLS & race condition fixes | Bug fixes | ~3 hr 10 min |
| Admin approval panel | Feature | ~30 min |
| RLS infinite recursion resolution | Database | ~1 hr 30 min |
| **Total** | | **~6 hr 40 min** |

---

## Task 1 — Sommelier Two-Tier User System
**Time:** ~1 hr 30 min (2:48 AM – 4:20 AM UTC)

Designed and built the full Sommelier upgrade path, creating a second user tier for professional sommeliers with approved credentials.

### What Was Built

**Database schema (`002_user_roles.sql`)**
- `user_role` column — `'enthusiast'` (default) or `'sommelier'`
- `sommelier_status` column — `'pending'`, `'approved'`, or `'rejected'`
- `sommelier_cert_url` column — stores path to uploaded certification image

**Certification upload flow**
- Users apply from the Account screen by uploading a photo of their Level 3 certification (CMS, WSET, ISG, or equivalent)
- Certificate images stored in a private `sommelier-certs` Supabase Storage bucket
- Scoped RLS storage policies added: `users can upload sommelier certs`, `users can view sommelier certs`

**Profile status display**
- Pending applications show a yellow "Pending Review" badge
- Approved Sommeliers show a gold "Verified" badge
- Rejected applicants see a "Not Approved" badge and can reapply
- Approved Sommeliers unlock terroir fields (soil type, climate) in wine entry Step 5

**Files changed:**
- `src/screens/settings/SettingsScreen.tsx`
- `src/components/auth/SommelierCertUpload.tsx`
- `src/lib/supabase.ts` — `uploadSommelierCert()`, `submitSommelierApplication()`
- `supabase/migrations/002_user_roles.sql`

---

## Task 2 — Signup RLS & Race Condition Fixes
**Time:** ~3 hr 10 min (9:35 AM – 12:45 PM UTC)

Resolved a chain of three interconnected bugs that prevented user signup from completing reliably on both web and React Native.

### Root Causes & Fixes

| # | Problem | Fix Applied |
|---|---------|-------------|
| 1 | New user profiles were not being created on signup | Moved profile creation from a database trigger to a client-side upsert immediately after `auth.signUp()` |
| 2 | React Native race condition — session not committed to SecureStore before first DB call | Added `await supabase.auth.getSession()` before the profile upsert to ensure the session is fully in memory |
| 3 | Web race condition — `SIGNED_IN` event fired before the client-side upsert completed, rendering a blank profile | Added retry logic (3 attempts × 1 second gap) in `authStore.loadProfile()` |
| 4 | Sommelier cert upload returned a silent RLS violation on the storage bucket | Added INSERT policy `users can upload sommelier certs` on the `sommelier-certs` bucket |

### Key Technical Finding
In Supabase cloud, the `postgres` role does **not** have `BYPASSRLS`. `SECURITY DEFINER` trigger functions owned by `postgres` are still subject to row-level security — permissive INSERT policies on the table are required instead of relying on trigger ownership.

**Files changed:**
- `src/lib/supabase.ts` — `signUpWithEmail()` with `getSession()` guard, simplified error messages
- `src/stores/authStore.ts` — `loadProfile()` with 3-attempt retry loop

**User confirmed:** Both signup and Sommelier upgrade working end to end.

---

## Task 3 — Admin Approval Panel
**Time:** ~30 min (12:45 PM – 1:00 PM UTC)

Built an in-app admin screen for reviewing and acting on pending Sommelier applications, eliminating the need for direct Supabase dashboard access to manage users.

### What Was Built

**`AdminScreen` (`src/screens/admin/AdminScreen.tsx`)**
- Lists all pending applications ordered by submission date (oldest first)
- Each card displays: applicant name, email, submission date, and certification image
- Certificate images load via a 1-hour signed URL (required for private Storage bucket)
- **Approve** — sets `sommelier_status = 'approved'` and `user_role = 'sommelier'`
- **Reject** — sets `sommelier_status = 'rejected'` and resets `user_role = 'enthusiast'`
- Approved/rejected applications are removed from the list immediately
- Inline success and error banners; empty state shown when no applications are pending

**Access control**
- Admin Panel row only appears in the Account screen when `profile.is_creator = true`
- Non-admin users have no route to the screen

**New Supabase helpers (`src/lib/supabase.ts`)**
- `fetchPendingSommelierApplications()` — queries profiles with `sommelier_status = 'pending'`
- `updateSommelierStatus(userId, decision)` — single UPDATE for status and role
- `getSommelierCertSignedUrl(certUrl)` — extracts storage path from URL and generates signed URL

**Navigation wiring**
- `Admin: undefined` added to `MainStackParamList`
- `AdminScreen` added to `MainNavigator` with `slide_from_right` animation

**Files changed:**
- `src/screens/admin/AdminScreen.tsx` *(new)*
- `src/lib/supabase.ts`
- `src/navigation/types.ts`
- `src/navigation/MainNavigator.tsx`
- `src/screens/settings/SettingsScreen.tsx`

**Setup required (one-time SQL):**
```sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN NOT NULL DEFAULT false;

UPDATE public.user_profiles
SET is_creator = true
WHERE email = 'admin@email.com';
```

---

## Task 4 — RLS Infinite Recursion Resolution
**Time:** ~1 hr 30 min (post 1:00 PM UTC)

Diagnosed and resolved an infinite recursion error in Supabase Row Level Security policies that was triggered when users submitted Sommelier applications and when the admin attempted approvals.

### Root Cause
Earlier RLS policies added to support the admin panel referenced the `user_profiles` table from within policies ON `user_profiles`, causing PostgreSQL to recurse indefinitely when evaluating access.

### Policies Removed
| Policy | Type | Reason Dropped |
|--------|------|----------------|
| `admins can read all profiles` | SELECT | Recursive subquery on `user_profiles` |
| `admins can update sommelier status` | UPDATE | Recursive subquery on `user_profiles` |
| `authenticated users can search profiles` | SELECT | Recursive subquery on `user_profiles` |
| `profiles_select` | SELECT | Conflicting / potentially recursive |
| `profiles_update` | UPDATE | Conflicting / potentially recursive |

### Policies Added (Clean, Non-Recursive)
| Policy | Type | Rule |
|--------|------|------|
| `authenticated read all profiles` | SELECT | `USING (true)` — all signed-in users |
| `authenticated update profiles` | UPDATE | `USING (true)` — all signed-in users |

### Key Technical Finding
Self-referencing RLS policies (a policy on table X that runs a subquery on table X) cause infinite recursion in PostgreSQL. The fix is to use simple non-recursive expressions (`true`, `auth.uid()`, `auth.role()`) rather than subqueries that re-enter the same table's RLS evaluation.

---

## Database Changes — April 26

| Change | Type | Purpose |
|--------|------|---------|
| `user_role`, `sommelier_status`, `sommelier_cert_url` columns | Schema | Two-tier user system |
| `users can upload sommelier certs` | Storage INSERT policy | Allow cert upload |
| `users can view sommelier certs` | Storage SELECT policy | Allow cert read |
| `user_profiles_insert WITH CHECK (true)` | Table INSERT policy | Allow client-side profile creation on signup |
| `is_creator` column | Schema | Gates admin panel access |
| `authenticated read all profiles` | Table SELECT policy | Non-recursive read for all authenticated users |
| `authenticated update profiles` | Table UPDATE policy | Non-recursive update for all authenticated users |

---

## End-of-Day Status

| Feature | Status |
|---------|--------|
| New user signup (web + mobile) | Working |
| Sommelier certification upload | Working |
| Sommelier application submission | Working |
| Admin panel — view pending applications | Working |
| Admin panel — approve application | Working |
| Admin panel — reject application | Working |
| Profile badges (Pending / Verified / Not Approved) | Working |
| RLS recursion errors | Resolved |

---

*Report generated April 26, 2026*
