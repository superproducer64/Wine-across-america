---
name: Expo ASC API Key credential bypass
description: How to fix EAS submit failures caused by corrupted stored ASC API key private key, without Mac access
---

## Problem
EAS submit fails with "Something went wrong when submitting your app to Apple App Store Connect" — no email from Apple (auth failure, not build rejection). expo.dev credential deletion UI also fails with "CombinedGraphQLErrors: Unexpected server error". GraphQL deleteAppStoreConnectApiKey mutation also returns Expo server error.

## Root Cause
Expo stores ASC API key private keys on their servers. If the private key becomes corrupted (e.g. after key regeneration or a sync issue), EAS submit silently fails. The credential deletion is also broken via both UI and API for affected credentials.

## Fix (no Mac required)
1. User creates a new API key in App Store Connect → Users and Access → Integrations → App Store Connect API (any browser/OS)
2. User downloads the .p8 file (plain text, open in Notepad) and saves as Replit secrets: `APPLE_ASC_KEY_ID` and `APPLE_ASC_PRIVATE_KEY`
3. Register the new key in Expo via GraphQL mutation **with `Origin: https://expo.dev` header** (required — without it, mutations return 403):
   - `createAppStoreConnectApiKey` (omit `appleTeamId` — causes VALIDATION_ERROR)
   - `setAppStoreConnectApiKeyForSubmissions` on the iosAppCredentials ID
4. Run `eas submit` — it will pick up the new key automatically

**Why `Origin: https://expo.dev` is required:** Expo's GraphQL API has CORS protection on mutations; curl and urllib without that header get 403. Python urllib works if Origin header is explicitly set, but urllib drops it on redirect — use curl or construct request manually without following redirects.

## Key IDs for pour-across-america
- Account ID: `002fefd8-c490-4d09-8ac0-ac6deb2747da`
- App ID: `002044a5-1a3b-4980-85de-826b557ae9a9`
- iOS credentials ID: `582f153b-fc48-4a3c-ab48-431eda686c69`
- Issuer ID: `d2a1ce37-68d8-4c89-a42c-cc4eb8f14055`
- Active ASC key (as of Jun 2026): `47Z3RH2N78` (EAS Submit Fresh), Expo ID `39bad43c-5e66-45f7-8723-40062ed9b433`
