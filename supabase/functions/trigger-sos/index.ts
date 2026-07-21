import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface SosBody {
  latitude?: number;
  longitude?: number;
  ride_id?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authed = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await authed.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub as string;

    const body = (await req.json().catch(() => ({}))) as SosBody;
    const latitude = typeof body.latitude === 'number' ? body.latitude : null;
    const longitude = typeof body.longitude === 'number' ? body.longitude : null;
    const rideId = body.ride_id || null;

    const admin = createClient(url, serviceRole);

    // Log first — always — regardless of SMS result
    const { data: sosRow, error: logErr } = await admin
      .from('sos_events')
      .insert({ user_id: userId, ride_id: rideId, latitude, longitude })
      .select()
      .single();
    if (logErr) {
      console.error('sos log failed', logErr);
      return new Response(JSON.stringify({ error: 'Failed to log SOS event' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: contacts } = await admin
      .from('emergency_contacts')
      .select('name, phone_number')
      .eq('user_id', userId);

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', userId)
      .maybeSingle();

    const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_FROM_NUMBER');

    const locLine = latitude != null && longitude != null
      ? `Live location: https://maps.google.com/?q=${latitude},${longitude}`
      : 'Live location unavailable';
    const rideLine = rideId ? `Active ride id: ${rideId}` : '';
    const name = profile?.full_name || 'A Hop-Inn user';
    const message =
      `🚨 Hop-Inn SOS: ${name} needs help.\n${locLine}\n${rideLine}`.trim();

    // Normalize Indian phone numbers to E.164 (Twilio requires it).
    const toE164 = (raw: string): string | null => {
      const cleaned = raw.replace(/[\s\-()]/g, '');
      if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
      if (digits.length === 10) return `+91${digits}`;
      return null;
    };

    let sent = 0;
    let failed = 0;
    const results: Array<{ to: string; ok: boolean; error?: string }> = [];

    if (sid && twToken && from && contacts && contacts.length > 0) {
      for (const c of contacts) {
        const normalized = toE164(c.phone_number);
        if (!normalized) {
          failed += 1;
          results.push({ to: c.phone_number, ok: false, error: 'invalid_phone_format' });
          continue;
        }
        try {
          const params = new URLSearchParams({
            To: normalized,
            From: from,
            Body: message,
          });
          const res = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${btoa(`${sid}:${twToken}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: params,
            },
          );
          if (res.ok) {
            sent += 1;
            results.push({ to: normalized, ok: true });
          } else {
            failed += 1;
            const errBody = await res.text();
            console.error('twilio fail', normalized, errBody);
            results.push({ to: normalized, ok: false, error: `HTTP ${res.status}` });
          }
        } catch (e) {
          failed += 1;
          results.push({ to: normalized, ok: false, error: (e as Error).message });
        }
      }
      await admin
        .from('sos_events')
        .update({ sms_sent_count: sent, sms_failed_count: failed })
        .eq('id', sosRow.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sos_event_id: sosRow.id,
        contacts_total: contacts?.length ?? 0,
        sms_sent: sent,
        sms_failed: failed,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('trigger-sos error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
