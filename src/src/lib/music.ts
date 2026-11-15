export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export interface SpotifyInfo {
  type: 'track' | 'album' | 'playlist' | 'artist';
  id: string;
  embedUrl: string;
  height: number;
}

export function getSpotifyInfo(url?: string): SpotifyInfo | null {
  if (!url) return null;
  const match = url.match(
    /(?:spotify\.com\/(?:[a-zA-Z0-9_-]+\/)*(track|album|playlist|artist)\/|spotify:(track|album|playlist|artist):)([a-zA-Z0-9]+)/
  );
  if (match) {
    const type = (match[1] || match[2]) as 'track' | 'album' | 'playlist' | 'artist';
    const id = match[3];
    const isCompact = type === 'track';
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      height: isCompact ? 80 : 152,
    };
  }
  return null;
}

export async function fetchSpotifyOEmbed(url: string): Promise<{ title?: string; artist?: string } | null> {
  try {
    const cleanUrl = url.split('?')[0];
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      artist: data.author_name || 'Spotify',
    };
  } catch {
    return null;
  }
}
