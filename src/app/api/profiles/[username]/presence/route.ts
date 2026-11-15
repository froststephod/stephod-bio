import { NextRequest, NextResponse } from 'next/server';
import { recordPresence, getLiveViewers, getProfile } from '@/lib/storage';

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

    const liveViewers = getLiveViewers(username);
    return NextResponse.json({
      success: true,
      username,
      liveViewers,
      totalViews: profile.views || 0,
      likes: profile.likes || 0,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch presence' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await req.json().catch(() => ({}));
    const { visitorId, isEnter } = body;

    const vId = visitorId || req.ip || 'anonymous_' + Math.random().toString(36).substring(2, 8);
    const result = recordPresence(username, vId, !!isEnter);

    return NextResponse.json({
      success: true,
      username,
      liveViewers: result.liveViewers,
      totalViews: result.totalViews,
      isNewVisit: result.isNewVisit,
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update presence' }, { status: 500 });
  }
}
