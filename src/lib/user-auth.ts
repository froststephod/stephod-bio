import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import fs from 'fs';
import path from 'path';
import { kvRead, kvSet } from './cloud-kv';
import { addToUserIndex, getProfileStateAsync, saveProfileAsync } from './storage';
import { ProfileData, AuthUser } from '@/types/profile';

export const USER_SESSION_COOKIE = 'stephod_auth_session';

export interface UserAccount {
  username: string; // unique lowercase a-z0-9_-
  displayName: string;
  salt: string;
  hash: string;
  createdAt: string;
}

const USER_SECRET = process.env.USER_SESSION_SECRET || 'stephod-user-auth-secret-key-2026';
const inMemoryAccounts: Record<string, UserAccount> = {};
const ACCOUNTS_FILE = path.join(process.cwd(), 'data', 'accounts.json');

function initAccounts(): void {
  if (Object.keys(inMemoryAccounts).length > 0) return;
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.assign(inMemoryAccounts, parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to read accounts file:', e);
  }
}

function persistAccounts(): void {
  try {
    const dir = path.dirname(ACCOUNTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(inMemoryAccounts, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem in serverless environments is normal
  }
}

export function getAllAccountUsernames(): string[] {
  initAccounts();
  return Object.keys(inMemoryAccounts);
}

function hmac(data: string): string {
  return createHmac('sha256', USER_SECRET).update(data).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

export function createSessionCookie(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function parseSessionCookie(token?: string | null): AuthUser | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, hmac(payload))) {
    // Also fallback to un-signed legacy JSON if user had previous session
    try {
      const parsed = JSON.parse(decodeURIComponent(token));
      if (parsed && parsed.username) return parsed;
    } catch {}
    return null;
  }
  try {
    const raw = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function getUserAccount(username: string): Promise<UserAccount | null> {
  initAccounts();
  const clean = username.toLowerCase().trim();

  // 1. Check in-memory / local file
  if (inMemoryAccounts[clean]) {
    return inMemoryAccounts[clean];
  }

  // 2. Check Cloud KV
  try {
    const res = await kvRead<UserAccount>(`usr_acc_${clean}`);
    if (res.status === 'ok' && res.data) {
      inMemoryAccounts[clean] = res.data;
      persistAccounts();
      return res.data;
    }
  } catch {
    // Continue
  }

  return null;
}

export function createDefaultProfileForUser(username: string, displayName: string): ProfileData {
  return {
    username,
    displayName: displayName || username,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
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
    badges: [],
    socialLinks: [
      { id: 's1', platform: 'discord', label: 'Discord', url: 'https://discord.com' },
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
    },
    views: 0,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function registerUser(
  usernameRaw: string,
  displayNameRaw: string,
  passwordRaw: string
): Promise<{ ok: true; user: AuthUser; profile: ProfileData } | { ok: false; error: string }> {
  const username = usernameRaw.toLowerCase().trim();
  const displayName = displayNameRaw.trim();
  const password = passwordRaw;

  // Validation
  if (!username || !/^[a-z0-9_-]{3,20}$/.test(username)) {
    return { ok: false, error: 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9, _ หรือ - ความยาว 3-20 ตัวอักษร' };
  }
  if (!displayName || displayName.length > 40) {
    return { ok: false, error: 'กรุณากรอกชื่อที่แสดง (ความยาว 1-40 ตัวอักษร)' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
  }
  if (password.length > 100) {
    return { ok: false, error: 'รหัสผ่านยาวเกินไป' };
  }

  // Check if account already exists
  const existingAcc = await getUserAccount(username);
  if (existingAcc) {
    return { ok: false, error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น' };
  }

  // Check if profile already exists in Cloud KV or memory
  const existingProfile = await getProfileStateAsync(username);

  // Hash password
  const salt = randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  const account: UserAccount = {
    username,
    displayName: displayName || existingProfile.profile?.displayName || username,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to in-memory accounts and local data file
  initAccounts();
  inMemoryAccounts[username] = account;
  persistAccounts();

  // 2. Sync to Cloud KV resiliently (must await before serverless container frozen)
  try {
    await kvSet(`usr_acc_${username}`, account);
  } catch (err) {
    console.warn('kvSet usr_acc background sync notice:', err);
  }

  // 3. Create initial profile or link existing one
  let profile = existingProfile.profile;
  if (!profile || existingProfile.deleted) {
    profile = createDefaultProfileForUser(username, displayName);
    await saveProfileAsync(profile);
  }
  await addToUserIndex(username).catch(() => {});

  const authUser: AuthUser = {
    id: username,
    username,
    displayName,
    profileUsername: username,
  };

  return { ok: true, user: authUser, profile };
}

export async function loginUser(
  usernameRaw: string,
  passwordRaw: string
): Promise<{ ok: true; user: AuthUser; profile: ProfileData } | { ok: false; error: string }> {
  const username = usernameRaw.toLowerCase().trim();
  const password = passwordRaw;

  if (!username || !password) {
    return { ok: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
  }

  const account = await getUserAccount(username);
  if (!account) {
    return { ok: false, error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' };
  }

  const expectedHash = hashPassword(password, account.salt);
  if (!safeEqual(expectedHash, account.hash)) {
    return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  }

  // Get user profile
  const state = await getProfileStateAsync(username);
  let profile = state.profile;
  if (!profile || state.deleted) {
    profile = createDefaultProfileForUser(username, account.displayName);
    await saveProfileAsync(profile);
  }

  if (profile.banned) {
    return {
      ok: false,
      error: `บัญชีนี้ถูกระงับการใช้งาน ${profile.banReason ? `(${profile.banReason})` : ''}`,
    };
  }

  const authUser: AuthUser = {
    id: username,
    username,
    displayName: account.displayName || username,
    profileUsername: username,
  };

  return { ok: true, user: authUser, profile };
}
