'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  effects?: string[];
  speed?: number;
  pause?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'h1' | 'h2' | 'p' | 'div';
}

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________ABCDEF0123456789';

export default function AnimatedTextEffect({
  text,
  effects = [],
  speed: customSpeed,
  pause: customPause,
  className = '',
  style = {},
  as: Component = 'span',
}: Props) {
  // Support multiple phrases separated by "|||"
  const phrases = React.useMemo(() => {
    if (!text) return [''];
    const parts = text.split('|||').map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [text];
  }, [text]);

  const hasTypewriter = effects.includes('typewriter');
  const hasMorph = effects.includes('morph');
  const hasScramble = effects.some((e) => e === 'scramble' || e === 's#[&mbd@' || e === 'shuffle');
  const hasLoading = effects.includes('loading');

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [morphOpacity, setMorphOpacity] = useState(1);
  const [dots, setDots] = useState('');

  // 1. Loading Dots Effect
  useEffect(() => {
    if (!hasLoading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [hasLoading]);

  // 2. Typewriter Effect (Fast, snappy, responsive)
  useEffect(() => {
    if (!hasTypewriter) {
      if (!hasMorph && !hasScramble) {
        setDisplayText(phrases[0] || '');
      }
      return;
    }

    const currentPhrase = phrases[phraseIndex % phrases.length];
    const typingSpeed = customSpeed || 35;
    const deletingSpeed = Math.max(10, Math.floor(typingSpeed * 0.45));
    const pauseTime = customPause || 550;
    const currentSpeed = isDeleting ? deletingSpeed : typingSpeed;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        if (displayText.length + 1 >= currentPhrase.length) {
          // Pause before deleting if multiple phrases, or keep steady
          if (phrases.length > 1) {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        }
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        if (displayText.length <= 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, currentSpeed);

    return () => clearTimeout(timeout);
  }, [hasTypewriter, displayText, isDeleting, phraseIndex, phrases, customSpeed, customPause]);

  // 3. Morph Effect (Fade transition between phrases - fast 1.2s switch)
  useEffect(() => {
    if (!hasMorph || hasTypewriter) return;
    if (phrases.length <= 1) {
      setDisplayText(phrases[0] || '');
      return;
    }

    const interval = setInterval(() => {
      setMorphOpacity(0);
      setTimeout(() => {
        setPhraseIndex((prev) => {
          const next = (prev + 1) % phrases.length;
          setDisplayText(phrases[next] || '');
          return next;
        });
        setMorphOpacity(1);
      }, 200);
    }, 1250);

    setDisplayText(phrases[0] || '');
    return () => clearInterval(interval);
  }, [hasMorph, hasTypewriter, phrases]);

  // 4. Matrix Scramble Effect
  useEffect(() => {
    if (!hasScramble || hasTypewriter || hasMorph) return;
    const target = phrases[0] || '';
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        target
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return target[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= target.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [hasScramble, hasTypewriter, hasMorph, text, phrases]);

  // Fallback if no text rotation effect
  useEffect(() => {
    if (!hasTypewriter && !hasMorph && !hasScramble) {
      setDisplayText(phrases[0] || '');
    }
  }, [hasTypewriter, hasMorph, hasScramble, phrases]);

  // Construct CSS class string based on chosen effects
  const effectClasses: string[] = [];
  if (effects.includes('rainbow')) effectClasses.push('effect-rainbow');
  if (effects.includes('shimmer')) effectClasses.push('effect-shimmer');
  if (effects.includes('shine')) effectClasses.push('effect-shine');
  if (effects.includes('glow')) effectClasses.push('effect-glow');
  if (effects.includes('shake')) effectClasses.push('effect-shake');
  if (effects.includes('glitch')) effectClasses.push('effect-glitch');
  if (effects.includes('flames')) effectClasses.push('effect-flames');
  if (effects.includes('lightning')) effectClasses.push('effect-lightning');
  if (effects.includes('flicker')) effectClasses.push('effect-flicker');
  if (effects.includes('flip')) effectClasses.push('effect-flip');
  if (effects.includes('fuzzy')) effectClasses.push('effect-fuzzy');

  // Sparkles particles
  const hasCherry = effects.includes('cherry-blossoms');
  const sparkleEffect = effects.find((e) => e.includes('sparkles'));

  let sparkleColor = '#ffffff';
  if (sparkleEffect) {
    if (sparkleEffect.includes('green')) sparkleColor = '#10b981';
    else if (sparkleEffect.includes('lightblue')) sparkleColor = '#38bdf8';
    else if (sparkleEffect.includes('blue')) sparkleColor = '#3b82f6';
    else if (sparkleEffect.includes('red')) sparkleColor = '#ef4444';
    else if (sparkleEffect.includes('pink')) sparkleColor = '#ec4899';
    else if (sparkleEffect.includes('purple')) sparkleColor = '#a855f7';
    else if (sparkleEffect.includes('yellow')) sparkleColor = '#eab308';
    else if (sparkleEffect.includes('orange')) sparkleColor = '#f97316';
    else if (sparkleEffect.includes('black')) sparkleColor = '#333333';
    else if (sparkleEffect.includes('rainbow')) sparkleColor = '#ff00aa';
  }

  return (
    <Component
      className={`relative inline-block ${effectClasses.join(' ')} ${className}`}
      style={{
        ...style,
        transition: hasMorph ? 'opacity 0.4s ease-in-out' : undefined,
        opacity: hasMorph ? morphOpacity : style.opacity,
      }}
    >
      {/* Floating Cherry Blossom Petals */}
      {hasCherry && (
        <span className="pointer-events-none absolute -inset-3 overflow-hidden select-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-[10px] animate-pulse select-none opacity-80"
              style={{
                top: `${(i * 22) % 100}%`,
                left: `${(i * 35) % 100}%`,
                animationDelay: `${i * 0.4}s`,
                transform: `rotate(${i * 45}deg)`,
              }}
            >
              🌸
            </span>
          ))}
        </span>
      )}

      {/* Floating Sparkle Particles */}
      {sparkleEffect && (
        <span className="pointer-events-none absolute -inset-2 overflow-hidden select-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="sparkle-particle select-none"
              style={{
                color: sparkleColor,
                left: `${10 + i * 16}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                fontSize: '9px',
                filter: `drop-shadow(0 0 4px ${sparkleColor})`,
              }}
            >
              ✦
            </span>
          ))}
        </span>
      )}

      <span>{displayText}</span>
      {hasTypewriter && (
        <span
          className="w-1.5 h-[0.85em] ml-0.5 inline-block align-middle animate-pulse bg-current opacity-85 rounded-[1px]"
        />
      )}
      {hasLoading && <span className="font-mono text-cyan-400">{dots}</span>}
    </Component>
  );
}
