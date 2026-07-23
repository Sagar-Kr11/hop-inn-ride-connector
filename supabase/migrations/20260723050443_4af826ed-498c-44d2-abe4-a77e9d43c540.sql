
-- Allow verified drivers to view unassigned ride requests so they can accept them
CREATE POLICY "Drivers can view unassigned ride requests"
ON public.rides
FOR SELECT
TO authenticated
USING (
  driver_id IS NULL
  AND status = 'searching'
  AND EXISTS (SELECT 1 FROM public.drivers d WHERE d.user_id = auth.uid())
);

-- Allow verified drivers to claim an unassigned ride by assigning themselves
CREATE POLICY "Drivers can claim unassigned rides"
ON public.rides
FOR UPDATE
TO authenticated
USING (
  driver_id IS NULL
  AND status = 'searching'
  AND EXISTS (SELECT 1 FROM public.drivers d WHERE d.user_id = auth.uid())
)
WITH CHECK (
  driver_id = auth.uid()
);
