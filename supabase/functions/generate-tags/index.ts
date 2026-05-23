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

const SYSTEM_PROMPT = `You are an expert cheesemonger and sensory analyst specializing in American artisan cheese. Your task is to generate 3–5 precise, evocative descriptor tags for a cheese entry based on its profile and tasting notes.

Tags must be:
- Specific and sensory — never generic ("tasty", "good")
- 1–3 words each, hyphenated if multi-word
- Useful for search and discovery
- Drawn from the actual data provided

Good examples: "cave-aged", "high-acid", "long-finish", "buttery", "volcanic-terroir", "washed-rind-funk", "crystalline-paste", "goaty-brightness", "alpine-herbs", "ocean-mineral", "nutty-complexity", "lactic-freshness", "raw-milk", "spring-milk"

Respond with ONLY valid JSON in this exact format — no commentary, no markdown fences:
{"tags":["tag1","tag2","tag3"]}`;

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
        milk_type: string; pasteurization: string; region: string; notes: string;
      };
      scores?: {
        aroma: number; texture: number; flavor_intensity: number;
        complexity: number; finish: number; typicity: number;
        tech_balance: number; tech_intensity: number; tech_complexity: number;
        tech_finish: number; tech_typicity: number;
      };
    };

    if (!entry_id || !entry?.name) {
      return Response.json({ error: 'entry_id and entry.name are required' }, { status: 400, headers: corsHeaders });
    }

    // ── Build user prompt ─────────────────────────────────────────────────────
    const styleLabel = CHEESE_STYLE_LABELS[entry.style] ?? entry.style;
    const scoreBlock = scores
      ? `Structure scores (1–10):
- Aroma: ${scores.aroma}/10
- Texture: ${scores.texture}/10
- Flavor intensity: ${scores.flavor_intensity}/10
- Complexity: ${scores.complexity}/10
- Finish: ${scores.finish}/10
- Typicity: ${scores.typicity}/10

Technical scores (1–10):
- Balance: ${scores.tech_balance}/10
- Intensity: ${scores.tech_intensity}/10
- Complexity: ${scores.tech_complexity}/10
- Finish quality: ${scores.tech_finish}/10
- Style typicity: ${scores.tech_typicity}/10`
      : 'Scores: not yet recorded';

    const userPrompt = `Cheese: ${entry.name}
Producer: ${entry.producer || 'unknown'}
Style: ${styleLabel}
Milk type: ${entry.milk_type}
Pasteurization: ${entry.pasteurization}
Region: ${entry.region || 'unspecified'}
Tasting notes: ${entry.notes?.trim() || 'none provided'}

${scoreBlock}

Generate 3–5 tags that capture what makes this cheese distinctive.`;

    // ── Claude call ───────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 128,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
    let tags: string[] = [];
    try {
      tags = JSON.parse(rawText).tags ?? [];
    } catch {
      // Best-effort extraction if Claude wrapped the JSON
      const match = rawText.match(/\{[^}]+\}/);
      if (match) tags = JSON.parse(match[0]).tags ?? [];
    }

    tags = tags.slice(0, 5).map((t: string) => t.toLowerCase().replace(/\s+/g, '-'));

    // ── Persist to DB ─────────────────────────────────────────────────────────
    await supabase
      .from('cheese_entries')
      .update({ ai_tags: tags })
      .eq('id', entry_id)
      .eq('user_id', user.id);

    return Response.json({ tags }, { headers: corsHeaders });
  } catch (err) {
    console.error('generate-tags error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
