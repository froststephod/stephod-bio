import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getProfileAsync, incrementViews, saveProfile } from '@/lib/storage';
import { SESSION_COOKIE_NAME, createOrGetProfileForDiscordUser } from '@/lib/auth';
import ProfileView from '@/components/ProfileView';
import ProfileFallbackClient from '@/components/ProfileFallbackClient';

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

  // If profile not yet found on this serverless instance, check session cookie
  if (!profile) {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (sessionCookie) {
        const session = JSON.parse(sessionCookie);
        if (
          session &&
          (session.profileUsername?.toLowerCase() === username.toLowerCase() ||
            session.username?.toLowerCase() === username.toLowerCase())
        ) {
          profile = createOrGetProfileForDiscordUser(session);
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
    return <ProfileFallbackClient username={username} />;
  }

  // Increment view count
  incrementViews(username);

  return <ProfileView profile={profile} />;
}
