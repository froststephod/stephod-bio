import { NextRequest } from 'next/server';
import {
  ADMIN_COOKIE,
  adminConfigured,
  appendAudit,
  loginWithPassword,
  parseSessionToken,
  sessionCookieOptions,
} from '@/lib/admin';
import { json, readJson } from '@/lib/admin-http';

export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

// GET: current session state (used by the /admin page)
export async function GET(req: NextRequest) {
  const session = parseSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  return json({
    success: true,
    configured: adminConfigured(),
    session: session ? { role: session.role, name: session.name } : null,
  });
}

// POST: login with password
export async function POST(req: NextRequest) {
  const body = await readJson<{ password?: string }>(req);
  const result = await loginWithPassword(String(body?.password ?? ''), clientIp(req));
  if ('error' in result) {
    return json({ success: false, error: result.error }, result.status);
  }
  const res = json({
    success: true,
    session: { role: result.session.role, name: result.session.name },
  });
  res.cookies.set(ADMIN_COOKIE, result.token, sessionCookieOptions());
  await appendAudit(result.session.name, 'login');
  return res;
}

// DELETE: logout
export async function DELETE() {
  const res = json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
