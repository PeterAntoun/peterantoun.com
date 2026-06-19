import { cashFlow, monthlySeries, spendByCategory } from '@/lib/db/analytics';
import { monthRange } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import StatCard from '@/components/admin/StatCard';
import { IncomeExpenseChart, CategoryDonut } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';

export default async function CashFlowPage() {
  const { from, to, label } = monthRange(0);
  const [cf, series, byCat] = await Promise.all([
    cashFlow('personal', from, to),
    monthlySeries('personal', 6),
    spendByCategory('personal', from, to),
  ]);
  const base = cf.base;

  return (
    <>
      <header className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Cash flow</h1>
          <p className="adm-page-sub">Personal income & spending · {label} · {base}.</p>
        </div>
      </header>

      <section className="adm-stat-grid">
        <StatCard label="Income" value={formatMoney(cf.income, base)} tone="pos" />
        <StatCard label="Expenses" value={formatMoney(cf.expense, base)} tone="neg" />
        <StatCard
          label="Net"
          value={formatMoney(cf.net, base, { signed: true })}
          tone={cf.net >= 0 ? 'pos' : 'neg'}
        />
        <StatCard
          label="Savings rate"
          value={cf.income > 0 ? `${Math.round((cf.net / cf.income) * 100)}%` : '—'}
        />
      </section>

      <section className="adm-section adm-grid-2">
        <div className="adm-card">
          <h2 className="adm-section-title">Income vs expense · 6 months</h2>
          <IncomeExpenseChart data={series} currency={base} />
        </div>
        <div className="adm-card">
          <h2 className="adm-section-title">Spending by category · {label}</h2>
          <CategoryDonut data={byCat} currency={base} />
        </div>
      </section>
    </>
  );
}
