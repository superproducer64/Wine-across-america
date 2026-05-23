import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHEESE_STYLE_LABELS: Record<string, string> = {
  bloomy: 'Bloomy Rind', washed: 'Washed Rind', alpine: 'Alpine',
  blue: 'Blue', fresh: 'Fresh', pressed: 'Pressed', hard: 'Hard / Aged',
};

const SYSTEM_PROMPT = `You are a poetic cheese and wine writer in the tradition of the world's finest tasting note authors. You write one evocative sentence that captures the soul of a cheese — its terroir, texture, and personality — using sensory language and natural metaphor.

Your sentence must:
- Be exactly one sentence
- Use sensory metaphor (smell, taste, texture, place, season)
- Evoke the cheese's geographic origin and character
- Sound like premium editorial writing for a food magazine
- Never mention the cheese's name or producer directly

Strong examples:
"Like morning fog rolling over a coastal meadow: lemon zest, fresh herb, and a streak of cool earth."
"The smell of old barns and autumn apples, with a long finish of brown butter and roasted hazelnuts."
"Sun-bleached limestone and wild thyme compressed into a wheel — tart, mineral, and quietly persistent."
"A mountain spring in dairy form: cold, clean, and sweet with a lingering breath of alpine clover."

Respond with ONLY valid JSON — no commentary, no markdown fences:
{"description":"your one sentence here"}`;

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

    // ── Parse body ────────────────────────────────────────────────────────────
    const { entry_id, entry, scores } = await req.json() as {
      entry_id: string;
      entry: {
        name: string; producer: string; style: string;
        milk_type: string; region: string; notes: string;
      };
      scores?: {
        aroma: number; complexity: number; finish: number; typicity: number;
      };
    };

    if (!entry_id || !entry?.name) {
      return Response.json({ error: 'entry_id and entry.name are required' }, { status: 400, headers: corsHeaders });
    }

    // ── Build user prompt ─────────────────────────────────────────────────────
    const styleLabel = CHEESE_STYLE_LABELS[entry.style] ?? entry.style;
    const scoreSnippet = scores
      ? `Sensory highlights: Aroma ${scores.aroma}/10 · Complexity ${scores.complexity}/10 · Finish ${scores.finish}/10 · Typicity ${scores.typicity}/10`
      : '';

    const userPrompt = `Write one evocative sentence for this cheese:

Name: ${entry.name}
Style: ${styleLabel}
Milk type: ${entry.milk_type}
Region: ${entry.region || 'unspecified, USA'}
Tasting notes: ${entry.notes?.trim() || 'no notes recorded'}
${scoreSnippet}`;

    // ── Claude call ───────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    let description = '';
    try {
      description = JSON.parse(rawText).description ?? '';
    } catch {
      const match = rawText.match(/\{"description"\s*:\s*"([^"]+)"\}/);
      if (match) description = match[1];
    }

    if (!description) {
      return Response.json({ error: 'Failed to generate description' }, { status: 502, headers: corsHeaders });
    }

    // ── Persist to DB ─────────────────────────────────────────────────────────
    await supabase
      .from('cheese_entries')
      .update({ typicity_description: description })
      .eq('id', entry_id)
      .eq('user_id', user.id);

    return Response.json({ description }, { headers: corsHeaders });
  } catch (err) {
    console.error('generate-typicity error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
