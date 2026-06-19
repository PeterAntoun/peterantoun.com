'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import {
  accounts,
  accountBalances,
  categories,
  fxRates,
  settings,
} from '@/lib/db/schema';
import { majorToMinor } from '@/lib/money';

function revalidateAll() {
  for (const p of [
    '/admin',
    '/admin/settings',
    '/admin/net-worth',
    '/admin/cash-flow',
    '/admin/transactions',
  ]) {
    revalidatePath(p);
  }
}

/* ---- accounts --------------------------------------------- */
const accountSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum([
    'checking',
    'savings',
    'cash',
    'investment',
    'credit_card',
    'loan',
    'asset',
    'liability',
  ]),
  scope: z.enum(['personal', 'business']),
  currency: z.enum(['USD', 'EUR']),
  openingBalance: z.coerce.number().default(0),
});

export async function createAccount(formData: FormData): Promise<void> {
  const p = accountSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  const v = p.data;
  await db.insert(accounts).values({
    name: v.name,
    type: v.type,
    scope: v.scope,
    currency: v.currency,
    openingBalance: majorToMinor(v.openingBalance, v.currency),
  });
  revalidateAll();
}

export async function deleteAccount(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (id) {
    await db.delete(accounts).where(eq(accounts.id, id));
    revalidateAll();
  }
}

/** Record a balance snapshot for the net-worth trend. */
export async function recordBalance(formData: FormData): Promise<void> {
  const accountId = Number(formData.get('accountId'));
  const asOfDate = String(formData.get('asOfDate') ?? '');
  const balance = parseFloat(String(formData.get('balance') ?? ''));
  if (!accountId || !asOfDate || !Number.isFinite(balance)) return;

  const [a] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
  if (!a) return;

  await db
    .insert(accountBalances)
    .values({ accountId, asOfDate, balance: majorToMinor(balance, a.currency) })
    .onConflictDoUpdate({
      target: [accountBalances.accountId, accountBalances.asOfDate],
      set: { balance: majorToMinor(balance, a.currency) },
    });
  revalidateAll();
}

/* ---- categories ------------------------------------------- */
const categorySchema = z.object({
  name: z.string().min(1).max(60),
  kind: z.enum(['income', 'expense']),
  scope: z.enum(['personal', 'business']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#1f9d57'),
});

export async function createCategory(formData: FormData): Promise<void> {
  const p = categorySchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  await db.insert(categories).values(p.data);
  revalidateAll();
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (id) {
    await db.delete(categories).where(eq(categories.id, id));
    revalidateAll();
  }
}

/* ---- base currency + FX override -------------------------- */
export async function setBaseCurrency(formData: FormData): Promise<void> {
  const base = String(formData.get('baseCurrency') ?? 'USD');
  if (!['USD', 'EUR'].includes(base)) return;
  await db
    .insert(settings)
    .values({ id: 1, baseCurrency: base })
    .onConflictDoUpdate({ target: settings.id, set: { baseCurrency: base } });
  revalidateAll();
}

export async function setManualRate(formData: FormData): Promise<void> {
  const base = String(formData.get('base') ?? '');
  const quote = String(formData.get('quote') ?? '');
  const rate = parseFloat(String(formData.get('rate') ?? ''));
  const date = String(formData.get('date') ?? '');
  if (!base || !quote || !date || !Number.isFinite(rate) || rate <= 0) return;

  await db
    .insert(fxRates)
    .values({ date, base, quote, rate: String(rate), source: 'manual' })
    .onConflictDoUpdate({
      target: [fxRates.date, fxRates.base, fxRates.quote],
      set: { rate: String(rate), source: 'manual' },
    });
  // store inverse too for convenience
  await db
    .insert(fxRates)
    .values({ date, base: quote, quote: base, rate: String(1 / rate), source: 'manual' })
    .onConflictDoUpdate({
      target: [fxRates.date, fxRates.base, fxRates.quote],
      set: { rate: String(1 / rate), source: 'manual' },
    });
  revalidateAll();
}
