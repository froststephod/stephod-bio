import { NextRequest, NextResponse } from 'next/server';
import { getProfile, incrementViews } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const profile = getProfile(username);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check query params if should increment view
    const url = new URL(req.url);
    if (url.searchParams.get('view') === '1') {
      const newViews = incrementViews(username);
      profile.views = newViews;
    }

    return NextResponse.json({ success: true, profile });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
