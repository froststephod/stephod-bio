'use client';

import React, { useEffect, useState } from 'react';
import { ProfileData } from '@/types/profile';
import ProfileView from './ProfileView';
import { ArrowRight } from 'lucide-react';

interface Props {
  username: string;
}

export default function ProfileFallbackClient({ username }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cleanKey = username.toLowerCase().trim();

      // 1. Try local storage cache from dashboard
      const cached = localStorage.getItem('stephod_profile_' + cleanKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.username) {
          setProfile(parsed);
          setLoading(false);
          return;
        }
      }

      // 2. Try fetching from api
      fetch(`/api/profiles`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.profiles && data.profiles[cleanKey]) {
            setProfile(data.profiles[cleanKey]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-white font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>กำลังโหลดโปรไฟล์ @{username}...</span>
        </div>
      </div>
    );
  }

  if (profile) {
    return <ProfileView profile={profile} />;
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-4">
        <span className="text-4xl">🛸</span>
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-sm text-white/50">
          ยังไม่มีผู้ใช้ชื่อ <span className="font-mono text-emerald-400">@{username}</span> ในระบบ
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
          >
            <span>สร้างโปรไฟล์ชื่อนี้เลย</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all flex items-center justify-center"
          >
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}
