import type { Metadata, Viewport } from 'next';
import Sidebar from '@/components/admin/Sidebar';
import ServiceWorkerRegister from '@/components/admin/ServiceWorkerRegister';
import { getSession } from '@/lib/auth/session';
import './admin.css';

export const metadata: Metadata = {
  title: 'Finance — Private',
  robots: { index: false, follow: false },
  // iOS: launch full-screen from the home-screen icon, branded "Finance".
  appleWebApp: { capable: true, title: 'Finance', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#101010',
  // Extend under the iOS notch / home indicator; we pad with safe-area insets.
  viewportFit: 'cover',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/login and /admin/setup render inside this layout too, but they are
  // the auth pages — don't wrap them in the dashboard chrome.
  const session = await getSession();

  // Middleware guarantees a session on protected routes, but the login/setup
  // pages share this layout. Render bare shell (no sidebar) when unauthenticated.
  if (!session) {
    return (
      <div className="adm-auth-root">
        <ServiceWorkerRegister />
        {children}
      </div>
    );
  }

  return (
    <div className="adm-root">
      <ServiceWorkerRegister />
      <Sidebar email={session.email} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
