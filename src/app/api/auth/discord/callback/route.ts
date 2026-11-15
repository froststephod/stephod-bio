import { NextRequest, NextResponse } from 'next/server';
import { createOrGetProfileForDiscordUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { AuthUser } from '@/types/profile';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/discord/callback`;

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard?error=no_code`);
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${origin}/dashboard?error=credentials_missing`);
    }

    // Exchange code for token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/dashboard?error=token_failed`);
    }

    // Fetch user details from Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userRes.json();

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordUser.id) % 5)}.png`;

    const profile = createOrGetProfileForDiscordUser({
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
    });

    const sessionUser: AuthUser = {
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
      profileUsername: profile.username,
    };

    const res = NextResponse.redirect(`${origin}/dashboard`);
    res.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionUser), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    res.cookies.set(`stephod_p_${profile.username.toLowerCase()}`, encodeURIComponent(JSON.stringify(profile)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return res;
  } catch (err) {
    console.error('Discord OAuth error:', err);
    return NextResponse.redirect(`${origin}/dashboard?error=oauth_exception`);
  }
}
