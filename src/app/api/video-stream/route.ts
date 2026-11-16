import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Missing or invalid video url' }, { status: 400 });
    }

    const clientRange = req.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    if (clientRange) {
      fetchHeaders['Range'] = clientRange;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
    });

    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', 'inline');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (upstreamRes.headers.get('content-range')) {
      headers.set('Content-Range', upstreamRes.headers.get('content-range')!);
    }
    if (upstreamRes.headers.get('content-length')) {
      headers.set('Content-Length', upstreamRes.headers.get('content-length')!);
    }

    const statusCode = upstreamRes.status === 206 ? 206 : 200;

    return new NextResponse(upstreamRes.body as any, {
      status: statusCode,
      headers,
    });
  } catch (err: any) {
    console.error('Video stream proxy error:', err);
    return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
  }
}
