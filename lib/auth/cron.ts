/* Shared guard for /api/cron/* endpoints. Vercel Cron sends the configured
   CRON_SECRET as `Authorization: Bearer <secret>`. */

export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}
