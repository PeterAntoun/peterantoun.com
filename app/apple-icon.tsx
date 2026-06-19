import { iconResponse } from '@/lib/pwa-icon';

// iOS home-screen icon (Add to Home Screen). 180×180 is the canonical size.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return iconResponse(180, 0.14);
}
