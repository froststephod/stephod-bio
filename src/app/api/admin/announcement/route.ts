import { NextRequest } from 'next/server';
import { appendAudit, getAnnouncement, setAnnouncement } from '@/lib/admin';
import { guard, json, readJson } from '@/lib/admin-http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const g = await guard(req);
  if (g.res) return g.res;
  return json({ success: true, announcement: await getAnnouncement() });
}

export async function POST(req: NextRequest) {
  const g = await guard(req);
  if (g.res) return g.res;
  const body = await readJson<{ text?: string; type?: 'info' | 'warn' | 'success'; on?: boolean }>(req);
  if (!body) return json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, 400);

  const result = await setAnnouncement(
    String(body.text ?? ''),
    body.type ?? 'info',
    !!body.on,
    g.session.name
  );
  if (!result.ok) return json({ success: false, error: result.error }, 502);
  await appendAudit(g.session.name, body.on ? 'announce' : 'announce-off');
  return json({ success: true, announcement: await getAnnouncement() });
}
