import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  // No account yet → send to first-run setup.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  if (count === 0) redirect('/admin/setup');

  // Already signed in → straight to the dashboard.
  if (await getSession()) redirect('/admin');

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="auth-kicker">Private</p>
        <h1 className="auth-title">Finance dashboard</h1>
        <p className="auth-sub">Sign in to continue.</p>
        <LoginForm from={searchParams.from ?? '/admin'} />
      </div>
    </main>
  );
}
