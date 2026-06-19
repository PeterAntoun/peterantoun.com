/* Dashboard aggregations. Volumes for a personal/business tracker are small, so
   we fetch rows and aggregate in JS (clear, currency-aware via the base
   converter) rather than pushing FX math into SQL. Server-only. */

import { and, desc, eq, gte, inArray, lte, ne } from 'drizzle-orm';
import { db } from './client';
import { accounts, accountBalances, categories, transactions } from './schema';
import { buildBaseConverter } from '@/lib/fx';
import { monthRange, type Scope } from './queries';

const LIABILITY_TYPES = new Set(['credit_card', 'loan', 'liability']);

type Acct = typeof accounts.$inferSelect;
type Snapshot = typeof accountBalances.$inferSelect;

/** Load every active account and all of its balance snapshots in two queries
    (snapshots sorted newest-first). Callers then derive any as-of-date balance
    in memory — volumes are small and this avoids an N+1 over the network. */
async function loadBalanceData(): Promise<{ accts: Acct[]; snaps: Snapshot[] }> {
  const accts = await db.select().from(accounts).where(eq(accounts.isActive, true));
  if (accts.length === 0) return { accts, snaps: [] };
  const snaps = await db
    .select()
    .from(accountBalances)
    .where(inArray(accountBalances.accountId, accts.map((a) => a.id)))
    .orderBy(desc(accountBalances.asOfDate));
  return { accts, snaps };
}

/** Latest snapshot balance for an account as of `date` (inclusive), falling back
    to the opening balance. `snaps` must be sorted newest-first. */
function balanceAsOf(a: Acct, snaps: Snapshot[], date?: string): number {
  for (const s of snaps) {
    if (s.accountId !== a.id) continue;
    if (!date || s.asOfDate <= date) return s.balance;
  }
  return a.openingBalance;
}

type Converter = Awaited<ReturnType<typeof buildBaseConverter>>;

function computeNetWorth(accts: Acct[], snaps: Snapshot[], conv: Converter, date?: string) {
  let assets = 0;
  let liabilities = 0;
  for (const a of accts) {
    const v = conv.toBase(balanceAsOf(a, snaps, date), a.currency);
    if (LIABILITY_TYPES.has(a.type)) liabilities += v;
    else assets += v;
  }
  return { assets, liabilities, net: assets - liabilities, base: conv.base, missing: conv.missing };
}

export async function netWorth(date?: string) {
  const [conv, { accts, snaps }] = await Promise.all([buildBaseConverter(), loadBalanceData()]);
  return computeNetWorth(accts, snaps, conv, date);
}

export async function netWorthTrend(months = 12) {
  // Load accounts + snapshots once, then derive each month-end in memory.
  const [conv, { accts, snaps }] = await Promise.all([buildBaseConverter(), loadBalanceData()]);
  const points: { label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const { to, label } = monthRange(-i);
    points.push({ label, value: computeNetWorth(accts, snaps, conv, to).net / 100 });
  }
  return points;
}

/** Sum income/expense (minor, base currency) for a scope over a date range.
    Omit from/to for all-time. Transfers are excluded. */
export async function cashFlow(scope: Scope, from?: string, to?: string) {
  const conv = await buildBaseConverter();
  const conds = [eq(transactions.scope, scope), ne(transactions.type, 'transfer')];
  if (from) conds.push(gte(transactions.date, from));
  if (to) conds.push(lte(transactions.date, to));
  const rows = await db.select().from(transactions).where(and(...conds));
  let income = 0;
  let expense = 0;
  for (const t of rows) {
    const v = conv.toBase(t.amount, t.currency);
    if (v >= 0) income += v;
    else expense += -v;
  }
  return { income, expense, net: income - expense, base: conv.base };
}

export async function spendByCategory(scope: Scope, from?: string, to?: string) {
  const conv = await buildBaseConverter();
  const conds = [eq(transactions.scope, scope), eq(transactions.type, 'expense')];
  if (from) conds.push(gte(transactions.date, from));
  if (to) conds.push(lte(transactions.date, to));
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
    .where(and(...conds));

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

/** Monthly income/expense series for charts (major units, base currency).
    Fetches the whole window in one query and buckets by month in memory. */
export async function monthlySeries(scope: Scope, months = 6) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const { from, to, label } = monthRange(-(months - 1 - i));
    return { from, to, label, income: 0, expense: 0 };
  });

  const conv = await buildBaseConverter();
  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.scope, scope),
        ne(transactions.type, 'transfer'),
        gte(transactions.date, buckets[0].from),
        lte(transactions.date, buckets[buckets.length - 1].to),
      ),
    );

  for (const t of rows) {
    const b = buckets.find((b) => t.date >= b.from && t.date <= b.to);
    if (!b) continue;
    const v = conv.toBase(t.amount, t.currency);
    if (v >= 0) b.income += v;
    else b.expense += -v;
  }

  return buckets.map((b) => ({
    label: b.label,
    income: b.income / 100,
    expense: b.expense / 100,
  }));
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
