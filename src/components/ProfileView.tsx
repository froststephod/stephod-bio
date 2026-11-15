'use client';

import React, { useState, useEffect } from 'react';
import { fireConfetti } from '@/lib/confetti';
import { Eye, Heart, Sparkles, MapPin, Share2, Check } from 'lucide-react';
import { ProfileData } from '@/types/profile';
import BackgroundCanvas from './BackgroundCanvas';
import AudioPlayer from './AudioPlayer';
import DiscordWidget from './DiscordWidget';
import SocialIcon from './SocialIcon';
import BadgeBar from './BadgeBar';
import AvatarWithDecoration from './AvatarWithDecoration';
import { getSpotifyInfo } from '@/lib/music';
import { siteConfig } from '@/config/site';
import { getFontCssFamily } from '@/lib/fonts';

interface Props {
  profile: ProfileData;
  isPreview?: boolean;
}

export default function ProfileView({ profile, isPreview = false }: Props) {
  const isClickToEnterEnabled = profile.theme.clickToEnter !== false; // defaults to true
  const [hasEntered, setHasEntered] = useState(isPreview || !isClickToEnterEnabled);
  const [likes, setLikes] = useState(profile.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect for titles
  useEffect(() => {
    if (!profile.titles || profile.titles.length === 0) return;

    const currentTitle = profile.titles[currentTitleIndex % profile.titles.length];
    const speed = isDeleting ? 40 : (profile.theme.typewriterSpeed || 90);

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentTitle.substring(0, displayedText.length + 1));
        if (displayedText.length + 1 === currentTitle.length) {
          setTimeout(() => setIsDeleting(true), 1600); // pause at full word
        }
      } else {
        setDisplayedText(currentTitle.substring(0, displayedText.length - 1));
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setCurrentTitleIndex((prev) => (prev + 1) % profile.titles.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentTitleIndex, profile.titles, profile.theme.typewriterSpeed]);

  const handleEnter = () => {
    setHasEntered(true);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) return;

    // Trigger confetti burst
    fireConfetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: [profile.theme.accentColor || '#22c55e', '#ffffff', '#ec4899', '#3b82f6'],
    });

    setLikes((prev) => prev + 1);
    setHasLiked(true);

    if (!isPreview) {
      try {
        await fetch(`/api/profiles/${profile.username}/like`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to register like:', err);
      }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const accent = profile.theme.accentColor || '#22c55e';
  const glow = profile.theme.glowColor || accent;
  const blurPx = profile.theme.cardBlur ?? 16;
  const opacityVal = (profile.theme.cardOpacity ?? 35) / 100;
  const radiusPx = profile.theme.cardRadius ?? 24;
  const spotifyInfo = profile.audio?.enabled ? getSpotifyInfo(profile.audio.audioUrl) : null;

  // New features: Layout, Card Style, Corner Shape, Custom Colors & Fonts
  const layout = profile.theme.layout || 'center';
  const cardStyle = profile.theme.cardStyle || 'glassmorphic';
  const isTransparent = cardStyle === 'transparent';
  const cornerShape = profile.theme.cornerShape || 'rounded';
  const nameColor = profile.theme.nameColor || '#ffffff';
  const textColor = profile.theme.textColor || '#d1d5db';
  const nameFont = profile.theme.nameFont || 'inherit';
  const textFont = profile.theme.textFont || 'inherit';

  // Corner radius styling
  let borderRadiusStyle: React.CSSProperties = { borderRadius: `${radiusPx}px` };
  let cornerClass = 'rounded-2xl';

  if (cornerShape === 'sharp') {
    borderRadiusStyle = { borderRadius: '0px' };
    cornerClass = 'rounded-none';
  } else if (cornerShape === 'extra-rounded') {
    borderRadiusStyle = { borderRadius: '28px' };
    cornerClass = 'rounded-[28px]';
  } else if (cornerShape === 'capsule') {
    borderRadiusStyle = { borderRadius: '40px' };
    cornerClass = 'rounded-[40px]';
  } else if (cornerShape === 'leaf') {
    borderRadiusStyle = { borderRadius: '36px 6px 36px 6px' };
    cornerClass = 'rounded-tl-[36px] rounded-br-[36px] rounded-tr-md rounded-bl-md';
  }

  // Card style / material handling
  let cardBorderClass = 'border border-white/10';
  let cardBgColor = `rgba(18, 19, 26, ${opacityVal})`;
  let extraCardStyles: React.CSSProperties = {};

  if (isTransparent) {
    cardBorderClass = '!border-none !border-transparent shadow-none';
    cardBgColor = 'transparent';
    extraCardStyles = {
      boxShadow: 'none',
      background: 'transparent',
    };
  } else if (cardStyle === 'frosted-square') {
    cardBorderClass = 'border border-white/20 shadow-2xl';
    cardBgColor = `rgba(10, 10, 14, ${Math.max(opacityVal, 0.65)})`;
  } else if (cardStyle === 'frosted-soft') {
    cardBorderClass = 'border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]';
    cardBgColor = `rgba(24, 24, 32, ${opacityVal})`;
  } else if (cardStyle === 'neon') {
    cardBorderClass = 'border-2';
    cardBgColor = `rgba(12, 13, 18, ${Math.max(opacityVal, 0.75)})`;
    extraCardStyles = {
      borderColor: accent,
      boxShadow: `0 0 25px ${glow}50, inset 0 0 15px ${glow}20`,
    };
  } else if (cardStyle === 'cyber') {
    cardBorderClass = 'border border-white/20 border-t-2 border-b-2 shadow-2xl';
    cardBgColor = `rgba(8, 10, 15, ${Math.max(opacityVal, 0.85)})`;
    extraCardStyles = {
      borderTopColor: accent,
      borderBottomColor: accent,
    };
  }

  // Width depending on layout
  const maxCardWidth =
    layout === 'left' ? 'max-w-[680px]' : layout === 'compact' ? 'max-w-[560px]' : 'max-w-[440px]';

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-emerald-500/30 selection:text-white"
      style={{
        cursor: profile.theme.customCursor ? 'crosshair' : 'default',
        fontFamily: textFont !== 'inherit' ? getFontCssFamily(textFont) : undefined,
      }}
    >
      {/* Custom CSS Injection if provided in advanced mode */}
      {profile.theme.customCss && (
        <style dangerouslySetInnerHTML={{ __html: profile.theme.customCss }} />
      )}

      {/* Background Layer */}
      <BackgroundCanvas theme={profile.theme} />

      {/* Click To Enter Splash Screen */}
      {!hasEntered && isClickToEnterEnabled && (
        <div
          onClick={handleEnter}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl cursor-pointer transition-opacity duration-700 animate-in fade-in"
        >
          <div className="relative group text-center p-8">
            <div
              className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl transition-all duration-700 group-hover:opacity-75"
              style={{ backgroundColor: accent }}
            />
            <div className="relative flex flex-col items-center gap-3">
              <span className="text-3xl animate-bounce">✨</span>
              <p className="text-sm md:text-base font-mono tracking-[0.25em] text-white/90 uppercase select-none">
                {profile.theme.enterMessage || '[ click anywhere to enter ]'}
              </p>
              <p className="text-xs text-white/40 font-mono tracking-wider">
                {profile.displayName || profile.username}&apos;s profile
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Card Container */}
      <div
        className={`relative w-full ${maxCardWidth} z-10 transition-all duration-500 ${
          hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Ambient Glow behind card (hidden when transparent so it's truly invisible/luminous) */}
        {profile.theme.glowEffect && !isTransparent && (
          <div
            className="absolute -inset-1 rounded-3xl opacity-30 blur-2xl transition-all pointer-events-none"
            style={{ backgroundColor: glow }}
          />
        )}

        {/* Card Body */}
        <div
          className={`relative overflow-hidden ${cardBorderClass} transition-all duration-300 ${cornerClass}`}
          style={{
            backgroundColor: isTransparent ? 'transparent' : cardBgColor,
            backdropFilter: isTransparent ? 'none' : `blur(${blurPx}px)`,
            WebkitBackdropFilter: isTransparent ? 'none' : `blur(${blurPx}px)`,
            ...borderRadiusStyle,
            ...extraCardStyles,
            boxShadow: isTransparent
              ? 'none'
              : profile.theme.glowEffect && cardStyle !== 'neon'
              ? `0 0 35px ${accent}25`
              : extraCardStyles.boxShadow,
          }}
        >
          {/* Cyber Accent Lines for cyber cardStyle */}
          {cardStyle === 'cyber' && (
            <>
              <div
                className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 pointer-events-none"
                style={{ borderColor: accent }}
              />
              <div
                className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 pointer-events-none"
                style={{ borderColor: accent }}
              />
              <div
                className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 pointer-events-none"
                style={{ borderColor: accent }}
              />
              <div
                className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 pointer-events-none"
                style={{ borderColor: accent }}
              />
            </>
          )}

          {/* Top Banner (Optional) */}
          {profile.bannerUrl && layout !== 'compact' && (
            <div className={`w-full h-28 relative overflow-hidden ${isTransparent ? 'rounded-2xl mb-2' : ''}`}>
              <img
                src={profile.bannerUrl}
                alt="Profile Banner"
                className="w-full h-full object-cover filter brightness-[0.7]"
              />
              {!isTransparent && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#12131a]" />
              )}
            </div>
          )}

          {/* 1. LAYOUT: CENTER (Standard Classic Aesthetic) */}
          {layout === 'center' && (
            <div className={`p-6 sm:p-7 text-center ${profile.bannerUrl && !isTransparent ? '-mt-14' : 'pt-7'}`}>
              {/* Avatar with Discord Decoration Frame */}
              <div className="relative inline-block mx-auto mb-3">
                <AvatarWithDecoration
                  avatarUrl={profile.avatarUrl}
                  decoration={profile.avatarDecoration}
                  accentColor={accent}
                  size="lg"
                />
              </div>

              {/* Display Name */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md"
                  style={{
                    color: nameColor,
                    fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                    textShadow: isTransparent ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)' : undefined,
                  }}
                >
                  {profile.displayName || profile.username}
                </h1>
              </div>

              {/* Handle / Username */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span
                  className="text-xs font-mono tracking-wider opacity-60"
                  style={{
                    color: textColor,
                    textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                  }}
                >
                  @{profile.username}
                </span>
                <button
                  onClick={handleShare}
                  className="p-1 rounded text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                  title="Copy profile link"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                </button>
              </div>

              {/* Badge Capsule Pill */}
              {profile.badges && profile.badges.length > 0 && (
                <div className="mt-2.5">
                  <BadgeBar badges={profile.badges} />
                </div>
              )}

              {/* Typewriter Rotating Title */}
              {profile.titles && profile.titles.length > 0 && (
                <div className="h-6 mt-2 flex items-center justify-center text-xs sm:text-sm font-medium tracking-wide">
                  <span
                    style={{
                      color: accent,
                      textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                    }}
                  >
                    {displayedText}
                  </span>
                  <span
                    className="w-1.5 h-3.5 ml-0.5 inline-block animate-pulse"
                    style={{ backgroundColor: accent }}
                  />
                </div>
              )}

              {/* Bio Description */}
              {profile.bio && (
                <p
                  className="mt-3 text-xs sm:text-sm leading-relaxed font-light px-2 whitespace-pre-line opacity-85"
                  style={{
                    color: textColor,
                    textShadow: isTransparent ? '0 2px 10px rgba(0,0,0,0.95)' : undefined,
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Occupation & Location */}
              {(profile.occupation || profile.location) && (
                <div
                  className="flex items-center justify-center gap-3 text-[11px] mt-2 flex-wrap opacity-60"
                  style={{
                    color: textColor,
                    textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                  }}
                >
                  {profile.occupation && (
                    <span className="flex items-center gap-1">
                      <span>💼</span>
                      <span>{profile.occupation}</span>
                    </span>
                  )}
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 opacity-70" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Discord Presence Widget */}
              {profile.discordWidget && profile.discordWidget.enabled && (
                <DiscordWidget config={profile.discordWidget} accentColor={accent} />
              )}

              {/* Official Spotify Embed Player Widget */}
              {spotifyInfo && (
                <div className="mt-4 w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl bg-black/60">
                  <iframe
                    src={spotifyInfo.embedUrl}
                    width="100%"
                    height={spotifyInfo.height}
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Player"
                    className="rounded-2xl w-full"
                  />
                </div>
              )}

              {/* Social Links Grid */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${
                        isTransparent
                          ? 'border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 hover:border-white/30 shadow-lg'
                          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/30'
                      }`}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="text-white/70 group-hover:text-white transition-colors">
                        <SocialIcon platform={link.platform} className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <span className="text-xs font-medium text-white/80 group-hover:text-white truncate">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Profile Footer Stats: Views & Likes */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs opacity-50 font-mono">
                <div
                  className="flex items-center gap-1.5"
                  title="Profile Views"
                  style={{ textShadow: isTransparent ? '0 1px 6px rgba(0,0,0,0.9)' : undefined }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{(profile.views || 0).toLocaleString()} views</span>
                </div>

                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${
                    hasLiked
                      ? 'text-pink-400 bg-pink-500/10 cursor-default'
                      : 'text-white/60 hover:text-pink-400 hover:bg-white/5 active:scale-95'
                  }`}
                  title="Send a heart"
                  style={{ textShadow: isTransparent ? '0 1px 6px rgba(0,0,0,0.9)' : undefined }}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                  <span>{likes.toLocaleString()}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. LAYOUT: LEFT (Split / Horizontal 2-Column HUD Layout) */}
          {layout === 'left' && (
            <div className={`p-6 sm:p-7 ${profile.bannerUrl ? '-mt-10' : 'pt-6'}`}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Left Side: Avatar, Name, Handle, Badges, Discord */}
                <div className="sm:w-[240px] flex-shrink-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="relative mb-3">
                    <AvatarWithDecoration
                      avatarUrl={profile.avatarUrl}
                      decoration={profile.avatarDecoration}
                      accentColor={accent}
                      size="lg"
                    />
                  </div>

                  <h1
                    className="text-xl font-bold tracking-tight drop-shadow-md"
                    style={{
                      color: nameColor,
                      fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                      textShadow: isTransparent ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)' : undefined,
                    }}
                  >
                    {profile.displayName || profile.username}
                  </h1>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-xs font-mono tracking-wider opacity-60"
                      style={{
                        color: textColor,
                        textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                      }}
                    >
                      @{profile.username}
                    </span>
                    <button
                      onClick={handleShare}
                      className="p-1 rounded text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                      title="Copy profile link"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                    </button>
                  </div>

                  {profile.badges && profile.badges.length > 0 && (
                    <div className="mt-2.5">
                      <BadgeBar badges={profile.badges} />
                    </div>
                  )}

                  {/* Discord Presence Widget on Left */}
                  {profile.discordWidget && profile.discordWidget.enabled && (
                    <div className="w-full mt-3">
                      <DiscordWidget config={profile.discordWidget} accentColor={accent} />
                    </div>
                  )}

                  {/* Views & Likes */}
                  <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs opacity-50 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{(profile.views || 0).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleLike}
                      disabled={hasLiked}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        hasLiked ? 'text-pink-400' : 'text-white/60 hover:text-pink-400'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                      <span>{likes.toLocaleString()}</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Titles, Bio, Spotify, Social Links */}
                <div className="flex-1 w-full flex flex-col justify-center text-center sm:text-left sm:pl-6 sm:border-l border-white/10 pt-4 sm:pt-0">
                  {/* Typewriter Rotating Title */}
                  {profile.titles && profile.titles.length > 0 && (
                    <div className="h-6 flex items-center justify-center sm:justify-start text-xs sm:text-sm font-medium tracking-wide">
                      <span
                        style={{
                          color: accent,
                          textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                        }}
                      >
                        {displayedText}
                      </span>
                      <span
                        className="w-1.5 h-3.5 ml-0.5 inline-block animate-pulse"
                        style={{ backgroundColor: accent }}
                      />
                    </div>
                  )}

                  {/* Bio Description */}
                  {profile.bio && (
                    <p
                      className="mt-2 text-xs sm:text-sm leading-relaxed font-light whitespace-pre-line opacity-85"
                      style={{
                        color: textColor,
                        textShadow: isTransparent ? '0 2px 10px rgba(0,0,0,0.95)' : undefined,
                      }}
                    >
                      {profile.bio}
                    </p>
                  )}

                  {/* Occupation & Location */}
                  {(profile.occupation || profile.location) && (
                    <div
                      className="flex items-center justify-center sm:justify-start gap-3 text-[11px] mt-2 flex-wrap opacity-60"
                      style={{
                        color: textColor,
                        textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                      }}
                    >
                      {profile.occupation && (
                        <span className="flex items-center gap-1">
                          <span>💼</span>
                          <span>{profile.occupation}</span>
                        </span>
                      )}
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 opacity-70" />
                          <span>{profile.location}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Spotify Player */}
                  {spotifyInfo && (
                    <div className="mt-3.5 w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl bg-black/60">
                      <iframe
                        src={spotifyInfo.embedUrl}
                        width="100%"
                        height={spotifyInfo.height}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Spotify Player"
                        className="rounded-2xl w-full"
                      />
                    </div>
                  )}

                  {/* Social Links Grid */}
                  {profile.socialLinks && profile.socialLinks.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {profile.socialLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group relative flex items-center gap-2 p-2 rounded-xl border transition-all overflow-hidden ${
                            isTransparent
                              ? 'border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 hover:border-white/30'
                              : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/30'
                          }`}
                        >
                          <div className="text-white/70 group-hover:text-white transition-colors">
                            <SocialIcon platform={link.platform} className="w-3.5 h-3.5 flex-shrink-0" />
                          </div>
                          <span className="text-xs font-medium text-white/80 group-hover:text-white truncate">
                            {link.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. LAYOUT: COMPACT (Mini / High-Density Sleek Pill Card) */}
          {layout === 'compact' && (
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                {/* Compact Avatar */}
                <div className="relative flex-shrink-0">
                  <AvatarWithDecoration
                    avatarUrl={profile.avatarUrl}
                    decoration={profile.avatarDecoration}
                    accentColor={accent}
                    size="md"
                  />
                </div>

                {/* Core Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1
                      className="text-base sm:text-lg font-bold tracking-tight truncate"
                      style={{
                        color: nameColor,
                        fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                        textShadow: isTransparent ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)' : undefined,
                      }}
                    >
                      {profile.displayName || profile.username}
                    </h1>
                    <span
                      className="text-[11px] font-mono opacity-50"
                      style={{
                        color: textColor,
                        textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                      }}
                    >
                      @{profile.username}
                    </span>
                  </div>

                  {/* Titles */}
                  {profile.titles && profile.titles.length > 0 && (
                    <div
                      className="text-xs font-medium truncate mt-0.5"
                      style={{
                        color: accent,
                        textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                      }}
                    >
                      {displayedText}
                    </div>
                  )}

                  {/* Badges capsule */}
                  {profile.badges && profile.badges.length > 0 && (
                    <div className="mt-1">
                      <BadgeBar badges={profile.badges} />
                    </div>
                  )}
                </div>

                {/* Like & Share Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleLike}
                    disabled={hasLiked}
                    className={`p-2 rounded-xl border border-white/10 transition-all ${
                      hasLiked
                        ? 'text-pink-400 bg-pink-500/10'
                        : isTransparent
                        ? 'bg-black/40 backdrop-blur-md text-white/60 hover:text-pink-400 hover:bg-black/60'
                        : 'text-white/60 hover:text-pink-400 hover:bg-white/5'
                    }`}
                    title="Like"
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-xl border border-white/10 transition-all ${
                      isTransparent
                        ? 'bg-black/40 backdrop-blur-md text-white/50 hover:text-white hover:bg-black/60'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    title="Share"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bio in Compact */}
              {profile.bio && (
                <p
                  className="mt-3 text-xs leading-relaxed font-light opacity-80 pt-2 border-t border-white/5"
                  style={{
                    color: textColor,
                    textShadow: isTransparent ? '0 2px 10px rgba(0,0,0,0.95)' : undefined,
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Spotify Player in Compact */}
              {spotifyInfo && (
                <div className="mt-3 w-full rounded-xl overflow-hidden border border-emerald-500/20 shadow-md bg-black/60">
                  <iframe
                    src={spotifyInfo.embedUrl}
                    width="100%"
                    height={80}
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Player"
                    className="rounded-xl w-full"
                  />
                </div>
              )}

              {/* Social Links Strip */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto py-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profile.socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-lg border transition-all ${
                          isTransparent
                            ? 'border-white/10 bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60'
                            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-white/70 hover:text-white'
                        }`}
                        title={link.label}
                      >
                        <SocialIcon platform={link.platform} className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] opacity-40 font-mono flex-shrink-0">
                    <Eye className="w-3 h-3" />
                    <span>{(profile.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Small aesthetic watermark badge */}
        <div className="mt-3 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/80 font-mono transition-colors group"
          >
            <img src="/logo.png" alt="STEPHOD" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="tracking-wider">{siteConfig.watermarkText || 'stephod.bio'}</span>
          </a>
        </div>
      </div>

      {/* Background Audio Player */}
      <AudioPlayer
        audio={profile.audio}
        accentColor={accent}
        hasEntered={hasEntered}
      />
    </div>
  );
}
