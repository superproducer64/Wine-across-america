# Shareable Wine Card — Design Spec

**Date:** 2026-08-19
**Status:** Approved (visual direction), ready for implementation planning

## Goal

Add a "Share" action on the Wine Detail screen that renders a branded card image
summarizing a tasting entry, and lets the user either send it to another PAA
member in-app, or share it externally via the native OS share sheet
(Instagram, Messages, etc.).

## Visual design

Approved draft: https://claude.ai/code/artifact/ecd569cc-0c7d-40c3-9167-4492591bae2c

Story variant only for v1 (1080×1920). Feed/square variant (1080×1350) is an
explicit stretch goal, not required for this pass.

**Design tokens** (finalized, build to these exactly):

| Role | Value |
|---|---|
| Background (paper) | `#F6F1E7` |
| Primary ink (text) | `#2B2420` |
| Hero accent (PAA score) | `#B5502E` |
| Secondary accent (dividers/labels) | `#6B7156` |
| Footer/watermark | `#2B2420` @ 35% opacity |
| Hero font | Fraunces, weight 900 |
| Supporting font | Work Sans, weights 400–600 |

**Layout hierarchy**, top to bottom:
1. Eyebrow label ("Tasting Note")
2. Wine name (Fraunces 900, oversized) + producer/vintage line
3. Divider
4. PAA score — `entry.technical_score`, oversized Fraunces numeral in hero
   accent, with "/100" and a small "PAA Score" label
5. Divider
6. Region/appellation
7. Top descriptors as pill tags
8. *(flex spacer — pushes remainder to the bottom of the card)*
9. Tier-3 row: grape/varietal blend, tasting date, location — small, muted
10. Hairline divider
11. Footer: PAA wordmark + "Download on the App Store", both at 35% ink opacity

No user name/handle appears anywhere on the card by default (privacy default
from the brief — keeps the "personal journal" framing intact, especially on
externally-shared cards).

Missing optional fields (no photo, no varietal blend, empty descriptors) are
simply omitted from layout — no placeholder art, no error state. The approved
draft demonstrates the no-photo case; a photo slot (tier 2, "if available")
gets added back into the layout without disturbing the rest of the hierarchy
when the entry has `label_photo_url`.

## Data mapping

Source: `WineEntry` (`src/types/index.ts:316-387`), the entry currently open
on `WineDetailScreen`.

| Card field | Source | Notes |
|---|---|---|
| Wine name | `entry.name` | |
| Producer / vintage line | `entry.producer`, `entry.vintage` | Omit vintage segment if `vintage` is `null` |
| PAA score | `entry.technical_score` | The general-purpose 0–100 score shown everywhere else in the app. `signature_score` (creator-tier only) is **not** used here. |
| Region | `entry.region` (fall back to `entry.appellation` / `entry.subregion` if `region` is empty) | |
| Top descriptors (3–4) | `entry.aromas_l2` first, then `entry.custom_aromas` as filler, deduplicated, capped at 4 | No prominence/ranking data exists — this is selection-order based, which is an intentional simplification, not a bug |
| Grape/varietal blend (tier 3) | `entry.grape_blends` if present, else `entry.grapes.join(', ')` | Omit row entirely if both are empty |
| Date tasted (tier 3) | `entry.tasting_date`, formatted `"MMMM d, yyyy"` | |
| Location (tier 3) | `entry.location_name` | Omit if empty |
| Wine photo (tier 2, optional) | `entry.label_photo_url` | Only added to layout when present; no placeholder when absent |

## Entry point & navigation

- New nav-bar icon on `WineDetailScreen` (alongside existing Edit/Share/Delete),
  opening a new `ShareCard` screen: `navigation.navigate('ShareCard', { entryId: entry.id })`.
- New `MainStackParamList` entry: `ShareCard: { entryId: string }`, registered
  in `MainNavigator.tsx` with `animation: 'slide_from_bottom'` (matches the
  existing convention used for `Comparison`).
- `ShareCard` screen shows the rendered card preview plus two actions:
  **Send to PAA member** and **Share externally**. This mirrors the app's
  existing pattern of building bespoke `Modal`/screen flows rather than
  introducing a new action-sheet library (none exists in the app today).

## Rendering

- New component `WineCardTemplate` (`entry: WineEntry` prop) renders the card
  as a plain React Native `View` tree at the Story pixel dimensions, off-screen
  or within the `ShareCard` screen itself.
- Captured to PNG via `react-native-view-shot`'s `captureRef`, with explicit
  `width`/`height` output options (1080×1920) so resolution is deterministic
  regardless of device pixel ratio — not a scaled-up screenshot.
- New fonts: `@expo-google-fonts/fraunces` and `@expo-google-fonts/work-sans`,
  loaded in `App.tsx` alongside the app's existing font set. Scoped to the
  card only — this does not change typography anywhere else in the app.

## Share paths

### External share
`expo-sharing`'s `shareAsync(pngUri)` — hands the captured PNG to the native
OS share sheet. Covers Instagram (Stories/feed) and any other installed app
that accepts image shares. No Instagram API integration needed.

### In-app share (send to a PAA member)
Confirmed direction: reuse the existing Phase 8 messaging system rather than
building new sharing infrastructure (e.g. extending `shared_wines`).

1. **Recipient picker** — reuses `ShareWithUserModal`'s email-search UX
   (`src/components/wine/ShareWithUserModal.tsx`) to find and select a
   recipient. There is no formal "connections" list in the app today; this
   searches the member directory via `searchUserByEmail`, same as the
   existing in-app wine-sharing path.
2. **Upload** — the captured PNG is uploaded to a new Supabase Storage bucket
   `wine-cards`, following the existing `uploadLabelPhoto`/`uploadAvatar`
   pattern in `src/lib/supabase.ts` (`fetch(uri).blob()` → `.storage.from('wine-cards').upload(...)` → `getPublicUrl`), at path
   `${userId}/${entryId}-${Date.now()}.png`.
3. **Send** — `sendMessage()` gets a new optional `attachmentUrl` param; the
   message row is created with `attachment_url` set to the uploaded card's
   public URL. An optional caption text field is available on the picker
   screen, sent as the message `content`. If the user sends without a
   caption, `content` is stored as an empty string — the migration below
   relaxes the existing length check to permit this specifically when an
   attachment is present.

### Messaging schema change required
- New migration:
  ```sql
  ALTER TABLE public.messages ADD COLUMN attachment_url text NULL;
  ALTER TABLE public.messages DROP CONSTRAINT messages_content_check; -- or existing constraint name
  ALTER TABLE public.messages ADD CONSTRAINT messages_content_check
    CHECK (
      length(content) <= 2000
      AND (attachment_url IS NOT NULL OR length(content) > 0)
    );
  ```
  (Confirm the existing constraint's name via `list_tables`/schema inspection
  before writing the migration — the exact name isn't captured in this spec.)
- `sendMessage(senderId, recipientId, content, attachmentUrl?)` in
  `src/lib/supabase.ts` gets the new optional parameter.
- `ComposeMessageScreen` and message-list rendering (`InboxScreen`/
  `MessageDetailScreen`) get minimal support to render an image bubble when
  `attachment_url` is present.

## Out of scope for this pass

- Feed/square (1080×1350) variant — stretch goal only.
- Any Instagram API integration (native OS share sheet is sufficient).
- A formal "connections"/friends model — sharing continues to use the
  member-directory search pattern already established by `ShareWithUserModal`.
- Rich messaging features beyond a single image attachment (reactions,
  multiple attachments, etc.).

## Acceptance criteria

- [ ] Card renders correctly with real (not placeholder) data from a live wine entry
- [ ] Fraunces/Work Sans load correctly and render on-device, not just in dev preview
- [ ] Generated PNG is crisp at full resolution (1080px wide minimum)
- [ ] External share opens the native share sheet with the image attached; Instagram is a working destination
- [ ] In-app share successfully sends the card image through the existing messaging flow to a chosen PAA member
- [ ] No user name/handle appears on the card by default
- [ ] Works on both iOS and Android
- [ ] Gracefully omits missing optional fields (no photo, no varietal blend, etc.) rather than erroring
