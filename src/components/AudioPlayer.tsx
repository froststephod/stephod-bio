'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ExternalLink } from 'lucide-react';
import { AudioConfig } from '@/types/profile';
import { getYouTubeVideoId, getSpotifyInfo } from '@/lib/music';

interface Props {
  audio: AudioConfig;
  accentColor: string;
  hasEntered: boolean;
}

export default function AudioPlayer({ audio, accentColor, hasEntered }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(audio.volume || 60);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ytId = getYouTubeVideoId(audio.audioUrl);
  const spotifyInfo = getSpotifyInfo(audio.audioUrl);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    }
  }, [volume, isMuted]);

  // When user clicks to enter, start audio (if standard audio or youtube)
  useEffect(() => {
    if (hasEntered && audio.enabled && audio.audioUrl) {
      if (ytId) {
        setIsPlaying(true);
      } else if (!spotifyInfo && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented or audio source error:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [hasEntered, audio.enabled, audio.audioUrl, ytId, spotifyInfo]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ytId) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (spotifyInfo) {
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
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

  return (
    <>
      {/* If standard audio file */}
      {!ytId && (
        <audio
          ref={audioRef}
          src={audio.audioUrl}
          loop={audio.loop}
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* If YouTube audio stream */}
      {ytId && hasEntered && isPlaying && (
        <div className="hidden pointer-events-none">
          <iframe
            width="1"
            height="1"
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&enablejsapi=1`}
            allow="autoplay"
            title="Audio Stream"
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
            {!ytId && (
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-14 h-1 accent-purple-400 bg-white/20 rounded-lg hidden sm:block cursor-pointer"
                title="Volume"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
