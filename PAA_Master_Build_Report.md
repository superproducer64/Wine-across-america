# Pour Across America — Master Build Report

**Project Start:** April 10, 2026
**Report Date:** May 16, 2026
**Platform:** React Native · Expo SDK 51 · Supabase · TypeScript

---

## Day 1 — April 10, 2026 · *Est. 4 hrs*

- Scaffolded full React Native / Expo SDK 51 project — navigation, theme, Supabase client, Zustand stores, TypeScript types
- Resolved blank screen on web (font loading, app initialization)
- Fixed app crashes from unused router reference
- Tuned Supabase initialization and debug logging

---

## Day 2 — April 11, 2026 · *Est. 2 hrs*

- Removed unnecessary webpack config for Expo Metro
- Updated dependencies for security and stability
- Fixed signup flow for Supabase email-confirmation-disabled mode

---

## Day 3 — April 13, 2026 · *Est. 8 hrs*

- Replaced all `Alert.alert()` calls with inline banners throughout the app
- Fixed user profile creation errors — RLS policies and DB trigger
- Established wine-themed color palette (gold, ink, surface)
- Darkened text and lightened bottom navigation bar
- Fixed sliders jumping to maximum value on first touch
- Added device location detection for tasting location logging
- Built native share sheet for wine details
- Built **Vivino-style wine card** — ratings, flavor bars, food pairings, grape pills
- Added in-app user-to-user wine sharing

---

## Day 4 — April 15, 2026 · *Est. 6 hrs*

- Built **AI label scanning** — GPT-4o Vision auto-fills wine name, producer, vintage, region, grapes from a photo
- Added searchable US state selector
- Built **GrapeBlendInput** — multi-grape entry with percentage fields
- Made grape percentage inputs more interactive and visible
- Added comprehensive DB deployment script with all tables and RLS policies

---

## Day 5 — April 16, 2026 · *Est. 3 hrs*

- Replaced static country dropdown with searchable live-filter input
- Upgraded label scanner to full GPT-4o Vision with grape identification
- Added development report guide and initial build report

---

## Day 6 — April 17, 2026 · *Est. 2 hrs*

- Added label photo and price display to wine cards with grape blend percentages
- Fixed Metro watcher error caused by local directory inclusion

---

## Day 7 — April 26–27, 2026 · *Est. 5 hrs*

- Added password show/hide toggle on login and signup
- Built **push notification system** for new sommelier applications (admin alert)
- Added notification badge on admin panel for pending applications
- Built admin rejection reason field — reason stored and shown to applicant
- Added **Apple Sign In** via Expo Apple Authentication

---

## Day 8 — April 28, 2026 · *Est. 4 hrs*

- Added calendar date picker for tasting date selection
- Added free-form "Other Aromas" text input in Step 3
- Added price-per-glass / price-per-bottle pill slider with currency selector

---

## Day 9 — April 30, 2026 · *Est. 3 hrs*

- Improved grape percentage input behavior — smarter focus and editing
- Improved login and signup layout for wider screens (tablet/desktop)

---

## Day 10 — May 1, 2026 · *Est. 8 hrs*

- Built **"Log Another Visit"** flow — add price, date, and notes to existing wine entries
- Added wine history recognition in the label scanner — matches against past entries
- Added inline warning when grape blend percentages don't total 100%
- Unique color-coded image placeholder per wine (no two look alike)
- Prepared full Android release — adaptive icon, permissions, package config
- Full security scan — findings documented
- Produced all iOS App Store and TestFlight screenshots (6 device sizes, all orientations)

---

## Day 11 — May 2, 2026 · *Est. 5 hrs*

- Added geographic region support for US-based wine regions
- Added privacy policy page
- Configured project identifiers for iOS App Store submission
- Added Apple Sign In entitlements and build credentials (Team ID, bundle ID)
- Configured push notification icon and color for both platforms
- Updated all dependency versions for build stability

---

## Day 12 — May 7, 2026 · *Est. 2 hrs*

- Improved geo-tagging across all location-aware screens (Step 1, Step 5, Detail)
- Added error banner + retry button when wine list fails to load

---

## Day 13 — May 14, 2026 · *Est. 10 hrs*

- Built **two-step label photo capture** — front + back label, separate previews
- Fixed wine entry save failures — defensive column handling for missing DB columns
- Improved save error reporting with specific messages surfaced inline
- Removed "VS" separator from Wine Comparison screen
- Added front/back label image display on wine detail and cards
- Added **Sweetness** as a 7th axis on the radar chart (structure + scoring)
- Built **Wine Style Shortcuts** — tap a style to pre-fill aromas and structure
- Added **Technical Intensity autofill** — Intensity score = structure intensity × 2, with badge
- Built **"Needs Resubmission"** cert status — full pipeline (migration, admin button, amber banner)
- Built **profile-based pickers** — Wine Explorer gets named pills (Light/Medium/Full); Sommelier gets 1–10 sliders for Body, Alcohol, Intensity
- Built **Sommelier-only aroma filtering** — sommelier-only categories and subcategories hidden from Wine Explorer

---

## Day 14 — May 15, 2026 · *Est. 4.75 hrs*

- Surfaced location lat/lng — `📡` badge in Step 5 confirms coordinates captured; "Map ↗" on detail screen opens exact pin in Maps
- Renamed "Wine Enthusiast" to "Wine Explorer" consistently across all screens
- Built prominent red rejection banner — always shows on applicant's Settings, with reason or fallback message
- Made denial reason **required** — admin blocked from submitting without writing one (for both Reject and Resubmit)
- Added missing `sommelier_rejection_reason` DB column (migration 009) — reasons were silently discarded
- Fixed status condition logic — rejected users fell through to plain enthusiast path; now based on `sommelier_status` alone
- Fixed `needs_resubmission` DB constraint error (migration 007 not applied)
- SEO improvements — `web/index.html` with meta description + Open Graph tags; valid `robots.txt`

---

## Day 15 — May 16, 2026 · *Est. 4 hrs*

- **Tablet two-column entry form** — all 5 steps reflow into side-by-side layouts on tablet/desktop; phone layout unchanged
- **Tablet/desktop two-column wine grid** — HomeScreen and SearchScreen show card-style grid on wide screens via new `WineGridItem` component

---

## Grand Total Summary

| Period | Active Days | Est. Hours |
|---|---|---|
| April 10–17 · Foundation & Core Features | 6 | 25 hrs |
| April 26–30 · Auth, Admin, Polish | 4 | 12 hrs |
| May 1–7 · Store Prep, Geo, Stability | 3 | 15 hrs |
| May 14 · Gap Analysis Sprint | 1 | 10 hrs |
| May 15 · Communication & SEO | 1 | 4.75 hrs |
| May 16 · Tablet Responsive Layouts | 1 | 4 hrs |
| **Total** | **16 active days** | **~70.75 hrs** |

---

## Key Milestones

| Date | Milestone |
|---|---|
| April 13 | First working app — Vivino card, location, sharing |
| April 15 | AI label scanning live (GPT-4o Vision) |
| April 27 | Apple Sign In + push notifications |
| May 1 | Android release + App Store assets complete |
| May 14 | Full gap analysis resolved (sweetness, radar, sommelier tiers, shortcuts) |
| May 16 | Full tablet/desktop responsive experience |

---

## Database Migrations Applied

| Migration | Description | Applied |
|---|---|---|
| 001_initial_schema.sql | Core tables — wine_entries, user_profiles | ✅ |
| 002_user_roles.sql | user_role, sommelier_status, sommelier_cert_url | ✅ |
| 003–006 | Back label, sweetness, style shortcuts, misc fields | ✅ |
| 007_needs_resubmission.sql | needs_resubmission status constraint | ✅ |
| 008_custom_aromas.sql | custom_aromas TEXT[] on wine_entries | ✅ |
| 009_rejection_reason.sql | sommelier_rejection_reason on user_profiles | ✅ |

---

*Pour Across America — Built with React Native / Expo SDK 51, Supabase, and GPT-4o Vision*
