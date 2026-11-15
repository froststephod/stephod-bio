import fs from 'fs';
import path from 'path';
import { ProfileData } from '@/types/profile';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'profiles.json');

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

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PROFILES, null, 2), 'utf-8');
  }
}

export function getAllProfiles(): Record<string, ProfileData> {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading profiles file:', e);
    return DEFAULT_PROFILES;
  }
}

export function getProfile(username: string): ProfileData | null {
  const profiles = getAllProfiles();
  const key = username.toLowerCase().trim();
  return profiles[key] || null;
}

export function saveProfile(profile: ProfileData): ProfileData {
  ensureDataFile();
  const profiles = getAllProfiles();
  const key = profile.username.toLowerCase().trim();
  const existing = profiles[key];

  const updated: ProfileData = {
    ...profile,
    username: key,
    views: existing ? existing.views : (profile.views || 0),
    likes: existing ? existing.likes : (profile.likes || 0),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  profiles[key] = updated;
  fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  return updated;
}

export function incrementViews(username: string): number {
  ensureDataFile();
  const profiles = getAllProfiles();
  const key = username.toLowerCase().trim();
  if (profiles[key]) {
    profiles[key].views = (profiles[key].views || 0) + 1;
    fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    return profiles[key].views;
  }
  return 0;
}

export function incrementLikes(username: string): number {
  ensureDataFile();
  const profiles = getAllProfiles();
  const key = username.toLowerCase().trim();
  if (profiles[key]) {
    profiles[key].likes = (profiles[key].likes || 0) + 1;
    fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    return profiles[key].likes;
  }
  return 0;
}
