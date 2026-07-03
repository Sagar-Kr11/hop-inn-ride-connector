# Hop-Inn — Project Documentation

> A shared auto-rickshaw booking web app for urban India. Built to help passengers and drivers match by **route** or **event**, with safety-first UX and a bilingual-friendly, high-contrast interface.

Use this document as a briefing when handing the project off to another AI agent or developer.

---

## 1. Product Overview

**Name:** Hop-Inn
**Type:** Web app (mobile-first, responsive)
**Domain:** Urban mobility / shared micro-transit (India)
**Core idea:** Passengers and auto-rickshaw drivers get matched on shared routes or shared destinations (events), reducing cost, wait time, and empty seats.

### Primary user flows
1. **Passenger flow** — browse events / pick a route → book a shared or solo auto → track ride → rate driver.
2. **Driver flow** — register vehicle → go online → accept passengers along a set route → view earnings.

Both flows are treated with **equal prominence** in navigation.

### Key features
- Route-based ride matching (passengers along a corridor)
- Event-based ride matching (rides to/from a specific event)
- Live map (Google Maps API planned)
- Safety: SOS/panic button, emergency contacts, live trip share
- Driver dashboard with Quick Actions (Set Route, View Passengers, Earnings)
- AI ride assistant (chat) powered by Lovable AI Gateway (Gemini 2.5 Flash)
- Phone OTP login via Twilio SMS

---

## 2. Tech Stack

| Layer | Tech |
|------|------|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui components |
| Routing | react-router-dom |
| State/data | @tanstack/react-query |
| Backend | **Lovable Cloud** (managed Supabase: Postgres, Auth, Edge Functions, Storage) |
| AI | Lovable AI Gateway → `google/gemini-2.5-flash` |
| SMS OTP | Twilio Programmable Messaging |
| Maps | Google Maps API (planned/placeholder today) |

> Note for other AI: When talking to end users, refer to the backend as **"Lovable Cloud"**, not Supabase. Internally it *is* Supabase and all Supabase tools/APIs apply.

---

## 3. Repository Layout

```
src/
  App.tsx                 # Router + providers (QueryClient, Tooltip, Toaster)
  main.tsx                # Vite entry
  index.css               # Design tokens (HSL) + Tailwind layers
  assets/                 # Static assets (logo)
  components/
    Header.tsx            # Top nav (logo + links)
    Footer.tsx            # Footer + social links
    MapPlaceholder.tsx    # Map slot (Google Maps will mount here)
    RideAssistant.tsx     # Floating AI chat widget
    NavLink.tsx
    ui/                   # shadcn/ui primitives (do not hand-edit)
  hooks/
    use-toast.ts, use-mobile.tsx
  integrations/supabase/
    client.ts             # AUTO-GENERATED — do not edit
    types.ts              # AUTO-GENERATED DB types — do not edit
  lib/utils.ts            # cn() helper etc.
  pages/
    Home.tsx              # Landing, dual CTA (Passenger / Driver)
    Auth.tsx              # Phone + OTP login (passenger & driver tabs)
    Booking.tsx           # Passenger booking flow
    Driver.tsx            # Driver dashboard + Quick Actions + Alert button
    Events.tsx            # Nearby events → event-based rides
    Ride.tsx              # Active ride screen
    History.tsx           # Past rides / earnings
    Safety.tsx            # SOS + emergency contacts
    NotFound.tsx
supabase/
  config.toml             # Function config (verify_jwt flags)
  functions/
    ride-assistant/       # Streams AI chat via Lovable AI Gateway
    send-otp/             # Generates + persists OTP, sends via Twilio
    verify-otp/           # Validates OTP against `otp_codes` table
  migrations/             # SQL migrations (otp_codes table, etc.)
```

Auto-generated files (**never edit**): `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env` (VITE_SUPABASE_*).

---

## 4. Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Landing, hero, dual entry (Passenger/Driver) |
| `/auth` | Auth | Phone OTP login; tabs for Passenger and Driver |
| `/booking` | Booking | Pick pickup/drop, choose shared/solo |
| `/driver` | Driver | Dashboard, Quick Actions, Alert button |
| `/events` | Events | Nearby events → book event ride |
| `/ride` | Ride | Live/active ride view |
| `/history` | History | Ride history / earnings |
| `/safety` | Safety | SOS, emergency contacts, trip sharing |
| `*` | NotFound | 404 |

`<RideAssistant />` is rendered globally in `App.tsx` (floats on every page).

---

## 5. Design System

Defined in `src/index.css` as HSL CSS variables and consumed via Tailwind tokens (`bg-primary`, `text-foreground`, etc.). **Do not hardcode colors** in components — always use tokens so dark mode + theming work.

Brand palette:
- **Auto Yellow** (primary) — `45 95% 55%`
- **Deep Green** (secondary) — `150 60% 35%`
- **Charcoal** (foreground) — `210 10% 23%`
- **Light Tint** (background) — `48 80% 96%`

Design principles (project memory):
- Urban Indian mobility theme; auto-yellow + deep-green + charcoal
- Big buttons, high contrast, minimize booking steps
- Live map always above the fold
- Dual flows (Passenger / Driver) have equal visual weight

---

## 6. Backend (Lovable Cloud / Supabase)

### Tables in use
- **`otp_codes`** — stores phone OTPs
  - Columns: `id`, `phone`, `code`, `expires_at`, `consumed` (bool), `attempts` (int), `created_at`
  - Written by `send-otp`, read/updated by `verify-otp` (service role only).

### Conventions
- Every `public` table has RLS enabled + explicit `GRANT`s.
- Roles must live in a **separate `user_roles` table** (never on profiles) and be checked via a `SECURITY DEFINER` `has_role()` function — never client-side.
- Client import: `import { supabase } from "@/integrations/supabase/client"`.

### Edge Functions
| Function | JWT required | Purpose |
|----------|-------------|---------|
| `send-otp` | no | Generate 6-digit code, insert into `otp_codes`, send SMS via Twilio |
| `verify-otp` | no | Validate code (5-min expiry, max 5 attempts), mark `consumed` |
| `ride-assistant` | no | Streams AI chat completions from Lovable AI Gateway (`google/gemini-2.5-flash`) |

### Secrets (stored in Lovable Cloud, never in repo)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `LOVABLE_API_KEY` (auto-provisioned for AI Gateway)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (auto-provisioned, edge-function-side only)

---

## 7. Auth Flow (Phone OTP)

1. User enters phone in `Auth.tsx`. `normalizePhone()` accepts either `+<country><number>` or a 10-digit Indian number (auto-prefixed `+91`).
2. Frontend calls `supabase.functions.invoke("send-otp", { body: { phone } })`.
3. `send-otp` writes `{phone, code, expires_at}` to `otp_codes` and sends SMS via Twilio REST API.
4. User enters the 6-digit code → frontend calls `verify-otp`.
5. `verify-otp` checks the latest unconsumed code for that phone, validates expiry + attempt count, marks `consumed=true`, and returns `{ success: true, verified: true, phone }`.
6. On success the UI toasts and navigates to `/`.

> Current implementation returns a verified flag but does **not yet mint a Supabase auth session**. If you need a real logged-in `auth.users` row, extend `verify-otp` to call `supabase.auth.admin.createUser` / issue a magic link / use `signInWithOtp` with Twilio as the SMS provider configured at the auth level.

---

## 8. AI Assistant

`src/components/RideAssistant.tsx` is a floating chat widget mounted globally. It POSTs the conversation to the `ride-assistant` edge function, which forwards to `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-2.5-flash` and **streams** the response as SSE.

System prompt (see `supabase/functions/ride-assistant/index.ts`) constrains the assistant to Hop-Inn topics: fares, ride types, safety, event-based matching, booking guidance. It explicitly cannot book rides or access user data.

Error handling:
- `429` → "Too many requests. Please try again in a moment."
- `402` → "AI service temporarily unavailable."

---

## 9. Working on This Project (Guidelines for Other AIs)

1. **Discussion first for broad requests**, direct implementation for narrow ones.
2. **Never hardcode colors** — use semantic tokens from `index.css`.
3. **Never edit** `src/integrations/supabase/client.ts`, `types.ts`, or `.env`.
4. When creating tables: `CREATE TABLE` → `GRANT`s → `ENABLE RLS` → `CREATE POLICY`, in that order, in the same migration.
5. Roles go in a **separate `user_roles` table**, checked via `has_role()` SECURITY DEFINER — never trust client-side role claims.
6. Prefer **Lovable AI Gateway** for new AI features (no user API key needed).
7. Refer to the backend as "Lovable Cloud" in user-facing copy; do not link to supabase.com or expose project IDs.
8. Keep UI changes in frontend/presentation code unless business logic is explicitly requested.
9. Respect project memory: dual flows equal, urban Indian theme, minimize booking steps, live map above the fold.

---

## 10. Known Gaps / TODO

- Google Maps API not yet wired — `MapPlaceholder.tsx` is a stub.
- Driver registration form on `/auth` doesn't yet submit to backend.
- OTP verification does not create a real Supabase session/user row.
- Nearby Events section is UI-only; needs a data source (district portal API, RSS/ICS feed, or admin upload) plus an edge function to sync into an `events` table.
- No `rides`, `drivers`, `events`, or `user_roles` tables exist yet — only `otp_codes`.
- SOS button is UI-only; needs backend for emergency contact notification (e.g. Twilio SMS blast).

---

## 11. Quick Reference — Common Requests

| User asks... | Where to look |
|-------------|---------------|
| Change colors / theme | `src/index.css` (HSL tokens) + `tailwind.config.ts` |
| Add a new page | Create in `src/pages/`, register in `src/App.tsx` |
| Add nav link | `src/components/Header.tsx` |
| Edit driver dashboard | `src/pages/Driver.tsx` |
| Modify OTP flow | `src/pages/Auth.tsx` + `supabase/functions/send-otp` + `verify-otp` |
| Edit AI assistant behavior | `supabase/functions/ride-assistant/index.ts` (system prompt) |
| Add a backend secret | Use the `add_secret` tool, then read via `Deno.env.get()` in an edge function |
| Add a table | New migration under `supabase/migrations/` with GRANTs + RLS + policies |
