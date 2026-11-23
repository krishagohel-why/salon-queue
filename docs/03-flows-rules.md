# Doc 3: Flows & Rules

## 1. Main Flows

### A. Remote Customer Flow
1. Customer opens Home (`/`) on mobile browser -> checks live wait time -> taps [Join Queue].
2. Fills Name, 10-digit Phone, selects up to 3 services (e.g. Haircut 30m + Beard 15m), selects Barber ("Any barber" or specific barber like "Amit").
3. App validates phone; if already in queue, displays existing spot. Otherwise generates next sequential token (e.g. S-14) and redirects to `/status/:id`.
4. Customer tracks progress from home:
   - When position is 2nd in line, system triggers alert banner: *"Start coming to the salon"*.
   - When Receptionist or Barber calls token, screen instantly transitions to full-screen gold alert: *"It's your turn! Go to Amit"* with pulsing animation and mobile vibration.
5. Customer arrives at salon, Barber starts service (`In chair`) and completes it (`Done`), and customer leaves the active queue.

### B. Walk-in Customer Flow
1. Receptionist taps `[+ Add Walk-in]` on the Reception Dashboard (`/reception`).
2. Receptionist enters customer name, phone number, services, and preferred barber.
3. The walk-in customer is assigned the next token and appended to the **end** of the waiting queue (Strict First-Come, First-Served).

---

## 2. Queue Rules & Logic

- **Status State Machine:**
  - `waiting` -> `called` -> `in_chair` -> `done` (strictly forwards, never backwards).
  - `waiting` -> `cancelled`
  - `called` -> `no_show`
- **First Come, First Served (FCFS) with Barber Preferences:**
  - When Barber X clicks **[Call next]**:
    - The system searches the waiting queue in chronological order for the earliest customer who either:
      1. Explicitly selected Barber X, OR
      2. Chose "Any barber (fastest)".
    - **CRITICAL RESTRICTION:** A customer who chose a specific barber (e.g. "Ravi") will **NEVER** be assigned to a different barber (e.g. "Amit"). If Amit clicks "Call next", Ravi's customer is skipped, and the next eligible customer is chosen.
- **Single Client per Chair:**
  - A barber can only have ONE customer in `in_chair` status at any given time.
- **Waiting Time Estimation Rule:**
  - `estimated_wait_time = (Total service minutes of all eligible customers ahead) / (Number of active working barbers on duty)`.
  - Dynamically updates as customers ahead finish their services or new barbers become active.
- **Duplicate Prevention:**
  - Exactly one active spot per phone number. Joining with an existing active phone number redirects to the existing spot without duplicating.
- **No-Show Rule:**
  - If a customer is called but does not arrive within reasonable time, receptionist marks them `no_show`.
  - If a no-show customer later arrives, they are re-added to the **END** of the queue with a **new token** (never reinstated at the top).
- **Online Queue Cutoff:**
  - Online queue can be toggled Closed by the owner or closes 30 minutes before closing time.
  - When closed, the [Join Queue] button on Home is disabled with an explanatory banner, but Receptionists can still add walk-in customers.
- **Barber On Break:**
  - If a barber toggles "On Break", customers viewing that barber see "Barber is on break", and wait calculations account for reduced active barber capacity.

---

## 3. Test Checklist

- [ ] **Test 1:** Join with 2 services -> correct combined duration and price shown in live summary.
- [ ] **Test 2:** Same phone number attempts to join twice -> routes to existing spot, no duplicate token created.
- [ ] **Test 3:** Call next for Barber Amit -> correctly skips customer who specifically selected Ravi.
- [ ] **Test 4:** Call next on Reception -> Customer's phone shows full-screen "It's your turn!" within 5 seconds without manual page refresh.
- [ ] **Test 5:** Barber clicks Start/Done on Barber View -> instantly updates Reception and TV screens.
- [ ] **Test 6:** Mark customer as No-show, then add them again -> customer is placed at the end of the queue with a new token.
- [ ] **Test 7:** Close online queue in Admin -> [Join Queue] button on Home is disabled with closed message, while walk-in can still be added in Reception.
- [ ] **Test 8:** Language toggle -> switches all labels and text across the entire interface into Gujarati seamlessly.
- [ ] **Test 9:** Waiting time dynamically recalculates and decreases as customers are served and finished.
- [ ] **Test 10:** Multi-window sync -> Customer phone, Reception tablet, Barber mobile, and TV screen remain 100% in sync across browser tabs.
