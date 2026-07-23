DROP POLICY IF EXISTS "Drivers can manage their own routes" ON public.driver_routes;
DROP POLICY IF EXISTS "Passengers view routes of matched driver" ON public.driver_routes;

CREATE POLICY "Drivers can manage their own routes"
ON public.driver_routes
FOR ALL
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Passengers view routes of matched driver"
ON public.driver_routes
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (
    EXISTS (
      SELECT 1
      FROM public.rides r
      WHERE r.driver_id = driver_routes.driver_id
        AND r.passenger_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.ride_passengers rp
      JOIN public.rides r ON r.id = rp.ride_id
      WHERE rp.passenger_id = auth.uid()
        AND r.driver_id = driver_routes.driver_id
    )
  )
);