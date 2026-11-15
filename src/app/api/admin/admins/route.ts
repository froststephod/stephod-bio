import { NextRequest } from 'next/server';
import { appendAudit, createAdmin, listAdmins, removeAdmin } from '@/lib/admin';
import { guard, json, readJson } from '@/lib/admin-http';

export const dynamic = 'force-dynamic';

// Owner only: list / add / remove admins
export async function GET(req: NextRequest) {
  const g = await guard(req, 'owner');
  if (g.res) return g.res;
  return json({ success: true, admins: await listAdmins() });
}

export async function POST(req: NextRequest) {
  const g = await guard(req, 'owner');
  if (g.res) return g.res;
  const body = await readJson<{ name?: string; password?: string }>(req);
  const result = await createAdmin(String(body?.name ?? ''), String(body?.password ?? ''), g.session.name);
  if (!result.ok) return json({ success: false, error: result.error }, 400);
  await appendAudit(g.session.name, 'admin+', String(body?.name ?? ''));
  return json({ success: true, admins: await listAdmins() });
}

export async function DELETE(req: NextRequest) {
  const g = await guard(req, 'owner');
  if (g.res) return g.res;
  const body = await readJson<{ name?: string }>(req);
  const name = String(body?.name ?? '');
  const ok = await removeAdmin(name);
  if (!ok) return json({ success: false, error: 'ไม่พบแอดมินคนนี้' }, 404);
  await appendAudit(g.session.name, 'admin-', name);
  return json({ success: true, admins: await listAdmins() });
}
