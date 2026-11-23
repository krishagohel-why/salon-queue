# Salon Queue — Brief

## Problem
On weekends customers sit 1–2 hours in the salon without knowing their turn. Some leave; others argue about who came first.

## Users
Customers, receptionist/owner, barbers.

## Must-have features
1. **Join the queue from phone:** Pick service(s) (multi-select, max 3) and barber (or 'Any barber (fastest)'). Validates 10-digit phone number.
2. **Live status:** Real-time token (e.g. S-14), queue position, countdown estimated wait time, proactive 'Start coming to the salon' alert when 2nd in line, and full-screen gold 'It's your turn!' alert with pulse & vibration when called.
3. **Receptionist dashboard (tablet):** Add walk-ins directly, see barber cards with countdowns, 'Call next', mark 'No-show', and 'Cancel'. Highlights long waits (> 60 min) in amber.
4. **Barber view (phone):** Per-barber screen showing current client, elapsed service timer, big touch buttons for [Start] and [Done], preview of next customer, and 'Available' / 'On break' toggle.
5. **Waiting-area TV display:** Large layout readable from 5 meters. Shows each barber's current token & customer, next 5 tokens in queue, and flashes gold with an audio chime when a customer is called.
6. **Owner settings & admin:** Services manager (add/edit price, duration, EN/GU names, toggle active/inactive), barbers on duty today toggle, queue switch (Open / Closed for online joining), and today's live stats (customers served, avg wait, no-shows).
7. **Bilingual EN/GU support:** Complete localization for both English and Gujarati with an instant language toggle.

## Don't build
- Online payment gateway
- Future-date appointment scheduling
- External SMS / WhatsApp provider setup
- Loyalty programs / point systems
- Multi-branch salon management

## Look & feel
- Premium salon aesthetic: dark charcoal background (`#1F2937` / `#111827`) + luxury gold accents (`#D4A017` / `#F59E0B`).
- Clean, modern, mobile-first design with rounded cards (`rounded-2xl`) and tactile buttons (minimum 44px tap targets).
- Completely localized labels in English and Gujarati.
