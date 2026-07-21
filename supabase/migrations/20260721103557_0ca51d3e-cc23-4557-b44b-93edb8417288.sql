-- SOS events log table
CREATE TABLE public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ride_id uuid references public.rides(id) on delete set null,
  latitude numeric,
  longitude numeric,
  sms_sent_count int default 0,
  sms_failed_count int default 0,
  triggered_at timestamptz not null default now()
);

GRANT SELECT ON public.sos_events TO authenticated;
GRANT ALL ON public.sos_events TO service_role;

ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SOS events"
  ON public.sos_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX sos_events_user_id_idx ON public.sos_events(user_id);

-- Enable Realtime for rides and drivers so passengers can watch match status and live driver location
ALTER TABLE public.rides REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.rides';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;