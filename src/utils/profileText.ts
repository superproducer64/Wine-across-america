import { WineEntry, AROMA_CATEGORIES } from '@/types';

const BODY_DESCRIPTORS = ['light', 'light-medium', 'medium', 'medium-full', 'full'];
const ACIDITY_DESCRIPTORS = ['low', 'low-medium', 'medium', 'medium-high', 'high', 'electric'];
const TANNIN_DESCRIPTORS = ['silky', 'soft', 'medium', 'firm', 'grippy'];

function pick<T>(arr: T[], index: number): T {
  return arr[Math.min(Math.floor(index), arr.length - 1)];
}

export function generateProfileText(entry: Partial<WineEntry>): string {
  const { aromas_l1 = [], grapes = [], region, body = 5, acidity = 5, tannin = 5 } = entry;

  const topAromas = aromas_l1
    .slice(0, 3)
    .map((id) => AROMA_CATEGORIES.find((c) => c.id === id)?.label.toLowerCase())
    .filter(Boolean);

  const grape = grapes[0] ?? 'this wine';
  const regionText = region ? ` from ${region}` : '';
  const bodyDesc = pick(BODY_DESCRIPTORS, (body - 1) * 0.55);
  const acidDesc = pick(ACIDITY_DESCRIPTORS, (acidity - 1) * 0.6);
  const tanninDesc = pick(TANNIN_DESCRIPTORS, (tannin - 1) * 0.55);

  const aromaText =
    topAromas.length > 0
      ? `showing ${topAromas.join(', ')} character`
      : 'with a distinctive aroma profile';

  const sentences: string[] = [
    `${grape}${regionText} ${aromaText}.`,
    `The palate is ${bodyDesc}-bodied with ${acidDesc} acidity`,
  ];

  if (tannin > 2) {
    sentences[1] += ` and ${tanninDesc} tannins.`;
  } else {
    sentences[1] += '.';
  }

  return sentences.join(' ');
}
