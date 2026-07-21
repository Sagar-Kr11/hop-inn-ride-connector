## Root cause

The SOS was delivered to the edge function and Twilio was called — but Twilio rejected the request with:

```
21211 Invalid 'To' Phone Number: 926231XXXX
```

Your saved contact number is `9262310045` (10 digits, no country code). Twilio requires E.164 format like `+919262310045`. Because Twilio returned HTTP 400, the function counted it as `sms_failed: 1`, so the toast correctly showed "Notified 0/1 contact."

The placeholder in the Safety form (`+91 XXXXX XXXXX`) hints at this, but nothing enforces or normalizes it, so a bare 10-digit number gets saved as-is and Twilio rejects it.

## Fix

Normalize Indian phone numbers to E.164 before sending to Twilio, and also validate/normalize on save so bad numbers can't be stored.

### 1. `supabase/functions/trigger-sos/index.ts`
Add a small `toE164` helper applied to `c.phone_number` right before building the Twilio `To` param:
- Strip spaces, dashes, parentheses.
- If it already starts with `+`, keep as-is.
- If it starts with `91` and is 12 digits, prefix `+`.
- If it's 10 digits, prefix `+91` (default country = India for this app).
- Otherwise, skip that contact and record a clear error (`invalid_phone_format`) in `results` instead of calling Twilio.

### 2. `src/pages/Safety.tsx`
On save, run the same normalization on each `phone_number` before insert so stored values are already E.164. Show a destructive toast listing any contacts that couldn't be normalized (e.g. too few digits) instead of silently saving them.

Also tighten the input UX slightly: update the placeholder to `9876543210 or +919876543210` so users know both are accepted.

### 3. Backfill note
No migration needed — the existing bad row will be overwritten the next time the user saves (Safety.tsx already does delete-then-insert). After they re-save, the SOS will send successfully.

## Out of scope
- No schema change, no new dependency.
- Not touching the Driver/Ride SOS wiring — same edge function serves them, so the fix propagates automatically.
