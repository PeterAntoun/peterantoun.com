import { asc, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { accounts, categories, fxRates } from '@/lib/db/schema';
import { getBaseCurrency } from '@/lib/fx';
import { formatMoney } from '@/lib/money';
import {
  createAccount,
  deleteAccount,
  createCategory,
  deleteCategory,
  setBaseCurrency,
  setManualRate,
} from './actions';

export const dynamic = 'force-dynamic';

const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'cash',
  'investment',
  'credit_card',
  'loan',
  'asset',
  'liability',
];

export default async function SettingsPage() {
  const [accts, cats, rates, base] = await Promise.all([
    db.select().from(accounts).orderBy(asc(accounts.scope), asc(accounts.name)),
    db.select().from(categories).orderBy(asc(categories.scope), asc(categories.name)),
    db.select().from(fxRates).orderBy(desc(fxRates.date)).limit(10),
    getBaseCurrency(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-sub">Accounts, categories, currency & exchange rates.</p>
        </div>
      </header>

      {/* base currency */}
      <section className="adm-section adm-card">
        <h2 className="adm-section-title">Base currency</h2>
        <form action={setBaseCurrency} className="adm-form-row">
          <label className="adm-field">
            All totals convert to
            <select className="adm-select" name="baseCurrency" defaultValue={base}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <button className="adm-btn" type="submit">
            Save
          </button>
        </form>
      </section>

      {/* accounts */}
      <section className="adm-section">
        <h2 className="adm-section-title">Accounts</h2>
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <form action={createAccount} className="adm-form-row">
            <label className="adm-field">
              Name
              <input className="adm-input" name="name" required placeholder="e.g. Revolut EUR" />
            </label>
            <label className="adm-field">
              Type
              <select className="adm-select" name="type" defaultValue="checking">
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              Scope
              <select className="adm-select" name="scope" defaultValue="personal">
                <option value="personal">personal</option>
                <option value="business">business</option>
              </select>
            </label>
            <label className="adm-field">
              Currency
              <select className="adm-select" name="currency" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label className="adm-field">
              Opening balance
              <input className="adm-input" name="openingBalance" type="number" step="0.01" defaultValue="0" />
            </label>
            <button className="adm-btn" type="submit">
              Add account
            </button>
          </form>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Scope</th>
                <th>Currency</th>
                <th className="adm-num">Opening</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {accts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="adm-empty">
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                accts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.scope}</td>
                    <td>{a.currency}</td>
                    <td className="adm-num">{formatMoney(a.openingBalance, a.currency)}</td>
                    <td className="adm-num">
                      <form action={deleteAccount}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="adm-logout" style={{ padding: '4px 8px' }}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* categories */}
      <section className="adm-section">
        <h2 className="adm-section-title">Categories</h2>
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <form action={createCategory} className="adm-form-row">
            <label className="adm-field">
              Name
              <input className="adm-input" name="name" required />
            </label>
            <label className="adm-field">
              Kind
              <select className="adm-select" name="kind" defaultValue="expense">
                <option value="expense">expense</option>
                <option value="income">income</option>
              </select>
            </label>
            <label className="adm-field">
              Scope
              <select className="adm-select" name="scope" defaultValue="personal">
                <option value="personal">personal</option>
                <option value="business">business</option>
              </select>
            </label>
            <label className="adm-field">
              Color
              <input className="adm-input" name="color" type="color" defaultValue="#1f9d57" />
            </label>
            <button className="adm-btn" type="submit">
              Add
            </button>
          </form>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kind</th>
                <th>Scope</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: c.color,
                        marginRight: 8,
                      }}
                    />
                    {c.name}
                  </td>
                  <td>{c.kind}</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.scope}</td>
                  <td className="adm-num">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="adm-logout" style={{ padding: '4px 8px' }}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* fx rates */}
      <section className="adm-section">
        <h2 className="adm-section-title">Exchange rates</h2>
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <p className="adm-stat-sub" style={{ marginBottom: 12 }}>
            Auto-fetched daily from the ECB. Set a manual override below (also stores the inverse).
          </p>
          <form action={setManualRate} className="adm-form-row">
            <label className="adm-field">
              From
              <select className="adm-select" name="base" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label className="adm-field">
              To
              <select className="adm-select" name="quote" defaultValue="EUR">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label className="adm-field">
              Rate
              <input className="adm-input" name="rate" type="number" step="0.0001" required />
            </label>
            <label className="adm-field">
              Date
              <input className="adm-input" name="date" type="date" defaultValue={today} required />
            </label>
            <button className="adm-btn" type="submit">
              Override
            </button>
          </form>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pair</th>
                <th className="adm-num">Rate</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="adm-empty">
                    No rates yet — run the FX cron or add a manual override.
                  </td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>
                      {r.base}→{r.quote}
                    </td>
                    <td className="adm-num">{parseFloat(r.rate).toFixed(4)}</td>
                    <td>{r.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
