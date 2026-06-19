'use client';

import { useState, useTransition } from 'react';
import Papa from 'papaparse';
import type { Account } from '@/lib/db/schema';
import { importTransactions } from './actions';

type Row = Record<string, string>;
type Mapped = { date: string; amount: number; description?: string };

export default function CsvImporter({ accounts }: { accounts: Account[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [map, setMap] = useState({ date: '', amount: '', description: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onFile(file: File) {
    setMsg(null);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hs = res.meta.fields ?? [];
        setHeaders(hs);
        setRows(res.data);
        // best-effort auto-map by common header names
        const find = (...names: string[]) =>
          hs.find((h) => names.some((n) => h.toLowerCase().includes(n))) ?? '';
        setMap({
          date: find('date'),
          amount: find('amount', 'value', 'debit'),
          description: find('description', 'detail', 'memo', 'name', 'payee'),
        });
      },
    });
  }

  function buildMapped(): Mapped[] {
    return rows
      .map((r) => ({
        date: normalizeDate(r[map.date]),
        amount: parseFloat((r[map.amount] ?? '').replace(/[,$\s]/g, '')),
        description: map.description ? r[map.description] : undefined,
      }))
      .filter((m) => m.date && Number.isFinite(m.amount)) as Mapped[];
  }

  function commit() {
    const mapped = buildMapped();
    if (mapped.length === 0) {
      setMsg('No rows could be parsed — check the column mapping.');
      return;
    }
    start(async () => {
      const res = await importTransactions(accountId, mapped);
      if (res.error) setMsg(res.error);
      else {
        setMsg(`Imported ${res.imported} transactions.`);
        setRows([]);
        setHeaders([]);
      }
    });
  }

  const preview = headers.length ? buildMapped().slice(0, 5) : [];

  return (
    <div className="auth-form" style={{ gap: 12 }}>
      <div className="adm-form-row">
        <label className="adm-field">
          Into account
          <select
            className="adm-select"
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          CSV file
          <input
            className="adm-input"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      </div>

      {headers.length > 0 && (
        <>
          <p className="adm-stat-sub">Map columns (amount: negative = expense):</p>
          <div className="adm-form-row">
            {(['date', 'amount', 'description'] as const).map((field) => (
              <label key={field} className="adm-field" style={{ textTransform: 'capitalize' }}>
                {field}
                <select
                  className="adm-select"
                  value={map[field]}
                  onChange={(e) => setMap({ ...map, [field]: e.target.value })}
                >
                  <option value="">—</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {preview.length > 0 && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="adm-num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td>{p.description || '—'}</td>
                      <td className="adm-num">{p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button className="adm-btn" type="button" onClick={commit} disabled={pending}>
            {pending ? 'Importing…' : `Import ${buildMapped().length} rows`}
          </button>
        </>
      )}

      {msg && <p className="adm-ok">{msg}</p>}
    </div>
  );
}

/** Accept YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY → normalize to YYYY-MM-DD. */
function normalizeDate(raw: string | undefined): string {
  if (!raw) return '';
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    let [, a, b, y] = m;
    if (y.length === 2) y = '20' + y;
    // assume D/M/Y when first group > 12, else M/D/Y
    const day = Number(a) > 12 ? a : b;
    const mon = Number(a) > 12 ? b : a;
    return `${y}-${mon.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return '';
}
