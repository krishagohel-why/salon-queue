# Vibe Coding Prompts & Build Trajectory

This document records every prompt used during the development of the **Salon Queue Management System**, including iterations, test executions, and the required reflection.

---

## Step 1 — Project Brief, Documents & System Instruction Setup

### Prompt 1.1:
> "Read the MSc IT TA handout for the Salon Queue Management System. Create the 4 foundational documents first: `AGENTS.md`, `docs/01-brief.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`. Ensure all scope rules, must-have features, don't-build list, 7 screen specifications, and queue rules are thoroughly detailed."

### Prompt 1.2:
> "Initialize the project structure with React, Vite, Tailwind CSS, TypeScript, Lucide Icons, and React Router. Set the color palette to Charcoal (`#1F2937` / `#111827`) and Gold (`#D4A017`), with 44px minimum tap targets for phone screens."

---

## Step 2 — Core State Management & Real-Time Sync

### Prompt 2.1:
> "Define the TypeScript interfaces in `src/types.ts` for Customer, Barber, Service, and SalonState. Implement complete English and Gujarati translations in `src/translations.ts` without any hardcoded UI strings."

### Prompt 2.2:
> "Create `src/context/SalonContext.tsx`. Use HTML5 `BroadcastChannel` with `localStorage` fallback to synchronize queue state across separate browser windows (Phone, Tablet, and TV) in under 5 seconds with zero server dependencies. Include actions for `joinQueue`, `addWalkIn`, `callNext`, `startService`, `completeService`, `markNoShow`, `cancelCustomer`, and `toggleBarberBreak`."

---

## Step 3 — Home (`/`) & Join Queue (`/join`) Screens

### Prompt 3.1:
> "Build Screen 1 (Home) in `src/pages/Home.tsx` based on `docs/02-screens.md`. Show salon branding, 'Open · Closes 9 PM' badge, live waiting count and calculated wait time, live barber status chips (Ravi: busy, Amit: free, Imran: on break), and a prominent gold [Join Queue] button that disables if the queue is closed."

### Prompt 3.2:
> "Build Screen 2 (Join Queue) in `src/pages/JoinQueue.tsx`. Add fields for customer Name and 10-digit Phone validation. Implement service selection (multi-select, max 3) and barber picker ('Any' or specific barber). Live summary must update dynamically as services change. Enforce duplicate check: if the phone number is already active in line, redirect to their existing spot without creating a duplicate token."

---

## Step 4 — My Status (`/status/:id`) Screen

### Prompt 4.1:
> "Build Screen 3 (My Status) in `src/pages/MyStatus.tsx`. Display customer token (e.g. S-14), queue position, and circular countdown timer. When 2nd in line, display the amber alert 'Start coming to the salon'. When called, show the full-screen gold alert 'It's your turn! Go to [Barber Name]' with pulse animation, vibration, and celebration confetti. Provide a [Cancel my spot] button with confirmation dialog."

---

## Step 5 — Reception Dashboard (`/reception`)

### Prompt 5.1:
> "Build Screen 4 (Reception Dashboard) in `src/pages/Reception.tsx` for tablet landscape view. Top bar includes [+ Add Walk-in] modal button. Left side displays barber cards with current customer and [Call Next] button. Right side displays the waiting list in order. Highlight customers waiting over 60 minutes in amber. Provide [No-Show] and [Cancel] action buttons."

---

## Step 6 — Barber Station (`/barber/:name`) & Waiting TV (`/display`)

### Prompt 6.1:
> "Build Screen 5 (Barber View) in `src/pages/BarberView.tsx`. Show current customer in chair, services, live elapsed service timer, big tactile touch buttons for [Start Service] and [Done], preview of next customer, and 'Available / On Break' toggle."

### Prompt 6.2:
> "Build Screen 6 (Waiting Area TV) in `src/pages/TvDisplay.tsx` with high-contrast text readable from 5 meters. Display each barber's current status and token, plus an 'Up Next' list of 5 tokens with estimated times. When a token is called, trigger a flashing gold banner and a Web Audio API synthesizer chime."

---

## Step 7 — Owner Settings (`/admin`) & Queue Rules

### Prompt 7.1:
> "Build Screen 7 (Owner Settings) in `src/pages/Admin.tsx`. Display today's stats (customers served, average wait, no-shows, active queue). Add toggles for online queue open/closed, barbers on duty today, service prices/durations/active status, and a one-click Reset to Demo Data button."

### Prompt 7.2:
> "Implement queue logic in `src/utils/queueRules.ts`:
> 1. Status progression: waiting -> called -> in_chair -> done.
> 2. Amit calling next must skip a customer who requested Ravi only.
> 3. Estimated wait time = total minutes of services ahead ÷ active barbers.
> 4. No-show customer re-added must go to the end of the queue with a fresh token."

---

## Step 8 — Test Verification & Iteration

### Prompt 8.1 (Verification):
> "Create and run an automated verification suite `scripts/verify-queue-rules.mjs` to test all 10 items from `docs/03-flows-rules.md`. Confirm that barber skipping, duplicate prevention, wait time calculation, and token progression all pass."

---

## Half-Page Reflection

### 1. What the Agent Got Tricky or Misunderstood Initially
During the initial implementation of the "Call Next" matching logic, the agent's default instinct was a standard queue `shift()`: taking whoever was at the head of the queue regardless of their barber preference, and merely assigning them to whoever clicked the button. 

### 2. How It Was Noticed
While reviewing the test checklist in `docs/03-flows-rules.md` (specifically Item 3: *"Call next for Amit skips a customer who chose Ravi"*), testing demonstrated that if Customer S-3 had specifically requested Ravi, and Barber Amit clicked "Call Next", S-3 was being assigned to Amit. This violated the cardinal business rule: *"A customer who chose Ravi is never given to another barber."*

### 3. How the Prompt and Docs Fixed It
We isolated the queue matching algorithm into a dedicated pure function `findNextCustomerForBarber(queue, barberId)` in `src/utils/queueRules.ts`. The matching condition was strictly scoped:
```typescript
if (customer.barberPreference === 'any' || customer.barberPreference === barberId) {
  return customer;
}
```
If Amit calls next, the function inspects S-3, sees `barberPreference === 'ravi'`, skips S-3, and advances to S-4 who selected `'any'`. 

Additionally, the automated test suite in `scripts/verify-queue-rules.mjs` was executed to assert that Amit receives S-4 and Ravi receives S-3. Having detailed rules in `docs/03-flows-rules.md` upfront made detecting and eliminating this logic bug quick and foolproof.
