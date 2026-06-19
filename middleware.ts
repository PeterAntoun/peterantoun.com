/* Edge middleware: gate every /admin/* route behind a valid session cookie.
   /admin/login and /admin/setup stay public so you can authenticate / do the
   first-run setup. DB-free by design (verifySessionToken uses jose only). */

import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

const PUBLIC_PATHS = ['/admin/login', '/admin/setup'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on admin pages and admin API routes; cron routes use their own secret.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
