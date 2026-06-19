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
type BalTxn = { accountId: number; date: string; amount: number };

/** Load active accounts, all balance snapshots (newest-first), and every
    transaction (account/date/amount) in three queries. Callers then derive any
    as-of-date balance in memory — volumes are small and this avoids N+1s. */
async function loadBalanceData(): Promise<{ accts: Acct[]; snaps: Snapshot[]; txns: BalTxn[] }> {
  const accts = await db.select().from(accounts).where(eq(accounts.isActive, true));
  if (accts.length === 0) return { accts, snaps: [], txns: [] };
  const ids = accts.map((a) => a.id);
  const [snaps, txns] = await Promise.all([
    db
      .select()
      .from(accountBalances)
      .where(inArray(accountBalances.accountId, ids))
      .orderBy(desc(accountBalances.asOfDate)),
    db
      .select({
        accountId: transactions.accountId,
        date: transactions.date,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(inArray(transactions.accountId, ids)),
  ]);
  return { accts, snaps, txns };
}

/** Derived balance for an account as of `date` (default: now).

    A manual snapshot is treated as a reconcile *anchor*: we take the latest
    snapshot on/before `date`, then add every transaction posted after it (up to
    `date`). With no snapshot we start from the opening balance and add all
    transactions to date. So balances move automatically as transactions land,
    while a snapshot lets you re-anchor when the real bank balance drifts.

    Assumes a transaction's amount is in its account's currency (true for bank
    imports); conversion to the base currency happens in computeNetWorth. */
function balanceAsOf(a: Acct, snaps: Snapshot[], txns: BalTxn[], date?: string): number {
  let base = a.openingBalance;
  let since: string | null = null; // exclusive: txns on/before this are in `base`
  for (const s of snaps) {
    if (s.accountId !== a.id) continue;
    if (!date || s.asOfDate <= date) {
      base = s.balance;
      since = s.asOfDate;
      break;
    }
  }
  let sum = 0;
  for (const t of txns) {
    if (t.accountId !== a.id) continue;
    if (date && t.date > date) continue;
    if (since && t.date <= since) continue;
    sum += t.amount;
  }
  return base + sum;
}

type Converter = Awaited<ReturnType<typeof buildBaseConverter>>;

function computeNetWorth(
  accts: Acct[],
  snaps: Snapshot[],
  txns: BalTxn[],
  conv: Converter,
  date?: string,
) {
  let assets = 0;
  let liabilities = 0;
  for (const a of accts) {
    const v = conv.toBase(balanceAsOf(a, snaps, txns, date), a.currency);
    if (LIABILITY_TYPES.has(a.type)) liabilities += v;
    else assets += v;
  }
  return { assets, liabilities, net: assets - liabilities, base: conv.base, missing: conv.missing };
}

export async function netWorth(date?: string) {
  const [conv, data] = await Promise.all([buildBaseConverter(), loadBalanceData()]);
  return computeNetWorth(data.accts, data.snaps, data.txns, conv, date);
}

export async function netWorthTrend(months = 12) {
  // Load everything once, then derive each month-end balance in memory.
  const [conv, data] = await Promise.all([buildBaseConverter(), loadBalanceData()]);
  const points: { label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const { to, label } = monthRange(-i);
    points.push({
      label,
      value: computeNetWorth(data.accts, data.snaps, data.txns, conv, to).net / 100,
    });
  }
  return points;
}

/** Current derived balance per active account (account's own currency), plus
    the matching net-worth roll-up. Used by the Net worth page. */
export async function accountBalancesNow() {
  const data = await loadBalanceData();
  const rows = data.accts.map((account) => ({
    account,
    balance: balanceAsOf(account, data.snaps, data.txns),
  }));
  return rows;
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
