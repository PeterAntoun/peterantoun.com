/* Default categories + settings inserted once, when the first user completes
   /admin/setup. Editable later from Settings. */

export const DEFAULT_CATEGORIES: {
  name: string;
  kind: 'income' | 'expense';
  scope: 'personal' | 'business';
  color: string;
}[] = [
  // personal income
  { name: 'Salary', kind: 'income', scope: 'personal', color: '#1f9d57' },
  { name: 'Investments', kind: 'income', scope: 'personal', color: '#2f7d8f' },
  { name: 'Other income', kind: 'income', scope: 'personal', color: '#6b8f2f' },
  // personal expense
  { name: 'Housing', kind: 'expense', scope: 'personal', color: '#b4532a' },
  { name: 'Groceries', kind: 'expense', scope: 'personal', color: '#c77d3a' },
  { name: 'Dining', kind: 'expense', scope: 'personal', color: '#cf6a4a' },
  { name: 'Transport', kind: 'expense', scope: 'personal', color: '#8f6b2f' },
  { name: 'Utilities', kind: 'expense', scope: 'personal', color: '#5a6b8f' },
  { name: 'Health', kind: 'expense', scope: 'personal', color: '#8f2f5a' },
  { name: 'Entertainment', kind: 'expense', scope: 'personal', color: '#7d4a8f' },
  { name: 'Shopping', kind: 'expense', scope: 'personal', color: '#a8527d' },
  { name: 'Travel', kind: 'expense', scope: 'personal', color: '#2f8f8a' },
  { name: 'Other', kind: 'expense', scope: 'personal', color: '#6b6860' },
  // business income
  { name: 'Client revenue', kind: 'income', scope: 'business', color: '#1f9d57' },
  { name: 'Consulting', kind: 'income', scope: 'business', color: '#2f7d8f' },
  // business expense
  { name: 'Software', kind: 'expense', scope: 'business', color: '#5a6b8f' },
  { name: 'Contractors', kind: 'expense', scope: 'business', color: '#b4532a' },
  { name: 'Marketing', kind: 'expense', scope: 'business', color: '#cf6a4a' },
  { name: 'Office', kind: 'expense', scope: 'business', color: '#8f6b2f' },
  { name: 'Fees & taxes', kind: 'expense', scope: 'business', color: '#8f2f5a' },
  { name: 'Other', kind: 'expense', scope: 'business', color: '#6b6860' },
];
