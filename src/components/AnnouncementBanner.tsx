'use client';

import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Props {
  announcement: {
    text: string;
    type: 'info' | 'warn' | 'success';
    on: boolean;
  } | null;
}

export default function AnnouncementBanner({ announcement }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.on || !announcement.text || dismissed) {
    return null;
  }

  const styles = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
      dot: 'bg-blue-400',
    },
    warn: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      dot: 'bg-amber-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
      dot: 'bg-emerald-400',
    },
  }[announcement.type || 'info'];

  return (
    <div className={`w-full border-b backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 text-xs md:text-sm font-medium transition-all ${styles.bg}`}>
      <div className="max-w-5xl mx-auto flex items-center gap-2.5 flex-1 justify-center text-center">
        {styles.icon}
        <span className="leading-snug">{announcement.text}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors shrink-0"
        aria-label="ปิดประกาศ"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
