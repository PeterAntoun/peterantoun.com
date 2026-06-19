'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/* Month/period selector for the dashboards. Drives the page via URL params
   (?month=YYYY-MM or ?period=all) so server components re-render with the new
   window — other params (e.g. scope) are preserved. */
export default function PeriodNav({ month, isAll }: { month: string; isAll: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(next: { month?: string; all?: boolean }) {
    const sp = new URLSearchParams(params.toString());
    sp.delete('period');
    sp.delete('month');
    if (next.all) sp.set('period', 'all');
    else if (next.month) sp.set('month', next.month);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function shift(delta: number) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    go({ month: d.toISOString().slice(0, 7) });
  }

  return (
    <div className="adm-period">
      <button
        type="button"
        className="adm-period-btn"
        onClick={() => shift(-1)}
        disabled={isAll}
        aria-label="Previous month"
      >
        ‹
      </button>
      <input
        className="adm-period-input"
        type="month"
        value={isAll ? '' : month}
        onChange={(e) => e.target.value && go({ month: e.target.value })}
        aria-label="Pick a month"
      />
      <button
        type="button"
        className="adm-period-btn"
        onClick={() => shift(1)}
        disabled={isAll}
        aria-label="Next month"
      >
        ›
      </button>
      <button
        type="button"
        className={`adm-btn ghost${isAll ? ' is-active' : ''}`}
        onClick={() => go(isAll ? { month } : { all: true })}
      >
        {isAll ? 'All time ✓' : 'All time'}
      </button>
    </div>
  );
}
