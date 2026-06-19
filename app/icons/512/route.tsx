import { iconResponse } from '@/lib/pwa-icon';

// Rendered once at build time and served as a static asset. Extra padding so it
// is safe as a maskable icon (content stays inside the platform mask).
export const dynamic = 'force-static';

export function GET() {
  return iconResponse(512, 0.2);
}
