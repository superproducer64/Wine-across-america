# Pour Across America — Development Report
**Period:** April 1 – April 13, 2026  
**Note:** Project inception was April 10. No commits exist prior to that date.  
**Platform:** React Native / Expo SDK 51 · Supabase · TypeScript  
**Environments:** iOS (Expo Go) · Web

---

## Summary

| Metric | Value |
|---|---|
| Working sessions | 7 |
| Active session time (commit windows) | ~7 hrs 16 min |
| Features shipped | 9 |
| Bug fixes | 5 |
| Deployments (published) | 14 |
| Commits | 41 |

> Session times are derived from commit-window durations (first to last commit per session). Actual development and planning time is longer.

---

## April 10–11 — Session 1 · 22:05–23:38 UTC · ~93 min

### MVP Scaffold — Full App Architecture

The entire application was built from scratch in a single session:

- **Navigation:** Stack + Tab navigator setup (`RootNavigator`, `AuthStack`, `MainTabs`)
- **Auth screens:** Sign In and Sign Up with Supabase email/password authentication
- **Wine entry flow:** Multi-step entry wizard (appearance → nose → palate → finish → notes)
- **Home/History screen:** Wine log list with Supabase real-time fetch
- **Search screen:** Full-text search across wine name, producer, region, and tags
- **Settings screen:** Profile display, sign-out
- **Supabase backend:** `user_profiles`, `wine_logs` tables with RLS policies wired up
- **Theme system:** Gold/ink colour palette (`#C4847A` / `#1F1518`), Playfair Display + DM Sans fonts
- **Shared UI components:** `Button`, `TextInput`, `Card`, `RatingSlider`, `TagInput`
- **Startup crash fixes:** Resolved blank screen on web caused by premature render before font load; fixed Supabase client initialisation order

**Commits:** `96f1e90` · `9e311e2` · `5415418` · `55ca47a` · `32fee32`

---

## April 11 — Session 2 · 00:13–01:20 UTC · ~67 min

### Stability, Dependencies & Signup Flow

- Added Supabase client debug logging to verify environment variable injection at startup
- Removed unnecessary webpack config file left over from scaffolding (Expo manages its own bundler config)
- Updated dependencies to resolve security advisories and improve runtime stability
- Updated sign-up flow to detect whether email confirmation is enabled or disabled in the Supabase project and handle both paths gracefully — when confirmation is off, the user is signed in immediately; when on, a confirmation prompt is shown

**Commits:** `b0c5da5` · `cdb1980` · `cc1d23f` · `631be57` · `1708b04`

---

## April 13 — Session 3 · 14:21–15:58 UTC · ~97 min

### Inline Alerts · Database RLS Hardening

- **Inline alerts:** Removed all `Alert.alert()` calls throughout the app and replaced with inline banner components — error and success messages now appear in-screen without native modal interruption. This became a standing rule for all future work.
- **DB profile creation fix:** Authored `fix_user_profiles.sql` script to repair missing `user_profiles` rows for users who signed up before the trigger was in place
- **RLS policy script:** Updated database setup script to correctly drop and recreate row-level security policies, fixing an issue where policies were duplicating on re-run

**Commits:** `b534424` · `0e5bfd9` · `d36266d` + several in-progress saves

---

## April 13 — Session 4 · 16:20–17:40 UTC · ~80 min

### Colour Palette & Visual Theme

- Replaced the initial default colour palette with a refined wine-inspired theme
- Primary gold set to `#C4847A` (dusty rose-gold); ink/dark set to `#1F1518` (deep burgundy-black)
- Applied consistently across all screens, navigation bars, buttons, and input borders
- Darkened body text colours for readability; lightened the bottom tab bar background to reduce visual weight

**Commits:** `949bc0b` · `8a4f2ef`

---

## April 13 — Session 5 · 17:45–18:07 UTC · ~22 min

### Slider Bug Fix

- Fixed tasting sliders (acidity, tannin, body, finish, etc.) jumping to maximum value on first touch
- Root cause: `PanResponder` was reading the wrong gesture offset; corrected the delta calculation so sliders track smoothly from their current value

**Commits:** `b4320e3`

---

## April 13 — Session 6 · 18:22–18:36 UTC · ~14 min

### Location Detection · Share Feature (Phase 1)

- **Location detection:** Integrated `expo-location` — tapping "Detect Location" in the wine entry form requests permission and reverse-geocodes coordinates to populate city/region automatically
- **Share wine details:** Added share action using the native share sheet (`Share.share`) — exports a plain-text summary of the wine log including name, vintage, region, score, and tasting notes

**Commits:** `3e87e3f` · `d08c8d9`

---

## April 13 — Session 7 · 19:13–19:41 UTC · ~28 min

### Vivino-Style Wine Card · In-App Share

- **Wine card:** Designed a consumer-friendly shareable wine card inspired by Vivino — displays label image placeholder, wine name, vintage, region, rating stars, top tasting notes as chips, and a QR-style footer
- **In-app share flow:** Added a dedicated share screen/modal allowing users to preview and share the card image within the app before exporting to the native share sheet

**Commits:** `e63b968` · `11d6648`

---

## Feature Index

| Feature | Date Shipped |
|---|---|
| Full MVP scaffold (auth, entry wizard, history, search, settings) | Apr 10 |
| Supabase auth + RLS + `user_profiles` + `wine_logs` tables | Apr 10 |
| Theme system (gold/ink palette, Playfair + DM Sans fonts) | Apr 10 |
| Shared UI component library (Button, TextInput, Card, Slider, Tags) | Apr 10 |
| Startup / font-load crash fixes | Apr 10 |
| Email confirmation flow (on/off detection) | Apr 11 |
| Dependency & security updates | Apr 11 |
| Inline alert/banner system (no more Alert.alert) | Apr 13 |
| DB profile-repair & RLS policy scripts | Apr 13 |
| Wine-inspired colour palette | Apr 13 |
| Tasting slider bug fix | Apr 13 |
| Location auto-detect on entry | Apr 13 |
| Native share sheet integration | Apr 13 |
| Vivino-style shareable wine card | Apr 13 |
