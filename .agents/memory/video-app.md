---
name: Video marketing app
description: Architecture of the standalone marketing video in this project
---

## Rule
The marketing video is a separate Vite app, NOT part of the Expo bundle.

- Entry: `video.html` (root) → `src/video-main.tsx` → `src/components/video/VideoTemplate.tsx`
- Config: `vite.video.config.ts` with `@tailwindcss/vite`, port 5000, strictPort true, allowedHosts all
- Styles: `src/video-index.css` with `@import "tailwindcss"`
- Script: `npm run dev:client` → `vite --config vite.video.config.ts`
- Workflow: "Video Preview" (webview, port 5000) — cannot run simultaneously with "Start application"
- Scenes: `src/components/video/video_scenes/Scene1-7.tsx` (framer-motion, Tailwind className)
- Hook: `src/lib/video/hooks.ts` — `useVideoPlayer({ durations })` auto-advances scenes

**Why:** Expo/Metro cannot render framer-motion + Tailwind className components. A separate Vite server is the correct host for web-only animation content.

**AnimatePresence:** Must use `mode="wait"` (not `mode="popLayout"`) — scene components are plain function components without forwardRef, so popLayout silently breaks enter animations.

**Switching workflows:** Both "Start application" (Expo) and "Video Preview" (Vite) use port 5000. Stop one before starting the other.
