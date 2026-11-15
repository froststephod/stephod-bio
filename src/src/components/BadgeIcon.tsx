'use client';

import React from 'react';

interface Props {
  icon: string;
  className?: string;
  color?: string;
}

export default function BadgeIcon({ icon, className = 'w-4 h-4', color }: Props) {
  const iconKey = icon.toLowerCase().trim();

  switch (iconKey) {
    // 1. Mug / Beer (Image 2 - #1)
    case 'mug':
    case 'beer':
    case 'drink':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
          <path d="M9 12v6" />
          <path d="M13 12v6" />
          <path d="M14 7.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7.5z" />
          <path d="M6 7.5L9 4h2l3 3.5" />
        </svg>
      );

    // 2. Diamond / Premium (Image 2 - #2)
    case 'diamond':
    case 'premium':
    case 'gem':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3.5 8.5L5.5 13.5L12 22L18.5 13.5L20.5 8.5L12 2ZM6.3 8.5L9.5 4H14.5L17.7 8.5H6.3ZM12 4.6L14.7 8.5H9.3L12 4.6ZM11 10.5V18.8L5.9 12.5L7.7 10.5H11ZM13 10.5H16.3L18.1 12.5L13 18.8V10.5ZM12 18.2L8.5 10.5H15.5L12 18.2Z" />
        </svg>
      );

    // 3. Verified Scalloped Badge with Checkmark (Image 2 - #3)
    case 'verified':
    case 'check':
    case 'badge-check':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L14.5 3.5L18 3.3L19.2 6.6L22.4 8.2L21.9 11.7L23.7 14.8L21.4 17.5L21.4 21L17.9 21.4L15.3 23.7L12 22.4L8.7 23.7L6.1 21.4L2.6 21L2.6 17.5L0.3 14.8L2.1 11.7L1.6 8.2L4.8 6.6L6 3.3L9.5 3.5L12 1ZM10.5 16.5L17.5 9.5L16.1 8.1L10.5 13.7L7.9 11.1L6.5 12.5L10.5 16.5Z" />
        </svg>
      );

    // 4. Yura 4-point Star / Starburst (Image 2 - #4)
    case 'star':
    case 'starburst':
    case 'yura-star':
    case 'popular':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.8 8.2L24 12L14.8 15.8L12 24L9.2 15.8L0 12L9.2 8.2L12 0ZM12 5.5L10.2 10.2L5.5 12L10.2 13.8L12 18.5L13.8 13.8L18.5 12L13.8 10.2L12 5.5Z" />
        </svg>
      );

    // 5. Maple Leaf (Image 2 - #5)
    case 'leaf':
    case 'maple':
    case 'early':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.5 5.5L16 4.5L15.5 8L18.5 7.5L17.5 11L21 11.5L18 14.5L19 18L15 17L13 18.5V22H11V18.5L9 17L5 18L6 14.5L3 11.5L6.5 11L5.5 7.5L8.5 8L8 4.5L10.5 5.5L12 2Z" />
        </svg>
      );

    // Nitro Booster Rocket
    case 'booster':
    case 'rocket':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5C7.5 2.5 4.5 7 4.5 12.5C4.5 14.8 5.2 17 6.3 18.7L4 21L7 20.3C8.5 21.2 10.2 21.7 12 21.7C13.8 21.7 15.5 21.2 17 20.3L20 21L17.7 18.7C18.8 17 19.5 14.8 19.5 12.5C19.5 7 16.5 2.5 12 2.5ZM12 7C13.7 7 15 8.3 15 10C15 11.7 13.7 13 12 13C10.3 13 9 11.7 9 10C9 8.3 10.3 7 12 7ZM10.5 16H13.5V18.5H10.5V16Z" />
        </svg>
      );

    // OG / Crown
    case 'crown':
    case 'og':
    case 'vip':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.5 19H21.5V21H2.5V19ZM4 17L2 7L7.5 11L12 4L16.5 11L22 7L20 17H4Z" />
        </svg>
      );

    // Staff / Hammer
    case 'hammer':
    case 'staff':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
          <path d="M17.64 4.36a3 3 0 0 0-4.24 0L12 5.76l6.24 6.24 1.4-1.4a3 3 0 0 0 0-4.24z" />
        </svg>
      );

    // Partner / Heart
    case 'heart':
    case 'partner':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );

    // Event Trophy
    case 'trophy':
    case 'winner':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
          <path d="M6 4h12a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z" />
        </svg>
      );

    // Flame / Trending
    case 'fire':
    case 'flame':
    case 'trending':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.03-5.83 4.23-7.5.38-.29.91-.17 1.13.25.75 1.45 2.04 2.8 3.64 3.25.32.09.61-.17.6-.5-.07-2.12.87-4.14 2.15-5.69.29-.35.83-.34 1.1.03C17.67 8.08 21 12.02 21 15c0 4.42-4.03 8-9 8z" />
        </svg>
      );

    // Gamer / Controller
    case 'game':
    case 'gamer':
    case 'gamepad':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      );

    // Code / Developer
    case 'code':
    case 'dev':
    case 'developer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );

    // Fallback: If it's an emoji or custom text
    default:
      return <span className="inline-block text-xs select-none">{icon}</span>;
  }
}
