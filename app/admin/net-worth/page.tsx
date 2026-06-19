import { netWorth, netWorthTrend, accountBalancesNow } from '@/lib/db/analytics';
import { buildBaseConverter } from '@/lib/fx';
import { formatMoney } from '@/lib/money';
import { recordBalance } from '@/app/admin/settings/actions';
import { accounts } from '@/lib/db/schema';
import StatCard from '@/components/admin/StatCard';
import { NetWorthChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';

const LIABILITY_TYPES = ['credit_card', 'loan', 'liability'];

export default async function NetWorthPage() {
  const [nw, trend, balances, conv] = await Promise.all([
    netWorth(),
    netWorthTrend(12),
    accountBalancesNow(),
    buildBaseConverter(),
  ]);

  // Derived current balance per account (opening + transactions, re-anchored by
  // any manual snapshot). Sorted by name for the tables and the form.
  const accts = balances.map((b) => b.account).sort((a, b) => a.name.localeCompare(b.name));
  const latest = new Map<number, number>(balances.map((b) => [b.account.id, b.balance]));

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
        <h2 className="adm-section-title">Reconcile a balance</h2>
        <p className="adm-stat-sub" style={{ marginBottom: 12 }}>
          Balances update automatically from your transactions. Record a snapshot
          to re-anchor an account when it drifts from the real bank balance.
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
