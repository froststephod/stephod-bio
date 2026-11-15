'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Lock, ChevronDown, Sparkles, X } from 'lucide-react';
import { AVAILABLE_FONTS, FontOption, getFontCssFamily } from '@/lib/fonts';

interface Props {
  label: string;
  value: string;
  onChange: (fontName: string) => void;
}

export default function FontPickerDropdown({ label, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'thai' | 'modern' | 'gaming' | 'stylized'>('all');
  const [customFont, setCustomFont] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredFonts = AVAILABLE_FONTS.filter((font) => {
    const matchesSearch = font.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || font.category === category;
    return matchesSearch && matchesCategory;
  });

  const selectedFont = AVAILABLE_FONTS.find(
    (f) => f.name.toLowerCase() === (value || '').toLowerCase() || f.id.toLowerCase() === (value || '').toLowerCase()
  );

  const displayName = selectedFont ? selectedFont.name : value || 'FC Vision (TH)';
  const displayCss = getFontCssFamily(value || 'Prompt');

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-semibold text-white/70 mb-1">{label}</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#161822] hover:bg-[#1c1e2b] border border-white/15 hover:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between transition-all duration-200 shadow-sm group"
      >
        <span className="truncate pr-2" style={{ fontFamily: displayCss }}>
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/50 group-hover:text-emerald-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (yura.lol Style) */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-80 top-full mt-1.5 z-50 bg-[#0d0e14] border border-white/15 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-1 text-[10px] no-scrollbar">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'thai', label: '🇹🇭 ไทย' },
              { id: 'modern', label: 'Modern' },
              { id: 'gaming', label: '🎮 Pixel/Gaming' },
              { id: 'stylized', label: '✨ Stylized' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scrollable Font Items List */}
          <div
            className="max-h-64 overflow-y-auto space-y-0.5 pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
          >
            {filteredFonts.map((font) => {
              const isSelected =
                (value || '').toLowerCase() === font.name.toLowerCase() ||
                (value || '').toLowerCase() === font.id.toLowerCase();

              return (
                <div
                  key={font.id}
                  onClick={() => {
                    onChange(font.name);
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 font-bold'
                      : 'hover:bg-white/10 text-white/85'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {/* Checkmark or spacer */}
                    <div className="w-3.5 flex items-center justify-center flex-shrink-0">
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>

                    {/* Font Name rendered in its own typeface */}
                    <span
                      className="text-xs sm:text-sm truncate"
                      style={{ fontFamily: font.cssFamily }}
                    >
                      {font.name}
                    </span>
                  </div>

                  {/* Lock Indicator (yura style) */}
                  {font.isLocked && (
                    <div
                      className="flex-shrink-0 ml-2 p-1 rounded-md bg-black/40 text-emerald-500/70 group-hover:text-emerald-400"
                      title="VIP Font (ปลดล็อกพร้อมใช้งานฟรี)"
                    >
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFonts.length === 0 && (
              <div className="py-6 text-center text-xs text-white/40">
                ไม่พบฟอนต์ที่ค้นหา
              </div>
            )}
          </div>

          {/* Custom Font Input Option */}
          <div className="pt-2 mt-1 border-t border-white/10">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition-colors font-mono"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>+ Custom Font (พิมพ์ชื่อฟอนต์เอง)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={customFont}
                  onChange={(e) => setCustomFont(e.target.value)}
                  placeholder="e.g. Courier New, Impact"
                  className="flex-1 bg-black/80 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFont.trim()) {
                      onChange(customFont.trim());
                      setIsOpen(false);
                      setShowCustomInput(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
                >
                  ใช้
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
