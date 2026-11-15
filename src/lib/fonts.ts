export interface FontOption {
  id: string;
  name: string;
  cssFamily: string;
  isLocked: boolean;
  category: 'thai' | 'modern' | 'stylized' | 'gaming' | 'gothic';
}

export const AVAILABLE_FONTS: FontOption[] = [
  // Page 1: Thai & Modern Sans
  { id: 'fc-vision', name: 'FC Vision (TH)', cssFamily: "'FC Vision', 'Prompt', 'Kanit', sans-serif", isLocked: false, category: 'thai' },
  { id: 'fc-vision-rounded', name: 'FC Vision Rounded (TH)', cssFamily: "'FC Vision Rounded', 'Kanit', 'Prompt', sans-serif", isLocked: false, category: 'thai' },
  { id: 'fc-rebel', name: 'FC Rebel (TH)', cssFamily: "'FC Rebel', 'Chakra Petch', 'Permanent Marker', sans-serif", isLocked: false, category: 'thai' },
  { id: 'fc-rooster', name: 'FC Rooster (TH)', cssFamily: "'FC Rooster', 'Itim', cursive, sans-serif", isLocked: false, category: 'thai' },
  { id: 'fc-igloo', name: 'FC Igloo (TH)', cssFamily: "'FC Igloo', 'Mitr', 'Kanit', sans-serif", isLocked: false, category: 'thai' },
  { id: 'fc-igloo-rounded', name: 'FC Igloo Rounded (TH)', cssFamily: "'FC Igloo Rounded', 'Mitr', 'Kanit', sans-serif", isLocked: false, category: 'thai' },
  { id: 'inter', name: 'Inter', cssFamily: "'Inter', sans-serif", isLocked: false, category: 'modern' },
  { id: 'roboto', name: 'Roboto', cssFamily: "'Roboto', sans-serif", isLocked: false, category: 'modern' },
  { id: 'poppins', name: 'Poppins', cssFamily: "'Poppins', sans-serif", isLocked: false, category: 'modern' },

  // Page 2: Stylized & Script
  { id: 'lora', name: 'Lora', cssFamily: "'Lora', serif", isLocked: false, category: 'stylized' },
  { id: 'cinzel', name: 'Cinzel', cssFamily: "'Cinzel', serif", isLocked: false, category: 'stylized' },
  { id: 'chillax', name: 'Chillax', cssFamily: "'Chillax', 'Unbounded', sans-serif", isLocked: false, category: 'modern' },
  { id: 'indie-flower', name: 'Indie Flower', cssFamily: "'Indie Flower', cursive", isLocked: false, category: 'stylized' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', cssFamily: "'JetBrains Mono', monospace", isLocked: false, category: 'modern' },
  { id: 'dancing-script', name: 'Dancing Script', cssFamily: "'Dancing Script', cursive", isLocked: false, category: 'stylized' },
  { id: 'array', name: 'Array', cssFamily: "'Array', 'Orbitron', monospace", isLocked: true, category: 'gaming' },
  { id: 'werebeast', name: 'Werebeast', cssFamily: "'Werebeast', 'Creepster', cursive", isLocked: true, category: 'stylized' },
  { id: 'creepster', name: 'Creepster', cssFamily: "'Creepster', cursive", isLocked: true, category: 'stylized' },

  // Page 3: Display & Pixel
  { id: 'bangers', name: 'Bangers', cssFamily: "'Bangers', cursive, sans-serif", isLocked: true, category: 'gaming' },
  { id: 'blank-river', name: 'Blank River', cssFamily: "'Blank River', 'Permanent Marker', cursive", isLocked: true, category: 'stylized' },
  { id: 'winkle', name: 'Winkle', cssFamily: "'Winkle', 'Itim', cursive", isLocked: true, category: 'stylized' },
  { id: 'bloxat', name: 'Bloxat', cssFamily: "'Bloxat', 'Silkscreen', 'Press Start 2P', monospace", isLocked: true, category: 'gaming' },
  { id: 'upheavtt', name: 'Upheavtt', cssFamily: "'Upheavtt', 'Silkscreen', 'Press Start 2P', monospace", isLocked: true, category: 'gaming' },
  { id: 'minecraft', name: 'Minecraft', cssFamily: "'Minecraft', 'Press Start 2P', 'Silkscreen', monospace", isLocked: true, category: 'gaming' },
  { id: 'boxor', name: 'Boxor', cssFamily: "'Boxor', 'Bungee', sans-serif", isLocked: true, category: 'gaming' },
  { id: 'kings', name: 'Kings', cssFamily: "'Kings', 'UnifrakturMaguntia', serif", isLocked: true, category: 'gothic' },
  { id: 'faster-one', name: 'Faster One', cssFamily: "'Faster One', cursive, sans-serif", isLocked: true, category: 'gaming' },
  { id: 'unifraktur', name: 'UnifrakturMaguntia', cssFamily: "'UnifrakturMaguntia', serif", isLocked: true, category: 'gothic' },

  // Page 4: Heavy & Futuristic
  { id: 'unbounded', name: 'Unbounded', cssFamily: "'Unbounded', sans-serif", isLocked: true, category: 'modern' },
  { id: 'finger-paint', name: 'Finger Paint', cssFamily: "'Finger Paint', cursive", isLocked: true, category: 'stylized' },
  { id: 'ggb', name: 'GGB', cssFamily: "'GGB', 'Orbitron', monospace", isLocked: true, category: 'gaming' },
  { id: 'facon', name: 'Facon', cssFamily: "'Facon', 'Faster One', 'Chakra Petch', sans-serif", isLocked: true, category: 'gaming' },
  { id: 'lego', name: 'Lego', cssFamily: "'Lego', 'Bungee', sans-serif", isLocked: true, category: 'gaming' },
  { id: 'futuretechno', name: 'Futuretechno', cssFamily: "'Futuretechno', 'Orbitron', sans-serif", isLocked: true, category: 'gaming' },
  { id: 'pokemon', name: 'Pokemon', cssFamily: "'Pokemon', 'Bangers', cursive, sans-serif", isLocked: true, category: 'gaming' },
  { id: 'tropi-land', name: 'Tropi Land', cssFamily: "'Tropi Land', 'Itim', cursive", isLocked: true, category: 'stylized' },
  { id: 'pretty-on-the-inside', name: 'Pretty on the Inside', cssFamily: "'Pretty on the Inside', 'Indie Flower', cursive", isLocked: true, category: 'stylized' },

  // Page 5: Gothic & Special
  { id: 'mieszkanie-9', name: 'Mieszkanie 9', cssFamily: "'Mieszkanie 9', 'Indie Flower', cursive", isLocked: true, category: 'stylized' },
  { id: 'burning-wrath', name: 'Burning Wrath', cssFamily: "'Burning Wrath', 'UnifrakturMaguntia', serif", isLocked: true, category: 'gothic' },
];

export function getFontCssFamily(fontName: string): string {
  if (!fontName) return "'Prompt', sans-serif";
  const found = AVAILABLE_FONTS.find(
    (f) => f.name.toLowerCase() === fontName.toLowerCase() || f.id.toLowerCase() === fontName.toLowerCase()
  );
  if (found) return found.cssFamily;
  return `'${fontName}', 'Prompt', sans-serif`;
}
