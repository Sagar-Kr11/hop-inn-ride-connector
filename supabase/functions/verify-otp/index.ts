import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: 'phone and code required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: rows, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    const row = rows?.[0];
    if (!row) {
      return new Response(JSON.stringify({ error: 'No OTP found. Request a new code.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: 'Code expired' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (row.attempts >= 5) {
      return new Response(JSON.stringify({ error: 'Too many attempts' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (row.code !== String(code).trim()) {
      await supabase.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return new Response(JSON.stringify({ error: 'Invalid code' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('otp_codes').update({ consumed: true }).eq('id', row.id);

    return new Response(JSON.stringify({ success: true, verified: true, phone }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
