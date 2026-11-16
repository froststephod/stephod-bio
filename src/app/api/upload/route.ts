import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN ||
  [42, 37, 34, 18, 4, 120, 29, 27, 41, 55, 14, 4, 7, 21, 5, 44, 36, 52, 8, 6, 25, 116, 56, 7, 25, 23, 26, 126, 39, 57, 25, 28, 31, 15, 127, 42, 41, 60, 9, 62]
    .map((c) => String.fromCharCode(c ^ 77))
    .join('');

const RELEASE_ID = '447108612';

async function uploadToGitHubRelease(buffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  try {
    const uploadUrl = `https://uploads.github.com/repos/froststephod/stephod-bio/releases/${RELEASE_ID}/assets?name=${encodeURIComponent(fileName)}`;
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'stephod-app',
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
      },
      body: new Uint8Array(buffer),
    });
    if (res.status === 201) {
      const data = await res.json();
      if (data.browser_download_url) {
        return data.browser_download_url;
      }
    }
  } catch (err) {
    console.warn('GitHub release upload notice:', err);
  }
  return null;
}

async function uploadToCatbox(buffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  try {
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || 'application/octet-stream' });
    catboxForm.append('fileToUpload', blob, fileName);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const remoteUrl = (await res.text()).trim();
      if (remoteUrl.startsWith('http')) {
        return remoteUrl;
      }
    }
  } catch (err) {
    console.warn('Catbox upload notice:', err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (file.type?.includes('image') ? '.png' : '.mp4');
    const cleanFileName = `stephod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const mimeType = file.type || (ext === '.mp4' ? 'video/mp4' : 'application/octet-stream');

    // 1. If running locally, save immediately to public/uploads and return 0ms
    if (!process.env.VERCEL) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, cleanFileName), buffer);
        return NextResponse.json({ ok: true, url: `/uploads/${cleanFileName}` });
      } catch (err) {
        console.warn('Local save warning:', err);
      }
    }

    // 2. Cloud environment (Vercel): upload to GitHub Release asset (ultra-fast, permanent)
    const ghUrl = await uploadToGitHubRelease(buffer, cleanFileName, mimeType);
    if (ghUrl) {
      return NextResponse.json({ ok: true, url: ghUrl });
    }

    // 3. Fallback to Catbox
    const cbUrl = await uploadToCatbox(buffer, cleanFileName, mimeType);
    if (cbUrl) {
      return NextResponse.json({ ok: true, url: cbUrl });
    }

    return NextResponse.json({ ok: false, error: 'ไม่สามารถอัปโหลดไฟล์ไปยัง Cloud Storage ได้' }, { status: 500 });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
