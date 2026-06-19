/* Local finance MCP server (stdio) for Claude Code.
   Reuses the app's own data layer (lib/db, lib/money, lib/fx, lib/db/analytics)
   so writes go through the exact same money/FX/sign rules as the web UI — no
   raw SQL drift. Run via:  node --env-file=.env.local mcp/dist/server.cjs
   (esbuild bundles this + the @/ libs into that file). */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import {
  accounts,
  accountBalances,
  categories,
  clients,
  fxRates,
  invoices,
  invoiceLineItems,
  transactions,
} from '@/lib/db/schema';
import { getTransactions, monthRange, type Scope } from '@/lib/db/queries';
import { netWorth, cashFlow, pnlSeries, spendByCategory } from '@/lib/db/analytics';
import { getRate, fetchAndStoreLatest } from '@/lib/fx';
import { majorToMinor, formatMoney } from '@/lib/money';

const CURRENCY = z.enum(['USD', 'EUR']);
const SCOPE = z.enum(['personal', 'business']);

/* ---- helpers ---------------------------------------------- */
function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
function fail(message: string) {
  return { isError: true, content: [{ type: 'text' as const, text: message }] };
}

/** Resolve an account by numeric id or (case-insensitive) name. */
async function resolveAccount(ref: string) {
  const all = await db.select().from(accounts);
  const byId = Number(ref);
  return (
    all.find((a) => a.id === byId) ??
    all.find((a) => a.name.toLowerCase() === ref.toLowerCase()) ??
    all.find((a) => a.name.toLowerCase().includes(ref.toLowerCase()))
  );
}

async function resolveCategory(ref: string, scope?: Scope) {
  const all = await db.select().from(categories);
  const pool = scope ? all.filter((c) => c.scope === scope) : all;
  const byId = Number(ref);
  return (
    pool.find((c) => c.id === byId) ??
    pool.find((c) => c.name.toLowerCase() === ref.toLowerCase()) ??
    pool.find((c) => c.name.toLowerCase().includes(ref.toLowerCase()))
  );
}

async function resolveClient(ref: string) {
  const all = await db.select().from(clients);
  const byId = Number(ref);
  return (
    all.find((c) => c.id === byId) ??
    all.find((c) => c.name.toLowerCase() === ref.toLowerCase()) ??
    all.find((c) => c.name.toLowerCase().includes(ref.toLowerCase()))
  );
}

const server = new McpServer({ name: 'peter-finance', version: '1.0.0' });

/* ============================================================
   READ tools
   ============================================================ */
server.tool(
  'list_accounts',
  'List all accounts (optionally filtered by scope). Shows id, name, type, scope, currency, opening balance.',
  { scope: SCOPE.optional() },
  async ({ scope }) => {
    const rows = await db.select().from(accounts);
    const filtered = scope ? rows.filter((a) => a.scope === scope) : rows;
    return ok(
      filtered.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        scope: a.scope,
        currency: a.currency,
        openingBalance: formatMoney(a.openingBalance, a.currency),
      })),
    );
  },
);

server.tool(
  'list_categories',
  'List categories (optionally by scope), with id, name, kind (income/expense), scope.',
  { scope: SCOPE.optional() },
  async ({ scope }) => {
    const rows = await db.select().from(categories);
    const filtered = scope ? rows.filter((c) => c.scope === scope) : rows;
    return ok(filtered);
  },
);

server.tool(
  'list_transactions',
  'List transactions with optional filters. Amounts are signed (income +, expense -). Date format YYYY-MM-DD.',
  {
    scope: SCOPE.optional(),
    accountId: z.number().int().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    limit: z.number().int().max(1000).optional(),
  },
  async (args) => {
    const rows = await getTransactions(args);
    return ok(
      rows.map((t) => ({
        id: t.id,
        date: t.date,
        amount: formatMoney(t.amount, t.currency, { signed: true }),
        type: t.type,
        account: t.accountName,
        category: t.categoryName,
        scope: t.scope,
        description: t.description,
      })),
    );
  },
);

server.tool(
  'net_worth',
  'Current net worth: assets, liabilities, and net, all converted to the base currency.',
  {},
  async () => {
    const nw = await netWorth();
    return ok({
      base: nw.base,
      assets: formatMoney(nw.assets, nw.base),
      liabilities: formatMoney(nw.liabilities, nw.base),
      net: formatMoney(nw.net, nw.base),
      missingRatesFor: nw.missing,
    });
  },
);

server.tool(
  'cash_flow',
  'Income, expense and net for a scope over a month. monthOffset 0 = current month, -1 = last month.',
  { scope: SCOPE.default('personal'), monthOffset: z.number().int().optional() },
  async ({ scope, monthOffset }) => {
    const { from, to, label } = monthRange(monthOffset ?? 0);
    const cf = await cashFlow(scope, from, to);
    return ok({
      period: label,
      scope,
      base: cf.base,
      income: formatMoney(cf.income, cf.base),
      expense: formatMoney(cf.expense, cf.base),
      net: formatMoney(cf.net, cf.base, { signed: true }),
    });
  },
);

server.tool(
  'pnl',
  'Business profit & loss series for the last N months (revenue, expenses, profit per month).',
  { months: z.number().int().min(1).max(24).default(6) },
  async ({ months }) => ok(await pnlSeries(months)),
);

server.tool(
  'spending_by_category',
  'Expense breakdown by category for a scope and month. monthOffset 0 = current.',
  { scope: SCOPE.default('personal'), monthOffset: z.number().int().optional() },
  async ({ scope, monthOffset }) => {
    const { from, to, label } = monthRange(monthOffset ?? 0);
    const rows = await spendByCategory(scope, from, to);
    return ok({ period: label, scope, breakdown: rows });
  },
);

server.tool(
  'list_invoices',
  'List invoices, optionally filtered by status (draft/sent/paid/overdue).',
  { status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional() },
  async ({ status }) => {
    const rows = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        clientName: clients.name,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        status: invoices.status,
        currency: invoices.currency,
        total: invoices.total,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.issueDate));
    const filtered = status ? rows.filter((r) => r.status === status) : rows;
    return ok(
      filtered.map((r) => ({ ...r, total: formatMoney(r.total, r.currency) })),
    );
  },
);

server.tool('list_clients', 'List all clients.', {}, async () =>
  ok(await db.select().from(clients)),
);

server.tool(
  'fx_rate',
  'Get the most recent exchange rate to convert one currency to another.',
  { from: CURRENCY, to: CURRENCY },
  async ({ from, to }) => {
    const rate = await getRate(from, to);
    return rate == null
      ? fail(`No rate available for ${from}->${to}. Use set_fx_rate or refresh_fx.`)
      : ok({ from, to, rate });
  },
);

/* ============================================================
   WRITE tools
   ============================================================ */
server.tool(
  'add_transaction',
  'Record a transaction. account = account name or id. type income|expense|transfer. amount is a positive number in the account currency; expense is stored as negative automatically. date YYYY-MM-DD. category optional (name or id).',
  {
    account: z.string(),
    date: z.string(),
    type: z.enum(['income', 'expense', 'transfer']),
    amount: z.number().positive(),
    category: z.string().optional(),
    description: z.string().optional(),
    counterparty: z.string().optional(),
  },
  async (a) => {
    const acct = await resolveAccount(a.account);
    if (!acct) return fail(`No account matched "${a.account}". Use list_accounts.`);
    const minor = majorToMinor(a.amount, acct.currency);
    const signed = a.type === 'expense' ? -Math.abs(minor) : Math.abs(minor);
    let categoryId: number | null = null;
    if (a.category) {
      const cat = await resolveCategory(a.category, acct.scope);
      if (!cat) return fail(`No category matched "${a.category}" in scope ${acct.scope}.`);
      categoryId = cat.id;
    }
    const [row] = await db
      .insert(transactions)
      .values({
        accountId: acct.id,
        date: a.date,
        amount: signed,
        currency: acct.currency,
        type: a.type,
        categoryId,
        description: a.description ?? null,
        counterparty: a.counterparty ?? null,
        scope: acct.scope,
      })
      .returning({ id: transactions.id });
    return ok({
      created: row.id,
      account: acct.name,
      amount: formatMoney(signed, acct.currency, { signed: true }),
      scope: acct.scope,
    });
  },
);

server.tool(
  'set_transaction_category',
  'Set or change a transaction’s category. category = name or id.',
  { transactionId: z.number().int(), category: z.string() },
  async ({ transactionId, category }) => {
    const [txn] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);
    if (!txn) return fail(`No transaction #${transactionId}.`);
    const cat = await resolveCategory(category, txn.scope);
    if (!cat) return fail(`No category matched "${category}" in scope ${txn.scope}.`);
    await db
      .update(transactions)
      .set({ categoryId: cat.id })
      .where(eq(transactions.id, transactionId));
    return ok({ transactionId, category: cat.name });
  },
);

server.tool(
  'delete_transaction',
  'Permanently delete a transaction by id.',
  { transactionId: z.number().int() },
  async ({ transactionId }) => {
    await db.delete(transactions).where(eq(transactions.id, transactionId));
    return ok({ deleted: transactionId });
  },
);

server.tool(
  'add_account',
  'Create an account. type: checking|savings|cash|investment|credit_card|loan|asset|liability.',
  {
    name: z.string(),
    type: z.enum([
      'checking',
      'savings',
      'cash',
      'investment',
      'credit_card',
      'loan',
      'asset',
      'liability',
    ]),
    scope: SCOPE,
    currency: CURRENCY.default('USD'),
    openingBalance: z.number().default(0),
  },
  async (a) => {
    const [row] = await db
      .insert(accounts)
      .values({
        name: a.name,
        type: a.type,
        scope: a.scope,
        currency: a.currency,
        openingBalance: majorToMinor(a.openingBalance, a.currency),
      })
      .returning({ id: accounts.id });
    return ok({ created: row.id, name: a.name });
  },
);

server.tool(
  'record_balance',
  'Snapshot an account balance on a date (feeds the net-worth trend). account = name or id.',
  { account: z.string(), date: z.string(), balance: z.number() },
  async ({ account, date, balance }) => {
    const acct = await resolveAccount(account);
    if (!acct) return fail(`No account matched "${account}".`);
    const minor = majorToMinor(balance, acct.currency);
    await db
      .insert(accountBalances)
      .values({ accountId: acct.id, asOfDate: date, balance: minor })
      .onConflictDoUpdate({
        target: [accountBalances.accountId, accountBalances.asOfDate],
        set: { balance: minor },
      });
    return ok({ account: acct.name, date, balance: formatMoney(minor, acct.currency) });
  },
);

server.tool(
  'add_category',
  'Create a category. kind income|expense.',
  { name: z.string(), kind: z.enum(['income', 'expense']), scope: SCOPE, color: z.string().optional() },
  async (a) => {
    const [row] = await db
      .insert(categories)
      .values({ name: a.name, kind: a.kind, scope: a.scope, color: a.color ?? '#1f9d57' })
      .returning({ id: categories.id });
    return ok({ created: row.id, name: a.name });
  },
);

server.tool(
  'create_client',
  'Create a client for invoicing.',
  { name: z.string(), email: z.string().optional(), currency: CURRENCY.default('USD'), notes: z.string().optional() },
  async (a) => {
    const [row] = await db
      .insert(clients)
      .values({ name: a.name, email: a.email ?? null, currency: a.currency, notes: a.notes ?? null })
      .returning({ id: clients.id });
    return ok({ created: row.id, name: a.name });
  },
);

server.tool(
  'create_invoice',
  'Create an invoice with line items. client = name or id. Dates YYYY-MM-DD. taxPct optional. Currency follows the client. items: [{description, qty, unitPrice}] (unitPrice in major units).',
  {
    client: z.string(),
    number: z.string(),
    issueDate: z.string(),
    dueDate: z.string(),
    status: z.enum(['draft', 'sent', 'paid']).default('sent'),
    taxPct: z.number().min(0).default(0),
    notes: z.string().optional(),
    items: z
      .array(z.object({ description: z.string(), qty: z.number().positive(), unitPrice: z.number().nonnegative() }))
      .min(1),
  },
  async (a) => {
    const client = await resolveClient(a.client);
    if (!client) return fail(`No client matched "${a.client}". Use list_clients or create_client.`);
    const lines = a.items.map((i) => {
      const unit = majorToMinor(i.unitPrice, client.currency);
      return { description: i.description, qty: i.qty, unitPrice: unit, amount: unit * i.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.amount, 0);
    const tax = Math.round((subtotal * a.taxPct) / 100);
    const total = subtotal + tax;
    try {
      const id = await db.transaction(async (tx) => {
        const [inv] = await tx
          .insert(invoices)
          .values({
            clientId: client.id,
            number: a.number,
            issueDate: a.issueDate,
            dueDate: a.dueDate,
            status: a.status,
            currency: client.currency,
            subtotal,
            tax,
            total,
            paidDate: a.status === 'paid' ? a.issueDate : null,
            notes: a.notes ?? null,
          })
          .returning({ id: invoices.id });
        await tx.insert(invoiceLineItems).values(lines.map((l) => ({ ...l, invoiceId: inv.id })));
        return inv.id;
      });
      return ok({ created: id, number: a.number, total: formatMoney(total, client.currency) });
    } catch {
      return fail('Could not create invoice — is the invoice number unique?');
    }
  },
);

server.tool(
  'mark_invoice_paid',
  'Mark an invoice paid by id or number.',
  { invoice: z.string() },
  async ({ invoice }) => {
    const all = await db.select().from(invoices);
    const byId = Number(invoice);
    const inv =
      all.find((i) => i.id === byId) ?? all.find((i) => i.number.toLowerCase() === invoice.toLowerCase());
    if (!inv) return fail(`No invoice matched "${invoice}".`);
    const today = new Date().toISOString().slice(0, 10);
    await db.update(invoices).set({ status: 'paid', paidDate: today }).where(eq(invoices.id, inv.id));
    return ok({ invoice: inv.number, status: 'paid', paidDate: today });
  },
);

server.tool(
  'set_fx_rate',
  'Manually set an exchange rate (also stores the inverse). Overrides the auto rate for that date.',
  { base: CURRENCY, quote: CURRENCY, rate: z.number().positive(), date: z.string() },
  async ({ base, quote, rate, date }) => {
    for (const [b, q, r] of [
      [base, quote, rate],
      [quote, base, 1 / rate],
    ] as const) {
      await db
        .insert(fxRates)
        .values({ date, base: b, quote: q, rate: String(r), source: 'manual' })
        .onConflictDoUpdate({
          target: [fxRates.date, fxRates.base, fxRates.quote],
          set: { rate: String(r), source: 'manual' },
        });
    }
    return ok({ base, quote, rate, date, source: 'manual' });
  },
);

server.tool(
  'refresh_fx',
  'Fetch the latest USD/EUR rate from the ECB and cache it.',
  {},
  async () => ok(await fetchAndStoreLatest()),
);

/* ---- start ------------------------------------------------ */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error('peter-finance MCP server ready (stdio)');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
