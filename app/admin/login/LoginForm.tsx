'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, type LoginState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="auth-btn" type="submit" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="from" value={from} />

      <label className="auth-label">
        Email
        <input className="auth-input" type="email" name="email" required autoComplete="username" />
      </label>

      <label className="auth-label">
        Password
        <input
          className="auth-input"
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>

      <label className="auth-label">
        Authenticator code
        <input
          className="auth-input"
          type="text"
          name="token"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="123456"
        />
      </label>

      {state.error && <p className="auth-error">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
