# Pour Across America — Pre-Launch Security Audit

## Purpose

A pre-launch security audit of the Pour Across America app (React Native/Expo client + Supabase backend) to surface vulnerabilities before the app reaches real users. This is a findings-report engagement: issues are identified, ranked, and documented with recommended fixes, but no remediation is performed as part of this work.

## Trigger

Pre-launch check. The app has build artifacts (EAS builds, IPA) already in progress toward App Store release. There is prior history of a leaked GCP service account key (commit `4673f50`) that was cleaned up, which raises the baseline concern that other credential-handling issues may exist.

## Scope

**In scope:**
- Client application code (`src/`, `App.tsx`)
- Supabase backend as defined in migrations (`supabase/migrations/`, 19 files)
- Auth, storage, and data-access logic as expressed in the codebase

**Out of scope:**
- Build/release config (`app.json`, `eas.json`, signing, entitlements, Universal Links config)
- Dependency/supply-chain vulnerability scanning (e.g. `npm audit`) — not part of this pass
- Live testing against the deployed Supabase project

## Methodology

Static review only. RLS policies are verified by reading the migration SQL and reasoning about correctness (auth context, `USING`/`WITH CHECK` clauses, missing policies), not by running live queries against the deployed project. This avoids needing production credentials and avoids any risk of touching real data, at the cost of not catching drift between migration files and actual deployed state.

**Approach:** checklist skeleton with risk-weighted depth. A standard mobile-app + Supabase security checklist provides baseline coverage across the whole codebase so nothing obvious is skipped. Within that, the newest and most complex features — two-way messaging (Phase 8b), invites, and sharing — get the deepest review, since recent, complex code is statistically the most likely place for logic bugs like IDOR to hide.

## Audit Categories

1. **Secrets & key exposure** — client-bundled API keys, hardcoded credentials, anything from prior git history that may still be live. (Already identified during scoping: `src/utils/wineOcr.ts` reads `EXPO_PUBLIC_OPENAI_API_KEY`, which bundles the OpenAI key into the client and makes it extractable from the shipped app.)
2. **Supabase RLS policies** — every table across the 19 migrations checked for RLS enabled + correctly scoped policies (`auth.uid()` checks, no `USING (true)` leaks, no tables missing policies entirely).
3. **Storage buckets** — public vs. private bucket configuration (sommelier certs, profile images, wine label photos), signed URL usage vs. direct public access.
4. **Auth & session handling** — token storage (`expo-secure-store` usage), Apple auth flow, session refresh behavior.
5. **Privilege escalation paths** — sommelier approval flow, admin screens, and whether role checks are enforced server-side (RLS) or only in client code (bypassable).
6. **IDOR / access control in app logic** — messaging, sharing, and invite-link flows: token guessability, replay potential, cross-user data access.
7. **Input handling** — data flowing from AI label-scan OCR or search into DB queries or unsanitized rendering.

## Deliverable

A single findings report (markdown), issues ranked Critical → High → Medium → Low. Each finding includes:
- File and line reference
- Description of the issue
- Concrete exploit scenario (what an attacker could actually do)
- Recommended fix

No fixes are applied as part of this engagement — the report is handed back for the user to triage and act on.
