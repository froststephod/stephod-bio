'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ExternalLink } from 'lucide-react';
import { AudioConfig } from '@/types/profile';
import { getYouTubeVideoId, getSpotifyInfo } from '@/lib/music';

interface Props {
  audio: AudioConfig;
  accentColor: string;
  hasEntered?: boolean;
}

export default function AudioPlayer({ audio, accentColor }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(audio.volume || 60);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [origin, setOrigin] = useState('');

  const ytId = getYouTubeVideoId(audio.audioUrl);
  const spotifyInfo = getSpotifyInfo(audio.audioUrl);

  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Send postMessage command to YouTube iframe safely
  const postYTCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args,
          }),
          '*'
        );
      }
    } catch (err) {
      console.warn('YouTube postMessage error:', err);
    }
  }, []);

  // Synchronous audio playback trigger (plays immediately without waiting for enter)
  const triggerAudioPlayback = useCallback(() => {
    if (!audio.enabled || !audio.audioUrl) return;

    if (ytId) {
      postYTCommand('playVideo');
      postYTCommand('unMute');
      postYTCommand('setVolume', [isMutedRef.current ? 0 : volumeRef.current]);
      setIsPlaying(true);
    } else if (!spotifyInfo && audioRef.current) {
      audioRef.current.volume = (isMutedRef.current ? 0 : volumeRef.current) / 100;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio play error:', err);
        });
    }
  }, [audio.enabled, audio.audioUrl, ytId, spotifyInfo, postYTCommand]);

  // Sync volume & mute to HTML audio and YouTube
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    }
    if (ytId) {
      if (isMuted) {
        postYTCommand('mute');
      } else {
        postYTCommand('unMute');
        postYTCommand('setVolume', [volume]);
      }
    }
  }, [volume, isMuted, ytId, postYTCommand]);

  // Start playing audio IMMEDIATELY on load (0 clicks required) with progressive retries
  useEffect(() => {
    if (audio.enabled && audio.audioUrl) {
      triggerAudioPlayback();

      if (ytId) {
        const t0 = setTimeout(() => triggerAudioPlayback(), 100);
        const t1 = setTimeout(() => triggerAudioPlayback(), 350);
        const t2 = setTimeout(() => triggerAudioPlayback(), 800);
        const t3 = setTimeout(() => triggerAudioPlayback(), 1600);
        const t4 = setTimeout(() => triggerAudioPlayback(), 2800);
        return () => {
          clearTimeout(t0);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      }
    }
  }, [audio.enabled, audio.audioUrl, ytId, triggerAudioPlayback]);

  // Listen for custom event 'stephod_play_audio'
  useEffect(() => {
    const handleCustomPlay = () => {
      triggerAudioPlayback();
    };

    window.addEventListener('stephod_play_audio', handleCustomPlay);
    return () => window.removeEventListener('stephod_play_audio', handleCustomPlay);
  }, [triggerAudioPlayback]);

  // Global user interaction fallback:
  // If browser Autoplay Policy delayed sound, the very first micro-movement (mousemove, scroll, touch, or click) unmutes/plays instantly!
  useEffect(() => {
    if (!audio.enabled || !audio.audioUrl) return;

    const handleUserInteraction = () => {
      triggerAudioPlayback();
    };

    window.addEventListener('mousemove', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('pointermove', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('wheel', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('pointermove', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audio.enabled, audio.audioUrl, triggerAudioPlayback]);

  // Listen to YouTube Player messages (state changes, ready)
  useEffect(() => {
    if (!ytId) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          if (data.event === 'onReady' || data.event === 'initialDelivery') {
            triggerAudioPlayback();
          } else if (data.event === 'onStateChange') {
            if (data.info === 1) {
              // 1 = PLAYING
              setIsPlaying(true);
            } else if (data.info === 2) {
              // 2 = PAUSED
              setIsPlaying(false);
            } else if (data.info === 0) {
              // 0 = ENDED -> loop video automatically
              postYTCommand('playVideo');
              setIsPlaying(true);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [ytId, postYTCommand, triggerAudioPlayback]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    triggerAudioPlayback();
    setTimeout(triggerAudioPlayback, 250);
    setTimeout(triggerAudioPlayback, 700);
    setTimeout(triggerAudioPlayback, 1500);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (spotifyInfo) return;

    if (ytId) {
      if (isPlaying) {
        postYTCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        triggerAudioPlayback();
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (ytId) {
      if (nextMuted) {
        postYTCommand('mute');
      } else {
        postYTCommand('unMute');
        postYTCommand('setVolume', [volume]);
      }
    } else if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume / 100;
    }
  };

  if (!audio.enabled || !audio.audioUrl) {
    return null;
  }

  // If it's a Spotify link, render a Spotify-branded pill at bottom
  if (spotifyInfo) {
    return (
      <div className="fixed bottom-5 right-5 z-40 transition-all duration-300">
        <div
          className="flex items-center gap-3 px-3.5 py-2 rounded-full border border-emerald-500/30 bg-black/75 backdrop-blur-md shadow-2xl hover:border-emerald-500/50 transition-all group"
          style={{
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
          }}
        >
          {/* Glowing Spotify Green Icon */}
          <div className="text-emerald-400 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current drop-shadow-[0_0_6px_#10b981]" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306a.75.75 0 0 1-1.03.248c-2.82-1.723-6.37-2.113-10.55-1.157a.75.75 0 0 1-.334-1.462c4.58-1.045 8.52-.603 11.666 1.341.36.22.47.69.248 1.03zm1.47-3.268a.937.937 0 0 1-1.288.309c-3.227-1.984-8.146-2.558-11.963-1.399a.938.938 0 1 1-.548-1.794c4.37-1.326 9.79-.687 13.49 1.596.425.26.56.822.31 1.288zm.126-3.41c-3.87-2.298-10.257-2.51-13.945-1.391a1.125 1.125 0 1 1-.655-2.154c4.24-1.287 11.29-1.043 15.75 1.606a1.125 1.125 0 0 1-1.15 1.94z" />
            </svg>
          </div>

          {/* Song Info */}
          <div className="flex flex-col max-w-[130px] sm:max-w-[180px] overflow-hidden">
            <span className="text-xs font-semibold text-white/95 truncate tracking-wide">
              {audio.songTitle || 'Spotify Music'}
            </span>
            <span className="text-[10px] text-emerald-400/80 truncate">
              {audio.artist || 'Spotify'}
            </span>
          </div>

          {/* Open link in Spotify */}
          <a
            href={audio.audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Open in Spotify"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const ytEmbedUrl = ytId && isClient
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=0&playsinline=1&loop=1&playlist=${ytId}&enablejsapi=1&origin=${encodeURIComponent(origin)}`
    : '';

  return (
    <>
      {/* Standard audio file */}
      {!ytId && (
        <audio
          ref={audioRef}
          src={audio.audioUrl}
          loop={audio.loop}
          preload="auto"
          autoPlay
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* YouTube audio iframe - rendered offscreen without display:none so browser audio engine never culls it */}
      {ytId && isClient && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            width: '240px',
            height: '240px',
            opacity: 0.001,
            pointerEvents: 'none',
            zIndex: -9999,
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            id="stephod-youtube-audio"
            width="240"
            height="240"
            src={ytEmbedUrl}
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Audio Stream"
            onLoad={handleIframeLoad}
          />
        </div>
      )}

      {/* Floating Audio Widget Pill at bottom */}
      <div className="fixed bottom-5 right-5 z-40 transition-all duration-300">
        <div
          className="flex items-center gap-3 px-3.5 py-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl hover:border-white/20 transition-all group"
          style={{
            boxShadow: isPlaying ? `0 0 20px ${accentColor}25` : undefined,
          }}
        >
          {/* Animated Equalizer Bars */}
          <div className="flex items-center gap-0.5 h-4 w-4 justify-center">
            {isPlaying ? (
              <>
                <span className="w-0.5 bg-white/80 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                <span className="w-0.5 bg-white/80 rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
                <span className="w-0.5 bg-white/80 rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
              </>
            ) : (
              <Music className="w-3.5 h-3.5 text-white/40" />
            )}
          </div>

          {/* Song Info */}
          <div className="flex flex-col max-w-[130px] sm:max-w-[180px] overflow-hidden">
            <span className="text-xs font-medium text-white/90 truncate tracking-wide">
              {audio.songTitle || (ytId ? 'YouTube Audio' : 'Background Music')}
            </span>
            <span className="text-[10px] text-white/40 truncate">
              {audio.artist || (ytId ? 'YouTube' : 'Audio')}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
            <button
              onClick={togglePlay}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = Number(e.target.value);
                setVolume(newVol);
                if (isMuted) setIsMuted(false);
                if (ytId) {
                  postYTCommand('unMute');
                  postYTCommand('setVolume', [newVol]);
                } else if (audioRef.current) {
                  audioRef.current.volume = newVol / 100;
                }
              }}
              className="w-14 h-1 accent-emerald-400 bg-white/20 rounded-lg hidden sm:block cursor-pointer"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </>
  );
}
