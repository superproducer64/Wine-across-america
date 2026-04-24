# Pour Across America — Build Summary

## Overview

**Pour Across America** is a wine intelligence mobile app built with React Native (Expo SDK 51) and a Supabase (PostgreSQL) backend. It targets iOS via Expo Go and web browsers. The app allows users to log, analyze, share, and compare wines through a guided entry flow powered in part by AI.

---

## Features Built

### Wine Entry Flow
- Five-step guided entry: **Basics → Aromas → Structure → Score → Finish**
- Grape blend tracking with name and percentage per grape
- Tag support with comma-separated input
- AI-powered label scanning (GPT-4o Vision) — photograph a label to auto-fill wine details

### Wine Cards & Sharing
- **VivinoStyle Card** — clean, shareable summary card per wine entry
- **ProWineCard** — premium card featuring a pentagon radar chart, aroma category bars, and a score circle
- **WineComparisonCard** — formatted card for displaying two wines side by side

### Screens
| Screen | Purpose |
|---|---|
| Home | Displays stats (avg score, top country, top grape) and recent wines |
| Search | Filter by country or minimum score, sort results |
| Wine Detail | Full view of a single logged wine entry |
| Comparison | Compare two wines head to head |

### Data Visualizations
- SVG pentagon radar chart (5 structural axes: Tannin, Acid, Body, Alcohol, Finish)
- Aroma category bar chart
- Score circle with label

### Performance Improvements
- Skeleton shimmer placeholders replace a loading spinner while wines fetch
- Wine list items wrapped in `React.memo` to prevent unnecessary re-renders
- FlatList virtualization tuning on both Home and Search (`initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`)
- Label photos cached on device — load instantly after first view
- Home screen reads from in-memory cache on return visits — no redundant network calls
- Computed stats (avg score, top country, top grape) memoized to avoid recalculation on every render

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native via Expo SDK 51 |
| Backend | Supabase (PostgreSQL + Storage) |
| AI | OpenAI GPT-4o Vision (label scanning) |
| Charts | react-native-svg (custom pentagon radar) |
| Navigation | React Navigation (native stack + tabs) |
| State | Zustand stores (auth, wine, subscription) |
| Fonts | Playfair Display, DM Sans |
| Target platforms | iOS (Expo Go), Web |

---

## Delivery Notes

- The app is live and deployed — the client was actively using a published version throughout development
- No mock or placeholder data was used; all features connect to the live Supabase backend
- All alerts use inline banners (no native `Alert.alert()` dialogs)
- Metro bundler is configured to exclude the `.local` agent workspace directory to prevent watcher conflicts

---

*Document generated April 2026*
