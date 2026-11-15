import { NextRequest } from 'next/server';
import { ADMIN_BADGE_PRESETS, listUsers } from '@/lib/admin';
import { guard, json } from '@/lib/admin-http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const g = await guard(req);
  if (g.res) return g.res;

  const { users, indexComplete } = await listUsers();
  const totalViews = users.reduce((s, u) => s + u.views, 0);
  const totalLikes = users.reduce((s, u) => s + u.likes, 0);

  return json({
    success: true,
    users,
    indexComplete,
    badgePresets: ADMIN_BADGE_PRESETS,
    stats: {
      totalUsers: users.length,
      bannedUsers: users.filter((u) => u.banned).length,
      totalViews,
      totalLikes,
      top: users.slice(0, 5).map((u) => ({ username: u.username, displayName: u.displayName, views: u.views })),
    },
  });
}
