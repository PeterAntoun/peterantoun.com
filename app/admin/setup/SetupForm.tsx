'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { completeSetup, type SetupState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="auth-btn" type="submit" disabled={pending}>
      {pending ? 'Creating…' : 'Create account & sign in'}
    </button>
  );
}

export default function SetupForm({ secret, qr }: { secret: string; qr: string }) {
  const [state, formAction] = useFormState<SetupState, FormData>(completeSetup, {});

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="secret" value={secret} />

      <label className="auth-label">
        Email
        <input className="auth-input" type="email" name="email" required autoComplete="username" />
      </label>

      <label className="auth-label">
        Password <span className="auth-hint">(min 10 characters)</span>
        <input
          className="auth-input"
          type="password"
          name="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
      </label>

      <div className="auth-totp">
        <div className="auth-qr">
          {/* data: URL QR rendered by qrcode */}
          <Image src={qr} alt="Authenticator QR code" width={160} height={160} unoptimized />
        </div>
        <div className="auth-totp-help">
          <p>Scan with Google Authenticator, 1Password, or Authy.</p>
          <p className="auth-secret">
            Manual key: <code>{secret}</code>
          </p>
        </div>
      </div>

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
