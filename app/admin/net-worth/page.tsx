import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { accounts, accountBalances } from '@/lib/db/schema';
import { netWorth, netWorthTrend } from '@/lib/db/analytics';
import { buildBaseConverter } from '@/lib/fx';
import { formatMoney } from '@/lib/money';
import { recordBalance } from '@/app/admin/settings/actions';
import StatCard from '@/components/admin/StatCard';
import { NetWorthChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';

const LIABILITY_TYPES = ['credit_card', 'loan', 'liability'];

export default async function NetWorthPage() {
  const [nw, trend, accts, conv] = await Promise.all([
    netWorth(),
    netWorthTrend(12),
    db.select().from(accounts).where(eq(accounts.isActive, true)).orderBy(asc(accounts.name)),
    buildBaseConverter(),
  ]);

  // latest snapshot per account for display — one query, newest-first, then
  // pick the first row seen per account in memory.
  const snaps = accts.length
    ? await db
        .select()
        .from(accountBalances)
        .where(inArray(accountBalances.accountId, accts.map((a) => a.id)))
        .orderBy(desc(accountBalances.asOfDate))
    : [];
  const latest = new Map<number, number>();
  for (const a of accts) {
    const snap = snaps.find((s) => s.accountId === a.id);
    latest.set(a.id, snap?.balance ?? a.openingBalance);
  }

  const today = new Date().toISOString().slice(0, 10);
  const assetsAccts = accts.filter((a) => !LIABILITY_TYPES.includes(a.type));
  const liabAccts = accts.filter((a) => LIABILITY_TYPES.includes(a.type));

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Net worth</h1>
          <p className="adm-page-sub">Assets minus liabilities · {conv.base}.</p>
        </div>
      </header>

      <section className="adm-stat-grid">
        <StatCard label="Net worth" value={formatMoney(nw.net, conv.base)} tone={nw.net >= 0 ? 'pos' : 'neg'} />
        <StatCard label="Assets" value={formatMoney(nw.assets, conv.base)} tone="pos" />
        <StatCard label="Liabilities" value={formatMoney(nw.liabilities, conv.base)} tone="neg" />
      </section>

      <section className="adm-section adm-card">
        <h2 className="adm-section-title">Net worth · last 12 months</h2>
        <NetWorthChart data={trend} currency={conv.base} />
      </section>

      <section className="adm-section adm-grid-2">
        <AccountTable title="Assets" accts={assetsAccts} latest={latest} />
        <AccountTable title="Liabilities" accts={liabAccts} latest={latest} />
      </section>

      <section className="adm-section adm-card">
        <h2 className="adm-section-title">Record a balance</h2>
        <p className="adm-stat-sub" style={{ marginBottom: 12 }}>
          Snapshot an account balance to build the trend (e.g. monthly).
        </p>
        <form action={recordBalance} className="adm-form-row">
          <label className="adm-field">
            Account
            <select className="adm-select" name="accountId" required>
              {accts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            As of date
            <input className="adm-input" type="date" name="asOfDate" defaultValue={today} required />
          </label>
          <label className="adm-field">
            Balance
            <input className="adm-input" type="number" step="0.01" name="balance" required />
          </label>
          <button className="adm-btn" type="submit">Save snapshot</button>
        </form>
      </section>
    </>
  );
}

function AccountTable({
  title,
  accts,
  latest,
}: {
  title: string;
  accts: typeof accounts.$inferSelect[];
  latest: Map<number, number>;
}) {
  return (
    <div>
      <h2 className="adm-section-title">{title}</h2>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th className="adm-num">Balance</th>
            </tr>
          </thead>
          <tbody>
            {accts.length === 0 ? (
              <tr>
                <td colSpan={3} className="adm-empty">None.</td>
              </tr>
            ) : (
              accts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</td>
                  <td className="adm-num">{formatMoney(latest.get(a.id) ?? 0, a.currency)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
