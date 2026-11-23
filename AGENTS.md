# AGENTS.md — Salon Queue Management

Queue app for a salon: customers join from their phone, see wait time, get called; reception and barbers manage the queue; TV display.

## Read first
- docs/01-brief.md -> features + what NOT to build
- docs/02-screens.md -> every screen's layout and behaviour
- docs/03-flows-rules.md -> flows, queue rules, test checklist

## Stack
React (v18+) + Vite + Tailwind CSS + Lucide Icons + React Router. Run with `npm run dev`.

Choose the simplest storage that keeps phone, tablet and TV in sync:
- **Storage & Synchronization:** `localStorage` with `BroadcastChannel` API (`salon_queue_channel`). This provides real-time (< 20ms) cross-tab and cross-window sync across Phone, Tablet, and TV screens with zero external backend dependencies and offline reliability.
- **Hosting:** Vercel (frontend). Live link is the first line after the title in `README.md`.

## How to work
- One screen or one feature per task. Don't touch other screens.
- Theme: dark charcoal (`#1F2937` / `#111827`) + gold (`#D4A017` / `#F59E0B`); rounded cards (`rounded-2xl`).
- All labels via the EN/GU language file (`src/translations.ts`); no hard-coded text.
- Queue rules live in ONE place in the code (`src/utils/queueRules.ts` & `src/context/SalonContext.tsx`); reuse them everywhere.
- Never add features from the 'Don't build' list (no online payments, no future booking, no SMS gateway, no loyalty points, no multi-branch).
- Tap targets must be at least 44px on phone screens.
- After each task: list changed files and how to test the change.
