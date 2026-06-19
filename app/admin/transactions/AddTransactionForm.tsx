'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { Account, Category } from '@/lib/db/schema';
import { createTransaction, type TxnFormState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Add'}
    </button>
  );
}

export default function AddTransactionForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [state, formAction] = useFormState<TxnFormState, FormData>(createTransaction, {});
  const [scope, setScope] = useState<string>(accounts[0]?.scope ?? 'personal');
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form after a successful add.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const scopedCats = categories.filter((c) => c.scope === scope);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} className="auth-form" style={{ gap: 12 }}>
      <div className="adm-form-row">
        <label className="adm-field">
          Account
          <select
            className="adm-select"
            name="accountId"
            required
            onChange={(e) => {
              const a = accounts.find((x) => x.id === Number(e.target.value));
              if (a) setScope(a.scope);
            }}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency} · {a.scope})
              </option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          Date
          <input className="adm-input" type="date" name="date" defaultValue={today} required />
        </label>
      </div>

      <div className="adm-form-row">
        <label className="adm-field">
          Type
          <select className="adm-select" name="type" defaultValue="expense" required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <label className="adm-field">
          Amount
          <input
            className="adm-input"
            type="number"
            name="amount"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
          />
        </label>
        <label className="adm-field">
          Category
          <select className="adm-select" name="categoryId" defaultValue="0">
            <option value="0">— none —</option>
            {scopedCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="adm-field">
        Description
        <input className="adm-input" type="text" name="description" placeholder="Optional note" />
      </label>

      {state.error && <p className="adm-error">{state.error}</p>}
      {state.ok && <p className="adm-ok">Added.</p>}
      <Submit />
    </form>
  );
}
