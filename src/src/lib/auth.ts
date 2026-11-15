import { ProfileData, AuthUser } from '@/types/profile';
import { getAllProfiles, saveProfile } from './storage';
import { SESSION_COOKIE_NAME, DEMO_DISCORD_USERS } from './auth-constants';

export { SESSION_COOKIE_NAME, DEMO_DISCORD_USERS };

/**
 * Finds the profile owned by a specific Discord user ID
 */
export function findProfileByDiscordId(discordId: string): ProfileData | null {
  const profiles = getAllProfiles();
  for (const key of Object.keys(profiles)) {
    if (profiles[key].ownerDiscordId === discordId) {
      return profiles[key];
    }
  }
  return null;
}

/**
 * Creates or retrieves the single profile owned by this Discord user
 */
export function createOrGetProfileForDiscordUser(discordUser: {
  id: string;
  username: string;
  globalName?: string;
  avatar?: string;
}): ProfileData {
  const existingByDiscord = findProfileByDiscordId(discordUser.id);
  if (existingByDiscord) {
    return existingByDiscord;
  }

  // Check if a profile with this username already exists
  const cleanUsername = discordUser.username.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user${discordUser.id.slice(-4)}`;
  const profiles = getAllProfiles();
  const existingByUsername = profiles[cleanUsername];

  if (existingByUsername && (!existingByUsername.ownerDiscordId || existingByUsername.ownerDiscordId === discordUser.id)) {
    // Bind existing profile to this Discord user
    const updated: ProfileData = {
      ...existingByUsername,
      ownerDiscordId: discordUser.id,
      ownerDiscordTag: discordUser.username,
      avatarUrl: discordUser.avatar || existingByUsername.avatarUrl,
      displayName: discordUser.globalName || existingByUsername.displayName,
    };
    return saveProfile(updated);
  }

  // Pick a unique username slug
  let targetUsername = cleanUsername;
  let counter = 1;
  while (profiles[targetUsername] && profiles[targetUsername].ownerDiscordId !== discordUser.id) {
    targetUsername = `${cleanUsername}${counter}`;
    counter++;
  }

  // Create brand new profile for this user
  const newProfile: ProfileData = {
    username: targetUsername,
    ownerDiscordId: discordUser.id,
    ownerDiscordTag: discordUser.username,
    displayName: discordUser.globalName || discordUser.username,
    avatarUrl:
      discordUser.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    avatarDecoration: {
      type: 'none',
      hue: 0,
      shape: 'circle',
    },
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: 'ยินดีต้อนรับสู่หน้าโปรไฟล์ STEPHOD ของฉัน ✨',
    occupation: 'STEPHOD Member',
    titles: ['STEPHOD Member', 'Gaming Enthusiast'],
    location: 'Bangkok, Thailand',
    badges: [
      {
        id: 'b_leaf',
        name: 'รุ่นแรก (Early Adopter)',
        icon: 'leaf',
        description: 'รับตรารุ่นแรกจำนวนจำกัดหลังเปิดตัว',
        color: '#10b981',
      },
    ],
    socialLinks: [
      { id: 's1', platform: 'discord', label: 'Discord', url: `https://discord.com` },
    ],
    theme: {
      accentColor: '#10b981',
      glowColor: '#059669',
      cardOpacity: 30,
      cardBlur: 16,
      cardRadius: 24,
      backgroundType: 'stars',
      customCursor: true,
      glowEffect: true,
      typewriterSpeed: 100,
      layout: 'center',
      cardStyle: 'glassmorphic',
      cornerShape: 'rounded',
      nameFont: 'FC Vision (TH)',
      textFont: 'FC Vision (TH)',
      nameColor: '#ffffff',
      textColor: '#d1d5db',
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
      enabled: false,
      discordId: discordUser.id,
    },
    views: 0,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveProfile(newProfile);
}

/**
 * Generate Discord OAuth2 URL
 */
export function getDiscordOAuthUrl(redirectUri: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID || '123456789012345678';
  const encodedRedirect = encodeURIComponent(redirectUri);
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirect}&response_type=code&scope=identify%20guilds`;
}
