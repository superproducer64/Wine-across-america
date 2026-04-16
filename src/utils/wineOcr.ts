export interface WineLabelData {
  name: string;
  producer: string;
  vintage: number | null;
  country: string;
  region: string;
  appellation: string;
  grapes: string[];
  rawText: string;
}

// ─── GPT-4o Vision label analysis ────────────────────────────────────────────

export async function analyzeWineLabelWithAI(imageUri: string): Promise<WineLabelData> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  const empty: WineLabelData = {
    name: '', producer: '', vintage: null,
    country: '', region: '', appellation: '',
    grapes: [], rawText: '',
  };

  if (!apiKey) {
    console.warn('No OpenAI API key — label scan will return empty.');
    return empty;
  }

  // Convert URI to base64 if needed
  let base64Image = imageUri;
  let mediaType = 'image/jpeg';

  if (imageUri.startsWith('data:')) {
    // Already a data URI — extract parts
    const match = imageUri.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mediaType = match[1];
      base64Image = match[2];
    }
  } else if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    // Use URL directly
    base64Image = imageUri;
  } else {
    // File URI — try to fetch as blob and convert
    try {
      const resp = await fetch(imageUri);
      const blob = await resp.blob();
      base64Image = await blobToBase64(blob);
      const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mediaType = match[1];
        base64Image = match[2];
      }
    } catch {
      console.warn('Could not convert image URI to base64');
      return empty;
    }
  }

  const prompt = `You are a wine expert. Analyze this wine label image and extract the following information.
Return ONLY valid JSON with these exact keys (use null or empty string/array if not found):
{
  "name": "wine name (e.g. Château Margaux, Barolo Riserva, etc.)",
  "producer": "winery or producer name",
  "vintage": 2019,
  "country": "country of origin (full name e.g. France, Italy, United States)",
  "region": "wine region (e.g. Bordeaux, Tuscany, Napa Valley)",
  "appellation": "specific appellation or AOC/DOC designation",
  "grapes": ["Cabernet Sauvignon", "Merlot"],
  "rawText": "all visible text on the label"
}
Be precise. vintage must be a number or null. grapes must be an array of strings.`;

  try {
    const imageContent = imageUri.startsWith('http')
      ? { type: 'image_url', image_url: { url: imageUri, detail: 'high' } }
      : { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64Image}`, detail: 'high' } };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('OpenAI API error:', response.status, errText);
      return empty;
    }

    const json = await response.json();
    const content: string = json.choices?.[0]?.message?.content ?? '';

    // Extract JSON from the response (may be wrapped in markdown code fence)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in GPT response:', content);
      return { ...empty, rawText: content };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: parsed.name ?? '',
      producer: parsed.producer ?? '',
      vintage: typeof parsed.vintage === 'number' ? parsed.vintage : null,
      country: parsed.country ?? '',
      region: parsed.region ?? '',
      appellation: parsed.appellation ?? '',
      grapes: Array.isArray(parsed.grapes) ? parsed.grapes : [],
      rawText: parsed.rawText ?? '',
    };
  } catch (err) {
    console.warn('Label AI analysis failed:', err);
    return empty;
  }
}

// ─── Helper: blob → base64 data URI ──────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Legacy exports kept for backward compat ─────────────────────────────────

export function parseWineLabelText(text: string): WineLabelData {
  return {
    name: '', producer: '', vintage: null,
    country: '', region: '', appellation: '',
    grapes: [], rawText: text,
  };
}

export async function runOcr(_imageUri: string): Promise<string> {
  return '';
}
