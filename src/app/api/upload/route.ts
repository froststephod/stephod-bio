import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getTempUploadDir(): string {
  const dir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join('/tmp', 'stephod_chunks')
    : path.join(process.cwd(), 'data', 'temp_chunks');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Check if this is a chunked upload
    const uploadId = formData.get('uploadId') as string | null;
    const chunkIndexStr = formData.get('chunkIndex') as string | null;
    const totalChunksStr = formData.get('totalChunks') as string | null;
    const originalFileName = (formData.get('fileName') as string | null) || 'upload.mp4';

    // 1. Single direct file upload (if not chunked)
    const file = formData.get('file') as File | null;
    const chunk = formData.get('chunk') as File | null;

    if (!uploadId && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || (file.type?.includes('image') ? '.png' : '.mp4');
      const cleanFileName = `stephod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

      // Save locally if local environment
      let localUrl: string | null = null;
      if (!process.env.VERCEL) {
        try {
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          fs.writeFileSync(path.join(uploadsDir, cleanFileName), buffer);
          localUrl = `/uploads/${cleanFileName}`;
        } catch (err) {
          console.warn('Local save warning:', err);
        }
      }

      // Upload to Catbox for high-speed CDN and permanent hosting
      try {
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'fileupload');
        const blob = new Blob([buffer], { type: file.type || 'application/octet-stream' });
        catboxForm.append('fileToUpload', blob, cleanFileName);

        const res = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxForm,
        });

        if (res.ok) {
          const remoteUrl = (await res.text()).trim();
          if (remoteUrl.startsWith('http')) {
            return NextResponse.json({ ok: true, url: remoteUrl });
          }
        }
      } catch (err) {
        console.warn('Catbox upload error:', err);
      }

      if (localUrl) {
        return NextResponse.json({ ok: true, url: localUrl });
      }

      return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
    }

    // 2. Chunked file upload (for large video files > 4MB)
    if (uploadId && chunk && chunkIndexStr !== null && totalChunksStr !== null) {
      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);
      const tempDir = getTempUploadDir();
      const chunkPath = path.join(tempDir, `${uploadId}_part_${chunkIndex}`);

      const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
      fs.writeFileSync(chunkPath, chunkBuffer);

      // Check if all chunks have arrived
      let allChunksPresent = true;
      for (let i = 0; i < totalChunks; i++) {
        if (!fs.existsSync(path.join(tempDir, `${uploadId}_part_${i}`))) {
          allChunksPresent = false;
          break;
        }
      }

      if (!allChunksPresent) {
        return NextResponse.json({ ok: true, progress: (chunkIndex + 1) / totalChunks });
      }

      // Stitch all chunks together
      const ext = path.extname(originalFileName) || '.mp4';
      const cleanFileName = `stephod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
      const assembledBufferList: Buffer[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const p = path.join(tempDir, `${uploadId}_part_${i}`);
        assembledBufferList.push(fs.readFileSync(p));
        try {
          fs.unlinkSync(p);
        } catch {}
      }

      const fullBuffer = Buffer.concat(assembledBufferList);

      // Save locally if local environment
      let localUrl: string | null = null;
      if (!process.env.VERCEL) {
        try {
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          fs.writeFileSync(path.join(uploadsDir, cleanFileName), fullBuffer);
          localUrl = `/uploads/${cleanFileName}`;
        } catch (err) {
          console.warn('Local save warning:', err);
        }
      }

      // Upload assembled video to Catbox
      try {
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'fileupload');
        const blob = new Blob([fullBuffer], { type: 'video/mp4' });
        catboxForm.append('fileToUpload', blob, cleanFileName);

        const res = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxForm,
        });

        if (res.ok) {
          const remoteUrl = (await res.text()).trim();
          if (remoteUrl.startsWith('http')) {
            return NextResponse.json({ ok: true, url: remoteUrl });
          }
        }
      } catch (err) {
        console.warn('Catbox assembled upload error:', err);
      }

      if (localUrl) {
        return NextResponse.json({ ok: true, url: localUrl });
      }

      return NextResponse.json({ ok: false, error: 'Could not assemble or host video file' }, { status: 500 });
    }

    return NextResponse.json({ ok: false, error: 'Invalid upload payload' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
