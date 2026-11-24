# 3-Minute Demo Video Script: Salon Queue Management System

> **Target Duration:** Exactly 3 minutes (180 seconds)  
> **Format:** Recorded in Chrome mobile view (`Ctrl + Shift + M` on iPhone/Pixel) or screen recorded with browser tabs side-by-side.  
> **Grading Focus:** Demonstrates the complete flow end-to-end, the 10-item test checklist, barber-preference skipping, bilingual support, and real-time synchronization.

---

## ⏱️ Video Timeline Overview

| Timestamp | Section | Screen & Action | Key Rule Demonstrated |
|---|---|---|---|
| **0:00 – 0:30** | Introduction & Home Screen | `/` (Home in Mobile View) | Bilingual EN/GU toggle, live wait card, barber status |
| **0:30 – 1:05** | Remote Customer Join Flow | `/join` | Multi-service math, phone validation, deduplication |
| **1:05 – 1:30** | Live Status & Arrival Alerts | `/status/:id` | Circular countdown, 2nd-in-line "Start coming" alert |
| **1:30 – 2:05** | Reception & Barber Skipping Rule | `/reception` (Tablet View) | 3-column progress cards, Amit skips Ravi-only client |
| **2:05 – 2:35** | TV Lounge Chime & "It's Your Turn!" | `/display` + Phone | Multi-window sync, TV audio chime, full-screen alert |
| **2:35 – 3:00** | Barber View, Admin & Wrap-up | `/barber/:name` & `/admin` | Start/Done service timer, metrics, deployment links |

---

## 🎬 Word-for-Word Presenter Script

### Scene 1: Introduction & Home Screen (0:00 – 0:30)
- **Visual:** Open browser at `https://salon-queue-kappa.vercel.app/` in mobile phone preview.
- **Action:** Show the Royal Blend header, click the language button to toggle English → Gujarati and back.
- **Spoken Narration (Read clearly):**
  > *"Hello everyone! Welcome to the Salon Queue Management System built for the MSc IT Vibe Coding Lab.  
  > On busy salon days, customers often wait 1 to 2 hours without knowing their turn. This mobile-first application completely eliminates physical lines through real-time queueing and multi-device synchronization.  
  > First, notice our luxury Royal Maroon and Champagne Beige styling. The entire system supports full bilingual localization — tapping here instantly switches all labels across the entire interface into Gujarati and back to English without any hardcoded text.  
  > On Home, we see the live queue status showing active wait times, and our three master barbers: Ravi, Amit, and Imran."*

---

### Scene 2: Remote Customer Join Flow (0:30 – 1:05)
- **Visual:** Click **[Join Queue Now]** → opens `/join`.
- **Action:** Type name `"Kunal Sharma"`, phone `"9876543210"`. Select **Haircut** (30 min, ₹150) + **Beard Trim** (15 min, ₹80).
- **Spoken Narration:**
  > *"Let's join the queue as a remote customer.  
  > The form strictly validates 10-digit Indian phone numbers. As I select up to 3 services — like Haircut and Beard Trim — the live summary at the bottom dynamically recalculates the exact combined duration: 45 minutes, total price: ₹230, and our expected wait time.  
  > We can pick a specific stylist or choose 'Any barber (fastest)'.  
  > When I tap 'Confirm & Get Queue Token', the system allocates our sequential token S-9 and takes us directly to My Status.  
  > Notice also our duplicate prevention rule: if the same phone number attempts to join again, the system immediately routes them back to their existing ticket rather than creating duplicates."*

---

### Scene 3: Live Status & Proactive Alerts (1:05 – 1:30)
- **Visual:** Screen is on `/status/:id`.
- **Action:** Point out the large token `S-9`, circular countdown timer, and queue position.
- **Spoken Narration:**
  > *"Here on the customer's phone, we see their large digital ticket: Token S-9, position in line, and an auto-updating circular countdown timer.  
  > Our smart state machine provides proactive notifications: when a client becomes second in line, an amber banner automatically prompts them: 'Start coming to the salon — your turn is very near!' so they arrive right on schedule."*

---

### Scene 4: Reception Desk & Barber Preference Rule (1:30 – 2:05)
- **Visual:** Switch tab to `/reception` in tablet landscape view.
- **Action:** Show the 3-column barber cards row at the top with progress bars. Then click **[Call Next]** for Barber Amit.
- **Spoken Narration:**
  > *"Now let's switch to the Receptionist Dashboard, optimized for a counter tablet.  
  > At the top, we have our 3-column barber stations row featuring live elapsed service progress bars for Ravi, Amit, and Imran. Below is our chronological waiting queue, with any customer waiting over 60 minutes automatically flagged in amber.  
  > Now watch our core queue matching rule: Customer S-3 specifically requested Ravi. When Barber Amit clicks 'Call Next Customer', the system strictly skips S-3 because a customer who chose Ravi is never assigned to another barber! Instead, Amit is matched with the next eligible customer who selected 'Any'."*

---

### Scene 5: TV Board Chime & "It's Your Turn!" Celebration (2:05 – 2:35)
- **Visual:** Show `/display` (TV Board) alongside the Customer Phone tab (`/status/:id`).
- **Action:** Call next customer. Show TV screen flashing and Customer Phone transitioning to full-screen gold alert.
- **Spoken Narration:**
  > *"Notice how multi-window synchronization happens in under 20 milliseconds using the BroadcastChannel API and WebSocket integration.  
  > On the waiting area TV screen, designed for 5-meter readability, calling a token triggers a synthesized Web Audio chime and flashes an announcement banner.  
  > Simultaneously, on the customer's smartphone, the screen instantly bursts into a full-screen celebratory alert: 'It's Your Turn! Go to Amit' accompanied by gentle phone vibration and confetti."*

---

### Scene 6: Barber Station, Admin & Conclusion (2:35 – 3:00)
- **Visual:** Briefly show `/barber/amit` and `/admin`.
- **Action:** Click **[Start Service]** then **[Done]** on Barber View. Show Admin metrics.
- **Spoken Narration:**
  > *"At the barber station, the barber has large 56px touch buttons to start service, track live elapsed chair time, and mark completion.  
  > Over on the Owner Admin dashboard, management can toggle online queue availability, monitor live analytics, and manage service pricing.  
  > The frontend is hosted live on Vercel, paired with our Node/Express backend on Render. All 10 checklist items pass 100% of automated tests.  
  > Thank you for watching!"*

---

## 🎙️ Recording Tips for Top Marks
1. **Resolution:** Set browser viewport to 1080p or record in Chrome DevTools Device Mode (iPhone 14 / Pixel 7).
2. **Side-by-Side View:** If possible, split your screen (Left half: Customer Phone, Right half: Reception / TV) to visually prove real-time cross-window synchronization!
3. **Audio:** Speak at a steady, upbeat pace matching the timestamps above.
