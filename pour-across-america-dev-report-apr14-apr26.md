# Pour Across America — Development Report
**Period:** April 14 – April 26, 2026  
**Platform:** React Native / Expo SDK 51 · Supabase · GPT-4o Vision  
**Environments:** iOS (Expo Go) · Web

---

## Summary

| Metric | Value |
|---|---|
| Working sessions | 14 |
| Active session time (commit windows) | ~6 hrs 2 min |
| Features shipped | 14 |
| Bug fixes | 6 |
| Deployments (published) | 14 |
| Commits | 39 |

> Session times are derived from commit-window durations (first to last commit per session). Actual development and planning time is longer.

---

## April 15 — Session 1 · 00:35–00:43 UTC · ~8 min

### AI Label Scanning (Phase 1)
- Built initial scan-and-autofill flow connecting label photo to wine entry fields
- Added unified database setup script covering all tables and RLS policies
- Added searchable state dropdown for US-based wine origin entries

**Commits:** `acdb856` · `6ca84b4` · `770c0aa`

---

## April 15 — Session 2 · 13:21–14:00 UTC · ~39 min

### Grape Blend Entry Component
- Built `GrapeBlendEntry` — multi-row input supporting grape name + percentage per variety
- Added comprehensive database deployment script for fresh environment setup

**Commits:** `d693bea` · `417f2eb`

---

## April 15 — Session 3 · 15:13 UTC · ~30 min (est.)

### Grape Percentage UI Polish
- Made percentage input fields more visually prominent and touch-friendly
- Improved tap target sizes and field contrast

**Commits:** `a8d99d9`

---

## April 15 — Session 4 · 21:06–21:15 UTC · ~9 min

### Location Input Improvements
- State selector now collapses to show only the selected value after picking
- Replaced static country dropdown with a searchable live-filter text input

**Commits:** `fa3c0d6` · `d22574c`

---

## April 16 — Session 1 · 00:28–00:42 UTC · ~14 min

### AI Label Scanning (Phase 2 — GPT-4o Vision)
- Integrated `openai` SDK with GPT-4o Vision for full label intelligence
- Scanned labels now auto-populate: wine name, vintage, region, country, grape blends with percentages, producer, and tasting notes
- Replaced basic OCR approach with structured JSON extraction via system prompt

**Commits:** `0455c9a` · `34f14e6`

---

## April 16 — Session 2 · 12:38–12:44 UTC · ~6 min

### Documentation
- Generated detailed development report documenting all features to that point
- Added guide for requesting future dev reports

**Commits:** `af3d05d` · `c0a1e3e`

---

## April 17 — Session 1 · 00:15–01:38 UTC · ~83 min

### Wine Card Visual Upgrade
- Fixed Metro bundler watcher error caused by `.local` directory being watched
- Wine cards on the history list now show: label photo thumbnail, price, and grape blend with percentage bars
- Added `WineCard` component with full visual hierarchy

**Commits:** `6707676` · `bdc2ce5`

---

## April 17 — Session 2 · 18:28–18:59 UTC · ~31 min

### Wine Comparison · Tag Input · Step Reordering
- **Wine Comparison:** Side-by-side comparison modal for any two wines from the cellar; advanced detail card with full tasting notes, terroir, and blend breakdown
- **Tag input:** Comma-separated tag entry — users type `bold, earthy, long finish` and each becomes a tag chip on blur
- **Entry step order:** Reordered the wine logging steps to match natural tasting flow (appearance → nose → palate → finish → notes)

**Commits:** `23456c6` · `318117d` · `1bdccec`

---

## April 18 — Session 1 · 02:52 UTC · ~30 min (est.)

### Performance Optimisation
- Memoised expensive selectors and list renders to prevent unnecessary re-computation
- Optimised data-fetching calls to reduce round-trips on the History screen
- Removed redundant re-renders on WineCard when unrelated state changed

**Commits:** `2fe4c37`

---

## April 23 — Session 1 · 03:04–03:12 UTC · ~8 min

### Skeleton Loading & List Speed (Task #1)
- Added animated skeleton placeholder cards that appear instantly while wines load — eliminates blank-screen flash
- Removed stale loading text style that was no longer used

**Commits:** `6b90127` · `3a96d7c` · `814317c` · `a7b02820`

---

## April 24 — Session 1 · 23:26 UTC · ~20 min (est.)

### Build Summary Document
- Authored comprehensive build summary covering app architecture, feature list, and technology stack

**Commits:** `67121ec`

---

## April 25 — Session 1 · 00:19–00:51 UTC · ~32 min

### Responsive Design (Task #5) · Per-Glass & Per-Bottle Pricing (Task #8)
- **Responsive layout:** Sidebar navigation on tablet/desktop widths; all screens cap content at a readable max-width; search results centred on wide viewports; `useResponsive` hook added as shared utility (sidebar width 220 px, max content 720 px)
- **Pricing types:** Wine entries now support separate glass price and bottle price; zero-valued prices accepted; price type badge shown on wine cards and detail views

**Commits:** `30484ae` · `d1665b1` · `61e81f2` · `6bb013e` · `9b13011` · `05f0f24`

---

## April 25 — Session 2 · 01:31–01:55 UTC · ~24 min

### Grape Defaults Fix (Task #10) · Image Caching · Pagination (Task #3)
- **Grape default bug:** Single-variety wines no longer show 0 % — blend entry now defaults to 100 % and the edit flow normalises null percentages on load
- **Label photo caching:** Switched label images to `expo-image` for on-device caching, eliminating re-download flicker on revisit
- **Load-more pagination:** History list now fetches 20 wines at a time with a Load More button; prevents large cellars from causing slow initial loads

**Commits:** `d4b6d9e` · `c0c546b` · `821b235` · `5b7e509`

---

## April 26 — Session 1 · 02:48–03:16 UTC · ~28 min

### Two-Tier User System — Enthusiast & Sommelier Roles
- **New types:** `UserRole` (`enthusiast` | `sommelier`) and `SommelierStatus` (`pending` | `approved` | `rejected`) added to `UserProfile`
- **Database migration `002_user_roles.sql`:** Added `user_role`, `sommelier_cert_url`, and `sommelier_status` columns to `user_profiles` with CHECK constraints and safe defaults
- **Signup screen:** Role picker at signup; Sommeliers upload a Level 3 certification image before account creation; cert stored in private `sommelier-certs` Supabase Storage bucket
- **Settings screen:** Sommeliers see application status; can submit or resubmit a certification
- **Terroir fields gated:** Step 5 of wine entry (Terroir) only renders for approved Sommeliers — `isSommelier` prop threads through `WineEntryScreen` → `Step5NotesAndTerroir`
- **Database bugs fixed (same session):**
  - Restored `handle_new_user` trigger to its original simple form (our migration had changed function ownership from `supabase_admin` to `postgres`, causing "Database error saving new user")
  - Added `user_profiles_trigger_insert` RLS policy granting the `postgres` role INSERT access — resolved "new row violates row-level security policy" on all sign-ups
  - Replaced raw `fetch()` PATCH in signup with authenticated Supabase client call (`submitSommelierApplication`) to ensure the session token is always valid

**Commits:** `ece5fdc` · `a0dd3c5` · `2396dfb`

---

## Feature Index

| Feature | Date Shipped |
|---|---|
| AI label scan (basic autofill) | Apr 15 |
| Grape blend multi-entry input | Apr 15 |
| Searchable state & country inputs | Apr 15 |
| GPT-4o Vision label intelligence | Apr 16 |
| Wine card with photo, price & blend bars | Apr 17 |
| Side-by-side wine comparison | Apr 17 |
| Comma tag input | Apr 17 |
| Tasting step reorder | Apr 17 |
| Performance optimisations | Apr 18 |
| Skeleton loading placeholders | Apr 23 |
| Responsive layout (tablet/desktop) | Apr 25 |
| Per-glass & per-bottle pricing | Apr 25 |
| Grape blend default 100 % fix | Apr 25 |
| Label photo on-device caching | Apr 25 |
| Load-more pagination | Apr 25 |
| Two-tier Enthusiast / Sommelier system | Apr 26 |
| Terroir entry gated to Sommeliers | Apr 26 |
| Sommelier cert upload at signup | Apr 26 |
| Signup RLS & trigger ownership fixes | Apr 26 |
