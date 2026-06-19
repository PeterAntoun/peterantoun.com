import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { generateTotpSecret, totpQrDataUrl } from '@/lib/auth/totp';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function SetupPage() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  if (count > 0) redirect('/admin/login');

  // Provisional email only used to label the authenticator entry's QR.
  const secret = generateTotpSecret();
  const qr = await totpQrDataUrl('peter@peterantoun.com', secret);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="auth-kicker">First-run setup</p>
        <h1 className="auth-title">Create your admin account</h1>
        <p className="auth-sub">
          This page works only once. Set a strong password, then scan the QR
          with an authenticator app and confirm the 6-digit code.
        </p>
        <SetupForm secret={secret} qr={qr} />
      </div>
    </main>
  );
}
