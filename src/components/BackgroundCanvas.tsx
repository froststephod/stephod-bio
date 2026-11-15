'use client';

import React, { useEffect, useRef } from 'react';
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

export default function BackgroundCanvas({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (theme.backgroundType === 'custom-image' || theme.backgroundType === 'custom-video') {
      return;
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

    // Particle setups
    const count = theme.backgroundType === 'cyber-rain' ? 80 : 100;
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
        speedY: theme.backgroundType === 'cyber-rain' ? Math.random() * 4 + 2 : (Math.random() - 0.5) * 0.4,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme.backgroundType === 'cyber-rain') {
        ctx.fillStyle = theme.accentColor || '#a855f7';
        ctx.font = '12px monospace';
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
      } else {
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

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.backgroundType, theme.accentColor]);

  // Handle Custom Video (YouTube or direct MP4)
  if (theme.backgroundType === 'custom-video' && theme.backgroundVideoUrl) {
    const ytId = getYouTubeVideoId(theme.backgroundVideoUrl);

    if (ytId) {
      return (
        <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none bg-black">
          <iframe
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none filter brightness-[0.55]"
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Background Video"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-[0.5]"
          src={theme.backgroundVideoUrl}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>
    );
  }

  // Handle Custom Image / GIF
  if (theme.backgroundType === 'custom-image' && theme.backgroundImageUrl) {
    return (
      <div
        className="absolute inset-0 -z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url('${theme.backgroundImageUrl}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
      </div>
    );
  }

  // Ambient Canvas (Stars / Particles / Rain)
  return (
    <div className="absolute inset-0 -z-0 bg-[#090a0f] pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.accentColor || '#8b5cf6'} 0%, transparent 60%)`,
        }}
      />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
