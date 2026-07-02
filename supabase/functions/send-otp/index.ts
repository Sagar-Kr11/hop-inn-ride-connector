import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string' || !/^\+\d{7,15}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone. Use E.164 format e.g. +919876543210' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const token = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const from = Deno.env.get('TWILIO_FROM_NUMBER')!;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: dbErr } = await supabase.from('otp_codes').insert({ phone, code, expires_at });
    if (dbErr) throw dbErr;

    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your Hop-Inn verification code is ${code}. It expires in 5 minutes.`,
    });

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const twilioData = await twilioRes.json();
    if (!twilioRes.ok) {
      console.error('Twilio error', twilioData);
      return new Response(JSON.stringify({ error: twilioData.message || 'Failed to send SMS' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
