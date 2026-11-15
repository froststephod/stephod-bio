import { NextRequest, NextResponse } from 'next/server';
import {
  USER_SESSION_COOKIE,
  createSessionCookie,
  parseSessionCookie,
  registerUser,
  loginUser,
} from '@/lib/user-auth';
import { getProfileAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(USER_SESSION_COOKIE)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const session = parseSessionCookie(sessionCookie);
    if (!session || !session.username) {
      return NextResponse.json({ authenticated: false });
    }

    const profile = await getProfileAsync(session.profileUsername || session.username);
    if (!profile) {
      return NextResponse.json({ authenticated: false });
    }

    if (profile.banned) {
      const res = NextResponse.json({
        authenticated: false,
        banned: true,
        reason: profile.banReason,
      });
      res.cookies.delete(USER_SESSION_COOKIE);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
      profile,
    });
  } catch (err) {
    console.error('Session check error:', err);
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, displayName, password } = body;

    if (action === 'register') {
      const result = await registerUser(username || '', displayName || '', password || '');
      if (!result.ok) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      const res = NextResponse.json({
        success: true,
        user: result.user,
        profile: result.profile,
      });

      // Set auth session cookie
      res.cookies.set(USER_SESSION_COOKIE, createSessionCookie(result.user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        httpOnly: false, // Accessible to client if needed
      });

      // Set profile cache cookie
      res.cookies.set(
        `stephod_p_${result.profile.username.toLowerCase()}`,
        encodeURIComponent(JSON.stringify(result.profile)),
        {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        }
      );

      return res;
    }

    if (action === 'login') {
      let result = await loginUser(username || '', password || '');

      // Smart seamless registration: if account does not exist yet, auto-register with this password
      if (!result.ok && result.error.includes('ไม่พบบัญชี')) {
        const cleanUser = (username || '').toLowerCase().trim();
        const autoName = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);
        const regResult = await registerUser(cleanUser, autoName, password || '');
        if (regResult.ok) {
          result = regResult;
        } else {
          return NextResponse.json({ success: false, error: regResult.error }, { status: 400 });
        }
      } else if (!result.ok) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      const res = NextResponse.json({
        success: true,
        user: result.user,
        profile: result.profile,
      });

      // Set auth session cookie
      res.cookies.set(USER_SESSION_COOKIE, createSessionCookie(result.user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });

      // Set profile cache cookie
      res.cookies.set(
        `stephod_p_${result.profile.username.toLowerCase()}`,
        encodeURIComponent(JSON.stringify(result.profile)),
        {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        }
      );

      return res;
    }

    return NextResponse.json({ success: false, error: 'คำสั่งไม่ถูกต้อง (Invalid action)' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth request error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'เกิดข้อผิดพลาดในการประมวลผล' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  res.cookies.delete(USER_SESSION_COOKIE);
  return res;
}
