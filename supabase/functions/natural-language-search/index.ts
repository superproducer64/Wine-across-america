import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a cheese search assistant. Convert natural language queries into structured filter objects for an artisan American cheese journal app.

The filter schema (use null for any field not applicable to the query):
{
  "query": string | null,           // keyword to match against name, producer, or notes
  "milkTypes": string[] | null,     // subset of: ["cow","sheep","goat","buffalo","mixed"]
  "styles": string[] | null,        // subset of: ["bloomy","washed","alpine","blue","fresh","pressed","hard"]
  "regions": string[] | null,       // US state names exactly as spelled, e.g. ["Vermont","California"]
  "minScore": number | null,        // 0–10 technical score floor
  "maxScore": number | null,        // 0–10 technical score ceiling
  "minPrice": number | null,        // price per lb in dollars
  "maxPrice": number | null,
  "summary": string                 // short human-readable restatement of what was searched (e.g. "Raw milk alpine cheeses from Vermont")
}

Style guide:
- "stinky" / "funky" / "smelly" → styles: ["washed"]
- "fresh" / "young" / "soft" → styles: ["fresh","bloomy"]
- "hard" / "aged" / "firm" → styles: ["pressed","hard","alpine"]
- "moldy" / "veined" → styles: ["blue"]
- "goat" / "chevre" → milkTypes: ["goat"]
- "sheep" / "manchego" → milkTypes: ["sheep"]
- Score qualifiers: "best" / "top rated" → minScore: 7; "mediocre" / "average" → maxScore: 6; "excellent" → minScore: 8

Always respond with ONLY valid JSON — no commentary, no markdown fences.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // ── Pro entitlement check ─────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier !== 'pro') {
      return Response.json({ error: 'Pro subscription required' }, { status: 403, headers: corsHeaders });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const { query } = await req.json() as { query: string };
    if (!query?.trim()) {
      return Response.json({ error: 'query is required' }, { status: 400, headers: corsHeaders });
    }

    // ── Claude call ───────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `Search query: "${query.trim()}"` }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    let filters: Record<string, unknown>;
    try {
      filters = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]+\}/);
      filters = match ? JSON.parse(match[0]) : {};
    }

    return Response.json(filters, { headers: corsHeaders });
  } catch (err) {
    console.error('natural-language-search error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
