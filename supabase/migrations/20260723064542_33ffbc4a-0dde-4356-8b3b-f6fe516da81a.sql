
-- Fix infinite recursion: replace cross-referencing policy with SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION public.passenger_can_view_driver(_driver_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.driver_id = _driver_user_id
      AND (
        r.passenger_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.ride_passengers rp WHERE rp.ride_id = r.id AND rp.passenger_id = auth.uid())
      )
      AND r.status IN ('searching','matched','in_progress')
  );
$$;

DROP POLICY IF EXISTS "Passengers view driver of their ride" ON public.drivers;
CREATE POLICY "Passengers view driver of their ride"
ON public.drivers FOR SELECT
USING (public.passenger_can_view_driver(user_id));

-- Clear all driver-related data as requested
DELETE FROM public.driver_routes;
DELETE FROM public.rides;
DELETE FROM public.ride_passengers;
DELETE FROM public.drivers;
DELETE FROM public.user_roles WHERE role = 'driver';
