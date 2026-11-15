import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, saveProfile } from '@/lib/storage';
import { ProfileData } from '@/types/profile';

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

    const saved = saveProfile({
      ...body,
      username: cleanUsername,
    });

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
