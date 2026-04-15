import { Platform } from 'react-native';

export interface WineLabelData {
  name: string;
  producer: string;
  vintage: number | null;
  country: string;
  region: string;
  appellation: string;
  rawText: string;
}

// ─── Country & region keyword map ────────────────────────────────────────────

const COUNTRY_KEYWORDS: Array<{ keywords: string[]; country: string; regions?: Record<string, string> }> = [
  {
    country: 'France',
    keywords: ['france', 'français', 'francais', 'vins de france'],
    regions: {
      bordeaux: 'Bordeaux', 'saint-émilion': 'Bordeaux', 'pomerol': 'Bordeaux',
      'médoc': 'Bordeaux', 'pauillac': 'Bordeaux', 'margaux': 'Bordeaux',
      burgundy: 'Burgundy', bourgogne: 'Burgundy', chablis: 'Burgundy',
      champagne: 'Champagne', reims: 'Champagne', épernay: 'Champagne',
      rhône: 'Rhône Valley', 'chateauneuf': 'Rhône Valley',
      alsace: 'Alsace', loire: 'Loire', sancerre: 'Loire', 'pouilly-fumé': 'Loire',
      provence: 'Provence', languedoc: 'Languedoc',
    },
  },
  {
    country: 'Italy',
    keywords: ['italy', 'italia', 'italian', 'vino'],
    regions: {
      tuscany: 'Tuscany', toscana: 'Tuscany', chianti: 'Tuscany',
      brunello: 'Tuscany', montalcino: 'Tuscany', barolo: 'Piedmont',
      barbaresco: 'Piedmont', piedmont: 'Piedmont', piemonte: 'Piedmont',
      amarone: 'Veneto', veneto: 'Veneto', prosecco: 'Veneto',
      sicily: 'Sicily', sicilia: 'Sicily', etna: 'Sicily',
    },
  },
  {
    country: 'Spain',
    keywords: ['spain', 'españa', 'espana', 'vino de españa'],
    regions: {
      rioja: 'Rioja', ribera: 'Ribera', 'ribera del duero': 'Ribera',
      priorat: 'Priorat', 'rías baixas': 'Galicia', penedès: 'Catalonia',
    },
  },
  {
    country: 'United States',
    keywords: ['united states', 'u.s.a', 'usa', 'american wine'],
    regions: {
      california: 'California', 'napa valley': 'California', napa: 'California',
      sonoma: 'California', 'paso robles': 'California',
      oregon: 'Oregon', 'willamette': 'Oregon',
      washington: 'Washington', 'columbia valley': 'Washington',
    },
  },
  {
    country: 'Germany',
    keywords: ['germany', 'deutschland', 'german', 'qualitätswein'],
    regions: {
      mosel: 'Mosel', rheingau: 'Rheingau', pfalz: 'Pfalz',
      rheinhessen: 'Rheinhessen', spätlese: 'Mosel', auslese: 'Mosel',
    },
  },
  {
    country: 'Argentina',
    keywords: ['argentina', 'argentino', 'mendoza'],
    regions: {
      mendoza: 'Mendoza', 'luján': 'Mendoza', 'uco valley': 'Mendoza',
      salta: 'Salta', patagonia: 'Patagonia',
    },
  },
  {
    country: 'Chile',
    keywords: ['chile', 'chilean'],
    regions: {
      maipo: 'Maipo Valley', colchagua: 'Colchagua', casablanca: 'Casablanca',
    },
  },
  {
    country: 'Australia',
    keywords: ['australia', 'australian'],
    regions: {
      barossa: 'South Australia', 'clare valley': 'South Australia',
      'mclaren vale': 'South Australia', 'yarra valley': 'Victoria',
      'margaret river': 'Western Australia',
    },
  },
  {
    country: 'New Zealand',
    keywords: ['new zealand', 'zealand'],
    regions: {
      marlborough: 'Marlborough', 'central otago': 'Central Otago',
    },
  },
  {
    country: 'Portugal',
    keywords: ['portugal', 'portuguese'],
    regions: {
      douro: 'Douro', alentejo: 'Alentejo', vinho: 'Vinho Verde',
    },
  },
];

// ─── Parse raw OCR text into wine fields ─────────────────────────────────────

export function parseWineLabelText(text: string): WineLabelData {
  const lower = text.toLowerCase();
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  // Vintage: 4-digit year 1900-2030
  const vintageMatch = text.match(/\b(1[9][0-9]{2}|20[012][0-9]|2030)\b/);
  const vintage = vintageMatch ? parseInt(vintageMatch[1]) : null;

  // Country + region from keyword matching
  let country = '';
  let region = '';
  for (const entry of COUNTRY_KEYWORDS) {
    const countryFound = entry.keywords.some((kw) => lower.includes(kw));
    if (countryFound) {
      country = entry.country;
      if (entry.regions) {
        for (const [kw, reg] of Object.entries(entry.regions)) {
          if (lower.includes(kw)) {
            region = reg;
            break;
          }
        }
      }
      break;
    }
    // Also check regions even if country keyword not found
    if (entry.regions) {
      for (const [kw, reg] of Object.entries(entry.regions)) {
        if (lower.includes(kw)) {
          country = entry.country;
          region = reg;
          break;
        }
      }
    }
    if (country) break;
  }

  // Appellation: look for "appellation" or "AOC" or "DOC" or "DOCa" markers
  let appellation = '';
  const appellationMatch = text.match(
    /appellation\s+([A-Za-zÀ-ÿ\s\-']+?)\s+(contrôlée|controlee|d'origine|protégée|protegee)/i
  );
  if (appellationMatch) {
    appellation = appellationMatch[1].trim();
  } else {
    const aocMatch = text.match(/\b(AOC|AOP|DOC|DOCa|DOCG|IGT|IGP)\b/);
    if (aocMatch) {
      const idx = text.indexOf(aocMatch[0]);
      const before = text.slice(Math.max(0, idx - 40), idx).trim();
      const lastLine = before.split('\n').pop()?.trim() ?? '';
      if (lastLine && lastLine.length < 50) appellation = lastLine;
    }
  }

  // Wine name & producer: use first meaningful lines, skip vintage/country lines
  const skipPatterns = [
    /^\d{4}$/, // just a year
    /^(ml|cl|l|oz)\b/i, // volume
    /^\d+(\.\d+)?\s*(ml|cl|l|vol|%)/i, // volume/alcohol
    /^(mise en bouteille|bottled|product of|vino|wine|vin|contains|sulphites)/i,
  ];

  const meaningfulLines = lines.filter((line) => {
    if (vintage && line.includes(String(vintage))) return false;
    return !skipPatterns.some((p) => p.test(line));
  });

  const name = meaningfulLines[0] ?? '';
  const producer = meaningfulLines[1] && meaningfulLines[1] !== name ? meaningfulLines[1] : '';

  return { name, producer, vintage, country, region, appellation, rawText: text };
}

// ─── Run OCR on an image URI ─────────────────────────────────────────────────

export async function runOcr(imageUri: string): Promise<string> {
  if (Platform.OS !== 'web') {
    // Tesseract.js WASM doesn't run in Expo Go native — return empty
    return '';
  }

  try {
    const Tesseract = await import('tesseract.js');
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: () => {}, // silence progress logs
    });
    const { data } = await worker.recognize(imageUri);
    await worker.terminate();
    return data.text;
  } catch (err) {
    console.warn('OCR failed:', err);
    return '';
  }
}
