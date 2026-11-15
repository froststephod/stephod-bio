import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getProfileAsync, incrementViews, saveProfile } from '@/lib/storage';
import { USER_SESSION_COOKIE, parseSessionCookie, createDefaultProfileForUser } from '@/lib/user-auth';
import { getAnnouncement } from '@/lib/admin';
import ProfileView from '@/components/ProfileView';
import ProfileFallbackClient from '@/components/ProfileFallbackClient';
import SuspendedAccountView from '@/components/SuspendedAccountView';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfileAsync(params.username);
  if (!profile) {
    return {
      title: `${params.username} | STEPHOD Bio`,
    };
  }

  if (profile.banned) {
    return {
      title: `บัญชีถูกระงับ (@${profile.username}) | STEPHOD Bio`,
      description: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ',
    };
  }

  return {
    title: `${profile.displayName} (@${profile.username})`,
    description: profile.bio || `Check out ${profile.displayName}'s bio profile`,
    openGraph: {
      title: `${profile.displayName} (@${profile.username})`,
      description: profile.bio,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = params;
  let profile = await getProfileAsync(username);
  const announcement = await getAnnouncement();

  // If profile not yet found on this serverless instance, check session cookie
  if (!profile) {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(USER_SESSION_COOKIE)?.value;
      if (sessionCookie) {
        const session = parseSessionCookie(sessionCookie);
        if (
          session &&
          (session.profileUsername?.toLowerCase() === username.toLowerCase() ||
            session.username?.toLowerCase() === username.toLowerCase())
        ) {
          const defaultProf = createDefaultProfileForUser(session.username, session.globalName || session.displayName || session.username);
          profile = saveProfile(defaultProf);
        }
      }

      // Check cached profile cookie
      if (!profile) {
        const cachedCookie = cookieStore.get(`stephod_p_${username.toLowerCase()}`)?.value;
        if (cachedCookie) {
          const parsed = JSON.parse(decodeURIComponent(cachedCookie));
          if (parsed && parsed.username) {
            profile = saveProfile(parsed);
          }
        }
      }
    } catch {
      // Continue to client fallback
    }
  }

  if (!profile) {
    return (
      <>
        <AnnouncementBanner announcement={announcement} />
        <ProfileFallbackClient username={username} />
      </>
    );
  }

  // Account suspended / banned check
  if (profile.banned) {
    return (
      <>
        <AnnouncementBanner announcement={announcement} />
        <SuspendedAccountView
          username={profile.username}
          banReason={profile.banReason}
          bannedAt={profile.bannedAt}
        />
      </>
    );
  }

  // Increment view count
  incrementViews(username);

  return (
    <>
      <AnnouncementBanner announcement={announcement} />
      <ProfileView profile={profile} />
    </>
  );
}
