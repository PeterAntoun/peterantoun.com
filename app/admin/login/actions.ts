'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { verifyTotp } from '@/lib/auth/totp';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip =
    headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.ok) {
    return {
      error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const token = String(formData.get('token') ?? '');
  const from = String(formData.get('from') ?? '/admin');

  const generic: LoginState = { error: 'Invalid email, password, or code.' };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return generic;

  const okPassword = await verifyPassword(password, user.passwordHash);
  if (!okPassword) return generic;

  if (user.totpEnabled) {
    if (!user.totpSecret || !(await verifyTotp(token, user.totpSecret))) return generic;
  }

  resetRateLimit(`login:${ip}`);
  const sessionToken = await createSessionToken({ uid: user.id, email: user.email });
  await setSessionCookie(sessionToken);
  redirect(from.startsWith('/admin') ? from : '/admin');
}
