import { Metadata } from 'next';
import { getProfile, incrementViews } from '@/lib/storage';
import ProfileView from '@/components/ProfileView';

export const dynamic = 'force-dynamic';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = getProfile(params.username);
  if (!profile) {
    return {
      title: 'Profile Not Found | Yura Bio',
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

export default function UserProfilePage({ params }: Props) {
  const { username } = params;
  const profile = getProfile(username);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-4">
          <span className="text-4xl">🛸</span>
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-sm text-white/50">
            ยังไม่มีผู้ใช้ชื่อ <span className="font-mono text-purple-400">@{username}</span> ในระบบ
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={`/dashboard`}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold transition-all shadow-lg shadow-purple-600/30"
            >
              สร้างโปรไฟล์ชื่อนี้เลย
            </a>
            <a
              href="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all"
            >
              กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Increment view count
  incrementViews(username);

  return <ProfileView profile={profile} />;
}
