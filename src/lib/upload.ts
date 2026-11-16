/**
 * Uploads a media file (video, image, audio) to the server / cloud storage.
 * Supports auto-chunking (3MB slices) to cleanly bypass Vercel's 4.5MB payload limit.
 */

// 3MB per chunk, comfortably below Vercel's 4.5MB limit
const CHUNK_SIZE = 3 * 1024 * 1024;

export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

    // Case 1: Small file (<= 3MB) - upload directly in single request
    if (totalChunks <= 1) {
      if (onProgress) onProgress(15);
      const formData = new FormData();
      formData.append('file', file);
      if (onProgress) onProgress(45);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (onProgress) onProgress(85);
      const data = await res.json();
      if (onProgress) onProgress(100);

      if (data.ok && data.url) {
        return { ok: true, url: data.url };
      }
      return { ok: false, error: data.error || 'การอัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
    }

    // Case 2: Large file (> 3MB) - Chunked upload
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ext = file.name.slice(file.name.lastIndexOf('.')) || (file.type?.includes('image') ? '.png' : '.mp4');
    const cleanFileName = `stephod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunkBlob);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('uploadId', uploadId);
      formData.append('fileName', cleanFileName);
      formData.append('mimeType', file.type || 'video/mp4');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        return { ok: false, error: `การอัปโหลดส่วนที่ ${chunkIndex + 1}/${totalChunks} ล้มเหลว (${res.status})` };
      }

      const data = await res.json();
      const currentPercent = Math.min(95, Math.round(((chunkIndex + 1) / totalChunks) * 90));
      if (onProgress) onProgress(currentPercent);

      // Last chunk returns the permanent uploaded URL
      if (chunkIndex === totalChunks - 1) {
        if (onProgress) onProgress(100);
        if (data.ok && data.url) {
          return { ok: true, url: data.url };
        }
        return { ok: false, error: data.error || 'ไม่สามารถประกอบไฟล์วิดีโอได้' };
      }
    }

    return { ok: false, error: 'การอัปโหลดไฟล์ล้มเหลว' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' };
  }
}
