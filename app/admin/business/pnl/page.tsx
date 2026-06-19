import { cashFlow, pnlSeries, spendByCategory } from '@/lib/db/analytics';
import { resolvePeriod, currentMonth } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import StatCard from '@/components/admin/StatCard';
import PeriodNav from '@/components/admin/PeriodNav';
import { PnlChart, CategoryDonut } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';

export default async function PnlPage({
  searchParams,
}: {
  searchParams: { month?: string; period?: string };
}) {
  const period = resolvePeriod(searchParams);
  const [cf, series, byCat] = await Promise.all([
    cashFlow('business', period.from, period.to),
    pnlSeries(6),
    spendByCategory('business', period.from, period.to),
  ]);
  const base = cf.base;
  const label = period.label;
  const margin = cf.income > 0 ? Math.round((cf.net / cf.income) * 100) : 0;

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Profit &amp; loss</h1>
          <p className="adm-page-sub">Business · {label} · {base}.</p>
        </div>
        <PeriodNav
          month={period.kind === 'month' ? period.month : currentMonth()}
          isAll={period.kind === 'all'}
        />
      </header>

      <section className="adm-stat-grid">
        <StatCard label="Revenue" value={formatMoney(cf.income, base)} tone="pos" />
        <StatCard label="Expenses" value={formatMoney(cf.expense, base)} tone="neg" />
        <StatCard
          label="Profit"
          value={formatMoney(cf.net, base, { signed: true })}
          tone={cf.net >= 0 ? 'pos' : 'neg'}
        />
        <StatCard label="Margin" value={`${margin}%`} tone={margin >= 0 ? 'pos' : 'neg'} />
      </section>

      <section className="adm-section adm-card">
        <h2 className="adm-section-title">Revenue · expenses · profit · 6 months</h2>
        <PnlChart data={series} currency={base} />
      </section>

      <section className="adm-section adm-grid-2">
        <div className="adm-card">
          <h2 className="adm-section-title">Expense breakdown · {label}</h2>
          <CategoryDonut data={byCat} currency={base} />
        </div>
      </section>
    </>
  );
}
