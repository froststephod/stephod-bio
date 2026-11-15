import { NextRequest, NextResponse } from 'next/server';
import { getProfileAsync, incrementViews } from '@/lib/storage';
import { readChunkMeta } from '@/lib/cloud-kv';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const profile = await getProfileAsync(username);
    if (!profile) {
      const meta = await readChunkMeta(`pf_${username.toLowerCase()}`);
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
        debug: {
          username,
          meta,
          activeToken: process.env.CLOUD_DB_TOKEN ? 'env-set' : 'default',
        },
      }, { status: 404 });
    }

    // Check query params if should increment view
    const url = new URL(req.url);
    if (url.searchParams.get('view') === '1') {
      const newViews = incrementViews(username);
      profile.views = newViews;
    }

    const res = NextResponse.json({ success: true, profile });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('CDN-Cache-Control', 'no-store');
    res.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
