---
name: Tailwind v4 Vite setup
description: How to correctly wire Tailwind CSS v4 in a Vite project in this repo
---

## Rule
Do NOT put `tailwindcss` in `postcss.config.js` when Tailwind v4 is installed. Instead:
1. Install `@tailwindcss/vite`
2. Add `tailwindcss()` to `plugins` in the Vite config
3. In the CSS entry file use `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
4. Keep `postcss.config.js` with only `autoprefixer` (or remove it entirely)

**Why:** Tailwind v4 moved its PostCSS integration to a separate `@tailwindcss/postcss` package and changed the CSS API. The old `tailwindcss` PostCSS plugin throws an error at startup.

**How to apply:** Any time a new Vite app is added to this project that needs Tailwind, follow the above pattern. The Expo app itself does not use Tailwind.
