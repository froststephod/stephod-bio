'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  type?: 'none' | 'sparkles' | 'hearts' | 'bubbles' | 'stars' | 'smoke';
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

export default function CursorTrail({ type = 'none' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!type || type === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const count = type === 'smoke' ? 2 : 3;

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
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: type === 'hearts' || type === 'bubbles' ? -Math.random() * 2 - 0.5 : (Math.random() - 0.5) * 1.5,
          size: type === 'smoke' ? Math.random() * 12 + 8 : Math.random() * 12 + 10,
          alpha: 1,
          color,
          char,
          life: 0,
          maxLife: Math.random() * 25 + 25,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [type]);

  if (!type || type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 select-none"
    />
  );
}
