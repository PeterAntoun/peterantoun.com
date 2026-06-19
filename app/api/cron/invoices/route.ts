import { NextResponse } from 'next/server';
import { and, eq, lt } from 'drizzle-orm';
import { isAuthorizedCron } from '@/lib/auth/cron';
import { db } from '@/lib/db/client';
import { invoices } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const updated = await db
    .update(invoices)
    .set({ status: 'overdue' })
    .where(and(eq(invoices.status, 'sent'), lt(invoices.dueDate, today)))
    .returning({ id: invoices.id });

  return NextResponse.json({ markedOverdue: updated.length });
}
