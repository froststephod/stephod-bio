import { NextRequest, NextResponse } from 'next/server';
import { getDiscordOAuthUrl } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/discord/callback`;

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId || clientId === 'YOUR_DISCORD_CLIENT_ID') {
    // If Discord Client ID is not configured yet, redirect to dashboard with param to open test login
    return NextResponse.redirect(`${origin}/dashboard?discord_setup_required=true`);
  }

  const url = getDiscordOAuthUrl(redirectUri);
  return NextResponse.redirect(url);
}
