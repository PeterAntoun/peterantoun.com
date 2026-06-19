'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/admin/actions';

const NAV: { href: string; label: string; group?: string }[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/net-worth', label: 'Net worth', group: 'Personal' },
  { href: '/admin/cash-flow', label: 'Cash flow', group: 'Personal' },
  { href: '/admin/business/pnl', label: 'P&L', group: 'Business' },
  { href: '/admin/business/invoices', label: 'Invoices & clients', group: 'Business' },
  { href: '/admin/transactions', label: 'Transactions', group: 'Ledger' },
  { href: '/admin/settings', label: 'Settings', group: 'System' },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  let lastGroup: string | undefined;
  return (
    <aside className="adm-sidebar">
      <div className="adm-brand">
        <span className="adm-brand-dot" />
        <span>Finance</span>
      </div>

      <nav className="adm-nav">
        {NAV.map((item) => {
          const showGroup = item.group && item.group !== lastGroup;
          lastGroup = item.group;
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              {showGroup && <p className="adm-nav-group">{item.group}</p>}
              <Link
                href={item.href}
                className={`adm-nav-link${active ? ' is-active' : ''}`}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="adm-sidebar-foot">
        <span className="adm-user" title={email}>
          {email}
        </span>
        <form action={logout}>
          <button type="submit" className="adm-logout">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
