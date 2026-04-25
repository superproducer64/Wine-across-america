# Pour Across America

A professional wine tasting journal and intelligence app built with React Native (Expo) and Supabase.

## Key Features

- Multi-step wine entry flow (basics, structure, aromas, notes)
- **AI label scanning**: GPT-4o Vision auto-fills wine details from a label photo
- **ProWineCard**: Pentagon radar chart (Acidity/Body/Alcohol/Tannin/Intensity), aroma profile bars, score circle, "Best Value" badge — matching the reference design
- **Wine Comparison Mode**: Pick 2 wines from your history to compare side-by-side with VS. layout and score comparison bar
- Vivino-style wine card with ratings, flavor bars, food pairings, grape pills
- Share wine cards via native share sheet or in-app user sharing
- "Shared with Me" inbox with unread badge on HomeScreen
- Wine history, search, and filtering

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Native Stack + Bottom Tabs, adaptive sidebar on tablet/desktop)
- **Charts**: react-native-svg (custom RadarChart)
- **Styling**: React Native StyleSheet with centralized theme
- **Responsive**: `useResponsive` hook in `src/hooks/useResponsive.ts`; breakpoints: phone < 600, tablet 600–1023, desktop ≥ 1024

## Project Structure

```
src/
  components/   # Reusable UI components
    charts/     # RadarChart, AromaProfileBars
    ui/         # Button, TextInput, Badge, ResponsiveContainer
    wine/       # WineIdentityCard, StyleSummaryBar, SkeletonWineListItem
  hooks/        # useResponsive (breakpoints, isPhone/isTablet/isDesktop/isWide)
  lib/          # supabase.ts client setup
  navigation/   # RootNavigator, AuthNavigator, MainNavigator (adaptive sidebar)
  screens/      # Auth, Home, Search, Detail, Entry, Settings, Comparison
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
