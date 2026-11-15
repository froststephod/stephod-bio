import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  DEMO_DISCORD_USERS,
  createOrGetProfileForDiscordUser,
  findProfileByDiscordId,
} from '@/lib/auth';
import { getProfile } from '@/lib/storage';
import { AuthUser } from '@/types/profile';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const session: AuthUser = JSON.parse(sessionCookie);
    if (!session || !session.id) {
      return NextResponse.json({ authenticated: false });
    }

    const profile = getProfile(session.profileUsername);
    if (!profile) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      profile,
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, customUsername } = body;

    let discordUser: { id: string; username: string; globalName?: string; avatar?: string } | null = null;

    if (action === 'demo_login') {
      const demo = DEMO_DISCORD_USERS.find((u) => u.username === userId || u.id === userId) || DEMO_DISCORD_USERS[0];
      discordUser = {
        id: demo.id,
        username: demo.username,
        globalName: demo.globalName,
        avatar: demo.avatar,
      };
    } else if (action === 'custom_discord') {
      const clean = (customUsername || 'guest').toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const randomId = '100' + Math.floor(Math.random() * 8999999999 + 1000000000);
      discordUser = {
        id: randomId,
        username: clean,
        globalName: clean.charAt(0).toUpperCase() + clean.slice(1) + ' ⚡',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`,
      };
    }

    if (!discordUser) {
      return NextResponse.json({ success: false, error: 'Invalid login request' }, { status: 400 });
    }

    // Bind / Create single profile for this Discord user
    const profile = createOrGetProfileForDiscordUser(discordUser);

    const sessionUser: AuthUser = {
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.globalName || discordUser.username,
      avatar: discordUser.avatar,
      profileUsername: profile.username,
    };

    const res = NextResponse.json({
      success: true,
      user: sessionUser,
      profile,
    });

    // Set cookie
    res.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionUser), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
