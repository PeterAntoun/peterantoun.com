/* Money helpers. Amounts live as integer MINOR units (cents) + a currency
   code. This module is pure (no DB) so it's safe in client components too. */

export const SUPPORTED_CURRENCIES = ['USD', 'EUR'] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

// Both USD and EUR use 2 decimal places; centralise so adding JPY etc. is easy.
const DECIMALS: Record<string, number> = { USD: 2, EUR: 2 };

export function decimalsFor(currency: string): number {
  return DECIMALS[currency] ?? 2;
}

/** "1234.56" or 1234.56 (major units) -> 123456 (minor units). */
export function majorToMinor(major: number | string, currency: string): number {
  const factor = 10 ** decimalsFor(currency);
  const n = typeof major === 'string' ? parseFloat(major) : major;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * factor);
}

/** 123456 (minor units) -> 1234.56 (major units). */
export function minorToMajor(minor: number, currency: string): number {
  return minor / 10 ** decimalsFor(currency);
}

/** Format minor units as a localized currency string, e.g. "$1,234.56". */
export function formatMoney(
  minor: number,
  currency: string,
  opts: { compact?: boolean; signed?: boolean } = {},
): string {
  const value = minorToMajor(minor, currency);
  const nf = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: opts.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts.compact ? 1 : decimalsFor(currency),
  });
  const s = nf.format(Math.abs(value));
  if (value < 0) return `-${s}`;
  if (opts.signed && value > 0) return `+${s}`;
  return s;
}

/** Convert minor units from one currency to another using a from->to rate. */
export function convertMinor(
  minor: number,
  from: string,
  to: string,
  rate: number,
): number {
  if (from === to) return minor;
  const major = minorToMajor(minor, from) * rate;
  return majorToMinor(major, to);
}
