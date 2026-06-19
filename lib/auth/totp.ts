/* TOTP 2FA via otplib (v13 functional API). Generates a secret + otpauth URI
   for authenticator apps (Google Authenticator, 1Password, Authy) and verifies
   6-digit codes with ±30s clock tolerance. */

import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

const ISSUER = 'Peter Antoun Finance';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpKeyUri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export async function totpQrDataUrl(email: string, secret: string): Promise<string> {
  return QRCode.toDataURL(totpKeyUri(email, secret));
}

export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  try {
    const res = await verify({ secret, token: token.trim(), epochTolerance: 30 });
    return res.valid;
  } catch {
    return false;
  }
}
