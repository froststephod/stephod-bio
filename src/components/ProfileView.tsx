'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fireConfetti } from '@/lib/confetti';
import { Eye, Heart, Sparkles, MapPin, Share2, Check, Volume2 } from 'lucide-react';
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
import AnimatedTextEffect from './AnimatedTextEffect';
import CursorTrail from './CursorTrail';

interface Props {
  profile: ProfileData;
  isPreview?: boolean;
}

export default function ProfileView({ profile: initialProfile, isPreview = false }: Props) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // Sync if prop changes
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Live real-time auto-sync: BroadcastChannel (0ms), Tab synchronization & periodic background poll
  useEffect(() => {
    if (isPreview) return;

    // A) BroadcastChannel for instantaneous (0ms) cross-tab update
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('stephod_live_sync');
        bc.onmessage = (event) => {
          if (
            event.data?.profile &&
            event.data.profile.username?.toLowerCase() === profile.username.toLowerCase()
          ) {
            setProfile(event.data.profile);
          }
        };
      } catch {}
    }

    // B) Listen for localStorage change from Dashboard tab
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'stephod_profile_' + profile.username.toLowerCase() ||
        e.key === 'stephod_profile_sync'
      ) {
        try {
          const raw = localStorage.getItem('stephod_profile_' + profile.username.toLowerCase());
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.username) {
              setProfile(parsed);
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // C) Background sync: server is the single source of truth.
    // Only update state when the content really changed (prevents flip-flopping).
    const sig = (p: ProfileData) => JSON.stringify({ ...p, views: 0, likes: 0, updatedAt: '' });
    const syncLatest = async () => {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(profile.username)}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.profile) {
            setProfile((prev) => (sig(prev) === sig(data.profile) ? prev : data.profile));
          }
        }
      } catch {}
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncLatest();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncLatest);
    // Ultra-responsive poll: 1.2s when tab is active/visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncLatest();
      }
    }, 1200);

    return () => {
      if (bc) {
        try { bc.close(); } catch {}
      }
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncLatest);
      clearInterval(interval);
    };
  }, [profile.username, isPreview]);

  const isClickToEnterEnabled = profile.theme?.clickToEnter === true; // defaults to false (music & profile load instantly)
  const [hasEntered, setHasEntered] = useState(isPreview || !isClickToEnterEnabled);

  // If clickToEnter is disabled or becomes disabled, automatically reveal profile card
  useEffect(() => {
    if (!isClickToEnterEnabled) {
      setHasEntered(true);
    }
  }, [isClickToEnterEnabled]);

  // Global keydown listener to enter
  useEffect(() => {
    const handleGlobalKey = () => {
      setHasEntered(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stephod_play_audio'));
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);
  const [likes, setLikes] = useState(profile.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const titlesKey = (profile.titles || []).join('\u0001');
  const validTitles = React.useMemo(() => {
    return titlesKey.split('\u0001').map((t) => t.trim()).filter(Boolean);
  }, [titlesKey]);

  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(
    validTitles.length > 0 ? validTitles[0] : ''
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    setBannerFailed(false);
  }, [profile.bannerUrl]);

  const hasBanner = Boolean(profile.bannerUrl && profile.bannerUrl.trim() && !bannerFailed);

  // Real-time presence & live views
  const [views, setViews] = useState(profile.views || 0);
  const [liveViewers, setLiveViewers] = useState(1);
  const [showLiveNotification, setShowLiveNotification] = useState(false);
  const [liveNotificationText, setLiveNotificationText] = useState('');
  const lastViewCountRef = useRef(profile.views || 0);

  // 3D Card Tilt state
  const [tiltStyle, setTiltStyle] = useState<{ transform: string; transition?: string }>({ transform: '' });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profile.theme.extraEffects?.cardTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleCardMouseLeave = () => {
    if (!profile.theme.extraEffects?.cardTilt) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    });
  };

  // Real-time Heartbeat & Live Visitor Tracking
  useEffect(() => {
    if (isPreview) return;

    let visitorId = '';
    try {
      visitorId = sessionStorage.getItem('stephod_vid') || '';
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        sessionStorage.setItem('stephod_vid', visitorId);
      }
    } catch {
      visitorId = 'vid_' + Math.random().toString(36).substring(2, 9);
    }

    const sendPresence = async (isEnter = false) => {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(profile.username)}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId, isEnter }),
        });
        const data = await res.json();
        if (data && data.success) {
          setLiveViewers(data.liveViewers || 1);
          if (typeof data.totalViews === 'number') {
            if (data.totalViews > lastViewCountRef.current && !isEnter) {
              setLiveNotificationText(`มีผู้เข้าชมคนใหม่เข้ามาดูโปรไฟล์สด! (ยอดวิว: ${data.totalViews.toLocaleString()})`);
              setShowLiveNotification(true);
              setTimeout(() => setShowLiveNotification(false), 5000);
            }
            setViews(data.totalViews);
            lastViewCountRef.current = data.totalViews;
          }
        }
      } catch {
        // Silently continue
      }
    };

    sendPresence(true);
    const interval = setInterval(() => sendPresence(false), 8000);
    return () => clearInterval(interval);
  }, [profile.username, isPreview]);

  // Typewriter effect for titles (Robust & race-condition free)
  useEffect(() => {
    if (validTitles.length === 0) {
      setDisplayedText('');
      return;
    }

    const currentTitle = validTitles[currentTitleIndex % validTitles.length];
    const baseSpeed =
      profile.theme.extraEffects?.typewriterSpeed ||
      (profile.theme.typewriterSpeed && profile.theme.typewriterSpeed < 70
        ? profile.theme.typewriterSpeed
        : 35);
    // Rotating titles use a calmer pace than name/bio effects
    const typingSpeed = Math.max(90, Math.round(baseSpeed * 2.6));
    const deleteSpeed = Math.max(45, Math.round(baseSpeed * 1.3));
    const pauseTime = Math.max(
      1600,
      (profile.theme.extraEffects?.pauseDuration || 500) * 3
    );

    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentTitle.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentTitle.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentTitle.substring(0, displayedText.length - 1));
        }, deleteSpeed);
      } else {
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
          setCurrentTitleIndex((prev) => (prev + 1) % validTitles.length);
        }, 350);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [
    displayedText,
    isDeleting,
    currentTitleIndex,
    validTitles,
    profile.theme.typewriterSpeed,
    profile.theme.extraEffects?.typewriterSpeed,
    profile.theme.extraEffects?.pauseDuration,
  ]);

  const handleEnter = () => {
    setHasEntered(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stephod_play_audio'));
    }
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
  const opacityVal = (profile.theme.cardOpacity ?? 30) / 100;
  const radiusPx = profile.theme.cardRadius ?? 24;
  const baseTypewriterSpeed =
    profile.theme.extraEffects?.typewriterSpeed ||
    (profile.theme.typewriterSpeed && profile.theme.typewriterSpeed < 70
      ? profile.theme.typewriterSpeed
      : 35);
  const basePauseDuration =
    profile.theme.extraEffects?.pauseDuration ||
    (baseTypewriterSpeed <= 22 ? 300 : baseTypewriterSpeed <= 40 ? 550 : 900);
  const spotifyInfo = profile.audio?.enabled ? getSpotifyInfo(profile.audio.audioUrl) : null;

  // New features: Layout, Card Style, Corner Shape, Custom Colors & Fonts
  const layout = profile.theme.layout || 'center';
  const cardStyle = profile.theme.cardStyle || 'glassmorphic';
  const isTransparent = cardStyle === 'transparent';
  const cornerShape = profile.theme.cornerShape || 'rounded';
  const nameColor = profile.theme.nameColor || '#ffffff';
  const textColor = profile.theme.textColor || '#d1d5db';
  const nameFont = profile.theme.nameFont || 'inherit';
  const hasGlowingNameEffect = profile.theme.extraEffects?.nameEffects?.some((e) =>
    ['rgb-glow', 'rgb-wave', 'rainbow', 'glow', 'rgb', 'rainbow-glow'].includes(e)
  );
  const textFont = profile.theme.textFont || 'inherit';

  // Extra Effects state
  const isGlowIcons = profile.theme.extraEffects?.glowIcons !== false;
  const isViewsAnimation = !!profile.theme.extraEffects?.viewsAnimation;
  const isAudioVisualizer = !!profile.theme.extraEffects?.audioVisualizer;

  const getSocialPlatformColor = (platform: string, label?: string, customColor?: string): string => {
    if (customColor && customColor.trim()) {
      return customColor.trim();
    }
    const raw = `${platform || ''} ${label || ''}`.toLowerCase().trim();
    if (raw.includes('discord')) return '#5865F2';
    if (raw.includes('tiktok') || raw.includes('tik')) return '#25F4EE';
    if (raw.includes('instagram') || raw.includes('insta') || raw.includes('ig')) return '#E1306C';
    if (raw.includes('spotify')) return '#1DB954';
    if (raw.includes('youtube') || raw.includes('yt')) return '#FF0000';
    if (raw.includes('twitch')) return '#A970FF';
    if (raw.includes('steam')) return '#66C0F4';
    if (raw.includes('twitter') || raw === 'x' || raw.includes(' x ')) return '#1DA1F2';
    if (raw.includes('telegram') || raw.includes('tg')) return '#24A1DE';
    if (raw.includes('github') || raw.includes('git')) return '#ffffff';
    return accent || '#6366f1';
  };

  const renderAudioVisualizer = () => {
    if (!isAudioVisualizer) return null;
    return (
      <div className="mt-3.5 w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-black/40 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono font-bold tracking-wider">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span>AUDIO VISUALIZER</span>
        </div>
        <div className="flex items-end gap-1 h-4">
          {[35, 75, 20, 95, 60, 40, 85, 100, 50, 90, 30, 80, 70, 45, 65, 30].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400 animate-pulse"
              style={{
                height: `${h}%`,
                animationDuration: `${0.35 + (i % 6) * 0.12}s`,
                animationDelay: `${i * 0.04}s`,
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  };

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
  } else if (cardStyle === 'crystal-glass') {
    cardBorderClass = 'border border-white/30';
    // Dynamic specular glass lighting scaling seamlessly with opacityVal (0.0 to 1.0)
    const glassDarkness = Math.min(0.96, opacityVal * 0.92);
    const glassWhiteTop = Math.min(0.35, 0.05 + opacityVal * 0.25);
    const glassWhiteBottom = Math.min(0.2, 0.02 + opacityVal * 0.12);
    const borderAlpha = Math.min(0.65, 0.15 + opacityVal * 0.35);

    cardBgColor = `rgba(10, 12, 18, ${glassDarkness})`;
    extraCardStyles = {
      backdropFilter: `blur(${blurPx}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${blurPx}px) saturate(180%)`,
      background: `linear-gradient(135deg, rgba(255, 255, 255, ${glassWhiteTop}) 0%, rgba(10, 12, 18, ${glassDarkness}) 40%, rgba(255, 255, 255, ${glassWhiteBottom}) 100%)`,
      boxShadow: `0 25px 60px rgba(0, 0, 0, ${0.25 + opacityVal * 0.5}), inset 0 1px 1.5px 0 rgba(255, 255, 255, ${0.25 + opacityVal * 0.45}), inset 0 0 25px 0 rgba(255, 255, 255, 0.06)`,
      borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
    };
  } else if (cardStyle === 'frosted-square') {
    cardBorderClass = 'border border-white/20 shadow-2xl';
    cardBgColor = `rgba(10, 10, 14, ${opacityVal})`;
  } else if (cardStyle === 'frosted-soft') {
    cardBorderClass = 'border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]';
    cardBgColor = `rgba(24, 24, 32, ${opacityVal})`;
  } else if (cardStyle === 'neon') {
    cardBorderClass = 'border-2';
    cardBgColor = `rgba(12, 13, 18, ${opacityVal})`;
    extraCardStyles = {
      borderColor: accent,
      boxShadow: `0 0 25px ${glow}50, inset 0 0 15px ${glow}20`,
    };
  } else if (cardStyle === 'cyber') {
    cardBorderClass = 'border border-white/20 border-t-2 border-b-2 shadow-2xl';
    cardBgColor = `rgba(8, 10, 15, ${opacityVal})`;
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
      onClick={() => {
        if (!hasEntered) {
          setHasEntered(true);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('stephod_play_audio'));
          }
        }
      }}
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

      {/* Page Overlays (Scanlines, VHS, Grid, Vignette) */}
      {profile.theme.extraEffects?.pageOverlay && profile.theme.extraEffects.pageOverlay !== 'none' && (
        <div className={`fixed inset-0 pointer-events-none z-10 overlay-${profile.theme.extraEffects.pageOverlay}`} />
      )}

      {/* Click To Enter Splash Screen */}
      {!hasEntered && isClickToEnterEnabled && (
        <div
          onClick={handleEnter}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl cursor-pointer transition-opacity duration-700 animate-in fade-in"
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

      {/* Interactive Cursor Trail Particles */}
      <CursorTrail type={profile.theme.extraEffects?.cursorTrail} />

      {/* Main Profile Card Container */}
      <div
        className={`relative w-full ${maxCardWidth} z-10 transition-all ${
          hasEntered || !isClickToEnterEnabled
            ? profile.theme.extraEffects?.entranceAnimation === 'zoom'
              ? 'animate-in zoom-in-75 duration-700 ease-out opacity-100 scale-100 translate-y-0'
              : profile.theme.extraEffects?.entranceAnimation === 'drop'
              ? 'animate-in slide-in-from-top-36 duration-700 ease-out opacity-100 scale-100 translate-y-0'
              : profile.theme.extraEffects?.entranceAnimation === 'slide-up'
              ? 'animate-in slide-in-from-bottom-36 duration-700 ease-out opacity-100 scale-100 translate-y-0'
              : profile.theme.extraEffects?.entranceAnimation === 'flip'
              ? 'animate-in spin-in-180 duration-700 ease-out opacity-100 scale-100 translate-y-0'
              : 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
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
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className={`relative overflow-hidden ${cardBorderClass} transition-all duration-300 ${cornerClass}`}
          style={{
            backgroundColor: isTransparent ? 'transparent' : cardBgColor,
            backdropFilter: isTransparent ? 'none' : `blur(${blurPx}px)`,
            WebkitBackdropFilter: isTransparent ? 'none' : `blur(${blurPx}px)`,
            ...borderRadiusStyle,
            ...extraCardStyles,
            ...tiltStyle,
            boxShadow: isTransparent
              ? 'none'
              : extraCardStyles.boxShadow
              ? extraCardStyles.boxShadow
              : profile.theme.glowEffect && cardStyle !== 'neon'
              ? `0 0 35px ${accent}25`
              : undefined,
          }}
        >
          {/* Glass Specular Glare / Reflection for crystal-glass */}
          {cardStyle === 'crystal-glass' && (
            <div
              className="absolute -top-[40%] -left-[40%] w-[180%] h-[180%] pointer-events-none select-none z-0"
              style={{
                background: `linear-gradient(125deg, rgba(255,255,255,${0.08 + opacityVal * 0.16}) 0%, rgba(255,255,255,${0.02 + opacityVal * 0.04}) 25%, transparent 55%)`,
                transform: 'rotate(-12deg)',
              }}
            />
          )}

          {/* Border Beam Laser Animation */}
          {profile.theme.extraEffects?.borderBeam && (
            <div className="border-beam-wrapper">
              <div className="border-beam-element" />
            </div>
          )}
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

          {/* Top Banner with fallback & error handling */}
          {layout !== 'compact' && hasBanner && (
            <div className={`w-full h-28 relative overflow-hidden ${isTransparent ? 'rounded-2xl mb-2' : ''}`}>
              <img
                src={profile.bannerUrl}
                alt=""
                onError={() => setBannerFailed(true)}
                className="w-full h-full object-cover filter brightness-[0.7]"
              />
              {!isTransparent && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#12131a]" />
              )}
            </div>
          )}

          {/* 1. LAYOUT: CENTER (Standard Classic Aesthetic) */}
          {layout === 'center' && (
            <div className={`p-6 sm:p-7 text-center ${hasBanner && !isTransparent ? '-mt-14' : 'pt-7'}`}>
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
                  className="text-xl sm:text-2xl font-bold tracking-tight py-1"
                  style={{
                    color: hasGlowingNameEffect ? undefined : nameColor,
                    fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                    textShadow: hasGlowingNameEffect
                      ? 'none'
                      : isTransparent
                      ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)'
                      : undefined,
                  }}
                >
                  <AnimatedTextEffect
                    text={profile.displayName || profile.username}
                    effects={profile.theme.extraEffects?.nameEffects || []}
                    speed={baseTypewriterSpeed}
                    pause={basePauseDuration}
                    as="span"
                  />
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
              {validTitles.length > 0 && (
                <div className="h-6 mt-2 flex items-center justify-center text-xs sm:text-sm font-medium tracking-wide">
                  <span
                    style={{
                      color: accent,
                      textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                    }}
                  >
                    {displayedText || '\u00A0'}
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
                  <AnimatedTextEffect
                    text={profile.bio}
                    effects={profile.theme.extraEffects?.bioEffects || []}
                    speed={baseTypewriterSpeed}
                    pause={basePauseDuration}
                    as="span"
                  />
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

              {/* Audio Visualizer (Extra Effect) */}
              {renderAudioVisualizer()}

              {/* Social Links Grid */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {profile.socialLinks.map((link) => {
                    const color = getSocialPlatformColor(link.platform, link.label, link.color);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          borderColor: isGlowIcons ? `${color}80` : 'rgba(255, 255, 255, 0.1)',
                          boxShadow: isGlowIcons
                            ? `0 0 16px ${color}45, 0 0 32px ${color}20, inset 0 0 10px ${color}20`
                            : undefined,
                        }}
                        className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                          isGlowIcons
                            ? 'hover:scale-[1.03] bg-black/60 backdrop-blur-md hover:bg-black/80 hover:shadow-[0_0_26px_rgba(255,255,255,0.4),0_0_40px_currentColor]'
                            : 'bg-black/50 backdrop-blur-md hover:bg-black/70 hover:border-white/20'
                        }`}
                      >
                        {isGlowIcons && (
                          <div
                            className="absolute inset-0 rounded-xl opacity-15 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        <div
                          className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-125 flex-shrink-0"
                          style={{
                            color: color,
                            filter: isGlowIcons
                              ? `drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}) drop-shadow(0 0 22px ${color})`
                              : undefined,
                          }}
                        >
                          <SocialIcon platform={link.platform} color={color} className="w-4 h-4" />
                        </div>
                        <span
                          className="text-xs font-semibold text-white group-hover:text-white truncate transition-all"
                          style={{
                            textShadow: isGlowIcons ? `0 0 8px ${color}90, 0 0 16px ${color}50` : undefined,
                          }}
                        >
                          {link.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Profile Footer Stats: Views & Likes & Live Viewers */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div
                    className={`flex items-center gap-1.5 transition-all ${
                      isViewsAnimation
                        ? 'animate-pulse text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    title="ยอดผู้เข้าชมทั้งหมด"
                    style={{ textShadow: isTransparent ? '0 1px 6px rgba(0,0,0,0.9)' : undefined }}
                  >
                    <Eye className={`w-3.5 h-3.5 ${isViewsAnimation ? 'animate-bounce text-emerald-400' : ''}`} />
                    <span>{views.toLocaleString()} views</span>
                  </div>
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
            <div className={`p-6 sm:p-7 ${hasBanner && !isTransparent ? '-mt-10' : 'pt-6'}`}>
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
                    className="text-xl font-bold tracking-tight py-1"
                    style={{
                      color: hasGlowingNameEffect ? undefined : nameColor,
                      fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                      textShadow: hasGlowingNameEffect
                        ? 'none'
                        : isTransparent
                        ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)'
                        : undefined,
                    }}
                  >
                    <AnimatedTextEffect
                    text={profile.displayName || profile.username}
                    effects={profile.theme.extraEffects?.nameEffects || []}
                    speed={baseTypewriterSpeed}
                    pause={basePauseDuration}
                    as="span"
                  />
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

                  {/* Views & Likes & Live Viewers */}
                  <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 transition-all ${
                          isViewsAnimation
                            ? 'animate-pulse text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                            : 'opacity-60'
                        }`}
                      >
                        <Eye className={`w-3.5 h-3.5 ${isViewsAnimation ? 'animate-bounce text-emerald-400' : ''}`} />
                        <span>{views.toLocaleString()}</span>
                      </div>
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
                  {validTitles.length > 0 && (
                    <div className="h-6 flex items-center justify-center sm:justify-start text-xs sm:text-sm font-medium tracking-wide">
                      <span
                        style={{
                          color: accent,
                          textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                        }}
                      >
                        {displayedText || '\u00A0'}
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
                                     <AnimatedTextEffect
                        text={profile.bio}
                        effects={profile.theme.extraEffects?.bioEffects || []}
                        speed={baseTypewriterSpeed}
                        pause={basePauseDuration}
                        as="span"
                      />
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

                  {/* Audio Visualizer (Extra Effect) */}
                  {renderAudioVisualizer()}

                  {/* Social Links Grid */}
                  {profile.socialLinks && profile.socialLinks.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {profile.socialLinks.map((link) => {
                        const color = getSocialPlatformColor(link.platform, link.label, link.color);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              borderColor: isGlowIcons ? `${color}80` : 'rgba(255, 255, 255, 0.1)',
                              boxShadow: isGlowIcons
                                ? `0 0 16px ${color}45, 0 0 32px ${color}20, inset 0 0 10px ${color}20`
                                : undefined,
                            }}
                            className={`group relative flex items-center gap-2 p-2 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                              isGlowIcons
                                ? 'hover:scale-[1.03] bg-black/60 backdrop-blur-md hover:bg-black/80 hover:shadow-[0_0_26px_rgba(255,255,255,0.4),0_0_40px_currentColor]'
                                : 'bg-black/50 backdrop-blur-md hover:bg-black/70 hover:border-white/20'
                            }`}
                          >
                            {isGlowIcons && (
                              <div
                                className="absolute inset-0 rounded-xl opacity-15 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
                                style={{ backgroundColor: color }}
                              />
                            )}
                            <div
                              className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-125 flex-shrink-0"
                              style={{
                                color: color,
                                filter: isGlowIcons
                                  ? `drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}) drop-shadow(0 0 22px ${color})`
                                  : undefined,
                              }}
                            >
                              <SocialIcon platform={link.platform} color={color} className="w-3.5 h-3.5" />
                            </div>
                            <span
                              className="text-xs font-semibold text-white group-hover:text-white truncate transition-all"
                              style={{
                                textShadow: isGlowIcons ? `0 0 8px ${color}90, 0 0 16px ${color}50` : undefined,
                              }}
                            >
                              {link.label}
                            </span>
                          </a>
                        );
                      })}
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
                      className="text-base sm:text-lg font-bold tracking-tight py-1"
                      style={{
                        color: hasGlowingNameEffect ? undefined : nameColor,
                        fontFamily: nameFont !== 'inherit' ? getFontCssFamily(nameFont) : undefined,
                        textShadow: hasGlowingNameEffect
                          ? 'none'
                          : isTransparent
                          ? '0 2px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)'
                          : undefined,
                      }}
                    >
                      <AnimatedTextEffect
                    text={profile.displayName || profile.username}
                    effects={profile.theme.extraEffects?.nameEffects || []}
                    speed={baseTypewriterSpeed}
                    pause={basePauseDuration}
                    as="span"
                  />
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
                  {validTitles.length > 0 && (
                    <div
                      className="text-xs font-medium truncate mt-0.5"
                      style={{
                        color: accent,
                        textShadow: isTransparent ? '0 1px 8px rgba(0,0,0,0.9)' : undefined,
                      }}
                    >
                      {displayedText || '\u00A0'}
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
                                 <AnimatedTextEffect
                        text={profile.bio}
                        effects={profile.theme.extraEffects?.bioEffects || []}
                        speed={baseTypewriterSpeed}
                        pause={basePauseDuration}
                        as="span"
                      />
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

              {/* Audio Visualizer (Extra Effect) */}
              {renderAudioVisualizer()}

              {/* Social Links Strip */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto py-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profile.socialLinks.map((link) => {
                      const color = getSocialPlatformColor(link.platform, link.label, link.color);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            borderColor: isGlowIcons ? `${color}80` : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: isGlowIcons ? `0 0 14px ${color}45, inset 0 0 8px ${color}20` : undefined,
                          }}
                          className={`p-1.5 rounded-lg border transition-all duration-300 hover:scale-110 ${
                            isGlowIcons
                              ? 'bg-black/60 backdrop-blur-md hover:bg-black/80'
                              : 'bg-black/40 backdrop-blur-md hover:bg-black/60 hover:border-white/20'
                          }`}
                          title={link.label}
                        >
                          <div
                            className="relative flex items-center justify-center transition-transform duration-200 hover:scale-125"
                            style={{
                              color: color,
                              filter: isGlowIcons
                                ? `drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`
                                : undefined,
                            }}
                          >
                            <SocialIcon platform={link.platform} color={color} className="w-3.5 h-3.5" />
                          </div>
                        </a>
                      );
                    })}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-[11px] font-mono flex-shrink-0 transition-all ${
                      isViewsAnimation
                        ? 'animate-pulse text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : 'opacity-40'
                    }`}
                  >
                    <Eye className={`w-3 h-3 ${isViewsAnimation ? 'animate-bounce text-emerald-400' : ''}`} />
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

      {/* Real-time Live Toast Notification when visitor enters */}
      {showLiveNotification && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
          <div className="px-4 py-2.5 rounded-2xl bg-[#090b14]/95 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(16,185,129,0.3)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <Eye className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">ผู้เข้าชมใหม่แบบเรียลไทม์</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-mono mt-0.5">
                {liveNotificationText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Audio Player */}
      <AudioPlayer
        audio={profile.audio}
        accentColor={accent}
        hasEntered={hasEntered}
      />
    </div>
  );
}
