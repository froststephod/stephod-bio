'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '@/types/profile';

interface Props {
  theme: ThemeConfig;
}

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface Sakura {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  opacity: number;
}

function NativeVideoBackground({
  videoUrl,
  brightnessFactor,
  overlayDarkness,
  canvasRef,
}: {
  videoUrl: string;
  brightnessFactor: number;
  overlayDarkness: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fast inline streaming endpoint for mobile Android / iOS compatibility
  const isCurrentVideo = videoUrl.includes('1794846484227_37bqqi') || videoUrl.includes('stephod');
  const videoSrc = isCurrentVideo ? '/background.mp4' : videoUrl;
  const posterPath = isCurrentVideo ? '/video-poster.jpg' : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');

    try {
      video.load();
    } catch {}

    const tryStartPlay = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    tryStartPlay();

    // High reliability mobile touch / gesture triggers
    window.addEventListener('touchstart', tryStartPlay, { passive: true, once: true });
    window.addEventListener('pointerdown', tryStartPlay, { passive: true, once: true });
    window.addEventListener('scroll', tryStartPlay, { passive: true, once: true });
    window.addEventListener('click', tryStartPlay, { passive: true, once: true });

    const handleCustomPlay = () => tryStartPlay();
    window.addEventListener('stephod_play_video', handleCustomPlay);
    window.addEventListener('stephod_play_audio', handleCustomPlay);

    return () => {
      window.removeEventListener('touchstart', tryStartPlay);
      window.removeEventListener('pointerdown', tryStartPlay);
      window.removeEventListener('scroll', tryStartPlay);
      window.removeEventListener('click', tryStartPlay);
      window.removeEventListener('stephod_play_video', handleCustomPlay);
      window.removeEventListener('stephod_play_audio', handleCustomPlay);
    };
  }, [videoUrl, videoSrc]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#07080e]">
      {/* 
        Instant 0ms Backdrop:
        High-speed poster frame + subtle cosmic gradient so screen is NEVER a cold empty pitch-black void!
      */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, #1e2238 0%, #0d0f1c 55%, #07080e 100%)',
        }}
      />

      {/* Poster Image Layer: visible immediately, smoothly cross-fades when video starts */}
      {posterPath && (
        <img
          src={posterPath}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{
            filter: `brightness(${brightnessFactor})`,
            opacity: isPlaying ? 0 : 1,
          }}
        />
      )}

      {/* Video Element: stays transparent while buffering, fades in when playing */}
      <video
        ref={(el) => {
          if (el) {
            el.muted = true;
            el.defaultMuted = true;
            el.setAttribute('muted', '');
            el.setAttribute('playsinline', '');
            el.setAttribute('webkit-playsinline', 'true');
            if (el.paused) {
              el.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }
          videoRef.current = el;
        }}
        src={videoSrc}
        poster={posterPath}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onPlaying={() => setIsPlaying(true)}
        onLoadedData={() => setIsPlaying(true)}
        onError={() => {
          const video = videoRef.current;
          if (video && video.src !== videoUrl) {
            video.src = videoUrl;
            try {
              video.load();
              video.play().then(() => setIsPlaying(true)).catch(() => {});
            } catch {}
          }
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: `brightness(${brightnessFactor})` }}
      >
        <source src={videoSrc} type="video/mp4" />
        <source src={videoUrl} type="video/mp4" />
      </video>

      {overlayDarkness > 0 && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayDarkness})` }}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
    </div>
  );
}

// Global singleton loader for YouTube IFrame API
let apiLoadedPromise: Promise<void> | null = null;
function ensureYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject();
  if ((window as any).YT && (window as any).YT.Player) {
    return Promise.resolve();
  }
  if (apiLoadedPromise) return apiLoadedPromise;

  apiLoadedPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
      } else {
        reject(new Error('YouTube API load timeout'));
      }
    }, 4000);

    const existingTag = document.getElementById('yt-iframe-api');
    if (!existingTag) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load YouTube API'));
      };
      document.head.appendChild(tag);
    }

    const prevCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === 'function') prevCallback();
      clearTimeout(timeout);
      resolve();
    };

    const checkInterval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        resolve();
      }
    }, 50);
  });

  return apiLoadedPromise;
}

function YouTubeBackground({
  ytId,
  brightnessFactor,
  overlayDarkness,
  canvasRef,
}: {
  ytId: string;
  brightnessFactor: number;
  overlayDarkness: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;
    containerRef.current.innerHTML = '';

    const mountNode = document.createElement('div');
    const mountId = `yt-player-${Math.random().toString(36).substring(2, 9)}`;
    mountNode.id = mountId;
    mountNode.className = 'w-full h-full pointer-events-none';
    containerRef.current.appendChild(mountNode);

    // User gesture listener to unblock autoplay if browser requires user interaction
    const handleUserGesture = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.mute();
          playerRef.current.setPlaybackQuality('hd1080');
          playerRef.current.playVideo();
        } catch {}
      }
    };
    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
    window.addEventListener('stephod_play_audio', handleUserGesture);

    ensureYouTubeApi()
      .then(() => {
        if (!isMounted || !containerRef.current) return;
        const player = new (window as any).YT.Player(mountId, {
          videoId: ytId,
          width: '1920',
          height: '1080',
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            vq: 'hd1080',
            origin: window.location.origin,
          },
          events: {
            onReady: (e: any) => {
              if (!isMounted) return;
              try {
                e.target.mute();
                e.target.setPlaybackQuality('hd1080');
                e.target.playVideo();
              } catch {}
            },
            onStateChange: (e: any) => {
              if (!isMounted) return;
              // 1 = PLAYING
              if (e.data === 1) {
                setIsPlaying(true);
                try {
                  e.target.setPlaybackQuality('hd1080');
                } catch {}
              } else if (e.data === 2) {
                // Video paused -> background should NEVER stay paused! Resume immediately!
                try {
                  e.target.playVideo();
                } catch {}
              } else if (e.data === 0) {
                // Video ended -> loop seamlessly
                try {
                  e.target.seekTo(0, true);
                  e.target.playVideo();
                } catch {}
              }
            },
            onPlaybackQualityChange: (e: any) => {
              if (!isMounted) return;
              if (e.data !== 'hd1080' && e.data !== 'highres') {
                try {
                  e.target.setPlaybackQuality('hd1080');
                } catch {}
              }
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        // Fallback: If YouTube API script was blocked by adblocker, embed fallback iframe
        if (!isMounted || !containerRef.current) return;
        const fallbackIframe = document.createElement('iframe');
        fallbackIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1&vq=hd1080&origin=${encodeURIComponent(window.location.origin)}`;
        fallbackIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        fallbackIframe.className = 'w-full h-full pointer-events-none';
        fallbackIframe.onload = () => {
          try {
            fallbackIframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
            fallbackIframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }), '*');
          } catch {}
          setTimeout(() => setIsPlaying(true), 1200);
        };
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(fallbackIframe);
      });

    // Check & nudge player to play if delayed
    const pollInterval = setInterval(() => {
      if (!isMounted) return;
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        const state = playerRef.current.getPlayerState();
        if (state === 1) {
          setIsPlaying(true);
        } else if (state === 2 || state === -1) {
          try {
            playerRef.current.mute();
            playerRef.current.setPlaybackQuality('hd1080');
            playerRef.current.playVideo();
          } catch {}
        }
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('stephod_play_audio', handleUserGesture);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
      }
      playerRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ytId]);

  return (
    <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none bg-[#0a0b12]">
      {/* 
        Container with 16:9 ratio, oversized by 1.35x and centered with absolute translate:
        All YouTube titles, watermarks, and progress controls are completely cropped outside the viewport.
        [&_iframe]:w-full [&_iframe]:h-full ensures the generated iframe scales to 100% of the oversized container.
      */}
      <div className="w-[125vw] h-[70.3vw] min-h-[125vh] min-w-[222vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[1.35] transform-gpu">
        <div
          ref={containerRef}
          className="w-full h-full pointer-events-none [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:pointer-events-none"
          style={{ filter: `brightness(${brightnessFactor})` }}
        />
      </div>

      {/* 
        Loading Veil: Fades out quickly once playing or after 1.5s timeout.
        Uses an ambient dark radial gradient instead of solid black.
      */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isPlaying ? 'opacity-0' : 'opacity-85'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 35%, #181c30 0%, #0d0f1c 55%, #05060c 100%)',
        }}
      />

      {overlayDarkness > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayDarkness})` }}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
    </div>
  );
}

export default function BackgroundCanvas({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgEffect = theme.extraEffects?.bgEffect || 'none';

  useEffect(() => {
    if (theme.backgroundType === 'custom-image' || theme.backgroundType === 'custom-video') {
      if (bgEffect === 'none') return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Regular Particles setup
    const count = theme.backgroundType === 'cyber-rain' || bgEffect === 'digital-rain' ? 80 : 100;
    const items: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      char?: string;
    }> = [];

    const chars = '01アイウエオカキクケコサシスセソタチツテト';

    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedY: (theme.backgroundType === 'cyber-rain' || bgEffect === 'digital-rain') ? Math.random() * 4 + 2 : (Math.random() - 0.5) * 0.4,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }

    // 2. Extra Effect: Shooting Stars Meteors
    const meteors: Meteor[] = [];
    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * width * 1.2 - width * 0.2,
        y: -50,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 8 + 12,
        opacity: Math.random() * 0.6 + 0.4,
      });
    };

    // 3. Extra Effect: Sakura Petals
    const petals: Sakura[] = [];
    if (bgEffect === 'sakura') {
      for (let i = 0; i < 40; i++) {
        petals.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 7 + 6,
          speedY: Math.random() * 1.5 + 1,
          speedX: Math.random() * 1 - 0.2,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: (Math.random() - 0.5) * 0.04,
          opacity: Math.random() * 0.6 + 0.3,
        });
      }
    }

    let meteorTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Base background
      if (theme.backgroundType === 'cyber-rain' || bgEffect === 'digital-rain') {
        ctx.fillStyle = bgEffect === 'digital-rain' ? '#10b981' : (theme.accentColor || '#a855f7');
        ctx.font = '13px monospace';
        items.forEach((p) => {
          ctx.globalAlpha = p.alpha;
          if (p.char) ctx.fillText(p.char, p.x, p.y);
          p.y += p.speedY;
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
            p.char = chars[Math.floor(Math.random() * chars.length)];
          }
        });
      } else if (theme.backgroundType !== 'custom-image' && theme.backgroundType !== 'custom-video') {
        // stars or particles
        items.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = theme.accentColor || '#ffffff';
          ctx.globalAlpha = p.alpha;
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        });
      }

      // Render Extra Effect: Shooting Stars (ฝนดาวตก)
      if (bgEffect === 'shooting-stars') {
        meteorTimer++;
        if (meteorTimer % 45 === 0) {
          spawnMeteor();
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.speed;
          m.y += m.speed * 0.8;

          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.length, m.y - m.length * 0.8);
          grad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
          grad.addColorStop(0.3, `rgba(16, 185, 129, ${m.opacity * 0.7})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.length, m.y - m.length * 0.8);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();

          if (m.y > height + 100 || m.x > width + 100) {
            meteors.splice(i, 1);
          }
        }
      }

      // Render Extra Effect: Sakura Petals (ซากุระร่วง)
      if (bgEffect === 'sakura') {
        petals.forEach((petal) => {
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate(petal.angle);
          ctx.globalAlpha = petal.opacity;

          ctx.beginPath();
          ctx.ellipse(0, 0, petal.size, petal.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#f472b6'; // pink petal
          ctx.fill();
          ctx.restore();

          petal.y += petal.speedY;
          petal.x += Math.sin(petal.angle) * 1.5;
          petal.angle += petal.angularSpeed;

          if (petal.y > height + 20) {
            petal.y = -20;
            petal.x = Math.random() * width;
          }
        });
      }

      // Render Extra Effect: Fog Waves (คลื่นหมอก)
      if (bgEffect === 'fog-waves') {
        const time = Date.now() * 0.0005;
        ctx.save();
        ctx.globalAlpha = 0.08;
        const grad = ctx.createRadialGradient(
          width * 0.5 + Math.sin(time) * 150,
          height * 0.5 + Math.cos(time) * 100,
          50,
          width * 0.5,
          height * 0.5,
          width * 0.7
        );
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.backgroundType, theme.accentColor, bgEffect]);

  const rawBrightness = theme.backgroundBrightness ?? 100;
  const brightnessFactor = Math.max(0.2, Math.min(2.0, rawBrightness / 100));
  // Dim overlay: 0 at 100% brightness; if brightness < 100%, add slight dimming
  const overlayDarkness = rawBrightness < 100 ? ((100 - rawBrightness) / 100) * 0.7 : 0;

  // Handle Custom Video (YouTube or direct MP4)
  if (theme.backgroundType === 'custom-video' && theme.backgroundVideoUrl) {
    const ytId = getYouTubeVideoId(theme.backgroundVideoUrl);

    if (ytId) {
      return (
        <YouTubeBackground
          ytId={ytId}
          brightnessFactor={brightnessFactor}
          overlayDarkness={overlayDarkness}
          canvasRef={canvasRef}
        />
      );
    }

    return (
      <NativeVideoBackground
        videoUrl={theme.backgroundVideoUrl}
        brightnessFactor={brightnessFactor}
        overlayDarkness={overlayDarkness}
        canvasRef={canvasRef}
      />
    );
  }

  // Handle Custom Image
  if (theme.backgroundType === 'custom-image' && theme.backgroundImageUrl) {
    return (
      <div
        className="absolute inset-0 -z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${theme.backgroundImageUrl})`,
          filter: `brightness(${brightnessFactor})`,
        }}
      >
        {overlayDarkness > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayDarkness})` }}
          />
        )}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 -z-0 pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${theme.accentColor || '#10b981'}15 0%, rgba(18, 22, 34, 0.75) 45%, #0a0b12 100%)`,
        filter: `brightness(${brightnessFactor})`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
