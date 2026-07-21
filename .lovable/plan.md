Plan: Keep movie event demo timings and add a "Curated for demo" label

User decision: keep the filled demo movie showtimes, but clearly label them as curated demo data so users are not misled into thinking they are live listings.

Changes:

1. Database migration
   - Add a `category` text column to the `public.events` table (nullable, default null).
   - Backfill the 3 seeded movie events to `category = 'movie'`.
   - Leave existing festival/concert events with `category = null` (or set to 'festival' for consistency).
   - Update the existing movie-seed migration comment to note the demo-showtime policy.

2. Frontend update in `src/pages/Events.tsx`
   - Render a small badge/label on event cards where `category === 'movie'` (or similar marker) that says "Curated demo showtime — check local listings".
   - Keep the existing date/time display intact.
   - Ensure the label uses the project's semantic color tokens (e.g., `bg-secondary/10 text-secondary`) and does not break the card layout on mobile.

3. Optional: update event seed migration comment
   - Make the comment explicitly state that showtimes are manually chosen demo values, not live listings.

No changes to the booking flow, map, or SOS features.

Verification: after build, the `/events` page should show the movie event cards with the demo label, while festival/concert cards remain unchanged.