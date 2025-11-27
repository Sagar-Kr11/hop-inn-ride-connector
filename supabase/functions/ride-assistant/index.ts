import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Ride assistant request received with", messages.length, "messages");

    const systemPrompt = `You are Hop-Inn's AI ride assistant, a friendly and helpful guide for India's shared auto-rickshaw service.

Your capabilities:
- Answer questions about rides, fares, and how Hop-Inn works
- Suggest popular destinations and local events
- Help users understand shared rides vs solo rides
- Explain event-based ride matching
- Provide safety tips and emergency information
- Guide users through the booking process

Key information about Hop-Inn:
- Shared auto-rickshaw service in India
- Offers route-based shared rides (multiple passengers along a route)
- Event-based shared rides (grouped rides to/from events)
- Solo rides available for direct travel
- Safety features include SOS button, emergency contacts, and trip sharing
- Real-time tracking and driver ratings
- Fare calculated based on distance and ride type

Communication style:
- Friendly and conversational
- Use Indian English and local context
- Keep responses concise (2-3 sentences max unless asked for details)
- Use emojis sparingly but appropriately 🚕
- Be empathetic and helpful
- If you don't know something specific, be honest and offer to help in other ways

Important: You can provide general guidance but cannot actually book rides or access user data. Always direct users to use the app's booking interface for actual bookings.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Ride assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
