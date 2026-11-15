'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Shield, User, ArrowRight, Loader2, Plus, Zap } from 'lucide-react';
import { DEMO_DISCORD_USERS } from '@/lib/auth-constants';

interface Props {
  onLoginSuccess: (user: any, profile: any) => void;
}

export default function DiscordLoginScreen({ onLoginSuccess }: Props) {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleDemoLogin = async (username: string) => {
    setLoadingUser(username);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_login', userId: username }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.profile);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error during login');
    } finally {
      setLoadingUser(null);
    }
  };

  const handleCustomLogin = async () => {
    if (!customUsername.trim()) return;
    setLoadingUser('custom');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'custom_discord', customUsername: customUsername.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.profile);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error during login');
    } finally {
      setLoadingUser(null);
    }
  };

  const handleOfficialDiscordOAuth = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#5865F2]/20 via-cyan-500/15 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0e1017]/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-[#5865F2] rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#090a10] border border-white/20 flex items-center justify-center shadow-xl">
              <Image
                src="/logo.png"
                alt="STEPHOD"
                width={44}
                height={44}
                className="object-contain filter drop-shadow-[0_0_10px_#00d2ff]"
              />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>STEPHOD</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                BIO LINK
              </span>
            </h1>
            <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
              เข้าสู่ระบบด้วย Discord เพื่อจัดการหน้าโปรไฟล์ส่วนตัวของคุณ (1 บัญชี = 1 โปรไฟล์)
            </p>
          </div>
        </div>

        {/* Discord Primary Login Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOfficialDiscordOAuth}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(88,101,242,0.4)] group"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
            </svg>
            <span>เข้าสู่ระบบด้วย Discord</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0e1017] px-3 text-[10px] font-mono uppercase text-white/40 tracking-wider">
            หรือทดสอบเข้าสู่ระบบทันที (Demo)
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Instant Account Switcher for Testing */}
        <div className="space-y-2">
          <p className="text-[11px] text-white/50 text-center">
            เลือกล็อกอินเป็นบัญชีตัวอย่างเพื่อทดสอบระบบคนละโปรไฟล์:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_DISCORD_USERS.map((demo) => {
              const isLoading = loadingUser === demo.username;
              return (
                <button
                  key={demo.id}
                  type="button"
                  disabled={!!loadingUser}
                  onClick={() => handleDemoLogin(demo.username)}
                  className="w-full p-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 flex items-center justify-between transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={demo.avatar}
                      alt={demo.username}
                      className="w-8 h-8 rounded-full border border-white/20 object-cover"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {demo.globalName}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        @{demo.username} • ลิงก์: /{demo.profileUsername}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>เข้าสู่ระบบ</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Create new Friend Profile / Custom Discord */}
          <div className="pt-2">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-400 text-xs text-white/60 hover:text-white flex items-center justify-center gap-2 transition-all font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ ทดสอบสร้างเพื่อนใหม่ (เช่น mew, bank)</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-black/50 border border-white/15 space-y-2">
                <label className="block text-[11px] text-white/70">
                  พิมพ์ชื่อผู้ใช้ Discord ของเพื่อน:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. mew, bank, player1"
                    className="flex-1 bg-black/70 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!customUsername.trim() || !!loadingUser}
                    onClick={handleCustomLogin}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {loadingUser === 'custom' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>สร้าง & เข้าใช้</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security / Feature Guarantee */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> 1 คน = 1 โปรไฟล์
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> แยกสิทธิ์แก้ไขอิสระ
          </span>
        </div>
      </div>
    </div>
  );
}
