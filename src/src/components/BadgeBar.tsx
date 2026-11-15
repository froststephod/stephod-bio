'use client';

import React, { useState } from 'react';
import { Badge } from '@/types/profile';
import BadgeIcon from './BadgeIcon';

interface Props {
  badges: Badge[];
  className?: string;
}

export default function BadgeBar({ badges, className = '' }: Props) {
  const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);

  if (!badges || badges.length === 0) return null;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Floating Tooltip */}
      {hoveredBadge && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-xs font-semibold text-white drop-shadow">
              {hoveredBadge.name}
            </span>
            {hoveredBadge.description && (
              <span className="text-[10px] text-white/50 border-l border-white/20 pl-1.5">
                {hoveredBadge.description}
              </span>
            )}
          </div>
          {/* Arrow */}
          <div className="w-1.5 h-1.5 bg-black/90 border-r border-b border-white/20 rotate-45 mx-auto -mt-1" />
        </div>
      )}

      {/* Pill Capsule (Image 2 style) */}
      <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-xl transition-all hover:border-white/20">
        {badges.map((badge) => {
          const color = badge.color || '#ffffff';
          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHoveredBadge(badge)}
              onMouseLeave={() => setHoveredBadge(null)}
              className="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-125"
              style={{
                color: color,
                filter: `drop-shadow(0 0 6px ${color}90) drop-shadow(0 0 2px ${color})`,
              }}
            >
              <BadgeIcon icon={badge.icon} color={color} className="w-4 h-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
