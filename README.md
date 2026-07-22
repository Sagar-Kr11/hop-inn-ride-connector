# Hop-Inn

A shared auto-rickshaw booking web app for urban India. Passengers and drivers get matched by **route** (shared corridor) or by **event** (shared destination), reducing cost, wait time, and empty seats. Built mobile-first with live location tracking, an AI ride assistant, and an SOS safety system.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, TypeScript 5 |
| Styling | Tailwind CSS v3, shadcn/ui components |
| Routing & State | react-router-dom, @tanstack/react-query |
| Backend / Auth / DB | Lovable Cloud (managed Supabase: Postgres, Auth, Edge Functions, Realtime) |
| Maps | Google Maps Platform — Maps JS API, Places API (New), geolocation |
| SMS | Twilio Programmable Messaging (OTP + SOS alerts) |
| AI | Lovable AI Gateway → `google/gemini-2.5-flash` (ride assistant) |

---

## How This Was Built

This project was built by Sagar Kumar, who owned the architecture, product decisions, debugging, and testing throughout. Implementation was accelerated using **Lovable**, an AI-assisted app builder — the git history includes commits attributed to the Lovable bot because that's genuinely how code changes were generated and applied, and it's disclosed here rather than hidden.

Sagar's actual contributions include:

- **Defining requirements and product direction**: dual passenger/driver flows, route- and event-based matching, safety-first UX, and an urban Indian visual identity (auto yellow, deep green, charcoal).
- **Designing the system architecture**: the data model (roles, drivers, rides, events, emergency contacts), the auth strategy (Google OAuth as the primary session-minting path), and the real-time matching flow.
- **Diagnosing real bugs from live testing**, including:
  - Identifying a `locationBias` parameter shape mismatch (`lat`/`lng` vs. `latitude`/`longitude`) directly from a live error message during manual testing, and directing the fix.
  - Tracing an SOS "bounce to login" bug to OAuth session-hydration timing through hands-on debugging.
  - Catching a timezone-offset bug that was displaying movie showtimes incorrectly, by testing the live app and cross-checking the displayed times.
- **Driving the UI/UX redesign**: defining the restricted color system (yellow for primary actions only, green for status only), directing the custom muted Google Maps style, and identifying and removing placeholder/fake content (mobile app-store badges, an AI-generated mockup image) that didn't belong in a production-facing app.
- **Curating real product data**: selecting and verifying genuine events (festivals, movie releases) rather than using placeholder data.
- **QA and iteration**: testing every feature end-to-end after each change and reporting exact failures back for fixes, rather than accepting first-pass implementations.

---

## Changelog

### 1. Initial schema design
Designed a Supabase PostgreSQL schema with `profiles`, `user_roles`, `drivers`, `rides`, `ride_passengers`, `events`, `emergency_contacts`, and `driver_routes`. Enabled PostGIS for geospatial data, added Row Level Security (RLS) policies, and implemented a `has_role()` SECURITY DEFINER function for role checks.

### 2. OTP-based phone auth
Built `send-otp` and `verify-otp` Edge Functions. OTPs are generated, persisted in `otp_codes`, and sent via Twilio SMS. Verified codes mark the row as consumed and enforce expiry and attempt limits.

### 3. Google OAuth login
Integrated Google OAuth via Lovable Cloud Auth. On first signup, a profile row and default role are created automatically, and driver signup adds the `driver` role while preserving any existing passenger role.

### 4. Location autocomplete
Integrated Google Places API (New) for pickup and destination autocomplete, including a debugging fix for a `locationBias` parameter shape mismatch between REST and JS SDK conventions.

### 5. Real-time ride booking and matching
The Booking page creates real `rides` rows. Supabase Realtime subscriptions notify passengers of status changes. Fare is estimated using Haversine distance between pickup and drop coordinates.

### 6. Driver dashboard wired to real data
Drivers can go online/offline, which updates their status and begins throttled geolocation writes. Nearby ride requests are queried from the database, and earnings are aggregated from completed rides.

### 7. Functional SOS safety system
Users can save emergency contacts in Safety settings. The `trigger-sos` Edge Function sends Twilio SMS alerts to saved contacts and logs the event to `sos_events`. Fixed a session-hydration timing bug that caused false "not logged in" redirects when pressing SOS after OAuth login.

### 8. Driver signup and vehicle registration
Added a Google OAuth-based driver signup flow with a vehicle and permit registration step that writes to the `drivers` table and assigns the `driver` role.

### 9. Real event data seeding
Seeded genuine festivals (Ganesh Chaturthi, Independence Day) and current movie releases at real Pune cinema locations. Fixed a timezone-offset bug where movie showtimes were stored as UTC and displayed incorrectly in IST.

### 10. UI/UX design pass
Applied restrained color usage: yellow reserved for primary actions, green reserved for success/online status. Added a custom muted Google Maps style so yellow markers pop. Improved card spacing, elevation hierarchy, and typography contrast. Removed placeholder content including fake app-store badges and an AI-generated phone mockup.

---

## Known Limitations

- **Matching**: Geospatial matching currently uses simple Haversine distance rather than full PostGIS routing, so it is suitable for demo scale but would need optimization for production load.
- **Events**: Events are manually curated seed data, not pulled from a live ticketing or district-events API.
- **Payments**: No payment gateway integration yet — fare estimation is displayed but not charged.
- **Testing**: Automated test coverage is limited to the auth-related Edge Functions; frontend and integration tests are minimal.
