import { iconResponse } from '@/lib/pwa-icon';

// Rendered once at build time and served as a static asset.
export const dynamic = 'force-static';

export function GET() {
  return iconResponse(192);
}
