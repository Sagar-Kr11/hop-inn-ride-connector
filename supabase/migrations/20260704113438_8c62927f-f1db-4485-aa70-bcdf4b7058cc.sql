
DROP POLICY IF EXISTS "Passengers can view online drivers" ON public.drivers;
DROP POLICY IF EXISTS "Passengers can view active driver routes" ON public.driver_routes;
DROP POLICY IF EXISTS "Passengers view driver of their ride" ON public.drivers;
DROP POLICY IF EXISTS "Passengers view routes of matched driver" ON public.driver_routes;

CREATE POLICY "Passengers view driver of their ride"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.driver_id = drivers.user_id
      AND r.passenger_id = auth.uid()
      AND r.status IN ('searching','matched','in_progress')
  )
  OR EXISTS (
    SELECT 1 FROM public.ride_passengers rp
    JOIN public.rides r ON r.id = rp.ride_id
    WHERE rp.passenger_id = auth.uid()
      AND r.driver_id = drivers.user_id
  )
);

CREATE POLICY "Passengers view routes of matched driver"
ON public.driver_routes
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.driver_id = driver_routes.driver_id
        AND r.passenger_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.ride_passengers rp
      JOIN public.rides r ON r.id = rp.ride_id
      WHERE rp.passenger_id = auth.uid()
        AND r.driver_id = driver_routes.driver_id
    )
  )
);

-- spatial_ref_sys is owned by the supabase superuser (PostGIS system table). Try to lock it down;
-- silently skip statements we don't have privilege for.
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN EXECUTE 'DROP POLICY IF EXISTS "spatial_ref_sys read-only" ON public.spatial_ref_sys';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN EXECUTE 'CREATE POLICY "spatial_ref_sys read-only" ON public.spatial_ref_sys FOR SELECT TO anon, authenticated USING (true)';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN EXECUTE 'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.spatial_ref_sys FROM anon, authenticated, PUBLIC';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
