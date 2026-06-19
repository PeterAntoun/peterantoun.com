'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users, categories, settings } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { verifyTotp } from '@/lib/auth/totp';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { DEFAULT_CATEGORIES } from '@/lib/db/seed-data';

export type SetupState = { error?: string };

export async function completeSetup(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  // Refuse if an account already exists (setup is one-time).
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  if (count > 0) redirect('/admin/login');

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const secret = String(formData.get('secret') ?? '');
  const token = String(formData.get('token') ?? '');

  if (!email || !email.includes('@')) return { error: 'Enter a valid email.' };
  if (password.length < 10)
    return { error: 'Password must be at least 10 characters.' };
  if (!secret) return { error: 'Missing TOTP secret — reload the page.' };
  if (!(await verifyTotp(token, secret)))
    return { error: 'That authenticator code is incorrect. Try again.' };

  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      email,
      passwordHash,
      totpSecret: secret,
      totpEnabled: true,
    });
    await tx
      .insert(settings)
      .values({ id: 1, baseCurrency: process.env.BASE_CURRENCY || 'USD' })
      .onConflictDoNothing();
    await tx.insert(categories).values(DEFAULT_CATEGORIES);
  });

  const [u] = await db.select().from(users).limit(1);
  const sessionToken = await createSessionToken({ uid: u.id, email: u.email });
  await setSessionCookie(sessionToken);
  redirect('/admin');
}
