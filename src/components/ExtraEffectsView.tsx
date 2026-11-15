'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Pencil,
  Eye,
  Sliders,
  Layers,
  MousePointer,
  Film,
  Flame,
  Volume2,
  Check,
  X,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { ProfileData, ExtraEffectsConfig } from '@/types/profile';

interface Props {
  profile: ProfileData;
  onUpdateProfile: (updated: ProfileData) => void;
  onSave: () => void;
  saving?: boolean;
}

// 34 Name Effects - All 100% unlocked and available
const NAME_EFFECTS_LIST = [
  { id: 'typewriter', name: 'Typewriter', sub: 'รองรับหลายคำ', tag: 'typewriter' },
  { id: 'morph', name: 'Morph', sub: 'รองรับหลายคำ', tag: 'morph' },
  { id: 'wave', name: 'Wave', sub: 'คลื่นพริ้วไหว', tag: 'wave', icon: '🌊' },
  { id: 'bounce', name: 'Bounce', sub: 'เด้งดึ๋งนุ่มนวล', tag: 'bounce', icon: '⚡' },
  { id: 'pulse', name: 'Pulse', sub: 'จังหวะชีพจร', tag: 'pulse', icon: '💓' },
  { id: 'gold', name: 'Metallic Gold', sub: 'ทองคำหรูหรา', tag: 'gold', icon: '👑' },
  { id: 'neon-cyan', name: 'Neon Cyan', sub: 'ฟ้าไซเบอร์พังค์', tag: 'cyan', icon: '💎' },
  { id: 'aura', name: 'Aura Flow', sub: 'ออร่าไล่เฉดสี', tag: 'aura', icon: '✨' },
  { id: 'cherry-blossoms', name: 'Cherry Blossoms', sub: 'กลีบซากุระร่วง', tag: 'cherry', icon: '🌸' },
  { id: 'shimmer', name: 'Shimmer', sub: 'แสงเงาวิ่งผ่าน', tag: 'shimmer' },
  { id: 'shine', name: 'Shine', sub: 'วิบวับเปล่งประกาย', tag: 'shine' },
  { id: 'glow', name: 'Glow', sub: 'เรืองแสงนีออน', tag: 'glow' },
  { id: 'shake', name: 'Shake', sub: 'สั่นไหว', tag: 'shake' },
  { id: 'glitch', name: 'Glitch', sub: 'ไซเบอร์กลิตช์', tag: 'glitch' },
  { id: 'flames', name: 'Flames', sub: 'ไฟลุกโชน', tag: 'flames', icon: '🔥' },
  { id: 'lightning', name: 'Lightning', sub: 'สายฟ้าฟาด', tag: 'lightning', icon: '⚡' },
  { id: 'scramble', name: 'S#[&mbD@', sub: 'แฮกเกอร์ถอดรหัส', tag: 'scramble' },
  { id: 'rainbow', name: 'Rainbow', sub: 'สีรุ้งเคลื่อนไหว', tag: 'rainbow', icon: '🌈' },
  { id: 'flicker', name: 'Flicker', sub: 'นีออนกะพริบ', tag: 'flicker' },
  { id: 'flip', name: 'Flip', sub: 'พลิก 3D', tag: 'flip' },
  { id: 'fuzzy', name: 'Fuzzy', sub: 'เบลอสั่นไหว', tag: 'fuzzy' },
  { id: 'shuffle', name: 'Shuffle', sub: 'สลับอักษร', tag: 'shuffle' },
  { id: 'loading', name: 'Loading', sub: 'โหลดจุดวิ่ง', tag: 'loading' },
  { id: 'white-sparkles', name: 'White Sparkles', sub: 'ดาวขาว', tag: 'sparkles' },
  { id: 'rainbow-sparkles', name: 'Rainbow Sparkles', sub: 'ดาวรุ้ง', tag: 'sparkles' },
  { id: 'green-sparkles', name: 'Green Sparkles', sub: 'ดาวเขียว', tag: 'sparkles' },
  { id: 'black-sparkles', name: 'Black Sparkles', sub: 'ดาวดำ', tag: 'sparkles' },
  { id: 'lightblue-sparkles', name: 'Lightblue Sparkles', sub: 'ดาวฟ้า', tag: 'sparkles' },
  { id: 'red-sparkles', name: 'Red Sparkles', sub: 'ดาวแดง', tag: 'sparkles' },
  { id: 'blue-sparkles', name: 'Blue Sparkles', sub: 'ดาวน้ำเงิน', tag: 'sparkles' },
  { id: 'orange-sparkles', name: 'Orange Sparkles', sub: 'ดาวส้ม', tag: 'sparkles' },
  { id: 'pink-sparkles', name: 'Pink Sparkles', sub: 'ดาวชมพู', tag: 'sparkles' },
  { id: 'purple-sparkles', name: 'Purple Sparkles', sub: 'ดาวม่วง', tag: 'sparkles' },
  { id: 'yellow-sparkles', name: 'Yellow Sparkles', sub: 'ดาวเหลือง', tag: 'sparkles' },
];

// 18 Bio Effects - All 100% unlocked and available
const BIO_EFFECTS_LIST = [
  { id: 'typewriter', name: 'Typewriter', sub: 'รองรับหลายคำ', tag: 'typewriter' },
  { id: 'morph', name: 'Morph', sub: 'รองรับหลายคำ', tag: 'morph' },
  { id: 'wave', name: 'Wave', sub: 'คลื่นพริ้วไหว', tag: 'wave' },
  { id: 'bounce', name: 'Bounce', sub: 'เด้งดึ๋งนุ่มนวล', tag: 'bounce' },
  { id: 'pulse', name: 'Pulse', sub: 'จังหวะชีพจร', tag: 'pulse' },
  { id: 'gold', name: 'Metallic Gold', sub: 'ทองคำหรูหรา', tag: 'gold' },
  { id: 'neon-cyan', name: 'Neon Cyan', sub: 'ฟ้าไซเบอร์พังค์', tag: 'cyan' },
  { id: 'aura', name: 'Aura Flow', sub: 'ออร่าไล่เฉดสี', tag: 'aura' },
  { id: 'shimmer', name: 'Shimmer', sub: 'แสงเงาวิ่งผ่าน', tag: 'shimmer' },
  { id: 'shine', name: 'Shine', sub: 'วิบวับเปล่งประกาย', tag: 'shine' },
  { id: 'glow', name: 'Glow', sub: 'เรืองแสงนีออน', tag: 'glow' },
  { id: 'shake', name: 'Shake', sub: 'สั่นไหว', tag: 'shake' },
  { id: 'glitch', name: 'Glitch', sub: 'ไซเบอร์กลิตช์', tag: 'glitch' },
  { id: 'scramble', name: 'Scras]#!', sub: 'ถอดรหัสอักษร', tag: 'scramble' },
  { id: 'rainbow', name: 'Rainbow', sub: 'สีรุ้งเคลื่อนไหว', tag: 'rainbow' },
  { id: 'flicker', name: 'Flicker', sub: 'นีออนกะพริบ', tag: 'flicker' },
  { id: 'flip', name: 'Flip', sub: 'พลิก 3D', tag: 'flip' },
  { id: 'loading', name: 'Loading', sub: 'โหลดจุดวิ่ง', tag: 'loading' },
];

export default function ExtraEffectsView({ profile, onUpdateProfile, onSave, saving = false }: Props) {
  const currentEffects: ExtraEffectsConfig = profile.theme.extraEffects || {
    nameEffects: ['typewriter'],
    bioEffects: [],
    pageOverlay: 'none',
    cursorTrail: 'none',
    bgEffect: 'none',
    entranceAnimation: 'none',
    viewsAnimation: false,
    cardTilt: false,
    glowIcons: true,
    borderBeam: false,
    audioVisualizer: false,
  };

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [overlayModalOpen, setOverlayModalOpen] = useState(false);
  const [cursorModalOpen, setCursorModalOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [entranceModalOpen, setEntranceModalOpen] = useState(false);

  // Temporary selected for modal confirmation
  const [tempNameEffects, setTempNameEffects] = useState<string[]>(currentEffects.nameEffects || ['typewriter']);
  const [tempBioEffects, setTempBioEffects] = useState<string[]>(currentEffects.bioEffects || []);

  const updateEffects = (patch: Partial<ExtraEffectsConfig>) => {
    const updated = {
      ...currentEffects,
      ...patch,
    };
    onUpdateProfile({
      ...profile,
      theme: {
        ...profile.theme,
        extraEffects: updated,
      },
    });
  };

  // Toggle Name Effect (max 3)
  const handleToggleNameEffect = (id: string) => {
    if (tempNameEffects.includes(id)) {
      setTempNameEffects(tempNameEffects.filter((x) => x !== id));
    } else {
      if (tempNameEffects.length >= 3) {
        setTempNameEffects([...tempNameEffects.slice(1), id]);
      } else {
        setTempNameEffects([...tempNameEffects, id]);
      }
    }
  };

  // Toggle Bio Effect (max 2)
  const handleToggleBioEffect = (id: string) => {
    if (tempBioEffects.includes(id)) {
      setTempBioEffects(tempBioEffects.filter((x) => x !== id));
    } else {
      setTempBioEffects([id]);
    }
  };

  const confirmNameEffects = () => {
    updateEffects({ nameEffects: tempNameEffects });
    setNameModalOpen(false);
  };

  const confirmBioEffects = () => {
    updateEffects({ bioEffects: tempBioEffects });
    setBioModalOpen(false);
  };

  // Friendly Thai labels for feature cards
  const getOverlayLabel = (id?: string) => {
    switch (id) {
      case 'scanlines': return 'Scanlines (จอ CRT)';
      case 'vhs': return 'VHS Tape (เรโทร)';
      case 'grid': return 'Cyber Grid (ตาราง)';
      case 'vignette': return 'Vignette (ขอบมืด)';
      default: return 'ไม่มี';
    }
  };

  const getCursorLabel = (id?: string) => {
    switch (id) {
      case 'sparkles': return '✨ ประกายดาว (Sparkles)';
      case 'hearts': return '💖 หัวใจ (Hearts)';
      case 'stars': return '⭐ ดาวทอง (Stars)';
      case 'bubbles': return '🫧 ฟองสบู่ (Bubbles)';
      case 'smoke': return '💨 ควันนีออน (Smoke)';
      default: return 'ไม่มี';
    }
  };

  const getBgLabel = (id?: string) => {
    switch (id) {
      case 'sakura': return '🌸 ซากุระร่วง (Sakura)';
      case 'shooting-stars': return '🌠 ฝนดาวตก (Shooting Stars)';
      case 'fog-waves': return '🌫️ คลื่นหมอก (Cosmic Fog)';
      case 'digital-rain': return '🟢 ฝนดิจิทัล (Matrix Rain)';
      default: return 'ไม่มี';
    }
  };

  const getEntranceLabel = (id?: string) => {
    switch (id) {
      case 'fade-in': return 'Fade In (ค่อยๆ ปรากฏ)';
      case 'zoom': return 'Zoom In (ขยายตัวขึ้น)';
      case 'drop': return 'Drop In (หล่นลงมา)';
      case 'slide-up': return 'Slide Up (เลื่อนขึ้น)';
      case 'flip': return 'Flip 3D (พลิกตัวเปิด)';
      default: return 'ไม่มี';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Main Settings Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-white/10 bg-[#0d0f14] shadow-2xl relative space-y-5">
        {/* Title */}
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold tracking-tight">เอฟเฟกต์เสริม</h2>
        </div>

        {/* Info Tip Box */}
        <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-blue-500/25 flex items-start gap-3 text-xs text-blue-200">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-white block">เคล็ดลับ</span>
            <p className="text-[11px] text-blue-200/80 leading-relaxed">
              เอฟเฟกต์ข้อความที่เลือกใช้ได้หลายคำ ใช้ <code className="px-1.5 py-0.5 rounded bg-blue-900/50 text-cyan-300 font-mono font-bold">|||</code> คั่นคำ เช่น <span className="text-white font-mono">&quot;สวัสดี|||ยินดีต้อนรับ&quot;</span>
            </p>
          </div>
        </div>

        {/* 2 Big Dashed Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Selector 1: Name Effect */}
          <button
            type="button"
            onClick={() => {
              setTempNameEffects(currentEffects.nameEffects || ['typewriter']);
              setNameModalOpen(true);
            }}
            className="p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-emerald-500/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-start gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                {currentEffects.nameEffects && currentEffects.nameEffects.length > 0
                  ? currentEffects.nameEffects.map((e) => NAME_EFFECTS_LIST.find((n) => n.id === e)?.name || e).join(' + ')
                  : 'เลือกเอฟเฟกต์ชื่อ'}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">คลิกเพื่อเลือกเอฟเฟกต์ชื่อ (เลือกได้สูงสุด 3 แบบ)</div>
            </div>
          </button>

          {/* Selector 2: Bio Effect */}
          <button
            type="button"
            onClick={() => {
              setTempBioEffects(currentEffects.bioEffects || []);
              setBioModalOpen(true);
            }}
            className="p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-emerald-500/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-start gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                {currentEffects.bioEffects && currentEffects.bioEffects.length > 0
                  ? currentEffects.bioEffects.map((e) => BIO_EFFECTS_LIST.find((n) => n.id === e)?.name || e).join(' + ')
                  : 'เลือกเอฟเฟกต์ไบโอ'}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">คลิกเพื่อเลือกเอฟเฟกต์ข้อความไบโอ</div>
            </div>
          </button>
        </div>

        {/* Feature Cards Row (Overlay, Cursor, Background, Entrance) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Page Overlay */}
          <button
            type="button"
            onClick={() => setOverlayModalOpen(true)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/40 transition-all text-left space-y-1.5 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-emerald-400 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold truncate ${currentEffects.pageOverlay && currentEffects.pageOverlay !== 'none' ? 'text-emerald-300' : 'text-white'}`}>
                {getOverlayLabel(currentEffects.pageOverlay)}
              </div>
              <div className="text-[10px] text-white/40">โอเวอร์เลย์หน้าเพจ</div>
            </div>
          </button>

          {/* Card 2: Cursor Trail */}
          <button
            type="button"
            onClick={() => setCursorModalOpen(true)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/40 transition-all text-left space-y-1.5 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold truncate ${currentEffects.cursorTrail && currentEffects.cursorTrail !== 'none' ? 'text-emerald-300' : 'text-white'}`}>
                {getCursorLabel(currentEffects.cursorTrail)}
              </div>
              <div className="text-[10px] text-white/40">ร่องรอยเคอร์เซอร์</div>
            </div>
          </button>

          {/* Card 3: Background Effects */}
          <button
            type="button"
            onClick={() => setBgModalOpen(true)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/40 transition-all text-left space-y-1.5 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold truncate ${currentEffects.bgEffect && currentEffects.bgEffect !== 'none' ? 'text-emerald-300' : 'text-white'}`}>
                {getBgLabel(currentEffects.bgEffect)}
              </div>
              <div className="text-[10px] text-white/40">เอฟเฟกต์พื้นหลัง</div>
            </div>
          </button>

          {/* Card 4: Entrance Animation */}
          <button
            type="button"
            onClick={() => setEntranceModalOpen(true)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/40 transition-all text-left space-y-1.5 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-emerald-400 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold truncate ${currentEffects.entranceAnimation && currentEffects.entranceAnimation !== 'none' ? 'text-emerald-300' : 'text-white'}`}>
                {getEntranceLabel(currentEffects.entranceAnimation)}
              </div>
              <div className="text-[10px] text-white/40">แอนิเมชันตอนเปิดหน้า</div>
            </div>
          </button>
        </div>

        {/* Toggles Grid - Matching yura.lol aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {/* Toggle 1: แอนิเมชันยอดเข้าชม */}
          <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">แอนิเมชันยอดเข้าชม</span>
            </div>
            <button
              type="button"
              onClick={() => updateEffects({ viewsAnimation: !currentEffects.viewsAnimation })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                currentEffects.viewsAnimation ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  currentEffects.viewsAnimation ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: การ์ดเอียงตามเมาส์ */}
          <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">การ์ดเอียงตามเมาส์</span>
            </div>
            <button
              type="button"
              onClick={() => updateEffects({ cardTilt: !currentEffects.cardTilt })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                currentEffects.cardTilt ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  currentEffects.cardTilt ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: ไอคอนเรืองแสง */}
          <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">ไอคอนเรืองแสง</span>
            </div>
            <button
              type="button"
              onClick={() => updateEffects({ glowIcons: currentEffects.glowIcons === false ? true : false })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                currentEffects.glowIcons !== false ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  currentEffects.glowIcons !== false ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: แสงวิ่งตามขอบ */}
          <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">แสงวิ่งตามขอบ</span>
            </div>
            <button
              type="button"
              onClick={() => updateEffects({ borderBeam: !currentEffects.borderBeam })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                currentEffects.borderBeam ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  currentEffects.borderBeam ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 5: วิชวลไลเซอร์เสียง */}
          <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">วิชวลไลเซอร์เสียง</span>
            </div>
            <button
              type="button"
              onClick={() => updateEffects({ audioVisualizer: !currentEffects.audioVisualizer })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                currentEffects.audioVisualizer ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  currentEffects.audioVisualizer ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Typewriter & Text Transition Speed Controller */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">ความเร็วสลับข้อความ & พิมพ์ดีด</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {(currentEffects.typewriterSpeed || profile.theme.typewriterSpeed || 35) <= 22
                ? '🚀 ขั้นสุด (Turbo)'
                : (currentEffects.typewriterSpeed || profile.theme.typewriterSpeed || 35) <= 40
                ? '⚡ เร็วทันใจ (Fast)'
                : '⏱️ ปานกลาง (Normal)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '⚡ เร็วทันใจ', speed: 35, pause: 500, desc: 'พิมพ์เร็ว สลับไว (แนะนำ)' },
              { label: '🚀 เร็วขั้นสุด', speed: 18, pause: 300, desc: 'พิมพ์เทอร์โบ สลับทันที' },
              { label: '⏱️ ปานกลาง', speed: 70, pause: 1000, desc: 'จังหวะมาตรฐาน' },
            ].map((opt) => {
              const currentSpeed = currentEffects.typewriterSpeed || profile.theme.typewriterSpeed || 35;
              const active = currentSpeed === opt.speed;
              return (
                <button
                  key={opt.speed}
                  type="button"
                  onClick={() => {
                    updateEffects({ typewriterSpeed: opt.speed, pauseDuration: opt.pause });
                    onUpdateProfile({
                      ...profile,
                      theme: {
                        ...profile.theme,
                        typewriterSpeed: opt.speed,
                        extraEffects: {
                          ...currentEffects,
                          typewriterSpeed: opt.speed,
                          pauseDuration: opt.pause,
                        },
                      },
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{opt.label}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 truncate">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Bright Green Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide text-black bg-[#84cc16] hover:bg-[#65a30d] active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>บันทึก</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: เลือกเอฟเฟกต์ชื่อ (All Unlocked)
         ======================================================== */}
      {nameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>เลือกเอฟเฟกต์ชื่อ</span>
                </div>
                <p className="text-xs text-white/50">
                  เลือกได้สูงสุด 3 เอฟเฟกต์สำหรับชื่อ (ปลดล็อกฟรี 100% ทุกเอฟเฟกต์)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNameModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of 34 Name Effects (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {NAME_EFFECTS_LIST.map((eff) => {
                  const isSelected = tempNameEffects.includes(eff.id);
                  let previewClass = '';
                  if (eff.id === 'rainbow') previewClass = 'effect-rainbow';
                  else if (eff.id === 'shimmer') previewClass = 'effect-shimmer';
                  else if (eff.id === 'shine') previewClass = 'effect-shine';
                  else if (eff.id === 'glow') previewClass = 'effect-glow';
                  else if (eff.id === 'shake') previewClass = 'effect-shake';
                  else if (eff.id === 'glitch') previewClass = 'effect-glitch';
                  else if (eff.id === 'flames') previewClass = 'effect-flames';
                  else if (eff.id === 'lightning') previewClass = 'effect-lightning';
                  else if (eff.id === 'flicker') previewClass = 'effect-flicker';
                  else if (eff.id === 'flip') previewClass = 'effect-flip';
                  else if (eff.id === 'fuzzy') previewClass = 'effect-fuzzy';
                  else if (eff.id === 'wave') previewClass = 'effect-wave';
                  else if (eff.id === 'bounce') previewClass = 'effect-bounce';
                  else if (eff.id === 'pulse') previewClass = 'effect-pulse';
                  else if (eff.id === 'gold') previewClass = 'effect-gold';
                  else if (eff.id === 'neon-cyan') previewClass = 'effect-neon-cyan';
                  else if (eff.id === 'aura') previewClass = 'effect-aura';

                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => handleToggleNameEffect(eff.id)}
                      className={`p-3 rounded-2xl border text-center transition-all relative flex flex-col items-center justify-center min-h-[74px] cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/25'
                      }`}
                    >
                      {eff.icon && (
                        <span className="absolute top-2 right-2 text-xs">
                          {eff.icon}
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      )}
                      <div
                        className={`text-xs font-bold tracking-wide transition-colors ${previewClass} ${
                          isSelected ? 'text-emerald-300 font-extrabold' : 'text-white/90 group-hover:text-white'
                        }`}
                      >
                        {eff.id === 'typewriter' ? (
                          <span className="inline-flex items-center">
                            <span>Type</span>
                            <span className="w-1.5 h-3.5 ml-0.5 inline-block bg-current animate-pulse rounded-[1px] shadow-[0_0_6px_currentColor]" />
                          </span>
                        ) : (
                          eff.name
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">{eff.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTempNameEffects([])}
                className="px-4 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                ลบทั้งหมด
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmNameEffects}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  ยืนยัน ({tempNameEffects.length}/3)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: เลือกเอฟเฟกต์ไบโอ (All Unlocked)
         ======================================================== */}
      {bioModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>เลือกเอฟเฟกต์ไบโอ</span>
                </div>
                <p className="text-xs text-white/50">เลือกเอฟเฟกต์สำหรับข้อความไบโอ (ใช้งานได้ทุกอัน)</p>
              </div>
              <button
                type="button"
                onClick={() => setBioModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of 18 Bio Effects */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BIO_EFFECTS_LIST.map((eff) => {
                  const isSelected = tempBioEffects.includes(eff.id);
                  let previewClass = '';
                  if (eff.id === 'rainbow') previewClass = 'effect-rainbow';
                  else if (eff.id === 'shimmer') previewClass = 'effect-shimmer';
                  else if (eff.id === 'shine') previewClass = 'effect-shine';
                  else if (eff.id === 'glow') previewClass = 'effect-glow';
                  else if (eff.id === 'shake') previewClass = 'effect-shake';
                  else if (eff.id === 'glitch') previewClass = 'effect-glitch';
                  else if (eff.id === 'flicker') previewClass = 'effect-flicker';
                  else if (eff.id === 'flip') previewClass = 'effect-flip';
                  else if (eff.id === 'wave') previewClass = 'effect-wave';
                  else if (eff.id === 'bounce') previewClass = 'effect-bounce';
                  else if (eff.id === 'pulse') previewClass = 'effect-pulse';
                  else if (eff.id === 'gold') previewClass = 'effect-gold';
                  else if (eff.id === 'neon-cyan') previewClass = 'effect-neon-cyan';
                  else if (eff.id === 'aura') previewClass = 'effect-aura';

                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => handleToggleBioEffect(eff.id)}
                      className={`p-3 rounded-2xl border text-center transition-all relative flex flex-col items-center justify-center min-h-[74px] cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/25'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      )}
                      <div
                        className={`text-xs font-bold tracking-wide transition-colors ${previewClass} ${
                          isSelected ? 'text-emerald-300 font-extrabold' : 'text-white/90 group-hover:text-white'
                        }`}
                      >
                        {eff.id === 'typewriter' ? (
                          <span className="inline-flex items-center">
                            <span>Type</span>
                            <span className="w-1.5 h-3.5 ml-0.5 inline-block bg-current animate-pulse rounded-[1px] shadow-[0_0_6px_currentColor]" />
                          </span>
                        ) : (
                          eff.name
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">{eff.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTempBioEffects([])}
                className="px-4 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                ลบทั้งหมด
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBioModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmBioEffects}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  ยืนยัน ({tempBioEffects.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Page Overlay Options */}
      {overlayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>เลือกโอเวอร์เลย์หน้าเพจ</span>
              </h3>
              <button onClick={() => setOverlayModalOpen(false)} className="text-white/50 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'ไม่มี' },
                { id: 'scanlines', label: 'Scanlines (จอ CRT)' },
                { id: 'vhs', label: 'VHS Tape (เรโทร)' },
                { id: 'grid', label: 'Cyber Grid (ตาราง)' },
                { id: 'vignette', label: 'Vignette (ขอบมืด)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    updateEffects({ pageOverlay: opt.id as any });
                    setOverlayModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    currentEffects.pageOverlay === opt.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Cursor Trail Options */}
      {cursorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-emerald-400" />
                <span>เลือกร่องรอยเคอร์เซอร์</span>
              </h3>
              <button onClick={() => setCursorModalOpen(false)} className="text-white/50 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'ไม่มี' },
                { id: 'sparkles', label: '✨ ประกายดาว (Sparkles)' },
                { id: 'hearts', label: '💖 หัวใจ (Hearts)' },
                { id: 'stars', label: '⭐ ดาวทอง (Stars)' },
                { id: 'bubbles', label: '🫧 ฟองสบู่ (Bubbles)' },
                { id: 'smoke', label: '💨 ควันนีออน (Smoke)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    updateEffects({ cursorTrail: opt.id as any });
                    setCursorModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    currentEffects.cursorTrail === opt.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Background Effect Options */}
      {bgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" />
                <span>เลือกเอฟเฟกต์พื้นหลัง</span>
              </h3>
              <button onClick={() => setBgModalOpen(false)} className="text-white/50 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'ไม่มี' },
                { id: 'sakura', label: '🌸 ซากุระร่วง (Sakura)' },
                { id: 'shooting-stars', label: '🌠 ฝนดาวตก (Shooting Stars)' },
                { id: 'fog-waves', label: '🌫️ คลื่นหมอก (Cosmic Fog)' },
                { id: 'digital-rain', label: '🟢 ฝนดิจิทัล (Matrix Rain)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    updateEffects({ bgEffect: opt.id as any });
                    setBgModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    currentEffects.bgEffect === opt.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Entrance Animation Options */}
      {entranceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0f14] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>เลือกแอนิเมชันตอนเปิดหน้า</span>
              </h3>
              <button onClick={() => setEntranceModalOpen(false)} className="text-white/50 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'ไม่มี' },
                { id: 'fade-in', label: 'Fade In (ค่อยๆ ปรากฏ)' },
                { id: 'zoom', label: 'Zoom In (ขยายตัวขึ้น)' },
                { id: 'drop', label: 'Drop In (หล่นลงมา)' },
                { id: 'slide-up', label: 'Slide Up (เลื่อนขึ้น)' },
                { id: 'flip', label: 'Flip 3D (พลิกตัวเปิด)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    updateEffects({ entranceAnimation: opt.id as any });
                    setEntranceModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    currentEffects.entranceAnimation === opt.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
