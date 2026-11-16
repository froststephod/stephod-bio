/**
 * Uploads a media file (video, image, audio) to the server / cloud storage.
 * Automatically slices into 3.5MB chunks if file is larger than 3.5MB to safely bypass Vercel serverless body limits.
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const CHUNK_SIZE = 3.5 * 1024 * 1024; // 3.5MB per slice

  try {
    // 1. Single direct upload for files <= 3.5MB
    if (file.size <= CHUNK_SIZE) {
      if (onProgress) onProgress(20);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (onProgress) onProgress(80);
      const data = await res.json();
      if (onProgress) onProgress(100);

      if (data.ok && data.url) {
        return { ok: true, url: data.url };
      }
      return { ok: false, error: data.error || 'Upload failed' };
    }

    // 2. Chunked upload for files > 3.5MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    let finalUrl: string | undefined;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const slice = file.slice(start, end);

      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('chunk', slice);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || (!data.ok && !data.progress)) {
        return { ok: false, error: data.error || `Chunk ${i + 1} failed` };
      }

      if (onProgress) {
        const pct = Math.round(((i + 1) / totalChunks) * 100);
        onProgress(pct);
      }

      if (data.url) {
        finalUrl = data.url;
      }
    }

    if (finalUrl) {
      return { ok: true, url: finalUrl };
    }
    return { ok: false, error: 'Upload was completed but no URL returned' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error during upload' };
  }
}
