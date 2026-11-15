import fs from 'fs';
import path from 'path';
import { ProfileData } from '@/types/profile';
import { saveChunkedDoc, loadChunkedDoc, tombstoneChunkedDoc, kvRead, kvSet, kvDelete } from './cloud-kv';

const CLOUD_DB_TOKEN =
  process.env.CLOUD_DB_TOKEN && process.env.CLOUD_DB_TOKEN !== 'MQtLVyembPnxdpR74HeB'
    ? process.env.CLOUD_DB_TOKEN
    : 'xCHpEi1b8zIMkMxCXhBj';
const CLOUD_DB_BASE = 'https://api.echovalue.dev/kv/default';

export const DEFAULT_PROFILES: Record<string, ProfileData> = {};

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

    // Also persist to repository data/profiles.json if writable
    const seedPath = path.join(process.cwd(), 'data', 'profiles.json');
    if (fs.existsSync(seedPath) && seedPath !== filePath) {
      try {
        fs.writeFileSync(seedPath, JSON.stringify(inMemoryProfiles, null, 2), 'utf-8');
      } catch {}
    }
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

// ---------------------------------------------------------------------------
// Cloud persistence (full profile, versioned chunks). Returns true only when
// every chunk AND the meta record were written successfully.
// ---------------------------------------------------------------------------
function profileSummary(p: ProfileData): Record<string, unknown> {
  return {
    d: (p.displayName || '').slice(0, 40),
    w: p.views || 0,
    k: p.likes || 0,
    b: p.banned ? 1 : 0,
    o: (p.ownerDiscordTag || '').slice(0, 32),
    u: p.updatedAt,
  };
}

export async function pushProfileToCloud(profile: ProfileData): Promise<boolean> {
  const key = profile.username.toLowerCase().trim();
  const ok = await saveChunkedDoc(`pf_${key}`, profile, profileSummary(profile));
  if (ok) {
    addToUserIndex(key).catch(() => {});
  } else {
    console.warn('Cloud save failed for profile', key);
  }
  return ok;
}

export async function deleteProfileFromCloud(username: string): Promise<boolean> {
  const key = username.toLowerCase().trim();
  delete inMemoryProfiles[key];
  persistProfiles();

  // Mark tombstone in cloud KV
  await tombstoneChunkedDoc(`pf_${key}`).catch(() => {});
  await removeFromUserIndex(key).catch(() => {});

  // Clean up legacy format keys & auth account in background
  Promise.all([
    kvDelete(`usr_acc_${key}`),
    kvDelete(`profile_${key}`),
    kvDelete(`profile_${key}_social`),
    kvDelete(`profile_${key}_theme`),
    kvDelete(`profile_${key}_audio`),
    kvDelete(`profile_${key}_discord`),
  ]).catch(() => {});

  return true;
}

// ---------------------------------------------------------------------------
// User index (the KV store has no "list keys" call, so names are tracked in
// small chunks of <= 20 names: usr_idx_0, usr_idx_1, ...)
// ---------------------------------------------------------------------------
const IDX_CHUNK = 20;

export async function readUserIndex(): Promise<{ names: string[]; complete: boolean }> {
  const names: string[] = [];
  for (let i = 0; i < 50; i++) {
    const r = await kvRead<string[] | string>(`usr_idx_${i}`);
    if (r.status === 'missing') return { names: Array.from(new Set(names)), complete: true };
    if (r.status === 'error') {
      return { names: Array.from(new Set(names)), complete: false };
    }
    if (!r.data) return { names: Array.from(new Set(names)), complete: true };

    if (Array.isArray(r.data)) {
      if (r.data.length === 0) return { names: Array.from(new Set(names)), complete: true };
      names.push(...r.data.filter((n) => typeof n === 'string' && n.trim().length > 0));
      if (r.data.length < IDX_CHUNK) return { names: Array.from(new Set(names)), complete: true };
    } else if (typeof r.data === 'string') {
      try {
        const parsed = JSON.parse(r.data);
        if (Array.isArray(parsed)) {
          names.push(...parsed.filter((n) => typeof n === 'string' && n.trim().length > 0));
        } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
          names.push(parsed.trim());
        }
      } catch {
        if (r.data.trim().length > 0) {
          names.push(r.data.trim());
        }
      }
      return { names: Array.from(new Set(names)), complete: true };
    }
  }
  return { names: Array.from(new Set(names)), complete: true };
}

async function writeUserIndex(names: string[]): Promise<boolean> {
  const unique = Array.from(
    new Set(names.filter((n) => typeof n === 'string' && n.trim().length > 0))
  ).sort();
  const chunks = Math.max(1, Math.ceil(unique.length / IDX_CHUNK));
  const writes = await Promise.all(
    Array.from({ length: chunks }, (_, i) =>
      kvSet(`usr_idx_${i}`, unique.slice(i * IDX_CHUNK, (i + 1) * IDX_CHUNK))
    )
  );
  // An empty trailing chunk marks the end of the list for readers
  if (unique.length > 0 && unique.length % IDX_CHUNK === 0) {
    writes.push(await kvSet(`usr_idx_${chunks}`, []));
  }
  return writes.every(Boolean);
}

export async function addToUserIndex(key: string): Promise<void> {
  const { names, complete } = await readUserIndex();
  if (!complete) return; // never overwrite the index after a failed read
  if (names.includes(key)) return;
  await writeUserIndex([...names, key]);
}

export async function removeFromUserIndex(key: string): Promise<void> {
  const { names, complete } = await readUserIndex();
  if (!complete || !names.includes(key)) return;
  await writeUserIndex(names.filter((n) => n !== key));
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

export type ProfileState = { profile: ProfileData | null; deleted: boolean };

export async function getProfileStateAsync(username: string): Promise<ProfileState> {
  initProfiles();
  const key = username.toLowerCase().trim();

  // 1) New full-profile cloud format
  const loaded = await loadChunkedDoc<ProfileData>(`pf_${key}`);
  if (loaded.state === 'ok' && loaded.doc && loaded.doc.username) {
    inMemoryProfiles[key] = loaded.doc;
    return { profile: loaded.doc, deleted: false };
  }
  if (loaded.state === 'deleted') {
    delete inMemoryProfiles[key];
    return { profile: null, deleted: true };
  }

  // 2) Legacy 4-chunk cloud format (profiles saved before the upgrade)
  if (loaded.state === 'missing') {
    const legacy = await fetchProfileFromCloud(key);
    if (legacy) return { profile: legacy, deleted: false };
  }

  // 3) Instance memory / seed data
  return { profile: inMemoryProfiles[key] || null, deleted: false };
}

export async function getProfileAsync(username: string): Promise<ProfileData | null> {
  return (await getProfileStateAsync(username)).profile;
}

function saveProfileLocal(profile: ProfileData): ProfileData {
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

export function saveProfile(profile: ProfileData): ProfileData {
  const updated = saveProfileLocal(profile);
  // Fire-and-forget sync to cloud KV (callers that need certainty use saveProfileAsync)
  pushProfileToCloud(updated).catch(() => {});
  return updated;
}

export async function saveProfileAsync(
  profile: ProfileData
): Promise<{ profile: ProfileData; cloudSaved: boolean }> {
  const updated = saveProfileLocal(profile);
  const cloudSaved = await pushProfileToCloud(updated);
  return { profile: updated, cloudSaved };
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
