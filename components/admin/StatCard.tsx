/* Server component — a single KPI tile. */

export default function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'pos' | 'neg';
}) {
  return (
    <div className="adm-card">
      <p className="adm-stat-label">{label}</p>
      <div className={`adm-stat-value${tone === 'pos' ? ' adm-pos' : tone === 'neg' ? ' adm-neg' : ''}`}>
        {value}
      </div>
      {sub && <p className="adm-stat-sub">{sub}</p>}
    </div>
  );
}
