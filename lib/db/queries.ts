/* Shared read helpers used by the ledger and dashboards. Mutations live in the
   per-page actions.ts files. Server-only (imports the DB client). */

import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from './client';
import { accounts, categories, transactions } from './schema';

export type Scope = 'personal' | 'business';

export function getAccounts(scope?: Scope) {
  const q = db.select().from(accounts).orderBy(asc(accounts.name));
  return scope ? q.where(eq(accounts.scope, scope)) : q;
}

export function getCategories(scope?: Scope) {
  const q = db.select().from(categories).orderBy(asc(categories.name));
  return scope ? q.where(eq(categories.scope, scope)) : q;
}

export type TxnFilters = {
  scope?: Scope;
  accountId?: number;
  categoryId?: number;
  from?: string; // YYYY-MM-DD
  to?: string;
  limit?: number;
};

/** Transactions joined with account + category names, newest first. */
export function getTransactions(f: TxnFilters = {}) {
  const conds = [];
  if (f.scope) conds.push(eq(transactions.scope, f.scope));
  if (f.accountId) conds.push(eq(transactions.accountId, f.accountId));
  if (f.categoryId) conds.push(eq(transactions.categoryId, f.categoryId));
  if (f.from) conds.push(gte(transactions.date, f.from));
  if (f.to) conds.push(lte(transactions.date, f.to));

  return db
    .select({
      id: transactions.id,
      date: transactions.date,
      amount: transactions.amount,
      currency: transactions.currency,
      type: transactions.type,
      description: transactions.description,
      counterparty: transactions.counterparty,
      scope: transactions.scope,
      accountId: transactions.accountId,
      accountName: accounts.name,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(f.limit ?? 500);
}

/** First and last day of a month offset from now (0 = current). */
export function monthRange(offset = 0): { from: string; to: string; label: string } {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const from = d.toISOString().slice(0, 10);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  const to = end.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return { from, to, label };
}
