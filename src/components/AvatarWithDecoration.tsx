'use client';

import React from 'react';
import { AvatarDecoration } from '@/types/profile';

interface Props {
  avatarUrl: string;
  decoration?: AvatarDecoration;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  accentColor?: string;
}

export default function AvatarWithDecoration({
  avatarUrl,
  decoration,
  size = 'lg',
  className = '',
  accentColor = '#a855f7',
}: Props) {
  const shape = decoration?.shape || 'circle';
  const decorationUrl = decoration?.url;
  const type = decoration?.type || (decorationUrl ? 'discord-cdn' : 'none');
  const hue = decoration?.hue || 0;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    squircle: 'rounded-2xl',
    'soft-square': 'rounded-xl',
  };

  const currentShapeClass = shapeClasses[shape];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Container */}
      <div
        className={`relative ${sizeClasses[size]} ${currentShapeClass} transition-transform duration-300 hover:scale-105 overflow-hidden`}
      >
        <img
          src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
          alt="Avatar"
          className={`w-full h-full object-cover ${currentShapeClass} bg-neutral-900`}
        />
      </div>

      {/* Real Discord Official Avatar Decoration Overlay (APNG/Animated) */}
      {decorationUrl && type !== 'none' && (
        <img
          src={decorationUrl}
          alt={decoration?.name || 'Discord Avatar Decoration'}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[124%] h-[124%] max-w-none pointer-events-none z-10 object-contain select-none"
          style={{
            filter: hue > 0 ? `hue-rotate(${hue}deg)` : undefined,
          }}
        />
      )}

      {/* Fallback CSS animated decorations if no direct Discord CDN url */}
      {!decorationUrl && type !== 'none' && (
        <div
          className="absolute -inset-3 sm:-inset-3.5 pointer-events-none flex items-center justify-center z-10"
          style={{
            filter: hue > 0 ? `hue-rotate(${hue}deg)` : undefined,
          }}
        >
          {type === 'spirit-embers' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/80 animate-[spin_8s_linear_infinite] shadow-[0_0_15px_#22d3ee]" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-300 rounded-full blur-xs animate-bounce" />
            </div>
          )}
          {type === 'cyber-matrix' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500 animate-[spin_6s_linear_infinite] shadow-[0_0_20px_#a855f7]" />
            </div>
          )}
          {type === 'lightning' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-300 shadow-[0_0_20px_#fde047] animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
