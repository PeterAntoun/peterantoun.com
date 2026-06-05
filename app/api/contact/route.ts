import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  // Honeypot — bots fill this, humans never see it.
  company?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

/*
 * Best-effort, per-instance rate limiting. Serverless instances are ephemeral
 * and not shared across regions, so this throttles bursts against a single warm
 * instance rather than guaranteeing a global limit. For a hard guarantee, back
 * this with Upstash/Vercel KV (noted in the README).
 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();

  // Opportunistically prune expired entries so the map can't grow unbounded.
  if (hits.size > 5000) {
    hits.forEach((entry, key) => {
      if (now > entry.resetAt) hits.delete(key);
    });
  }

  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  // First forwarded hop is the client IP on Vercel; fall back to a constant.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  // Silently accept honeypot hits so bots don't learn anything.
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and message are all required.' },
      { status: 400 },
    );
  }

  if (name.length > MAX_NAME || email.length > MAX_EMAIL) {
    return NextResponse.json(
      { error: 'Name or email is too long.' },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: 'Message is too long.' },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.');
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 500 },
    );
  }

  const toEmail = process.env.CONTACT_TO_EMAIL ?? 'hello@peterantoun.com';
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>';

  const resend = new Resend(apiKey);

  // The subject is an email header — collapse any CR/LF so a crafted name can't
  // inject extra headers. (The email regex already blocks whitespace, so
  // `reply_to` is safe to pass through.)
  const safeSubjectName = name.replace(/[\r\n]+/g, ' ');

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `New message from ${safeSubjectName} · peterantoun.com`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; color: #0b0d12;">
          <h2 style="margin:0 0 12px;">New portfolio message</h2>
          <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="white-space:pre-wrap; margin:0;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Could not send your message. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact route error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
