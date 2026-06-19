'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const ACCENT = '#1f9d57';
const INK = '#6b6860';
const NEG = '#c0492b';

function fmt(currency: string) {
  const nf = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return (v: number) => nf.format(v);
}

const axisProps = {
  stroke: INK,
  fontSize: 11,
  tickLine: false,
};

/* ---- net worth over time ---------------------------------- */
export function NetWorthChart({
  data,
  currency,
}: {
  data: { label: string; value: number }[];
  currency: string;
}) {
  const f = fmt(currency);
  return (
    <div className="adm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dfd6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis tickFormatter={f} {...axisProps} width={56} />
          <Tooltip formatter={(v: unknown) => f(Number(v))} />
          <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- income vs expense (monthly) -------------------------- */
export function IncomeExpenseChart({
  data,
  currency,
}: {
  data: { label: string; income: number; expense: number }[];
  currency: string;
}) {
  const f = fmt(currency);
  return (
    <div className="adm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dfd6" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis tickFormatter={f} {...axisProps} width={56} />
          <Tooltip formatter={(v: unknown) => f(Number(v))} />
          <Legend />
          <Bar dataKey="income" name="Income" fill={ACCENT} radius={[3, 3, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill={NEG} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- category breakdown (donut) --------------------------- */
export function CategoryDonut({
  data,
  currency,
}: {
  data: { name: string; value: number; color: string }[];
  currency: string;
}) {
  const f = fmt(currency);
  if (data.length === 0) return <div className="adm-empty">No spending in range.</div>;
  return (
    <div className="adm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: unknown) => f(Number(v))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- budget vs actual ------------------------------------- */
export function BudgetBars({
  data,
  currency,
}: {
  data: { name: string; budget: number; actual: number }[];
  currency: string;
}) {
  const f = fmt(currency);
  if (data.length === 0) return <div className="adm-empty">No budgets set.</div>;
  return (
    <div className="adm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dfd6" horizontal={false} />
          <XAxis type="number" tickFormatter={f} {...axisProps} />
          <YAxis type="category" dataKey="name" {...axisProps} width={90} />
          <Tooltip formatter={(v: unknown) => f(Number(v))} />
          <Legend />
          <Bar dataKey="budget" name="Budget" fill={INK} radius={[0, 3, 3, 0]} />
          <Bar dataKey="actual" name="Actual" fill={ACCENT} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
