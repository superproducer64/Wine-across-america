export interface InfoZone {
  label: string;
  range: string;
  description: string;
  color: string;
  tag?: string;
}

export interface ParameterInfo {
  title: string;
  subtitle: string;
  whatItIs: string;
  focus?: string;
  zones?: InfoZone[];
  tip?: string;
  note?: string;
}

export const PARAMETER_INFO: Record<string, ParameterInfo> = {
  sweetness: {
    title: 'Sweetness',
    subtitle: 'How sweet the wine tastes',
    whatItIs:
      'Residual sugar left after fermentation that you taste on the tip of your tongue.',
    zones: [
      { label: 'Dry',       range: '1–2', color: '#7B8C56', description: 'No perceptible sweetness. Crisp, clean.', tag: 'Bone dry to dry' },
      { label: 'Off-Dry',   range: '3–4', color: '#B8A830', description: 'Slight hint of sweetness. Not fully dry but still graceful.', tag: 'Slightly sweet' },
      { label: 'Med Dry',   range: '5–6', color: '#D4844A', description: 'Noticeable sweetness that balances acidity. Smooth and well-integrated.', tag: 'Mildly sweet' },
      { label: 'Med Sweet', range: '7–8', color: '#CC5050', description: 'Clearly sweet and round on the palate. Pleasant and rich.', tag: 'Sweet' },
      { label: 'Sweet',     range: '9–10', color: '#C44A78', description: 'Sweet and rich with a soft, full texture.', tag: 'Very sweet' },
    ],
    tip: 'Sweetness is always balanced by acidity. High acidity can make a sweet wine taste less sweet.',
    note: 'Sugar examples: Dry <4 g/L · Off-Dry 4–12 g/L · Medium Sweet 20–40 g/L · Sweet >45 g/L',
  },

  acidity: {
    title: 'Acidity',
    subtitle: 'How tart, crisp and mouthwatering the wine feels',
    whatItIs:
      'Acidity is one of the key elements of balance in wine. It brings freshness, lift and mouthwatering sensation.',
    focus: 'Notice how much your mouth waters — the more it waters, the higher the acidity.',
    zones: [
      { label: 'Low',    range: '1–3', color: '#A8C96A', description: 'Soft and round. Little freshness. Can feel flat or flabby.' },
      { label: 'Medium', range: '4–7', color: '#5BA858', description: 'Balanced, refreshing and crisp. Feels lively and well-integrated.' },
      { label: 'High',   range: '8–10', color: '#2E7D32', description: 'Very tart, bright and mouthwatering. Sharp and cutting.' },
    ],
    tip: 'Think of acidity as "brightness." Higher acidity wines make your mouth water more.',
  },

  tannin: {
    title: 'Tannin',
    subtitle: 'How dry, grippy and structured the wine feels',
    whatItIs:
      'Tannins come from grape skins, seeds and stems. They create structure and a drying sensation on your gums.',
    focus: 'Focus on your gums and the inside of your cheeks — not your tongue. Tannins create a drying, gripping sensation there.',
    zones: [
      { label: 'Low',    range: '1–3', color: '#C5A8E0', description: 'Silky, no grip. Very gentle on the gums.', tag: 'Like silk' },
      { label: 'Medium', range: '4–7', color: '#8E44BC', description: 'Moderate grip. Noticeable but balanced drying sensation.', tag: 'Like mild black tea' },
      { label: 'High',   range: '8–10', color: '#4A1080', description: 'Strong, grippy tannins. Pronounced drying on the gums.', tag: 'Like strong black tea' },
    ],
    tip: 'Higher tannin wines often benefit from food and time to soften and integrate.',
  },

  body: {
    title: 'Body',
    subtitle: 'How heavy, rich and full the wine feels in your mouth',
    whatItIs:
      'Body comes from alcohol, sugar, glycerol and extract in the wine.',
    focus: 'Focus on weight and texture in your mouth — not the flavor. Ask yourself: how heavy does this wine feel from front to back of palate?',
    zones: [
      { label: 'Light',  range: '',    color: '#A8C96A', description: 'Very light weight. Fades quickly on the palate. Disappears easily.', tag: 'Like water' },
      { label: 'Medium', range: '',    color: '#D4844A', description: 'Balanced weight. Noticeable on the palate. Smooth and well-rounded.', tag: 'Like whole milk' },
      { label: 'Full',   range: '',    color: '#8E44BC', description: 'Full, heavy and rich. Coats the palate. Long and powerful.', tag: 'Like cream' },
    ],
    tip: 'Body is about texture — think milk vs. cream, not flavor.',
  },

  alcohol: {
    title: 'Alcohol',
    subtitle: 'Perceived warmth and heat in the back of your throat',
    whatItIs:
      'Alcohol comes from fermentation. You feel it as warmth in your throat, and you can see it in the legs of the wine.',
    focus: "Focus on warmth in the back of your throat after swallowing. It's not a flavor — it's a sensation.",
    zones: [
      { label: 'Low',    range: '1–3', color: '#A8C96A', description: 'Light, fresh. No warmth in the back of your throat, few or no legs.' },
      { label: 'Medium', range: '4–7', color: '#D4844A', description: 'Gentle warmth. Legs move at a moderate speed.' },
      { label: 'High',   range: '8–10', color: '#CC5050', description: 'Noticeable heat. Many legs that move slowly. Can feel warming in your chest.' },
    ],
    tip: 'Legs are influenced by alcohol, but also by sugar and glycerol.',
  },

  intensity: {
    title: 'Intensity',
    subtitle: 'How far can you smell the aromas?',
    whatItIs: 'Intensity is based on distance and clarity — how far away you can detect the wine\'s aromas.',
    zones: [
      { label: 'Low',       range: '1–3', color: '#A8C96A', description: 'Very subtle, hard to detect. Require deep inhalation.', tag: 'Nose inside the glass' },
      { label: 'Medium',    range: '4–6', color: '#5BA858', description: 'Clearly present, recognizable without effort.', tag: 'At nose level' },
      { label: 'High',      range: '7–8', color: '#D4844A', description: 'Strong aromas lift easily from the glass.', tag: 'At chin level' },
      { label: 'Very High', range: '9–10', color: '#CC5050', description: 'Explosive — aromas jump out immediately.', tag: 'Before glass reaches face' },
    ],
    tip: 'Intensity is about how far and how easily you can smell the aromas — not what they smell like.',
  },

  finish_length: {
    title: 'Finish Length',
    subtitle: 'How long flavors linger after you swallow',
    whatItIs:
      'Finish is about duration — notice how long the wine stays with you after the last sip.',
    focus: 'Swallow the wine, then count in your head how long the flavors and sensations last. Focus on the aftertaste, not the initial taste.',
    zones: [
      { label: 'Short',  range: '1–3', color: '#C5A8E0', description: 'Flavors fade quickly. Sensation disappears soon after swallowing.', tag: 'Like a quick echo' },
      { label: 'Medium', range: '4–7', color: '#8E44BC', description: 'Flavors linger for a few seconds. You can still feel them, but they start to fade.', tag: 'Like a brief conversation' },
      { label: 'Long',   range: '8–10', color: '#4A1080', description: 'Flavors stay with you for many seconds. The finish is persistent and noticeable.', tag: 'Like music after the song ends' },
    ],
  },

  // ─── Technical Score ────────────────────────────────────────────────────────

  score_balance: {
    title: 'Balance',
    subtitle: 'Do all elements feel in harmony?',
    whatItIs:
      'Balance is how well all parts of the wine work together: acidity, tannin, alcohol, body, fruit, and oak. Nothing sticks out too much — no single element grabs all the attention.',
    zones: [
      { label: 'Unbalanced',  range: '0–5',  color: '#E57373', description: 'Something is clearly out of place. One element dominates and distracts.' },
      { label: 'Off-balance', range: '6–10', color: '#FFB74D', description: 'Mostly harmonious but something slightly jars or feels excessive.' },
      { label: 'Neutral',     range: '11–14', color: '#FDD835', description: 'Neither notably balanced nor unbalanced. Acceptable.' },
      { label: 'Balanced',    range: '15–17', color: '#AED581', description: 'Smooth and seamless. Parts work well together. Pleasant and easy to enjoy.' },
      { label: 'Perfect',     range: '18–20', color: '#4CAF50', description: 'Exceptional harmony. You don\'t notice individual components — just the whole.' },
    ],
    tip: 'If you notice something, it\'s probably not balanced. Balance is one of the most important qualities of a great wine.',
  },

  score_intensity: {
    title: 'Intensity',
    subtitle: 'How expressive is the wine on the nose and palate?',
    whatItIs:
      'This score is auto-filled from your Structure rating (×2) to convert it to the 20-point scale. Sommelier profiles can adjust it manually.',
    zones: [
      { label: 'Low',    range: '0–6',  color: '#A8C96A', description: 'Subtle, requires effort to detect aromas and flavors.' },
      { label: 'Medium', range: '7–13', color: '#5BA858', description: 'Noticeable and present. Aromas and flavors are clear.' },
      { label: 'High',   range: '14–20', color: '#2E7D32', description: 'Expressive and powerful. Aromas jump out and flavors are intense.' },
    ],
  },

  score_complexity: {
    title: 'Complexity',
    subtitle: 'How many layers and dimensions does the wine have?',
    whatItIs:
      'Complexity is about how many different things you can discover and how they come together. Does it evolve, open up, and stay interesting?',
    zones: [
      { label: 'Simple',    range: '0–7',  color: '#E1BEE7', description: 'One-dimensional. What you smell/taste first is all there is.' },
      { label: 'Moderate',  range: '8–13', color: '#AB47BC', description: 'A few discernible layers. Some evolution in the glass.' },
      { label: 'Complex',   range: '14–17', color: '#7B1FA2', description: 'Multiple clear layers. Evolves and changes. Keeps your attention.' },
      { label: 'Intricate', range: '18–20', color: '#4A148C', description: 'Exceptional depth. Layers upon layers that reveal themselves over time.' },
    ],
    tip: 'Complexity is not about how strong the wine is, but how many different things you can discover and how they come together.',
    note: 'Look for: Fruit layers · Winemaking notes (oak, toast) · Development (mushroom, dried fruit, honey) · Terroir (mineral, stone, earth)',
  },

  score_finish: {
    title: 'Finish Quality',
    subtitle: 'Quality and length of what remains after swallowing',
    whatItIs:
      'Notice how long the wine stays with you after the last sip. Focus on the aftertaste — not the initial taste.',
    zones: [
      { label: 'Short',  range: '1–6',  color: '#C5A8E0', description: 'Flavors fade quickly soon after swallowing.', tag: 'Like a quick echo' },
      { label: 'Medium', range: '7–13', color: '#8E44BC', description: 'Flavors linger for a few seconds but start to fade.', tag: 'Like a brief conversation' },
      { label: 'Long',   range: '14–20', color: '#4A1080', description: 'Flavors stay for many seconds. Persistent and noticeable.', tag: 'Like music after the song ends' },
    ],
  },

  score_typicity: {
    title: 'Typicity / Precision',
    subtitle: 'Does the wine express what it should?',
    whatItIs:
      'Typicity is how well the wine reflects its grape variety, region/terroir, and intended style.',
    focus: 'Ask yourself: Do the aromas match what you expect from this grape? Does it feel true to its origin or style? Is the expression clear and focused?',
    zones: [
      { label: 'Generic',      range: '0–7',  color: '#80CBC4', description: 'Unclear identity. Confusing or mixed expression. Doesn\'t match expectations.' },
      { label: 'Recognizable', range: '8–13', color: '#26A69A', description: 'Somewhat recognizable. You can identify the grape or style with some effort.' },
      { label: 'Clear',        range: '14–17', color: '#00796B', description: 'Clear expression. Focused, undiluted flavors. Feels authentic.' },
      { label: 'Precise',      range: '18–20', color: '#004D40', description: 'Exceptional precision. Textbook example of its grape, style or region. Outstanding.' },
    ],
    tip: 'Great wines don\'t just taste good. They make sense. Balance = how well things fit together. Typicity = how true it is to its identity.',
  },
};
