DROP POLICY IF EXISTS "Drivers can manage their own routes" ON public.driver_routes;

CREATE POLICY "Drivers can manage their own routes"
ON public.driver_routes
FOR ALL
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));