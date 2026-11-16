'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  type?: 'none' | 'sparkles' | 'hearts' | 'bubbles' | 'stars' | 'smoke';
  isPreview?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  char?: string;
  life: number;
  maxLife: number;
}

export default function CursorTrail({ type = 'none', isPreview = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Disable in dashboard editor preview to prevent particles from polluting form inputs
    if (isPreview || !type || type === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const updateSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    window.addEventListener('resize', updateSize);

    const particles: Particle[] = [];
    let lastX = -999;
    let lastY = -999;
    let lastTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Ignore zero or out-of-bounds coords (prevents diagonal streaks from 0,0)
      if (x <= 5 && y <= 5) return;

      const now = Date.now();
      const dist = Math.hypot(x - lastX, y - lastY);

      // Require minimum movement to avoid particle clumps
      if (dist < 12 && now - lastTime < 35) return;
      lastX = x;
      lastY = y;
      lastTime = now;

      const count = type === 'smoke' ? 1 : 2;

      for (let i = 0; i < count; i++) {
        let char = '';
        let color = '#ffffff';

        if (type === 'hearts') {
          char = '💖';
          color = '#ec4899';
        } else if (type === 'stars') {
          char = '⭐';
          color = '#facc15';
        } else if (type === 'bubbles') {
          char = '🫧';
          color = '#38bdf8';
        } else if (type === 'sparkles') {
          char = '✦';
          color = ['#38bdf8', '#10b981', '#facc15', '#ffffff', '#ec4899'][Math.floor(Math.random() * 5)];
        } else if (type === 'smoke') {
          color = 'rgba(16, 185, 129, 0.4)';
        }

        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: type === 'hearts' || type === 'bubbles' ? -Math.random() * 1.5 - 0.5 : (Math.random() - 0.5) * 1.2,
          size: type === 'smoke' ? Math.random() * 10 + 6 : Math.random() * 10 + 9,
          alpha: 1,
          color,
          char,
          life: 0,
          maxLife: Math.random() * 20 + 20,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.char) {
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillStyle = p.color;
          ctx.fillText(p.char, p.x, p.y);
        } else {
          // Smoke puff
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [type, isPreview]);

  if (isPreview || !type || type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden"
    />
  );
}
