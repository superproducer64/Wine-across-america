# Pour Across America

A professional wine tasting journal and intelligence app built with React Native (Expo) and Supabase.

## Key Features

- Multi-step wine entry flow (basics, structure, aromas, notes)
- **Wine label scanning**: Camera/gallery photo + Tesseract.js OCR (web) to auto-fill entry form; label photo stored in Supabase Storage and displayed on the detail screen
- Vivino-style wine card with ratings, flavor bars, food pairings, grape pills
- Share wine cards via native share sheet or in-app user sharing
- "Shared with Me" inbox with unread badge on HomeScreen
- Wine history, search, and filtering

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Charts**: react-native-svg (custom RadarChart)
- **Styling**: React Native StyleSheet with centralized theme

## Project Structure

```
src/
  components/   # Reusable UI components
    charts/     # RadarChart, AromaProfileBars
    ui/         # Button, TextInput, Badge
    wine/       # WineIdentityCard, StyleSummaryBar
  lib/          # supabase.ts client setup
  navigation/   # RootNavigator, AuthNavigator, MainNavigator
  screens/      # Auth, Home, Search, Detail, Entry, Settings
  stores/       # Zustand stores: auth, wine, subscription, entryDrafts
  theme/        # Colors, Typography, Spacing
  types/        # TypeScript interfaces
  utils/        # Helper functions
supabase/
  migrations/   # SQL migration files
  seed.sql      # Seed data
assets/         # App icons and splash screen images
```

## Running the App

The app runs in web mode via Expo Metro bundler on port 5000.

**Workflow**: "Start application" - runs `npx expo start --web --port 5000`

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` - RevenueCat iOS API key
- `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` - RevenueCat Android API key

## Key Features

- Multi-step wine entry flow (Basics, Structure, Aromas, Technical Score, Notes)
- Technical scoring algorithm based on balance, intensity, complexity, finish, typicity
- Aroma profiling with radar chart visualization
- Pro tier subscription support (30 entry free limit)
- Offline-ready auth with secure token persistence

## Notes

- The app uses React Navigation (not Expo Router) with `src/` directory structure
- Entry point is `index.js` → `App.tsx` → `RootNavigator`
- Path alias `@/` maps to `./src/`
- Supabase client gracefully falls back to placeholder values when env vars are missing
