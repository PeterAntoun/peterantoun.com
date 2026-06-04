# peterantoun.com

Personal portfolio for **Peter Antoun** — Data & AI student and builder based in Paris.

Built with **Next.js 14** (App Router), **Tailwind CSS**, **Framer Motion**, and **TypeScript**. Dark theme, mobile-first, fully responsive.

## Sections

- **Hero** — animated gradient + particle background, CTAs
- **About** — bio, skills grid, languages
- **Projects** — card grid with tech-stack tags
- **Stack / Uses** — daily tools grid
- **Contact** — form posting to a Resend-backed API route
- **Footer**

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
