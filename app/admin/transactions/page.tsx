import { getAccounts, getCategories, getTransactions, type Scope } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import { deleteTransaction } from './actions';
import AddTransactionForm from './AddTransactionForm';
import CsvImporter from './CsvImporter';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { scope?: string; accountId?: string };
}) {
  const scope = (searchParams.scope as Scope) || undefined;
  const accountId = searchParams.accountId ? Number(searchParams.accountId) : undefined;

  const [accts, cats, txns] = await Promise.all([
    getAccounts(),
    getCategories(),
    getTransactions({ scope, accountId, limit: 500 }),
  ]);

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Transactions</h1>
          <p className="adm-page-sub">Unified ledger across personal & business.</p>
        </div>
      </header>

      {accts.length === 0 ? (
        <div className="adm-card">
          <p className="adm-stat-sub">
            Add an account first in <strong>Settings → Accounts</strong> to start
            recording transactions.
          </p>
        </div>
      ) : (
        <>
          <section className="adm-section adm-grid-2">
            <div className="adm-card">
              <h2 className="adm-section-title">Add transaction</h2>
              <AddTransactionForm accounts={accts} categories={cats} />
            </div>
            <div className="adm-card">
              <h2 className="adm-section-title">Import CSV</h2>
              <CsvImporter accounts={accts} />
            </div>
          </section>

          {/* scope filter */}
          <nav className="adm-section" style={{ display: 'flex', gap: 8 }}>
            <a className={`adm-btn ghost${!scope ? ' is-active' : ''}`} href="/admin/transactions">
              All
            </a>
            <a className="adm-btn ghost" href="/admin/transactions?scope=personal">
              Personal
            </a>
            <a className="adm-btn ghost" href="/admin/transactions?scope=business">
              Business
            </a>
          </nav>

          <section className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th>Scope</th>
                  <th className="adm-num">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {txns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="adm-empty">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description || t.counterparty || '—'}</td>
                      <td>{t.accountName ?? '—'}</td>
                      <td>{t.categoryName ?? '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{t.scope}</td>
                      <td className={`adm-num ${t.amount < 0 ? 'adm-neg' : 'adm-pos'}`}>
                        {formatMoney(t.amount, t.currency, { signed: true })}
                      </td>
                      <td className="adm-num">
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="adm-logout" style={{ padding: '4px 8px' }}>
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </>
  );
}
