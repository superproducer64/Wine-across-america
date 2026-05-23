import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const CHEESE_STYLE_LABELS: Record<string, string> = {
  bloomy: 'Bloomy Rind', washed: 'Washed Rind', alpine: 'Alpine',
  blue: 'Blue', fresh: 'Fresh', pressed: 'Pressed', hard: 'Hard / Aged',
};

const SYSTEM_PROMPT = `You are a master cheesemonger and flavor psychologist. You analyze someone's cheese tasting history to reveal their palate personality — their preferences, patterns, and hidden tendencies.

Your analysis should be:
- Insightful and personal, never generic
- Grounded in actual scoring patterns from the data
- Encouraging while being honest about blind spots
- Written for a passionate cheese enthusiast who wants to grow

Respond with ONLY valid JSON in this exact format — no commentary, no markdown fences:
{
  "description": "Two sentences describing their palate personality and what it reveals about them as a taster.",
  "recommendations": [
    "One specific cheese name or style with a brief evocative reason",
    "Second recommendation with reason",
    "Third recommendation with reason"
  ],
  "blind_spot": "One candid sentence about a style or region they underrate or haven't explored that they would likely love."
}`;

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

    // ── Rate-limit: once per week ──────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('taste_fingerprints')
      .select('generated_at')
      .eq('user_id', user.id)
      .single();

    const { force } = await req.json().catch(() => ({ force: false })) as { force?: boolean };

    if (existing?.generated_at && !force) {
      const age = Date.now() - new Date(existing.generated_at).getTime();
      if (age < SEVEN_DAYS_MS) {
        return Response.json({ error: 'Rate limited — fingerprint refreshes weekly', retry_after_ms: SEVEN_DAYS_MS - age }, { status: 429, headers: corsHeaders });
      }
    }

    // ── Fetch last 50 entries + scores ────────────────────────────────────────
    const { data: entries } = await supabase
      .from('cheese_entries')
      .select(`
        id, name, style, milk_type, region, would_buy_again,
        cheese_scores (
          aroma, texture, flavor_intensity, complexity, finish, typicity,
          tech_balance, tech_intensity, tech_complexity, tech_finish, tech_typicity,
          technical_score
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!entries || entries.length < 3) {
      return Response.json({ error: 'Not enough entries — log at least 3 cheeses first' }, { status: 422, headers: corsHeaders });
    }

    // ── Compute aggregate stats ───────────────────────────────────────────────
    type ScoreRow = {
      aroma: number; texture: number; flavor_intensity: number;
      complexity: number; finish: number; typicity: number;
      tech_balance: number; tech_intensity: number; tech_complexity: number;
      tech_finish: number; tech_typicity: number; technical_score: number;
    };
    const scored = entries.filter((e: any) => e.cheese_scores?.length > 0);
    const avgOf = (key: keyof ScoreRow) => {
      if (!scored.length) return 0;
      return +(scored.reduce((s: number, e: any) => s + (e.cheese_scores[0]?.[key] ?? 0), 0) / scored.length).toFixed(1);
    };

    const avgScores = {
      aroma: avgOf('aroma'), texture: avgOf('texture'),
      flavor_intensity: avgOf('flavor_intensity'), complexity: avgOf('complexity'),
      finish: avgOf('finish'), typicity: avgOf('typicity'),
      tech_balance: avgOf('tech_balance'), tech_complexity: avgOf('tech_complexity'),
      tech_finish: avgOf('tech_finish'), tech_typicity: avgOf('tech_typicity'),
    };

    // Count style/milk/region frequencies
    const freq = (arr: string[]) => {
      const map: Record<string, number> = {};
      arr.forEach((v) => { map[v] = (map[v] ?? 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    };
    const topStyles  = freq(entries.map((e: any) => CHEESE_STYLE_LABELS[e.style] ?? e.style));
    const topMilks   = freq(entries.map((e: any) => e.milk_type));
    const topRegions = freq(entries.filter((e: any) => e.region).map((e: any) => e.region));

    const buyAgain    = entries.filter((e: any) => e.would_buy_again === true).length;
    const buyDeclined = entries.filter((e: any) => e.would_buy_again === false).length;
    const buyRate     = buyDeclined + buyAgain > 0
      ? Math.round((buyAgain / (buyAgain + buyDeclined)) * 100)
      : null;

    const topScored = scored
      .slice()
      .sort((a: any, b: any) => (b.cheese_scores[0]?.technical_score ?? 0) - (a.cheese_scores[0]?.technical_score ?? 0))
      .slice(0, 3)
      .map((e: any) => `${e.name} (${CHEESE_STYLE_LABELS[e.style] ?? e.style}, score ${e.cheese_scores[0]?.technical_score ?? '?'})`);

    const lowScored = scored
      .slice()
      .sort((a: any, b: any) => (a.cheese_scores[0]?.technical_score ?? 0) - (b.cheese_scores[0]?.technical_score ?? 0))
      .slice(0, 3)
      .map((e: any) => `${e.name} (${CHEESE_STYLE_LABELS[e.style] ?? e.style}, score ${e.cheese_scores[0]?.technical_score ?? '?'})`);

    // ── Build user prompt ─────────────────────────────────────────────────────
    const entryList = entries.slice(0, 30).map((e: any) => {
      const s = e.cheese_scores?.[0];
      const structAvg = s ? ((s.aroma + s.texture + s.flavor_intensity + s.complexity + s.finish + s.typicity) / 6).toFixed(1) : '?';
      const buyStr = e.would_buy_again === true ? 'yes' : e.would_buy_again === false ? 'no' : '—';
      return `- ${e.name} (${CHEESE_STYLE_LABELS[e.style] ?? e.style}, ${e.milk_type}, ${e.region || 'unknown region'}): structure avg ${structAvg}/10, would buy again: ${buyStr}`;
    }).join('\n');

    const userPrompt = `Here are this taster's last ${entries.length} cheese entries:

${entryList}

Structure score averages (${scored.length} scored entries):
- Aroma: ${avgScores.aroma}/10 · Texture: ${avgScores.texture}/10 · Flavor intensity: ${avgScores.flavor_intensity}/10
- Complexity: ${avgScores.complexity}/10 · Finish: ${avgScores.finish}/10 · Typicity: ${avgScores.typicity}/10

Technical score averages:
- Balance: ${avgScores.tech_balance}/10 · Complexity: ${avgScores.tech_complexity}/10 · Finish: ${avgScores.tech_finish}/10

Most common styles: ${topStyles.join(', ') || 'varied'}
Most common milk types: ${topMilks.join(', ') || 'varied'}
Most common regions: ${topRegions.join(', ') || 'varied'}
Would-buy-again rate: ${buyRate != null ? `${buyRate}%` : 'not tracked'}

Highest scored: ${topScored.join(', ') || 'none yet'}
Lowest scored: ${lowScored.join(', ') || 'none yet'}

Reveal this taster's palate fingerprint.`;

    // ── Claude call (Opus 4.7 + adaptive thinking for complex analysis) ───────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Find the text block (may follow a thinking block)
    const textBlock = message.content.find((b: any) => b.type === 'text');
    const rawText = textBlock?.type === 'text' ? textBlock.text : '';

    let parsed: { description: string; recommendations: string[]; blind_spot: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]+\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed?.description) {
      return Response.json({ error: 'Failed to generate fingerprint' }, { status: 502, headers: corsHeaders });
    }

    // ── Upsert fingerprint ────────────────────────────────────────────────────
    await supabase.from('taste_fingerprints').upsert({
      user_id:         user.id,
      description:     parsed.description,
      recommendations: parsed.recommendations ?? [],
      blind_spot:      parsed.blind_spot ?? '',
      avg_scores:      avgScores,
      entry_count:     entries.length,
      generated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return Response.json({
      description:     parsed.description,
      recommendations: parsed.recommendations ?? [],
      blind_spot:      parsed.blind_spot ?? '',
      avg_scores:      avgScores,
      entry_count:     entries.length,
      generated_at:    new Date().toISOString(),
    }, { headers: corsHeaders });
  } catch (err) {
    console.error('generate-fingerprint error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
