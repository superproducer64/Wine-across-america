export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export function getCurrencySymbol(code: string | undefined | null): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol ?? (code ? `${code} ` : '$');
}
