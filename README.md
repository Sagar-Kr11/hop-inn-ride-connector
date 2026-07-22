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

This project was built using **Lovable**, an AI-assisted app builder, for implementation. Architecture decisions, debugging, feature specifications, and QA were driven by the developer working alongside **Claude** (Anthropic's AI assistant) for planning and diagnosis.

The git history includes commits attributed to the Lovable bot — that is genuinely how the code was generated and applied, and it is disclosed here rather than hidden.

The developer's actual contributions include:

- **Defining requirements and product direction**: dual passenger/driver flows, route- and event-based matching, safety-first UX, and an urban Indian visual identity (auto yellow, deep green, charcoal).
- **Diagnosing real bugs from live testing**, for example:
  - Identified the `locationBias` parameter shape mismatch from a live error screenshot (`{"circle":{"center":{"lat":..., "lng":...}}}` vs. the JS SDK's expected `LatLngLiteral`) and fixed the autocomplete integration.
  - Traced an SOS "bounce to login" issue to OAuth session-hydration timing and fixed the auth-state listener logic.
- **Making product and design decisions**: the restricted color system (yellow for primary actions only, green for status only), the custom muted Google Maps style, the event curation strategy, and the decision to remove placeholder app-store content.
- **Iterating based on real testing**: verifying OTP delivery, SOS contact normalization, ride request flows, and event showtime display across devices.

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
