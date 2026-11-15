'use client';

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, Sliders, RotateCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AvatarDecoration } from '@/types/profile';
import AvatarWithDecoration from './AvatarWithDecoration';
import RAW_DISCORD_DECORATIONS from '@/data/discord-decorations.json';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  initialDecoration?: AvatarDecoration;
  onSave: (decoration: AvatarDecoration) => void;
}

export interface DiscordDecorationItem {
  id: string;
  label: string;
  url: string;
  category?: string;
}

const ITEMS_PER_PAGE = 24;

export default function AvatarDecorationModal({
  isOpen,
  onClose,
  avatarUrl,
  initialDecoration,
  onSave,
}: Props) {
  const [selectedUrl, setSelectedUrl] = useState<string>(initialDecoration?.url || '');
  const [selectedName, setSelectedName] = useState<string>(initialDecoration?.name || '');
  const [hue, setHue] = useState<number>(initialDecoration?.hue || 0);
  const [shape, setShape] = useState<'circle' | 'squircle' | 'soft-square'>(
    initialDecoration?.shape || 'circle'
  );
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'featured' | 'all'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Cast JSON data
  const allDecorations = RAW_DISCORD_DECORATIONS as unknown as DiscordDecorationItem[];

  // Featured keywords (matching popular Discord decorations like Spirit, Soul, Sakura, Lightning, etc.)
  const featuredKeywords = [
    'spirit', 'soul', 'star', 'shock', 'rage', 'lightning', 'phoenix',
    'cat', 'sakura', 'sword', 'fire', 'potion', 'akuma', 'whales', 'crown'
  ];

  const filteredDecorations = useMemo(() => {
    let list = allDecorations;

    if (activeCategory === 'featured') {
      list = list.filter((item) =>
        featuredKeywords.some((kw) => (item.label || '').toLowerCase().includes(kw))
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => (item.label || '').toLowerCase().includes(q));
    }

    return list;
  }, [allDecorations, activeCategory, search]);

  const totalPages = Math.ceil(filteredDecorations.length / ITEMS_PER_PAGE) || 1;
  const paginatedDecorations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDecorations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDecorations, currentPage]);

  if (!isOpen) return null;

  const currentDecoration: AvatarDecoration = {
    url: selectedUrl,
    name: selectedName,
    type: selectedUrl ? 'discord-cdn' : 'none',
    hue,
    shape,
  };

  const handleSelect = (item: DiscordDecorationItem) => {
    setSelectedUrl(item.url);
    setSelectedName(item.label);
  };

  const handleConfirm = () => {
    onSave(currentDecoration);
    onClose();
  };

  const handleClear = () => {
    setSelectedUrl('');
    setSelectedName('');
    setHue(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#11121a] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[780px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">
                เปลี่ยนของตกแต่งอวตาร (Discord Avatar Decorations)
              </h2>
              <p className="text-[11px] text-white/40">
                กรอบตกแต่งแอนิเมชันของแท้จากเซิร์ฟเวอร์ Discord CDN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Decoration Catalog Grid */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 border-r border-white/10 flex flex-col">
            {/* Search Bar & Category Tabs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ค้นหาของตกแต่ง (เช่น Soul, Spirit, Sakura)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Tabs: แนะนำ, ทั้งหมด */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('featured');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === 'featured'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  แนะนำ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === 'all'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({allDecorations.length})
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {/* Option to clear / none */}
                <button
                  type="button"
                  onClick={handleClear}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center group relative min-h-[110px] ${
                    !selectedUrl
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white/40 mb-1 border border-white/10">
                    ⚪
                  </div>
                  <span className="text-xs font-semibold text-white/80">ไม่มีของตกแต่ง</span>
                  <span className="text-[10px] text-white/40">ดั้งเดิม</span>
                </button>

                {/* Real Discord Official Items */}
                {paginatedDecorations.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center group relative min-h-[110px] ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      {/* Animated APNG Thumbnail from Discord CDN */}
                      <div className="w-14 h-14 relative flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-contain pointer-events-none"
                          loading="lazy"
                        />
                      </div>

                      <span className="text-[11px] font-semibold text-white truncate w-full px-1">
                        {item.label}
                      </span>

                      {isSelected && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/60 flex-shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ก่อนหน้า</span>
                </button>

                <span className="font-mono text-white/50">
                  หน้า {currentPage} จาก {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 flex items-center gap-1"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Preview & Controls (Matching Image 2) */}
          <div className="w-full md:w-80 p-6 bg-black/40 flex flex-col items-center justify-between space-y-6 flex-shrink-0">
            <div className="w-full flex flex-col items-center space-y-4">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider self-start font-mono">
                ตัวอย่าง (Live Preview)
              </span>

              {/* Big Avatar Preview with Decoration */}
              <div className="py-4 flex flex-col items-center justify-center">
                <AvatarWithDecoration
                  avatarUrl={avatarUrl}
                  decoration={currentDecoration}
                  size="xl"
                />

                <span className="text-xs font-semibold text-white/90 mt-3 truncate max-w-[200px]">
                  {selectedName || 'ไม่มีของตกแต่ง'}
                </span>
              </div>

              {/* Shape Selector */}
              <div className="w-full space-y-1.5 pt-2 border-t border-white/10">
                <span className="block text-[11px] font-semibold text-white/60">
                  รูปทรงอวตาร (Avatar Shape)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'circle', label: 'วงกลม' },
                    { id: 'squircle', label: 'มุมมน' },
                    { id: 'soft-square', label: 'มุมมนเล็ก' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShape(s.id as any)}
                      className={`py-1 px-1 rounded-lg text-[10px] font-medium border transition-all ${
                        shape === s.id
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hue Rotation Slider (โทนสี 0 deg - 360 deg) */}
              <div className="w-full space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="font-semibold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>โทนสี (Hue Color)</span>
                  </span>
                  <span className="font-mono text-emerald-400">{hue} deg</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>0 deg</span>
                  <span>180 deg</span>
                  <span>360 deg</span>
                </div>

                <p className="text-[10px] text-white/40 leading-relaxed text-center pt-1">
                  ปรับโทนสีแล้วกดยืนยันเพื่อนำไปแสดงผลบนโปรไฟล์
                </p>
              </div>
            </div>

            {/* Bottom Actions (Matching Image 2 buttons) */}
            <div className="w-full flex items-center gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้าง</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ยืนยัน</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
