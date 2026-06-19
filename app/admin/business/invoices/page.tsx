import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { clients, invoices } from '@/lib/db/schema';
import { buildBaseConverter } from '@/lib/fx';
import { formatMoney } from '@/lib/money';
import StatCard from '@/components/admin/StatCard';
import InvoiceForm from './InvoiceForm';
import { createClient, deleteClient, markInvoicePaid, deleteInvoice } from './actions';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const [clientRows, invoiceRows, conv] = await Promise.all([
    db.select().from(clients).orderBy(asc(clients.name)),
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        clientName: clients.name,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        status: invoices.status,
        currency: invoices.currency,
        total: invoices.total,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.issueDate)),
    buildBaseConverter(),
  ]);

  // receivables aging on unpaid invoices
  const today = new Date().toISOString().slice(0, 10);
  const aging = { current: 0, d30: 0, d60: 0, d60plus: 0, total: 0 };
  for (const inv of invoiceRows) {
    if (inv.status === 'paid' || inv.status === 'draft') continue;
    const base = conv.toBase(inv.total, inv.currency);
    aging.total += base;
    const days = daysBetween(inv.dueDate, today);
    if (days <= 0) aging.current += base;
    else if (days <= 30) aging.d30 += base;
    else if (days <= 60) aging.d60 += base;
    else aging.d60plus += base;
  }

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Invoices & clients</h1>
          <p className="adm-page-sub">Receivables in {conv.base}.</p>
        </div>
      </header>

      <section className="adm-stat-grid">
        <StatCard label="Outstanding" value={formatMoney(aging.total, conv.base)} />
        <StatCard label="Not yet due" value={formatMoney(aging.current, conv.base)} />
        <StatCard label="1–30 days late" value={formatMoney(aging.d30, conv.base)} tone={aging.d30 ? 'neg' : undefined} />
        <StatCard label="60+ days late" value={formatMoney(aging.d60 + aging.d60plus, conv.base)} tone={aging.d60 + aging.d60plus ? 'neg' : undefined} />
      </section>

      <section className="adm-section adm-grid-2">
        <div className="adm-card">
          <h2 className="adm-section-title">New invoice</h2>
          <InvoiceForm clients={clientRows} />
        </div>
        <div className="adm-card">
          <h2 className="adm-section-title">New client</h2>
          <form action={createClient} className="auth-form" style={{ gap: 12 }}>
            <label className="adm-field">
              Name
              <input className="adm-input" name="name" required />
            </label>
            <label className="adm-field">
              Email
              <input className="adm-input" type="email" name="email" />
            </label>
            <label className="adm-field">
              Currency
              <select className="adm-select" name="currency" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label className="adm-field">
              Notes
              <input className="adm-input" name="notes" />
            </label>
            <button className="adm-btn" type="submit">Add client</button>
          </form>

          {clientRows.length > 0 && (
            <div className="adm-table-wrap" style={{ marginTop: 16 }}>
              <table className="adm-table">
                <tbody>
                  {clientRows.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.currency}</td>
                      <td className="adm-num">
                        <form action={deleteClient}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="adm-logout" style={{ padding: '4px 8px' }}>Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="adm-section">
        <h2 className="adm-section-title">All invoices</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
                <th className="adm-num">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoiceRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="adm-empty">No invoices yet.</td>
                </tr>
              ) : (
                invoiceRows.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.number}</td>
                    <td>{inv.clientName ?? '—'}</td>
                    <td>{inv.issueDate}</td>
                    <td>{inv.dueDate}</td>
                    <td>
                      <span className={`adm-badge ${inv.status}`}>{inv.status}</span>
                    </td>
                    <td className="adm-num">{formatMoney(inv.total, inv.currency)}</td>
                    <td className="adm-num">
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {inv.status !== 'paid' && (
                          <form action={markInvoicePaid}>
                            <input type="hidden" name="id" value={inv.id} />
                            <button className="adm-logout" style={{ padding: '4px 8px' }}>Mark paid</button>
                          </form>
                        )}
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={inv.id} />
                          <button className="adm-logout" style={{ padding: '4px 8px' }}>Delete</button>
                        </form>
                      </div>
                    </td>
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

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}
