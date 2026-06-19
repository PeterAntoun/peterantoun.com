'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { accounts, transactions } from '@/lib/db/schema';
import { majorToMinor } from '@/lib/money';

const txnSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  date: z.string().min(8),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive(),
  categoryId: z.coerce.number().int().positive().optional().or(z.literal(0)),
  description: z.string().max(280).optional(),
  counterparty: z.string().max(140).optional(),
});

export type TxnFormState = { error?: string; ok?: boolean };

async function accountMeta(accountId: number) {
  const [a] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
  return a;
}

export async function createTransaction(
  _prev: TxnFormState,
  formData: FormData,
): Promise<TxnFormState> {
  const parsed = txnSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Check the form fields.' };
  const v = parsed.data;

  const acct = await accountMeta(v.accountId);
  if (!acct) return { error: 'Unknown account.' };

  // expense stored negative; income/transfer-in positive
  const minor = majorToMinor(v.amount, acct.currency);
  const signed = v.type === 'expense' ? -Math.abs(minor) : Math.abs(minor);

  await db.insert(transactions).values({
    accountId: v.accountId,
    date: v.date,
    amount: signed,
    currency: acct.currency,
    type: v.type,
    categoryId: v.categoryId && v.categoryId > 0 ? v.categoryId : null,
    description: v.description || null,
    counterparty: v.counterparty || null,
    scope: acct.scope,
  });

  revalidatePath('/admin/transactions');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (id) {
    await db.delete(transactions).where(eq(transactions.id, id));
    revalidatePath('/admin/transactions');
    revalidatePath('/admin');
  }
}

/* ---- CSV import ------------------------------------------- */
const importRow = z.object({
  date: z.string().min(8),
  amount: z.number(), // signed major units (negative = expense)
  description: z.string().optional(),
});

export type ImportState = { error?: string; imported?: number };

export async function importTransactions(
  accountId: number,
  rows: { date: string; amount: number; description?: string }[],
): Promise<ImportState> {
  const acct = await accountMeta(accountId);
  if (!acct) return { error: 'Unknown account.' };

  const valid: z.infer<typeof importRow>[] = [];
  for (const r of rows) {
    const p = importRow.safeParse(r);
    if (p.success) valid.push(p.data);
  }

  if (valid.length === 0) return { error: 'No valid rows found in the file.' };

  const values = valid.map((r) => {
    const minor = majorToMinor(Math.abs(r.amount), acct.currency);
    const isExpense = r.amount < 0;
    return {
      accountId,
      date: r.date,
      amount: isExpense ? -minor : minor,
      currency: acct.currency,
      type: (isExpense ? 'expense' : 'income') as 'expense' | 'income',
      description: r.description || null,
      scope: acct.scope,
    };
  });

  await db.insert(transactions).values(values);
  revalidatePath('/admin/transactions');
  revalidatePath('/admin');
  return { imported: values.length };
}
