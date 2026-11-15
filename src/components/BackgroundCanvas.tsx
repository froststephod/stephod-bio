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
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
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
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      </div>
    );
  }

  // Handle Custom Image
  if (theme.backgroundType === 'custom-image' && theme.backgroundImageUrl) {
    return (
      <div
        className="absolute inset-0 -z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${theme.backgroundImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-0 w-full h-full pointer-events-none"
    />
  );
}
