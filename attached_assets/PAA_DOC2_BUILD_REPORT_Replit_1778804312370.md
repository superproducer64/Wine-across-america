# Pour Across America App Build Report
## Replit-Ready Development Instructions

Version: Doc #2 Build List
Purpose: Upload or paste into Replit Agent as a structured build instruction file.
Recommended filename: `PAA_DOC2_BUILD_REPORT.md`

---

## 1. Project Summary

Build and refine the Pour Across America mobile app.

The app is a wine evaluation, note-taking, scoring, search, and analytics tool. It should help users move from simple tasting notes into structured wine intelligence.

Primary product motto:

> From tasting notes to wine intelligence.

The current build needs usability improvements, profile logic, wine entry cleanup, aroma/flavor improvements, smart shortcuts, radial structure scoring, and technical 100-point scoring.

---

## 2. Core Build Priorities

Build in this order:

1. Fix mobile layout and remove horizontal scrolling.
2. Add dual profile logic: Wine Explorer and Sommelier.
3. Clean up wine entry and OCR data flow.
4. Build Aroma Wheel and Smart Shortcuts.
5. Build the structure radar system.
6. Build technical 100-point scoring.
7. Add Sommelier certification upload and approval logic.

---

## 3. Global Mobile Layout Requirement

### Required behavior

The user should never need to scroll horizontally.

All screens must:

- Fit within the mobile screen width.
- Adjust dynamically across iPhone and Android screen sizes.
- Allow vertical scrolling only.
- Avoid fixed-width components that overflow the viewport.
- Resize charts, cards, forms, images, tabs, and sliders for mobile.

### Developer instruction

Audit every current screen for horizontal overflow. Fix root causes using responsive layout, flexible containers, wrapping text, and mobile-safe chart sizing.

Acceptance criteria:

- No screen creates left-right scrolling.
- Forms remain readable on small mobile screens.
- Radar charts and sliders resize correctly.
- Tabs do not overflow the screen.
- Wine cards fit cleanly on mobile.

---

## 4. Dual Profile System

### Build two user profiles

#### Profile 1: Wine Explorer

Designed for casual and everyday users.

Experience goals:

- Fast entry.
- Simple flow.
- Fewer required inputs.
- Guided interface.
- Simplified aroma/flavor options.
- Simplified structure choices.

#### Profile 2: Sommelier

Designed for professionals and advanced users.

Experience goals:

- Full tasting structure.
- Advanced scoring.
- Deeper aroma/flavor library.
- More detailed structure inputs.
- Professional tasting methodology.
- Certificate upload required for approval.

---

## 5. Registration Flow

During signup, ask the user to select one of two profiles:

- Wine Explorer
- Sommelier

After selection:

- Load the correct wine entry interface.
- Load the correct aroma/flavor library.
- Load the correct structure scoring options.
- Store selected profile on the user account.

Future setting:

- Allow users to request Sommelier access later.
- Allow users to upload certification later.
- Allow account status to change after approval.

---

## 6. Sommelier Certification Upload

Sommelier users must upload proof of certification.

Allowed file types:

- PDF
- JPG
- JPEG
- PNG

Add account approval statuses:

- Not submitted
- Pending review
- Approved
- Rejected
- Needs resubmission

Build admin capability:

- View uploaded certificate.
- Approve certification.
- Reject certification.
- Add rejection note.
- Unlock Sommelier mode after approval.

If user selects Sommelier during signup:

- Let user create account.
- Set Sommelier status to Pending until certification is approved.
- Restrict Sommelier-only fields until approval.

---

## 7. Wine Entry Flow

### Required fields

Build or refine these fields:

- Wine Name
- Producer / Winery
- Vintage
- Country
- Region
- Subregion
- Grape Variety
- Grape Percentage
- Price by Bottle
- Price by Glass
- Tasting Date
- Location
- Geo-referenced Location
- Label Image
- Manual Entry Fallback

### OCR behavior

The app should support label scanning.

OCR fields should carry forward into the wine entry screen:

- Wine Name
- Producer / Winery
- Vintage
- Country
- Grape Variety
- Price, if available
- Location, if available

User must be able to manually correct every OCR field.

### Grape variety behavior

If the label scan identifies a grape:

- Set that grape to 100 percent by default.
- Allow the user to edit the percentage.
- Allow the user to add additional grapes.
- Total grape percentages should not exceed 100 percent.
- Show validation if total percentage is below or above 100 percent.

### Price behavior

Replace the single price field with two price fields:

- Price by Bottle
- Price by Glass

Both should be optional.

### Tasting date behavior

Default tasting date to the current date.

Allow user to edit date manually.

### Location behavior

The Location field must support geo-reference.

Build:

- Manual location entry.
- Device location capture, if user grants permission.
- Saved place name.
- Latitude and longitude storage.
- Optional map-ready location object.

---

## 8. Aroma / Flavor Wheel System

Build a flexible aroma/flavor input system.

The system must adapt by user profile.

---

## 9. Wine Explorer Aroma Experience

Wine Explorer gets a simplified aroma system.

Requirements:

- Use a curated 14-category structure.
- Show predefined options by default.
- Keep input fast and easy.
- Allow optional drill-down.
- Limit drill-down to 4 to 6 items per category.
- Allow custom flavor entry by free text.

---

## 10. Sommelier Aroma Experience

Sommelier gets the expanded aroma system.

Requirements:

- Show deeper aroma categories.
- Show professional subcategories.
- Show Sommelier-only items.
- Preserve full methodology.
- Allow custom flavor entry by free text.

---

## 11. Aroma Visibility Rules

Each aroma item needs a profile visibility rule.

Default:

- If an item is unmarked, show it to both Wine Explorer and Sommelier.

Sommelier-only:

- If an item is marked with `S`, show it only in Sommelier mode.
- Hide `S` items from Wine Explorer.

Suggested data fields:

```sql
aroma_categories
- id
- name
- display_order

aroma_items
- id
- category_id
- name
- sommelier_only
- display_order
```

---

## 12. Custom Aroma / Flavor Entries

Users can manually add additional aroma or flavor notes.

Custom entries must:

- Save with the wine record.
- Save alongside predefined tags.
- Be searchable later.
- Appear in the wine’s flavor profile.
- Track usage frequency per user.

Future enhancement:

- Frequently used custom entries should appear as suggestions.
- Frequently used custom entries can be added to the user’s personal quick list.

Suggested data fields:

```sql
custom_aroma_entries
- id
- user_id
- wine_id
- text
- created_at

user_aroma_quick_list
- id
- user_id
- text
- usage_count
- last_used_at
```

---

## 13. Smart Shortcuts and Aroma Wheel Tabs

Add two tabs at the top of the wine entry aroma section:

- Smart Shortcuts
- Aroma Wheel

### Smart Shortcuts behavior

When user selects a shortcut:

- Auto-populate aroma/flavor categories.
- Auto-populate structure values.
- Highlight all preselected items.
- Allow full manual editing after selection.

The shortcut must not lock the user into fixed values.

After selecting a shortcut, the user must be able to:

- Open Aroma Wheel.
- Add notes.
- Remove preselected notes.
- Adjust structure sliders.
- Save final adjusted profile.

---

## 14. Smart Shortcut 1: Fresh & Crisp White

Use for:

- Sauvignon Blanc
- Albariño
- Pinot Grigio
- Txakoli

Auto-select aroma profile:

- Citrus: lemon, lime
- Herbal: grass
- Mineral: saline

Structure values:

- Acidity: 8 to 9
- Body: 3 to 4
- Intensity: 6 to 7

Style label:

- Light, refreshing, zesty

---

## 15. Smart Shortcut 2: Ripe & Round White

Use for:

- Chardonnay, unoaked
- Viognier
- Chenin Blanc

Auto-select aroma profile:

- Stone Fruit: peach, apricot
- Tropical: mango
- Sweet / Ripe: ripe fruit

Structure values:

- Acidity: 5 to 6
- Body: 6 to 7
- Intensity: 6 to 7

Style label:

- Smooth, fruity, round

---

## 16. Smart Shortcut 3: Oaky Chardonnay

Use for:

- Oaked Chardonnay
- Napa Chardonnay
- White Burgundy

Auto-select aroma profile:

- Oak / Toast: vanilla, toast
- Stone Fruit: peach
- Other: butter, cream

Structure values:

- Acidity: 5 to 6
- Body: 7 to 8
- Intensity: 7 to 8

Style label:

- Rich, creamy, oak-driven

---

## 17. Smart Shortcut 4: Light & Juicy Red

Use for:

- Pinot Noir
- Gamay
- Light reds

Auto-select aroma profile:

- Red Fruit: strawberry, raspberry
- Floral: violet
- Herbal: fresh herbs

Structure values:

- Acidity: 7 to 8
- Tannin: 3 to 4
- Body: 4 to 5
- Intensity: 5 to 6

Style label:

- Fresh, vibrant, easy drinking

---

## 18. Smart Shortcut 5: Ripe & Smooth Red

Use for:

- Merlot
- Zinfandel
- Grenache

Auto-select aroma profile:

- Black Fruit: blackberry, plum
- Spice: clove
- Sweet / Ripe: jam

Structure values:

- Acidity: 5 to 6
- Tannin: 5 to 6
- Body: 6 to 7
- Intensity: 6 to 7

Style label:

- Soft, fruit-forward, smooth

---

## 19. Smart Shortcut 6: Bold & Structured Red

Use for:

- Cabernet Sauvignon
- Syrah
- Malbec

Auto-select aroma profile:

- Black Fruit: blackcurrant
- Spice: black pepper
- Oak / Toast: cedar, smoke

Structure values:

- Acidity: 5 to 6
- Tannin: 7 to 9
- Body: 8 to 9
- Intensity: 8 to 9

Style label:

- Powerful, structured, intense

---

## 20. Structure System and Radial Diagram

Build one clean radial or spider diagram.

Requirements:

- Works for Wine Explorer and Sommelier.
- Uses mixed numeric and categorical inputs.
- Stays clean on mobile.
- Resizes to screen width.
- Feeds the wine structure profile.
- Saves all values to the wine record.

Important decision:

The source document calls this a 6-axis system but lists 7 structure elements.

Recommended implementation:

Use a 7-axis radar chart:

1. Sweetness
2. Acidity
3. Tannin
4. Body
5. Alcohol
6. Intensity
7. Finish

This is the cleanest wine evaluation model and avoids hiding Finish.

---

## 21. Sweetness Input

Build:

- 1 to 10 slider.
- Same for both profiles.
- Dry to Sweet guidance.
- Numeric value storage.

Visible to:

- Wine Explorer
- Sommelier

---

## 22. Acidity Input

Build:

- 1 to 10 slider.
- Same for both profiles.
- Low to High guidance.
- Numeric value storage.

Visible to:

- Wine Explorer
- Sommelier

---

## 23. Tannin Input

Build:

- 1 to 10 slider.
- Same for both profiles.
- Low to High guidance.
- Numeric value storage.

Visible to:

- Wine Explorer
- Sommelier

---

## 24. Body Input

### Wine Explorer options

- Light, internal value 3
- Medium, internal value 6
- Full, internal value 9

### Sommelier options

- Light, internal value 2
- Medium Minus, internal value 4
- Medium, internal value 6
- Medium Plus, internal value 8
- Full, internal value 10

### Hints

- Light: like water / skim milk
- Medium: like whole milk
- Full: like cream

---

## 25. Alcohol Input

### Wine Explorer options

- Low, internal value 3
- Medium, internal value 6
- High, internal value 9

### Sommelier options

- Low, internal value 2
- Medium Minus, internal value 4
- Medium, internal value 6
- Medium Plus, internal value 8
- High, internal value 10

### Hints

- Low: light, no warmth in back of throat, few or no legs
- Medium: gentle warmth, legs move at a moderate speed
- High: noticeable heat, many legs that move slowly

---

## 26. Intensity Input

### Wine Explorer options

- Low, internal value 3
- Medium, internal value 6
- High, internal value 9

### Sommelier options

- Low, internal value 2
- Medium Minus, internal value 4
- Medium, internal value 6
- Medium Plus, internal value 8
- High, internal value 10

### Numeric blocks

- 1 to 3
- 4 to 6
- 7 to 8
- 9 to 10

### Hints

- Low: subtle, you need to bring your nose into the glass
- Medium: noticeable, you smell it at nose or chin level
- High: expressive, you can smell it at chin level or even lower

---

## 27. Finish Input

Build Finish as part of the structure profile and technical scoring.

Recommended behavior:

- Capture Finish once as a 1 to 20 value.
- Show Short, Medium, Long guidance.
- Use normalized radar display value by dividing the 1 to 20 score by 2.

Technical scoring ranges:

- 1 to 6: Short
- 7 to 13: Medium
- 14 to 20: Long

Visible to:

- Wine Explorer
- Sommelier

---

## 28. Technical 100-Point Scoring System

Build five technical categories.

Each category is worth 20 points.

Categories:

1. Balance
2. Intensity
3. Complexity
4. Finish
5. Typicity / Precision

Total score:

- Add all five categories.
- Display final score from 1 to 100.
- Save final score to wine record.

---

## 29. Balance Score

Build:

- 1 to 20 slider.
- Helper question: Do all elements feel in harmony?
- Helper explanation: Balance is how well acidity, tannin, alcohol, body, fruit, and oak work together.

---

## 30. Technical Intensity Score

Build:

- 1 to 20 score.
- Autofill from the previous structure Intensity selection.

Wine Explorer behavior:

- Autofill by multiplying the 1 to 10 structure Intensity score by 2.
- Keep simple.

Sommelier behavior:

- Autofill by multiplying the 1 to 10 structure Intensity score by 2.
- Allow manual editing.

---

## 31. Complexity Score

Build:

- 1 to 20 slider.
- Helper question: How many layers and dimensions does the wine have?
- Helper explanation: Does it evolve, open up, and stay interesting?

---

## 32. Technical Finish Score

Build:

- 1 to 20 slider.
- Ranges:
  - 1 to 6
  - 7 to 13
  - 14 to 20

Same behavior for both profiles.

---

## 33. Typicity / Precision Score

Build:

- 1 to 20 slider.
- Helper question: How well does the wine represent its grape, style, region, or intended expression?

---

## 34. Suggested Data Model

Use this as a starter structure. Adjust to match existing database.

```sql
users
- id
- email
- name
- profile_type
- sommelier_status
- created_at
- updated_at

sommelier_certificates
- id
- user_id
- file_url
- file_type
- status
- rejection_note
- submitted_at
- reviewed_at
- reviewed_by

wines
- id
- user_id
- wine_name
- producer
- vintage
- country
- region
- subregion
- price_bottle
- price_glass
- tasting_date
- location_name
- latitude
- longitude
- label_image_url
- created_at
- updated_at

wine_grapes
- id
- wine_id
- grape_name
- percentage

wine_structure_scores
- id
- wine_id
- sweetness
- acidity
- tannin
- body
- alcohol
- intensity
- finish_raw
- finish_radar_value

wine_technical_scores
- id
- wine_id
- balance
- intensity
- complexity
- finish
- typicity_precision
- total_score

aroma_categories
- id
- name
- display_order

aroma_items
- id
- category_id
- name
- sommelier_only
- display_order

wine_aroma_items
- id
- wine_id
- aroma_item_id

custom_aroma_entries
- id
- user_id
- wine_id
- text
- created_at

smart_shortcuts
- id
- name
- description
- style_label
- recommended_for
- preset_structure_json
- preset_aromas_json
```

---

## 35. Replit Agent Build Prompt

Copy this section into Replit Agent if you want a direct build command.

```text
You are improving an existing mobile wine evaluation app called Pour Across America.

Start by reviewing the existing app structure, database, components, and routing. Do not rebuild from scratch unless the current app cannot support these changes.

Implement the build list from this report in phases.

Phase 1:
Fix all mobile layout issues. The app must never require horizontal scrolling. All forms, cards, charts, tabs, and sliders must fit inside mobile screen width. Only vertical scrolling is allowed.

Phase 2:
Add a dual profile system with Wine Explorer and Sommelier profiles. Wine Explorer gets a simplified interface. Sommelier gets advanced fields and expanded aroma/scoring controls. Store profile type on the user account.

Phase 3:
Improve wine entry. OCR fields must carry into the wine entry form and remain manually editable. Add Region and Subregion fields. Split Price into Price by Bottle and Price by Glass. Default Tasting Date to current date. Add geo-referenced Location storage. Grape variety should default to 100 percent when detected, but users can edit percentage and add grapes.

Phase 4:
Build the Aroma Wheel with profile-based visibility. Unmarked aroma items show to both profiles. Items marked Sommelier-only show only to Sommelier users. Add custom aroma/flavor text entries that save with the wine, appear in the flavor profile, and are searchable.

Phase 5:
Add Smart Shortcuts and Aroma Wheel tabs. Smart Shortcuts should auto-populate aroma tags and structure values, highlight selected items, and still allow full manual editing.

Phase 6:
Build a clean mobile radial chart. Use 7 axes: Sweetness, Acidity, Tannin, Body, Alcohol, Intensity, Finish. Sweetness, Acidity, and Tannin use 1 to 10 sliders for both profiles. Body, Alcohol, and Intensity use simplified Wine Explorer options and expanded Sommelier options. Finish should support technical scoring and radar display.

Phase 7:
Build the technical 100-point scoring system with five 20-point categories: Balance, Intensity, Complexity, Finish, Typicity / Precision. Auto-calculate and display the final 1 to 100 score. For technical Intensity, autofill from the structure Intensity score multiplied by 2. Allow Sommelier users to edit the autofilled value.

Phase 8:
Add Sommelier certification upload. Accept PDF, JPG, JPEG, and PNG. Add approval statuses: Not submitted, Pending review, Approved, Rejected, Needs resubmission. Add simple admin review capability if admin tools exist.

Preserve existing working features. Use responsive design. Keep the interface clean, fast, and mobile-first.
```

---

## 36. Acceptance Checklist

Use this checklist before marking the build complete.

### Mobile layout

- [ ] No horizontal scroll on any screen.
- [ ] Forms fit mobile screen width.
- [ ] Radar chart fits mobile screen width.
- [ ] Tabs fit mobile screen width.
- [ ] Cards fit mobile screen width.
- [ ] Sliders fit mobile screen width.

### Profiles

- [ ] User can select Wine Explorer.
- [ ] User can select Sommelier.
- [ ] Profile is saved.
- [ ] Wine Explorer sees simplified experience.
- [ ] Sommelier sees advanced experience.
- [ ] Sommelier-only fields stay hidden from Wine Explorer.

### Wine entry

- [ ] OCR fields carry forward.
- [ ] OCR fields are editable.
- [ ] Manual entry works.
- [ ] Region and Subregion exist.
- [ ] Price by Bottle exists.
- [ ] Price by Glass exists.
- [ ] Tasting Date defaults to current date.
- [ ] Location supports geo-reference.
- [ ] Grape defaults to 100 percent.
- [ ] User can edit grape percentage.
- [ ] User can add additional grapes.

### Aroma system

- [ ] Aroma Wheel exists.
- [ ] Wine Explorer sees simplified list.
- [ ] Sommelier sees expanded list.
- [ ] Sommelier-only aroma items are hidden from Wine Explorer.
- [ ] Custom entries can be added.
- [ ] Custom entries save with wine.
- [ ] Custom entries appear in flavor profile.
- [ ] Custom entries are searchable.

### Smart Shortcuts

- [ ] Smart Shortcuts tab exists.
- [ ] Aroma Wheel tab exists.
- [ ] Six shortcuts exist.
- [ ] Shortcut auto-populates aromas.
- [ ] Shortcut auto-populates structure values.
- [ ] Preselected items are highlighted.
- [ ] User can edit shortcut selections.

### Structure scoring

- [ ] Radar chart exists.
- [ ] Sweetness slider works.
- [ ] Acidity slider works.
- [ ] Tannin slider works.
- [ ] Body profile logic works.
- [ ] Alcohol profile logic works.
- [ ] Intensity profile logic works.
- [ ] Finish is handled consistently.
- [ ] Values save to wine record.

### Technical scoring

- [ ] Balance 1 to 20 exists.
- [ ] Intensity 1 to 20 exists.
- [ ] Complexity 1 to 20 exists.
- [ ] Finish 1 to 20 exists.
- [ ] Typicity / Precision 1 to 20 exists.
- [ ] Total 1 to 100 score calculates correctly.
- [ ] Technical Intensity autofills correctly.
- [ ] Sommelier can edit technical Intensity.

### Sommelier certification

- [ ] Certificate upload works.
- [ ] PDF upload works.
- [ ] JPG/JPEG/PNG upload works.
- [ ] Pending status works.
- [ ] Approved status works.
- [ ] Rejected status works.
- [ ] Sommelier access unlocks after approval.

---

## 37. Suggested File Format for Replit

Use this Markdown file as a Replit instruction document.

Best file names:

- `README.md`
- `replit.md`
- `PAA_DOC2_BUILD_REPORT.md`
- `custom_instruction/instructions.md`, if using a reusable project template

Recommended approach:

1. Upload this `.md` file into the project root.
2. Open Replit Agent.
3. Tell Agent: “Read `PAA_DOC2_BUILD_REPORT.md` and implement the build in phases. Start with Phase 1.”
4. Ask Agent to complete one phase at a time.
5. Test each phase before moving to the next.

For importing a full project into Replit, use GitHub or ZIP. For build instructions, Markdown is the right format.
