import fs from 'fs';
import path from 'path';
import { ProfileData } from '@/types/profile';

const CLOUD_DB_TOKEN = process.env.CLOUD_DB_TOKEN || 'MQtLVyembPnxdpR74HeB';
const CLOUD_DB_BASE = 'https://api.echovalue.dev/kv/default';

export const DEFAULT_PROFILES: Record<string, ProfileData> = {
  zrx4r: {
    username: 'zrx4r',
    displayName: 'Valen',
    avatarUrl:
      'https://media.discordapp.net/attachments/1248927528694059123/1558428669485121639/anime-boy-blue-hair-aesthetic-pfp-43_online-video-cutter.com.gif?ex=6af9d868&is=6af886e8&hm=bfa8a3680e6c556b64d9fb84cf423c92df718361fb5591eb10a2ca575ad8d4f4',
    avatarDecoration: {
      url: 'https://cdn.discordapp.com/avatar-decoration-presets/a_c3c09bd122898be35093d0d59850f627.png?size=240&passthrough=true',
      name: 'Soul Leaving Body',
      hue: 0,
      shape: 'circle',
    },
    bannerUrl:
      'https://media.discordapp.net/attachments/1248927528694059121/1562821205976793691/a642950754555de0eadee9dccd258af8_online-video-cutter.com.gif?ex=6af9b4ac&is=6af8632c&hm=56c9b5d4f27894f6bb3ed1092b6f701cfcfa016beccc81a387d52038097f66e5',
    bio: 'Developer & Gamer',
    occupation: 'STEPHOAD',
    titles: ['Gaming Enthusiast', 'Cyber Realm', 'Always Online'],
    location: 'Bangkok, Thailand',
    badges: [
      { id: '1', name: 'รุ่นแรก (Early Adopter)', icon: 'leaf', description: 'รับตรารุ่นแรกจำนวนจำกัดหลังเปิดตัว', color: '#10b981' },
      { id: '2', name: 'พรีเมียม (Premium)', icon: 'diamond', description: 'สมาชิกพรีเมียม', color: '#ef4444' },
      { id: '3', name: 'ยืนยันแล้ว (Verified)', icon: 'verified', description: 'บัญชีได้รับการยืนยันตัวตน', color: '#ffffff' },
      { id: '4', name: 'ยอดนิยม (Popular)', icon: 'star', description: 'โปรไฟล์มียอดชมยอดนิยม', color: '#ffffff' },
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
      accentColor: '#10b981',
      glowColor: '#059669',
      cardOpacity: 35,
      cardBlur: 16,
      cardRadius: 24,
      backgroundType: 'stars',
      customCursor: true,
      glowEffect: true,
      typewriterSpeed: 90,
      layout: 'center',
      extraEffects: {
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
      },
    },
    audio: {
      enabled: false,
      audioUrl: '',
      songTitle: '',
      artist: '',
      loop: true,
      volume: 50,
    },
    discordWidget: {
      enabled: true,
      discordId: '96105829983191040',
      customStatus: 'Online with STEPHOD ⚡',
      customActivity: 'Gaming Enthusiast',
    },
    views: 126,
    likes: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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

// Global in-memory cache
let inMemoryProfiles: Record<string, ProfileData> = { ...DEFAULT_PROFILES };
let initialized = false;

interface ActiveSession {
  lastSeen: number;
  enteredAt: number;
}

// In-memory real-time visitor presence map: username -> (visitorId -> session)
const activeVisitors: Record<string, Record<string, ActiveSession>> = {};

function getStorageFilePath(): string {
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

    const seedPath = path.join(process.cwd(), 'data', 'profiles.json');
    if (fs.existsSync(seedPath)) {
      try {
        const seedRaw = fs.readFileSync(seedPath, 'utf-8');
        inMemoryProfiles = { ...DEFAULT_PROFILES, ...JSON.parse(seedRaw) };
      } catch {}
    }

    persistProfiles();
  } catch (err) {
    console.warn('Storage init note:', err);
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
    console.warn('Storage persist note:', err);
  }
}

// Fetch from Cloud KV (multi-chunk reconstruction)
export async function fetchProfileFromCloud(username: string): Promise<ProfileData | null> {
  const key = username.toLowerCase().trim();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const [rBasic, rUrls, rTheme, rSocial] = await Promise.all([
      fetch(`${CLOUD_DB_BASE}/p_basic_${key}`, {
        headers: { 'x-token': CLOUD_DB_TOKEN },
        signal: controller.signal,
        cache: 'no-store',
      }),
      fetch(`${CLOUD_DB_BASE}/p_urls_${key}`, {
        headers: { 'x-token': CLOUD_DB_TOKEN },
        signal: controller.signal,
        cache: 'no-store',
      }),
      fetch(`${CLOUD_DB_BASE}/p_theme_${key}`, {
        headers: { 'x-token': CLOUD_DB_TOKEN },
        signal: controller.signal,
        cache: 'no-store',
      }),
      fetch(`${CLOUD_DB_BASE}/p_social_${key}`, {
        headers: { 'x-token': CLOUD_DB_TOKEN },
        signal: controller.signal,
        cache: 'no-store',
      }),
    ]);

    clearTimeout(timeout);

    if (!rBasic.ok) return null;

    const basic = await rBasic.json();
    if (!basic || !basic.username) return null;

    let urls: any = {};
    let themeData: any = {};
    let social: any = {};

    if (rUrls.ok) try { urls = await rUrls.json(); } catch {}
    if (rTheme.ok) try { themeData = await rTheme.json(); } catch {}
    if (rSocial.ok) try { social = await rSocial.json(); } catch {}

    const merged: ProfileData = {
      ...basic,
      avatarUrl: urls.avatarUrl || basic.avatarUrl || '',
      bannerUrl: urls.bannerUrl || basic.bannerUrl || '',
      avatarDecoration: urls.avatarDecoration || basic.avatarDecoration,
      theme: themeData.theme || basic.theme || { accentColor: '#10b981' },
      audio: themeData.audio || basic.audio,
      discordWidget: themeData.discordWidget || basic.discordWidget,
      badges: social.badges || basic.badges || [],
      socialLinks: social.socialLinks || basic.socialLinks || [],
      views: social.views ?? basic.views ?? 0,
      likes: social.likes ?? basic.likes ?? 0,
    };

    inMemoryProfiles[key] = merged;
    return merged;
  } catch (err) {
    return null;
  }
}

// Push to Cloud KV (multi-chunk)
export async function pushProfileToCloud(profile: ProfileData): Promise<void> {
  const key = profile.username.toLowerCase().trim();
  try {
    const basic = {
      username: key,
      displayName: profile.displayName,
      bio: profile.bio || '',
      occupation: profile.occupation || '',
      location: profile.location || '',
      titles: profile.titles || [],
      updatedAt: profile.updatedAt || new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
    };

    const urls = {
      avatarUrl: profile.avatarUrl || '',
      bannerUrl: profile.bannerUrl || '',
      avatarDecoration: profile.avatarDecoration || { type: 'none' },
    };

    const themeData = {
      theme: profile.theme,
      audio: profile.audio,
      discordWidget: profile.discordWidget,
    };

    const social = {
      badges: profile.badges || [],
      socialLinks: profile.socialLinks || [],
      views: profile.views || 0,
      likes: profile.likes || 0,
    };

    await Promise.all([
      fetch(`${CLOUD_DB_BASE}/p_basic_${key}`, {
        method: 'POST',
        headers: { 'x-token': CLOUD_DB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(basic),
      }),
      fetch(`${CLOUD_DB_BASE}/p_urls_${key}`, {
        method: 'POST',
        headers: { 'x-token': CLOUD_DB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(urls),
      }),
      fetch(`${CLOUD_DB_BASE}/p_theme_${key}`, {
        method: 'POST',
        headers: { 'x-token': CLOUD_DB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(themeData),
      }),
      fetch(`${CLOUD_DB_BASE}/p_social_${key}`, {
        method: 'POST',
        headers: { 'x-token': CLOUD_DB_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(social),
      }),
    ]);
  } catch (err) {
    console.warn('Cloud KV push note:', err);
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

export async function getProfileAsync(username: string): Promise<ProfileData | null> {
  initProfiles();
  const key = username.toLowerCase().trim();

  // Try cloud KV first for instant real-time sync across Vercel instances
  const cloud = await fetchProfileFromCloud(key);
  if (cloud) {
    return cloud;
  }

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

  // Fire-and-forget sync to cloud KV
  pushProfileToCloud(updated).catch(() => {});

  return updated;
}

export async function saveProfileAsync(profile: ProfileData): Promise<ProfileData> {
  const updated = saveProfile(profile);
  await pushProfileToCloud(updated);
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

export function recordPresence(username: string, visitorId: string, isEnter: boolean = false) {
  initProfiles();
  const key = username.toLowerCase().trim();
  const now = Date.now();

  if (!activeVisitors[key]) {
    activeVisitors[key] = {};
  }

  const isNewVisit = isEnter && !activeVisitors[key][visitorId];
  if (isNewVisit) {
    incrementViews(key);
  }

  activeVisitors[key][visitorId] = {
    lastSeen: now,
    enteredAt: activeVisitors[key][visitorId]?.enteredAt || now,
  };

  const cutoff = now - 25000;
  for (const vid in activeVisitors[key]) {
    if (activeVisitors[key][vid].lastSeen < cutoff) {
      delete activeVisitors[key][vid];
    }
  }

  const liveViewers = Math.max(1, Object.keys(activeVisitors[key]).length);
  const totalViews = inMemoryProfiles[key]?.views || 0;

  return { liveViewers, totalViews, isNewVisit };
}

export function getLiveViewers(username: string): number {
  const key = username.toLowerCase().trim();
  if (!activeVisitors[key]) return 1;
  const cutoff = Date.now() - 25000;
  let count = 0;
  for (const vid in activeVisitors[key]) {
    if (activeVisitors[key][vid].lastSeen >= cutoff) {
      count++;
    }
  }
  return Math.max(1, count);
}
