'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { clients, invoices, invoiceLineItems } from '@/lib/db/schema';
import { majorToMinor } from '@/lib/money';

function revalidate() {
  revalidatePath('/admin/business/invoices');
  revalidatePath('/admin/business/pnl');
  revalidatePath('/admin');
}

/* ---- clients ---------------------------------------------- */
const clientSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal('')),
  currency: z.enum(['USD', 'EUR']),
  notes: z.string().max(500).optional(),
});

export async function createClient(formData: FormData): Promise<void> {
  const p = clientSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  const v = p.data;
  await db.insert(clients).values({
    name: v.name,
    email: v.email || null,
    currency: v.currency,
    notes: v.notes || null,
  });
  revalidate();
}

export async function deleteClient(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (id) {
    await db.delete(clients).where(eq(clients.id, id));
    revalidate();
  }
}

/* ---- invoices --------------------------------------------- */
const lineItem = z.object({
  description: z.string().min(1),
  qty: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export type InvoiceState = { error?: string; ok?: boolean };

export async function createInvoice(
  _prev: InvoiceState,
  formData: FormData,
): Promise<InvoiceState> {
  const clientId = Number(formData.get('clientId'));
  const number = String(formData.get('number') ?? '').trim();
  const issueDate = String(formData.get('issueDate') ?? '');
  const dueDate = String(formData.get('dueDate') ?? '');
  const status = String(formData.get('status') ?? 'draft') as
    | 'draft'
    | 'sent'
    | 'paid';
  const taxPct = parseFloat(String(formData.get('taxPct') ?? '0')) || 0;
  const notes = String(formData.get('notes') ?? '');

  if (!clientId || !number || !issueDate || !dueDate)
    return { error: 'Fill in client, number, and dates.' };

  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  if (!client) return { error: 'Unknown client.' };

  let items: { description: string; qty: number; unitPrice: number }[];
  try {
    items = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    return { error: 'Invalid line items.' };
  }
  const validItems: z.infer<typeof lineItem>[] = [];
  for (const i of items) {
    const p = lineItem.safeParse(i);
    if (p.success) validItems.push(p.data);
  }
  if (validItems.length === 0) return { error: 'Add at least one line item.' };

  const lines = validItems.map((v) => {
    const unit = majorToMinor(v.unitPrice, client.currency);
    return {
      description: v.description,
      qty: v.qty,
      unitPrice: unit,
      amount: unit * v.qty,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const tax = Math.round((subtotal * taxPct) / 100);
  const total = subtotal + tax;

  try {
    await db.transaction(async (tx) => {
      const [inv] = await tx
        .insert(invoices)
        .values({
          clientId,
          number,
          issueDate,
          dueDate,
          status,
          currency: client.currency,
          subtotal,
          tax,
          total,
          paidDate: status === 'paid' ? issueDate : null,
          notes: notes || null,
        })
        .returning({ id: invoices.id });
      await tx
        .insert(invoiceLineItems)
        .values(lines.map((l) => ({ ...l, invoiceId: inv.id })));
    });
  } catch {
    return { error: 'Could not save — is the invoice number unique?' };
  }

  revalidate();
  return { ok: true };
}

export async function markInvoicePaid(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  const today = new Date().toISOString().slice(0, 10);
  await db
    .update(invoices)
    .set({ status: 'paid', paidDate: today })
    .where(eq(invoices.id, id));
  revalidate();
}

export async function deleteInvoice(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (id) {
    await db.delete(invoices).where(eq(invoices.id, id));
    revalidate();
  }
}
