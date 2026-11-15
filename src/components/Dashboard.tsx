'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Palette,
  User,
  Share2,
  Tv,
  Smartphone,
  Monitor,
  Download,
  Upload,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
  Shield,
  Puzzle,
  Settings,
  Eye,
  LogOut,
  Menu,
  X,
  Flame,
  Coins,
  Crown,
  Lock,
  ShieldCheck,
  ArrowRight,
  Lightbulb,
  Sliders,
  Volume2,
} from 'lucide-react';
import { ProfileData, SocialLink, Badge, ThemeConfig, AvatarDecoration, AuthUser } from '@/types/profile';
import ProfileView from './ProfileView';
import OverviewView from './OverviewView';
import BadgeIcon from './BadgeIcon';
import BadgeBar from './BadgeBar';
import AvatarWithDecoration from './AvatarWithDecoration';
import AvatarDecorationModal from './AvatarDecorationModal';
import FontPickerDropdown from './FontPickerDropdown';
import AuthScreen from './AuthScreen';
import { getSpotifyInfo, fetchSpotifyOEmbed } from '@/lib/music';
import { siteConfig } from '@/config/site';
import ExtraEffectsView from './ExtraEffectsView';

type TabType =
  | 'overview'
  | 'shop'
  | 'profile'
  | 'theme'
  | 'effects'
  | 'links'
  | 'badges'
  | 'discord'
  | 'audio'
  | 'settings';

const PRESET_BADGES: Array<{
  id: string;
  icon: string;
  name: string;
  description: string;
  color: string;
}> = [
  { id: 'b_mug', icon: 'mug', name: 'ผู้ชวนเพื่อน / ดื่มฉลอง', description: 'ชวนเพื่อน 3 คนเข้าเซิร์ฟเวอร์ Discord', color: '#ef4444' },
  { id: 'b_diamond', icon: 'diamond', name: 'พรีเมียม (Premium)', description: 'ใช้ฟีเจอร์พรีเมียมได้', color: '#ef4444' },
  { id: 'b_verified', icon: 'verified', name: 'ยืนยันแล้ว (Verified)', description: 'มีผู้ติดตามอย่างน้อย 3,000 คนบนโซเชียล', color: '#ffffff' },
  { id: 'b_star', icon: 'star', name: 'ดาวเด่น / ยอดนิยม', description: 'โปรไฟล์มียอดชม 5,000 ครั้ง', color: '#ffffff' },
  { id: 'b_leaf', icon: 'leaf', name: 'รุ่นแรก (Early Adopter)', description: 'รับตรารุ่นแรกจำนวนจำกัดหลังเปิดตัว', color: '#ffffff' },
  { id: 'b_booster', icon: 'booster', name: 'บูสเตอร์ (Booster)', description: 'บูสต์เซิร์ฟเวอร์ Discord ของเราอยู่', color: '#ec4899' },
  { id: 'b_crown', icon: 'crown', name: 'OG สมาชิกยุคแรก', description: 'สมัครก่อนมีผู้ใช้ครบ 500 คน', color: '#f59e0b' },
  { id: 'b_hammer', icon: 'hammer', name: 'พนักงาน (Staff)', description: 'ทีมงานของ STEPHOD', color: '#10b981' },
  { id: 'b_heart', icon: 'heart', name: 'พาร์ทเนอร์ (Partner)', description: 'พาร์ทเนอร์อย่างเป็นทางการ', color: '#06b6d4' },
  { id: 'b_trophy', icon: 'trophy', name: 'ผู้ชนะอีเวนต์', description: 'ชนะอีเวนต์ที่จัดขึ้น', color: '#eab308' },
  { id: 'b_fire', icon: 'fire', name: 'กำลังมาแรง (Trending)', description: 'โปรไฟล์มียอดชม 1,000 ครั้ง', color: '#f97316' },
  { id: 'b_dev', icon: 'dev', name: 'นักพัฒนา (Developer)', description: 'ผู้สร้างระบบและเขียนโค้ด', color: '#3b82f6' },
];

const COLOR_PRESETS = [
  { name: 'Purple Neon', color: '#a855f7' },
  { name: 'Cyber Cyan', color: '#06b6d4' },
  { name: 'Rose Pink', color: '#f43f5e' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Amber Gold', color: '#f59e0b' },
  { name: 'Electric Blue', color: '#3b82f6' },
  { name: 'Crimson', color: '#ef4444' },
  { name: 'Pure White', color: '#f8fafc' },
];

const AUDIO_PRESETS = [
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    platform: 'spotify',
  },
  {
    title: "Today's Top Hits",
    artist: 'Spotify Playlist',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    platform: 'spotify',
  },
  {
    title: 'Lofi Study Night (Chill)',
    artist: 'FASSounds',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    platform: 'mp3',
  },
  {
    title: 'Sunset Chill Beat',
    artist: 'SoulProd',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-chill-medium-version-159456.mp3',
    platform: 'mp3',
  },
  {
    title: 'Cyberpunk Synthwave Night',
    artist: 'LexinMusic',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
    platform: 'mp3',
  },
];

export default function Dashboard({ initialProfiles }: { initialProfiles: Record<string, ProfileData> }) {
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>(initialProfiles);
  const [selectedUsername, setSelectedUsername] = useState<string>(
    Object.keys(initialProfiles)[0] || 'pun'
  );

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDecorationModalOpen, setIsDecorationModalOpen] = useState(false);
  const [fetchingSpotify, setFetchingSpotify] = useState(false);
  const [layoutAdvanced, setLayoutAdvanced] = useState(false);
  const [cardAdvanced, setCardAdvanced] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const isFirstMountRef = useRef(true);

  // Maintain long-lived BroadcastChannel for 0ms cross-tab real-time sync
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bcRef.current = new BroadcastChannel('stephod_live_sync');
      } catch {}
    }
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.profile) {
            setProfile(data.profile);
            setSelectedUsername(data.profile.username);
            try {
              localStorage.setItem('stephod_profile_' + data.profile.username.toLowerCase(), JSON.stringify(data.profile));
              document.cookie = `stephod_p_${data.profile.username.toLowerCase()}=${encodeURIComponent(JSON.stringify(data.profile))}; path=/; max-age=86400`;
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      setCurrentUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Claim limited badge from Overview
  const handleClaimBadge = (badge: { id: string; name: string; icon: string; description: string; color: string }) => {
    if (profile.badges.some((b) => b.id === badge.id)) return;
    setProfile((prev) => ({
      ...prev,
      badges: [...prev.badges, badge],
    }));
  };

  // Current editable profile
  const [profile, setProfile] = useState<ProfileData>(
    initialProfiles[selectedUsername] || Object.values(initialProfiles)[0]
  );

  // Handler for Audio URL change (auto-detects Spotify and auto-fills title & artist)
  const handleAudioUrlChange = async (url: string) => {
    setProfile((prev) => ({
      ...prev,
      audio: { ...prev.audio, audioUrl: url },
    }));

    const spotify = getSpotifyInfo(url);
    if (spotify) {
      setFetchingSpotify(true);
      try {
        const meta = await fetchSpotifyOEmbed(url);
        if (meta?.title) {
          setProfile((prev) => ({
            ...prev,
            audio: {
              ...prev.audio,
              audioUrl: url,
              songTitle: meta.title || prev.audio.songTitle,
              artist: meta.artist || prev.audio.artist,
            },
          }));
        }
      } catch (e) {
        console.warn('Failed to auto-fetch Spotify metadata:', e);
      } finally {
        setFetchingSpotify(false);
      }
    }
  };

  // When selected user changes
  const handleSelectUser = (username: string) => {
    setSelectedUsername(username);
    if (profiles[username]) {
      setProfile(JSON.parse(JSON.stringify(profiles[username])));
    }
  };

  // Create new profile for a friend or yourself
  const handleCreateNew = () => {
    const newName = prompt('Enter new username (lowercase letters and numbers only):', 'friend-' + Math.floor(Math.random() * 1000));
    if (!newName) return;
    const clean = newName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) return;

    const base = profiles[selectedUsername] || Object.values(profiles)[0];
    const newProfile: ProfileData = {
      ...JSON.parse(JSON.stringify(base)),
      username: clean,
      displayName: clean.charAt(0).toUpperCase() + clean.slice(1),
      views: 0,
      likes: 0,
    };

    setProfiles((prev) => ({ ...prev, [clean]: newProfile }));
    setSelectedUsername(clean);
    setProfile(newProfile);
  };

  // Save changes to API (Instant optimistic cross-tab sync & background API save)
  const handleSave = async (isAuto?: boolean | React.MouseEvent) => {
    const auto = isAuto === true;
    if (!auto) setSaving(true);

    // ⚡ Optimistic Instant Broadcast (0ms cross-tab latency)
    try {
      localStorage.setItem('stephod_profile_' + profile.username.toLowerCase(), JSON.stringify(profile));
      localStorage.setItem('stephod_profile_sync', Date.now().toString());
      document.cookie = `stephod_p_${profile.username.toLowerCase()}=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=86400`;
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'UPDATE_PROFILE', profile });
      }
    } catch {}

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setProfiles((prev) => ({ ...prev, [data.profile.username]: data.profile }));
        try {
          localStorage.setItem('stephod_profile_' + data.profile.username.toLowerCase(), JSON.stringify(data.profile));
          localStorage.setItem('stephod_profile_sync', Date.now().toString());
          if (bcRef.current) {
            bcRef.current.postMessage({ type: 'UPDATE_PROFILE', profile: data.profile });
          }
        } catch {}
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else if (!auto) {
        alert(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      if (!auto) alert('Error saving profile');
    } finally {
      if (!auto) setSaving(false);
    }
  };

  // Instant local broadcast whenever profile edits in dashboard (0ms latency to profile tabs)
  useEffect(() => {
    if (!profile || !profile.username) return;
    try {
      localStorage.setItem('stephod_profile_' + profile.username.toLowerCase(), JSON.stringify(profile));
      localStorage.setItem('stephod_profile_sync', Date.now().toString());
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'UPDATE_PROFILE', profile });
      }
    } catch {}
  }, [profile]);

  // Debounced auto-save to cloud (1.2s after user pauses editing)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (!profile || !profile.username) return;
    const timer = setTimeout(() => {
      handleSave(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [profile]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${profile.username}-bio-profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.username) {
          setProfile(parsed);
          alert('Config loaded successfully! Remember to click Save.');
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Social Links management
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: 'link_' + Date.now(),
      platform: 'discord',
      label: 'My Discord',
      url: 'https://discord.gg',
    };
    setProfile({
      ...profile,
      socialLinks: [...profile.socialLinks, newLink],
    });
  };

  const updateSocialLink = (index: number, updated: Partial<SocialLink>) => {
    const list = [...profile.socialLinks];
    list[index] = { ...list[index], ...updated };
    setProfile({ ...profile, socialLinks: list });
  };

  const removeSocialLink = (index: number) => {
    const list = profile.socialLinks.filter((_, i) => i !== index);
    setProfile({ ...profile, socialLinks: list });
  };

  // Badges management
  const addBadge = () => {
    const newBadge: Badge = {
      id: 'badge_' + Date.now(),
      name: 'Custom Badge',
      icon: '⭐',
      description: 'Special badge',
      color: profile.theme.accentColor,
    };
    setProfile({
      ...profile,
      badges: [...profile.badges, newBadge],
    });
  };

  const updateBadge = (index: number, updated: Partial<Badge>) => {
    const list = [...profile.badges];
    list[index] = { ...list[index], ...updated };
    setProfile({ ...profile, badges: list });
  };

  const removeBadge = (index: number) => {
    const list = profile.badges.filter((_, i) => i !== index);
    setProfile({ ...profile, badges: list });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-white/40 font-mono tracking-wider">กำลังตรวจสอบบัญชีผู้ใช้...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user, userProfile) => {
          setCurrentUser(user);
          if (userProfile) {
            setProfile(userProfile);
            setSelectedUsername(userProfile.username);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* 1. Left Sidebar Navigation (yura.lol style) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 xl:w-64 bg-[#0d0e14] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-1 flex items-center justify-center shadow-md shadow-cyan-500/20 overflow-hidden group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="STEPHOD" className="w-full h-full object-contain filter drop-shadow-[0_0_6px_#00d2ff]" />
            </div>
            <span className="font-extrabold text-xl tracking-wider font-mono text-white">
              STEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">HOD</span>
            </span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Category: แดชบอร์ด */}
          <div>
            <div className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 font-mono">
              แดชบอร์ด
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>ภาพรวม</span>
              </button>
              <button
                onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'shop'
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>เช่าเว็บ/ร้านค้า</span>
              </button>
            </div>
          </div>

          {/* Category: ปรับแต่ง */}
          <div>
            <div className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 font-mono">
              ปรับแต่ง
            </div>
            <div className="space-y-1">
              {[
                { id: 'profile', label: 'โปรไฟล์', icon: User },
                { id: 'theme', label: 'หน้าตา', icon: Palette },
                { id: 'effects', label: 'เอฟเฟกต์เสริม', icon: Sparkles },
                { id: 'links', label: 'ลิงก์', icon: Share2 },
                { id: 'badges', label: 'ตราสัญลักษณ์', icon: Shield },
                { id: 'discord', label: 'วิดเจ็ต', icon: Puzzle },
                { id: 'audio', label: 'เพลง', icon: Music },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as TabType); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: จัดการ */}
          <div>
            <div className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 font-mono">
              จัดการ
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>การตั้งค่า</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>ดูโปรไฟล์</span>
          </a>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-white/10 flex-shrink-0">
                <img
                  src={currentUser?.avatar || profile.avatarUrl}
                  alt={currentUser?.username || profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.displayName || currentUser?.globalName || profile.displayName || profile.username}
                </div>
                <div className="text-[10px] text-white/40 font-mono truncate">
                  @{currentUser?.username || profile.username}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#07080c]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-[#0b0c12]/90 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-mono">
              {activeTab === 'overview' && '📊 ภาพรวม (Overview)'}
              {activeTab === 'profile' && '👤 ปรับแต่งโปรไฟล์ (Profile)'}
              {activeTab === 'theme' && '🎨 หน้าตา & สไตล์ (Theme & Style)'}
              {activeTab === 'effects' && '✨ เอฟเฟกต์เสริม (Effects)'}
              {activeTab === 'links' && '🔗 ลิงก์โซเชียลมีเดีย (Links)'}
              {activeTab === 'badges' && '🛡️ ตราสัญลักษณ์ (Badges)'}
              {activeTab === 'discord' && '🧩 วิดเจ็ต Discord (Widgets)'}
              {activeTab === 'audio' && '🎵 เพลงพื้นหลัง & Spotify (Music)'}
              {activeTab === 'shop' && '🛍️ เช่าเว็บ & ร้านค้า (Shop / Perks)'}
              {activeTab === 'settings' && '⚙️ การตั้งค่าระบบ (Settings)'}
            </h1>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Badge (Locked to authenticated user) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-mono font-bold text-white">@{profile.username}</span>
              <span className="text-[10px] text-white/50 border-l border-white/10 pl-2">
                {currentUser?.displayName || currentUser?.globalName || profile.displayName}
              </span>
            </div>

            {/* View Public Profile Link */}
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5 transition-colors text-white/80 hover:text-white"
              title="ดูหน้าโปรไฟล์สาธารณะ"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">ดูหน้าเว็บ</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center gap-1.5 text-xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกแล้ว ✓' : 'บันทึก'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-500/30 text-white/50 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* TAB 1: ภาพรวม (Overview) */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <OverviewView
              profile={profile}
              onNavigateToTab={(t) => setActiveTab(t as TabType)}
              onClaimBadge={handleClaimBadge}
            />
          </div>
        )}

        {/* TAB 2: เช่าเว็บ / ร้านค้า (Shop / VIP) */}
        {activeTab === 'shop' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>ร้านค้า & สิทธิพิเศษ STEPHOD VIP</span>
              </h2>
            </div>
            <p className="text-xs text-white/50 -mt-4">
              อัปเกรดสถานะบัญชีเพื่อปลดล็อกตราหายาก, เอฟเฟกต์พิเศษ และโดเมนส่วนตัว
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Plan 1: Standard (Active) */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      ฟรีตลอดชีพ
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">Standard Profile</h3>
                    <p className="text-xs text-white/50">สำหรับผู้เริ่มต้นสร้างโปรไฟล์ส่วนตัว</p>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">฿0</div>
                </div>
                <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-white/70">
                  <div className="flex items-center gap-2 text-emerald-400">✓ ลิงก์โปรไฟล์ /:username ฟรี</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ เล่นเพลงพื้นหลัง BGM & Spotify</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ Discord Lanyard Status สด</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ เลย์เอาต์และสไตล์การ์ด 6 แบบ</div>
                </div>
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50 text-xs font-semibold cursor-default"
                >
                  ใช้งานอยู่ปัจจุบัน ✓
                </button>
              </div>

              {/* Plan 2: VIP Premium */}
              <div className="p-6 rounded-2xl border border-emerald-500/40 bg-[#121319] space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  แนะนำ • POPULAR
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      VIP STATUS
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>STEPHOD PRO</span>
                    </h3>
                    <p className="text-xs text-white/50">สิทธิพิเศษขั้นสูงสุดสำหรับครีเอเตอร์</p>
                  </div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    ฿99<span className="text-xs text-white/40 font-normal">/ถาวร</span>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-white/80">
                  <div className="flex items-center gap-2 text-emerald-400">✓ ปลดล็อกตราชั้นนำ Diamond & Booster ทันที</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ อัปโหลดวิดีโอ MP4 คลอพื้นหลังความคมชัดสูง</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ ปรับแต่ง Custom CSS ขั้นสูงไม่จำกัด</div>
                  <div className="flex items-center gap-2 text-emerald-400">✓ ซ่อนลายน้ำท้ายโปรไฟล์ได้</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('ฟีเจอร์นี้เปิดใช้งานสำหรับสมาชิกผู้บุกเบิกรุ่นแรกแล้ว!')}
                  className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all text-xs"
                >
                  อัปเกรดเป็น STEPHOD PRO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: การตั้งค่า (Settings) */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <h2 className="text-xl font-bold tracking-tight">การตั้งค่าระบบ (Settings)</h2>
            </div>

            {/* General Info Card */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white">ข้อมูลแพลตฟอร์ม (Platform Info)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-white/50 block mb-1">ชื่อระบบ:</span>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-white">STEPHOD</div>
                </div>
                <div>
                  <span className="text-white/50 block mb-1">เวอร์ชันระบบ:</span>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-emerald-400">
                    v2.5.0 (Aesthetic Engine)
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-3 shadow-lg">
              <h3 className="text-sm font-bold text-white">สำรองและกู้คืนข้อมูล (Backup & Restore)</h3>
              <p className="text-xs text-white/50">
                ดาวน์โหลดการตั้งค่าโปรไฟล์ทั้งหมดเป็นไฟล์ JSON เพื่อสำรองไว้ หรือกู้คืนกลับมาได้ตลอดเวลา
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>ดาวน์โหลดสำรอง (Export JSON)</span>
                </button>
                <label className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>นำเข้าไฟล์ (Import JSON)</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMIZER TABS: Profile, Theme, Audio, Links, Badges, Discord */}
        {activeTab !== 'overview' && activeTab !== 'shop' && activeTab !== 'settings' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
            {/* Left Side: Form Controls */}
            <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-white/10 flex flex-col bg-[#0f1018] overflow-y-auto max-h-full">
              {/* Tab Contents */}
              <div className="p-5 space-y-6">
            {/* 1. Profile Tab (yura.lol Style) */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* 1.1 Avatar & Discord Decoration Section */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center gap-4">
                    <AvatarWithDecoration
                      avatarUrl={profile.avatarUrl}
                      decoration={profile.avatarDecoration}
                      size="md"
                    />

                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsDecorationModalOpen(true)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>เปลี่ยนของตกแต่งอวตาร (Discord Decorations)</span>
                      </button>

                      {/* Shape pills: วงกลม, มุมมน, มุมมนเล็ก */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/50">รูปทรง:</span>
                        {[
                          { id: 'circle', label: 'วงกลม' },
                          { id: 'squircle', label: 'มุมมน' },
                          { id: 'soft-square', label: 'มุมมนเล็ก' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                avatarDecoration: {
                                  ...(profile.avatarDecoration || { type: 'none', hue: 0, shape: 'circle' }),
                                  shape: s.id as any,
                                },
                              })
                            }
                            className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                              (profile.avatarDecoration?.shape || 'circle') === s.id
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                                : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="https://images.unsplash.com/... หรือ ลิงก์รูปภาพ Discord"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Username / URL Slug</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-xs text-white/40 font-mono">
                      domain.com/
                    </span>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-r-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-white/40 mt-1">เพื่อนสามารถเข้าดูโปรไฟล์นี้ได้ผ่าน URL นี้</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Display Name (ชื่อที่แสดง)</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="เช่น Pun ✨ หรือ John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Card Banner URL (Optional)</label>
                  <input
                    type="text"
                    value={profile.bannerUrl || ''}
                    onChange={(e) => setProfile({ ...profile, bannerUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="https://images.unsplash.com/... หรือรูปแบนเนอร์ด้านบน"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Bio / Status Description</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="เขียนข้อความแนะนำตัวสั้นๆ..."
                  />
                </div>

                {/* Occupation & Location (Image 1 style) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">อาชีพ (Occupation)</label>
                    <input
                      type="text"
                      value={profile.occupation || ''}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="เช่น Gamer, Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">ที่อยู่ (Location)</label>
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="Bangkok, Thailand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Rotating Titles (Typewriter Effect - คั่นด้วยเครื่องหมายจุลภาค ,)
                  </label>
                  <input
                    type="text"
                    value={profile.titles.join(', ')}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        titles: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Full-stack Developer, Gamer, Night Owl"
                  />
                </div>
              </div>
            )}

            {/* 2. Theme & Style Tab (Inspired by yura.lol layout screenshot) */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Shortcut to Name Effects (yura.lol style) */}
                <div
                  onClick={() => setActiveTab('effects')}
                  className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-all flex items-center justify-between cursor-pointer group shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>เอฟเฟกต์ชื่อ (Name Effects)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                          34 เอฟเฟกต์ ปลดล็อกฟรี 100%
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        {profile.theme.extraEffects?.nameEffects && profile.theme.extraEffects.nameEffects.length > 0
                          ? `กำลังใช้งาน: ${profile.theme.extraEffects.nameEffects.join(' + ')}`
                          : 'Typewriter, Glitch, Glow, Wave, Flames, Rainbow และอีกมากมาย คลิกเพื่อเลือก'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>เลือกเอฟเฟกต์</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 1. เลย์เอาต์ (Layout Section) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">เลย์เอาต์</h3>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                      <span>ขั้นสูง</span>
                      <input
                        type="checkbox"
                        checked={layoutAdvanced}
                        onChange={(e) => setLayoutAdvanced(e.target.checked)}
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <p className="text-xs text-white/50">ปรับการจัดวางองค์ประกอบโปรไฟล์ของคุณ</p>

                  {/* 3 Layout Wireframes */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Layout 1: Centered */}
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, theme: { ...profile.theme, layout: 'center' } })}
                      className={`group p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${
                        (profile.theme.layout || 'center') === 'center'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Mini Wireframe: Centered */}
                      <div className="w-full h-16 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center justify-center gap-1.5 p-2">
                        <div className="w-5 h-5 rounded-full bg-white/40 border border-white/60" />
                        <div className="w-12 h-1.5 rounded-full bg-white/50" />
                        <div className="w-8 h-1 rounded-full bg-white/20" />
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">ตรงกลาง</span>
                    </button>

                    {/* Layout 2: Left-Aligned / Horizontal */}
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, theme: { ...profile.theme, layout: 'left' } })}
                      className={`group p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${
                        profile.theme.layout === 'left'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Mini Wireframe: Left */}
                      <div className="w-full h-16 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center gap-2 p-2">
                        <div className="w-6 h-6 rounded-full bg-white/40 border border-white/60 flex-shrink-0" />
                        <div className="flex-1 flex flex-col gap-1 items-start">
                          <div className="w-full h-1.5 rounded-full bg-white/50" />
                          <div className="w-3/4 h-1 rounded-full bg-white/20" />
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">ซ้าย-ขวา</span>
                    </button>

                    {/* Layout 3: Compact */}
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, theme: { ...profile.theme, layout: 'compact' } })}
                      className={`group p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${
                        profile.theme.layout === 'compact'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Mini Wireframe: Compact */}
                      <div className="w-full h-16 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between p-2">
                        <div className="w-5 h-5 rounded-full bg-white/40" />
                        <div className="flex flex-col gap-1 items-center">
                          <div className="w-8 h-1.5 rounded-full bg-white/50" />
                          <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>
                        <div className="w-3.5 h-3.5 rounded bg-emerald-500/40" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">กะทัดรัด</span>
                    </button>
                  </div>

                  {/* Advanced Custom CSS Mode */}
                  {layoutAdvanced && (
                    <div className="space-y-2 pt-2 border-t border-white/10 animate-in fade-in">
                      <p className="text-[11px] text-emerald-400">
                        ✨ เปิดใช้คุณสมบัตินี้เพื่อเพิ่มโค้ดหรือเขียนสไตล์เอง เช่น CSS เฉพาะตัว
                      </p>
                      <div className="rounded-xl border border-white/15 bg-black/70 overflow-hidden font-mono text-xs">
                        <div className="bg-white/5 px-3 py-1.5 border-b border-white/10 text-[10px] text-white/50 flex justify-between">
                          <span>custom-style.css</span>
                          <span>CSS Editor</span>
                        </div>
                        <div className="flex">
                          <div className="select-none px-2.5 py-2 text-white/20 text-right bg-white/[0.02] border-r border-white/5 text-[11px] space-y-0.5">
                            <div>1</div>
                            <div>2</div>
                            <div>3</div>
                            <div>4</div>
                            <div>5</div>
                          </div>
                          <textarea
                            rows={5}
                            value={profile.theme.customCss || ''}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                theme: { ...profile.theme, customCss: e.target.value },
                              })
                            }
                            placeholder="/* เขียนโค้ด CSS สำหรับโปรไฟล์ของคุณที่นี่ */&#10;.card {&#10;  /* box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); */&#10;}"
                            className="flex-1 bg-transparent p-2 text-emerald-300 text-[11px] focus:outline-none resize-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button for Layout */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    บันทึก
                  </button>
                </div>

                {/* 2. การ์ดโปรไฟล์ (Profile Card Section) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">การ์ดโปรไฟล์</h3>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                      <span>ขั้นสูง</span>
                      <input
                        type="checkbox"
                        checked={cardAdvanced}
                        onChange={(e) => setCardAdvanced(e.target.checked)}
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <p className="text-xs text-white/50">
                    นี่คือรูปลักษณ์ภายนอกของโปรไฟล์คุณ เลือกว่าจะแต่งโทนไหนและรูปร่างหน้าต่างอย่างไร
                  </p>

                  {/* 6 Card Styles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'glassmorphic', name: 'กลาสมอร์ฟิก', desc: 'กระจกฝ้าหรูหรา' },
                      { id: 'frosted-square', name: 'ฟรอสเต็ด สแควร์', desc: 'กระจกเข้มคมชัด' },
                      { id: 'frosted-soft', name: 'ฟรอสเต็ด ซอฟต์', desc: 'กระจกนุ่มนวล' },
                      { id: 'neon', name: 'ขอบนีออน', desc: 'เรืองแสงสะดุดตา' },
                      { id: 'cyber', name: 'ไซเบอร์พังค์', desc: 'แทคติคอลล้ำยุค' },
                      { id: 'transparent', name: 'โปร่งใส', desc: 'มินิมอลโปร่งแสง' },
                    ].map((item) => {
                      const isSelected = (profile.theme.cardStyle || 'glassmorphic') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, cardStyle: item.id as ThemeConfig['cardStyle'] },
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-white mb-0.5">{item.name}</div>
                          <div className="text-[10px] text-white/50">{item.desc}</div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Corner Shapes / Border Radius */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold text-white/70">มุม/ขอบ (Corner Shape)</label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'sharp', label: 'เหลี่ยมฉาก', rounded: 'rounded-none' },
                        { id: 'rounded', label: 'โค้งมน', rounded: 'rounded-lg' },
                        { id: 'extra-rounded', label: 'มนมาก', rounded: 'rounded-xl' },
                        { id: 'capsule', label: 'แคปซูล', rounded: 'rounded-2xl' },
                        { id: 'leaf', label: 'ใบไม้', rounded: 'rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm' },
                      ].map((c) => {
                        const isSelected = (profile.theme.cornerShape || 'rounded') === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                theme: { ...profile.theme, cornerShape: c.id as ThemeConfig['cornerShape'] },
                              })
                            }
                            title={c.label}
                            className={`flex-1 py-2.5 px-1 border transition-all flex flex-col items-center gap-1.5 ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                                : 'border-white/10 bg-white/5 hover:border-white/30 text-white/60'
                            }`}
                          >
                            <div className={`w-5 h-5 border-2 border-current ${c.rounded}`} />
                            <span className="text-[9px] font-medium">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Sliders */}
                  {cardAdvanced && (
                    <div className="space-y-3 pt-3 border-t border-white/10 animate-in fade-in">
                      <div>
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Card Opacity (ความทึบของการ์ด)</span>
                          <span>{profile.theme.cardOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="95"
                          value={profile.theme.cardOpacity}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, cardOpacity: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Glass Blur (ความเบลอของกระจก)</span>
                          <span>{profile.theme.cardBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={profile.theme.cardBlur}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, cardBlur: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Corner Radius (ความโค้งมนของการ์ด)</span>
                          <span>{profile.theme.cardRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={profile.theme.cardRadius}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, cardRadius: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save Button for Card */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    บันทึก
                  </button>
                </div>

                {/* 3. Bottom Row: 2 Columns for Colors & Fonts (Image Bottom Section) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: สี (Colors) */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#121319] space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">สี (Colors)</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Accent Color */}
                      <div>
                        <label className="block text-[11px] font-semibold text-white/70 mb-1">เน้น (Accent)</label>
                        <input
                          type="color"
                          value={profile.theme.accentColor || '#22c55e'}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, accentColor: e.target.value, glowColor: e.target.value },
                            })
                          }
                          className="w-full h-9 rounded-xl bg-transparent cursor-pointer border border-white/20 p-1"
                        />
                      </div>

                      {/* Name Color */}
                      <div>
                        <label className="block text-[11px] font-semibold text-white/70 mb-1">ชื่อ (Name)</label>
                        <input
                          type="color"
                          value={profile.theme.nameColor || '#ffffff'}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, nameColor: e.target.value },
                            })
                          }
                          className="w-full h-9 rounded-xl bg-transparent cursor-pointer border border-white/20 p-1"
                        />
                      </div>

                      {/* Text Color */}
                      <div>
                        <label className="block text-[11px] font-semibold text-white/70 mb-1">ข้อความ (Text)</label>
                        <input
                          type="color"
                          value={profile.theme.textColor || '#d1d5db'}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, textColor: e.target.value },
                            })
                          }
                          className="w-full h-9 rounded-xl bg-transparent cursor-pointer border border-white/20 p-1"
                        />
                      </div>
                    </div>

                    {/* Save Button for Colors */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSave}
                      className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      บันทึก
                    </button>
                  </div>

                  {/* Right: ฟอนต์ (Fonts) */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-[#121319] space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">ฟอนต์ (Fonts)</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name Font */}
                      <FontPickerDropdown
                        label="Name Font (ฟอนต์ชื่อ)"
                        value={profile.theme.nameFont || 'FC Vision (TH)'}
                        onChange={(newFont) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, nameFont: newFont },
                          })
                        }
                      />

                      {/* Text Font */}
                      <FontPickerDropdown
                        label="Text Font (ฟอนต์ข้อความ)"
                        value={profile.theme.textFont || 'FC Vision (TH)'}
                        onChange={(newFont) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, textFont: newFont },
                          })
                        }
                      />
                    </div>

                    {/* Save Button for Fonts */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSave}
                      className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      บันทึก
                    </button>
                  </div>
                </div>

                {/* 4. Background & Extra Effects */}
                <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <h3 className="text-sm font-bold text-white tracking-wide">พื้นหลัง & เอฟเฟกต์ (Background)</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Background Effect (พื้นหลัง)</label>
                    <select
                      value={profile.theme.backgroundType}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          theme: { ...profile.theme, backgroundType: e.target.value as ThemeConfig['backgroundType'] },
                        })
                      }
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="stars" className="bg-neutral-900">✨ Ambient Stars (ดวงดาวลอย)</option>
                      <option value="particles" className="bg-neutral-900">🔮 Floating Particles (ละอองนีออน)</option>
                      <option value="cyber-rain" className="bg-neutral-900">🌧️ Cyber Rain / Matrix (ฝนดิจิทัล)</option>
                      <option value="custom-image" className="bg-neutral-900">🖼️ Custom Image / GIF (รูปหรือกิฟต์ส่วนตัว)</option>
                      <option value="custom-video" className="bg-neutral-900">🎬 Custom Looping Video (วิดีโอ MP4 คลอ)</option>
                    </select>
                  </div>

                  {profile.theme.backgroundType === 'custom-image' && (
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Image / GIF URL</label>
                      <input
                        type="text"
                        value={profile.theme.backgroundImageUrl || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, backgroundImageUrl: e.target.value },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        placeholder="https://... (URL ของรูปภาพหรือ GIF)"
                      />
                    </div>
                  )}

                  {profile.theme.backgroundType === 'custom-video' && (
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Video URL (รองรับ YouTube หรือ ลิงก์ตรง .mp4)
                      </label>
                      <input
                        type="text"
                        value={profile.theme.backgroundVideoUrl || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, backgroundVideoUrl: e.target.value },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        placeholder="https://youtu.be/... หรือ https://.../video.mp4"
                      />
                      <p className="text-[11px] text-emerald-400 mt-1">
                        ✨ รองรับทั้งลิงก์ YouTube (youtu.be / watch?v=) และไฟล์วิดีโอ .mp4 ระบบจะเล่นวนซ้ำอัตโนมัติ
                      </p>
                    </div>
                  )}

                  {/* Click to Enter Toggle */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <label className="flex items-center gap-2.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profile.theme.clickToEnter !== false}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, clickToEnter: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className="font-semibold text-white">
                        เปิดหน้าจอ &quot;[ CLICK ANYWHERE TO ENTER ]&quot; ก่อนเข้าโปรไฟล์
                      </span>
                    </label>

                    {profile.theme.clickToEnter !== false && (
                      <div className="pl-6.5 pt-1">
                        <input
                          type="text"
                          value={profile.theme.enterMessage || ''}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              theme: { ...profile.theme, enterMessage: e.target.value },
                            })
                          }
                          placeholder="[ CLICK ANYWHERE TO ENTER ]"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.theme.glowEffect}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, glowEffect: e.target.checked },
                          })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>เอฟเฟกต์แสงนีออนรอบการ์ด (Neon Glow)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.theme.customCursor}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            theme: { ...profile.theme, customCursor: e.target.checked },
                          })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Crosshair Cursor (เมาส์พิเศษ)</span>
                    </label>
                  </div>

                  {/* 4. เอฟเฟกต์เสริม (Appearance Toggles - yura.lol style) */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#121319] space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">เอฟเฟกต์เสริม (Appearance Effects)</h3>
                    </div>
                    <p className="text-xs text-white/50">เปิด/ปิดแอนิเมชันและการตอบสนองพิเศษของโปรไฟล์</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Toggle: แอนิเมชันยอดเข้าชม */}
                      <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">แอนิเมชันยอดเข้าชม</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              theme: {
                                ...prev.theme,
                                extraEffects: {
                                  ...(prev.theme.extraEffects || {}),
                                  viewsAnimation: !prev.theme.extraEffects?.viewsAnimation,
                                },
                              },
                            }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                            profile.theme.extraEffects?.viewsAnimation ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              profile.theme.extraEffects?.viewsAnimation ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Toggle: ไอคอนเรืองแสง */}
                      <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">ไอคอนเรืองแสง</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              theme: {
                                ...prev.theme,
                                extraEffects: {
                                  ...(prev.theme.extraEffects || {}),
                                  glowIcons: prev.theme.extraEffects?.glowIcons === false ? true : false,
                                },
                              },
                            }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                            profile.theme.extraEffects?.glowIcons !== false ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              profile.theme.extraEffects?.glowIcons !== false ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Toggle: การ์ดเอียงตามเมาส์ */}
                      <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <Sliders className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">การ์ดเอียงตามเมาส์</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              theme: {
                                ...prev.theme,
                                extraEffects: {
                                  ...(prev.theme.extraEffects || {}),
                                  cardTilt: !prev.theme.extraEffects?.cardTilt,
                                },
                              },
                            }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                            profile.theme.extraEffects?.cardTilt ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              profile.theme.extraEffects?.cardTilt ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Toggle: แสงวิ่งตามขอบ */}
                      <div className="px-4 py-3 rounded-2xl border border-white/10 bg-[#14151b] hover:border-white/20 transition-all flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                          <Flame className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" />
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">แสงวิ่งตามขอบ</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              theme: {
                                ...prev.theme,
                                extraEffects: {
                                  ...(prev.theme.extraEffects || {}),
                                  borderBeam: !prev.theme.extraEffects?.borderBeam,
                                },
                              },
                            }))
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-0.5 cursor-pointer ${
                            profile.theme.extraEffects?.borderBeam ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/15'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              profile.theme.extraEffects?.borderBeam ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button for Background */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="w-full py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    บันทึก
                  </button>
                </div>
              </div>
            )}

            {/* 2.5 Extra Effects Tab (✨ เอฟเฟกต์เสริม) */}
            {activeTab === 'effects' && (
              <ExtraEffectsView
                profile={profile}
                onUpdateProfile={setProfile}
                onSave={handleSave}
                saving={saving}
              />
            )}

            {/* 3. Audio & Music Tab */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.audio.enabled}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        audio: { ...profile.audio, enabled: e.target.checked },
                      })
                    }
                    className="rounded accent-purple-500"
                  />
                  <span className="font-semibold text-white/90">เปิดใช้งานเพลงพื้นหลัง (Background Audio)</span>
                </label>

                {profile.audio.enabled && (
                  <div className="space-y-4 pt-2">
                    {/* Presets */}
                    <div>
                      <span className="block text-xs font-semibold text-white/70 mb-2">เลือกเพลงตัวอย่างฟรี:</span>
                      <div className="space-y-2">
                        {AUDIO_PRESETS.map((p) => {
                          const isSpotify = p.platform === 'spotify';
                          return (
                            <button
                              key={p.url}
                              type="button"
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  audio: {
                                    ...profile.audio,
                                    audioUrl: p.url,
                                    songTitle: p.title,
                                    artist: p.artist,
                                  },
                                });
                                if (isSpotify) {
                                  handleAudioUrlChange(p.url);
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                                profile.audio.audioUrl === p.url
                                  ? isSpotify
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                                    : 'border-purple-500 bg-purple-500/10 text-purple-300'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isSpotify ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306a.75.75 0 0 1-1.03.248c-2.82-1.723-6.37-2.113-10.55-1.157a.75.75 0 0 1-.334-1.462c4.58-1.045 8.52-.603 11.666 1.341.36.22.47.69.248 1.03zm1.47-3.268a.937.937 0 0 1-1.288.309c-3.227-1.984-8.146-2.558-11.963-1.399a.938.938 0 1 1-.548-1.794c4.37-1.326 9.79-.687 13.49 1.596.425.26.56.822.31 1.288zm.126-3.41c-3.87-2.298-10.257-2.51-13.945-1.391a1.125 1.125 0 1 1-.655-2.154c4.24-1.287 11.29-1.043 15.75 1.606a1.125 1.125 0 0 1-1.15 1.94z" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                                    <Music className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium flex items-center gap-1.5">
                                    {p.title}
                                    {isSpotify && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                                        SPOTIFY
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-white/40">{p.artist}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-white/70">
                          Audio URL (รองรับ Spotify, YouTube หรือไฟล์ตรง .mp3)
                        </label>
                        {fetchingSpotify && (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> กำลังดึงข้อมูลจาก Spotify...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={profile.audio.audioUrl}
                        onChange={(e) => handleAudioUrlChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="https://open.spotify.com/track/... หรือ https://youtu.be/... หรือ .mp3"
                      />
                      <p className="text-[11px] text-emerald-300/80 mt-1">
                        ✨ รองรับลิงก์ Spotify (Track, Playlist, Album), YouTube และไฟล์ .mp3 ทั่วไป
                      </p>

                      {/* Detected Spotify Info Banner */}
                      {getSpotifyInfo(profile.audio.audioUrl) && (
                        <div className="mt-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 flex items-center justify-between gap-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 fill-current drop-shadow-[0_0_6px_#10b981]" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306a.75.75 0 0 1-1.03.248c-2.82-1.723-6.37-2.113-10.55-1.157a.75.75 0 0 1-.334-1.462c4.58-1.045 8.52-.603 11.666 1.341.36.22.47.69.248 1.03zm1.47-3.268a.937.937 0 0 1-1.288.309c-3.227-1.984-8.146-2.558-11.963-1.399a.938.938 0 1 1-.548-1.794c4.37-1.326 9.79-.687 13.49 1.596.425.26.56.822.31 1.288zm.126-3.41c-3.87-2.298-10.257-2.51-13.945-1.391a1.125 1.125 0 1 1-.655-2.154c4.24-1.287 11.29-1.043 15.75 1.606a1.125 1.125 0 0 1-1.15 1.94z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                                ตรวจพบเพลงจาก Spotify ({getSpotifyInfo(profile.audio.audioUrl)?.type.toUpperCase()})
                              </div>
                              <div className="text-[11px] text-white/60">
                                แสดง Spotify Player Widget เล่นเพลงได้โดยตรงบนหน้าโปรไฟล์
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={fetchingSpotify}
                            onClick={() => handleAudioUrlChange(profile.audio.audioUrl)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all flex items-center gap-1 flex-shrink-0"
                            title="ดึงชื่อเพลงและศิลปินใหม่อีกครั้ง"
                          >
                            {fetchingSpotify ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            ดึงข้อมูล
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Song Title</label>
                        <input
                          type="text"
                          value={profile.audio.songTitle}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              audio: { ...profile.audio, songTitle: e.target.value },
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="ชื่อเพลง"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Artist Name</label>
                        <input
                          type="text"
                          value={profile.audio.artist}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              audio: { ...profile.audio, artist: e.target.value },
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="ชื่อศิลปิน"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>Default Volume</span>
                        <span>{profile.audio.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={profile.audio.volume}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            audio: { ...profile.audio, volume: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Social Links Tab */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">โซเชียลมีเดีย & ลิงก์</span>
                  <button
                    onClick={addSocialLink}
                    className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg text-xs flex items-center gap-1 text-purple-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มลิงก์</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {profile.socialLinks.map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 relative group"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={link.platform}
                          onChange={(e) => updateSocialLink(idx, { platform: e.target.value as SocialLink['platform'] })}
                          className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="discord">Discord</option>
                          <option value="steam">Steam</option>
                          <option value="spotify">Spotify</option>
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="github">GitHub</option>
                          <option value="youtube">YouTube</option>
                          <option value="twitch">Twitch</option>
                          <option value="twitter">X / Twitter</option>
                          <option value="telegram">Telegram</option>
                          <option value="custom">Custom Web</option>
                        </select>

                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateSocialLink(idx, { label: e.target.value })}
                          placeholder="ชื่อปุ่ม เช่น Discord"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                        />

                        <button
                          onClick={() => removeSocialLink(idx)}
                          className="text-white/40 hover:text-red-400 p-1"
                          title="ลบลิงก์"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                        placeholder="URL เช่น https://discord.gg/..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Badges Tab */}
            {activeTab === 'badges' && (
              <div className="space-y-6">
                {/* Active Badges Capsule Preview */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">
                      แคปซูลเหรียญตราบนโปรไฟล์ ({profile.badges.length})
                    </span>
                  </div>

                  {profile.badges.length > 0 ? (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                      <BadgeBar badges={profile.badges} />
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 text-center py-3">
                      ยังไม่มีเหรียญตราที่ครอบครอง (เหรียญตราทั้งหมดถูกล็อก จะได้รับจากการแต่งตั้งโดยผู้ดูแลระบบเท่านั้น)
                    </p>
                  )}

                  {/* List of currently equipped badges */}
                  {profile.badges.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {profile.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0"
                              style={{
                                color: badge.color || '#fff',
                                filter: `drop-shadow(0 0 5px ${badge.color || '#fff'})`,
                              }}
                            >
                              <BadgeIcon icon={badge.icon} color={badge.color} className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-white truncate">{badge.name}</div>
                              <div className="text-[10px] text-white/50 truncate">{badge.description}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>รับรองโดยระบบ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* STEPHOD Badge Catalog (Locked) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white/90 tracking-wide uppercase font-mono block">
                        คลังตราสัญลักษณ์ (STEPHOD CATALOG)
                      </span>
                      <span className="text-[10px] text-white/50">
                        เหรียญตราทั้งหมดถูกล็อก 🔒 มอบโดยผู้ดูแลระบบหรือกิจกรรมพิเศษเท่านั้น
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>ล็อกทั้งหมด</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRESET_BADGES.map((preset) => {
                      const isEquipped = profile.badges.some(
                        (b) => b.name === preset.name || b.icon === preset.icon || b.id === preset.id
                      );

                      return (
                        <div
                          key={preset.id}
                          className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isEquipped
                              ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                              : 'border-white/10 bg-white/[0.02] opacity-80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0"
                              style={{
                                color: preset.color,
                                filter: isEquipped ? `drop-shadow(0 0 6px ${preset.color}90)` : undefined,
                              }}
                            >
                              <BadgeIcon icon={preset.icon} color={preset.color} className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                <span>{preset.name}</span>
                              </div>
                              <div className="text-[10px] text-white/50 truncate">
                                {preset.description}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0 ml-2 flex items-center gap-1 ${
                              isEquipped
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>ได้รับแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>ล็อก</span>
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. Discord Widget Tab */}
            {activeTab === 'discord' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.discordWidget?.enabled}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        discordWidget: {
                          ...profile.discordWidget,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-purple-500"
                  />
                  <span className="font-semibold text-white/90">แสดง Discord Live Presence Widget</span>
                </label>

                {profile.discordWidget?.enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Discord User ID (สำหรับดึงสถานะสดผ่าน Lanyard)
                      </label>
                      <input
                        type="text"
                        value={profile.discordWidget.discordId || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            discordWidget: {
                              ...profile.discordWidget,
                              discordId: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        placeholder="เช่น 96105829983191040"
                      />
                      <p className="text-[11px] text-white/40 mt-1">
                        หากเซิร์ฟเวอร์เปิดใช้งาน Lanyard ระบบจะดึงสถานะออนไลน์, เพลงที่กำลังฟังใน Spotify, หรือเกมที่กำลังเล่นมาแสดงผลแบบเรียลไทม์
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Fallback Custom Status
                      </label>
                      <input
                        type="text"
                        value={profile.discordWidget.customStatus || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            discordWidget: {
                              ...profile.discordWidget,
                              customStatus: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="เช่น Coding with Antigravity ⚡"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export / Import Section at bottom */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="ดาวน์โหลดไฟล์ .json เพื่อเก็บสำรองหรือส่งให้เพื่อน"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Real-Time Live Preview Pane */}
        <div className="flex-1 bg-[#07080c] relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden min-h-[500px]">
          {/* Preview Toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-1.5 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-white/70 tracking-wider">LIVE PREVIEW</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-full backdrop-blur-md">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-full transition-colors ${
                  previewDevice === 'desktop' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-full transition-colors ${
                  previewDevice === 'mobile' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Frame Container */}
          <div
            className={`transition-all duration-300 w-full flex items-center justify-center overflow-auto h-full ${
              previewDevice === 'mobile'
                ? 'max-w-[390px] h-[780px] border-[6px] border-neutral-800 rounded-[44px] shadow-2xl relative overflow-hidden bg-black'
                : 'max-w-full'
            }`}
          >
            <ProfileView profile={profile} isPreview={true} />
          </div>
        </div>
      </div>
      )}
      </main>

      {/* Avatar Decoration Picker Modal (Discord Avatar Frames) */}
      <AvatarDecorationModal
        isOpen={isDecorationModalOpen}
        onClose={() => setIsDecorationModalOpen(false)}
        avatarUrl={profile.avatarUrl}
        initialDecoration={profile.avatarDecoration}
        onSave={(newDecoration) => {
          setProfile({
            ...profile,
            avatarDecoration: newDecoration,
          });
        }}
      />
    </div>
  );
}
