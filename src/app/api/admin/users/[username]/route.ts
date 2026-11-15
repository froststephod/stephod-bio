import { NextRequest } from 'next/server';
import { adminDeleteUser, adminUpdateUser, appendAudit, UserPatch } from '@/lib/admin';
import { cleanSlug, guard, json, readJson } from '@/lib/admin-http';
import { getProfileStateAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

type Ctx = { params: { username: string } };

// GET: full profile for the edit dialog
export async function GET(req: NextRequest, { params }: Ctx) {
  const g = await guard(req);
  if (g.res) return g.res;
  const username = cleanSlug(params.username);
  const state = await getProfileStateAsync(username);
  if (!state.profile) return json({ success: false, error: 'ไม่พบโปรไฟล์นี้' }, 404);
  return json({ success: true, profile: state.profile });
}

// PATCH: edit fields / ban / unban / grant or revoke badges
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await guard(req);
  if (g.res) return g.res;
  const username = cleanSlug(params.username);
  const body = await readJson<UserPatch>(req);
  if (!body) return json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, 400);

  const patch: UserPatch = {
    displayName: body.displayName,
    bio: body.bio,
    occupation: body.occupation,
    location: body.location,
    banned: typeof body.banned === 'boolean' ? body.banned : undefined,
    banReason: body.banReason,
    addBadge: body.addBadge,
    removeBadge: body.removeBadge,
  };

  const result = await adminUpdateUser(username, patch);
  if (!result.ok) return json({ success: false, error: result.error }, result.status);

  for (const action of result.actions) {
    await appendAudit(g.session.name, action, username);
  }
  return json({ success: true, profile: result.profile });
}

// DELETE: remove a profile (tombstone in the cloud store)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const g = await guard(req);
  if (g.res) return g.res;
  const username = cleanSlug(params.username);
  const ok = await adminDeleteUser(username);
  if (!ok) return json({ success: false, error: 'ลบไม่สำเร็จ ลองใหม่อีกครั้ง' }, 502);
  await appendAudit(g.session.name, 'delete', username);
  return json({ success: true });
}
