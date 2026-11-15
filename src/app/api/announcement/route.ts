import { NextResponse } from 'next/server';
import { getAnnouncement } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public: the active site-wide announcement (if any)
export async function GET() {
  const a = await getAnnouncement();
  const active = a && a.on && a.text ? { text: a.text, type: a.type } : null;
  return NextResponse.json({ announcement: active }, { headers: { 'Cache-Control': 'no-store' } });
}
