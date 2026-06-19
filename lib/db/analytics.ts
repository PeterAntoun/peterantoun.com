/* Dashboard aggregations. Volumes for a personal/business tracker are small, so
   we fetch rows and aggregate in JS (clear, currency-aware via the base
   converter) rather than pushing FX math into SQL. Server-only. */

import { and, desc, eq, gte, lte, ne } from 'drizzle-orm';
import { db } from './client';
import { accounts, accountBalances, categories, transactions } from './schema';
import { buildBaseConverter } from '@/lib/fx';
import { monthRange, type Scope } from './queries';

const LIABILITY_TYPES = new Set(['credit_card', 'loan', 'liability']);

/** Latest known balance per account as of `date` (inclusive); falls back to the
    account opening balance when no snapshot exists. Returns minor units in the
    account's own currency, tagged with currency + whether it's a liability. */
async function balancesAsOf(date?: string) {
  const accts = await db.select().from(accounts).where(eq(accounts.isActive, true));
  const out: { balance: number; currency: string; liability: boolean }[] = [];

  for (const a of accts) {
    const snaps = await db
      .select()
      .from(accountBalances)
      .where(
        date
          ? and(eq(accountBalances.accountId, a.id), lte(accountBalances.asOfDate, date))
          : eq(accountBalances.accountId, a.id),
      )
      .orderBy(desc(accountBalances.asOfDate))
      .limit(1);
    const balance = snaps[0]?.balance ?? a.openingBalance;
    out.push({ balance, currency: a.currency, liability: LIABILITY_TYPES.has(a.type) });
  }
  return out;
}

export async function netWorth(date?: string) {
  const conv = await buildBaseConverter();
  const rows = await balancesAsOf(date);
  let assets = 0;
  let liabilities = 0;
  for (const r of rows) {
    const v = conv.toBase(r.balance, r.currency);
    if (r.liability) liabilities += v;
    else assets += v;
  }
  return { assets, liabilities, net: assets - liabilities, base: conv.base, missing: conv.missing };
}

export async function netWorthTrend(months = 12) {
  const points: { label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const { to, label } = monthRange(-i);
    const nw = await netWorth(to);
    points.push({ label, value: nw.net / 100 });
  }
  return points;
}

/** Sum income/expense (minor, base currency) for a scope over a date range.
    Transfers are excluded. */
export async function cashFlow(scope: Scope, from: string, to: string) {
  const conv = await buildBaseConverter();
  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.scope, scope),
        ne(transactions.type, 'transfer'),
        gte(transactions.date, from),
        lte(transactions.date, to),
      ),
    );
  let income = 0;
  let expense = 0;
  for (const t of rows) {
    const v = conv.toBase(t.amount, t.currency);
    if (v >= 0) income += v;
    else expense += -v;
  }
  return { income, expense, net: income - expense, base: conv.base };
}

export async function spendByCategory(scope: Scope, from: string, to: string) {
  const conv = await buildBaseConverter();
  const rows = await db
    .select({
      amount: transactions.amount,
      currency: transactions.currency,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      color: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.scope, scope),
        eq(transactions.type, 'expense'),
        gte(transactions.date, from),
        lte(transactions.date, to),
      ),
    );

  const map = new Map<string, { name: string; value: number; color: string }>();
  for (const r of rows) {
    const key = r.categoryName ?? 'Uncategorized';
    const v = Math.abs(conv.toBase(r.amount, r.currency)) / 100;
    const cur = map.get(key) ?? { name: key, value: 0, color: r.color ?? '#6b6860' };
    cur.value += v;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

/** Monthly income/expense series for charts (major units, base currency). */
export async function monthlySeries(scope: Scope, months = 6) {
  const out: { label: string; income: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const { from, to, label } = monthRange(-i);
    const cf = await cashFlow(scope, from, to);
    out.push({ label, income: cf.income / 100, expense: cf.expense / 100 });
  }
  return out;
}

/** Business P&L per month (major units, base currency). */
export async function pnlSeries(months = 6) {
  const series = await monthlySeries('business', months);
  return series.map((m) => ({
    label: m.label,
    revenue: m.income,
    expenses: m.expense,
    profit: m.income - m.expense,
  }));
}
