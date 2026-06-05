/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

/*
 * Content-Security-Policy.
 *
 * The Next.js App Router streams the RSC payload via inline <script> tags and
 * Tailwind/Framer Motion apply inline styles, so 'unsafe-inline' is required
 * for script/style here. In dev, the HMR runtime also needs 'unsafe-eval'.
 * Everything else is locked to same-origin. For an even stricter policy, move
 * to a nonce-based CSP set from middleware — noted in the README.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Force HTTPS for two years, including subdomains.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Belt-and-suspenders clickjacking protection alongside frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Block MIME-type sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URLs to other origins.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Drop access to powerful features this site never uses.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework version.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Tree-shake icon/animation barrels so only used exports ship to the client.
    optimizePackageImports: ['framer-motion'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
