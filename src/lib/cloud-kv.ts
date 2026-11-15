/**
 * Thin client for the Cloud Key-Value store (echovalue.dev).
 * The store limits every value to 1000 bytes, so larger data is split into
 * versioned chunks (see saveProfileChunks / loadProfileChunks).
 *
 * Set CLOUD_DB_TOKEN in the hosting environment (do not rely on the fallback).
 */
const CLOUD_DB_BASE = process.env.CLOUD_DB_BASE || 'https://api.echovalue.dev/kv/default';
const CLOUD_DB_TOKEN = process.env.CLOUD_DB_TOKEN || 'MQtLVyembPnxdpR74HeB';

const MAX_BODY_BYTES = 980;
const MAX_CHUNKS = 24;
const CHUNK_CHARS = 880; // base64 chars per chunk (envelope adds ~30 bytes)

export type KvRead<T> =
  | { status: 'ok'; data: T }
  | { status: 'missing' }
  | { status: 'error' };

export async function kvRead<T = any>(key: string, timeoutMs = 3000): Promise<KvRead<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${CLOUD_DB_BASE}/${key}`, {
      headers: { 'x-token': CLOUD_DB_TOKEN },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (res.status === 404) return { status: 'missing' };
    if (!res.ok) return { status: 'error' };
    const text = await res.text();
    try {
      return { status: 'ok', data: JSON.parse(text) as T };
    } catch {
      return { status: 'error' };
    }
  } catch {
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

export async function kvSet(key: string, value: unknown, timeoutMs = 4000): Promise<boolean> {
  const body = JSON.stringify(value);
  if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
    console.warn(`kvSet: value for "${key}" exceeds the ${MAX_BODY_BYTES}-byte limit`);
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${CLOUD_DB_BASE}/${key}`, {
      method: 'POST',
      headers: { 'x-token': CLOUD_DB_TOKEN, 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function kvDelete(key: string, timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${CLOUD_DB_BASE}/${key}`, {
      method: 'DELETE',
      headers: { 'x-token': CLOUD_DB_TOKEN },
      cache: 'no-store',
      signal: controller.signal,
    });
    return res.ok || res.status === 404;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Chunked JSON documents: <prefix>_meta + <prefix>_0 .. <prefix>_n-1
// Every chunk carries the same version stamp so a reader can detect a torn
// read (meta from one save, chunks from another) and retry.
// ---------------------------------------------------------------------------
interface ChunkMeta {
  v: string;
  n: number;
  t: number;
  deleted?: boolean;
  s?: Record<string, unknown>; // small summary for listings
}

export async function saveChunkedDoc(
  prefix: string,
  doc: unknown,
  summary?: Record<string, unknown>
): Promise<boolean> {
  const b64 = Buffer.from(JSON.stringify(doc), 'utf8').toString('base64');
  const pieces = b64.match(new RegExp(`.{1,${CHUNK_CHARS}}`, 'g')) || [];
  if (pieces.length === 0 || pieces.length > MAX_CHUNKS) return false;

  const v = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const writes = await Promise.all(pieces.map((d, i) => kvSet(`${prefix}_${i}`, { v, d })));
  if (writes.some((ok) => !ok)) return false;

  const meta: ChunkMeta = { v, n: pieces.length, t: Date.now(), s: summary };
  return kvSet(`${prefix}_meta`, meta);
}

export type ChunkedLoad<T> =
  | { state: 'ok'; doc: T; meta: ChunkMeta }
  | { state: 'deleted' }
  | { state: 'missing' }
  | { state: 'error' };

export async function loadChunkedDoc<T = any>(prefix: string): Promise<ChunkedLoad<T>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const metaRes = await kvRead<ChunkMeta>(`${prefix}_meta`);
    if (metaRes.status === 'missing') return { state: 'missing' };
    if (metaRes.status === 'error') return { state: 'error' };
    const meta = metaRes.data;
    if (meta.deleted) return { state: 'deleted' };
    if (!meta.n || meta.n < 1 || meta.n > MAX_CHUNKS) return { state: 'error' };

    const parts = await Promise.all(
      Array.from({ length: meta.n }, (_, i) => kvRead<{ v: string; d: string }>(`${prefix}_${i}`))
    );
    const consistent = parts.every((p) => p.status === 'ok' && p.data.v === meta.v);
    if (!consistent) continue; // torn read -> retry with fresh meta

    try {
      const b64 = parts.map((p) => (p as { status: 'ok'; data: { d: string } }).data.d).join('');
      const doc = JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as T;
      return { state: 'ok', doc, meta };
    } catch {
      return { state: 'error' };
    }
  }
  return { state: 'error' };
}

/** Mark a chunked document as deleted (tombstone). */
export async function tombstoneChunkedDoc(prefix: string): Promise<boolean> {
  const meta: ChunkMeta = { v: 'deleted', n: 0, t: Date.now(), deleted: true };
  return kvSet(`${prefix}_meta`, meta);
}

/** Read only the meta/summary of a chunked document (1 request). */
export async function readChunkMeta(prefix: string): Promise<KvRead<ChunkMeta>> {
  return kvRead<ChunkMeta>(`${prefix}_meta`);
}
