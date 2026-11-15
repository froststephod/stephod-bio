'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fireConfetti } from '@/lib/confetti';
import {
  Eye,
  Hash,
  User,
  Shield,
  Gift,
  Coins,
  Flame,
  Trophy,
  Dices,
  Glasses,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Check,
  Lock,
  Unlock,
  Clock,
  Info,
  X,
  Award,
  Crown,
  Zap,
} from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface Props {
  profile: ProfileData;
  onNavigateToTab?: (tab: string) => void;
  onClaimBadge?: (badge: { id: string; name: string; icon: string; description: string; color: string }) => void;
}

interface CollectibleBadge {
  id: string;
  name: string;
  thaiName: string;
  iconEmoji: string;
  iconKey: string;
  color: string;
  rarity: 'LIMITED' | 'LEGENDARY' | 'MYTHIC' | 'EXCLUSIVE' | 'EVENT' | 'SPECIAL';
  rarityColor: string;
  rarityBg: string;
  rarityBorder: string;
  description: string;
  requirement: string;
  totalStock: number;
  remainingStock: number;
  isUnlocked: boolean;
  canDirectClaim: boolean;
}

export default function OverviewView({ profile, onNavigateToTab, onClaimBadge }: Props) {
  const [giveawayTab, setGiveawayTab] = useState<'active' | 'winners'>('active');
  const [analyticsRange, setAnalyticsRange] = useState('30');
  const [selectedBadge, setSelectedBadge] = useState<CollectibleBadge | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Live countdown timer for the Limited event (2 days 14 hours 35 mins)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 28,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  // 8 High-Aesthetic Collectible Badges
  const COLLECTIBLE_BADGES: CollectibleBadge[] = [
    {
      id: 'b_leaf',
      name: 'Maple OG 2026',
      thaiName: 'รุ่นแรก (Early Adopter)',
      iconEmoji: '🍁',
      iconKey: 'leaf',
      color: '#10b981',
      rarity: 'LIMITED',
      rarityColor: 'text-emerald-400',
      rarityBg: 'bg-emerald-500/15',
      rarityBorder: 'border-emerald-500/30',
      description: 'ตราสัญลักษณ์ใบเมเปิลสีแดงทอง มอบแด่สมาชิกรุ่นแรกที่ร่วมทดสอบและสร้างโปรไฟล์บน STEPHOD',
      requirement: 'ฟรีสำหรับทุกคน! กดรับได้ทันทีในช่วงกิจกรรมเปิดตัว',
      totalStock: 500,
      remainingStock: 142,
      isUnlocked: true,
      canDirectClaim: true,
    },
    {
      id: 'b_axe',
      name: 'Cyber Berserker',
      thaiName: 'ขวานศึกนักล่า',
      iconEmoji: '🪓',
      iconKey: 'hammer',
      color: '#f97316',
      rarity: 'EVENT',
      rarityColor: 'text-orange-400',
      rarityBg: 'bg-orange-500/15',
      rarityBorder: 'border-orange-500/30',
      description: 'ขวานศึกพลังงานนีออน มอบแด่นักสู้ผู้ผ่านศึกประลองในมินิเกม Discord ประจำสัปดาห์',
      requirement: 'ร่วมเล่นกิจกรรมและชนะการท้าดวล 3 รอบใน discord.gg/stephod',
      totalStock: 200,
      remainingStock: 68,
      isUnlocked: false,
      canDirectClaim: false,
    },
    {
      id: 'b_clover',
      name: 'Lucky Four-Leaf',
      thaiName: 'โคลเวอร์นำโชค',
      iconEmoji: '🍀',
      iconKey: 'heart',
      color: '#22c55e',
      rarity: 'LEGENDARY',
      rarityColor: 'text-green-400',
      rarityBg: 'bg-green-500/15',
      rarityBorder: 'border-green-500/30',
      description: 'โคลเวอร์สี่แฉกเรืองแสง นำพาความโชคดีและเพิ่มโอกาสการชนะในระบบมินิเกมคาสิโน',
      requirement: 'สุ่มได้จากวงล้อ Spin The Wheel ในหน้าเกมเพลย์',
      totalStock: 100,
      remainingStock: 25,
      isUnlocked: false,
      canDirectClaim: false,
    },
    {
      id: 'b_blade',
      name: 'Phantom Saber',
      thaiName: 'ดาบมนตรามายา',
      iconEmoji: '🗡️',
      iconKey: 'star',
      color: '#a855f7',
      rarity: 'MYTHIC',
      rarityColor: 'text-purple-400',
      rarityBg: 'bg-purple-500/15',
      rarityBorder: 'border-purple-500/30',
      description: 'ดาบมารสีม่วงคอสมิก เปล่งออร่าพลังลึกลับ มอบแด่โปรไฟล์ที่ได้รับความนิยมสูง',
      requirement: 'โปรไฟล์มียอดเข้าชมสะสมครบ 1,000 ครั้งขึ้นไป',
      totalStock: 150,
      remainingStock: 49,
      isUnlocked: (profile.views || 0) >= 1000,
      canDirectClaim: (profile.views || 0) >= 1000,
    },
    {
      id: 'b_rocket',
      name: 'Cyber Voyager',
      thaiName: 'ผู้ท่องดวงดาว',
      iconEmoji: '🚀',
      iconKey: 'booster',
      color: '#06b6d4',
      rarity: 'EXCLUSIVE',
      rarityColor: 'text-cyan-400',
      rarityBg: 'bg-cyan-500/15',
      rarityBorder: 'border-cyan-500/30',
      description: 'ยานอวกาศทะลวงมิติ มอบแด่ผู้สนับสนุนที่ร่วมบูสต์เซิร์ฟเวอร์หลักของคอมมูนิตี้',
      requirement: 'บูสต์เซิร์ฟเวอร์ Discord ของ STEPHOD (Discord Booster)',
      totalStock: 50,
      remainingStock: 12,
      isUnlocked: false,
      canDirectClaim: false,
    },
    {
      id: 'b_cake',
      name: 'Sweet Feast',
      thaiName: 'เค้กทองคำเฉลิมฉลอง',
      iconEmoji: '🎂',
      iconKey: 'crown',
      color: '#eab308',
      rarity: 'SPECIAL',
      rarityColor: 'text-yellow-400',
      rarityBg: 'bg-yellow-500/15',
      rarityBorder: 'border-yellow-500/30',
      description: 'เค้กทองคำประดับอัญมณี ฉลองการเปิดตัวระบบ STEPHOD สัปดาห์แรก',
      requirement: 'ล็อกอินและสร้างโปรไฟล์ในช่วงสัปดาห์ Grand Opening',
      totalStock: 1000,
      remainingStock: 320,
      isUnlocked: true,
      canDirectClaim: true,
    },
    {
      id: 'b_fire',
      name: 'Dragon Flame',
      thaiName: 'เพลิงมังกรบรรพกาล',
      iconEmoji: '🔥',
      iconKey: 'fire',
      color: '#ef4444',
      rarity: 'LEGENDARY',
      rarityColor: 'text-red-400',
      rarityBg: 'bg-red-500/15',
      rarityBorder: 'border-red-500/30',
      description: 'เพลิงมังกรโลกันตร์อันร้อนแรง มอบแด่โปรไฟล์ที่กำลังมาแรงอันดับ 1 ของสัปดาห์',
      requirement: 'ติดอันดับ Trending Top 10 บนกระดานผู้นำ',
      totalStock: 100,
      remainingStock: 18,
      isUnlocked: false,
      canDirectClaim: false,
    },
    {
      id: 'b_crown',
      name: 'Imperial Sovereign',
      thaiName: 'มงกุฎจักรพรรดิ',
      iconEmoji: '👑',
      iconKey: 'crown',
      color: '#f59e0b',
      rarity: 'MYTHIC',
      rarityColor: 'text-amber-400',
      rarityBg: 'bg-amber-500/15',
      rarityBorder: 'border-amber-500/30',
      description: 'มงกุฎทองคำประดับเพชรแท้ สัญลักษณ์แห่งเกียรติยศสูงสุดสำหรับสมาชิก STEPHOD VIP',
      requirement: 'อัปเกรดสถานะบัญชี VIP ในแท็บเช่าเว็บ/ร้านค้า',
      totalStock: 50,
      remainingStock: 9,
      isUnlocked: false,
      canDirectClaim: false,
    },
  ];

  // Check if profile owns a badge
  const isBadgeOwned = (badgeId: string) => {
    return profile.badges?.some((b) => b.id === badgeId) || false;
  };

  // Claim handler
  const handleClaimBadge = (badge: CollectibleBadge) => {
    if (isBadgeOwned(badge.id)) return;

    // Confetti celebration
    fireConfetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: [badge.color, '#ffffff', '#10b981', '#06b6d4', '#f59e0b'],
    });

    if (onClaimBadge) {
      onClaimBadge({
        id: badge.id,
        name: `${badge.name} (${badge.thaiName})`,
        icon: badge.iconKey,
        description: badge.description,
        color: badge.color,
      });
    }

    if (selectedBadge?.id === badge.id) {
      setSelectedBadge(null);
    }
  };

  const totalBadges = COLLECTIBLE_BADGES.length;
  const ownedCount = COLLECTIBLE_BADGES.filter((b) => isBadgeOwned(b.id)).length;
  const progressPercent = Math.round((ownedCount / totalBadges) * 100);

  // Real-time live stats polling in Dashboard
  const [liveViewers, setLiveViewers] = useState<number>(1);
  const [liveViews, setLiveViews] = useState<number>(profile.views || 0);

  useEffect(() => {
    const fetchLivePresence = async () => {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(profile.username)}/presence`);
        const data = await res.json();
        if (data && data.success) {
          setLiveViewers(data.liveViewers || 1);
          if (typeof data.totalViews === 'number') {
            setLiveViews(data.totalViews);
          }
        }
      } catch {}
    };

    fetchLivePresence();
    const interval = setInterval(fetchLivePresence, 6000);
    return () => clearInterval(interval);
  }, [profile.username]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Top 3 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Views & Live Viewers */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121319] flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {liveViews.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>{liveViewers} ดูสด</span>
                </span>
              </div>
              <div className="text-[11px] text-white/50">ยอดเข้าชมโปรไฟล์ (Real-time)</div>
            </div>
          </div>
        </div>

        {/* Card 2: User ID */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121319] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white font-mono tracking-tight">
                3,724
              </div>
              <div className="text-[11px] text-white/50">รหัสผู้ใช้</div>
            </div>
          </div>
        </div>

        {/* Card 3: Username */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121319] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white font-mono tracking-tight truncate max-w-[150px]">
                {profile.username}
              </div>
              <div className="text-[11px] text-white/50">ชื่อผู้ใช้</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mid Row: Limited Badges (Left) & Discord Community (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Limited Edition Badges Carousel (2 cols width) - HIGH AESTHETIC UPGRADE */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-white/10 bg-gradient-to-b from-[#13151f] to-[#0c0d14] space-y-4 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row with Title and Live Countdown Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>ตราสะสมจำกัดจำนวน (Limited Collectibles)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  ซีซัน 1
                </span>
              </h3>
            </div>

            {/* Live Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-white/80 font-mono text-xs shadow-inner self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] text-white/50">หมดเขตใน:</span>
              <span className="text-white font-bold text-[11px]">
                {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <p className="text-xs text-white/60 -mt-1">
            อย่าพลาดโอกาส! รับตราสะสมลิมิเต็ดประจำซีซันของคุณก่อนหมดเวลา ตราที่ปลดล็อกจะแสดงบนการ์ดโปรไฟล์ทันที
          </p>

          {/* Carousel Controls & Items */}
          <div className="relative group">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-8 h-8 rounded-full bg-[#161822]/90 border border-white/20 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all shadow-lg backdrop-blur-md opacity-80 hover:opacity-100"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-8 h-8 rounded-full bg-[#161822]/90 border border-white/20 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all shadow-lg backdrop-blur-md opacity-80 hover:opacity-100"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Badges Carousel Track */}
            <div
              ref={carouselRef}
              className="flex items-center gap-3 overflow-x-auto py-2.5 px-1 scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {COLLECTIBLE_BADGES.map((badge) => {
                const owned = isBadgeOwned(badge.id);

                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`flex-shrink-0 w-[155px] sm:w-[165px] h-[215px] p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 relative group/card overflow-hidden ${
                      owned
                        ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/15 via-[#111915] to-[#0a0f0d] shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : badge.canDirectClaim
                        ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-[#12161f] to-[#0b0d13] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-1.5'
                        : 'border-white/10 bg-gradient-to-b from-[#151722] via-[#0f1017] to-[#0a0a0f] hover:border-white/25 hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    {/* Top Rarity Chip */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.rarityBg} ${badge.rarityBorder} ${badge.rarityColor} tracking-wider`}
                      >
                        {badge.rarity}
                      </span>
                      {owned ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                      ) : badge.canDirectClaim ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      ) : (
                        <Lock className="w-3 h-3 text-white/30" />
                      )}
                    </div>

                    {/* Center Icon & Ambient Halo */}
                    <div className="flex flex-col items-center justify-center my-1 relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover/card:scale-110 duration-300 relative"
                        style={{
                          background: `radial-gradient(circle, ${badge.color}25 0%, transparent 70%)`,
                        }}
                      >
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                          {badge.iconEmoji}
                        </span>
                      </div>
                      <div className="text-center mt-1 w-full px-1">
                        <div className="text-xs font-bold text-white truncate group-hover/card:text-emerald-300 transition-colors">
                          {badge.name}
                        </div>
                        <div className="text-[10px] text-white/45 truncate">
                          {badge.thaiName}
                        </div>
                      </div>
                    </div>

                    {/* Remaining Supply Mini Bar */}
                    <div className="w-full space-y-1 pt-1 border-t border-white/5">
                      <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
                        <span>เหลือ</span>
                        <span className="text-white/70 font-semibold">
                          {badge.remainingStock}/{badge.totalStock}
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(badge.remainingStock / badge.totalStock) * 100}%`,
                            backgroundColor: badge.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1 w-full">
                      {owned ? (
                        <div className="w-full py-1.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <Check className="w-3 h-3" />
                          <span>เป็นเจ้าของแล้ว ✓</span>
                        </div>
                      ) : badge.canDirectClaim ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimBadge(badge);
                          }}
                          className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 animate-pulse"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>กดรับเลย ✨</span>
                        </button>
                      ) : (
                        <div className="w-full py-1.5 px-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-medium flex items-center justify-center gap-1 group-hover/card:text-white group-hover/card:border-white/20 transition-all">
                          <Lock className="w-2.5 h-2.5" />
                          <span>ดูเงื่อนไข</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                {progressPercent}%
              </span>
            </div>
            <div className="text-[11px] text-white/50 flex items-center gap-1 font-mono">
              <span>สะสมแล้ว</span>
              <span className="text-white font-bold">{ownedCount}</span>
              <span>/</span>
              <span>{totalBadges} ตรา</span>
              <span className="hidden sm:inline text-white/30">• แสดงบนโปรไฟล์อัตโนมัติ</span>
            </div>
          </div>
        </div>

        {/* Right: Discord Community Card */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/20 flex-shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white">เข้าร่วม Discord ของเรา</div>
              <div className="text-[11px] text-white/50">discord.gg/stephod</div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5865F2] hover:bg-[#4752C4] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
              </svg>
              <span>เชื่อมต่อ Discord แล้ว</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigateToTab && onNavigateToTab('shop')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>ไปที่คาสิโน / ร้านค้า</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Row 3: Giveaways (Left) & Gaming Stats / Wallet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: กิจกรรมแจกของ */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <h3 className="text-sm font-bold text-white tracking-wide">กิจกรรมแจกของ</h3>
            </div>
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setGiveawayTab('active')}
                className={`px-3 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                  giveawayTab === 'active'
                    ? 'bg-white/15 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                กำลังจัด
              </button>
              <button
                type="button"
                onClick={() => setGiveawayTab('winners')}
                className={`px-3 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                  giveawayTab === 'winners'
                    ? 'bg-white/15 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                ผู้ชนะ
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40 text-xs">
            <Gift className="w-8 h-8 text-white/20 mb-2" />
            <p>ยังไม่มีกิจกรรมแจกของในขณะนี้ กลับมาเช็กใหม่ภายหลังนะ</p>
          </div>
        </div>

        {/* Right: สถิติเกม & ภาพรวมกระเป๋า */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg">
          {/* 4 Mini Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Glasses className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">0</div>
                <div className="text-[10px] text-white/40">รอบที่เล่นชนะ</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-white/10 bg-orange-500/15 text-orange-400 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">0</div>
                <div className="text-[10px] text-white/40">สตรีคปัจจุบัน</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-white/10 bg-amber-500/15 text-amber-400 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">0.0%</div>
                <div className="text-[10px] text-white/40">อัตราชนะ</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-white/10 bg-cyan-500/15 text-cyan-400 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">0</div>
                <div className="text-[10px] text-white/40">รางวัลรวม</div>
              </div>
            </div>
          </div>

          {/* Wallet Breakdown */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-white/50">ภาพรวมกระเป๋า</span>
              <span className="text-[11px] text-white/40 font-mono">ชนะสูงสุด: 0 • แพ้สูงสุด: -0</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mb-2.5">฿0</div>

            {/* Game mini legends */}
            <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Daily Reward 0.0% +0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Dice Roll 0.0% +0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Spin the Wheel 0.0% +0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Slot Machine 0.0% +0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Rock Paper Scissors 0.0% +0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Visitor Analytics (Left) & Top 5 Links (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: ผู้เข้าชมโปรไฟล์ (Analytics chart) */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <h3 className="text-sm font-bold text-white tracking-wide">ผู้เข้าชมโปรไฟล์</h3>
            </div>
            <select
              value={analyticsRange}
              onChange={(e) => setAnalyticsRange(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans cursor-pointer"
            >
              <option value="7" className="bg-neutral-900">7 วันที่ผ่านมา</option>
              <option value="30" className="bg-neutral-900">30 วันที่ผ่านมา</option>
              <option value="all" className="bg-neutral-900">ทั้งหมด</option>
            </select>
          </div>

          {/* Graphical Bars Visualizer */}
          <div className="h-36 w-full flex items-end gap-1.5 pt-4 pb-2 px-2 rounded-xl bg-black/30 border border-white/5">
            {[12, 18, 25, 14, 30, 45, 28, 55, 60, 42, 38, 70, 85, 64, 90, 75, 80, 95, 60, 70, 88, 100, 72, 85, 95, 68, 77, 89, 94, 100].map(
              (val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-400/80 rounded-t transition-all group relative cursor-pointer"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 border border-white/20 text-[10px] text-white px-1.5 py-0.5 rounded font-mono z-20 pointer-events-none whitespace-nowrap">
                    Day {i + 1}: {Math.floor((val * (profile.views || 40)) / 100)}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="flex justify-between text-[10px] text-white/40 font-mono px-1">
            <span>30 วันก่อน</span>
            <span>วันนี้</span>
          </div>
        </div>

        {/* Right: 5 ลิงก์ยอดนิยม */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <h3 className="text-sm font-bold text-white tracking-wide">5 ลิงก์ยอดนิยม</h3>
          </div>

          <div className="space-y-2 pt-1">
            {profile.socialLinks && profile.socialLinks.length > 0 ? (
              profile.socialLinks.slice(0, 5).map((l, idx) => (
                <div
                  key={l.id}
                  className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-semibold text-white/90">{l.label}</span>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="font-mono text-white/50 text-[11px]">
                    {Math.max(0, Math.floor((profile.views || 10) * (0.4 - idx * 0.08)))} คลิก
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/40 text-xs">
                ยังไม่มีการคลิกลิงก์
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Sleek Badge Details Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#11131c] border border-white/15 rounded-3xl p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Badge Emblem */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center relative shadow-2xl border"
                style={{
                  background: `radial-gradient(circle, ${selectedBadge.color}30 0%, #0a0c14 100%)`,
                  borderColor: `${selectedBadge.color}60`,
                  boxShadow: `0 0 35px ${selectedBadge.color}35`,
                }}
              >
                <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  {selectedBadge.iconEmoji}
                </span>
              </div>

              {/* Rarity and Titles */}
              <div className="mt-4 text-center space-y-1">
                <span
                  className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${selectedBadge.rarityBg} ${selectedBadge.rarityBorder} ${selectedBadge.rarityColor} tracking-widest`}
                >
                  {selectedBadge.rarity} EDITION
                </span>
                <h3 className="text-lg font-bold text-white tracking-wide pt-1">
                  {selectedBadge.name}
                </h3>
                <p className="text-xs text-white/60 font-medium">{selectedBadge.thaiName}</p>
              </div>
            </div>

            {/* Description & Lore */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs text-white/80">
              <div className="text-[10px] uppercase font-mono text-white/40 flex items-center gap-1.5">
                <Info className="w-3 h-3 text-cyan-400" />
                <span>คำอธิบายตรา</span>
              </div>
              <p className="leading-relaxed">{selectedBadge.description}</p>
            </div>

            {/* Unlock Requirement Box */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
              <div className="text-[10px] uppercase font-mono text-white/40 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>เงื่อนไขการปลดล็อก</span>
              </div>
              <p className="text-white/90 font-medium">{selectedBadge.requirement}</p>
            </div>

            {/* Stock Supply Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/60 font-mono">
                <span>จำนวนจำกัดทั่วโลก</span>
                <span className="text-white font-bold">
                  คงเหลือ {selectedBadge.remainingStock} / {selectedBadge.totalStock} ชิ้น
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(selectedBadge.remainingStock / selectedBadge.totalStock) * 100}%`,
                    backgroundColor: selectedBadge.color,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {isBadgeOwned(selectedBadge.id) ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>คุณครอบครองตราสะสมนี้แล้ว ✓</span>
                </div>
              ) : selectedBadge.canDirectClaim ? (
                <button
                  type="button"
                  onClick={() => handleClaimBadge(selectedBadge)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>กดรับตรานี้เข้าโปรไฟล์ (ฟรี)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-xs font-semibold flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ยังไม่ผ่านเงื่อนไขการปลดล็อก</span>
                  </div>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl text-center text-xs text-[#5865F2] hover:text-[#7983f5] block transition-colors"
                  >
                    เข้าร่วม Discord เพื่อปลดล็อกตรานี้ →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
