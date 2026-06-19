import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invoices } from '@/lib/db/schema';
import { netWorth, cashFlow } from '@/lib/db/analytics';
import { buildBaseConverter } from '@/lib/fx';
import { monthRange } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const { from, to, label } = monthRange(0);
  const [nw, personalCf, businessCf, conv, openInvoices] = await Promise.all([
    netWorth(),
    cashFlow('personal', from, to),
    cashFlow('business', from, to),
    buildBaseConverter(),
    db
      .select()
      .from(invoices)
      .where(and(ne(invoices.status, 'paid'), ne(invoices.status, 'draft'))),
  ]);

  const base = conv.base;
  const receivable = openInvoices.reduce(
    (sum, inv) => sum + conv.toBase(inv.total, inv.currency),
    0,
  );

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Overview</h1>
          <p className="adm-page-sub">
            Snapshot for {label} · all totals in {base}.
          </p>
        </div>
      </header>

      {nw.missing.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 16, borderColor: '#cf6a4a' }}>
          <p className="adm-stat-sub">
            No exchange rate for {nw.missing.join(', ')} yet — those balances show
            unconverted. Run the FX cron or add a manual rate in Settings.
          </p>
        </div>
      )}

      <section className="adm-stat-grid">
        <StatCard
          label="Net worth"
          value={formatMoney(nw.net, base)}
          sub={`${formatMoney(nw.assets, base)} assets · ${formatMoney(nw.liabilities, base)} debts`}
          tone={nw.net >= 0 ? 'pos' : 'neg'}
        />
        <StatCard
          label={`Personal · ${label}`}
          value={formatMoney(personalCf.net, base, { signed: true })}
          sub={`${formatMoney(personalCf.income, base)} in · ${formatMoney(personalCf.expense, base)} out`}
          tone={personalCf.net >= 0 ? 'pos' : 'neg'}
        />
        <StatCard
          label={`Business profit · ${label}`}
          value={formatMoney(businessCf.net, base, { signed: true })}
          sub={`${formatMoney(businessCf.income, base)} rev · ${formatMoney(businessCf.expense, base)} exp`}
          tone={businessCf.net >= 0 ? 'pos' : 'neg'}
        />
        <StatCard
          label="Outstanding receivables"
          value={formatMoney(receivable, base)}
          sub={`${openInvoices.length} open invoice${openInvoices.length === 1 ? '' : 's'}`}
        />
      </section>

      <section className="adm-card">
        <h2 className="adm-section-title">Quick links</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="adm-btn ghost" href="/admin/transactions">Add a transaction</a>
          <a className="adm-btn ghost" href="/admin/net-worth">Update balances</a>
          <a className="adm-btn ghost" href="/admin/business/invoices">New invoice</a>
        </div>
      </section>
    </>
  );
}
