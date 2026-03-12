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
    // Get client IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    // Lookup location from IP
    let location = null;
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country`);
      const geo = await geoRes.json();
      if (geo.status === 'success') {
        location = [geo.city, geo.regionName, geo.country].filter(Boolean).join(', ');
      }
    } catch {
      // Location lookup failed, continue without it
    }

    return new Response(JSON.stringify({ ip, location }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ip: 'unknown', location: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
