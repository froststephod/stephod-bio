import fs from 'fs';
import path from 'path';
import { ProfileData } from '@/types/profile';

export const DEFAULT_PROFILES: Record<string, ProfileData> = {
  pun: {
    username: 'pun',
    displayName: 'Pun ✨',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    avatarDecoration: {
      url: 'https://cdn.discordapp.com/avatar-decoration-presets/a_1005898c6acf56a9ac5010baf444f6fd.png?size=240&passthrough=true',
      name: 'Spirit Embers',
      hue: 0,
      shape: 'circle',
    },
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: 'Coding late at night 🌙 • Developer & Gamer • Living in the cyber realm',
    occupation: 'Full-stack Developer',
    titles: ['Full-stack Developer', 'Cyber Enthusiast', 'Music Addict', 'Always Online'],
    location: 'Bangkok, Thailand',
    badges: [
      { id: '1', name: 'ผู้ชวนเพื่อน', icon: 'mug', description: 'ชวนเพื่อน 3 คนเข้าเซิร์ฟเวอร์ Discord', color: '#ef4444' },
      { id: '2', name: 'พรีเมียม (Premium)', icon: 'diamond', description: 'สมาชิกพรีเมียม', color: '#ef4444' },
      { id: '3', name: 'ยืนยันแล้ว (Verified)', icon: 'verified', description: 'บัญชีได้รับการยืนยันตัวตน', color: '#ffffff' },
      { id: '4', name: 'ยอดนิยม (Popular)', icon: 'star', description: 'โปรไฟล์มียอดชมยอดนิยม', color: '#ffffff' },
      { id: '5', name: 'รุ่นแรก (Early Adopter)', icon: 'leaf', description: 'ตรารุ่นแรกจำนวนจำกัด', color: '#ffffff' },
    ],
    socialLinks: [
      { id: 's1', platform: 'discord', label: 'Discord', url: 'https://discord.com' },
      { id: 's2', platform: 'steam', label: 'Steam', url: 'https://steamcommunity.com' },
      { id: 's3', platform: 'spotify', label: 'Spotify', url: 'https://spotify.com' },
      { id: 's4', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
      { id: 's5', platform: 'github', label: 'GitHub', url: 'https://github.com' },
      { id: 's6', platform: 'tiktok', label: 'TikTok', url: 'https://tiktok.com' },
    ],
    theme: {
      accentColor: '#a855f7',
      glowColor: '#9333ea',
      cardOpacity: 35,
      cardBlur: 16,
      cardRadius: 24,
      backgroundType: 'stars',
      backgroundImageUrl: '',
      backgroundVideoUrl: '',
      customCursor: true,
      glowEffect: true,
      typewriterSpeed: 100,
    },
    audio: {
      enabled: true,
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      songTitle: 'Lofi Study Night (Chill)',
      artist: 'FASSounds',
      loop: true,
      volume: 60,
    },
    discordWidget: {
      enabled: true,
      discordId: '96105829983191040',
      customStatus: 'Coding with Antigravity ⚡',
      customActivity: 'Playing with Code',
    },
    views: 1284,
    likes: 342,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  friend: {
    username: 'friend',
    displayName: 'Alex (Friend)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    avatarDecoration: {
      url: 'https://cdn.discordapp.com/avatar-decoration-presets/a_c3c09bd122898be35093d0d59850f627.png?size=240&passthrough=true',
      name: 'Soul Leaving Body',
      hue: 0,
      shape: 'squircle',
    },
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bio: 'Chill vibes only 🎧 | Designing the future',
    occupation: 'UI/UX Designer',
    titles: ['UI/UX Designer', 'Music Lover', 'Coffee Addict'],
    location: 'Chiang Mai, Thailand',
    badges: [
      { id: 'b1', name: 'Designer', icon: '🎨', description: 'Pixel Perfect', color: '#10b981' },
      { id: 'b2', name: 'Verified', icon: '✨', description: 'Awesome Friend', color: '#06b6d4' },
    ],
    socialLinks: [
      { id: 's1', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
      { id: 's2', platform: 'spotify', label: 'My Playlist', url: 'https://spotify.com' },
      { id: 's3', platform: 'discord', label: 'Discord', url: 'https://discord.com' },
    ],
    theme: {
      accentColor: '#06b6d4',
      glowColor: '#0891b2',
      cardOpacity: 30,
      cardBlur: 20,
      cardRadius: 28,
      backgroundType: 'particles',
      backgroundImageUrl: '',
      backgroundVideoUrl: '',
      customCursor: false,
      glowEffect: true,
      typewriterSpeed: 120,
    },
    audio: {
      enabled: true,
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-chill-medium-version-159456.mp3',
      songTitle: 'Sunset Chill Beat',
      artist: 'SoulProd',
      loop: true,
      volume: 50,
    },
    discordWidget: {
      enabled: false,
    },
    views: 450,
    likes: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Global in-memory cache to guarantee zero-crash execution in any runtime (Vercel Serverless / Lambda / Local)
let inMemoryProfiles: Record<string, ProfileData> = { ...DEFAULT_PROFILES };
let initialized = false;

interface ActiveSession {
  lastSeen: number;
  enteredAt: number;
}

// In-memory real-time visitor presence map: username -> (visitorId -> session)
const activeVisitors: Record<string, Record<string, ActiveSession>> = {};

function getStorageFilePath(): string {
  // If running on Vercel or Lambda serverless, write to /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'profiles.json');
  }
  return path.join(process.cwd(), 'data', 'profiles.json');
}

function initProfiles() {
  if (initialized) return;
  initialized = true;

  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      inMemoryProfiles = { ...DEFAULT_PROFILES, ...JSON.parse(raw) };
      return;
    }

    // Check project data folder for initial seed
    const seedPath = path.join(process.cwd(), 'data', 'profiles.json');
    if (fs.existsSync(seedPath)) {
      try {
        const seedRaw = fs.readFileSync(seedPath, 'utf-8');
        inMemoryProfiles = { ...DEFAULT_PROFILES, ...JSON.parse(seedRaw) };
      } catch {}
    }

    // Try to write initial copy to writable location (safe try-catch)
    persistProfiles();
  } catch (err) {
    console.warn('Storage init note (using in-memory fallback):', err);
  }
}

function persistProfiles() {
  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(inMemoryProfiles, null, 2), 'utf-8');
  } catch (err) {
    // If filesystem is read-only, safely retain state in memory
    console.warn('Storage persist note (data retained in memory):', err);
  }
}

export function getAllProfiles(): Record<string, ProfileData> {
  initProfiles();
  return inMemoryProfiles;
}

export function getProfile(username: string): ProfileData | null {
  initProfiles();
  const key = username.toLowerCase().trim();
  return inMemoryProfiles[key] || null;
}

export function saveProfile(profile: ProfileData): ProfileData {
  initProfiles();
  const key = profile.username.toLowerCase().trim();
  const existing = inMemoryProfiles[key];

  const updated: ProfileData = {
    ...profile,
    username: key,
    views: existing ? existing.views : (profile.views || 0),
    likes: existing ? existing.likes : (profile.likes || 0),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryProfiles[key] = updated;
  persistProfiles();
  return updated;
}

export function incrementViews(username: string): number {
  initProfiles();
  const key = username.toLowerCase().trim();
  if (inMemoryProfiles[key]) {
    inMemoryProfiles[key].views = (inMemoryProfiles[key].views || 0) + 1;
    persistProfiles();
    return inMemoryProfiles[key].views;
  }
  return 0;
}

export function incrementLikes(username: string): number {
  initProfiles();
  const key = username.toLowerCase().trim();
  if (inMemoryProfiles[key]) {
    inMemoryProfiles[key].likes = (inMemoryProfiles[key].likes || 0) + 1;
    persistProfiles();
    return inMemoryProfiles[key].likes;
  }
  return 0;
}

/**
 * Real-time presence tracking: records visitor activity and calculates active live viewers
 */
export function recordPresence(
  username: string,
  visitorId: string,
  isEnter: boolean = false
): { liveViewers: number; totalViews: number; isNewVisit: boolean } {
  initProfiles();
  const key = username.toLowerCase().trim();
  const now = Date.now();

  if (!activeVisitors[key]) {
    activeVisitors[key] = {};
  }

  const isNewVisit = !activeVisitors[key][visitorId];
  activeVisitors[key][visitorId] = {
    lastSeen: now,
    enteredAt: activeVisitors[key][visitorId]?.enteredAt || now,
  };

  // Clean up sessions older than 30 seconds
  for (const [id, session] of Object.entries(activeVisitors[key])) {
    if (now - session.lastSeen > 30000) {
      delete activeVisitors[key][id];
    }
  }

  // If this is a new visit upon entering, increment the profile views
  let totalViews = inMemoryProfiles[key]?.views || 0;
  if (isEnter && isNewVisit) {
    totalViews = incrementViews(key);
  }

  const liveViewers = Math.max(1, Object.keys(activeVisitors[key]).length);
  return { liveViewers, totalViews, isNewVisit };
}

export function getLiveViewers(username: string): number {
  const key = username.toLowerCase().trim();
  const now = Date.now();
  if (!activeVisitors[key]) return 1;

  for (const [id, session] of Object.entries(activeVisitors[key])) {
    if (now - session.lastSeen > 30000) {
      delete activeVisitors[key][id];
    }
  }

  return Math.max(1, Object.keys(activeVisitors[key]).length);
}
