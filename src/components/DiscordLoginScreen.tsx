'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: any, profile: any) => void;
}

export default function DiscordLoginScreen({ onLoginSuccess }: Props) {
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('discord_setup_required') === 'true') {
        setSetupRequired(true);
      }
    }
  }, []);

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

        {/* Warning if Discord keys not set yet */}
        {setupRequired && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold">ยังไม่ได้ใส่ Discord Client ID & Secret</p>
              <p className="text-[11px] text-amber-300/80">
                ให้นำ <b>Client ID</b> และ <b>Client Secret</b> จาก Discord Developer Portal ไปใส่ใน <code>.env.local</code> หรือใน Vercel Environment Variables ครับ
              </p>
            </div>
          </div>
        )}

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
