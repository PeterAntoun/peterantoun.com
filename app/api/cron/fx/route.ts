import { NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/auth/cron';
import { fetchAndStoreLatest } from '@/lib/fx';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await fetchAndStoreLatest();
  const ok = !('error' in result);
  return NextResponse.json(result, { status: ok ? 200 : 502 });
}
