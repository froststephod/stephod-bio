import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { kvDelete, kvRead, kvSet, readChunkMeta } from './cloud-kv';
import {
  DEFAULT_PROFILES,
  deleteProfileFromCloud,
  getAllProfiles,
  getProfileStateAsync,
  readUserIndex,
  saveProfileAsync,
} from './storage';
import type { Badge, ProfileData } from '@/types/profile';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
export const ADMIN_COOKIE = 'stephod_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_ADMINS = 10;

export type AdminRole = 'owner' | 'admin';
export interface AdminSession {
  role: AdminRole;
  name: string;
  exp: number;
}

/** The owner password lives ONLY in the ADMIN_OWNER_PASSWORD environment variable. */
export function adminConfigured(): boolean {
  return !!process.env.ADMIN_OWNER_PASSWORD && process.env.ADMIN_OWNER_PASSWORD.length >= 8;
}

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    createHash('sha256')
      .update('stephod-admin|' + (process.env.ADMIN_OWNER_PASSWORD || ''))
      .digest('hex')
  );
}

function hmac(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

// ---------------------------------------------------------------------------
// Session cookie (HMAC-signed, httpOnly)
// ---------------------------------------------------------------------------
export function createSessionToken(role: AdminRole, name: string): string {
  const payload = Buffer.from(
    JSON.stringify({ role, name, exp: Date.now() + SESSION_TTL_MS } as AdminSession)
  ).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function parseSessionToken(token?: string | null): AdminSession | null {
  if (!token || !adminConfigured()) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, hmac(payload))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    if (!s || (s.role !== 'owner' && s.role !== 'admin') || !s.name || s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

/** Verifies the request is from a logged-in admin (and, for non-owners, that the account still exists). */
export async function requireAdmin(
  req: NextRequest,
  minRole: AdminRole = 'admin'
): Promise<AdminSession | null> {
  const session = parseSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return null;
  if (minRole === 'owner' && session.role !== 'owner') return null;
  if (session.role === 'admin') {
    const acc = await readAdminAccount(session.name);
    if (!acc) return null; // removed -> session revoked
  }
  return session;
}

// ---------------------------------------------------------------------------
// Login rate limiting (best-effort, per server instance)
// ---------------------------------------------------------------------------
const attempts = new Map<string, { fails: number; until: number }>();

export function loginBlockedFor(ip: string): number {
  const a = attempts.get(ip);
  if (!a) return 0;
  return a.until > Date.now() ? Math.ceil((a.until - Date.now()) / 1000) : 0;
}

function registerFailure(ip: string) {
  const a = attempts.get(ip) || { fails: 0, until: 0 };
  a.fails += 1;
  if (a.fails >= 5) {
    a.until = Date.now() + 10 * 60 * 1000;
    a.fails = 0;
  }
  attempts.set(ip, a);
}

// ---------------------------------------------------------------------------
// Admin accounts (owner-managed). Records are HMAC-signed so a forged KV
// write cannot create a working admin.
// ---------------------------------------------------------------------------
interface AdminAccount {
  n: string; // name (key)
  s: string; // salt
  h: string; // scrypt hash (hex)
  c: number; // created at
  by: string;
  sig: string;
}

const NAME_RE = /^[a-z0-9_-]{2,20}$/;

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

function accountSig(n: string, s: string, h: string): string {
  return hmac(`acc|${n}|${s}|${h}`);
}

async function readAdminNames(): Promise<string[] | null> {
  const r = await kvRead<string[]>('adm_names');
  if (r.status === 'missing') return [];
  if (r.status === 'error' || !Array.isArray(r.data)) return null;
  return r.data.filter((x) => typeof x === 'string' && NAME_RE.test(x));
}

async function readAdminAccount(name: string): Promise<AdminAccount | null> {
  if (!NAME_RE.test(name)) return null;
  const r = await kvRead<AdminAccount>(`adm_acc_${name}`);
  if (r.status !== 'ok') return null;
  const a = r.data;
  if (!a || a.n !== name || !safeEqual(a.sig || '', accountSig(a.n, a.s, a.h))) return null;
  return a;
}

export async function listAdmins(): Promise<{ name: string; createdAt: number; by: string }[]> {
  const names = (await readAdminNames()) || [];
  const accounts = await Promise.all(names.map((n) => readAdminAccount(n)));
  return accounts
    .filter((a): a is AdminAccount => !!a)
    .map((a) => ({ name: a.n, createdAt: a.c, by: a.by }));
}

export async function createAdmin(
  name: string,
  password: string,
  by: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  name = name.trim().toLowerCase();
  if (!NAME_RE.test(name)) return { ok: false, error: 'ชื่อแอดมินต้องเป็น a-z 0-9 _ - ความยาว 2-20 ตัว' };
  if (password.length < 8) return { ok: false, error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' };
  if (password.length > 100) return { ok: false, error: 'รหัสผ่านยาวเกินไป' };

  const names = await readAdminNames();
  if (names === null) return { ok: false, error: 'อ่านรายชื่อแอดมินไม่สำเร็จ ลองใหม่อีกครั้ง' };
  if (names.includes(name)) return { ok: false, error: 'มีแอดมินชื่อนี้อยู่แล้ว' };
  if (names.length >= MAX_ADMINS) return { ok: false, error: `เพิ่มแอดมินได้สูงสุด ${MAX_ADMINS} คน` };

  // Login is password-only, so every password must be unique
  if (safeEqual(password, process.env.ADMIN_OWNER_PASSWORD || '')) {
    return { ok: false, error: 'รหัสผ่านนี้ใช้ไม่ได้ กรุณาตั้งรหัสอื่น' };
  }
  for (const n of names) {
    const acc = await readAdminAccount(n);
    if (acc && safeEqual(hashPassword(password, acc.s), acc.h)) {
      return { ok: false, error: 'รหัสผ่านนี้ถูกใช้กับแอดมินคนอื่นแล้ว กรุณาตั้งรหัสอื่น' };
    }
  }

  const salt = randomBytes(16).toString('hex');
  const h = hashPassword(password, salt);
  const account: AdminAccount = { n: name, s: salt, h, c: Date.now(), by, sig: accountSig(name, salt, h) };
  if (!(await kvSet(`adm_acc_${name}`, account))) return { ok: false, error: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' };
  if (!(await kvSet('adm_names', [...names, name]))) return { ok: false, error: 'บันทึกรายชื่อไม่สำเร็จ ลองใหม่อีกครั้ง' };
  return { ok: true };
}

export async function removeAdmin(name: string): Promise<boolean> {
  name = name.trim().toLowerCase();
  const names = await readAdminNames();
  if (names === null || !names.includes(name)) return false;
  const okNames = await kvSet('adm_names', names.filter((n) => n !== name));
  await kvDelete(`adm_acc_${name}`);
  return okNames;
}

/** Password-only login: owner password first, then every admin account. */
export async function loginWithPassword(
  password: string,
  ip: string
): Promise<{ session: AdminSession; token: string } | { error: string; status: number }> {
  if (!adminConfigured()) return { error: 'ยังไม่ได้ตั้งค่า ADMIN_OWNER_PASSWORD บนเซิร์ฟเวอร์', status: 503 };
  const wait = loginBlockedFor(ip);
  if (wait > 0) return { error: `ลองผิดหลายครั้ง กรุณารออีก ${wait} วินาที`, status: 429 };
  if (!password || password.length > 100) {
    registerFailure(ip);
    return { error: 'รหัสผ่านไม่ถูกต้อง', status: 401 };
  }

  if (safeEqual(password, process.env.ADMIN_OWNER_PASSWORD!)) {
    attempts.delete(ip);
    const session = { role: 'owner' as const, name: 'owner', exp: Date.now() + SESSION_TTL_MS };
    return { session, token: createSessionToken('owner', 'owner') };
  }

  const names = (await readAdminNames()) || [];
  for (const n of names) {
    const acc = await readAdminAccount(n);
    if (acc && safeEqual(hashPassword(password, acc.s), acc.h)) {
      attempts.delete(ip);
      const session = { role: 'admin' as const, name: acc.n, exp: Date.now() + SESSION_TTL_MS };
      return { session, token: createSessionToken('admin', acc.n) };
    }
  }

  registerFailure(ip);
  await new Promise((r) => setTimeout(r, 700)); // slow down guessing
  return { error: 'รหัสผ่านไม่ถูกต้อง', status: 401 };
}

// ---------------------------------------------------------------------------
// Audit log: 3 pages x 8 newest entries (KV values are capped at 1000 bytes)
// ---------------------------------------------------------------------------
export interface AuditEntry {
  t: number; // epoch seconds
  a: string; // admin name
  x: string; // action code
  g: string; // target
}
const AUDIT_PAGE = 8;
const AUDIT_PAGES = 3;

export async function appendAudit(admin: string, action: string, target = ''): Promise<void> {
  try {
    const entry: AuditEntry = {
      t: Math.floor(Date.now() / 1000),
      a: admin.slice(0, 20),
      x: action.slice(0, 16),
      g: target.slice(0, 20),
    };
    const pages = await Promise.all(
      Array.from({ length: AUDIT_PAGES }, (_, i) => kvRead<AuditEntry[]>(`adm_audit_${i}`))
    );
    const data = pages.map((p) => (p.status === 'ok' && Array.isArray(p.data) ? p.data : []));
    if (pages.some((p) => p.status === 'error')) return; // avoid clobbering on a failed read

    if (data[0].length < AUDIT_PAGE) {
      await kvSet('adm_audit_0', [entry, ...data[0]]);
    } else {
      await Promise.all([
        kvSet('adm_audit_2', data[1]),
        kvSet('adm_audit_1', data[0]),
        kvSet('adm_audit_0', [entry]),
      ]);
    }
  } catch {
    /* auditing must never break an admin action */
  }
}

export async function readAudit(): Promise<AuditEntry[]> {
  const pages = await Promise.all(
    Array.from({ length: AUDIT_PAGES }, (_, i) => kvRead<AuditEntry[]>(`adm_audit_${i}`))
  );
  return pages.flatMap((p) => (p.status === 'ok' && Array.isArray(p.data) ? p.data : []));
}

// ---------------------------------------------------------------------------
// Site-wide announcement (signed)
// ---------------------------------------------------------------------------
export interface Announcement {
  text: string;
  type: 'info' | 'warn' | 'success';
  on: boolean;
  t: number;
  by: string;
}
type SignedAnnouncement = Announcement & { sig: string };

function annSig(a: Announcement): string {
  return hmac(`ann|${a.text}|${a.type}|${a.on}|${a.t}|${a.by}`);
}

export async function getAnnouncement(): Promise<Announcement | null> {
  if (!adminConfigured()) return null;
  const r = await kvRead<SignedAnnouncement>('adm_announce', 2500);
  if (r.status !== 'ok') return null;
  const { sig, ...a } = r.data;
  if (!sig || !safeEqual(sig, annSig(a))) return null;
  return a;
}

export async function setAnnouncement(
  text: string,
  type: Announcement['type'],
  on: boolean,
  by: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  text = text.trim().slice(0, 160);
  if (!['info', 'warn', 'success'].includes(type)) type = 'info';
  const a: Announcement = { text, type, on: on && text.length > 0, t: Date.now(), by: by.slice(0, 20) };
  const ok = await kvSet('adm_announce', { ...a, sig: annSig(a) });
  return ok ? { ok: true } : { ok: false, error: 'บันทึกประกาศไม่สำเร็จ (ข้อความอาจยาวเกินไป)' };
}

// ---------------------------------------------------------------------------
// Badge presets an admin can grant from Admin Console
// ---------------------------------------------------------------------------
export const ADMIN_BADGE_PRESETS: Badge[] = [
  { id: 'adm_verified', name: 'ยืนยันแล้ว (Verified)', icon: 'verified', description: 'บัญชีได้รับการยืนยันตัวตน', color: '#ffffff' },
  { id: 'adm_staff', name: 'พนักงาน (Staff)', icon: 'hammer', description: 'ทีมงานของ STEPHOD', color: '#10b981' },
  { id: 'adm_premium', name: 'พรีเมียม (Premium)', icon: 'diamond', description: 'สมาชิกพรีเมียม', color: '#ef4444' },
  { id: 'adm_early', name: 'รุ่นแรก (Early Adopter)', icon: 'leaf', description: 'รับตรารุ่นแรกจำนวนจำกัดหลังเปิดตัว', color: '#ffffff' },
  { id: 'adm_popular', name: 'ดาวเด่น / ยอดนิยม', icon: 'star', description: 'โปรไฟล์มียอดชม 5,000 ครั้ง', color: '#ffffff' },
  { id: 'adm_booster', name: 'บูสเตอร์ (Booster)', icon: 'booster', description: 'บูสต์เซิร์ฟเวอร์ Discord ของเราอยู่', color: '#ec4899' },
  { id: 'adm_crown', name: 'OG สมาชิกยุคแรก', icon: 'crown', description: 'สมัครก่อนมีผู้ใช้ครบ 500 คน', color: '#f59e0b' },
  { id: 'adm_partner', name: 'พาร์ทเนอร์ (Partner)', icon: 'heart', description: 'พาร์ทเนอร์อย่างเป็นทางการ', color: '#06b6d4' },
  { id: 'adm_trophy', name: 'ผู้ชนะอีเวนต์', icon: 'trophy', description: 'ชนะอีเวนต์ที่จัดขึ้น', color: '#eab308' },
  { id: 'adm_fire', name: 'กำลังมาแรง (Trending)', icon: 'fire', description: 'โปรไฟล์มียอดชม 1,000 ครั้ง', color: '#f97316' },
  { id: 'adm_dev', name: 'นักพัฒนา (Developer)', icon: 'dev', description: 'ผู้สร้างระบบและเขียนโค้ด', color: '#3b82f6' },
  { id: 'adm_mug', name: 'ผู้ชวนเพื่อน / ดื่มฉลอง', icon: 'mug', description: 'ชวนเพื่อน 3 คนเข้าเซิร์ฟเวอร์ Discord', color: '#ef4444' },
];

export const ADMIN_BADGE_PREFIX = 'adm_';

/** Keeps admin-granted badges and moderation flags when a user saves their own profile. */
export function preserveAdminFields(incoming: ProfileData, existing: ProfileData | null): ProfileData {
  if (!existing) {
    return { ...incoming, badges: [], banned: undefined, banReason: undefined, bannedAt: undefined };
  }
  return {
    ...incoming,
    badges: existing.badges || [],
    banned: existing.banned,
    banReason: existing.banReason,
    bannedAt: existing.bannedAt,
  };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export interface UserRow {
  username: string;
  displayName: string;
  owner: string;
  views: number;
  likes: number;
  banned: boolean;
  updatedAt: string;
}

export async function listUsers(): Promise<{ users: UserRow[]; indexComplete: boolean }> {
  const idx = await readUserIndex();
  const names = Array.from(
    new Set([...idx.names, ...Object.keys(DEFAULT_PROFILES), ...Object.keys(getAllProfiles())])
  );

  const rows: UserRow[] = [];
  for (let i = 0; i < names.length; i += 8) {
    const batch = names.slice(i, i + 8);
    const results = await Promise.all(
      batch.map(async (name): Promise<UserRow | null> => {
        const meta = await readChunkMeta(`pf_${name}`);
        if (meta.status === 'ok' && meta.data.deleted) return null;
        if (meta.status === 'ok' && meta.data.s) {
          const s = meta.data.s as Record<string, any>;
          return {
            username: name,
            displayName: String(s.d || name),
            owner: String(s.o || ''),
            views: Number(s.w) || 0,
            likes: Number(s.k) || 0,
            banned: s.b === 1,
            updatedAt: String(s.u || ''),
          };
        }
        const p = getAllProfiles()[name] || DEFAULT_PROFILES[name];
        if (!p) return null;
        return {
          username: name,
          displayName: p.displayName,
          owner: p.ownerDiscordTag || '',
          views: p.views || 0,
          likes: p.likes || 0,
          banned: !!p.banned,
          updatedAt: p.updatedAt,
        };
      })
    );
    rows.push(...results.filter((r): r is UserRow => !!r));
  }
  rows.sort((a, b) => b.views - a.views);
  return { users: rows, indexComplete: idx.complete };
}

export interface UserPatch {
  displayName?: string;
  bio?: string;
  occupation?: string;
  location?: string;
  banned?: boolean;
  banReason?: string;
  addBadge?: string; // preset id
  removeBadge?: string; // badge id
}

const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

export async function adminUpdateUser(
  username: string,
  patch: UserPatch
): Promise<{ ok: true; profile: ProfileData; actions: string[] } | { ok: false; error: string; status: number }> {
  const state = await getProfileStateAsync(username);
  if (!state.profile) return { ok: false, error: 'ไม่พบโปรไฟล์นี้', status: 404 };

  const p: ProfileData = { ...state.profile };
  const actions: string[] = [];

  if (patch.displayName !== undefined) {
    const v = clip(patch.displayName, 40);
    if (!v) return { ok: false, error: 'ชื่อที่แสดงห้ามว่าง', status: 400 };
    if (v !== p.displayName) { p.displayName = v; actions.push('edit'); }
  }
  if (patch.bio !== undefined) { p.bio = clip(patch.bio, 300); actions.push('edit'); }
  if (patch.occupation !== undefined) { p.occupation = clip(patch.occupation, 60); actions.push('edit'); }
  if (patch.location !== undefined) { p.location = clip(patch.location, 60); actions.push('edit'); }

  if (patch.banned !== undefined) {
    if (patch.banned) {
      p.banned = true;
      p.banReason = clip(patch.banReason, 80);
      p.bannedAt = new Date().toISOString();
      actions.push('ban');
    } else {
      p.banned = false;
      p.banReason = undefined;
      p.bannedAt = undefined;
      actions.push('unban');
    }
  }

  if (patch.addBadge) {
    const preset = ADMIN_BADGE_PRESETS.find((b) => b.id === patch.addBadge);
    if (!preset) return { ok: false, error: 'ไม่พบตราที่เลือก', status: 400 };
    if (!(p.badges || []).some((b) => b.id === preset.id)) {
      p.badges = [preset, ...(p.badges || [])];
      actions.push('badge+');
    }
  }
  if (patch.removeBadge) {
    const before = (p.badges || []).length;
    p.badges = (p.badges || []).filter((b) => b.id !== patch.removeBadge);
    if (p.badges.length !== before) actions.push('badge-');
  }

  if (actions.length === 0) return { ok: true, profile: p, actions };

  const saved = await saveProfileAsync(p);
  return { ok: true, profile: saved.profile, actions: Array.from(new Set(actions)) };
}

export async function adminDeleteUser(username: string): Promise<boolean> {
  return deleteProfileFromCloud(username);
}
