'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, AlertCircle } from 'lucide-react';

interface Props {
  username: string;
  banReason?: string;
  bannedAt?: string;
}

export default function SuspendedAccountView({ username, banReason, bannedAt }: Props) {
  const formattedDate = bannedAt
    ? new Date(bannedAt).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#07080e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Suspended Card */}
      <div className="w-full max-w-md bg-white/[0.03] border border-red-500/30 backdrop-blur-xl rounded-3xl p-8 relative z-10 shadow-[0_0_60px_rgba(239,68,68,0.15)] text-center flex flex-col items-center">
        {/* Pulsing Icon Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-950/40 border border-red-500/40 flex items-center justify-center relative z-10 text-red-400">
            <ShieldAlert className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          บัญชีนี้ถูกระงับการใช้งาน
        </h1>
        <p className="text-white/60 text-sm mb-6">
          โปรไฟล์ <span className="text-red-400 font-mono font-medium">@{username}</span> ถูกระงับชั่วคราวโดยผู้ดูแลระบบ
        </p>

        {/* Reason Box */}
        <div className="w-full bg-red-950/20 border border-red-500/20 rounded-2xl p-4 text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>เหตุผลในการระงับ</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-light">
            {banReason || 'ฝ่าฝืนข้อกำหนดการใช้งานหรือนโยบายความปลอดภัยของระบบ'}
          </p>
          {formattedDate && (
            <div className="mt-3 pt-3 border-t border-red-500/10 text-[11px] text-white/40">
              ระงับเมื่อ: {formattedDate}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก STEPHOD
        </Link>

        <div className="mt-6 text-[11px] text-white/30">
          STEPHOD Bio Security & Moderation
        </div>
      </div>
    </div>
  );
}
