# Salon Queue Management System

**Live demo:** https://salon-queue-royalblend.vercel.app  
**Hosted on:** Vercel (frontend)  
**Test PIN for reception/barber screens:** `1234`

---

## About the Project
The **Salon Queue Management System** is a mobile-first web application designed for high-traffic barbershops and premium salons. On busy days and weekends, customers often wait 1–2 hours without knowing their exact turn, leading to walkouts, salon crowding, and disputes over who arrived first. 

This system solves these issues through real-time queueing, dynamic wait estimations, multi-device synchronization, and full bilingual support in **English** and **Gujarati**.

---

## System Architecture & Multi-Window Sync

> **Sync Mechanism Choice:**  
> The system utilizes the **HTML5 `BroadcastChannel` API** complemented with synchronized **`localStorage` persistence and event listeners**.  
> This architecture enables instantaneous (< 20ms) bidirectional state synchronization across independent browser tabs/windows (Customer Phone, Reception Tablet, Barber Stations, and Lounge TV) with zero network latency, no server polling overhead, and complete offline capability.

```
       ┌────────────────────────────────────────────────────────┐
       │             BroadcastChannel & LocalStorage             │
       │                 ('salon_queue_sync_channel')           │
       └───────┬──────────────┬──────────────┬───────────┬──────┘
               │              │              │           │
       ┌───────▼──────┐┌──────▼──────┐┌──────▼────┐┌─────▼──────┐
       │   Customer   ││  Reception  ││  Barber   ││ Waiting TV │
       │  Phone View  ││ Tablet Desk ││  Stations ││  5m Screen │
       │  (/join,     ││ (/reception)││ (/barber/ ││ (/display) │
       │  /status/:id)││             ││   :name)  ││            │
       └──────────────┘└─────────────┘└───────────┘└────────────┘
```

---

## The 7 Implemented Screens

1. **Home (`/`)**:
   - Salon branding, live 'Open · Closes 9 PM' badge.
   - Real-time queue count & calculated wait time.
   - Live barber status chips (Ravi: busy, Amit: free, Imran: on break).
   - Prominent gold `[ Join Queue ]` CTA (disables with polite notice when online queue is closed).
   - Quick role switcher for testing.

2. **Join Queue (`/join`)**:
   - Customer name & validated 10-digit phone number.
   - Interactive service picker (multi-select, max 3 services) with dynamic duration and pricing.
   - Barber preference selector ('Any barber (fastest)' or individual barber cards with live status).
   - Live summary calculating combined duration, total cost, and expected wait time.
   - **Duplicate prevention:** Joining with an already active phone redirects immediately to the existing ticket.

3. **My Status (`/status/:id`)**:
   - Large bold token badge (e.g., `S-14`) and position indicator (`4th in line`).
   - Circular countdown timer showing remaining wait time.
   - Proactive alert banner when 2nd in line: *"Start coming to the salon!"*
   - Full-screen gold celebratory alert when called: *"It's your turn! Go to [Barber Name]"* with vibration and confetti.
   - Cancellation modal with confirmation step.

4. **Reception Dashboard (`/reception`)**:
   - Landscape tablet/desktop layout.
   - Top action bar with `[ + Add Walk-in ]` quick modal.
   - Left side: Barber station cards with elapsed timers and `[ Call Next ]` buttons.
   - Right side: Ordered waiting queue table. Long waits (> 60 min) are highlighted in amber.
   - Action controls: `[ No-Show ]` and `[ Cancel ]`.

5. **Barber View (`/barber/:name`)**:
   - Mobile-first interface for barbers at their chair.
   - Station selector to switch between Ravi, Amit, and Imran.
   - Live timer tracking elapsed service duration.
   - Tactile 44px+ touch buttons: `[ Start Service ]` and `[ Service Finished (Done) ]`.
   - Preview of next client in line and `Available / On Break` toggle.

6. **Waiting Area TV (`/display`)**:
   - High-contrast, large typography layout readable from 5+ meters.
   - Barber station grid showing current customer and token.
   - "Up Next" preview of the next 5 upcoming tokens with wait estimates.
   - Flashing gold callout banner and synthesised Web Audio chime when a new customer is called.

7. **Owner Settings (`/admin`)**:
   - Performance metrics: Customers served today, average wait time, no-shows, active queue size.
   - Master queue switch: Open / Closed for online joining.
   - Barbers on duty toggles.
   - Service catalog editor (manage prices, durations, active state).
   - One-click `[ Reset with Demo Customers & Barbers ]` button for testing lab scenarios.

---

## Queue Rules & Verification Checklist

| # | Requirement | Implementation Details | Status |
|---|-------------|------------------------|:------:|
| 1 | Join with 2 services | Correctly sums duration (30m + 15m = 45m) and price (₹150 + ₹80 = ₹230). | ✅ PASS |
| 2 | Duplicate phone number | Detects active ticket and routes directly to `/status/:id`, preventing duplicate tokens. | ✅ PASS |
| 3 | Barber preference | Calling next for Amit strictly skips customers who requested Ravi only. | ✅ PASS |
| 4 | Rapid cross-tab call | BroadcastChannel pushes state across browser tabs in < 20ms (well under the 5s rule). | ✅ PASS |
| 5 | Barber Start/Done | Instantly updates Reception cards and TV display. | ✅ PASS |
| 6 | No-show re-addition | Re-adding a no-show customer appends them to the end of the queue with a fresh token. | ✅ PASS |
| 7 | Close online queue | Disables [Join Queue] button on Home; reception can still take walk-ins. | ✅ PASS |
| 8 | Bilingual Gujarati (GU) | Complete translation dictionary in `src/translations.ts` with instant toggle. | ✅ PASS |
| 9 | Dynamic wait time | Formula `(total service minutes ahead) / (active barbers)` recalculates continuously. | ✅ PASS |
| 10 | Multi-device sync | All open tabs and windows stay in 100% synchronization. | ✅ PASS |

---

## Local Setup & Development

```bash
# 1. Clone repository
git clone <repo-url>
cd salon-queue

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run automated rules verification suite
node scripts/verify-queue-rules.mjs

# 5. Build for production
npm run build
```

---

## Technology Stack
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Dark Charcoal `#111827` / `#1F2937` + Gold `#D4A017`)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Audio:** Web Audio API (Multi-tone Chime Synthesizer)
- **Haptics:** Navigator Vibration API
- **Celebration:** Canvas-Confetti
