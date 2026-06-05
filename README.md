# peterantoun.com

Personal portfolio for **Peter Antoun** — Data & AI student and builder based in Paris.

Built with **Next.js 14** (App Router), **Tailwind CSS**, **Framer Motion**, and **TypeScript**. Light/dark themes, mobile-first, fully responsive.

## Sections

- **Hero** — animated gradient + particle background, CTAs
- **About** — bio, skills grid, languages
- **Projects** — card grid with tech-stack tags
- **Stack / Uses** — daily tools grid
- **Contact** — form posting to a Resend-backed API route
- **Footer**

## Theming

Colors are driven by semantic CSS variables (`--bg`, `--surface`, `--fg`,
`--muted`, `--line`, …) defined in `app/globals.css` and exposed to Tailwind as
tokens (`bg-bg`, `text-fg`, `border-line/10`, …). The theme toggle in the navbar
flips a `.dark` class on `<html>`; an inline script in the layout applies the
saved/OS preference before first paint, so there's no flash. Precedence is:
saved choice → OS preference → dark.

## Security

- **HTTP security headers** are set in `next.config.mjs`: a same-origin
  Content-Security-Policy, HSTS, `X-Frame-Options: DENY` /
  `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, a strict
  `Referrer-Policy`, and a locked-down `Permissions-Policy`. `X-Powered-By` is
  disabled.
- **Contact API** (`/api/contact`) validates and length-caps every field,
  strips CR/LF from the email subject (header-injection), uses a honeypot, and
  applies best-effort per-instance rate limiting.
- **Hardening notes:** the CSP uses `'unsafe-inline'` for scripts/styles because
  the App Router streams inline RSC payloads — a nonce-based CSP via middleware
  is the stricter upgrade. Rate limiting is in-memory (per serverless instance);
  back it with Upstash/Vercel KV for a global guarantee. Keep `next` patched
  (`npm audit`).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Resend key
npm run dev                        # http://localhost:3000
```

## Environment variables

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key used by `/api/contact` to send mail.  |
| `CONTACT_TO_EMAIL`   | Where contact-form submissions are delivered.        |
| `CONTACT_FROM_EMAIL` | Verified Resend sender address.                      |

See `.env.local.example`.

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Production build           |
| `npm run start` | Serve the production build |
| `npm run lint`  | Lint with ESLint           |

## Static assets

Drop `cv.pdf` and a 1200×630 `og.png` into `public/` to replace the placeholders
referenced by the Hero CTA and Open Graph metadata. See `public/README.md`.

## Deploy

Optimized for [Vercel](https://vercel.com). Set the environment variables in the
project settings and push.
