'use client';

import React, { useEffect, useState } from 'react';
import { DiscordWidgetConfig } from '@/types/profile';

interface Props {
  config: DiscordWidgetConfig;
  accentColor: string;
}

interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    global_name?: string;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
    };
  }>;
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
  } | null;
}

export default function DiscordWidget({ config, accentColor }: Props) {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!config.enabled || !config.discordId) {
      return;
    }

    let isMounted = true;
    const fetchPresence = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${config.discordId}`);
        const json = await res.json();
        if (json.success && isMounted) {
          setData(json.data);
        }
      } catch {
        // Fallback to custom config if lanyard fails or is blocked
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000); // refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.enabled, config.discordId]);

  if (!config.enabled) return null;

  const statusColors = {
    online: '#22c55e',
    idle: '#eab308',
    dnd: '#ef4444',
    offline: '#71717a',
  };

  const status = data?.discord_status || 'online';
  const statusColor = statusColors[status];

  // Activity priority: Spotify first, then custom game/app, then fallback
  const spotify = data?.spotify;
  const gameActivity = data?.activities?.find((a) => a.type !== 4); // not custom status

  return (
    <div
      className="w-full mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm transition-all hover:border-white/20"
      style={{
        boxShadow: `0 0 15px ${accentColor}10`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Discord Avatar or Icon with Status Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
            {data?.discord_user?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`}
                alt="Discord Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
              </svg>
            )}
          </div>
          {/* Status Dot */}
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12131a]"
            style={{ backgroundColor: statusColor }}
            title={`Status: ${status}`}
          />
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white truncate">
              {data?.discord_user?.global_name || data?.discord_user?.username || 'Discord Presence'}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
              }}
            >
              {status}
            </span>
          </div>

          {/* Activity / Spotify */}
          {spotify ? (
            <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1 mt-0.5">
              <span>🎵 Listening to</span>
              <span className="font-medium text-white/90 truncate">{spotify.song}</span>
              <span className="text-white/40">- {spotify.artist}</span>
            </div>
          ) : gameActivity ? (
            <div className="text-[11px] text-white/70 truncate mt-0.5">
              🎮 Playing <span className="text-white font-medium">{gameActivity.name}</span>
              {gameActivity.details && <span className="text-white/40"> ({gameActivity.details})</span>}
            </div>
          ) : (
            <div className="text-[11px] text-white/50 truncate mt-0.5">
              {config.customStatus || config.customActivity || 'Active on Discord'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
