DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.events TO anon;