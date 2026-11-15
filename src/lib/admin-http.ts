import { NextRequest, NextResponse } from 'next/server';
import { AdminRole, AdminSession, requireAdmin } from './admin';

export const noStore = { 'Cache-Control': 'no-store' };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** Returns the admin session, or a ready-made 401/403 response. */
export async function guard(
  req: NextRequest,
  role: AdminRole = 'admin'
): Promise<{ session: AdminSession; res?: undefined } | { session?: undefined; res: NextResponse }> {
  const session = await requireAdmin(req, role);
  if (!session) {
    const anySession = await requireAdmin(req, 'admin');
    return {
      res: json(
        { success: false, error: anySession ? 'เฉพาะเจ้าของระบบเท่านั้น' : 'กรุณาเข้าสู่ระบบแอดมิน' },
        anySession ? 403 : 401
      ),
    };
  }
  return { session };
}

export async function readJson<T = any>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function cleanSlug(raw: string): string {
  return decodeURIComponent(raw).toLowerCase().replace(/[^a-z0-9_-]/g, '');
}
