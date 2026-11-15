import { NextRequest } from 'next/server';
import { readAudit } from '@/lib/admin';
import { guard, json } from '@/lib/admin-http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const g = await guard(req);
  if (g.res) return g.res;
  return json({ success: true, entries: await readAudit() });
}
