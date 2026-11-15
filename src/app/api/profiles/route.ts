import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, saveProfile, pushProfileToCloud, getProfileAsync } from '@/lib/storage';
import { ProfileData } from '@/types/profile';
import { preserveAdminFields } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = getAllProfiles();
    return NextResponse.json({ success: true, profiles });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProfileData;
    if (!body || !body.username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // sanitize username
    const cleanUsername = body.username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Invalid username format' }, { status: 400 });
    }

    // Check if account is banned or has admin badges
    const existing = await getProfileAsync(cleanUsername);
    if (existing?.banned) {
      return NextResponse.json(
        {
          success: false,
          error: `บัญชีนี้ถูกระงับการใช้งาน ${existing.banReason ? `(${existing.banReason})` : ''}`,
        },
        { status: 403 }
      );
    }

    // Merge and preserve admin badges & flags
    const sanitized: ProfileData = {
      ...body,
      username: cleanUsername,
    };
    const protectedProfile = preserveAdminFields(sanitized, existing);

    // Must await: serverless functions can be frozen right after responding,
    // which would silently drop the cloud save and cause stale/flip-flopping data.
    const saved = saveProfile(protectedProfile);
    await pushProfileToCloud(saved);

    const res = NextResponse.json({ success: true, profile: saved });
    res.cookies.set(`stephod_p_${cleanUsername}`, encodeURIComponent(JSON.stringify(saved)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save profile' }, { status: 500 });
  }
}
