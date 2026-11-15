import { NextRequest, NextResponse } from 'next/server';
import { incrementLikes, getProfile } from '@/lib/storage';

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const profile = getProfile(username);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const likes = incrementLikes(username);
    return NextResponse.json({ success: true, likes });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to like profile' }, { status: 500 });
  }
}
