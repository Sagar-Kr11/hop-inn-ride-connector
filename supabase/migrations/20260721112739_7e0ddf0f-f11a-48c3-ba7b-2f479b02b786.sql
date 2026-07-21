-- Seed 3 real current theatrical releases (as of July 2026) as bookable events.
-- Venues use real PVR/INOX multiplexes in Pune with approximate real-world coordinates.
-- NOTE: This is manually curated seed data. A production version would pull actual
-- showtimes from a ticketing partner (BookMyShow/PVR API) rather than hardcoding.
INSERT INTO public.events (name, description, location_name, location_latitude, location_longitude, event_date) VALUES
('The Odyssey — Now in Theaters',
 'Christopher Nolan''s epic new Hollywood release (in theaters since July 17, 2026). Great use case for a shared auto ride to and from the multiplex.',
 'PVR Phoenix Marketcity, Viman Nagar, Pune',
 18.5624, 73.9165,
 (now() AT TIME ZONE 'Asia/Kolkata')::date + interval '2 days' + time '19:30'),
('Alpha — Now in Theaters',
 'Alia Bhatt spy-thriller from YRF (in theaters since July 3, 2026). Shared rides to the multiplex make evening showtimes cheaper.',
 'INOX Bund Garden Road, Pune',
 18.5361, 73.8828,
 (now() AT TIME ZONE 'Asia/Kolkata')::date + interval '1 days' + time '21:00'),
('Dhamaal 4 — Now in Theaters',
 'Indra Kumar''s comedy franchise returns (in theaters since July 10, 2026). Perfect for a group shared ride out for a weekend show.',
 'PVR Icon Pavillion Mall, Senapati Bapat Road, Pune',
 18.5307, 73.8367,
 (now() AT TIME ZONE 'Asia/Kolkata')::date + interval '3 days' + time '20:15');