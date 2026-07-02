CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT false,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_phone ON public.otp_codes(phone, created_at DESC);
GRANT ALL ON public.otp_codes TO service_role;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- No policies: only accessible via service_role in edge functions