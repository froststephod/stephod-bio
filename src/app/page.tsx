import Link from 'next/link';
import { Sparkles, Music, ShieldCheck, ArrowRight, Eye, Layers, Sliders, ExternalLink } from 'lucide-react';
import { getAllProfiles } from '@/lib/storage';
import { siteConfig } from '@/config/site';
import { getAnnouncement } from '@/lib/admin';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profilesMap = getAllProfiles();
  const profiles = Object.values(profilesMap);
  const announcement = await getAnnouncement();

  return (
    <div className="min-h-screen bg-[#07080e] text-white selection:bg-purple-500/30 selection:text-white flex flex-col relative overflow-hidden">
      <AnnouncementBanner announcement={announcement} />
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-3/4 left-1/3 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-white/5 px-6 md:px-12 flex items-center justify-between z-20 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
            <img src="/logo.png" alt="STEPHOD" className="w-full h-full object-contain filter drop-shadow-[0_0_6px_#00d2ff]" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider font-mono">
            STEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">HOD</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Dashboard ปรับแต่ง</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Aesthetic Bio-Link Platform • STEPHOD.BIO</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none">
          สร้างหน้าโปรไฟล์สุดเท่ <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400">
            แพลตฟอร์ม STEPHOD
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">
          รวมทุกลิงก์โซเชียล การ์ดกระจกใสสุดหรู (Glassmorphism), เสียงเพลงคลอพื้นหลัง (BGM/Spotify),
          เอฟเฟกต์ Click to Enter และเชื่อมต่อสถานะ Discord สดๆ ปรับแต่งได้ง่ายผ่านหน้า Dashboard โดยไม่ต้องเขียนโค้ด
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>เข้าสู่ระบบ Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={profiles.length > 0 ? `/${profiles[0].username}` : '/dashboard'}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-white/50" />
            <span>{profiles.length > 0 ? 'ดูตัวอย่างโปรไฟล์' : 'สร้างโปรไฟล์แรกของคุณ'}</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Click to Enter & Audio</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              เล่นเพลง BGM ที่คุณชอบเมื่อผู้เข้าชมกดเข้าสู่หน้าเว็บ พร้อมแถบควบคุมเสียงและ Visualizer
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Glassmorphism & Glow</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              ดีไซน์การ์ดโปรไฟล์สไตล์ดาร์ก ล้อมรอบด้วยแสงนีออน ปรับแต่งความเบลอ ความทึบ และพื้นหลังอนุภาค 3D ได้สดๆ
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Multi-Profile & Dashboard</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              สร้าง URL ให้เพื่อนๆ แยกกันได้ไม่จำกัด เช่น /pun, /alex พร้อมระบบ Export/Import JSON
            </p>
          </div>
        </div>

        {/* Showcase of Existing Profiles */}
        <div className="mt-20 w-full text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">โปรไฟล์ที่มีในระบบ</h2>
              <p className="text-xs text-white/50 mt-1">คลิกเพื่อดูหน้าโปรไฟล์ของแต่ละคน</p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
            >
              <span>+ เพิ่มโปรไฟล์ใหม่</span>
            </Link>
          </div>

          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <Link
                  key={p.username}
                  href={`/${p.username}`}
                  className="group p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-3.5 relative overflow-hidden"
                >
                  <img
                    src={p.avatarUrl || '/logo.png'}
                    alt={p.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-white/20 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                        {p.displayName}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 font-mono block truncate">
                      /{p.username}
                    </span>
                  </div>
                  <div className="text-white/30 group-hover:text-cyan-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] text-center text-white/40 text-xs">
              ยังไม่มีโปรไฟล์ในระบบ เข้าสู่ระบบ Dashboard เพื่อเป็นคนแรกที่สร้างโปรไฟล์!
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30 font-mono">
        <p>STEPHOD Platform • Made for Creators, Gamers & Developers</p>
      </footer>
    </div>
  );
}
