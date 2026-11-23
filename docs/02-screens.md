# Doc 2: Screens & Features

## Screen 1: Home (`/`)
- **Users & Purpose:** Customers arriving at the web app on their phone or tablet to see if the salon is open, check live wait times, and initiate joining the queue.
- **UI Elements (Top to Bottom):**
  - Header: Salon name ("Royal Blend Salon & Spa"), logo mark, language toggle button (EN / ગુજરાતી), and live status badge ('Open · Closes 9 PM' or 'Closed for Online Queue').
  - Live Status Card: Total people currently waiting and calculated estimated wait time (e.g. "6 people waiting · about 50 min").
  - Barber Roster Chips: Displays each barber on duty with their live status: e.g., Ravi (busy) · Amit (free) · Imran (on break).
  - Main CTA: Big gold button `[ Join Queue ]` (or disabled with polite banner if online queue is closed).
  - Quick navigation bar to test staff views: Reception (`/reception`), Barber View (`/barber/Amit`), TV Display (`/display`), Admin (`/admin`).
- **Empty & Error states:** Shows "No wait right now - walk right in!" if the queue is empty.

## Screen 2: Join Queue (`/join`)
- **Users & Purpose:** Remote customers (or walk-ins at kiosk) entering their details to book their spot.
- **UI Elements (Top to Bottom):**
  - Step 1: Customer Details — Name and Phone Number (10 digits validated).
    - *Rule Check:* If the phone number already has an active queue spot, prompt or automatically route to `/status/:id` instead of making a duplicate.
  - Step 2: Service Selection — Interactive grid of cards (multi-select, max 3 services):
    - Haircut (30 min, ₹150)
    - Beard Trim (15 min, ₹80)
    - Hair Spa (45 min, ₹400)
    - Shave & Face Massage (25 min, ₹180)
    - Hair Coloring (40 min, ₹350)
  - Step 3: Barber Preference — Options:
    - "Any barber (fastest)"
    - Individual cards with avatar and live status for each active barber (e.g. Ravi, Amit, Imran). If a barber is on break, badges show 'On break'.
  - Step 4: Live Summary Footer:
    - Real-time recalculation: "Total 45 min · ₹230 · Expected wait ~35 min"
  - Action Button: Large gold `[ Confirm Spot ]` (minimum 44px height). On submission, assigns next token (e.g., S-14) and redirects to `/status/:id`.

## Screen 3: My Status (`/status/:id`)
- **Users & Purpose:** Remote customer tracking their place in line from their smartphone.
- **UI Elements:**
  - Token Display: Large bold token (e.g. "S-14") and queue position (e.g. "4th in line").
  - Circular countdown visualizer: Estimated time remaining (e.g. "about 35 min"), auto-updating as customers ahead finish.
  - Selected Services & Preferred Barber badge.
  - **Dynamic State Banners:**
    - When 2nd in line: Amber alert banner "Start coming to the salon — your turn is near!"
    - When Called: Full-screen celebratory gold modal with pulse animation and haptic vibration: "It's your turn! Go to [Barber Name]".
    - When In Chair: Live in-progress status with barber name and service timer.
    - When Done: "Service completed! Thank you for visiting."
  - Action Button: `[ Cancel my spot ]` with a confirmation popup dialog.

## Screen 4: Reception Dashboard (`/reception`) — Tablet / Desktop
- **Users & Purpose:** Salon receptionist managing walk-ins, calling customers, and tracking throughput.
- **UI Elements:**
  - Top Action Bar: Active queue count, average wait, and quick `[ + Add Walk-in ]` button (modal with name, phone, services, barber).
  - Left Panel: Barber Cards
    - Each barber's photo/name, status (Available, In Chair, On Break).
    - Current customer in chair, service name, elapsed timer / time remaining progress bar.
    - `[ Call Next ]` button (enabled if barber is available or chair is free).
  - Right Panel: Ordered Queue List
    - Chronological list of waiting customers: Token, Name, Phone, Services, Barber preference, Waiting time.
    - Long wait indicator: If waiting > 60 min, row is highlighted in amber.
    - Row action buttons: `[ Call ]`, `[ No-Show ]`, and `[ Cancel ]`.

## Screen 5: Barber View (`/barber/:name`) — Phone Friendly
- **Users & Purpose:** Individual barbers on their mobile phone at their station.
- **UI Elements:**
  - Barber Header: Barber name, duty switch, and "On Break / Available" toggle.
  - Current Customer Card:
    - Token, Client name, list of services booked.
    - Big live timer measuring minutes/seconds since service start.
    - Big tactile buttons: `[ Start Service ]` -> `[ Mark Done ]`.
  - Next in Line Preview: "Next for you: S-15 Kunal (Haircut)".
  - Notification banner if a customer was just called and is walking in.

## Screen 6: Waiting Area TV (`/display`) — Large TV Display
- **Users & Purpose:** Big screen mounted in salon waiting lounge, readable from 5+ meters.
- **UI Elements:**
  - High-contrast, large typography layout.
  - Left/Top Section: Barber Stations Grid
    - Barber photo, Name, Current status.
    - "Now Serving: S-12 (Rahul)" with gold highlighted token badge.
  - Right/Bottom Section: "Up Next" Queue
    - Cards showing the next 5 upcoming tokens with estimated call times and preferred barber.
  - Calling Announcement:
    - Whenever a new token is called, flashes bright gold across the screen with an audible chime alert (Web Audio API synthesised chime).

## Screen 7: Owner Settings & Admin (`/admin`)
- **Users & Purpose:** Salon owner / manager configuring operations and reviewing daily metrics.
- **UI Elements:**
  - Queue Master Switch: Open / Closed for online joining (with custom message).
  - Barbers on Duty Manager: Toggles for Ravi, Amit, Imran to mark who is working today.
  - Services Manager: List of services with toggle on/off, edit price, edit duration (mins), edit English and Gujarati titles.
  - Today's Live Analytics:
    - Customers served today
    - Average customer wait time
    - Total no-shows & cancellations
  - Quick Reset / Seed Data button for testing and demonstrations.
