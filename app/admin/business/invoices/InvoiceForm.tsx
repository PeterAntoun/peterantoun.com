'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { Client } from '@/lib/db/schema';
import { createInvoice, type InvoiceState } from './actions';

type Line = { description: string; qty: string; unitPrice: string };
const blank: Line = { description: '', qty: '1', unitPrice: '' };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Create invoice'}
    </button>
  );
}

export default function InvoiceForm({ clients }: { clients: Client[] }) {
  const [state, formAction] = useFormState<InvoiceState, FormData>(createInvoice, {});
  const [lines, setLines] = useState<Line[]>([{ ...blank }]);
  const [taxPct, setTaxPct] = useState('0');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setLines([{ ...blank }]);
      setTaxPct('0');
    }
  }, [state.ok]);

  const subtotal = lines.reduce(
    (s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
    0,
  );
  const tax = subtotal * (parseFloat(taxPct) || 0) / 100;
  const total = subtotal + tax;
  const today = new Date().toISOString().slice(0, 10);

  function update(i: number, key: keyof Line, val: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));
  }

  if (clients.length === 0) {
    return <p className="adm-stat-sub">Add a client first to create invoices.</p>;
  }

  return (
    <form ref={formRef} action={formAction} className="auth-form" style={{ gap: 12 }}>
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          lines.map((l) => ({
            description: l.description,
            qty: parseFloat(l.qty) || 0,
            unitPrice: parseFloat(l.unitPrice) || 0,
          })),
        )}
      />
      <input type="hidden" name="taxPct" value={taxPct} />

      <div className="adm-form-row">
        <label className="adm-field">
          Client
          <select className="adm-select" name="clientId" required>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          Invoice #
          <input className="adm-input" name="number" required placeholder="INV-001" />
        </label>
        <label className="adm-field">
          Status
          <select className="adm-select" name="status" defaultValue="sent">
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
          </select>
        </label>
      </div>

      <div className="adm-form-row">
        <label className="adm-field">
          Issue date
          <input className="adm-input" type="date" name="issueDate" defaultValue={today} required />
        </label>
        <label className="adm-field">
          Due date
          <input className="adm-input" type="date" name="dueDate" required />
        </label>
        <label className="adm-field">
          Tax %
          <input
            className="adm-input"
            type="number"
            step="0.1"
            min="0"
            value={taxPct}
            onChange={(e) => setTaxPct(e.target.value)}
          />
        </label>
      </div>

      <div>
        <p className="adm-stat-label">Line items</p>
        {lines.map((l, i) => (
          <div key={i} className="adm-form-row" style={{ marginBottom: 8 }}>
            <input
              className="adm-input"
              placeholder="Description"
              value={l.description}
              onChange={(e) => update(i, 'description', e.target.value)}
            />
            <input
              className="adm-input"
              type="number"
              step="1"
              min="1"
              placeholder="Qty"
              value={l.qty}
              onChange={(e) => update(i, 'qty', e.target.value)}
            />
            <input
              className="adm-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Unit price"
              value={l.unitPrice}
              onChange={(e) => update(i, 'unitPrice', e.target.value)}
            />
            <button
              type="button"
              className="adm-logout"
              onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
              disabled={lines.length === 1}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="adm-btn ghost"
          onClick={() => setLines((ls) => [...ls, { ...blank }])}
        >
          + Add line
        </button>
      </div>

      <div className="adm-card" style={{ background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="adm-stat-sub">Subtotal</span>
          <span className="adm-num">{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="adm-stat-sub">Tax</span>
          <span className="adm-num">{tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span className="adm-num">{total.toFixed(2)}</span>
        </div>
      </div>

      <label className="adm-field">
        Notes
        <input className="adm-input" name="notes" placeholder="Optional" />
      </label>

      {state.error && <p className="adm-error">{state.error}</p>}
      {state.ok && <p className="adm-ok">Invoice created.</p>}
      <Submit />
    </form>
  );
}
