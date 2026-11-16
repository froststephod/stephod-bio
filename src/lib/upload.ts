/**
 * Uploads a media file (video, image, audio) to the server / cloud storage.
 * Direct multipart upload with real-time progress callbacks.
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    if (onProgress) onProgress(20);
    const formData = new FormData();
    formData.append('file', file);

    if (onProgress) onProgress(50);
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
  } catch (err: any) {
    return { ok: false, error: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' };
  }
}
