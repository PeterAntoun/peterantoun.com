/* FX rates: read cached rates from the DB, convert amounts to the base
   currency, and (for the cron) fetch the latest USD/EUR rate from the ECB via
   frankfurter.app. Manual overrides in Settings are stored with source='manual'
   and win for their date because we read the most recent row. */

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { fxRates, settings } from '@/lib/db/schema';
import { convertMinor, SUPPORTED_CURRENCIES } from '@/lib/money';

export async function getBaseCurrency(): Promise<string> {
  const [row] = await db.select().from(settings).limit(1);
  return row?.baseCurrency ?? process.env.BASE_CURRENCY ?? 'USD';
}

/** Most recent known rate to convert `from` -> `to` (1 if same; inverts a
    stored opposite-direction rate when needed). Returns null if unknown. */
export async function getRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;

  const [direct] = await db
    .select()
    .from(fxRates)
    .where(and(eq(fxRates.base, from), eq(fxRates.quote, to)))
    .orderBy(desc(fxRates.date))
    .limit(1);
  if (direct) return parseFloat(direct.rate);

  const [inverse] = await db
    .select()
    .from(fxRates)
    .where(and(eq(fxRates.base, to), eq(fxRates.quote, from)))
    .orderBy(desc(fxRates.date))
    .limit(1);
  if (inverse) {
    const r = parseFloat(inverse.rate);
    return r ? 1 / r : null;
  }
  return null;
}

/** Build a converter to the base currency over all supported currencies.
    Pre-loads rates once so callers can convert many transactions cheaply. */
export async function buildBaseConverter(): Promise<{
  base: string;
  toBase: (minor: number, currency: string) => number;
  missing: string[];
}> {
  const base = await getBaseCurrency();
  const rates: Record<string, number> = { [base]: 1 };
  const missing: string[] = [];

  for (const cur of SUPPORTED_CURRENCIES) {
    if (cur === base) continue;
    const r = await getRate(cur, base);
    if (r == null) missing.push(cur);
    else rates[cur] = r;
  }

  return {
    base,
    missing,
    toBase: (minor: number, currency: string) => {
      const rate = rates[currency];
      if (rate == null) return minor; // unknown rate: pass through uncon­verted
      return convertMinor(minor, currency, base, rate);
    },
  };
}

/* ---- cron: fetch latest USD/EUR from frankfurter.app ------ */
export async function fetchAndStoreLatest(): Promise<
  { date: string; pairs: number } | { error: string }
> {
  try {
    // frankfurter returns ECB reference rates; one call gives USD->EUR.
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR', {
      cache: 'no-store',
    });
    if (!res.ok) return { error: `frankfurter HTTP ${res.status}` };
    const data = (await res.json()) as {
      date: string;
      rates: Record<string, number>;
    };
    const date = data.date;
    const usdEur = data.rates.EUR;
    if (!usdEur) return { error: 'no EUR rate in response' };

    // Store both directions so getRate finds either without inverting.
    const rows = [
      { date, base: 'USD', quote: 'EUR', rate: String(usdEur), source: 'auto' as const },
      {
        date,
        base: 'EUR',
        quote: 'USD',
        rate: String(1 / usdEur),
        source: 'auto' as const,
      },
    ];

    for (const row of rows) {
      await db
        .insert(fxRates)
        .values(row)
        .onConflictDoUpdate({
          target: [fxRates.date, fxRates.base, fxRates.quote],
          // don't clobber a manual override for the same date
          set: { rate: row.rate },
          setWhere: eq(fxRates.source, 'auto'),
        });
    }
    return { date, pairs: rows.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'fetch failed' };
  }
}
