/* ============================================================
   Finance dashboard — Drizzle schema (Postgres)
   Money is stored as integer MINOR units (cents) + a currency
   code, never floats. Conversion to the base currency happens
   in lib/money.ts using the fx_rates table.
   ============================================================ */

import {
  pgTable,
  pgEnum,
  serial,
  text,
  bigint,
  integer,
  boolean,
  date,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/* ---- enums ------------------------------------------------ */
export const scopeEnum = pgEnum('scope', ['personal', 'business']);
export const accountTypeEnum = pgEnum('account_type', [
  'checking',
  'savings',
  'cash',
  'investment',
  'credit_card',
  'loan',
  'asset',
  'liability',
]);
export const categoryKindEnum = pgEnum('category_kind', ['income', 'expense']);
export const txnTypeEnum = pgEnum('txn_type', ['income', 'expense', 'transfer']);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
]);
export const fxSourceEnum = pgEnum('fx_source', ['auto', 'manual']);

/* ---- auth (single user) ----------------------------------- */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  totpSecret: text('totp_secret'),
  totpEnabled: boolean('totp_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ---- app settings (single row, id = 1) -------------------- */
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  baseCurrency: text('base_currency').notNull().default('USD'),
});

/* ---- accounts --------------------------------------------- */
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    type: accountTypeEnum('type').notNull(),
    scope: scopeEnum('scope').notNull(),
    currency: text('currency').notNull().default('USD'),
    // opening balance in minor units (cents) of the account currency
    openingBalance: bigint('opening_balance', { mode: 'number' }).notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ scopeIdx: index('accounts_scope_idx').on(t.scope) }),
);

/* ---- balance snapshots (drive net-worth trend) ------------ */
export const accountBalances = pgTable(
  'account_balances',
  {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    asOfDate: date('as_of_date').notNull(),
    balance: bigint('balance', { mode: 'number' }).notNull(), // minor units
  },
  (t) => ({
    uniq: uniqueIndex('account_balances_acct_date_idx').on(t.accountId, t.asOfDate),
  }),
);

/* ---- categories ------------------------------------------- */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  kind: categoryKindEnum('kind').notNull(),
  scope: scopeEnum('scope').notNull(),
  color: text('color').notNull().default('#1f9d57'),
});

/* ---- transactions (unified ledger) ------------------------ */
export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    // signed minor units in the transaction currency
    // (income > 0, expense < 0; transfers use a shared transferGroupId)
    amount: bigint('amount', { mode: 'number' }).notNull(),
    currency: text('currency').notNull().default('USD'),
    categoryId: integer('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    type: txnTypeEnum('type').notNull(),
    description: text('description'),
    counterparty: text('counterparty'),
    scope: scopeEnum('scope').notNull(),
    transferGroupId: text('transfer_group_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dateIdx: index('transactions_date_idx').on(t.date),
    acctIdx: index('transactions_account_idx').on(t.accountId),
    scopeIdx: index('transactions_scope_idx').on(t.scope),
  }),
);

/* ---- budgets ---------------------------------------------- */
export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  scope: scopeEnum('scope').notNull(),
  period: text('period').notNull().default('monthly'),
  amount: bigint('amount', { mode: 'number' }).notNull(), // minor units
  currency: text('currency').notNull().default('USD'),
});

/* ---- savings goals ---------------------------------------- */
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  targetAmount: bigint('target_amount', { mode: 'number' }).notNull(),
  currentAmount: bigint('current_amount', { mode: 'number' }).notNull().default(0),
  targetDate: date('target_date'),
  currency: text('currency').notNull().default('USD'),
});

/* ---- clients ---------------------------------------------- */
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  currency: text('currency').notNull().default('USD'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ---- invoices --------------------------------------------- */
export const invoices = pgTable(
  'invoices',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    number: text('number').notNull(),
    issueDate: date('issue_date').notNull(),
    dueDate: date('due_date').notNull(),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    currency: text('currency').notNull().default('USD'),
    subtotal: bigint('subtotal', { mode: 'number' }).notNull().default(0),
    tax: bigint('tax', { mode: 'number' }).notNull().default(0),
    total: bigint('total', { mode: 'number' }).notNull().default(0),
    paidDate: date('paid_date'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    numUniq: uniqueIndex('invoices_number_idx').on(t.number),
    statusIdx: index('invoices_status_idx').on(t.status),
  }),
);

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  qty: integer('qty').notNull().default(1),
  unitPrice: bigint('unit_price', { mode: 'number' }).notNull(), // minor units
  amount: bigint('amount', { mode: 'number' }).notNull(), // qty * unitPrice
});

/* ---- fx rates --------------------------------------------- */
export const fxRates = pgTable(
  'fx_rates',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    base: text('base').notNull(),
    quote: text('quote').notNull(),
    // rate as a string-encoded decimal to avoid float drift (e.g. "0.9213")
    rate: text('rate').notNull(),
    source: fxSourceEnum('source').notNull().default('auto'),
  },
  (t) => ({
    uniq: uniqueIndex('fx_rates_date_pair_idx').on(t.date, t.base, t.quote),
  }),
);

/* ---- inferred types --------------------------------------- */
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type FxRate = typeof fxRates.$inferSelect;
