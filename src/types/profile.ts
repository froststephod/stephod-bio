export interface SocialLink {
  id: string;
  platform: 'discord' | 'steam' | 'github' | 'instagram' | 'youtube' | 'twitch' | 'tiktok' | 'twitter' | 'spotify' | 'telegram' | 'custom';
  label: string;
  url: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon key
  description: string;
  color?: string;
}

export interface ExtraEffectsConfig {
  nameEffects?: string[]; // e.g. ['typewriter', 'glow'] (up to 3)
  bioEffects?: string[]; // e.g. ['typewriter', 'shimmer']
  pageOverlay?: 'none' | 'scanlines' | 'vhs' | 'noise' | 'vignette' | 'grid';
  cursorTrail?: 'none' | 'sparkles' | 'hearts' | 'bubbles' | 'stars' | 'smoke';
  bgEffect?: 'none' | 'shooting-stars' | 'fog-waves' | 'sakura' | 'digital-rain';
  entranceAnimation?: 'none' | 'fade-in' | 'zoom' | 'drop' | 'slide-up' | 'flip';
  viewsAnimation?: boolean; // แอนิเมชันยอดเข้าชม
  cardTilt?: boolean; // การ์ดเอียงตามเมาส์
  glowIcons?: boolean; // ไอคอนเรืองแสง
  borderBeam?: boolean; // แสงวิ่งตามขอบ
  audioVisualizer?: boolean; // วิชวลไลเซอร์เสียง
  typewriterSpeed?: number; // ความเร็วพิมพ์ดีด (ms per char) e.g. 35ms
  pauseDuration?: number; // ระยะเวลาหยุดรอคำถัดไป (ms) e.g. 500ms
}

export interface ThemeConfig {
  accentColor: string; // Hex e.g. #a855f7
  glowColor: string;
  cardOpacity: number; // 0 to 100
  cardBlur: number; // blur in px
  cardRadius: number; // rounded in px
  backgroundType: 'stars' | 'particles' | 'cyber-rain' | 'custom-image' | 'custom-video' | 'gradient';
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
  customCursor: boolean;
  glowEffect: boolean;
  typewriterSpeed: number; // ms
  clickToEnter?: boolean; // toggle splash screen on/off
  enterMessage?: string; // custom enter text

  // Appearance & Layout Features (yura.lol inspired)
  layout?: 'center' | 'left' | 'compact';
  cardStyle?: 'glassmorphic' | 'frosted-square' | 'frosted-soft' | 'neon' | 'cyber' | 'transparent';
  cornerShape?: 'rounded' | 'sharp' | 'extra-rounded' | 'capsule' | 'leaf';
  nameColor?: string;
  textColor?: string;
  nameFont?: string;
  textFont?: string;
  customCss?: string;

  // Extra Effects (เอฟเฟกต์เสริม)
  extraEffects?: ExtraEffectsConfig;
}

export interface AudioConfig {
  enabled: boolean;
  audioUrl: string;
  songTitle: string;
  artist: string;
  loop: boolean;
  volume: number; // 0 - 100
}

export interface DiscordWidgetConfig {
  enabled: boolean;
  discordId?: string; // For Lanyard API
  customStatus?: string;
  customActivity?: string;
}

export interface AvatarDecoration {
  id?: string;
  name?: string;
  url?: string; // Direct Discord CDN APNG URL
  type?: string; // 'none' or preset key
  hue: number; // 0 - 360
  shape: 'circle' | 'squircle' | 'soft-square';
}

export interface AuthUser {
  id: string; // user ID
  username: string; // username
  displayName?: string; // Display name
  globalName?: string; // Discord / legacy display name
  avatar?: string; // avatar URL
  profileUsername: string; // The bio-profile linked to this user
}

export interface ProfileData {
  username: string; // URL slug, e.g. "pun" -> /pun
  ownerDiscordId?: string; // Discord ID of the account owner
  ownerDiscordTag?: string; // e.g. "pun#1337" or "pun"
  displayName: string;
  avatarUrl: string;
  avatarDecoration?: AvatarDecoration;
  bannerUrl?: string;
  bio: string;
  occupation?: string;
  titles: string[]; // Rotating / typewriter titles
  location?: string;
  badges: Badge[];
  socialLinks: SocialLink[];
  theme: ThemeConfig;
  audio: AudioConfig;
  discordWidget: DiscordWidgetConfig;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  // Admin moderation (set only through the admin backend)
  banned?: boolean;
  banReason?: string;
  bannedAt?: string;
}
